/**
 * 🧠 KRINS Revolutionary Semantic Search Backend
 * Advanced AI memory system with pgvector and TensorFlow integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createLogger, format, transports } from 'winston';
import { SemanticSearchEngine } from './semantic-engine.js';
import { MemoryStore } from './memory-store.js';
import { PatternMatcher } from './pattern-matcher.js';
import { validateSearchQuery, validateMemoryItem } from './validators.js';

// Integration with existing KRINS systems
const MCP_AI_TEAM_SERVER = 'http://localhost:3006';
const FASTAPI_BACKEND = 'http://localhost:8000';

class KRINSSemanticSearchServer {
  constructor(port = 3003) {
    this.port = port;
    this.app = express();
    
    // Initialize core components
    this.semanticEngine = new SemanticSearchEngine();
    this.memoryStore = new MemoryStore();
    this.patternMatcher = new PatternMatcher();
    
    // Setup logging
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/semantic-search.log' })
      ]
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware for security and performance
   */
  setupMiddleware() {
    // Security
    this.app.use(helmet());
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: {
        error: 'Too many requests from this IP',
        retry_after: '15 minutes'
      }
    });
    this.app.use(limiter);

    // CORS for integration with all KRINS systems
    this.app.use(cors({
      origin: [
        'http://localhost:3000', // React frontend
        'http://localhost:5173', // Vite dev server
        'http://localhost:8000', // FastAPI backend
        'http://localhost:3006', // MCP AI Team server
        /^https:\/\/.*\.vercel\.app$/, // Vercel deployments
        /^https:\/\/.*\.netlify\.app$/ // Netlify deployments
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.info(`${req.method} ${req.path}`, {
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip
        });
      });
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'KRINS Semantic Search Backend',
        version: '1.0.0',
        components: {
          semantic_engine: this.semanticEngine.isReady(),
          memory_store: this.memoryStore.isConnected(),
          pattern_matcher: true
        },
        timestamp: new Date().toISOString()
      });
    });

    // Semantic search endpoint
    this.app.post('/api/search/semantic', validateSearchQuery, async (req, res) => {
      try {
        const { query, filters = {}, limit = 10, threshold = 0.7 } = req.body;
        
        this.logger.info('Semantic search request', { query, filters, limit });
        
        // Generate embeddings and search
        const results = await this.semanticEngine.search(query, {
          filters,
          limit,
          similarity_threshold: threshold
        });

        // Apply pattern matching for enhanced results
        const enrichedResults = await this.patternMatcher.enrichResults(results, query);

        res.json({
          success: true,
          query,
          results: enrichedResults,
          total_found: results.length,
          search_time: results.search_time,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Semantic search error', { error: error.message, query: req.body.query });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Store new memory/pattern
    this.app.post('/api/memory/store', validateMemoryItem, async (req, res) => {
      try {
        const { content, type, metadata = {}, tags = [] } = req.body;
        
        this.logger.info('Storing memory item', { type, tags });
        
        // Generate embeddings
        const embedding = await this.semanticEngine.generateEmbedding(content);
        
        // Store in memory with embeddings
        const memoryId = await this.memoryStore.store({
          content,
          type,
          embedding,
          metadata: {
            ...metadata,
            stored_at: new Date().toISOString(),
            source: 'api'
          },
          tags
        });

        res.json({
          success: true,
          memory_id: memoryId,
          message: 'Memory item stored successfully',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Memory storage error', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Get memory by ID
    this.app.get('/api/memory/:id', async (req, res) => {
      try {
        const memory = await this.memoryStore.get(req.params.id);
        
        if (!memory) {
          return res.status(404).json({
            success: false,
            error: 'Memory not found',
            timestamp: new Date().toISOString()
          });
        }

        res.json({
          success: true,
          memory,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Memory retrieval error', { error: error.message, id: req.params.id });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // AI Pattern matching endpoint
    this.app.post('/api/patterns/match', async (req, res) => {
      try {
        const { code, context, language = 'typescript' } = req.body;
        
        if (!code) {
          return res.status(400).json({
            success: false,
            error: 'Code is required',
            timestamp: new Date().toISOString()
          });
        }

        this.logger.info('Pattern matching request', { language, context });
        
        const patterns = await this.patternMatcher.findPatterns(code, {
          language,
          context
        });

        res.json({
          success: true,
          patterns,
          total_patterns: patterns.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Pattern matching error', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // AI Team integration - sync patterns from MCP AI Team
    this.app.post('/api/ai-team/sync', async (req, res) => {
      try {
        const { specialist_id, patterns, context } = req.body;
        
        this.logger.info('AI Team sync request', { specialist_id, patterns_count: patterns?.length });
        
        // Store patterns from AI specialists
        const syncResults = await Promise.all(
          patterns.map(pattern => this.memoryStore.store({
            content: pattern.code || pattern.description,
            type: 'ai_pattern',
            metadata: {
              specialist_id,
              context,
              pattern_type: pattern.type,
              synced_at: new Date().toISOString()
            },
            tags: ['ai-generated', `specialist-${specialist_id}`, context]
          }))
        );

        res.json({
          success: true,
          message: `Synced ${syncResults.length} patterns from AI specialist`,
          sync_results: syncResults,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('AI Team sync error', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Analytics endpoint
    this.app.get('/api/analytics', async (req, res) => {
      try {
        const analytics = await this.memoryStore.getAnalytics();
        
        res.json({
          success: true,
          analytics: {
            ...analytics,
            semantic_engine_stats: await this.semanticEngine.getStats(),
            pattern_matcher_stats: await this.patternMatcher.getStats()
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Analytics error', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      this.logger.error('Unhandled error', { error: error.message, path: req.path });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
        available_endpoints: [
          'GET /health',
          'POST /api/search/semantic',
          'POST /api/memory/store',
          'GET /api/memory/:id',
          'POST /api/patterns/match',
          'POST /api/ai-team/sync',
          'GET /api/analytics'
        ],
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Initialize all components
   */
  async initialize() {
    this.logger.info('Initializing KRINS Semantic Search Backend...');
    
    try {
      // Initialize semantic engine (TensorFlow model loading)
      await this.semanticEngine.initialize();
      this.logger.info('Semantic engine initialized');
      
      // Initialize memory store (PostgreSQL with pgvector)
      await this.memoryStore.initialize();
      this.logger.info('Memory store connected');
      
      // Initialize pattern matcher
      await this.patternMatcher.initialize();
      this.logger.info('Pattern matcher ready');
      
    } catch (error) {
      this.logger.error('Initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Initialize components first
      await this.initialize();
      
      return new Promise((resolve, reject) => {
        this.server = this.app.listen(this.port, (error) => {
          if (error) {
            reject(error);
          } else {
            this.logger.info('🧠════════════════════════════════════════════════════════════');
            this.logger.info('🧠  KRINS Revolutionary Semantic Search Backend');
            this.logger.info('🧠════════════════════════════════════════════════════════════');
            this.logger.info(`🧠  Server running on port ${this.port}`);
            this.logger.info(`🧠  Health check: http://localhost:${this.port}/health`);
            this.logger.info(`🧠  API endpoint: http://localhost:${this.port}/api`);
            this.logger.info(`🧠  Integration: MCP AI Team (${MCP_AI_TEAM_SERVER})`);
            this.logger.info(`🧠  Integration: FastAPI (${FASTAPI_BACKEND})`);
            this.logger.info('🧠════════════════════════════════════════════════════════════');
            resolve(this.server);
          }
        });
      });
      
    } catch (error) {
      this.logger.error('Failed to start server', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop the server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('🧠 KRINS Semantic Search Backend stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new KRINSSemanticSearchServer();
  
  server.start().then(() => {
    console.log('🧠 KRINS Semantic Search Backend started successfully!');
  }).catch((error) => {
    console.error('❌ Failed to start KRINS Semantic Search Backend:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🧠 Shutting down KRINS Semantic Search Backend...');
    await server.stop();
    process.exit(0);
  });
}

export { KRINSSemanticSearchServer };