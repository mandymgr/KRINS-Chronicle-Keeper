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
   * Setup middleware
   */
  setupMiddleware() {
    // CORS for integration with frontend and other services
    this.app.use(cors({
      origin: [
        'http://localhost:3000', // React frontend
        'http://localhost:5173', // Vite dev server
        'http://localhost:8000', // FastAPI backend
        'http://localhost:3003', // Semantic search backend
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
        console.log(`🌐 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
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
        service: 'MCP AI Team Server',
        version: '1.0.0',
        coordinator: this.krin.name,
        specialists: this.krin.specialists.size,
        timestamp: new Date().toISOString()
      });
    });

    // Get AI team status
    this.app.get('/api/ai-team/status', (req, res) => {
      try {
        const status = this.krin.getCoordinationStatus();
        res.json({
          success: true,
          data: status,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Get active specialists
    this.app.get('/api/ai-team/specialists', (req, res) => {
      try {
        const specialists = this.krin.getActiveSpecialists();
        res.json({
          success: true,
          data: {
            specialists,
            total: specialists.length
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Spawn new AI specialist
    this.app.post('/api/ai-team/specialists/spawn', async (req, res) => {
      try {
        const { role, config = {} } = req.body;
        
        if (!role || !Object.values(SpecialistRoles).includes(role)) {
          return res.status(400).json({
            success: false,
            error: `Invalid role. Must be one of: ${Object.values(SpecialistRoles).join(', ')}`,
            timestamp: new Date().toISOString()
          });
        }

        const specialist = await this.krin.spawnSpecialist(role, config);
        
        res.json({
          success: true,
          message: `${specialist.name} spawned successfully`,
          data: {
            specialist: specialist.getStatus()
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Coordinate new project
    this.app.post('/api/ai-team/projects/coordinate', async (req, res) => {
      try {
        const { description, config = {} } = req.body;
        
        if (!description) {
          return res.status(400).json({
            success: false,
            error: 'Project description is required',
            timestamp: new Date().toISOString()
          });
        }

        console.log(`🚀 Starting AI team project coordination: ${description}`);
        
        const result = await this.krin.coordinateProject(description, config);
        
        res.json({
          success: true,
          message: `Project "${description}" completed successfully`,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Project coordination failed:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Broadcast message to all specialists
    this.app.post('/api/ai-team/broadcast', async (req, res) => {
      try {
        const { message, type = 'coordination' } = req.body;
        
        if (!message) {
          return res.status(400).json({
            success: false,
            error: 'Message is required',
            timestamp: new Date().toISOString()
          });
        }

        await this.krin.broadcastCoordinationMessage(message, type);
        
        res.json({
          success: true,
          message: 'Broadcast sent to all specialists',
          data: {
            recipients: this.krin.specialists.size,
            message: message
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Get project logs
    this.app.get('/api/ai-team/projects/:projectId/logs', (req, res) => {
      try {
        const { projectId } = req.params;
        const logs = this.krin.getProjectLog(projectId);
        
        if (!logs) {
          return res.status(404).json({
            success: false,
            error: 'Project not found',
            timestamp: new Date().toISOString()
          });
        }

        res.json({
          success: true,
          data: logs,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Integration endpoint for patterns from Dev Memory OS
    this.app.post('/api/ai-team/patterns/sync', async (req, res) => {
      try {
        const { patterns } = req.body;
        
        if (!Array.isArray(patterns)) {
          return res.status(400).json({
            success: false,
            error: 'Patterns must be an array',
            timestamp: new Date().toISOString()
          });
        }

        // Update patterns in coordinator
        this.krin.devMemoryOSPatterns = patterns;
        
        // Update patterns in all existing specialists
        this.krin.specialists.forEach(specialist => {
          specialist.devMemoryOSPatterns = patterns;
        });

        res.json({
          success: true,
          message: `Synchronized ${patterns.length} patterns with AI team`,
          data: {
            patterns_count: patterns.length,
            specialists_updated: this.krin.specialists.size
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('MCP AI Team Server error:', error);
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
          'GET /api/ai-team/status',
          'GET /api/ai-team/specialists',
          'POST /api/ai-team/specialists/spawn',
          'POST /api/ai-team/projects/coordinate',
          'POST /api/ai-team/broadcast',
          'GET /api/ai-team/projects/:projectId/logs',
          'POST /api/ai-team/patterns/sync'
        ],
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup WebSocket server for real-time updates
   */
  setupWebSocket() {
    // WebSocket will be initialized when HTTP server starts
  }

  /**
   * Broadcast activity to WebSocket clients
   */
  broadcastActivity(activity) {
    const message = JSON.stringify({
      type: 'activity',
      data: {
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString()
      }
    });

    this.clients.forEach((client, clientId) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      } else {
        // Clean up closed connections
        this.clients.delete(clientId);
      }
    });
  }

  /**
   * Start the MCP AI Team Server
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log('🚀═══════════════════════════════════════════════════════════════');
          console.log('🚀  Krin\'s Revolutionary MCP AI Team Server');
          console.log('🚀═══════════════════════════════════════════════════════════════');
          console.log(`🚀  Server running on port ${this.port}`);
          console.log(`🚀  Health check: http://localhost:${this.port}/health`);
          console.log(`🚀  AI Team API: http://localhost:${this.port}/api/ai-team`);
          console.log(`🚀  Coordinator: ${this.krin.name} ${this.krin.emoji}`);
          console.log('🚀═══════════════════════════════════════════════════════════════');

          // Initialize WebSocket server
          this.wsServer = new WebSocketServer({ server: this.server });

          this.wsServer.on('connection', (ws, request) => {
            const clientId = Date.now() + Math.random();
            this.clients.set(clientId, ws);
            
            console.log(`🔌 WebSocket client connected (${this.clients.size} total)`);

            // Send current AI team status to new client
            ws.send(JSON.stringify({
              type: 'status',
              data: this.krin.getCoordinationStatus()
            }));

            ws.on('close', () => {
              this.clients.delete(clientId);
              console.log(`🔌 WebSocket client disconnected (${this.clients.size} total)`);
            });

            ws.on('error', (error) => {
              console.error('WebSocket error:', error);
              this.clients.delete(clientId);
            });
          });

          resolve(this.server);
        }
      });
    });
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
          console.log('🚀 MCP AI Team Server stopped');
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
  const server = new MCPAITeamServer();
  
  server.start().then(() => {
    console.log('🚀 MCP AI Team Server started successfully!');
  }).catch((error) => {
    console.error('❌ Failed to start MCP AI Team Server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🚀 Shutting down MCP AI Team Server...');
    await server.stop();
    process.exit(0);
  });
}

export { MCPAITeamServer };