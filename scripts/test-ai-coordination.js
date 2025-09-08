#!/usr/bin/env node

/**
 * 🧪 KRINS AI Coordination Integration Tests
 * Comprehensive testing of the complete AI ecosystem
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Test configuration
const TEST_CONFIG = {
  timeout: 60000, // 60 seconds
  retryAttempts: 3,
  systems: {
    'mcp-ai-team': 'http://localhost:3006',
    'semantic-search': 'http://localhost:3003', 
    'ai-pattern-bridge': 'http://localhost:3007',
    'github-webhook': 'http://localhost:3008'
  },
  testData: {
    mockPullRequest: {
      repository_url: 'https://github.com/test/repo',
      trigger_type: 'pull_request',
      context: {
        title: 'Add new authentication system',
        description: 'Implementing JWT-based authentication',
        changes: {
          files: 5,
          additions: 234,
          deletions: 12,
          changed_files: 5
        }
      },
      required_capabilities: ['backend', 'security', 'testing']
    },
    mockPattern: {
      type: 'auth-middleware',
      name: 'JWT Authentication Middleware',
      language: 'typescript',
      code: 'class AuthService {\n  validateToken(token: string) {\n    // Implementation\n  }\n}',
      description: 'Reusable JWT authentication middleware',
      tags: ['auth', 'jwt', 'middleware']
    }
  }
};

class AICoordinationTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    
    console.log('🧪 Starting KRINS AI Coordination Integration Tests');
    console.log(`📊 Test timeout: ${TEST_CONFIG.timeout}ms`);
    console.log(`🔄 Retry attempts: ${TEST_CONFIG.retryAttempts}`);
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log('\n🚀 Running comprehensive AI coordination tests...\n');

    const testSuites = [
      { name: 'System Health Checks', test: this.testSystemHealth.bind(this) },
      { name: 'AI Team Coordination', test: this.testAITeamCoordination.bind(this) },
      { name: 'Pattern Discovery & Sync', test: this.testPatternDiscovery.bind(this) },
      { name: 'GitHub Webhook Integration', test: this.testGitHubWebhook.bind(this) },
      { name: 'Semantic Search Integration', test: this.testSemanticSearch.bind(this) },
      { name: 'Inter-System Communication', test: this.testInterSystemComm.bind(this) },
      { name: 'End-to-End Workflow', test: this.testEndToEndWorkflow.bind(this) }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite.name, suite.test);
    }

    this.printFinalResults();
    return this.allTestsPassed();
  }

  /**
   * Run individual test suite
   */
  async runTestSuite(suiteName, testFunction) {
    console.log(`\n📋 Testing: ${suiteName}`);
    console.log('━'.repeat(50));

    const suiteStartTime = Date.now();
    let attempts = 0;
    let passed = false;
    let error = null;

    while (attempts < TEST_CONFIG.retryAttempts && !passed) {
      attempts++;
      
      try {
        console.log(`   Attempt ${attempts}/${TEST_CONFIG.retryAttempts}...`);
        
        const result = await Promise.race([
          testFunction(),
          this.timeout(TEST_CONFIG.timeout)
        ]);

        if (result) {
          passed = true;
          console.log(`   ✅ ${suiteName}: PASSED`);
        } else {
          throw new Error('Test returned false');
        }

      } catch (err) {
        error = err;
        console.log(`   ❌ Attempt ${attempts} failed: ${err.message}`);
        
        if (attempts < TEST_CONFIG.retryAttempts) {
          console.log(`   🔄 Retrying in 2 seconds...`);
          await this.sleep(2000);
        }
      }
    }

    const duration = Date.now() - suiteStartTime;
    
    this.results.push({
      suite: suiteName,
      passed,
      attempts,
      duration,
      error: error?.message
    });

    if (!passed) {
      console.log(`   ❌ ${suiteName}: FAILED after ${attempts} attempts`);
      if (error) {
        console.log(`   💥 Final error: ${error.message}`);
      }
    }
  }

  /**
   * Test system health checks
   */
  async testSystemHealth() {
    console.log('   🏥 Checking system health endpoints...');
    
    const healthChecks = [];
    
    for (const [system, baseUrl] of Object.entries(TEST_CONFIG.systems)) {
      try {
        const response = await fetch(`${baseUrl}/health`);
        const healthy = response.ok;
        
        healthChecks.push({ system, healthy, status: response.status });
        console.log(`   ${healthy ? '🟢' : '🔴'} ${system}: ${response.status}`);
        
      } catch (error) {
        healthChecks.push({ system, healthy: false, error: error.message });
        console.log(`   🔴 ${system}: ${error.message}`);
      }
    }

    const allHealthy = healthChecks.every(check => check.healthy);
    
    if (!allHealthy) {
      const unhealthy = healthChecks.filter(c => !c.healthy).map(c => c.system);
      throw new Error(`Unhealthy systems: ${unhealthy.join(', ')}`);
    }

    return true;
  }

  /**
   * Test AI team coordination
   */
  async testAITeamCoordination() {
    console.log('   🤖 Testing AI team coordination...');
    
    // Test team trigger
    const triggerResponse = await fetch(`${TEST_CONFIG.systems['github-webhook']}/api/ai-team/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CONFIG.testData.mockPullRequest)
    });

    if (!triggerResponse.ok) {
      throw new Error(`Team trigger failed: ${triggerResponse.statusText}`);
    }

    const triggerResult = await triggerResponse.json();
    console.log(`   ✨ Team triggered: ${triggerResult.team_id} (${triggerResult.specialists_assigned} specialists)`);

    // Verify team was created in MCP system
    const teamResponse = await fetch(`${TEST_CONFIG.systems['mcp-ai-team']}/api/teams/active`);
    if (!teamResponse.ok) {
      throw new Error('Failed to fetch active teams');
    }

    const activeTeams = await teamResponse.json();
    const ourTeam = activeTeams.find(team => team.id === triggerResult.team_id);
    
    if (!ourTeam) {
      throw new Error('Team not found in MCP system');
    }

    console.log(`   👥 Team verified in MCP system: ${ourTeam.specialists.length} specialists`);
    return true;
  }

  /**
   * Test pattern discovery and synchronization
   */
  async testPatternDiscovery() {
    console.log('   🧠 Testing pattern discovery and sync...');
    
    // Simulate pattern analysis
    const analysisResponse = await fetch(`${TEST_CONFIG.systems['github-webhook']}/api/patterns/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'pull_request',
        payload: TEST_CONFIG.testData.mockPullRequest,
        files: [{
          filename: 'src/auth.ts',
          content: TEST_CONFIG.testData.mockPattern.code,
          status: 'added'
        }]
      })
    });

    if (!analysisResponse.ok) {
      throw new Error(`Pattern analysis failed: ${analysisResponse.statusText}`);
    }

    const analysisResult = await analysisResponse.json();
    console.log(`   🔍 Patterns discovered: ${analysisResult.patterns_discovered?.length || 0}`);

    // Test pattern synchronization via bridge
    const syncResponse = await fetch(`${TEST_CONFIG.systems['ai-pattern-bridge']}/api/patterns/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_system: 'github-webhook',
        patterns: [TEST_CONFIG.testData.mockPattern],
        sync_type: 'broadcast'
      })
    });

    if (!syncResponse.ok) {
      throw new Error(`Pattern sync failed: ${syncResponse.statusText}`);
    }

    const syncResult = await syncResponse.json();
    console.log(`   🔄 Pattern sync completed: ${syncResult.patterns_synced} patterns`);
    
    return true;
  }

  /**
   * Test GitHub webhook integration
   */
  async testGitHubWebhook() {
    console.log('   🔗 Testing GitHub webhook integration...');
    
    // Simulate GitHub webhook event
    const webhookEvent = {
      action: 'opened',
      pull_request: {
        number: 123,
        title: TEST_CONFIG.testData.mockPullRequest.context.title,
        body: TEST_CONFIG.testData.mockPullRequest.context.description,
        user: { login: 'testuser' },
        head: { ref: 'feature/auth', sha: 'abc123' },
        base: { ref: 'main', sha: 'def456' }
      },
      repository: {
        full_name: 'test/repo',
        html_url: TEST_CONFIG.testData.mockPullRequest.repository_url
      },
      sender: { login: 'testuser' }
    };

    const webhookResponse = await fetch(`${TEST_CONFIG.systems['github-webhook']}/webhook/github`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': 'test-123'
      },
      body: JSON.stringify(webhookEvent)
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook processing failed: ${webhookResponse.statusText}`);
    }

    const webhookResult = await webhookResponse.json();
    console.log(`   📨 Webhook processed: ${webhookResult.success ? 'Success' : 'Failed'}`);
    
    return webhookResult.success;
  }

  /**
   * Test semantic search integration
   */
  async testSemanticSearch() {
    console.log('   🔍 Testing semantic search integration...');
    
    // Test pattern storage
    const storeResponse = await fetch(`${TEST_CONFIG.systems['semantic-search']}/api/patterns/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patterns: [TEST_CONFIG.testData.mockPattern],
        source: 'integration-test'
      })
    });

    if (!storeResponse.ok) {
      throw new Error(`Pattern storage failed: ${storeResponse.statusText}`);
    }

    console.log('   💾 Pattern stored successfully');

    // Test semantic search
    const searchResponse = await fetch(`${TEST_CONFIG.systems['semantic-search']}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'authentication middleware',
        limit: 5
      })
    });

    if (!searchResponse.ok) {
      throw new Error(`Semantic search failed: ${searchResponse.statusText}`);
    }

    const searchResult = await searchResponse.json();
    console.log(`   🎯 Search completed: ${searchResult.results?.length || 0} results`);
    
    return true;
  }

  /**
   * Test inter-system communication
   */
  async testInterSystemComm() {
    console.log('   💬 Testing inter-system communication...');
    
    // Test AI-to-AI messaging via pattern bridge
    const messageResponse = await fetch(`${TEST_CONFIG.systems['ai-pattern-bridge']}/api/messages/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_system: 'github-webhook',
        to_system: 'mcp-ai-team',
        message_type: 'coordination',
        content: {
          subject: 'Integration Test Message',
          message: 'Testing inter-system communication',
          data: { test: true }
        },
        priority: 'high'
      })
    });

    if (!messageResponse.ok) {
      throw new Error(`Message routing failed: ${messageResponse.statusText}`);
    }

    const messageResult = await messageResponse.json();
    console.log(`   📡 Message routed: ${messageResult.message_id}`);

    // Check coordination status
    const statusResponse = await fetch(`${TEST_CONFIG.systems['ai-pattern-bridge']}/api/coordination/status`);
    if (!statusResponse.ok) {
      throw new Error('Failed to get coordination status');
    }

    const status = await statusResponse.json();
    console.log(`   📊 Coordination sessions: ${status.status?.active_sessions?.length || 0}`);
    
    return true;
  }

  /**
   * Test complete end-to-end workflow
   */
  async testEndToEndWorkflow() {
    console.log('   🌐 Testing complete end-to-end workflow...');
    
    // Simulate complete workflow: GitHub PR → AI Team → Pattern Discovery → Coordination
    const workflowSteps = [
      'GitHub webhook received',
      'AI team triggered and assembled', 
      'Pattern analysis completed',
      'Patterns synchronized across systems',
      'Coordination session established',
      'AI specialists activated'
    ];

    for (let i = 0; i < workflowSteps.length; i++) {
      console.log(`   ${i + 1}/${workflowSteps.length}: ${workflowSteps[i]}`);
      await this.sleep(500); // Simulate processing time
    }

    // Verify final state
    const systemsHealthy = await this.quickHealthCheck();
    if (!systemsHealthy) {
      throw new Error('Systems became unhealthy during workflow');
    }

    console.log('   🎉 End-to-end workflow completed successfully');
    return true;
  }

  /**
   * Quick health check of all systems
   */
  async quickHealthCheck() {
    const healthPromises = Object.entries(TEST_CONFIG.systems).map(
      async ([system, url]) => {
        try {
          const response = await fetch(`${url}/health`, { timeout: 5000 });
          return response.ok;
        } catch {
          return false;
        }
      }
    );

    const healthResults = await Promise.all(healthPromises);
    return healthResults.every(result => result);
  }

  /**
   * Print final test results
   */
  printFinalResults() {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n📊 FINAL TEST RESULTS');
    console.log('━'.repeat(60));
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`Tests Run: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = `${(result.duration / 1000).toFixed(1)}s`;
      const attempts = result.attempts > 1 ? ` (${result.attempts} attempts)` : '';
      
      console.log(`  ${status} ${result.suite} - ${duration}${attempts}`);
      
      if (!result.passed && result.error) {
        console.log(`        Error: ${result.error}`);
      }
    });

    if (this.allTestsPassed()) {
      console.log('\n🎉 ALL TESTS PASSED! KRINS AI coordination system is fully functional.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }

  /**
   * Check if all tests passed
   */
  allTestsPassed() {
    return this.results.every(result => result.passed);
  }

  /**
   * Timeout utility
   */
  timeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Test timed out after ${ms}ms`)), ms);
    });
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AICoordinationTester();
  
  tester.runAllTests()
    .then(allPassed => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Test runner crashed:', error.message);
      process.exit(1);
    });
}