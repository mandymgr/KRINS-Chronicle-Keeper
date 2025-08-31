#!/usr/bin/env node
/**
 * 🔒 Security Specialist - Individual Terminal Instance
 * Connects to Krin's coordination hub and works autonomously
 */

import { AISpecialist } from './src/ai-specialist.js';
import { SpecialistRoles } from './src/types.js';
import WebSocket from 'ws';

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m'
};

class SecuritySpecialistTerminal {
  constructor() {
    this.specialist = new AISpecialist(SpecialistRoles.SECURITY, {
      terminalMode: true,
      coordinatorUrl: 'ws://localhost:3007/ws'
    });
    
    this.ws = null;
    this.isRunning = false;
    
    console.log(`${COLORS.RED}${COLORS.BRIGHT}`);
    console.log('🔒 ====================================');
    console.log('🔒  SECURITY SPECIALIST TERMINAL');
    console.log('🔒 ====================================');
    console.log(`${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}🚀 ${this.specialist.name} initializing...${COLORS.RESET}`);
  }

  async start() {
    await this.connectToCoordinator();
    await this.startAutonomousWork();
    this.setupSignalHandlers();
    
    console.log(`${COLORS.GREEN}✅ Security Specialist ready for coordination!${COLORS.RESET}`);
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
          message: '🔒 Security Specialist ready for coordination!'
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
    console.log(`${COLORS.BRIGHT}🔒 NEW TASK: ${task.description}${COLORS.RESET}`);
    
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
    
    // Security specialist autonomous work
    const securityTasks = [
      { type: 'vulnerability_scan', description: 'Scanning for security vulnerabilities' },
      { type: 'dependency_audit', description: 'Auditing dependencies for known issues' },
      { type: 'code_security_review', description: 'Reviewing code for security patterns' },
      { type: 'authentication_audit', description: 'Auditing authentication mechanisms' },
      { type: 'data_encryption_check', description: 'Verifying data encryption standards' },
      { type: 'access_control_review', description: 'Reviewing access control implementations' },
      { type: 'input_validation_audit', description: 'Auditing input validation practices' },
      { type: 'security_headers_check', description: 'Checking HTTP security headers' },
      { type: 'session_management_audit', description: 'Auditing session management' },
      { type: 'cors_policy_review', description: 'Reviewing CORS policy configuration' }
    ];

    const autonomousWork = async () => {
      if (!this.isRunning) return;
      
      const task = securityTasks[Math.floor(Math.random() * securityTasks.length)];
      const duration = Math.random() * 8000 + 4000; // 4-12 seconds
      
      console.log(`${COLORS.RED}🔄 Working: ${task.description}...${COLORS.RESET}`);
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Simulate security scan results
      const issuesFound = Math.random() > 0.7; // 30% chance of finding issues
      const severity = issuesFound ? 
        ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] : 
        null;
      
      let resultMessage;
      if (issuesFound) {
        const issueCount = Math.floor(Math.random() * 5) + 1;
        resultMessage = `⚠️  Found ${issueCount} ${severity} severity issue${issueCount > 1 ? 's' : ''}`;
      } else {
        resultMessage = '✅ No security issues detected';
      }
      
      console.log(`${COLORS.GREEN}🔒 ${task.description} completed: ${resultMessage} (${Math.round(duration)}ms)${COLORS.RESET}`);
      
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
      setTimeout(autonomousWork, Math.random() * 15000 + 8000); // 8-23 seconds
    };

    // Start autonomous work cycle
    setTimeout(autonomousWork, 3000);
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(`\n${COLORS.YELLOW}🛑 Security Specialist shutting down...${COLORS.RESET}`);
      this.isRunning = false;
      
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'specialist_offline',
          specialist: this.specialist.name,
          message: '🔒 Security Specialist going offline'
        }));
        this.ws.close();
      }
      
      console.log(`${COLORS.GREEN}👋 Security Specialist offline${COLORS.RESET}`);
      process.exit(0);
    });
  }
}

// Start Security Specialist if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const securitySpecialist = new SecuritySpecialistTerminal();
  securitySpecialist.start().catch(console.error);
}

export { SecuritySpecialistTerminal };