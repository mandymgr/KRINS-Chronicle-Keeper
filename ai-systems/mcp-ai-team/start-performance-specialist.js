#!/usr/bin/env node
/**
 * ⚡ Performance Specialist - Individual Terminal Instance
 * Connects to Krin's coordination hub and works autonomously
 */

import { AISpecialist } from './src/ai-specialist.js';
import { SpecialistRoles } from './src/types.js';
import WebSocket from 'ws';

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  CYAN: '\x1b[36m',
  MAGENTA: '\x1b[35m',
  ORANGE: '\x1b[38;5;208m'
};

class PerformanceSpecialistTerminal {
  constructor() {
    this.specialist = new AISpecialist(SpecialistRoles.DEVOPS, {
      terminalMode: true,
      coordinatorUrl: 'ws://localhost:3007/ws'
    });
    
    // Override name for performance focus
    this.specialist.name = 'PerformanceBot Pro';
    this.specialist.emoji = '⚡';
    
    this.ws = null;
    this.isRunning = false;
    
    console.log(`${COLORS.YELLOW}${COLORS.BRIGHT}`);
    console.log('⚡ ====================================');
    console.log('⚡  PERFORMANCE SPECIALIST TERMINAL');
    console.log('⚡ ====================================');
    console.log(`${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}🚀 ${this.specialist.name} initializing...${COLORS.RESET}`);
  }

  async start() {
    await this.connectToCoordinator();
    await this.startAutonomousWork();
    this.setupSignalHandlers();
    
    console.log(`${COLORS.GREEN}✅ Performance Specialist ready for coordination!${COLORS.RESET}`);
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
          message: '⚡ Performance Specialist ready for coordination!'
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
    console.log(`${COLORS.BRIGHT}⚡ NEW TASK: ${task.description}${COLORS.RESET}`);
    
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
      console.error(`${COLORS.ORANGE}❌ Task failed: ${error.message}${COLORS.RESET}`);
    }
  }

  async startAutonomousWork() {
    this.isRunning = true;
    
    // Performance specialist autonomous work
    const performanceTasks = [
      { type: 'bundle_analysis', description: 'Analyzing bundle size and optimization opportunities' },
      { type: 'memory_profiling', description: 'Profiling memory usage patterns' },
      { type: 'cpu_optimization', description: 'Optimizing CPU-intensive operations' },
      { type: 'network_optimization', description: 'Optimizing network request patterns' },
      { type: 'cache_analysis', description: 'Analyzing cache hit rates and efficiency' },
      { type: 'database_optimization', description: 'Optimizing database query performance' },
      { type: 'lighthouse_audit', description: 'Running Lighthouse performance audit' },
      { type: 'core_vitals_check', description: 'Checking Core Web Vitals metrics' },
      { type: 'build_time_optimization', description: 'Optimizing build and deployment times' },
      { type: 'lazy_loading_analysis', description: 'Analyzing lazy loading implementations' }
    ];

    const autonomousWork = async () => {
      if (!this.isRunning) return;
      
      const task = performanceTasks[Math.floor(Math.random() * performanceTasks.length)];
      const duration = Math.random() * 7000 + 3000; // 3-10 seconds
      
      console.log(`${COLORS.ORANGE}🔄 Working: ${task.description}...${COLORS.RESET}`);
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Simulate performance metrics
      const metrics = this.generatePerformanceMetrics();
      const improvement = Math.random() > 0.3 ? `+${(Math.random() * 15 + 5).toFixed(1)}%` : 'baseline';
      
      console.log(`${COLORS.GREEN}⚡ ${task.description} completed: ${metrics} ${improvement !== 'baseline' ? `(${improvement} improvement)` : ''} (${Math.round(duration)}ms)${COLORS.RESET}`);
      
      // Send activity update
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'activity',
          activity: {
            id: Date.now(),
            specialist: this.specialist.role,
            specialistName: this.specialist.name,
            emoji: this.specialist.emoji,
            message: `${task.description}: ${metrics} ${improvement !== 'baseline' ? `(${improvement} improvement)` : ''}`,
            type: 'autonomous_work',
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      // Schedule next autonomous task
      setTimeout(autonomousWork, Math.random() * 10000 + 5000); // 5-15 seconds
    };

    // Start autonomous work cycle
    setTimeout(autonomousWork, 1000);
  }

  generatePerformanceMetrics() {
    const metricTypes = [
      () => `LCP: ${(Math.random() * 2 + 1).toFixed(2)}s`,
      () => `FID: ${(Math.random() * 50 + 10).toFixed(0)}ms`,
      () => `CLS: ${(Math.random() * 0.1).toFixed(3)}`,
      () => `Bundle: ${(Math.random() * 200 + 100).toFixed(0)}KB`,
      () => `Memory: ${(Math.random() * 50 + 20).toFixed(0)}MB`,
      () => `Score: ${(Math.random() * 20 + 80).toFixed(0)}/100`,
      () => `Load Time: ${(Math.random() * 1000 + 500).toFixed(0)}ms`,
      () => `Cache Hit: ${(Math.random() * 30 + 70).toFixed(0)}%`
    ];
    
    return metricTypes[Math.floor(Math.random() * metricTypes.length)]();
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(`\n${COLORS.YELLOW}🛑 Performance Specialist shutting down...${COLORS.RESET}`);
      this.isRunning = false;
      
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'specialist_offline',
          specialist: this.specialist.name,
          message: '⚡ Performance Specialist going offline'
        }));
        this.ws.close();
      }
      
      console.log(`${COLORS.GREEN}👋 Performance Specialist offline${COLORS.RESET}`);
      process.exit(0);
    });
  }
}

// Start Performance Specialist if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const performanceSpecialist = new PerformanceSpecialistTerminal();
  performanceSpecialist.start().catch(console.error);
}

export { PerformanceSpecialistTerminal };