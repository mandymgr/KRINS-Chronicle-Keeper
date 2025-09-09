/**
 * 🧪 AI Context Provider Test Suite
 * Comprehensive tests for AI context generation and intelligence
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TestUtils } from '../../test-setup';

// Import the module to test
let ContextProvider: any;
let mockDecisionTracker: any;

beforeAll(async () => {
  // Mock decision tracker
  mockDecisionTracker = {
    getAllADRs: jest.fn(),
    searchADRs: jest.fn(),
    getRelatedDecisions: jest.fn(),
    generateAnalytics: jest.fn()
  };

  // Mock file system
  jest.mock('fs-extra');
  jest.mock('path');

  // Import the module
  const module = await import('../context-provider');
  ContextProvider = module.ContextProvider;
});

describe('ContextProvider', () => {
  let contextProvider: any;
  let consoleMocks: any;

  beforeEach(() => {
    contextProvider = new ContextProvider({
      decisionTracker: mockDecisionTracker,
      patternsDir: '/test/patterns',
      runbooksDir: '/test/runbooks'
    });
    consoleMocks = TestUtils.mockConsole();
  });

  afterEach(() => {
    Object.values(consoleMocks).forEach((mock: any) => mock.mockRestore());
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with configuration', () => {
      expect(contextProvider.decisionTracker).toBe(mockDecisionTracker);
      expect(contextProvider.config.patternsDir).toBe('/test/patterns');
      expect(contextProvider.config.runbooksDir).toBe('/test/runbooks');
    });

    it('should set up context cache', () => {
      expect(contextProvider.contextCache).toEqual(new Map());
      expect(contextProvider.cacheExpiry).toBeDefined();
    });
  });

  describe('Context Generation', () => {
    beforeEach(() => {
      mockDecisionTracker.searchADRs.mockReturnValue([
        TestUtils.createMockADR({ title: 'Database Architecture' })
      ]);
    });

    it('should generate context for query', async () => {
      const query = 'database design patterns';
      const contextType = 'architectural';
      const aiSystem = 'claude-code';
      const task = 'code-generation';

      const context = await contextProvider.generateContext(query, contextType, aiSystem, task);

      expect(context).toBeValidContext();
      expect(context.query).toBe(query);
      expect(context.contextType).toBe(contextType);
      expect(context.aiSystem).toBe(aiSystem);
      expect(context.task).toBe(task);
      expect(context.confidence).toBeGreaterThan(0);
    });

    it('should include relevant ADRs in context', async () => {
      const mockADRs = [
        TestUtils.createMockADR({ title: 'Database Selection' }),
        TestUtils.createMockADR({ title: 'API Architecture', id: 'ADR-0002' })
      ];
      mockDecisionTracker.searchADRs.mockReturnValue(mockADRs);

      const context = await contextProvider.generateContext('database api', 'architectural');

      expect(context.relevantADRs).toHaveLength(2);
      expect(context.sources).toContain('adr');
      expect(mockDecisionTracker.searchADRs).toHaveBeenCalledWith('database api');
    });

    it('should calculate relevance scores', async () => {
      const mockADRs = [
        TestUtils.createMockADR({ title: 'Database Architecture Decision', context: 'We need a database' })
      ];
      mockDecisionTracker.searchADRs.mockReturnValue(mockADRs);

      const context = await contextProvider.generateContext('database selection', 'architectural');

      expect(context.relevantADRs[0].relevanceScore).toBeDefined();
      expect(context.relevantADRs[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should handle empty search results', async () => {
      mockDecisionTracker.searchADRs.mockReturnValue([]);

      const context = await contextProvider.generateContext('nonexistent topic');

      expect(context.relevantADRs).toHaveLength(0);
      expect(context.confidence).toBeLessThan(0.5);
      expect(context.sources).not.toContain('adr');
    });

    it('should include patterns when available', async () => {
      const fs = require('fs-extra');
      fs.exists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue(['api-pattern.md', 'database-pattern.md']);
      fs.readFile.mockResolvedValue('# Pattern Content\\nThis is a test pattern');

      const context = await contextProvider.generateContext('api patterns', 'pattern');

      expect(context.patterns).toBeDefined();
      expect(context.sources).toContain('patterns');
    });

    it('should include runbooks for operational queries', async () => {
      const fs = require('fs-extra');
      fs.exists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue(['incident-response.md', 'deployment.md']);
      fs.readFile.mockResolvedValue('# Runbook\\nOperational procedures');

      const context = await contextProvider.generateContext('incident response', 'operational');

      expect(context.runbooks).toBeDefined();
      expect(context.sources).toContain('runbooks');
    });
  });

  describe('Context Caching', () => {
    beforeEach(() => {
      mockDecisionTracker.searchADRs.mockReturnValue([]);
    });

    it('should cache generated context', async () => {
      const query = 'test caching';
      
      // First call
      await contextProvider.generateContext(query);
      expect(contextProvider.contextCache.has(query)).toBe(true);

      // Second call should use cache
      mockDecisionTracker.searchADRs.mockClear();
      await contextProvider.generateContext(query);
      
      expect(mockDecisionTracker.searchADRs).not.toHaveBeenCalled();
    });

    it('should expire cached context', async () => {
      const query = 'test expiry';
      
      // Set very short cache expiry
      contextProvider.cacheExpiry = 1; // 1ms
      
      await contextProvider.generateContext(query);
      expect(contextProvider.contextCache.has(query)).toBe(true);

      // Wait for cache expiry
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await contextProvider.generateContext(query);
      expect(mockDecisionTracker.searchADRs).toHaveBeenCalledTimes(2);
    });

    it('should clear cache on demand', async () => {
      await contextProvider.generateContext('test clear');
      expect(contextProvider.contextCache.size).toBe(1);

      contextProvider.clearCache();
      expect(contextProvider.contextCache.size).toBe(0);
    });
  });

  describe('Relevance Scoring', () => {
    it('should score exact title matches highly', () => {
      const adr = TestUtils.createMockADR({ title: 'Database Selection' });
      const query = 'database selection';
      
      const score = contextProvider.calculateRelevanceScore(adr, query);
      
      expect(score).toBeGreaterThan(0.8);
    });

    it('should score partial matches moderately', () => {
      const adr = TestUtils.createMockADR({ 
        title: 'API Architecture',
        context: 'We need a database for our API'
      });
      const query = 'database';
      
      const score = contextProvider.calculateRelevanceScore(adr, query);
      
      expect(score).toBeGreaterThan(0.3);
      expect(score).toBeLessThan(0.8);
    });

    it('should score unrelated content lowly', () => {
      const adr = TestUtils.createMockADR({ 
        title: 'Frontend Framework',
        context: 'Choosing React vs Vue'
      });
      const query = 'database backend';
      
      const score = contextProvider.calculateRelevanceScore(adr, query);
      
      expect(score).toBeLessThan(0.3);
    });

    it('should consider tags in relevance scoring', () => {
      const adr = TestUtils.createMockADR({ 
        title: 'General Decision',
        tags: ['database', 'postgresql'],
        context: 'Some other context'
      });
      const query = 'database';
      
      const score = contextProvider.calculateRelevanceScore(adr, query);
      
      expect(score).toBeGreaterThan(0.5);
    });
  });

  describe('Context Types', () => {
    beforeEach(() => {
      mockDecisionTracker.searchADRs.mockReturnValue([]);
    });

    it('should handle architectural context type', async () => {
      const context = await contextProvider.generateContext('test', 'architectural');
      
      expect(context.contextType).toBe('architectural');
      expect(context.systemPrompt).toContain('architectural');
    });

    it('should handle pattern context type', async () => {
      const context = await contextProvider.generateContext('test', 'pattern');
      
      expect(context.contextType).toBe('pattern');
      expect(context.systemPrompt).toContain('pattern');
    });

    it('should handle operational context type', async () => {
      const context = await contextProvider.generateContext('test', 'operational');
      
      expect(context.contextType).toBe('operational');
      expect(context.systemPrompt).toContain('operational');
    });

    it('should handle troubleshooting context type', async () => {
      const context = await contextProvider.generateContext('test', 'troubleshooting');
      
      expect(context.contextType).toBe('troubleshooting');
      expect(context.systemPrompt).toContain('troubleshooting');
    });

    it('should default to general context type', async () => {
      const context = await contextProvider.generateContext('test');
      
      expect(context.contextType).toBe('general');
    });
  });

  describe('AI System Optimization', () => {
    it('should optimize context for Claude Code', async () => {
      const context = await contextProvider.generateContext('test', 'general', 'claude-code');
      
      expect(context.aiSystem).toBe('claude-code');
      expect(context.systemPrompt).toContain('Claude Code');
    });

    it('should optimize context for Universe Builder', async () => {
      const context = await contextProvider.generateContext('test', 'general', 'universe-builder');
      
      expect(context.aiSystem).toBe('universe-builder');
      expect(context.systemPrompt).toContain('Universe Builder');
    });

    it('should handle unknown AI systems gracefully', async () => {
      const context = await contextProvider.generateContext('test', 'general', 'unknown-ai');
      
      expect(context.aiSystem).toBe('unknown-ai');
      expect(context.systemPrompt).toBeDefined();
    });
  });

  describe('Task-Specific Context', () => {
    it('should optimize for code generation tasks', async () => {
      const context = await contextProvider.generateContext('test', 'general', 'claude-code', 'code-generation');
      
      expect(context.task).toBe('code-generation');
      expect(context.systemPrompt).toContain('code generation');
    });

    it('should optimize for architecture review tasks', async () => {
      const context = await contextProvider.generateContext('test', 'architectural', 'claude-code', 'architecture-review');
      
      expect(context.task).toBe('architecture-review');
      expect(context.systemPrompt).toContain('architecture review');
    });

    it('should optimize for troubleshooting tasks', async () => {
      const context = await contextProvider.generateContext('test', 'troubleshooting', 'claude-code', 'problem-solving');
      
      expect(context.task).toBe('problem-solving');
      expect(context.systemPrompt).toContain('problem solving');
    });
  });

  describe('Error Handling', () => {
    it('should handle decision tracker errors gracefully', async () => {
      mockDecisionTracker.searchADRs.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const context = await contextProvider.generateContext('test');
      
      expect(context.error).toBeDefined();
      expect(context.confidence).toBe(0);
      expect(context.relevantADRs).toHaveLength(0);
    });

    it('should handle file system errors gracefully', async () => {
      const fs = require('fs-extra');
      fs.exists.mockResolvedValue(true);
      fs.readdir.mockRejectedValue(new Error('Permission denied'));

      const context = await contextProvider.generateContext('patterns', 'pattern');
      
      expect(context.patterns).toEqual([]);
      expect(context.sources).not.toContain('patterns');
    });
  });

  describe('Performance', () => {
    it('should complete context generation within time limit', async () => {
      const start = Date.now();
      
      await contextProvider.generateContext('performance test');
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent context generation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        contextProvider.generateContext(`concurrent test ${i}`)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeValidContext();
      });
    });
  });

  describe('Analytics Integration', () => {
    it('should track context generation metrics', async () => {
      await contextProvider.generateContext('test metrics');
      
      const metrics = contextProvider.getMetrics();
      
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.cacheHitRate).toBeDefined();
    });

    it('should track confidence scores', async () => {
      await contextProvider.generateContext('test confidence');
      
      const metrics = contextProvider.getMetrics();
      
      expect(metrics.averageConfidence).toBeDefined();
      expect(metrics.confidenceDistribution).toBeDefined();
    });
  });
});