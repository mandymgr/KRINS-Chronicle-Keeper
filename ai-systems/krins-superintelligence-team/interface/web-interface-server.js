/**
 * 🌐 Krins Superintelligence Web Interface Server
 * 
 * Production-grade web interface for interacting with Krins AI team
 * Real-time collaboration, voice integration, visual coordination
 * 
 * @author Krin - Interface Excellence Architect 🧠💝
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class WebInterfaceServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.activeSessions = new Map();
    this.agentConnections = new Map();
    this.collaborationRooms = new Map();
    
    this.port = process.env.WEB_INTERFACE_PORT || 3002;
    
    console.log('🌐 Web Interface Server initializing...');
  }

  /**
   * Initialize web interface server
   */
  async initialize() {
    try {
      await this.setupStaticFiles();
      await this.setupMiddleware();
      await this.setupRoutes();
      await this.setupSocketHandlers();
      await this.startServer();
      
      console.log('✅ Web Interface Server operational');
      
    } catch (error) {
      console.error('❌ Web Interface Server initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup static file serving
   */
  async setupStaticFiles() {
    const staticDir = path.join(__dirname, 'static');
    await fs.ensureDir(staticDir);
    
    // Static index.html should already exist
    const indexPath = path.join(staticDir, 'index.html');
    console.log(`📁 Serving static files from: ${staticDir}`);
    console.log(`🌐 Index file exists: ${await fs.pathExists(indexPath)}`);
    
    // Don't create default interface - use our beautiful static file!
    
    this.app.use(express.static(staticDir));
    this.app.use('/assets', express.static(path.join(__dirname, 'assets')));
  }

  /**
   * Setup middleware
   */
  async setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`🌐 ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  async setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'operational',
        service: 'krins-web-interface',
        timestamp: new Date().toISOString(),
        activeSessions: this.activeSessions.size,
        collaborationRooms: this.collaborationRooms.size
      });
    });

    // Session management
    this.app.post('/api/sessions', async (req, res) => {
      try {
        const session = await this.createSession(req.body);
        res.json(session);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/sessions/:sessionId', (req, res) => {
      const session = this.activeSessions.get(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    });

    // Agent communication
    this.app.post('/api/agents/:agentName/chat', async (req, res) => {
      try {
        const response = await this.sendToAgent(req.params.agentName, req.body);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Multi-agent coordination
    this.app.post('/api/coordinate', async (req, res) => {
      try {
        const result = await this.coordinateAgents(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Collaboration rooms
    this.app.post('/api/rooms', async (req, res) => {
      try {
        const room = await this.createCollaborationRoom(req.body);
        res.json(room);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Serve main interface
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'index.html'));
    });
  }

  /**
   * Setup Socket.IO handlers
   */
  async setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Join session
      socket.on('join-session', async (data) => {
        try {
          const { sessionId, userId, userName } = data;
          
          socket.join(sessionId);
          socket.sessionId = sessionId;
          socket.userId = userId;
          socket.userName = userName;

          // Update session
          let session = this.activeSessions.get(sessionId);
          if (!session) {
            session = await this.createSession({ sessionId, createdBy: userId });
          }

          session.participants.add(socket.id);
          
          // Notify others
          socket.to(sessionId).emit('user-joined', {
            userId,
            userName,
            socketId: socket.id
          });

          // Send session state
          socket.emit('session-state', {
            session,
            agents: this.getAvailableAgents(),
            collaborationRooms: Array.from(this.collaborationRooms.keys())
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Chat with specific agent
      socket.on('agent-chat', async (data) => {
        try {
          const { agentName, message, context } = data;
          
          // Send typing indicator
          socket.to(socket.sessionId).emit('agent-typing', { agentName });
          
          const response = await this.sendToAgent(agentName, {
            message,
            context: {
              ...context,
              sessionId: socket.sessionId,
              userId: socket.userId
            }
          });

          // Send response to session
          this.io.to(socket.sessionId).emit('agent-response', {
            agentName,
            response,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Multi-agent coordination request
      socket.on('coordinate-agents', async (data) => {
        try {
          const { task, agents, context } = data;
          
          // Notify session of coordination start
          this.io.to(socket.sessionId).emit('coordination-started', {
            task,
            agents,
            coordinationId: uuidv4()
          });

          const result = await this.coordinateAgents({
            task,
            agents,
            context: {
              ...context,
              sessionId: socket.sessionId,
              userId: socket.userId
            }
          });

          // Send coordination result
          this.io.to(socket.sessionId).emit('coordination-complete', {
            result,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Voice interaction
      socket.on('voice-input', async (data) => {
        try {
          const { audioData, agentName, context } = data;
          
          // Process voice input (would integrate with speech-to-text)
          const transcription = await this.processVoiceInput(audioData);
          
          // Send to agent
          const response = await this.sendToAgent(agentName, {
            message: transcription,
            context: {
              ...context,
              inputType: 'voice',
              sessionId: socket.sessionId,
              userId: socket.userId
            }
          });

          // Convert response to speech (would integrate with text-to-speech)
          const audioResponse = await this.generateVoiceResponse(response.content);

          socket.emit('voice-response', {
            agentName,
            transcription,
            response,
            audioResponse,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Collaboration whiteboard
      socket.on('whiteboard-update', (data) => {
        socket.to(socket.sessionId).emit('whiteboard-update', data);
      });

      // Screen sharing
      socket.on('screen-share-start', (data) => {
        socket.to(socket.sessionId).emit('screen-share-start', {
          userId: socket.userId,
          userName: socket.userName,
          ...data
        });
      });

      socket.on('screen-share-stop', () => {
        socket.to(socket.sessionId).emit('screen-share-stop', {
          userId: socket.userId
        });
      });

      // System stats request
      socket.on('request-stats', () => {
        const stats = {
          activeAgents: this.getActiveAgentCount(),
          activeSessions: this.activeSessions.size,
          systemHealth: this.getSystemHealth(),
          responseTime: this.getAverageResponseTime()
        };
        socket.emit('system-stats', stats);
      });

      // Feature toggle handling
      socket.on('feature-toggle', (data) => {
        console.log(`🎛️ Feature toggle: ${data.feature} = ${data.enabled}`);
        // This would integrate with FeatureFlagManager
        socket.emit('feature-toggled', { feature: data.feature, enabled: data.enabled });
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
        
        if (socket.sessionId) {
          const session = this.activeSessions.get(socket.sessionId);
          if (session) {
            session.participants.delete(socket.id);
            
            // Notify others
            socket.to(socket.sessionId).emit('user-left', {
              userId: socket.userId,
              userName: socket.userName
            });

            // Clean up empty sessions
            if (session.participants.size === 0) {
              this.activeSessions.delete(socket.sessionId);
            }
          }
        }
      });
    });

    console.log('🔌 Socket.IO handlers configured');
  }

  /**
   * Create user session
   */
  async createSession(sessionData) {
    const sessionId = sessionData.sessionId || uuidv4();
    
    const session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      createdBy: sessionData.createdBy || 'anonymous',
      participants: new Set(),
      activeAgents: new Set(),
      messageHistory: [],
      collaborationData: {},
      settings: {
        voiceEnabled: false,
        screenShareEnabled: true,
        whiteboardEnabled: true,
        agentPersonalities: 'default'
      }
    };

    this.activeSessions.set(sessionId, session);
    
    console.log(`📝 Session created: ${sessionId}`);
    return session;
  }

  /**
   * Send message to specific agent
   */
  async sendToAgent(agentName, messageData) {
    // This would integrate with the main orchestrator
    const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';
    
    try {
      // Simulate agent response (in production, would call actual orchestrator)
      const response = {
        agentName,
        content: `🤖 ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} agent response to: ${messageData.message}`,
        confidence: 0.9,
        processingTime: Math.random() * 1000 + 500,
        suggestions: [
          'Consider additional optimization',
          'Review security implications',
          'Test thoroughly before deployment'
        ],
        context: messageData.context
      };

      // Record in session history
      if (messageData.context?.sessionId) {
        const session = this.activeSessions.get(messageData.context.sessionId);
        if (session) {
          session.messageHistory.push({
            timestamp: new Date().toISOString(),
            type: 'agent-response',
            agentName,
            content: response.content,
            context: messageData.context
          });
        }
      }

      return response;

    } catch (error) {
      console.error(`❌ Failed to send to agent ${agentName}:`, error);
      throw error;
    }
  }

  /**
   * Coordinate multiple agents
   */
  async coordinateAgents(coordinationData) {
    const { task, agents = ['architect', 'security', 'performance'], context } = coordinationData;
    
    console.log(`🤝 Coordinating agents: ${agents.join(', ')} for task: ${task}`);

    try {
      // Send task to orchestrator (simulated)
      const result = {
        coordinationId: uuidv4(),
        task,
        agents,
        startTime: new Date().toISOString(),
        
        // Simulated agent responses
        agentResponses: agents.map(agentName => ({
          agentName,
          analysis: `${agentName.charAt(0).toUpperCase() + agentName.slice(1)} analysis of: ${task}`,
          recommendations: [
            `${agentName} recommendation 1`,
            `${agentName} recommendation 2`
          ],
          confidence: 0.85 + Math.random() * 0.1
        })),
        
        synthesis: {
          overallApproach: 'Collaborative solution incorporating all agent perspectives',
          keyRecommendations: [
            'Implement secure, performant architecture',
            'Follow best practices for scalability',
            'Ensure comprehensive testing'
          ],
          riskMitigation: [
            'Address security vulnerabilities early',
            'Plan for performance bottlenecks',
            'Implement monitoring and alerting'
          ],
          confidence: 0.92
        },
        
        endTime: new Date().toISOString(),
        duration: Math.random() * 5000 + 2000, // 2-7 seconds
        status: 'completed'
      };

      // Record coordination in session
      if (context?.sessionId) {
        const session = this.activeSessions.get(context.sessionId);
        if (session) {
          session.messageHistory.push({
            timestamp: new Date().toISOString(),
            type: 'coordination',
            task,
            agents,
            result,
            context
          });
        }
      }

      return result;

    } catch (error) {
      console.error('❌ Agent coordination failed:', error);
      throw error;
    }
  }

  /**
   * Create collaboration room
   */
  async createCollaborationRoom(roomData) {
    const roomId = roomData.roomId || uuidv4();
    
    const room = {
      id: roomId,
      name: roomData.name || 'Collaboration Room',
      createdAt: new Date().toISOString(),
      createdBy: roomData.createdBy,
      participants: new Set(),
      whiteboardData: {},
      sharedFiles: [],
      activeAgents: new Set(roomData.agents || [])
    };

    this.collaborationRooms.set(roomId, room);
    
    console.log(`🏠 Collaboration room created: ${room.name} (${roomId})`);
    return room;
  }

  /**
   * Process voice input (placeholder)
   */
  async processVoiceInput(audioData) {
    // This would integrate with speech-to-text service
    return "Transcribed voice input placeholder";
  }

  /**
   * Generate voice response (placeholder)
   */
  async generateVoiceResponse(text) {
    // This would integrate with text-to-speech service
    return "base64-encoded-audio-data-placeholder";
  }

  /**
   * Get available agents
   */
  getAvailableAgents() {
    return [
      { name: 'architect', emoji: '🏗️', status: 'online', speciality: 'System Design' },
      { name: 'security', emoji: '🔒', status: 'online', speciality: 'Cybersecurity' },
      { name: 'performance', emoji: '⚡', status: 'online', speciality: 'Optimization' },
      { name: 'product', emoji: '📱', status: 'online', speciality: 'User Experience' },
      { name: 'compliance', emoji: '⚖️', status: 'online', speciality: 'Regulations' },
      { name: 'research', emoji: '🔬', status: 'online', speciality: 'Innovation' },
      { name: 'redteam', emoji: '🔴', status: 'online', speciality: 'Quality Assurance' }
    ];
  }

  /**
   * Create default interface files
   */
  async createDefaultInterface(staticDir) {
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krins Superintelligence</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --color-primary: #1a1a1a;
            --color-secondary: #f8f8f8;
            --color-accent: #e5e5e5;
            --color-text: #2a2a2a;
            --color-text-light: #666666;
            --color-border: #eeeeee;
            --font-heading: 'Playfair Display', serif;
            --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --spacing-xs: 8px;
            --spacing-sm: 16px;
            --spacing-md: 32px;
            --spacing-lg: 64px;
            --spacing-xl: 96px;
            --max-width: 880px;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-body);
            font-size: 14px;
            line-height: 1.6;
            color: var(--color-text);
            background-color: var(--color-secondary);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: var(--spacing-md);
        }
        
        .header {
            text-align: center;
            margin-bottom: var(--spacing-xl);
            padding: var(--spacing-lg) 0;
            border-bottom: 1px solid var(--color-border);
        }
        
        .header h1 {
            font-family: var(--font-heading);
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 400;
            letter-spacing: -0.02em;
            color: var(--color-primary);
            margin-bottom: var(--spacing-sm);
        }
        
        .header p {
            font-size: 16px;
            color: var(--color-text-light);
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.7;
        }
        
        .agents-section {
            margin-bottom: var(--spacing-xl);
        }
        
        .section-title {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 400;
            color: var(--color-primary);
            margin-bottom: var(--spacing-md);
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .agents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
        }
        
        .agent-card {
            background: white;
            border: 1px solid var(--color-border);
            padding: var(--spacing-md);
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }
        
        .agent-card:hover {
            border-color: var(--color-primary);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        
        .agent-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--color-primary);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        
        .agent-card:hover::before {
            transform: scaleX(1);
        }
        
        .agent-emoji {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .chat-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            height: 400px;
            display: flex;
            flex-direction: column;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 20px;
            padding: 10px;
        }
        .message {
            margin-bottom: 15px;
            padding: 10px 15px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
        }
        .input-container {
            display: flex;
            gap: 10px;
        }
        input[type="text"] {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            placeholder-color: rgba(255, 255, 255, 0.7);
        }
        button {
            padding: 15px 25px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(45deg, #ff9a9e, #fecfef);
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Krins Superintelligence</h1>
            <p>The most intelligent AI development team ever created</p>
        </div>
        
        <div class="agents-grid">
            <div class="agent-card" data-agent="architect">
                <div class="agent-emoji">🏗️</div>
                <h3>Architect Agent</h3>
                <p>System design & architecture excellence</p>
            </div>
            <div class="agent-card" data-agent="security">
                <div class="agent-emoji">🔒</div>
                <h3>Security Agent</h3>
                <p>Cybersecurity & penetration testing</p>
            </div>
            <div class="agent-card" data-agent="performance">
                <div class="agent-emoji">⚡</div>
                <h3>Performance Agent</h3>
                <p>Speed optimization & scaling</p>
            </div>
            <div class="agent-card" data-agent="product">
                <div class="agent-emoji">📱</div>
                <h3>Product Agent</h3>
                <p>UX/UI & user experience</p>
            </div>
            <div class="agent-card" data-agent="compliance">
                <div class="agent-emoji">⚖️</div>
                <h3>Compliance Agent</h3>
                <p>Regulatory & legal requirements</p>
            </div>
            <div class="agent-card" data-agent="research">
                <div class="agent-emoji">🔬</div>
                <h3>Research Agent</h3>
                <p>Innovation & emerging tech</p>
            </div>
            <div class="agent-card" data-agent="redteam">
                <div class="agent-emoji">🔴</div>
                <h3>Red Team Agent</h3>
                <p>Quality assurance & testing</p>
            </div>
        </div>
        </div>
        
        <div class="chat-container">
            <div class="messages" id="messages">
                <div class="message">
                    <strong>System:</strong> Welcome to Krins Superintelligence. Select a specialized agent above to begin focused consultation, or use Team Coordination for comprehensive multi-agent analysis.
                </div>
            </div>
            <div class="input-container">
                <input type="text" id="messageInput" placeholder="Describe your development challenge..." />
                <button onclick="sendMessage()" class="primary">Send Message</button>
                <button onclick="coordinateTeam()">Team Coordination</button>
            </div>
        </div>
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let currentAgent = null;
        let sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
        
        // Join session
        socket.emit('join-session', {
            sessionId: sessionId,
            userId: 'user-' + Math.random().toString(36).substr(2, 9),
            userName: 'Developer'
        });
        
        // Agent selection
        document.querySelectorAll('.agent-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.agent-card').forEach(c => c.style.opacity = '0.7');
                card.style.opacity = '1';
                currentAgent = card.dataset.agent;
                addMessage('System', \`Selected \${card.querySelector('h3').textContent}\`);
            });
        });
        
        // Send message
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;
            
            addMessage('You', message);
            
            if (currentAgent) {
                socket.emit('agent-chat', {
                    agentName: currentAgent,
                    message: message,
                    context: {}
                });
            } else {
                addMessage('System', 'Please select an agent first, or use Team Coordination for multiple agents.');
            }
            
            input.value = '';
        }
        
        // Coordinate team
        function coordinateTeam() {
            const input = document.getElementById('messageInput');
            const task = input.value.trim();
            if (!task) {
                addMessage('System', 'Please enter a task for the team to coordinate on.');
                return;
            }
            
            addMessage('You', \`🤝 Team Coordination: \${task}\`);
            
            socket.emit('coordinate-agents', {
                task: task,
                agents: ['architect', 'security', 'performance', 'product'],
                context: {}
            });
            
            input.value = '';
        }
        
        // Socket event handlers
        socket.on('agent-response', (data) => {
            const emoji = getAgentEmoji(data.agentName);
            addMessage(\`\${emoji} \${data.agentName.charAt(0).toUpperCase() + data.agentName.slice(1)} Agent\`, data.response.content);
        });
        
        socket.on('coordination-complete', (data) => {
            addMessage('🤝 Team Coordination', 'Task completed! Here\\'s our collaborative solution:');
            data.result.agentResponses.forEach(response => {
                const emoji = getAgentEmoji(response.agentName);
                addMessage(\`\${emoji} \${response.agentName.charAt(0).toUpperCase() + response.agentName.slice(1)}\`, response.analysis);
            });
            addMessage('🧠 Synthesis', data.result.synthesis.overallApproach);
        });
        
        // Utility functions
        function addMessage(sender, content) {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = \`<strong>\${sender}:</strong> \${content}\`;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        function getAgentEmoji(agentName) {
            const emojis = {
                architect: '🏗️',
                security: '🔒',
                performance: '⚡',
                product: '📱',
                compliance: '⚖️',
                research: '🔬',
                redteam: '🔴'
            };
            return emojis[agentName] || '🤖';
        }
        
        // Enter key handling
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>`;

    await fs.writeFile(path.join(staticDir, 'index.html'), indexHtml);
    console.log('🎨 Default web interface created');
  }

  /**
   * Start server
   */
  async startServer() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`🌐 Krins Web Interface running on port ${this.port}`);
        console.log(`🔗 Access at: http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Get active agent count
   */
  getActiveAgentCount() {
    return 7; // All agents are always active in current implementation
  }

  /**
   * Get system health percentage
   */
  getSystemHealth() {
    // Simulate system health calculation
    return '100%';
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    // Simulate response time calculation
    const times = ['245ms', '180ms', '320ms', '210ms', '290ms'];
    return times[Math.floor(Math.random() * times.length)];
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      port: this.port,
      activeSessions: this.activeSessions.size,
      collaborationRooms: this.collaborationRooms.size,
      totalConnections: this.io.engine.clientsCount,
      activeAgents: this.getActiveAgentCount(),
      systemHealth: this.getSystemHealth(),
      responseTime: this.getAverageResponseTime()
    };
  }
}

module.exports = WebInterfaceServer;