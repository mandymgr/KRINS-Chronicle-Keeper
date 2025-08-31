#!/usr/bin/env node
/**
 * 🎨 Frontend Specialist - Individual Terminal Instance
 * Connects to Krin's coordination hub and works autonomously
 */

import { AISpecialist } from './src/ai-specialist.js';
import { SpecialistRoles } from './src/types.js';
import WebSocket from 'ws';

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  PINK: '\x1b[35m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m'
};

class FrontendSpecialistTerminal {
  constructor() {
    this.specialist = new AISpecialist(SpecialistRoles.FRONTEND, {
      terminalMode: true,
      coordinatorUrl: 'ws://localhost:3007/ws'
    });
    
    this.ws = null;
    this.isRunning = false;
    
    console.log(`${COLORS.PINK}${COLORS.BRIGHT}`);
    console.log('🎨 ====================================');
    console.log('🎨  FRONTEND SPECIALIST TERMINAL');
    console.log('🎨 ====================================');
    console.log(`${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}🚀 ${this.specialist.name} initializing...${COLORS.RESET}`);
  }

  async start() {
    await this.connectToCoordinator();
    await this.startAutonomousWork();
    this.setupSignalHandlers();
    
    console.log(`${COLORS.GREEN}✅ Frontend Specialist ready for coordination!${COLORS.RESET}`);
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
          message: '🎨 Frontend Specialist ready for coordination!'
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
        console.log(`${COLORS.CYAN}💬 Team: ${message.content}${COLORS.RESET}`);
        break;
      case 'coordination':
        console.log(`${COLORS.CYAN}🚀 Krin: ${message.message}${COLORS.RESET}`);
        break;
      default:
        console.log(`${COLORS.YELLOW}📨 ${message.type}: ${JSON.stringify(message)}${COLORS.RESET}`);
    }
  }

  async handleTaskAssignment(task) {
    console.log(`${COLORS.BRIGHT}🎨 NEW TASK: ${task.description}${COLORS.RESET}`);
    
    try {
      const result = await this.specialist.acceptTask(task);
      
      if (result.success) {
        console.log(`${COLORS.GREEN}✅ Task completed successfully!${COLORS.RESET}`);
      } else {
        console.log(`${COLORS.YELLOW}⚠️  Task completed with issues: ${result.error}${COLORS.RESET}`);
      }

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
    
    // Simulate autonomous frontend work
    const frontendTasks = [
      { type: 'component_development', description: 'Building React components' },
      { type: 'ui_optimization', description: 'Optimizing user interface performance' },
      { type: 'responsive_design', description: 'Implementing responsive design patterns' },
      { type: 'state_management', description: 'Managing application state' },
      { type: 'accessibility_audit', description: 'Auditing accessibility compliance' },
      { type: 'animation_polish', description: 'Polishing UI animations and transitions' }
    ];

    const autonomousWork = async () => {
      if (!this.isRunning) return;
      
      const task = frontendTasks[Math.floor(Math.random() * frontendTasks.length)];
      const duration = Math.random() * 4000 + 2000; // 2-6 seconds
      
      console.log(`${COLORS.PINK}🔄 Working: ${task.description}...${COLORS.RESET}`);
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      console.log(`${COLORS.GREEN}🎨 Completed: ${task.description} (${Math.round(duration)}ms)${COLORS.RESET}`);
      
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
      setTimeout(autonomousWork, Math.random() * 8000 + 4000); // 4-12 seconds
    };

    // Start autonomous work cycle
    setTimeout(autonomousWork, 1500);
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(`\n${COLORS.YELLOW}🛑 Frontend Specialist shutting down...${COLORS.RESET}`);
      this.isRunning = false;
      
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'specialist_offline',
          specialist: this.specialist.name,
          message: '🎨 Frontend Specialist going offline'
        }));
        this.ws.close();
      }
      
      console.log(`${COLORS.GREEN}👋 Frontend Specialist offline${COLORS.RESET}`);
      process.exit(0);
    });
  }
}

// Start Frontend Specialist if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const frontendSpecialist = new FrontendSpecialistTerminal();
  frontendSpecialist.start().catch(console.error);
}

export { FrontendSpecialistTerminal };