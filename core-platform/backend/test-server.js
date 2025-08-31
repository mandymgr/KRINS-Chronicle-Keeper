/**
 * Test Server for Backend API Validation
 * Runs without database for testing API endpoints
 */

const express = require('express');
const cors = require('cors');

class TestDevMemoryServer {
    constructor(options = {}) {
        this.app = express();
        this.port = options.port || 3003;
        this.server = null;
        
        this.setupMiddleware();
        this.setupTestRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
            credentials: true
        }));

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
            });
            next();
        });
    }

    setupTestRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                version: '1.1.0',
                environment: 'test',
                services: {
                    api: true,
                    database: false,
                    embeddings: false,
                    vector_search: false,
                    performance_monitoring: false
                },
                mode: 'test_validation'
            });
        });

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                name: 'Dev Memory OS Semantic Search API - TEST MODE',
                version: '1.1.0',
                mode: 'test_validation',
                description: 'API structure validation without database',
                endpoints: {
                    system: {
                        health: 'GET /health',
                        docs: 'GET /'
                    },
                    search: {
                        semantic: 'POST /api/search/semantic',
                        hybrid: 'POST /api/search/hybrid',
                        similar_adrs: 'GET /api/search/similar/:adr-id',
                        autocomplete: 'GET /api/search/autocomplete',
                        analytics: 'GET /api/search/analytics',
                        health: 'GET /api/search/health'
                    },
                    embeddings: {
                        batch_process: 'POST /api/embeddings/process',
                        single_process: 'POST /api/embeddings/process/single',
                        jobs: 'GET /api/embeddings/jobs',
                        job_status: 'GET /api/embeddings/jobs/:jobId'
                    },
                    patterns: {
                        recommend: 'GET /api/patterns/recommend',
                        recommend_for_adr: 'GET /api/patterns/recommend-for-adr/:adrId',
                        trending: 'GET /api/patterns/trending'
                    }
                },
                timestamp: new Date().toISOString()
            });
        });

        // Mock Search Endpoints
        this.app.post('/api/search/semantic', (req, res) => {
            const { query, content_types = ['adrs', 'patterns'], max_results = 10 } = req.body;
            
            res.json({
                success: true,
                query,
                content_types,
                results: [
                    {
                        id: 'test-adr-001',
                        title: 'Test Architecture Decision',
                        content: `Sample ADR content matching "${query}"`,
                        type: 'adr',
                        similarity_score: 0.95,
                        created_at: '2025-08-28T10:00:00Z'
                    },
                    {
                        id: 'test-pattern-001',
                        title: 'Test Pattern',
                        content: `Sample pattern content related to "${query}"`,
                        type: 'pattern',
                        similarity_score: 0.89,
                        created_at: '2025-08-28T11:00:00Z'
                    }
                ],
                total_results: 2,
                processing_time_ms: 45,
                search_mode: 'semantic'
            });
        });

        this.app.post('/api/search/hybrid', (req, res) => {
            const { query, search_mode = 'hybrid', max_results = 15 } = req.body;
            
            res.json({
                success: true,
                query,
                search_mode,
                results: [
                    {
                        id: 'hybrid-result-001',
                        title: 'Hybrid Search Result',
                        content: `Combined semantic and keyword result for "${query}"`,
                        type: 'adr',
                        semantic_score: 0.92,
                        keyword_score: 0.87,
                        combined_score: 0.90,
                        created_at: '2025-08-28T12:00:00Z'
                    }
                ],
                total_results: 1,
                processing_time_ms: 67,
                search_modes_used: ['semantic', 'keyword']
            });
        });

        this.app.get('/api/search/similar/:id', (req, res) => {
            const { id } = req.params;
            const { similarity_threshold = 0.7 } = req.query;
            
            res.json({
                success: true,
                source_id: id,
                similarity_threshold: parseFloat(similarity_threshold),
                similar_items: [
                    {
                        id: 'similar-001',
                        title: 'Related Decision',
                        similarity_score: 0.88,
                        type: 'adr'
                    }
                ],
                total_similar: 1,
                processing_time_ms: 23
            });
        });

        this.app.get('/api/search/autocomplete', (req, res) => {
            const { q = '', limit = 10 } = req.query;
            
            res.json({
                success: true,
                query: q,
                suggestions: [
                    `${q} architecture`,
                    `${q} patterns`,
                    `${q} decisions`,
                    `${q} implementation`
                ].slice(0, parseInt(limit)),
                processing_time_ms: 12
            });
        });

        this.app.get('/api/search/analytics', (req, res) => {
            res.json({
                success: true,
                analytics: {
                    total_searches: 1245,
                    avg_response_time_ms: 156,
                    popular_queries: ['authentication', 'microservices', 'database'],
                    search_trends: {
                        semantic: 0.65,
                        hybrid: 0.25,
                        keyword: 0.10
                    }
                },
                timestamp: new Date().toISOString()
            });
        });

        this.app.get('/api/search/health', (req, res) => {
            res.json({
                status: 'ok',
                search_service: 'healthy',
                avg_response_time_ms: 156,
                timestamp: new Date().toISOString()
            });
        });

        // Mock Embedding Endpoints
        this.app.post('/api/embeddings/process', (req, res) => {
            res.json({
                success: true,
                job_id: 'batch-job-' + Date.now(),
                status: 'queued',
                estimated_completion: new Date(Date.now() + 60000).toISOString(),
                message: 'Batch processing job started'
            });
        });

        this.app.post('/api/embeddings/process/single', (req, res) => {
            const { content, type = 'adr' } = req.body;
            res.json({
                success: true,
                content_type: type,
                processing_time_ms: 234,
                embedding_dimensions: 1536,
                message: 'Single document processed successfully'
            });
        });

        this.app.get('/api/embeddings/jobs', (req, res) => {
            res.json({
                success: true,
                jobs: [
                    {
                        id: 'batch-job-001',
                        status: 'completed',
                        created_at: '2025-08-28T10:00:00Z',
                        completed_at: '2025-08-28T10:02:15Z'
                    }
                ]
            });
        });

        this.app.get('/api/embeddings/jobs/:jobId', (req, res) => {
            const { jobId } = req.params;
            res.json({
                success: true,
                job_id: jobId,
                status: 'completed',
                progress: 100,
                created_at: '2025-08-28T10:00:00Z',
                completed_at: '2025-08-28T10:02:15Z'
            });
        });

        // Mock Pattern Endpoints
        this.app.get('/api/patterns/recommend', (req, res) => {
            res.json({
                success: true,
                recommendations: [
                    {
                        id: 'pattern-001',
                        title: 'Microservices Architecture',
                        relevance_score: 0.94,
                        category: 'architecture',
                        usage_count: 156
                    },
                    {
                        id: 'pattern-002',
                        title: 'Event Sourcing',
                        relevance_score: 0.88,
                        category: 'data_management',
                        usage_count: 89
                    }
                ],
                total_recommendations: 2,
                processing_time_ms: 78
            });
        });

        this.app.get('/api/patterns/recommend-for-adr/:adrId', (req, res) => {
            const { adrId } = req.params;
            res.json({
                success: true,
                adr_id: adrId,
                context_recommendations: [
                    {
                        id: 'context-pattern-001',
                        title: 'Context-Aware Pattern',
                        relevance_score: 0.96,
                        reason: 'Highly relevant to the ADR context'
                    }
                ],
                processing_time_ms: 45
            });
        });

        this.app.get('/api/patterns/trending', (req, res) => {
            res.json({
                success: true,
                trending_patterns: [
                    {
                        id: 'trending-001',
                        title: 'AI/ML Integration Pattern',
                        trend_score: 0.98,
                        recent_usage: 45,
                        growth_rate: 0.23
                    }
                ],
                time_period: 'last_30_days',
                processing_time_ms: 34
            });
        });

        // Webhook endpoint
        this.app.post('/webhook/coordinate', (req, res) => {
            const { event, data, source } = req.body;
            res.json({
                success: true,
                event,
                source,
                processed_at: new Date().toISOString(),
                message: 'Coordination event processed in test mode'
            });
        });
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.path,
                method: req.method,
                available_endpoints: '/health, /, /api/search/*, /api/embeddings/*, /api/patterns/*'
            });
        });

        // General error handler
        this.app.use((error, req, res, next) => {
            console.error('Test server error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message,
                mode: 'test_validation'
            });
        });
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, () => {
                console.log('🧪 === TEST MODE BACKEND SERVER STARTED ===');
                console.log(`🌐 Server running on http://localhost:${this.port}`);
                console.log('🔍 Testing all 15 API endpoints');
                console.log('📊 Database: Disabled (Mock responses)');
                console.log('🎯 Ready for comprehensive API testing!');
                resolve();
            });

            this.server.on('error', (error) => {
                console.error('❌ Test server startup error:', error);
                reject(error);
            });
        });
    }

    async stop() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log('🧪 Test server stopped');
                    resolve();
                });
            });
        }
    }
}

// Start test server if run directly
if (require.main === module) {
    const testServer = new TestDevMemoryServer();
    testServer.start().catch(console.error);

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received shutdown signal...');
        await testServer.stop();
        process.exit(0);
    });
}

module.exports = TestDevMemoryServer;