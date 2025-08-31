/**
 * 🚀 Krin's Revolutionary MCP AI Team Server
 * The world's first autonomous AI development team coordination system
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const expressModule = require('express');
const express = expressModule.default || expressModule;
const corsModule = require('cors');
const cors = corsModule.default || corsModule;
import { KrinAITeamCoordinator } from './team-coordinator.js';
import { SpecialistRoles, TaskTypes, ProjectStatus } from './types.js';

// Integration with existing Dev Memory OS backend
const DEV_MEMORY_OS_BACKEND = 'http://localhost:3003';

class MCPAITeamServer {
  constructor(port = 3006) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.wsServer = null;
    this.clients = new Map();
    
    // Smart caching system
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.DEFAULT_CACHE_TTL = 30000; // 30 seconds
    
    // Initialize Krin AI Team Coordinator
    this.krin = new KrinAITeamCoordinator({
      patterns: [], // Will be loaded from Dev Memory OS
      backendAPI: DEV_MEMORY_OS_BACKEND,
      activityMonitor: this.createActivityMonitor()
    });

    this.setupMiddleware();
    this.setupRoutes();
    // WebSocket will be setup during server start
    
    // Start cache cleanup interval
    this.startCacheCleanup();
  }

  /**
   * Create activity monitor that integrates with existing system
   */
  createActivityMonitor() {
    return {
      logActivity: (activity) => {
        console.log(`📊 Activity: ${activity.specialistName} - ${activity.message}`);
        
        // Broadcast to WebSocket clients (real-time dashboard updates)
        this.broadcastActivity(activity);
        
        // Invalidate status cache when activity occurs
        if (activity.type === 'coordination' || activity.type === 'specialist_update') {
          this.invalidateCache('coordination_status');
        }
        
        // TODO: Integrate with existing backend activity monitor
        // await fetch(`${DEV_MEMORY_OS_BACKEND}/api/ai-team/activities`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(activity)
        // });
      }
    };
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`🌐 ${req.method} ${req.path}`);
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
        server: 'MCP AI Team Server',
        coordinator: 'Krin',
        specialists: this.krin.specialists.size,
        active_projects: this.krin.activeProjects.size,
        uptime: process.uptime()
      });
    });

    // API Documentation
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Krin\'s Revolutionary MCP AI Team Server',
        version: '1.0.0',
        description: 'World\'s first autonomous AI development team coordination system',
        endpoints: {
          'GET /': 'This documentation',
          'GET /health': 'Health check and server status',
          'GET /specialists': 'List all active AI specialists',
          'POST /specialists/spawn': 'Spawn new AI specialist',
          'GET /coordination/status': 'Get coordination metrics and status',
          'POST /projects/coordinate': 'Start autonomous project development',
          'GET /projects/:id/status': 'Get project coordination status',
          'POST /specialists/:id/task': 'Assign task to specific specialist',
          'GET /specialists/:id/status': 'Get specialist detailed status',
          'POST /coordination/broadcast': 'Broadcast message to all specialists',
          'WebSocket /ws': 'Real-time coordination events and activity feed'
        },
        integration: {
          dev_memory_os_backend: DEV_MEMORY_OS_BACKEND,
          ai_team_dashboard: 'http://localhost:3000',
          pattern_library: 'Integrated with Dev Memory OS patterns'
        }
      });
    });

    // Get all active specialists (cached)
    this.app.get('/specialists', (req, res) => {
      const result = this.getCachedSpecialists();
      res.json(result);
    });

    // Spawn new AI specialist
    this.app.post('/specialists/spawn', async (req, res) => {
      try {
        const { role, config = {} } = req.body;
        
        if (!Object.values(SpecialistRoles).includes(role)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid specialist role',
            valid_roles: Object.values(SpecialistRoles)
          });
        }

        const specialist = await this.krin.spawnSpecialist(role, config);
        
        // Invalidate cache when specialist is spawned
        this.invalidateCache('specialists');
        this.invalidateCache('coordination_status');
        
        res.json({
          success: true,
          specialist: specialist.getStatus(),
          message: `${specialist.name} spawned successfully`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get coordination status (cached)
    this.app.get('/coordination/status', (req, res) => {
      const result = this.getCachedCoordinationStatus();
      res.json(result);
    });

    // Start autonomous project coordination
    this.app.post('/projects/coordinate', async (req, res) => {
      try {
        const { description, config = {} } = req.body;
        
        if (!description) {
          return res.status(400).json({
            success: false,
            error: 'Project description is required'
          });
        }

        console.log(`🚀 New autonomous project request: ${description}`);
        
        // Start coordination asynchronously
        this.krin.coordinateProject(description, config)
          .then(result => {
            console.log(`✅ Project completed: ${description}`);
            this.broadcastProjectUpdate(result);
          })
          .catch(error => {
            console.error(`❌ Project failed: ${error.message}`);
            this.broadcastProjectUpdate({ error: error.message, description });
          });

        res.json({
          success: true,
          message: 'Autonomous project coordination started',
          description,
          estimated_completion: '2-4 hours',
          tracking: 'Real-time updates available via WebSocket'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get specific specialist status
    this.app.get('/specialists/:id/status', (req, res) => {
      const specialist = this.krin.specialists.get(req.params.id);
      
      if (!specialist) {
        return res.status(404).json({
          success: false,
          error: 'Specialist not found'
        });
      }

      res.json({
        success: true,
        specialist: specialist.getStatus()
      });
    });

    // Assign task to specific specialist
    this.app.post('/specialists/:id/task', async (req, res) => {
      try {
        const specialist = this.krin.specialists.get(req.params.id);
        
        if (!specialist) {
          return res.status(404).json({
            success: false,
            error: 'Specialist not found'
          });
        }

        const { description, type = TaskTypes.CODE_GENERATION } = req.body;
        
        if (!description) {
          return res.status(400).json({
            success: false,
            error: 'Task description is required'
          });
        }

        const task = {
          id: `task-${Date.now()}`,
          description,
          type,
          timestamp: new Date()
        };

        const result = await specialist.acceptTask(task);
        
        res.json({
          success: true,
          result,
          specialist: specialist.name
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Broadcast coordination message
    this.app.post('/coordination/broadcast', async (req, res) => {
      try {
        const { message, type = 'coordination' } = req.body;
        
        if (!message) {
          return res.status(400).json({
            success: false,
            error: 'Message is required'
          });
        }

        await this.krin.broadcastCoordinationMessage(message, type);
        
        res.json({
          success: true,
          message: 'Message broadcasted to all specialists',
          recipients: this.krin.specialists.size
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('🔥 Server Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    });
  }

  /**
   * Setup WebSocket server for real-time communication
   */
  setupWebSocket() {
    try {
      const { WebSocketServer } = require('ws');
      
      this.wsServer = new WebSocketServer({ 
        port: this.port + 1,
        path: '/ws'
      });
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket server:', error);
      return;
    }

    this.wsServer.on('connection', (ws, request) => {
      const clientId = `client-${Date.now()}`;
      this.clients.set(clientId, ws);
      
      console.log(`🔌 Client connected: ${clientId}`);
      
      // Send initial state
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to Krin AI Team Coordination',
        status: this.krin.getCoordinationStatus()
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleWebSocketMessage(clientId, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`🔌 Client disconnected: ${clientId}`);
      });
    });

    console.log(`🔌 WebSocket server listening on port ${this.port + 1}`);
  }

  /**
   * Handle WebSocket messages from clients
   */
  handleWebSocketMessage(clientId, message) {
    console.log(`💬 WebSocket message from ${clientId}:`, message);
    
    // Handle different message types
    switch (message.type) {
      case 'subscribe':
        // Client subscribing to specific events
        this.handleSubscription(clientId, message);
        break;
      case 'specialist_command':
        // Direct command to specialist
        this.handleSpecialistCommand(message);
        break;
      case 'activity':
        // Activity message from specialist terminals - broadcast to other clients
        this.broadcastToOtherClients(clientId, message);
        break;
      case 'specialist_update':
        // Specialist status update - broadcast to all clients
        this.broadcastSpecialistUpdate(message);
        break;
      case 'message':
        // Inter-specialist communication
        this.handleSpecialistMessage(message);
        break;
      case 'connection':
        // Connection message - send acknowledgment
        this.handleConnectionMessage(clientId, message);
        break;
      case 'specialist_online':
        // Specialist coming online notification
        this.handleSpecialistOnline(clientId, message);
        break;
      default:
        console.log(`⚠️  Unknown WebSocket message type: ${message.type} from ${clientId}`);
        // Send error response to client
        this.sendErrorResponse(clientId, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle specialist command from WebSocket
   */
  async handleSpecialistCommand(message) {
    if (message.command === 'spawn' && message.role) {
      await this.krin.spawnSpecialist(message.role);
    }
  }

  /**
   * Handle client subscription requests
   */
  handleSubscription(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Store subscription preferences for this client
    if (!client.subscriptions) {
      client.subscriptions = new Set();
    }

    if (message.events && Array.isArray(message.events)) {
      message.events.forEach(event => client.subscriptions.add(event));
      console.log(`📝 Client ${clientId} subscribed to:`, message.events);
      
      // Send confirmation
      client.send(JSON.stringify({
        type: 'subscription_confirmed',
        events: message.events,
        timestamp: new Date()
      }));
    }
  }

  /**
   * Broadcast message to all other clients (not sender)
   */
  broadcastToOtherClients(senderClientId, message) {
    const broadcastMessage = JSON.stringify({
      ...message,
      timestamp: new Date()
    });

    this.clients.forEach((ws, clientId) => {
      if (clientId !== senderClientId && ws.readyState === ws.OPEN) {
        // Check if client is subscribed to this message type
        if (!ws.subscriptions || ws.subscriptions.has(message.type) || ws.subscriptions.has('all')) {
          ws.send(broadcastMessage);
        }
      }
    });
  }

  /**
   * Broadcast specialist update to all clients
   */
  broadcastSpecialistUpdate(message) {
    const broadcastMessage = JSON.stringify({
      type: 'specialist_update',
      specialist: message.specialist,
      timestamp: new Date()
    });

    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(broadcastMessage);
      }
    });
  }

  /**
   * Handle inter-specialist messages
   */
  handleSpecialistMessage(message) {
    console.log(`💬 Specialist message:`, message);
    
    // Route message to target specialist or broadcast
    if (message.message && message.message.to) {
      this.routeMessageToSpecialist(message.message);
    } else {
      // Broadcast to all clients
      this.broadcastToOtherClients(null, message);
    }
  }

  /**
   * Handle connection messages
   */
  handleConnectionMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Send acknowledgment with current system status
    client.send(JSON.stringify({
      type: 'connection_ack',
      status: 'connected',
      server: 'Krin AI Team Coordination',
      coordination_status: this.krin.getCoordinationStatus(),
      timestamp: new Date()
    }));
  }

  /**
   * Handle specialist online notifications
   */
  handleSpecialistOnline(clientId, message) {
    console.log(`👋 Specialist came online from client ${clientId}:`, message.specialist || 'Unknown');
    
    // Broadcast to all other clients that specialist is online
    this.broadcastToOtherClients(clientId, {
      type: 'specialist_online',
      specialist: message.specialist,
      timestamp: new Date()
    });

    // Invalidate cache since specialist status changed
    this.invalidateCache('specialists');
    this.invalidateCache('coordination_status');
  }

  /**
   * Send error response to specific client
   */
  sendErrorResponse(clientId, errorMessage) {
    const client = this.clients.get(clientId);
    if (!client || client.readyState !== client.OPEN) return;

    client.send(JSON.stringify({
      type: 'error',
      error: errorMessage,
      timestamp: new Date()
    }));
  }

  /**
   * Route message to specific specialist
   */
  routeMessageToSpecialist(message) {
    const targetSpecialist = this.krin.specialists.get(message.to);
    if (targetSpecialist) {
      targetSpecialist.receiveMessage(message);
    }
  }

  /**
   * Smart caching system
   */
  setCacheItem(key, value, ttl = this.DEFAULT_CACHE_TTL) {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  getCacheItem(key) {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  invalidateCache(pattern) {
    const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
    keys.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, expiry] of this.cacheExpiry.entries()) {
        if (now > expiry) {
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Cached specialists getter
   */
  getCachedSpecialists() {
    const cached = this.getCacheItem('specialists');
    if (cached) {
      return cached;
    }

    const specialists = this.krin.getActiveSpecialists();
    const result = {
      success: true,
      specialists,
      total: this.krin.specialists.size,
      coordinator_status: this.krin.getCoordinationStatus(),
      cached: false
    };

    this.setCacheItem('specialists', result, 15000); // Cache for 15 seconds
    return result;
  }

  /**
   * Cached coordination status getter
   */
  getCachedCoordinationStatus() {
    const cached = this.getCacheItem('coordination_status');
    if (cached) {
      return cached;
    }

    const result = {
      success: true,
      status: this.krin.getCoordinationStatus(),
      cached: false
    };

    this.setCacheItem('coordination_status', result, 10000); // Cache for 10 seconds
    return result;
  }

  /**
   * Broadcast activity to all WebSocket clients
   */
  broadcastActivity(activity) {
    const message = JSON.stringify({
      type: 'activity',
      activity,
      timestamp: new Date()
    });

    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Broadcast project updates
   */
  broadcastProjectUpdate(projectResult) {
    const message = JSON.stringify({
      type: 'project_update',
      project: projectResult,
      timestamp: new Date()
    });

    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start() {
    // Setup WebSocket first
    this.setupWebSocket();
    
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log('🚀 ============================================');
          console.log('🚀 KRIN\'S REVOLUTIONARY MCP AI TEAM SERVER');
          console.log('🚀 ============================================');
          console.log(`🚀 Server: http://localhost:${this.port}`);
          console.log(`🔌 WebSocket: ws://localhost:${this.port + 1}/ws`);
          console.log(`📊 Dashboard: http://localhost:3000`);
          console.log(`🧠 Backend: ${DEV_MEMORY_OS_BACKEND}`);
          console.log('🚀 ============================================');
          console.log('🚀 Ready for autonomous AI team coordination!');
          console.log('🚀 ============================================');
          
          // Spawn initial demonstration team
          this.spawnDemonstrationTeam();
          
          resolve();
        }
      });
    });
  }

  /**
   * Spawn initial team for demonstration
   */
  async spawnDemonstrationTeam() {
    console.log('🚀 Spawning demonstration AI team...');
    
    try {
      await this.krin.spawnSpecialist(SpecialistRoles.BACKEND);
      await this.krin.spawnSpecialist(SpecialistRoles.FRONTEND);
      await this.krin.spawnSpecialist(SpecialistRoles.TESTING);
      await this.krin.spawnSpecialist(SpecialistRoles.SECURITY);
      await this.krin.spawnSpecialist(SpecialistRoles.DEVOPS); // Performance Optimization Specialist
      
      console.log('✅ Demonstration AI team ready for coordination!');
      
      // Send initial coordination message
      await this.krin.broadcastCoordinationMessage(
        'AI Team assembled and ready for autonomous development projects!'
      );
      
    } catch (error) {
      console.error('❌ Failed to spawn demonstration team:', error);
    }
  }

  /**
   * Stop the server gracefully
   */
  async stop() {
    console.log('🛑 Shutting down MCP AI Team Server...');
    
    // Close WebSocket connections
    this.clients.forEach((ws, clientId) => {
      ws.close(1000, 'Server shutting down');
    });
    
    // Close servers
    if (this.wsServer) {
      this.wsServer.close();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ MCP AI Team Server shut down gracefully');
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MCPAITeamServer(3006);
  
  server.start().catch(error => {
    console.error('❌ Failed to start MCP AI Team Server:', error);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}

export { MCPAITeamServer };