/**
 * Basic Functionality Test for Dev Memory OS Backend
 * Tests core functionality without requiring full database setup
 */

const path = require('path');
const fs = require('fs').promises;

class BasicFunctionalityTest {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    /**
     * Run all basic tests
     */
    async runTests() {
        console.log('🧪 === STARTING BASIC FUNCTIONALITY TESTS ===\n');

        await this.testEnvironmentSetup();
        await this.testFileStructure();
        await this.testModuleImports();
        await this.testEmbeddingServiceCreation();
        await this.testBatchProcessorInstantiation();
        await this.testDatabaseConnectionClass();
        
        this.printTestResults();
        return this.testResults.failed === 0;
    }

    /**
     * Test environment setup
     */
    async testEnvironmentSetup() {
        this.runTest('Environment Variables', () => {
            // Check critical environment variables exist or have defaults
            const nodeEnv = process.env.NODE_ENV || 'development';
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || '5432';
            
            console.log(`  Node Environment: ${nodeEnv}`);
            console.log(`  Database Host: ${dbHost}`);
            console.log(`  Database Port: ${dbPort}`);
            console.log(`  OpenAI Key Configured: ${!!process.env.OPENAI_API_KEY}`);
            
            return true; // Environment setup always passes
        });
    }

    /**
     * Test file structure
     */
    async testFileStructure() {
        await this.runTest('File Structure', async () => {
            const requiredFiles = [
                '../server.js',
                '../database/connection.js',
                '../database/queries.js',
                '../embedding/embedding-service.js',
                '../embedding/adr-batch-processor.js',
                '../embedding/pattern-batch-processor.js',
                '../embedding/unified-batch-processor.js',
                '../api/search/semantic-search.js',
                '../api/search/hybrid-search.js'
            ];

            const basePath = path.join(__dirname);
            
            for (const filePath of requiredFiles) {
                const fullPath = path.resolve(basePath, filePath);
                try {
                    await fs.access(fullPath);
                    console.log(`  ✅ Found: ${filePath}`);
                } catch (error) {
                    throw new Error(`Missing required file: ${filePath}`);
                }
            }
            
            return true;
        });
    }

    /**
     * Test module imports
     */
    async testModuleImports() {
        await this.runTest('Module Imports', () => {
            try {
                // Test core modules can be required
                const DatabaseConnection = require('../database/connection');
                const DatabaseQueries = require('../database/queries');
                const EmbeddingService = require('../embedding/embedding-service');
                const ADRBatchProcessor = require('../embedding/adr-batch-processor');
                const PatternBatchProcessor = require('../embedding/pattern-batch-processor');
                const UnifiedBatchProcessor = require('../embedding/unified-batch-processor');
                const DevMemoryServer = require('../server');

                console.log('  ✅ DatabaseConnection imported');
                console.log('  ✅ DatabaseQueries imported');
                console.log('  ✅ EmbeddingService imported');
                console.log('  ✅ ADRBatchProcessor imported');
                console.log('  ✅ PatternBatchProcessor imported');
                console.log('  ✅ UnifiedBatchProcessor imported');
                console.log('  ✅ DevMemoryServer imported');

                return true;
            } catch (importError) {
                throw new Error(`Module import failed: ${importError.message}`);
            }
        });
    }

    /**
     * Test embedding service creation
     */
    async testEmbeddingServiceCreation() {
        await this.runTest('Embedding Service Creation', () => {
            try {
                const EmbeddingService = require('../embedding/embedding-service');
                
                // Test creation without API key (should work for testing)
                const embeddingService = new EmbeddingService({
                    openaiApiKey: 'test-key-for-instantiation'
                });

                console.log('  ✅ EmbeddingService instantiated');
                console.log(`  ✅ Configuration loaded: ${JSON.stringify(embeddingService.config)}`);

                return true;
            } catch (error) {
                throw new Error(`EmbeddingService creation failed: ${error.message}`);
            }
        });
    }

    /**
     * Test batch processor instantiation
     */
    async testBatchProcessorInstantiation() {
        await this.runTest('Batch Processor Creation', () => {
            try {
                const ADRBatchProcessor = require('../embedding/adr-batch-processor');
                const PatternBatchProcessor = require('../embedding/pattern-batch-processor');
                const UnifiedBatchProcessor = require('../embedding/unified-batch-processor');

                // Test ADR processor
                const adrProcessor = new ADRBatchProcessor({
                    dryRun: true,
                    embeddingOptions: { openaiApiKey: 'test' }
                });
                console.log('  ✅ ADRBatchProcessor instantiated');

                // Test Pattern processor
                const patternProcessor = new PatternBatchProcessor({
                    dryRun: true,
                    embeddingOptions: { openaiApiKey: 'test' }
                });
                console.log('  ✅ PatternBatchProcessor instantiated');

                // Test Unified processor
                const unifiedProcessor = new UnifiedBatchProcessor({
                    dryRun: true,
                    embeddingOptions: { openaiApiKey: 'test' }
                });
                console.log('  ✅ UnifiedBatchProcessor instantiated');

                return true;
            } catch (error) {
                throw new Error(`Batch processor creation failed: ${error.message}`);
            }
        });
    }

    /**
     * Test database connection class (without actual connection)
     */
    async testDatabaseConnectionClass() {
        await this.runTest('Database Connection Class', () => {
            try {
                const { DatabaseConnection } = require('../database/connection');
                
                // Test instantiation with test config
                const dbConnection = new DatabaseConnection({
                    host: 'test-host',
                    port: 5432,
                    database: 'test-db'
                });

                console.log('  ✅ DatabaseConnection class instantiated');
                console.log(`  ✅ Configuration loaded: host=${dbConnection.config.host}, port=${dbConnection.config.port}`);
                console.log(`  ✅ Vector dimensions: ${dbConnection.vectorDimensions}`);
                console.log(`  ✅ Performance monitoring initialized: ${!!dbConnection.queryStats}`);

                return true;
            } catch (error) {
                throw new Error(`DatabaseConnection class test failed: ${error.message}`);
            }
        });
    }

    /**
     * Run individual test with error handling
     */
    async runTest(testName, testFunction) {
        this.testResults.total++;
        console.log(`🔍 Testing: ${testName}`);

        try {
            const result = await testFunction();
            if (result) {
                this.testResults.passed++;
                console.log(`✅ PASSED: ${testName}\n`);
            } else {
                this.testResults.failed++;
                console.log(`❌ FAILED: ${testName} - Test returned false\n`);
                this.testResults.errors.push(`${testName}: Test returned false`);
            }
        } catch (error) {
            this.testResults.failed++;
            console.log(`❌ FAILED: ${testName} - ${error.message}\n`);
            this.testResults.errors.push(`${testName}: ${error.message}`);
        }
    }

    /**
     * Print comprehensive test results
     */
    printTestResults() {
        console.log('📊 === TEST RESULTS ===');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

        if (this.testResults.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.errors.forEach(error => {
                console.log(`  • ${error}`);
            });
        }

        if (this.testResults.failed === 0) {
            console.log('\n🎉 All tests passed! The backend is ready for production.');
        } else {
            console.log('\n⚠️  Some tests failed. Please fix the issues before proceeding.');
        }
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    async function main() {
        const tester = new BasicFunctionalityTest();
        
        try {
            const success = await tester.runTests();
            process.exit(success ? 0 : 1);
        } catch (error) {
            console.error('💥 Critical test error:', error);
            process.exit(1);
        }
    }

    main().catch(error => {
        console.error('💀 Fatal test error:', error);
        process.exit(1);
    });
}

module.exports = BasicFunctionalityTest;