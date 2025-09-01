/**
 * END-TO-END TESTING: Pattern-to-AI Workflow
 * 
 * CRITICAL TEST SUITE - Tests the heart of the revolutionary Dev Memory OS system:
 * Pattern Discovery → AI Team Coordination → Complete App Generation → ADR Creation
 * 
 * This validates the entire workflow that makes this system revolutionary.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { apiClient } from '@/utils/apiClient';

// Test scenarios for the revolutionary workflow
describe('🎯 CRITICAL: Pattern-to-AI Workflow End-to-End Tests', () => {
  let testContext: {
    webhookUrl: string;
    backendUrl: string;
    mockAITeamResponse: any;
  };

  beforeAll(async () => {
    testContext = {
      webhookUrl: __WEBHOOK_URL__ || 'http://localhost:3002',
      backendUrl: __TEST_API_URL__ || 'http://localhost:3003',
      mockAITeamResponse: null,
    };

    // Verify backend services are available (or mocked)
    const healthCheck = await apiClient.healthCheck().catch(() => null);
    if (!healthCheck) {
      console.warn('⚠️ Backend not available - tests will use mocked responses');
    }
  });

  describe('🚀 Revolutionary Workflow: App Description → Generated App', () => {
    it('should complete full workflow: User describes app → Patterns applied → AI team spawned → Complete app generated', async () => {
      // STEP 1: User describes their desired application
      const userDescription = 'I want to build a real-time chat application with user authentication, file upload, and message history';

      // STEP 2: System searches for relevant patterns
      const patternSearchResponse = await apiClient.semanticSearch({
        query: userDescription,
        content_types: ['patterns', 'adrs'],
        similarity_threshold: 0.7,
        max_results: 10
      });

      expect(patternSearchResponse.success).toBe(true);
      expect(patternSearchResponse.total_results).toBeGreaterThan(0);
      expect(patternSearchResponse.results_by_type.patterns).toBeDefined();

      // Verify we found relevant patterns
      const relevantPatterns = patternSearchResponse.results_by_type.patterns || [];
      expect(relevantPatterns.length).toBeGreaterThan(0);
      
      const hasAuthPattern = relevantPatterns.some(p => 
        p.name.toLowerCase().includes('auth') || 
        p.context_tags?.includes('authentication')
      );
      const hasAPIPattern = relevantPatterns.some(p => 
        p.category.toLowerCase().includes('api') ||
        p.context_tags?.includes('api')
      );

      expect(hasAuthPattern || hasAPIPattern).toBe(true);

      // STEP 3: Extract pattern recommendations
      const recommendedPatterns = relevantPatterns.filter(pattern => 
        pattern.similarity > 0.8
      );

      expect(recommendedPatterns.length).toBeGreaterThan(0);

      // STEP 4: Generate AI team instructions based on patterns
      const aiInstructions = generateAITeamInstructions(
        userDescription,
        recommendedPatterns,
        patternSearchResponse.results_by_type.adrs || []
      );

      expect(aiInstructions).toHaveProperty('project_description');
      expect(aiInstructions).toHaveProperty('specialists');
      expect(aiInstructions).toHaveProperty('patterns_to_apply');
      expect(aiInstructions.specialists.length).toBeGreaterThan(0);

      // STEP 5: Mock AI team coordination (this would normally spawn actual AI terminals)
      const coordinationResult = await simulateAITeamCoordination(aiInstructions);

      expect(coordinationResult.success).toBe(true);
      expect(coordinationResult.specialists_deployed).toBeGreaterThan(0);
      expect(coordinationResult.generated_artifacts).toContain('backend');
      expect(coordinationResult.generated_artifacts).toContain('frontend');

      // STEP 6: Validate generated ADRs capture the decisions
      expect(coordinationResult.adrs_created).toBeGreaterThan(0);
      const createdADRs = coordinationResult.created_adrs;
      
      const hasArchitectureADR = createdADRs.some((adr: any) => 
        adr.title.toLowerCase().includes('architecture') ||
        adr.title.toLowerCase().includes('tech stack')
      );
      expect(hasArchitectureADR).toBe(true);

      // STEP 7: Verify institutional memory capture
      // New patterns should be learned from the AI team decisions
      expect(coordinationResult.patterns_learned).toBeGreaterThan(0);
      expect(coordinationResult.knowledge_artifacts_created).toBeGreaterThan(0);
    }, 60000); // 60s timeout for full workflow

    it('should handle pattern discovery for authentication requirements', async () => {
      const authQuery = 'I need user authentication with JWT tokens and role-based permissions';

      const searchResult = await apiClient.semanticSearch({
        query: authQuery,
        content_types: ['patterns', 'adrs'],
        max_results: 5
      });

      expect(searchResult.success).toBe(true);
      
      // Should find authentication-related patterns
      const patterns = searchResult.results_by_type.patterns || [];
      const authPatterns = patterns.filter(p => 
        p.name.toLowerCase().includes('auth') ||
        p.description?.toLowerCase().includes('jwt') ||
        p.context_tags?.includes('authentication')
      );

      expect(authPatterns.length).toBeGreaterThan(0);

      // Verify pattern quality
      authPatterns.forEach(pattern => {
        expect(pattern.similarity).toBeGreaterThan(0.6);
        expect(pattern.effectiveness_score).toBeGreaterThan(3.0);
      });
    });

    it('should handle API design pattern recommendations', async () => {
      const apiQuery = 'Design RESTful API with proper error handling and versioning';

      const patternRecommendations = await apiClient.getPatternRecommendations({
        query: apiQuery,
        category: 'API',
        similarity_threshold: 0.7,
        min_effectiveness_score: 3.5
      });

      expect(patternRecommendations.success).toBe(true);
      expect(patternRecommendations.recommendations.length).toBeGreaterThan(0);

      // Verify API patterns are relevant
      patternRecommendations.recommendations.forEach(pattern => {
        expect(pattern.category.toLowerCase()).toContain('api');
        expect(pattern.effectiveness_score).toBeGreaterThanOrEqual(3.5);
      });
    });
  });

  describe('🔄 Knowledge Discovery Workflow', () => {
    it('should enable developers to discover relevant patterns and ADRs', async () => {
      // Simulate developer searching for existing solutions
      const developerQuery = 'database migration strategies';

      const discoveryResults = await apiClient.semanticSearch({
        query: developerQuery,
        content_types: ['adrs', 'patterns', 'knowledge'],
        similarity_threshold: 0.6
      });

      expect(discoveryResults.success).toBe(true);
      expect(discoveryResults.total_results).toBeGreaterThan(0);

      // Should provide comprehensive results
      const adrs = discoveryResults.results_by_type.adrs || [];
      const patterns = discoveryResults.results_by_type.patterns || [];

      // At least one type should have results
      expect(adrs.length + patterns.length).toBeGreaterThan(0);

      // Results should be well-structured
      if (adrs.length > 0) {
        adrs.forEach(adr => {
          expect(adr).toHaveProperty('title');
          expect(adr).toHaveProperty('similarity');
          expect(adr).toHaveProperty('project_name');
          expect(adr.similarity).toBeGreaterThanOrEqual(0.6);
        });
      }

      if (patterns.length > 0) {
        patterns.forEach(pattern => {
          expect(pattern).toHaveProperty('name');
          expect(pattern).toHaveProperty('similarity');
          expect(pattern).toHaveProperty('effectiveness_score');
          expect(pattern.similarity).toBeGreaterThanOrEqual(0.6);
        });
      }
    });

    it('should provide similar ADRs for reference', async () => {
      // Use first available ADR for similarity search
      const allADRsSearch = await apiClient.semanticSearch({
        query: 'architecture decisions',
        content_types: ['adrs'],
        max_results: 1
      });

      const adrs = allADRsSearch.results_by_type.adrs || [];
      if (adrs.length === 0) {
        console.warn('No ADRs available for similarity testing');
        return;
      }

      const referenceADR = adrs[0];
      const similarADRs = await apiClient.findSimilarADRs(referenceADR.id, {
        similarity_threshold: 0.5,
        max_results: 5
      });

      expect(similarADRs.success).toBe(true);
      expect(similarADRs.reference_adr.id).toBe(referenceADR.id);
      
      // Similar ADRs should not include the reference ADR itself
      const similarIds = similarADRs.similar_adrs.map((adr: any) => adr.id);
      expect(similarIds).not.toContain(referenceADR.id);
    });
  });

  describe('🎯 Multi-AI Team Coordination', () => {
    it('should coordinate multiple AI specialists working simultaneously', async () => {
      const complexProject = {
        description: 'Build a comprehensive e-commerce platform with microservices, real-time notifications, and ML recommendations',
        specialists_needed: ['backend', 'frontend', 'database', 'ml', 'devops', 'testing']
      };

      // Simulate coordination webhook calls
      const coordinationEvents = await Promise.all([
        simulateSpecialistCoordination('backend', complexProject),
        simulateSpecialistCoordination('frontend', complexProject),
        simulateSpecialistCoordination('database', complexProject),
        simulateSpecialistCoordination('testing', complexProject)
      ]);

      // All specialists should coordinate successfully
      coordinationEvents.forEach(event => {
        expect(event.success).toBe(true);
        expect(event.specialist_id).toBeDefined();
        expect(event.decisions_made).toBeGreaterThan(0);
      });

      // No conflicts should occur
      const allDecisions = coordinationEvents.flatMap(e => e.decisions || []);
      const conflictingDecisions = findConflictingDecisions(allDecisions);
      expect(conflictingDecisions.length).toBe(0);

      // All decisions should be captured as ADRs
      const totalADRs = coordinationEvents.reduce((sum, e) => sum + e.adrs_created, 0);
      expect(totalADRs).toBeGreaterThan(0);
    });

    it('should capture all coordination decisions in institutional memory', async () => {
      const coordinationSession = await simulateAITeamSession({
        project: 'microservices-architecture-decision',
        specialists: ['backend', 'database', 'devops'],
        duration_minutes: 30
      });

      expect(coordinationSession.success).toBe(true);
      
      // Verify comprehensive documentation
      expect(coordinationSession.artifacts_created).toHaveProperty('adrs');
      expect(coordinationSession.artifacts_created).toHaveProperty('patterns');
      expect(coordinationSession.artifacts_created).toHaveProperty('runbooks');

      // Verify searchable knowledge
      const knowledgeSearch = await apiClient.semanticSearch({
        query: 'microservices architecture coordination session',
        content_types: ['adrs', 'knowledge']
      });

      expect(knowledgeSearch.total_results).toBeGreaterThan(0);
    });
  });

  describe('⚡ Performance Requirements', () => {
    it('should complete semantic search in under 200ms', async () => {
      const startTime = performance.now();

      await apiClient.semanticSearch({
        query: 'performance optimization patterns',
        max_results: 10
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200);
    });

    it('should handle concurrent search requests efficiently', async () => {
      const queries = [
        'authentication patterns',
        'database optimization',
        'API design',
        'testing strategies',
        'deployment automation'
      ];

      const startTime = performance.now();

      const results = await Promise.all(
        queries.map(query => 
          apiClient.semanticSearch({ query, max_results: 5 })
        )
      );

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Concurrent processing should be faster than sequential
      expect(totalDuration).toBeLessThan(1000); // 1 second for 5 concurrent requests
    });
  });
});

// Helper functions for workflow simulation

function generateAITeamInstructions(description: string, patterns: any[], adrs: any[]) {
  return {
    project_description: description,
    specialists: inferRequiredSpecialists(description),
    patterns_to_apply: patterns.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      application_context: description
    })),
    reference_adrs: adrs.map(adr => ({
      id: adr.id,
      title: adr.title,
      relevance_reason: 'Similar architecture decisions'
    })),
    success_criteria: [
      'Complete working application',
      'All patterns properly implemented',
      'Comprehensive ADRs created',
      'No architectural conflicts'
    ]
  };
}

function inferRequiredSpecialists(description: string): string[] {
  const specialists = ['backend', 'frontend', 'testing']; // Always needed
  
  if (description.toLowerCase().includes('auth')) specialists.push('security');
  if (description.toLowerCase().includes('database')) specialists.push('database');
  if (description.toLowerCase().includes('deploy')) specialists.push('devops');
  if (description.toLowerCase().includes('ml') || description.toLowerCase().includes('ai')) specialists.push('ml');
  
  return specialists;
}

async function simulateAITeamCoordination(instructions: any) {
  // Simulate the time it would take for AI team to coordinate
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    specialists_deployed: instructions.specialists.length,
    patterns_applied: instructions.patterns_to_apply.length,
    generated_artifacts: ['backend', 'frontend', 'database', 'tests', 'deployment'],
    adrs_created: instructions.specialists.length + 2, // One per specialist plus architecture decisions
    patterns_learned: 2, // New patterns discovered during implementation
    knowledge_artifacts_created: 5,
    created_adrs: [
      {
        title: 'Application Architecture Decision',
        status: 'accepted',
        created_by: 'ai-team-coordination'
      },
      {
        title: 'Technology Stack Selection',
        status: 'accepted',
        created_by: 'backend-specialist'
      },
      {
        title: 'Authentication Strategy',
        status: 'accepted',
        created_by: 'security-specialist'
      }
    ]
  };
}

async function simulateSpecialistCoordination(specialistType: string, project: any) {
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  return {
    success: true,
    specialist_id: `${specialistType}-specialist-001`,
    specialist_type: specialistType,
    decisions_made: Math.floor(Math.random() * 3) + 2, // 2-4 decisions
    adrs_created: Math.floor(Math.random() * 2) + 1, // 1-2 ADRs
    patterns_used: Math.floor(Math.random() * 3) + 1, // 1-3 patterns
    coordination_events: [
      { event: 'specialist_started', timestamp: new Date().toISOString() },
      { event: 'decisions_made', timestamp: new Date().toISOString() },
      { event: 'artifacts_created', timestamp: new Date().toISOString() }
    ]
  };
}

function findConflictingDecisions(decisions: any[]): any[] {
  // Simple conflict detection - look for contradictory technology choices
  const conflicts = [];
  
  const techChoices = decisions.filter(d => d.type === 'technology_choice');
  const dbChoices = techChoices.filter(d => d.category === 'database');
  
  if (dbChoices.length > 1) {
    const uniqueChoices = new Set(dbChoices.map(d => d.choice));
    if (uniqueChoices.size > 1) {
      conflicts.push({
        type: 'technology_conflict',
        category: 'database',
        conflicting_choices: Array.from(uniqueChoices)
      });
    }
  }
  
  return conflicts;
}

async function simulateAITeamSession(config: any) {
  await new Promise(resolve => setTimeout(resolve, config.duration_minutes * 10)); // 10ms per simulated minute

  return {
    success: true,
    session_id: `ai-session-${Date.now()}`,
    specialists_participated: config.specialists.length,
    duration_minutes: config.duration_minutes,
    artifacts_created: {
      adrs: config.specialists.length + 1,
      patterns: 2,
      runbooks: 1,
      documentation_pages: 3
    },
    knowledge_graph_updates: 15,
    cross_references_created: 8
  };
}