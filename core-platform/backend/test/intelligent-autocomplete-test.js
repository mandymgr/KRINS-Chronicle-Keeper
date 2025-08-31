/**
 * Comprehensive Test Suite for Intelligent Autocomplete API
 * Tests all features including semantic search, caching, trending suggestions, and error handling
 * Part of Krin's revolutionary AI team coordination system
 */

const assert = require('assert');
const http = require('http');
const { performance } = require('perf_hooks');

class IntelligentAutocompleteTestSuite {
    constructor() {
        this.baseURL = 'http://localhost:3003';
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    /**
     * Simple HTTP GET request helper using Node.js built-in http module
     */
    async httpGet(path) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseURL);
            
            const req = http.request(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({
                            status: res.statusCode,
                            data: jsonData
                        });
                    } catch (parseError) {
                        resolve({
                            status: res.statusCode,
                            data: data
                        });
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        });
    }

    /**
     * Run a single test case
     */
    async runTest(testName, testFunction) {
        this.testResults.total++;
        const startTime = performance.now();
        
        try {
            await testFunction();
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            this.testResults.passed++;
            this.testResults.details.push({
                name: testName,
                status: 'PASSED',
                duration: `${duration}ms`,
                error: null
            });
            
            console.log(`✅ ${testName} - PASSED (${duration}ms)`);
            
        } catch (error) {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            this.testResults.failed++;
            this.testResults.details.push({
                name: testName,
                status: 'FAILED',
                duration: `${duration}ms`,
                error: error.message
            });
            
            console.log(`❌ ${testName} - FAILED (${duration}ms)`);
            console.log(`   Error: ${error.message}`);
        }
    }

    /**
     * Test basic API connectivity and health
     */
    async testBasicConnectivity() {
        const response = await this.httpGet('/health');
        assert.strictEqual(response.status, 200, 'Health endpoint should return 200');
        assert(response.data.success, 'Health response should indicate success');
    }

    /**
     * Test intelligent autocomplete endpoint accessibility
     */
    async testEndpointAccessibility() {
        const response = await this.httpGet('/api/search/autocomplete/intelligent?q=test');
        assert.strictEqual(response.status, 200, 'Intelligent autocomplete endpoint should be accessible');
        assert(response.data.success, 'Response should indicate success');
        assert(Array.isArray(response.data.suggestions), 'Response should contain suggestions array');
    }

    /**
     * Test direct text matching functionality
     */
    async testDirectMatching() {
        const response = await this.httpGet('/api/search/autocomplete/intelligent?q=todo&limit=5');
        
        assert.strictEqual(response.status, 200, 'Request should succeed');
        assert(response.data.success, 'Response should be successful');
        assert(response.data.suggestions.length > 0, 'Should return suggestions for "todo" query');
        
        // Check if we get the Todo App Architecture Choice ADR
        const todoSuggestion = response.data.suggestions.find(s => s.text.toLowerCase().includes('todo'));
        assert(todoSuggestion, 'Should find suggestion containing "todo"');
        assert.strictEqual(todoSuggestion.match_type, 'direct_match', 'Should be classified as direct match');
        assert.strictEqual(todoSuggestion.score, 1, 'Direct match should have perfect score');
    }

    /**
     * Test semantic search functionality
     */
    async testSemanticSearch() {
        const response = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=architecture&include_semantic=true&limit=5`);
        
        assert.strictEqual(response.status, 200, 'Request should succeed');
        assert(response.data.success, 'Response should be successful');
        assert(response.data.response_features.semantic_enabled, 'Semantic search should be enabled');
        
        // Should get both direct matches and semantic matches
        const hasDirectMatch = response.data.suggestions.some(s => s.match_type === 'direct_match');
        const hasSemanticMatch = response.data.suggestions.some(s => s.match_type.includes('semantic'));
        
        assert(hasDirectMatch || hasSemanticMatch, 'Should return either direct or semantic matches for architecture query');
        
        if (response.data.suggestion_sources.includes('semantic')) {
            assert(response.data.suggestion_sources.includes('semantic'), 'Should include semantic in suggestion sources');
        }
    }

    /**
     * Test trending suggestions functionality
     */
    async testTrendingSuggestions() {
        const response = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=xyz&include_trending=true&limit=5`);
        
        assert.strictEqual(response.status, 200, 'Request should succeed');
        assert(response.data.success, 'Response should be successful');
        assert(response.data.response_features.trending_enabled, 'Trending should be enabled');
        
        // For a non-existent query, should get trending suggestions
        if (response.data.suggestions.length > 0) {
            const hasTrending = response.data.suggestions.some(s => s.match_type === 'trending');
            assert(hasTrending, 'Should include trending suggestions for unknown query');
        }
    }

    /**
     * Test empty query handling (should return trending)
     */
    async testEmptyQuery() {
        const response = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=&limit=5`);
        
        assert.strictEqual(response.status, 200, 'Request should succeed');
        assert(response.data.success, 'Response should be successful');
        assert.strictEqual(response.data.suggestion_type, 'trending', 'Empty query should return trending suggestions');
        assert(response.data.suggestions.length > 0, 'Should return some trending suggestions');
    }

    /**
     * Test caching functionality
     */
    async testCaching() {
        const query = `q=cachetest${Date.now()}&limit=3`;
        
        // First request - should be cache miss
        const response1 = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?${query}`);
        assert.strictEqual(response1.status, 200, 'First request should succeed');
        assert.strictEqual(response1.data.cache_hit, false, 'First request should be cache miss');
        
        // Second identical request - should be cache hit
        const response2 = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?${query}`);
        assert.strictEqual(response2.status, 200, 'Second request should succeed');
        assert.strictEqual(response2.data.cache_hit, true, 'Second request should be cache hit');
        
        // Results should be identical
        assert.deepStrictEqual(
            response1.data.suggestions, 
            response2.data.suggestions, 
            'Cache hit should return identical suggestions'
        );
    }

    /**
     * Test parameter validation
     */
    async testParameterValidation() {
        // Test negative limit
        const response1 = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=test&limit=-1`);
        assert.strictEqual(response1.status, 200, 'Should handle negative limit gracefully');
        
        // Test very large limit (should be capped)
        const response2 = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=test&limit=1000`);
        assert.strictEqual(response2.status, 200, 'Should handle large limit gracefully');
        assert(response2.data.suggestions.length <= 50, 'Should cap extremely large limits');
    }

    /**
     * Test content type filtering
     */
    async testContentTypeFiltering() {
        // Test ADRs only
        const response1 = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=test&content_type=adrs&limit=5`);
        assert.strictEqual(response1.status, 200, 'ADRs filtering should work');
        
        if (response1.data.suggestions.length > 0) {
            const nonAdrSuggestions = response1.data.suggestions.filter(s => s.type !== 'adr' && s.type !== 'query');
            assert.strictEqual(nonAdrSuggestions.length, 0, 'Should only return ADR suggestions when content_type=adrs');
        }
        
        // Test patterns only
        const response2 = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=pattern&content_type=patterns&limit=5`);
        assert.strictEqual(response2.status, 200, 'Patterns filtering should work');
        
        if (response2.data.suggestions.length > 0) {
            const nonPatternSuggestions = response2.data.suggestions.filter(s => s.type !== 'pattern' && s.type !== 'query');
            assert.strictEqual(nonPatternSuggestions.length, 0, 'Should only return pattern suggestions when content_type=patterns');
        }
    }

    /**
     * Test analytics endpoint
     */
    async testAnalyticsEndpoint() {
        const response = await axios.get(`${this.baseURL}/api/search/autocomplete/analytics`);
        
        assert.strictEqual(response.status, 200, 'Analytics endpoint should be accessible');
        assert(response.data.success, 'Analytics response should be successful');
        assert(typeof response.data.cache_stats === 'object', 'Should include cache statistics');
        assert(typeof response.data.cache_stats.cache_size === 'number', 'Cache size should be a number');
        assert(Array.isArray(response.data.daily_statistics), 'Daily statistics should be an array');
        assert(Array.isArray(response.data.popular_queries), 'Popular queries should be an array');
    }

    /**
     * Test health check endpoint
     */
    async testHealthCheck() {
        const response = await axios.get(`${this.baseURL}/api/search/autocomplete/health`);
        
        assert.strictEqual(response.status, 200, 'Health check should return 200');
        assert(response.data.success, 'Health check should indicate success');
        assert(typeof response.data.initialized === 'boolean', 'Should report initialization status');
        assert(typeof response.data.cache_size === 'number', 'Should report cache size');
    }

    /**
     * Test performance and response time
     */
    async testPerformance() {
        const maxResponseTime = 2000; // 2 seconds max
        const startTime = performance.now();
        
        const response = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=performance&include_semantic=true&include_trending=true&limit=10`);
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        assert.strictEqual(response.status, 200, 'Performance test request should succeed');
        assert(responseTime < maxResponseTime, `Response time (${Math.round(responseTime)}ms) should be under ${maxResponseTime}ms`);
        
        // Check that all requested features are included
        assert(response.data.response_features.semantic_enabled, 'Semantic search should be enabled');
        assert(response.data.response_features.trending_enabled, 'Trending should be enabled');
    }

    /**
     * Test error handling and resilience
     */
    async testErrorHandling() {
        // Test with malformed parameters
        const response1 = await axios.get(`${this.baseURL}/api/search/autocomplete/intelligent?q=test&include_semantic=invalid&limit=abc`);
        assert.strictEqual(response1.status, 200, 'Should handle malformed parameters gracefully');
        
        // Should still return valid response structure
        assert(response1.data.success, 'Should maintain success status despite malformed params');
        assert(Array.isArray(response1.data.suggestions), 'Should still return suggestions array');
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('\n🚀 Starting Intelligent Autocomplete Test Suite');
        console.log('=' .repeat(60));
        
        const startTime = performance.now();
        
        await this.runTest('Basic Connectivity', () => this.testBasicConnectivity());
        await this.runTest('Endpoint Accessibility', () => this.testEndpointAccessibility());
        await this.runTest('Direct Text Matching', () => this.testDirectMatching());
        await this.runTest('Semantic Search', () => this.testSemanticSearch());
        await this.runTest('Trending Suggestions', () => this.testTrendingSuggestions());
        await this.runTest('Empty Query Handling', () => this.testEmptyQuery());
        await this.runTest('Caching Functionality', () => this.testCaching());
        await this.runTest('Parameter Validation', () => this.testParameterValidation());
        await this.runTest('Content Type Filtering', () => this.testContentTypeFiltering());
        await this.runTest('Analytics Endpoint', () => this.testAnalyticsEndpoint());
        await this.runTest('Health Check', () => this.testHealthCheck());
        await this.runTest('Performance & Response Time', () => this.testPerformance());
        await this.runTest('Error Handling', () => this.testErrorHandling());
        
        const endTime = performance.now();
        const totalTime = Math.round(endTime - startTime);
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 Test Suite Results:');
        console.log(`   Total Tests: ${this.testResults.total}`);
        console.log(`   ✅ Passed: ${this.testResults.passed}`);
        console.log(`   ❌ Failed: ${this.testResults.failed}`);
        console.log(`   ⏱️  Total Time: ${totalTime}ms`);
        console.log(`   📈 Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.details
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`   • ${test.name}: ${test.error}`);
                });
        }
        
        console.log('\n🎯 Intelligent Autocomplete Test Suite Complete!');
        
        // Return summary for external use
        return {
            success: this.testResults.failed === 0,
            summary: {
                total: this.testResults.total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                duration: `${totalTime}ms`,
                successRate: `${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`
            },
            details: this.testResults.details
        };
    }
}

// Export for external use
module.exports = IntelligentAutocompleteTestSuite;

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new IntelligentAutocompleteTestSuite();
    
    testSuite.runAllTests()
        .then((results) => {
            if (!results.success) {
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('❌ Test suite crashed:', error.message);
            process.exit(1);
        });
}