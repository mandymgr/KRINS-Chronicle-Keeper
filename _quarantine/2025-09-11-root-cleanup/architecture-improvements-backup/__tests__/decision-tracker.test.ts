/**
 * 🧪 Decision Tracker Test Suite
 * Comprehensive tests for ADR management and analytics
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TestUtils } from '../../test-setup';

// Import the module to test
// Note: Using dynamic import to avoid TypeScript issues during setup
let DecisionTracker: any;
let mockDatabase: any;

beforeAll(async () => {
  // Mock the database before importing
  mockDatabase = TestUtils.createTestDatabase();
  
  // Mock the sqlite3 module
  jest.mock('sqlite3', () => ({
    Database: jest.fn(() => mockDatabase)
  }));

  // Now import the module
  const module = await import('../decision-tracker');
  DecisionTracker = module.DecisionTracker;
});

describe('DecisionTracker', () => {
  let tracker: any;
  let consoleMocks: any;

  beforeEach(() => {
    tracker = new DecisionTracker(':memory:');
    consoleMocks = TestUtils.mockConsole();
  });

  afterEach(() => {
    Object.values(consoleMocks).forEach((mock: any) => mock.mockRestore());
  });

  describe('Constructor', () => {
    it('should initialize with database path', () => {
      expect(tracker.dbPath).toBe(':memory:');
      expect(tracker.db).toBeDefined();
    });

    it('should set up initial state', () => {
      expect(tracker.adrCache).toEqual(new Map());
      expect(tracker.isInitialized).toBe(false);
    });
  });

  describe('Database Initialization', () => {
    it('should initialize database schema', async () => {
      await tracker.initialize();
      
      expect(mockDatabase.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS adrs')
      );
      expect(mockDatabase.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS evidence')
      );
      expect(mockDatabase.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS decision_links')
      );
    });

    it('should mark as initialized after setup', async () => {
      await tracker.initialize();
      expect(tracker.isInitialized).toBe(true);
    });
  });

  describe('ADR Management', () => {
    beforeEach(async () => {
      await tracker.initialize();
    });

    it('should add new ADR', async () => {
      const mockADR = TestUtils.createMockADR();
      
      mockDatabase.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await tracker.addADR(mockADR);
      
      expect(result.success).toBe(true);
      expect(result.adrId).toBe(mockADR.id);
      expect(mockDatabase.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO adrs'),
        expect.any(Array)
      );
    });

    it('should handle ADR insertion errors', async () => {
      const mockADR = TestUtils.createMockADR();
      
      mockDatabase.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      const result = await tracker.addADR(mockADR);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('should get ADR by ID', () => {
      const mockADR = TestUtils.createMockADR();
      mockDatabase.get.mockReturnValue(mockADR);

      const result = tracker.getADR(mockADR.id);
      
      expect(result).toEqual(mockADR);
      expect(mockDatabase.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM adrs WHERE id = ?'),
        [mockADR.id]
      );
    });

    it('should return null for non-existent ADR', () => {
      mockDatabase.get.mockReturnValue(null);

      const result = tracker.getADR('non-existent');
      
      expect(result).toBeNull();
    });

    it('should get all ADRs', () => {
      const mockADRs = [
        TestUtils.createMockADR({ id: 'ADR-0001' }),
        TestUtils.createMockADR({ id: 'ADR-0002' })
      ];
      mockDatabase.all.mockReturnValue(mockADRs);

      const result = tracker.getAllADRs();
      
      expect(result).toEqual(mockADRs);
      expect(mockDatabase.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM adrs ORDER BY date DESC')
      );
    });

    it('should search ADRs by query', () => {
      const mockADRs = [TestUtils.createMockADR()];
      mockDatabase.all.mockReturnValue(mockADRs);

      const result = tracker.searchADRs('database');
      
      expect(result).toEqual(mockADRs);
      expect(mockDatabase.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE title LIKE ? OR context LIKE ?'),
        ['%database%', '%database%']
      );
    });
  });

  describe('Evidence Management', () => {
    beforeEach(async () => {
      await tracker.initialize();
    });

    it('should add evidence to ADR', async () => {
      const evidence = {
        adrId: 'ADR-0001',
        type: 'performance',
        description: 'Load time improved by 50%',
        source: 'benchmarks',
        impact: 'high'
      };

      mockDatabase.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await tracker.addEvidence(evidence);
      
      expect(result.success).toBe(true);
      expect(mockDatabase.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO evidence'),
        expect.arrayContaining([evidence.adrId, evidence.type, evidence.description])
      );
    });

    it('should get evidence for ADR', () => {
      const mockEvidence = [{
        id: 1,
        adr_id: 'ADR-0001',
        type: 'performance',
        description: 'Test evidence'
      }];
      mockDatabase.all.mockReturnValue(mockEvidence);

      const result = tracker.getEvidence('ADR-0001');
      
      expect(result).toEqual(mockEvidence);
      expect(mockDatabase.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM evidence WHERE adr_id = ?'),
        ['ADR-0001']
      );
    });
  });

  describe('Decision Links', () => {
    beforeEach(async () => {
      await tracker.initialize();
    });

    it('should link decisions', async () => {
      mockDatabase.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await tracker.linkDecisions('ADR-0001', 'ADR-0002', 'depends_on');
      
      expect(result.success).toBe(true);
      expect(mockDatabase.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO decision_links'),
        ['ADR-0001', 'ADR-0002', 'depends_on', expect.any(String)]
      );
    });

    it('should get related decisions', () => {
      const mockLinks = [{
        from_adr: 'ADR-0001',
        to_adr: 'ADR-0002',
        relationship: 'depends_on'
      }];
      mockDatabase.all.mockReturnValue(mockLinks);

      const result = tracker.getRelatedDecisions('ADR-0001');
      
      expect(result).toEqual(mockLinks);
    });
  });

  describe('Analytics', () => {
    beforeEach(async () => {
      await tracker.initialize();
    });

    it('should generate analytics', () => {
      const mockADRs = [
        TestUtils.createMockADR({ status: 'accepted' }),
        TestUtils.createMockADR({ status: 'pending', id: 'ADR-0002' }),
        TestUtils.createMockADR({ status: 'rejected', id: 'ADR-0003' })
      ];
      mockDatabase.all.mockReturnValue(mockADRs);

      const analytics = tracker.generateAnalytics();
      
      expect(analytics.totalDecisions).toBe(3);
      expect(analytics.statusDistribution.accepted).toBe(1);
      expect(analytics.statusDistribution.pending).toBe(1);
      expect(analytics.statusDistribution.rejected).toBe(1);
    });

    it('should calculate decision velocity', () => {
      const mockADRs = [
        TestUtils.createMockADR({ 
          date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }),
        TestUtils.createMockADR({ 
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          id: 'ADR-0002' 
        })
      ];
      mockDatabase.all.mockReturnValue(mockADRs);

      const analytics = tracker.generateAnalytics();
      
      expect(analytics.decisionVelocity.last7Days).toBe(2);
      expect(analytics.decisionVelocity.last30Days).toBe(2);
    });
  });

  describe('Export Functionality', () => {
    beforeEach(async () => {
      await tracker.initialize();
    });

    it('should export ADRs to markdown', async () => {
      const mockADRs = [TestUtils.createMockADR()];
      mockDatabase.all.mockReturnValue(mockADRs);

      const markdown = await tracker.exportToMarkdown();
      
      expect(markdown).toContain('# Architecture Decision Records');
      expect(markdown).toContain('## Test Decision');
      expect(markdown).toContain('**Status:** accepted');
    });

    it('should export ADRs to JSON', async () => {
      const mockADRs = [TestUtils.createMockADR()];
      mockDatabase.all.mockReturnValue(mockADRs);

      const jsonData = await tracker.exportToJSON();
      const parsed = JSON.parse(jsonData);
      
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.adrs).toHaveLength(1);
      expect(parsed.adrs[0]).toBeValidADR();
    });
  });

  describe('Caching', () => {
    beforeEach(async () => {
      await tracker.initialize();
    });

    it('should cache ADR after retrieval', () => {
      const mockADR = TestUtils.createMockADR();
      mockDatabase.get.mockReturnValue(mockADR);

      // First call
      tracker.getADR(mockADR.id);
      expect(tracker.adrCache.has(mockADR.id)).toBe(true);

      // Second call should use cache
      mockDatabase.get.mockClear();
      const cachedResult = tracker.getADR(mockADR.id);
      
      expect(mockDatabase.get).not.toHaveBeenCalled();
      expect(cachedResult).toEqual(mockADR);
    });

    it('should clear cache when ADR is updated', async () => {
      const mockADR = TestUtils.createMockADR();
      tracker.adrCache.set(mockADR.id, mockADR);
      
      mockDatabase.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      await tracker.addADR({ ...mockADR, title: 'Updated Title' });
      
      expect(tracker.adrCache.has(mockADR.id)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await tracker.initialize();
    });

    it('should handle database connection errors gracefully', async () => {
      const newTracker = new DecisionTracker('/invalid/path/database.db');
      
      const result = await newTracker.addADR(TestUtils.createMockADR());
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database not initialized');
    });

    it('should validate ADR structure', async () => {
      const invalidADR = { id: 'ADR-0001' }; // Missing required fields
      
      const result = await tracker.addADR(invalidADR);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid ADR structure');
    });
  });

  describe('CLI Integration', () => {
    it('should handle command line arguments', () => {
      // Test CLI argument parsing
      const args = ['search', 'database'];
      const command = tracker.parseCommand(args);
      
      expect(command.action).toBe('search');
      expect(command.query).toBe('database');
    });
  });
});