#!/usr/bin/env node
/**
 * ⚙️ Backend Specialist - Individual Terminal Instance
 * Connects to Krin's coordination hub and works autonomously
 */

import { AISpecialist } from './src/ai-specialist.js';
import { SpecialistRoles, TaskTypes } from './src/types.js';
import WebSocket from 'ws';

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  BLUE: '\x1b[36m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m'
};

class BackendSpecialistTerminal {
  constructor() {
    this.specialist = new AISpecialist(SpecialistRoles.BACKEND, {
      terminalMode: true,
      coordinatorUrl: 'ws://localhost:3007/ws'
    });
    
    this.ws = null;
    this.isRunning = false;
    
    console.log(`${COLORS.BLUE}${COLORS.BRIGHT}`);
    console.log('⚙️ ====================================');
    console.log('⚙️  BACKEND SPECIALIST TERMINAL');
    console.log('⚙️ ====================================');
    console.log(`${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}🚀 ${this.specialist.name} initializing...${COLORS.RESET}`);
  }

  async start() {
    await this.connectToCoordinator();
    await this.startAutonomousWork();
    this.setupSignalHandlers();
    
    console.log(`${COLORS.GREEN}✅ Backend Specialist ready for coordination!${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}💬 Listening for tasks from Krin...${COLORS.RESET}\n`);
  }

  async connectToCoordinator() {
    try {
      this.ws = new WebSocket('ws://localhost:3007/ws');
      
      this.ws.on('open', () => {
        console.log(`${COLORS.GREEN}🔌 Connected to Krin's coordination hub${COLORS.RESET}`);
        this.ws.send(JSON.stringify({
          type: 'specialist_online',
          specialist: this.specialist.getStatus(),
          message: '⚙️ Backend Specialist ready for coordination!'
        }));
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleCoordinationMessage(message);
        } catch (error) {
          console.error('Failed to parse coordination message:', error);
        }
      });

      this.ws.on('close', () => {
        console.log(`${COLORS.YELLOW}🔌 Disconnected from coordination hub${COLORS.RESET}`);
      });

    } catch (error) {
      console.error(`${COLORS.YELLOW}⚠️  Could not connect to coordinator - working independently${COLORS.RESET}`);
    }
  }

  handleCoordinationMessage(message) {
    switch (message.type) {
      case 'task_assignment':
        this.handleTaskAssignment(message.task);
        break;
      case 'team_message':
        console.log(`${COLORS.BLUE}💬 Team: ${message.content}${COLORS.RESET}`);
        break;
      case 'coordination':
        console.log(`${COLORS.BLUE}🚀 Krin: ${message.message}${COLORS.RESET}`);
        break;
      default:
        console.log(`${COLORS.YELLOW}📨 ${message.type}: ${JSON.stringify(message)}${COLORS.RESET}`);
    }
  }

  async handleTaskAssignment(task) {
    console.log(`${COLORS.BRIGHT}⚙️ NEW TASK: ${task.description}${COLORS.RESET}`);
    
    try {
      const result = await this.specialist.acceptTask(task);
      
      if (result.success) {
        console.log(`${COLORS.GREEN}✅ Task completed successfully!${COLORS.RESET}`);
      } else {
        console.log(`${COLORS.YELLOW}⚠️  Task completed with issues: ${result.error}${COLORS.RESET}`);
      }

      // Report back to coordinator
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'task_result',
          taskId: task.id,
          result: result,
          specialist: this.specialist.name
        }));
      }

    } catch (error) {
      console.error(`${COLORS.YELLOW}❌ Task failed: ${error.message}${COLORS.RESET}`);
    }
  }

  async startAutonomousWork() {
    this.isRunning = true;
    
    // Simulate autonomous backend work
    const backendTasks = [
      { type: 'api_optimization', description: 'Optimizing API response times' },
      { type: 'database_query', description: 'Optimizing database queries' },
      { type: 'cache_management', description: 'Managing Redis cache layers' },
      { type: 'error_monitoring', description: 'Monitoring application errors' },
      { type: 'performance_analysis', description: 'Analyzing backend performance metrics' }
    ];

    const autonomousWork = async () => {
      if (!this.isRunning) return;
      
      const task = backendTasks[Math.floor(Math.random() * backendTasks.length)];
      const duration = Math.random() * 5000 + 3000; // 3-8 seconds
      
      console.log(`${COLORS.BLUE}🔄 Working: ${task.description}...${COLORS.RESET}`);
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      console.log(`${COLORS.GREEN}⚙️ Completed: ${task.description} (${Math.round(duration)}ms)${COLORS.RESET}`);
      
      // Send activity update
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'activity',
          activity: {
            id: Date.now(),
            specialist: this.specialist.role,
            specialistName: this.specialist.name,
            emoji: this.specialist.emoji,
            message: `Completed: ${task.description}`,
            type: 'autonomous_work',
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      // Schedule next autonomous task
      setTimeout(autonomousWork, Math.random() * 10000 + 5000); // 5-15 seconds
    };

    // Start autonomous work cycle
    setTimeout(autonomousWork, 2000);
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(`\n${COLORS.YELLOW}🛑 Backend Specialist shutting down...${COLORS.RESET}`);
      this.isRunning = false;
      
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'specialist_offline',
          specialist: this.specialist.name,
          message: '⚙️ Backend Specialist going offline'
        }));
        this.ws.close();
      }
      
      console.log(`${COLORS.GREEN}👋 Backend Specialist offline${COLORS.RESET}`);
      process.exit(0);
    });
  }
}

// Start Backend Specialist if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const backendSpecialist = new BackendSpecialistTerminal();
  backendSpecialist.start().catch(console.error);
}

export { BackendSpecialistTerminal };