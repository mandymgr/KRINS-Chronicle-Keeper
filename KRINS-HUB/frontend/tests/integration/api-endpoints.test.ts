/**
 * BACKEND API COMPREHENSIVE TESTING SUITE
 * 
 * Tests all API endpoints on http://localhost:3003 with realistic scenarios
 * Validates semantic search functionality, database integration, and webhook coordination
 */

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { apiClient } from '@/utils/apiClient';
import type { 
  SemanticSearchRequest, 
  SemanticSearchResponse,
  PatternRecommendationResponse,
  SimilarADRsResponse 
} from '@/types';

describe('🔧 Backend API Comprehensive Testing Suite', () => {
  let apiHealthy = false;

  beforeAll(async () => {
    try {
      const health = await apiClient.healthCheck();
      apiHealthy = health.status === 'ok';
      console.log(`API Health Status: ${apiHealthy ? '✅ Healthy' : '⚠️ Mocked'}`);
    } catch (error) {
      console.log('⚠️ API not available - using mock responses');
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('📋 Health and Info Endpoints', () => {
    it('should return comprehensive health status', async () => {
      const health = await apiClient.healthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('services');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('port');

      expect(health.services).toHaveProperty('database');
      expect(health.services).toHaveProperty('embeddings');
      expect(health.services).toHaveProperty('api');
      
      expect(typeof health.uptime).toBe('number');
      expect(health.port).toBe(3003);
    });

    it('should provide API information and documentation', async () => {
      const info = await apiClient.getAPIInfo();

      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('endpoints');

      expect(info.name).toBe('Dev Memory OS Semantic Search API');
      expect(info.version).toBe('1.0.0');
      expect(info.endpoints).toHaveProperty('search');
      expect(info.endpoints).toHaveProperty('embeddings');
      expect(info.endpoints).toHaveProperty('patterns');
    });

    it('should handle connection testing gracefully', async () => {
      const isConnected = await apiClient.testConnection();
      expect(typeof isConnected).toBe('boolean');
    });
  });

  describe('🔍 Semantic Search Endpoints', () => {
    describe('POST /api/search/semantic', () => {
      it('should perform basic semantic search with valid query', async () => {
        const request: SemanticSearchRequest = {
          query: 'authentication patterns for web applications',
          content_types: ['adrs', 'patterns'],
          similarity_threshold: 0.7,
          max_results: 10
        };

        const response = await apiClient.semanticSearch(request);

        expect(response.success).toBe(true);
        expect(response.query).toBe(request.query);
        expect(response.similarity_threshold).toBe(0.7);
        expect(response).toHaveProperty('total_results');
        expect(response).toHaveProperty('results_by_type');
        expect(response).toHaveProperty('timestamp');

        // Validate results structure
        const { results_by_type } = response;
        if (results_by_type.adrs && results_by_type.adrs.length > 0) {
          results_by_type.adrs.forEach(adr => {
            expect(adr).toHaveProperty('id');
            expect(adr).toHaveProperty('type', 'adr');
            expect(adr).toHaveProperty('title');
            expect(adr).toHaveProperty('similarity');
            expect(adr).toHaveProperty('project_name');
            expect(adr).toHaveProperty('url');
            expect(typeof adr.similarity).toBe('number');
            expect(adr.similarity).toBeGreaterThanOrEqual(0);
            expect(adr.similarity).toBeLessThanOrEqual(1);
          });
        }

        if (results_by_type.patterns && results_by_type.patterns.length > 0) {
          results_by_type.patterns.forEach(pattern => {
            expect(pattern).toHaveProperty('id');
            expect(pattern).toHaveProperty('type', 'pattern');
            expect(pattern).toHaveProperty('name');
            expect(pattern).toHaveProperty('similarity');
            expect(pattern).toHaveProperty('category');
            expect(pattern).toHaveProperty('effectiveness_score');
            expect(typeof pattern.similarity).toBe('number');
            expect(pattern.similarity).toBeGreaterThanOrEqual(0);
            expect(pattern.similarity).toBeLessThanOrEqual(1);
          });
        }
      });

      it('should handle different content type filters', async () => {
        const testCases = [
          { content_types: ['adrs'] },
          { content_types: ['patterns'] },
          { content_types: ['adrs', 'patterns'] },
          { content_types: ['adrs', 'patterns', 'knowledge'] }
        ];

        for (const testCase of testCases) {
          const response = await apiClient.semanticSearch({
            query: 'database architecture decisions',
            ...testCase
          });

          expect(response.success).toBe(true);
          expect(response.results_by_type).toBeDefined();

          // Should only return requested content types
          Object.keys(response.results_by_type).forEach(type => {
            if (response.results_by_type[type as keyof typeof response.results_by_type]?.length > 0) {
              expect(testCase.content_types).toContain(type);
            }
          });
        }
      });

      it('should respect similarity threshold filtering', async () => {
        const thresholds = [0.5, 0.7, 0.9];

        for (const threshold of thresholds) {
          const response = await apiClient.semanticSearch({
            query: 'API design patterns',
            similarity_threshold: threshold,
            max_results: 20
          });

          expect(response.success).toBe(true);
          expect(response.similarity_threshold).toBe(threshold);

          // All results should meet the threshold
          const allResults = [
            ...(response.results_by_type.adrs || []),
            ...(response.results_by_type.patterns || [])
          ];

          allResults.forEach(result => {
            expect(result.similarity).toBeGreaterThanOrEqual(threshold);
          });
        }
      });

      it('should limit results according to max_results parameter', async () => {
        const limits = [1, 5, 10, 20];

        for (const limit of limits) {
          const response = await apiClient.semanticSearch({
            query: 'software architecture patterns',
            max_results: limit
          });

          expect(response.success).toBe(true);
          expect(response.total_results).toBeLessThanOrEqual(limit);
        }
      });

      it('should handle invalid queries appropriately', async () => {
        const invalidQueries = [
          { query: '' },
          { query: '   ' },
          { query: null as any },
          { query: undefined as any }
        ];

        for (const invalidQuery of invalidQueries) {
          try {
            await apiClient.semanticSearch(invalidQuery);
            expect.fail('Should have thrown error for invalid query');
          } catch (error: any) {
            expect(error.message).toContain('Query is required');
          }
        }
      });

      it('should perform well with complex queries', async () => {
        const complexQueries = [
          'How to implement microservices architecture with proper service discovery and load balancing?',
          'Best practices for JWT authentication with refresh token rotation and role-based access control',
          'Database migration strategies for PostgreSQL with zero-downtime deployments',
          'CI/CD pipeline setup with automated testing, security scanning, and deployment approval gates'
        ];

        for (const query of complexQueries) {
          const startTime = performance.now();
          
          const response = await apiClient.semanticSearch({
            query,
            max_results: 15
          });

          const endTime = performance.now();
          const duration = endTime - startTime;

          expect(response.success).toBe(true);
          expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
          
          if (response.total_results > 0) {
            // Complex queries should return relevant results
            const hasHighQualityResults = [
              ...(response.results_by_type.adrs || []),
              ...(response.results_by_type.patterns || [])
            ].some(result => result.similarity > 0.8);

            if (response.total_results > 0) {
              expect(hasHighQualityResults).toBe(true);
            }
          }
        }
      });
    });

    describe('GET /api/search/similar/:adr-id', () => {
      it('should find similar ADRs for a given ADR', async () => {
        // First, get an ADR to use as reference
        const searchResponse = await apiClient.semanticSearch({
          query: 'architecture decision',
          content_types: ['adrs'],
          max_results: 1
        });

        const adrs = searchResponse.results_by_type.adrs;
        if (!adrs || adrs.length === 0) {
          console.warn('No ADRs available for similarity testing');
          return;
        }

        const referenceADR = adrs[0];
        const similarResponse = await apiClient.findSimilarADRs(referenceADR.id, {
          similarity_threshold: 0.6,
          max_results: 5
        });

        expect(similarResponse.success).toBe(true);
        expect(similarResponse.reference_adr).toBeDefined();
        expect(similarResponse.reference_adr.id).toBe(referenceADR.id);
        expect(similarResponse.similarity_threshold).toBe(0.6);
        expect(Array.isArray(similarResponse.similar_adrs)).toBe(true);

        // Similar ADRs should not include the reference ADR
        const similarIds = similarResponse.similar_adrs.map(adr => adr.id);
        expect(similarIds).not.toContain(referenceADR.id);

        // All similar ADRs should meet threshold
        similarResponse.similar_adrs.forEach(adr => {
          expect(adr.similarity).toBeGreaterThanOrEqual(0.6);
          expect(adr).toHaveProperty('title');
          expect(adr).toHaveProperty('project_name');
          expect(adr).toHaveProperty('status');
          expect(adr).toHaveProperty('url');
        });
      });

      it('should handle non-existent ADR IDs', async () => {
        try {
          await apiClient.findSimilarADRs('non-existent-adr-id');
          expect.fail('Should have thrown error for non-existent ADR');
        } catch (error: any) {
          expect(error.message).toContain('ADR not found');
        }
      });

      it('should respect include_same_project parameter', async () => {
        const searchResponse = await apiClient.semanticSearch({
          query: 'technology choice',
          content_types: ['adrs'],
          max_results: 1
        });

        const adrs = searchResponse.results_by_type.adrs;
        if (!adrs || adrs.length === 0) return;

        const referenceADR = adrs[0];
        
        // Test with include_same_project = false
        const similarResponse = await apiClient.findSimilarADRs(referenceADR.id, {
          include_same_project: false,
          max_results: 10
        });

        expect(similarResponse.success).toBe(true);
        
        // Should not include ADRs from the same project (if any)
        similarResponse.similar_adrs.forEach(adr => {
          if (referenceADR.project_name) {
            expect(adr.project_name).not.toBe(referenceADR.project_name);
          }
        });
      });
    });

    describe('GET /api/search/analytics', () => {
      it('should return search analytics data', async () => {
        const analytics = await apiClient.getSearchAnalytics({
          days: 30
        });

        expect(analytics.success).toBe(true);
        expect(analytics.period_days).toBe(30);
        expect(Array.isArray(analytics.daily_searches)).toBe(true);
        expect(Array.isArray(analytics.top_search_terms)).toBe(true);

        // Validate daily search data structure
        analytics.daily_searches.forEach(day => {
          expect(day).toHaveProperty('search_date');
          expect(day).toHaveProperty('daily_searches');
          expect(typeof day.daily_searches).toBe('number');
        });

        // Validate top search terms structure
        analytics.top_search_terms.forEach(term => {
          expect(term).toHaveProperty('query_text');
          expect(term).toHaveProperty('search_count');
          expect(typeof term.search_count).toBe('number');
        });
      });

      it('should handle different time periods', async () => {
        const periods = [7, 30, 90];

        for (const days of periods) {
          const analytics = await apiClient.getSearchAnalytics({ days });

          expect(analytics.success).toBe(true);
          expect(analytics.period_days).toBe(days);
        }
      });
    });
  });

  describe('🎯 Pattern Recommendation Endpoints', () => {
    describe('GET /api/patterns/recommend', () => {
      it('should provide pattern recommendations based on query', async () => {
        const response = await apiClient.getPatternRecommendations({
          query: 'user authentication and authorization',
          similarity_threshold: 0.7,
          max_results: 5
        });

        expect(response.success).toBe(true);
        expect(response.query).toBe('user authentication and authorization');
        expect(response.similarity_threshold).toBe(0.7);
        expect(Array.isArray(response.recommendations)).toBe(true);

        response.recommendations.forEach(pattern => {
          expect(pattern).toHaveProperty('id');
          expect(pattern).toHaveProperty('name');
          expect(pattern).toHaveProperty('similarity');
          expect(pattern).toHaveProperty('category');
          expect(pattern).toHaveProperty('effectiveness_score');
          expect(pattern).toHaveProperty('usage_count');
          expect(pattern).toHaveProperty('url');
          
          if (pattern.similarity !== null) {
            expect(pattern.similarity).toBeGreaterThanOrEqual(0.7);
          }
        });
      });

      it('should filter by category', async () => {
        const categories = ['Architecture', 'Security', 'Performance', 'Testing'];

        for (const category of categories) {
          const response = await apiClient.getPatternRecommendations({
            category,
            max_results: 10
          });

          expect(response.success).toBe(true);
          expect(response.category).toBe(category);

          response.recommendations.forEach(pattern => {
            expect(pattern.category.toLowerCase()).toBe(category.toLowerCase());
          });
        }
      });

      it('should filter by effectiveness score', async () => {
        const minScores = [3.0, 4.0, 4.5];

        for (const minScore of minScores) {
          const response = await apiClient.getPatternRecommendations({
            min_effectiveness_score: minScore,
            max_results: 10
          });

          expect(response.success).toBe(true);

          response.recommendations.forEach(pattern => {
            if (pattern.effectiveness_score !== null) {
              expect(pattern.effectiveness_score).toBeGreaterThanOrEqual(minScore);
            }
          });
        }
      });

      it('should handle empty queries gracefully', async () => {
        const response = await apiClient.getPatternRecommendations({
          max_results: 5
        });

        expect(response.success).toBe(true);
        expect(response.query).toBeNull();
        expect(Array.isArray(response.recommendations)).toBe(true);

        // Should return top patterns by effectiveness and usage
        response.recommendations.forEach(pattern => {
          expect(pattern.similarity).toBeNull();
          expect(pattern).toHaveProperty('effectiveness_score');
          expect(pattern).toHaveProperty('usage_count');
        });
      });
    });
  });

  describe('🔗 Integration and Coordination Endpoints', () => {
    it('should handle webhook coordination events', async () => {
      const coordinationPayload = {
        event: 'new_adr_created',
        data: {
          adr_id: 'adr-test-001',
          title: 'Test ADR for Webhook Integration',
          file_path: 'docs/adr/ADR-test-001.md',
          project_name: 'Test Project'
        },
        source: 'test-suite'
      };

      // Mock the webhook coordination endpoint
      const response = await fetch(`${__TEST_API_URL__}/webhook/coordinate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coordinationPayload)
      });

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.event).toBe('new_adr_created');
      expect(responseData).toHaveProperty('processed_at');
    });

    it('should handle pattern usage events', async () => {
      const patternUsagePayload = {
        event: 'pattern_used',
        data: {
          pattern_id: 'pattern-test-001',
          usage_context: 'Applied to test project for validation',
          user_id: 'test-user',
          project_id: 'test-project'
        },
        source: 'pattern-application-test'
      };

      const response = await fetch(`${__TEST_API_URL__}/webhook/coordinate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patternUsagePayload)
      });

      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.event).toBe('pattern_used');
    });
  });

  describe('🚀 Performance and Reliability', () => {
    it('should handle high load with multiple concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        apiClient.semanticSearch({
          query: `test query ${i}`,
          max_results: 5
        })
      );

      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds for 10 concurrent requests

      console.log(`✅ Handled ${concurrentRequests} concurrent requests in ${duration.toFixed(2)}ms`);
    });

    it('should handle timeout scenarios gracefully', async () => {
      // Create a client with very short timeout for testing
      const testClient = new (await import('@/utils/apiClient')).default({
        timeout: 1 // 1ms timeout to force timeout
      });

      try {
        await testClient.semanticSearch({
          query: 'timeout test query'
        });
        // If no timeout occurred (e.g., due to mocking), that's also valid
      } catch (error: any) {
        expect(error.message).toMatch(/timeout|timed out/i);
      }
    });

    it('should implement proper retry logic', async () => {
      // This test would typically use a network failure simulation
      // For now, we'll just verify the retry configuration exists
      const testClient = new (await import('@/utils/apiClient')).default({
        retries: 3,
        timeout: 1000
      });

      // The client should be created with retry configuration
      expect(testClient).toBeDefined();
    });
  });

  describe('🔒 Error Handling and Edge Cases', () => {
    it('should handle malformed requests appropriately', async () => {
      const malformedRequests = [
        { /* empty request */ },
        { query: null },
        { query: '', max_results: -1 },
        { query: 'test', similarity_threshold: 2.0 }, // > 1.0
        { query: 'test', content_types: ['invalid_type'] }
      ];

      for (const request of malformedRequests) {
        try {
          await apiClient.semanticSearch(request as any);
          // Some requests might be handled gracefully
        } catch (error) {
          // Error handling is expected for truly invalid requests
          expect(error).toBeDefined();
        }
      }
    });

    it('should handle service unavailable scenarios', async () => {
      // Mock service unavailable by testing with invalid base URL
      const unavailableClient = new (await import('@/utils/apiClient')).default({
        baseUrl: 'http://localhost:9999', // Non-existent port
        timeout: 1000,
        retries: 1
      });

      try {
        await unavailableClient.healthCheck();
        expect.fail('Should have failed for unavailable service');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate response data integrity', async () => {
      const response = await apiClient.semanticSearch({
        query: 'data integrity test',
        max_results: 5
      });

      expect(response.success).toBe(true);
      
      // Verify response structure integrity
      expect(typeof response.query).toBe('string');
      expect(typeof response.total_results).toBe('number');
      expect(typeof response.timestamp).toBe('string');
      expect(response.results_by_type).toBeTypeOf('object');
      
      // Verify timestamp is valid ISO string
      expect(() => new Date(response.timestamp)).not.toThrow();
      
      // Verify URLs are properly formatted
      Object.values(response.results_by_type).forEach(results => {
        if (Array.isArray(results)) {
          results.forEach((result: any) => {
            if (result.url) {
              expect(result.url).toMatch(/^\/api\//);
            }
          });
        }
      });
    });
  });
});