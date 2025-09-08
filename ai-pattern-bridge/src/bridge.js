/**
 * 🌉 KRINS AI Pattern Bridge
 * Revolutionary AI-to-AI communication and coordination system
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import rateLimit from 'express-rate-limit';
import { createLogger, format, transports } from 'winston';
import { PatternCoordinator } from './pattern-coordinator.js';
import { AIMessageRouter } from './message-router.js';
import { CoordinationMemory } from './coordination-memory.js';
import { EventBus } from './event-bus.js';
import { validateBridgeRequest } from './validators.js';

// Integration endpoints
const MCP_AI_TEAM_SERVER = 'http://localhost:3006';
const SEMANTIC_SEARCH_SERVER = 'http://localhost:3003';
const FASTAPI_BACKEND = 'http://localhost:8000';

class KRINSAIPatternBridge {
  constructor(port = 3007) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.wsServer = null;
    this.clients = new Map(); // AI system connections
    
    // Initialize core components
    this.patternCoordinator = new PatternCoordinator();
    this.messageRouter = new AIMessageRouter();
    this.coordinationMemory = new CoordinationMemory();
    this.eventBus = new EventBus();
    
    // AI system registry
    this.aiSystems = new Map();
    this.coordinationSessions = new Map();
    
    // Setup logging
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [AI-Bridge] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/ai-pattern-bridge.log' })
      ]
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventHandlers();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security
    this.app.use(helmet());
    
    // Rate limiting for AI systems
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 500, // Higher limit for AI systems
      message: {
        error: 'Too many requests from this AI system',
        retry_after: '1 minute'
      }
    });
    this.app.use(limiter);

    // CORS for all KRINS systems
    this.app.use(cors({
      origin: [
        'http://localhost:3000', // React frontend
        'http://localhost:5173', // Vite dev server
        'http://localhost:8000', // FastAPI backend
        'http://localhost:3006', // MCP AI Team server
        'http://localhost:3003', // Semantic search server
        /^https:\/\/.*\.vercel\.app$/, // Vercel deployments
        /^https:\/\/.*\.netlify\.app$/ // Netlify deployments
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-AI-System-ID', 'X-Coordination-ID'],
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
          ai_system: req.headers['x-ai-system-id'] || 'unknown'
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
        service: 'KRINS AI Pattern Bridge',
        version: '1.0.0',
        components: {
          pattern_coordinator: this.patternCoordinator.isReady(),
          message_router: this.messageRouter.isReady(),
          coordination_memory: this.coordinationMemory.isReady(),
          event_bus: this.eventBus.isReady()
        },
        connected_ai_systems: this.aiSystems.size,
        active_sessions: this.coordinationSessions.size,
        timestamp: new Date().toISOString()
      });
    });

    // Register AI system
    this.app.post('/api/ai-systems/register', validateBridgeRequest, async (req, res) => {
      try {
        const {
          system_id,
          system_name,
          capabilities,
          endpoint,
          system_type = 'specialist'
        } = req.body;

        const aiSystem = {
          id: system_id,
          name: system_name,
          type: system_type,
          capabilities: capabilities || [],
          endpoint,
          registered_at: new Date(),
          last_seen: new Date(),
          status: 'active'
        };

        this.aiSystems.set(system_id, aiSystem);
        
        // Notify other systems of new registration
        this.eventBus.emit('ai-system-registered', aiSystem);

        this.logger.info('AI system registered', {
          system_id,
          system_name,
          capabilities: capabilities?.length || 0
        });

        res.json({
          success: true,
          message: `AI system ${system_name} registered successfully`,
          system_id,
          bridge_capabilities: this.getBridgeCapabilities(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('AI system registration failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Start coordination session
    this.app.post('/api/coordination/start', async (req, res) => {
      try {
        const {
          coordinator_id,
          project_description,
          required_capabilities = [],
          coordination_type = 'project'
        } = req.body;

        const session = await this.patternCoordinator.startCoordinationSession({
          coordinator_id,
          project_description,
          required_capabilities,
          coordination_type,
          ai_systems: Array.from(this.aiSystems.values())
        });

        this.coordinationSessions.set(session.id, session);

        // Broadcast session start to relevant AI systems
        await this.broadcastToCapableSystems('coordination-session-started', session, required_capabilities);

        this.logger.info('Coordination session started', {
          session_id: session.id,
          coordinator_id,
          required_capabilities
        });

        res.json({
          success: true,
          session,
          participating_systems: session.participating_systems,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Failed to start coordination session', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Route message between AI systems
    this.app.post('/api/messages/route', async (req, res) => {
      try {
        const {
          from_system,
          to_system,
          message_type,
          content,
          coordination_session_id,
          priority = 'normal'
        } = req.body;

        const routedMessage = await this.messageRouter.routeMessage({
          from: from_system,
          to: to_system,
          type: message_type,
          content,
          session_id: coordination_session_id,
          priority,
          timestamp: new Date()
        });

        // Store in coordination memory
        await this.coordinationMemory.storeMessage(routedMessage);

        // Broadcast via WebSocket if target system is connected
        this.broadcastToSystem(to_system, 'ai-message', routedMessage);

        this.logger.info('Message routed between AI systems', {
          from: from_system,
          to: to_system,
          type: message_type,
          session_id: coordination_session_id
        });

        res.json({
          success: true,
          message_id: routedMessage.id,
          delivery_status: 'routed',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Message routing failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Synchronize patterns across AI systems
    this.app.post('/api/patterns/sync', async (req, res) => {
      try {
        const {
          source_system,
          patterns,
          target_systems = [],
          sync_type = 'broadcast'
        } = req.body;

        const syncResult = await this.patternCoordinator.syncPatterns({
          source: source_system,
          patterns,
          targets: target_systems.length > 0 ? target_systems : Array.from(this.aiSystems.keys()),
          sync_type
        });

        // Store synchronized patterns
        await this.coordinationMemory.storePatternSync(syncResult);

        // Broadcast to semantic search backend for persistent storage
        await this.notifySemanticSearch('patterns-synchronized', syncResult);

        this.logger.info('Patterns synchronized', {
          source: source_system,
          patterns_count: patterns.length,
          targets: syncResult.targets.length
        });

        res.json({
          success: true,
          sync_result: syncResult,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Pattern synchronization failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Get coordination status
    this.app.get('/api/coordination/status', async (req, res) => {
      try {
        const status = {
          bridge_status: 'active',
          connected_systems: Array.from(this.aiSystems.values()),
          active_sessions: Array.from(this.coordinationSessions.values()),
          message_stats: await this.messageRouter.getStats(),
          pattern_stats: await this.patternCoordinator.getStats(),
          memory_stats: await this.coordinationMemory.getStats()
        };

        res.json({
          success: true,
          status,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Failed to get coordination status', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Complete coordination session
    this.app.post('/api/coordination/:session_id/complete', async (req, res) => {
      try {
        const { session_id } = req.params;
        const { results, summary } = req.body;

        const session = this.coordinationSessions.get(session_id);
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Coordination session not found',
            timestamp: new Date().toISOString()
          });
        }

        const completedSession = await this.patternCoordinator.completeSession(session, {
          results,
          summary,
          completion_time: new Date()
        });

        // Archive session
        this.coordinationSessions.delete(session_id);
        await this.coordinationMemory.archiveSession(completedSession);

        // Notify all participating systems
        await this.broadcastToSystems(
          session.participating_systems,
          'coordination-session-completed',
          completedSession
        );

        this.logger.info('Coordination session completed', {
          session_id,
          duration: completedSession.completion_time - session.start_time,
          participating_systems: session.participating_systems.length
        });

        res.json({
          success: true,
          completed_session: completedSession,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Failed to complete coordination session', { error: error.message });
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
          'POST /api/ai-systems/register',
          'POST /api/coordination/start',
          'POST /api/messages/route',
          'POST /api/patterns/sync',
          'GET /api/coordination/status',
          'POST /api/coordination/:session_id/complete'
        ],
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.eventBus.on('ai-system-registered', (system) => {
      this.logger.info('Event: AI system registered', { system_id: system.id });
      this.broadcastToAllSystems('new-ai-system', system);
    });

    this.eventBus.on('coordination-pattern-discovered', (pattern) => {
      this.logger.info('Event: New coordination pattern discovered', { pattern_name: pattern.name });
      this.broadcastToAllSystems('pattern-discovered', pattern);
    });

    this.eventBus.on('ai-system-error', (error) => {
      this.logger.warn('Event: AI system error', error);
      // Could implement automatic recovery or notification
    });
  }

  /**
   * Setup WebSocket server for real-time AI communication
   */
  setupWebSocket() {
    this.wsServer.on('connection', (ws, request) => {
      const systemId = request.headers['x-ai-system-id'] || 'unknown';
      const clientId = `${systemId}-${Date.now()}`;
      
      this.clients.set(clientId, { ws, systemId, connectedAt: new Date() });
      
      this.logger.info('AI system connected via WebSocket', {
        system_id: systemId,
        total_connections: this.clients.size
      });

      // Send current bridge status to new connection
      ws.send(JSON.stringify({
        type: 'bridge-status',
        data: {
          connected_systems: Array.from(this.aiSystems.keys()),
          active_sessions: Array.from(this.coordinationSessions.keys())
        }
      }));

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(systemId, data);
        } catch (error) {
          this.logger.error('WebSocket message handling error', {
            system_id: systemId,
            error: error.message
          });
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        this.logger.info('AI system disconnected', {
          system_id: systemId,
          total_connections: this.clients.size
        });
      });

      ws.on('error', (error) => {
        this.logger.error('WebSocket error', {
          system_id: systemId,
          error: error.message
        });
        this.clients.delete(clientId);
      });
    });
  }

  /**
   * Handle WebSocket messages from AI systems
   */
  async handleWebSocketMessage(systemId, data) {
    const { type, payload } = data;

    switch (type) {
      case 'heartbeat':
        this.updateSystemLastSeen(systemId);
        break;
        
      case 'coordination-request':
        await this.handleCoordinationRequest(systemId, payload);
        break;
        
      case 'pattern-sharing':
        await this.handlePatternSharing(systemId, payload);
        break;
        
      case 'status-update':
        await this.handleSystemStatusUpdate(systemId, payload);
        break;
        
      default:
        this.logger.warn('Unknown WebSocket message type', { type, system_id: systemId });
    }
  }

  /**
   * Broadcast message to specific AI system
   */
  broadcastToSystem(systemId, type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date() });
    
    for (const [clientId, client] of this.clients) {
      if (client.systemId === systemId && client.ws.readyState === 1) {
        client.ws.send(message);
      }
    }
  }

  /**
   * Broadcast to all connected AI systems
   */
  broadcastToAllSystems(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date() });
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === 1) {
        client.ws.send(message);
      }
    });
  }

  /**
   * Broadcast to systems with specific capabilities
   */
  async broadcastToCapableSystems(type, data, requiredCapabilities) {
    const capableSystems = Array.from(this.aiSystems.values())
      .filter(system => 
        requiredCapabilities.some(cap => system.capabilities.includes(cap))
      );

    const message = JSON.stringify({ type, data, timestamp: new Date() });
    
    for (const system of capableSystems) {
      this.broadcastToSystem(system.id, type, data);
    }
  }

  /**
   * Get bridge capabilities
   */
  getBridgeCapabilities() {
    return [
      'ai-coordination',
      'pattern-synchronization',
      'message-routing',
      'session-management',
      'memory-coordination',
      'real-time-communication'
    ];
  }

  /**
   * Notify semantic search backend
   */
  async notifySemanticSearch(event, data) {
    try {
      const response = await fetch(`${SEMANTIC_SEARCH_SERVER}/api/ai-team/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialist_id: 'ai-pattern-bridge',
          patterns: data.patterns || [],
          context: event
        })
      });
      
      if (!response.ok) {
        throw new Error(`Semantic search notification failed: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.warn('Failed to notify semantic search backend', { error: error.message });
    }
  }

  /**
   * Initialize all components
   */
  async initialize() {
    this.logger.info('Initializing KRINS AI Pattern Bridge...');
    
    try {
      await this.patternCoordinator.initialize();
      await this.messageRouter.initialize();
      await this.coordinationMemory.initialize();
      await this.eventBus.initialize();
      
      this.logger.info('AI Pattern Bridge components initialized successfully');
      
    } catch (error) {
      this.logger.error('Initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Start the bridge server
   */
  async start() {
    try {
      await this.initialize();
      
      return new Promise((resolve, reject) => {
        this.server = this.app.listen(this.port, (error) => {
          if (error) {
            reject(error);
          } else {
            this.logger.info('🌉════════════════════════════════════════════════════════════');
            this.logger.info('🌉  KRINS Revolutionary AI Pattern Bridge');
            this.logger.info('🌉════════════════════════════════════════════════════════════');
            this.logger.info(`🌉  Server running on port ${this.port}`);
            this.logger.info(`🌉  Health check: http://localhost:${this.port}/health`);
            this.logger.info(`🌉  API endpoint: http://localhost:${this.port}/api`);
            this.logger.info(`🌉  Integration: MCP AI Team (${MCP_AI_TEAM_SERVER})`);
            this.logger.info(`🌉  Integration: Semantic Search (${SEMANTIC_SEARCH_SERVER})`);
            this.logger.info('🌉════════════════════════════════════════════════════════════');

            // Initialize WebSocket server
            this.wsServer = new WebSocketServer({ server: this.server });
            this.setupWebSocket();

            resolve(this.server);
          }
        });
      });
      
    } catch (error) {
      this.logger.error('Failed to start AI Pattern Bridge', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop the server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.wsServer) {
        this.wsServer.close();
      }
      
      if (this.server) {
        this.server.close(() => {
          this.logger.info('🌉 KRINS AI Pattern Bridge stopped');
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
  const bridge = new KRINSAIPatternBridge();
  
  bridge.start().then(() => {
    console.log('🌉 KRINS AI Pattern Bridge started successfully!');
  }).catch((error) => {
    console.error('❌ Failed to start KRINS AI Pattern Bridge:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🌉 Shutting down KRINS AI Pattern Bridge...');
    await bridge.stop();
    process.exit(0);
  });
}

export { KRINSAIPatternBridge };