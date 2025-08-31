#!/usr/bin/env node
/**
 * 🌐 WEBSOCKET AI BRIDGE
 * Real-time bridge between AI specialists and frontend dashboard
 * Provides live AI-to-AI communication streaming to the UI
 */

const WebSocket = require('ws');
const { demonstrateAICoordination, initializeAITeam } = require('./create-ai-specialists');

class WebSocketAIBridge {
    constructor(port = process.env.PORT || 8081) {
        this.port = port;
        this.wss = null;
        this.aiCoordinator = null;
        this.connectedClients = new Set();
        this.communicationHistory = [];
        this.activeProjects = new Map();
    }

    /**
     * Start the WebSocket server
     */
    async start() {
        try {
            console.log('🚀 Starting WebSocket AI Bridge...');
            
            // Initialize AI team first
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                console.log('❌ Please set OPENAI_API_KEY environment variable');
                console.log('💡 You can still run the system in demo mode');
                // Continue without AI for demo purposes
            }

            if (apiKey) {
                console.log('🤖 Initializing AI Team with OpenAI integration...');
                const { coordinator } = await initializeAITeam(apiKey);
                this.aiCoordinator = coordinator;
            } else {
                console.log('📋 Running in demo mode without AI integration');
            }
            
            // Create WebSocket server
            this.wss = new WebSocket.Server({ 
                port: this.port,
                perMessageDeflate: false 
            });
            
            this.wss.on('connection', (ws, request) => {
                this.handleConnection(ws, request);
            });
            
            console.log(`✅ WebSocket AI Bridge running on ws://localhost:${this.port}`);
            console.log('🌐 Ready to stream AI-to-AI communications to frontend dashboard');
            
            // Start demo coordination if AI is available
            if (this.aiCoordinator) {
                setTimeout(() => this.startDemoCoordination(), 2000);
            } else {
                setTimeout(() => this.startMockCoordination(), 2000);
            }
            
        } catch (error) {
            console.error('❌ Failed to start WebSocket AI Bridge:', error);
        }
    }

    /**
     * Handle new WebSocket connection
     */
    handleConnection(ws, request) {
        const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`🔗 New client connected: ${clientId}`);
        
        this.connectedClients.add(ws);
        ws.clientId = clientId;
        
        // Send welcome message with current AI team status
        this.sendToClient(ws, {
            type: 'connection_established',
            clientId,
            message: 'Connected to AI Team Coordination System',
            aiTeamStatus: this.aiCoordinator ? 'active' : 'demo_mode',
            availableSpecialists: [
                { id: 'erik', name: 'Erik Backend', role: 'Senior Backend Specialist', emoji: '🔧', status: 'ready' },
                { id: 'astrid', name: 'Astrid Frontend', role: 'Creative Frontend Specialist', emoji: '🎨', status: 'ready' },
                { id: 'lars', name: 'Lars DevOps', role: 'Senior DevOps Specialist', emoji: '🚢', status: 'ready' },
                { id: 'ingrid', name: 'Ingrid Testing', role: 'Senior Testing Specialist', emoji: '🧪', status: 'ready' }
            ]
        });
        
        // Send recent communication history
        if (this.communicationHistory.length > 0) {
            this.sendToClient(ws, {
                type: 'communication_history',
                history: this.communicationHistory.slice(-10) // Last 10 messages
            });
        }
        
        // Handle incoming messages from client
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                this.handleClientMessage(ws, data);
            } catch (error) {
                console.error('Error parsing client message:', error);
                this.sendToClient(ws, {
                    type: 'error',
                    message: 'Invalid message format'
                });
            }
        });
        
        // Handle client disconnect
        ws.on('close', () => {
            console.log(`🔌 Client disconnected: ${clientId}`);
            this.connectedClients.delete(ws);
        });
        
        // Handle connection errors
        ws.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.connectedClients.delete(ws);
        });
    }

    /**
     * Handle messages from frontend clients
     */
    async handleClientMessage(ws, data) {
        console.log(`📨 Message from ${ws.clientId}:`, data.type);
        
        switch (data.type) {
            case 'start_project':
                await this.handleStartProject(ws, data);
                break;
                
            case 'coordinate_task':
                await this.handleCoordinateTask(ws, data);
                break;
                
            case 'send_message':
                await this.handleSendMessage(ws, data);
                break;
                
            case 'get_team_status':
                this.handleGetTeamStatus(ws);
                break;
                
            default:
                this.sendToClient(ws, {
                    type: 'error',
                    message: `Unknown message type: ${data.type}`
                });
        }
    }

    /**
     * Start new AI coordination project
     */
    async handleStartProject(ws, data) {
        console.log(`🚀 Starting project: ${data.projectName}`);
        
        const projectId = `project-${Date.now()}`;
        const project = {
            id: projectId,
            name: data.projectName,
            description: data.description,
            requirements: data.requirements,
            status: 'active',
            startTime: new Date().toISOString(),
            client: ws.clientId
        };
        
        this.activeProjects.set(projectId, project);
        
        // Broadcast project start to all clients
        this.broadcast({
            type: 'project_started',
            project,
            message: `🚀 New project started: ${data.projectName}`
        });
        
        // Start AI coordination if available
        if (this.aiCoordinator) {
            try {
                const specialists = ['ai-erik-backend', 'ai-astrid-frontend', 'ai-lars-devops', 'ai-ingrid-testing'];
                const projectTeam = await this.aiCoordinator.createProjectTeam(
                    projectId,
                    data.projectName,
                    data.requirements,
                    specialists
                );
                
                this.broadcast({
                    type: 'ai_team_assembled',
                    projectId,
                    team: projectTeam.specialists.map(s => ({
                        name: s.name,
                        role: s.role,
                        capabilities: s.capabilities
                    }))
                });
                
            } catch (error) {
                console.error('Error creating AI team:', error);
                this.sendToClient(ws, {
                    type: 'error',
                    message: 'Failed to create AI team for project'
                });
            }
        } else {
            // Mock AI team assembly
            this.simulateProjectStart(projectId, data.projectName);
        }
    }

    /**
     * Coordinate task across AI specialists
     */
    async handleCoordinateTask(ws, data) {
        console.log(`🎯 Coordinating task: ${data.task}`);
        
        if (this.aiCoordinator) {
            try {
                const results = await this.aiCoordinator.coordinateTask(
                    data.projectId,
                    data.task,
                    data.specialists || ['ai-erik-backend', 'ai-astrid-frontend']
                );
                
                this.broadcast({
                    type: 'task_coordination_complete',
                    projectId: data.projectId,
                    task: data.task,
                    results: results.map(r => ({
                        specialist: r.specialist,
                        response: r.response.substring(0, 200) + '...', // Truncate for UI
                        timestamp: r.timestamp
                    }))
                });
                
            } catch (error) {
                console.error('Error coordinating task:', error);
                this.sendToClient(ws, {
                    type: 'error',
                    message: 'Failed to coordinate task'
                });
            }
        } else {
            // Mock task coordination
            this.simulateTaskCoordination(data.projectId, data.task);
        }
    }

    /**
     * Handle direct message between specialists
     */
    async handleSendMessage(ws, data) {
        if (this.aiCoordinator) {
            try {
                const response = await this.aiCoordinator.facilitateCommunication(
                    data.fromSpecialist,
                    data.toSpecialist,
                    data.message,
                    data.context || {}
                );
                
                const communicationRecord = {
                    id: Date.now(),
                    from: data.fromSpecialist,
                    to: data.toSpecialist,
                    message: data.message,
                    response,
                    timestamp: new Date().toISOString(),
                    projectId: data.projectId
                };
                
                this.communicationHistory.push(communicationRecord);
                
                this.broadcast({
                    type: 'ai_communication',
                    communication: communicationRecord
                });
                
            } catch (error) {
                console.error('Error facilitating communication:', error);
                this.sendToClient(ws, {
                    type: 'error',
                    message: 'Failed to send message'
                });
            }
        } else {
            // Mock communication
            this.simulateAICommunication(data.fromSpecialist, data.toSpecialist, data.message);
        }
    }

    /**
     * Get current team status
     */
    handleGetTeamStatus(ws) {
        if (this.aiCoordinator) {
            const teamStatus = this.aiCoordinator.getTeamStatus();
            this.sendToClient(ws, {
                type: 'team_status',
                status: teamStatus
            });
        } else {
            this.sendToClient(ws, {
                type: 'team_status',
                status: {
                    specialists: [
                        { name: 'Erik Backend', status: 'ready', role: 'Senior Backend Specialist' },
                        { name: 'Astrid Frontend', status: 'ready', role: 'Creative Frontend Specialist' },
                        { name: 'Lars DevOps', status: 'ready', role: 'Senior DevOps Specialist' },
                        { name: 'Ingrid Testing', status: 'ready', role: 'Senior Testing Specialist' }
                    ],
                    mode: 'demo'
                }
            });
        }
    }

    /**
     * Send message to specific client
     */
    sendToClient(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                ...message,
                timestamp: new Date().toISOString()
            }));
        }
    }

    /**
     * Broadcast message to all connected clients
     */
    broadcast(message) {
        const broadcastMessage = JSON.stringify({
            ...message,
            timestamp: new Date().toISOString()
        });
        
        this.connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastMessage);
            }
        });
        
        console.log(`📡 Broadcasted: ${message.type} to ${this.connectedClients.size} clients`);
    }

    /**
     * Start demo AI coordination sequence
     */
    async startDemoCoordination() {
        console.log('🎭 Starting demo AI coordination sequence...');
        
        // Create demo project
        const demoProject = {
            id: 'demo-ecommerce',
            name: 'E-commerce Platform Demo',
            description: 'Demonstrating AI-to-AI coordination for building an e-commerce platform',
            requirements: 'Full-stack e-commerce with AI recommendations',
            status: 'active',
            startTime: new Date().toISOString()
        };
        
        this.activeProjects.set('demo-ecommerce', demoProject);
        
        this.broadcast({
            type: 'project_started',
            project: demoProject,
            message: '🎭 Demo project started: AI Team will now coordinate autonomously'
        });
        
        // Simulate AI coordination sequence
        await this.runDemoSequence();
    }

    /**
     * Run demo coordination sequence
     */
    async runDemoSequence() {
        const delays = [2000, 3000, 4000, 2500, 3500];
        const communications = [
            {
                from: 'Erik Backend',
                to: 'Astrid Frontend',
                message: 'I\'ve designed the API architecture. We need these endpoints: /api/products, /api/cart, /api/users, /api/recommendations',
                response: 'Perfect! I\'ll design the UI components around these endpoints. Can you provide WebSocket support for real-time cart updates?'
            },
            {
                from: 'Astrid Frontend', 
                to: 'Lars DevOps',
                message: 'The React app will need CI/CD pipeline with automatic deployment. We\'re using TypeScript and Tailwind CSS.',
                response: 'I\'ll set up GitHub Actions with automated testing and Railway deployment. The pipeline will include type checking and build optimization.'
            },
            {
                from: 'Lars DevOps',
                to: 'Ingrid Testing',
                message: 'Deployment pipeline ready. We need comprehensive testing strategy including API tests, e2e tests, and performance tests.',
                response: 'I\'ll implement Jest for unit tests, Playwright for e2e testing, and k6 for load testing. Coverage threshold set to 90%.'
            },
            {
                from: 'Erik Backend',
                to: 'Lars DevOps',
                message: 'Database needs pgvector for AI recommendations. Can you ensure PostgreSQL with extensions is available?',
                response: 'Railway PostgreSQL configured with pgvector extension. Connection pooling and backup strategy implemented.'
            },
            {
                from: 'Ingrid Testing',
                to: 'Astrid Frontend',
                message: 'All tests passing! Performance benchmarks: <100ms API response, 95+ Lighthouse score. Ready for production.',
                response: 'Excellent! UI is polished and responsive. All accessibility tests passing. The e-commerce platform is production-ready! 🚀'
            }
        ];
        
        for (let i = 0; i < communications.length; i++) {
            await new Promise(resolve => setTimeout(resolve, delays[i]));
            
            const comm = communications[i];
            const communicationRecord = {
                id: Date.now(),
                from: comm.from,
                to: comm.to,
                message: comm.message,
                response: comm.response,
                timestamp: new Date().toISOString(),
                projectId: 'demo-ecommerce'
            };
            
            this.communicationHistory.push(communicationRecord);
            
            this.broadcast({
                type: 'ai_communication',
                communication: communicationRecord
            });
        }
        
        // Final project completion
        setTimeout(() => {
            this.broadcast({
                type: 'project_completed',
                projectId: 'demo-ecommerce',
                message: '✅ E-commerce platform completed! All AI specialists coordinated successfully.',
                summary: {
                    totalCommunications: communications.length,
                    completionTime: '12 minutes',
                    specialists: 4,
                    deliverables: ['Backend API', 'Frontend UI', 'DevOps Pipeline', 'Test Suite']
                }
            });
        }, 4000);
    }

    /**
     * Mock coordination for demo without AI
     */
    simulateProjectStart(projectId, projectName) {
        setTimeout(() => {
            this.broadcast({
                type: 'ai_team_assembled',
                projectId,
                message: `🤖 AI Team assembled for ${projectName}`,
                team: [
                    { name: 'Erik Backend', role: 'Senior Backend Specialist', status: 'analyzing' },
                    { name: 'Astrid Frontend', role: 'Creative Frontend Specialist', status: 'designing' },
                    { name: 'Lars DevOps', role: 'Senior DevOps Specialist', status: 'planning' },
                    { name: 'Ingrid Testing', role: 'Senior Testing Specialist', status: 'strategizing' }
                ]
            });
        }, 1000);
    }

    /**
     * Mock task coordination
     */
    simulateTaskCoordination(projectId, task) {
        setTimeout(() => {
            this.broadcast({
                type: 'task_coordination_complete',
                projectId,
                task,
                results: [
                    { specialist: 'Erik Backend', response: 'Backend implementation completed with PostgreSQL and Express.js...', timestamp: new Date().toISOString() },
                    { specialist: 'Astrid Frontend', response: 'React TypeScript frontend created with responsive design...', timestamp: new Date().toISOString() }
                ]
            });
        }, 2000);
    }

    /**
     * Mock AI communication
     */
    simulateAICommunication(from, to, message) {
        setTimeout(() => {
            const communicationRecord = {
                id: Date.now(),
                from,
                to, 
                message,
                response: `Acknowledged. Working on the task related to: ${message.substring(0, 50)}...`,
                timestamp: new Date().toISOString(),
                projectId: 'mock-project'
            };
            
            this.communicationHistory.push(communicationRecord);
            
            this.broadcast({
                type: 'ai_communication',
                communication: communicationRecord
            });
        }, 1000);
    }

    /**
     * Start mock coordination for demo mode
     */
    async startMockCoordination() {
        console.log('🎭 Starting mock AI coordination (no OpenAI key)...');
        await this.runDemoSequence();
    }
}

// Start the WebSocket bridge if run directly
if (require.main === module) {
    const bridge = new WebSocketAIBridge(process.env.PORT || 8081);
    bridge.start().catch(console.error);
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🔌 Shutting down WebSocket AI Bridge...');
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        console.log('🔌 Shutting down WebSocket AI Bridge...');
        process.exit(0);
    });
}

module.exports = WebSocketAIBridge;