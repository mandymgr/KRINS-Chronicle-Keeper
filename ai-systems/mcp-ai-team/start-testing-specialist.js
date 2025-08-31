#!/usr/bin/env node
/**
 * 🧪 Testing Specialist - Individual Terminal Instance
 * Connects to Krin's coordination hub and works autonomously
 */

import { AISpecialist } from './src/ai-specialist.js';
import { SpecialistRoles } from './src/types.js';
import WebSocket from 'ws';

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  MAGENTA: '\x1b[35m',
  RED: '\x1b[31m'
};

class TestingSpecialistTerminal {
  constructor() {
    this.specialist = new AISpecialist(SpecialistRoles.TESTING, {
      terminalMode: true,
      coordinatorUrl: 'ws://localhost:3007/ws'
    });
    
    this.ws = null;
    this.isRunning = false;
    
    console.log(`${COLORS.GREEN}${COLORS.BRIGHT}`);
    console.log('🧪 ====================================');
    console.log('🧪  TESTING SPECIALIST TERMINAL');
    console.log('🧪 ====================================');
    console.log(`${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}🚀 ${this.specialist.name} initializing...${COLORS.RESET}`);
  }

  async start() {
    await this.connectToCoordinator();
    await this.startAutonomousWork();
    this.setupSignalHandlers();
    
    console.log(`${COLORS.GREEN}✅ Testing Specialist ready for coordination!${COLORS.RESET}`);
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
          message: '🧪 Testing Specialist ready for coordination!'
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
    console.log(`${COLORS.BRIGHT}🧪 NEW TASK: ${task.description}${COLORS.RESET}`);
    
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
      console.error(`${COLORS.RED}❌ Task failed: ${error.message}${COLORS.RESET}`);
    }
  }

  async startAutonomousWork() {
    this.isRunning = true;
    
    // Testing specialist autonomous work
    const testingTasks = [
      { type: 'unit_testing', description: 'Running unit tests across components' },
      { type: 'integration_testing', description: 'Executing integration test suites' },
      { type: 'e2e_testing', description: 'Performing end-to-end testing scenarios' },
      { type: 'performance_testing', description: 'Analyzing application performance metrics' },
      { type: 'accessibility_testing', description: 'Auditing accessibility compliance' },
      { type: 'security_testing', description: 'Security vulnerability scanning' },
      { type: 'regression_testing', description: 'Running regression test suites' },
      { type: 'api_testing', description: 'Testing API endpoints and responses' }
    ];

    const autonomousWork = async () => {
      if (!this.isRunning) return;
      
      const task = testingTasks[Math.floor(Math.random() * testingTasks.length)];
      const duration = Math.random() * 6000 + 3000; // 3-9 seconds
      
      console.log(`${COLORS.MAGENTA}🔄 Working: ${task.description}...${COLORS.RESET}`);
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Simulate test results
      const passed = Math.random() > 0.1; // 90% pass rate
      const testCount = Math.floor(Math.random() * 50) + 10; // 10-60 tests
      const passedCount = passed ? testCount : Math.floor(testCount * 0.8);
      
      const resultMessage = passed 
        ? `✅ All ${testCount} tests passed` 
        : `⚠️  ${passedCount}/${testCount} tests passed`;
        
      console.log(`${COLORS.GREEN}🧪 ${task.description} completed: ${resultMessage} (${Math.round(duration)}ms)${COLORS.RESET}`);
      
      // Send activity update
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'activity',
          activity: {
            id: Date.now(),
            specialist: this.specialist.role,
            specialistName: this.specialist.name,
            emoji: this.specialist.emoji,
            message: `${task.description}: ${resultMessage}`,
            type: 'autonomous_work',
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      // Schedule next autonomous task
      setTimeout(autonomousWork, Math.random() * 12000 + 6000); // 6-18 seconds
    };

    // Start autonomous work cycle
    setTimeout(autonomousWork, 2500);
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(`\n${COLORS.YELLOW}🛑 Testing Specialist shutting down...${COLORS.RESET}`);
      this.isRunning = false;
      
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'specialist_offline',
          specialist: this.specialist.name,
          message: '🧪 Testing Specialist going offline'
        }));
        this.ws.close();
      }
      
      console.log(`${COLORS.GREEN}👋 Testing Specialist offline${COLORS.RESET}`);
      process.exit(0);
    });
  }
}

// Start Testing Specialist if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testingSpecialist = new TestingSpecialistTerminal();
  testingSpecialist.start().catch(console.error);
}

export { TestingSpecialistTerminal };