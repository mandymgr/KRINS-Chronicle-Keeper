/**
 * 🚀 Krin's Revolutionary MCP AI Team Server
 * The world's first autonomous AI development team coordination system
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { KrinAITeamCoordinator } from './team-coordinator.js';
import { SpecialistRoles, TaskTypes, ProjectContexts } from './types.js';

// Integration with existing Dev Memory OS backend
const DEV_MEMORY_OS_BACKEND = 'http://localhost:3003';

class MCPAITeamServer {
  constructor(port = 3006) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.wsServer = null;
    this.clients = new Map();
    
    // Initialize Krin AI Team Coordinator
    this.krin = new KrinAITeamCoordinator({
      patterns: [], // Will be loaded from Dev Memory OS
      backendAPI: DEV_MEMORY_OS_BACKEND,
      activityMonitor: this.createActivityMonitor()
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
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

    // Get all active specialists
    this.app.get('/specialists', (req, res) => {
      res.json({
        success: true,
        specialists: this.krin.getActiveSpecialists(),
        total: this.krin.specialists.size,
        coordinator_status: this.krin.getCoordinationStatus()
      });
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

    // Get coordination status
    this.app.get('/coordination/status', (req, res) => {
      res.json({
        success: true,
        status: this.krin.getCoordinationStatus()
      });
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
    this.wsServer = new WebSocketServer({ 
      port: this.port + 1,
      path: '/ws'
    });

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
        break;
      case 'specialist_command':
        // Direct command to specialist
        this.handleSpecialistCommand(message);
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
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