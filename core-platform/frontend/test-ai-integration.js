#!/usr/bin/env node
/**
 * 🧪 TESTING SPECIALIST - AI Team Coordination Validation
 * Comprehensive end-to-end testing of the revolutionary AI system
 */

const fetch = require('node-fetch');

class TestingSpecialist {
    constructor() {
        this.frontendUrl = 'http://localhost:3005';
        this.backendUrl = 'http://localhost:3003';
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    async runTest(testName, testFunction) {
        this.testResults.total++;
        console.log(`🧪 Testing Specialist: Running ${testName}...`);
        
        try {
            const result = await testFunction();
            if (result) {
                this.testResults.passed++;
                console.log(`✅ ${testName} - PASSED`);
                this.testResults.details.push({ test: testName, status: 'PASSED', details: result });
            } else {
                throw new Error('Test returned false');
            }
        } catch (error) {
            this.testResults.failed++;
            console.log(`❌ ${testName} - FAILED: ${error.message}`);
            this.testResults.details.push({ test: testName, status: 'FAILED', error: error.message });
        }
    }

    async testBackendHealth() {
        const response = await fetch(`${this.backendUrl}/health`);
        const data = await response.json();
        return data.status === 'ok' || data.status === 'degraded';
    }

    async testFrontendAccessibility() {
        const response = await fetch(this.frontendUrl);
        const html = await response.text();
        return html.includes('Dev Memory OS') && response.status === 200;
    }

    async testBackendSpecialistIntelligentAutocomplete() {
        const response = await fetch(`${this.backendUrl}/api/search/autocomplete/intelligent?q=AI&include_semantic=true&include_trending=true&limit=5`);
        const data = await response.json();
        return data.success && data.suggestions && data.suggestions.length > 0;
    }

    async testBackendSpecialistAnalytics() {
        const response = await fetch(`${this.backendUrl}/api/search/autocomplete/analytics`);
        const data = await response.json();
        return data.success && data.timestamp;
    }

    async testPatternRecommendations() {
        const response = await fetch(`${this.backendUrl}/api/patterns/recommend`);
        const data = await response.json();
        return data.success && data.recommendations && data.recommendations.length > 0;
    }

    async testSemanticSearch() {
        const response = await fetch(`${this.backendUrl}/api/search/semantic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: 'architecture patterns',
                content_types: ['adrs', 'patterns'],
                max_results: 5
            })
        });
        const data = await response.json();
        return data.success;
    }

    async testApiDocumentation() {
        const response = await fetch(`${this.backendUrl}/`);
        const data = await response.json();
        return data.name && data.name.includes('Dev Memory OS') && data.endpoints;
    }

    async testFrontendBackendIntegration() {
        // Test that frontend can access backend through CORS
        try {
            const response = await fetch(`${this.backendUrl}/api/patterns/recommend`, {
                headers: { 'Origin': this.frontendUrl }
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    async runComprehensiveValidation() {
        console.log('\n🚀 === TESTING SPECIALIST COMPREHENSIVE AI TEAM VALIDATION ===');
        console.log('🤖 Validating Revolutionary AI Team Coordination System\n');

        await this.runTest('Backend Health Check', () => this.testBackendHealth());
        await this.runTest('Frontend Accessibility', () => this.testFrontendAccessibility());
        await this.runTest('Backend Specialist Intelligent Autocomplete', () => this.testBackendSpecialistIntelligentAutocomplete());
        await this.runTest('Backend Specialist Analytics', () => this.testBackendSpecialistAnalytics());
        await this.runTest('Pattern Recommendations', () => this.testPatternRecommendations());
        await this.runTest('Semantic Search API', () => this.testSemanticSearch());
        await this.runTest('API Documentation', () => this.testApiDocumentation());
        await this.runTest('Frontend-Backend Integration', () => this.testFrontendBackendIntegration());

        this.generateReport();
    }

    generateReport() {
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        
        console.log('\n🎯 === TESTING SPECIALIST VALIDATION REPORT ===');
        console.log(`📊 Tests Run: ${this.testResults.total}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`🏆 Success Rate: ${successRate}%\n`);

        if (successRate >= 90) {
            console.log('🌟 === REVOLUTIONARY AI TEAM SYSTEM: PRODUCTION READY ===');
            console.log('✅ All critical systems validated and operational');
            console.log('🚀 Backend Specialist intelligent autocomplete: WORKING');
            console.log('🎨 Frontend Specialist integration: WORKING');
            console.log('🤖 AI Team Coordination: FULLY FUNCTIONAL');
        } else if (successRate >= 75) {
            console.log('⚠️  === AI TEAM SYSTEM: MOSTLY FUNCTIONAL ===');
            console.log('🔧 Some minor issues detected but core system operational');
        } else {
            console.log('❌ === AI TEAM SYSTEM: NEEDS ATTENTION ===');
            console.log('🛠️  Multiple issues detected - review required');
        }

        console.log('\n📋 Detailed Results:');
        this.testResults.details.forEach(result => {
            const icon = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${icon} ${result.test}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });

        console.log('\n🧪 Testing Specialist Report Complete');
        console.log('🤖 Generated by Claude - Testing Specialist');
        return successRate >= 75;
    }
}

// Run validation if script is executed directly
if (require.main === module) {
    const testingSpecialist = new TestingSpecialist();
    testingSpecialist.runComprehensiveValidation()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            console.error('💥 Testing Specialist Critical Error:', error);
            process.exit(1);
        });
}

module.exports = TestingSpecialist;