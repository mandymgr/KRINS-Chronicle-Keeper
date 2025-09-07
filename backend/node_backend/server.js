/**
 * Dev Memory OS Semantic Search Server
 * Main Express server with pgvector semantic search capabilities
 * Integrates with Krin's AI coordination system
 */

const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database/connection');

// API Routes
const searchRoutes = require('./api/search/semantic-search');
const embeddingRoutes = require('./api/embeddings/batch-processor');
const patternRoutes = require('./api/patterns/recommendations');

class DevMemoryServer {
    constructor(options = {}) {
        this.app = express();
        this.port = options.port || process.env.PORT || 3003; // Different from webhook port 3002
        this.db = null;
        this.server = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // CORS - Allow requests from webhook system and frontend
        this.app.use(cors({
            origin: [
                'http://localhost:3002', // Webhook system
                'http://localhost:3000', // Frontend dev
                'http://localhost:8080', // Alternative frontend
                /^https:\/\/.*\.vercel\.app$/, // Vercel deployments
                /^https:\/\/.*\.netlify\.app$/ // Netlify deployments
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
            credentials: true
        }));

        // Body parsing
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

        // API Key authentication middleware (optional)
        this.app.use('/api', (req, res, next) => {
            const apiKey = req.headers['x-api-key'] || req.query.api_key;
            
            // For now, allow requests without API key in development
            if (process.env.NODE_ENV === 'production' && process.env.API_KEY) {
                if (!apiKey || apiKey !== process.env.API_KEY) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Valid API key required',
                        code: 'INVALID_API_KEY'
                    });
                }
            }
            
            next();
        });
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                const dbHealth = this.db ? await this.db.isHealthy() : false;
                const openaiConfigured = !!process.env.OPENAI_API_KEY;
                
                res.json({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0',
                    services: {
                        database: dbHealth,
                        embeddings: openaiConfigured,
                        api: true
                    },
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    port: this.port
                });
            } catch (error) {
                res.status(503).json({
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Root endpoint with API documentation
        this.app.get('/', (req, res) => {
            res.json({
                name: 'Dev Memory OS Semantic Search API',
                version: '1.0.0',
                description: 'Revolutionary AI-powered semantic search for ADRs, patterns, and development knowledge',
                krin_coordination: 'Integrated with Krin AI Team Commander',
                endpoints: {
                    health: 'GET /health',
                    search: {
                        semantic: 'POST /api/search/semantic',
                        similar_adrs: 'GET /api/search/similar/:adr-id',
                        analytics: 'GET /api/search/analytics'
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
                documentation: 'https://github.com/mandymgr/Krins-Dev-Memory-OS',
                webhook_integration: `http://localhost:3002`,
                timestamp: new Date().toISOString()
            });
        });

        // API Routes
        this.app.use('/api/search', searchRoutes);
        this.app.use('/api/embeddings', embeddingRoutes);
        this.app.use('/api/patterns', patternRoutes);

        // Webhook integration endpoint for coordination with port 3002
        this.app.post('/webhook/coordinate', async (req, res) => {
            try {
                const { event, data, source } = req.body;
                
                console.log(`Received coordination event: ${event} from ${source}`);
                
                // Handle different coordination events
                switch (event) {
                    case 'new_adr_created':
                        await this.handleNewADRCreated(data);
                        break;
                    case 'adr_updated':
                        await this.handleADRUpdated(data);
                        break;
                    case 'pattern_used':
                        await this.handlePatternUsed(data);
                        break;
                    default:
                        console.log(`Unknown coordination event: ${event}`);
                }

                res.json({
                    success: true,
                    event,
                    processed_at: new Date().toISOString(),
                    message: 'Coordination event processed successfully'
                });

            } catch (error) {
                console.error('Webhook coordination error:', error);
                res.status(500).json({
                    error: 'Failed to process coordination event',
                    message: error.message,
                    code: 'COORDINATION_ERROR'
                });
            }
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.path,
                method: req.method,
                available_endpoints: [
                    'GET /',
                    'GET /health',
                    'POST /api/search/semantic',
                    'GET /api/search/similar/:adr-id',
                    'POST /api/embeddings/process',
                    'GET /api/patterns/recommend'
                ],
                code: 'ENDPOINT_NOT_FOUND'
            });
        });
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);
            
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                timestamp: new Date().toISOString(),
                request_id: req.headers['x-request-id'] || 'unknown',
                code: 'INTERNAL_ERROR'
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.gracefulShutdown('uncaughtException');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.gracefulShutdown('unhandledRejection');
        });

        // Handle SIGTERM (Docker/K8s shutdown)
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            this.gracefulShutdown('SIGTERM');
        });

        // Handle SIGINT (Ctrl+C)
        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully');
            this.gracefulShutdown('SIGINT');
        });
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Dev Memory OS Semantic Search Server...');
            
            // Initialize database connection
            this.db = await initializeDatabase();
            console.log('✅ Database connection established');

            // Verify OpenAI API key
            if (!process.env.OPENAI_API_KEY) {
                console.warn('⚠️  OpenAI API key not configured - embedding features will not work');
            } else {
                console.log('✅ OpenAI API key configured');
            }

            console.log('✅ Dev Memory OS Semantic Search Server initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize server:', error);
            throw error;
        }
    }

    async start() {
        try {
            await this.initialize();
            
            this.server = this.app.listen(this.port, () => {
                console.log('\n🌟 === DEV MEMORY OS SEMANTIC SEARCH SERVER STARTED ===');
                console.log(`🔗 Server URL: http://localhost:${this.port}`);
                console.log(`🔍 API Base: http://localhost:${this.port}/api`);
                console.log(`💖 Health Check: http://localhost:${this.port}/health`);
                console.log(`🤝 Webhook Integration: Port 3002 coordination enabled`);
                console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log('🎯 Ready for revolutionary semantic search! 🚀');
                console.log('='.repeat(60));
            });

            return this.server;
            
        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }

    async gracefulShutdown(signal) {
        console.log(`\n🛑 Graceful shutdown initiated by ${signal}`);
        
        if (this.server) {
            console.log('🔄 Closing HTTP server...');
            this.server.close(async (err) => {
                if (err) {
                    console.error('❌ Error closing server:', err);
                } else {
                    console.log('✅ HTTP server closed');
                }

                // Close database connections
                if (this.db) {
                    console.log('🔄 Closing database connections...');
                    try {
                        await this.db.close();
                        console.log('✅ Database connections closed');
                    } catch (dbError) {
                        console.error('❌ Error closing database:', dbError);
                    }
                }

                console.log('👋 Dev Memory OS Semantic Search Server shut down gracefully');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    }

    // Webhook coordination handlers

    async handleNewADRCreated(data) {
        console.log('📝 Processing new ADR for embedding generation...');
        // TODO: Automatically generate embedding for new ADR
        // This could trigger the batch processor or direct embedding generation
    }

    async handleADRUpdated(data) {
        console.log('🔄 Processing ADR update for embedding regeneration...');
        // TODO: Update embedding if ADR content changed significantly
    }

    async handlePatternUsed(data) {
        console.log('📊 Recording pattern usage for recommendations...');
        // TODO: Update pattern usage statistics
    }
}

// Start server if this file is run directly
if (require.main === module) {
    const server = new DevMemoryServer();
    
    server.start().catch(error => {
        console.error('💥 Fatal error starting server:', error);
        process.exit(1);
    });
}

module.exports = DevMemoryServer;