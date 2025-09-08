#!/usr/bin/env node

/**
 * 🎯 KRINS Development Orchestrator
 * Revolutionary development automation system for the complete AI ecosystem
 */

import { spawn, exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// AI System Configuration
const AI_SYSTEMS = {
  'mcp-ai-team': {
    port: 3006,
    directory: 'mcp-ai-team',
    startCommand: 'npm start',
    healthCheck: 'http://localhost:3006/health',
    dependencies: ['redis']
  },
  'semantic-search': {
    port: 3003,
    directory: 'semantic-search-backend',
    startCommand: 'npm start',
    healthCheck: 'http://localhost:3003/health',
    dependencies: ['postgresql', 'tensorflow']
  },
  'ai-pattern-bridge': {
    port: 3007,
    directory: 'ai-pattern-bridge',
    startCommand: 'npm start',
    healthCheck: 'http://localhost:3007/health',
    dependencies: ['redis', 'mcp-ai-team', 'semantic-search']
  },
  'github-webhook': {
    port: 3008,
    directory: 'github-webhook-handler',
    startCommand: 'npm start',
    healthCheck: 'http://localhost:3008/health',
    dependencies: ['ai-pattern-bridge', 'mcp-ai-team']
  },
  'frontend': {
    port: 3000,
    directory: 'frontend',
    startCommand: 'npm start',
    healthCheck: 'http://localhost:3000',
    dependencies: ['ai-pattern-bridge', 'github-webhook']
  }
};

class DevOrchestrator {
  constructor() {
    this.processes = new Map();
    this.healthChecks = new Map();
    this.startupOrder = this.calculateStartupOrder();
    
    console.log('🎯 KRINS Development Orchestrator initialized');
    console.log(`📁 Project root: ${PROJECT_ROOT}`);
  }

  /**
   * Calculate optimal startup order based on dependencies
   */
  calculateStartupOrder() {
    const sorted = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (systemName) => {
      if (temp.has(systemName)) {
        throw new Error(`Circular dependency detected: ${systemName}`);
      }
      
      if (visited.has(systemName)) return;
      
      temp.add(systemName);
      
      const system = AI_SYSTEMS[systemName];
      if (system.dependencies) {
        for (const dep of system.dependencies) {
          if (AI_SYSTEMS[dep]) {
            visit(dep);
          }
        }
      }
      
      temp.delete(systemName);
      visited.add(systemName);
      sorted.push(systemName);
    };

    for (const systemName of Object.keys(AI_SYSTEMS)) {
      visit(systemName);
    }

    return sorted;
  }

  /**
   * Start all AI systems in the correct order
   */
  async startAll() {
    console.log('\n🚀 Starting KRINS AI Ecosystem...');
    console.log(`📋 Startup order: ${this.startupOrder.join(' → ')}`);

    // First, verify all directories exist and install dependencies
    await this.verifyAndSetup();

    // Start systems in dependency order
    for (const systemName of this.startupOrder) {
      await this.startSystem(systemName);
      await this.waitForHealth(systemName);
    }

    console.log('\n✅ All AI systems started successfully!');
    this.printSystemStatus();
    this.startHealthMonitoring();
  }

  /**
   * Verify directories exist and install dependencies
   */
  async verifyAndSetup() {
    console.log('\n🔧 Verifying setup and dependencies...');
    
    for (const [systemName, config] of Object.entries(AI_SYSTEMS)) {
      const systemPath = path.join(PROJECT_ROOT, config.directory);
      
      try {
        await fs.access(systemPath);
        console.log(`✅ ${systemName}: Directory exists`);
        
        // Check for package.json and install dependencies
        const packageJsonPath = path.join(systemPath, 'package.json');
        try {
          await fs.access(packageJsonPath);
          
          // Install dependencies if node_modules doesn't exist
          const nodeModulesPath = path.join(systemPath, 'node_modules');
          try {
            await fs.access(nodeModulesPath);
            console.log(`✅ ${systemName}: Dependencies already installed`);
          } catch {
            console.log(`📦 ${systemName}: Installing dependencies...`);
            await this.runCommand('npm install', { cwd: systemPath });
          }
        } catch {
          console.log(`⚠️  ${systemName}: No package.json found`);
        }
      } catch {
        console.log(`❌ ${systemName}: Directory not found at ${systemPath}`);
      }
    }
  }

  /**
   * Start individual AI system
   */
  async startSystem(systemName) {
    const config = AI_SYSTEMS[systemName];
    const systemPath = path.join(PROJECT_ROOT, config.directory);
    
    console.log(`\n🚀 Starting ${systemName}...`);
    
    try {
      await fs.access(systemPath);
      
      const child = spawn('npm', ['start'], {
        cwd: systemPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { 
          ...process.env, 
          NODE_ENV: 'development',
          PORT: config.port.toString()
        }
      });

      this.processes.set(systemName, child);

      // Log output with system prefix
      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.log(`[${systemName}] ${line}`);
        });
      });

      child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.log(`[${systemName}] ⚠️  ${line}`);
        });
      });

      child.on('close', (code) => {
        console.log(`[${systemName}] Process exited with code ${code}`);
        this.processes.delete(systemName);
      });

      // Wait a bit for the process to start
      await this.sleep(2000);
      
      console.log(`✅ ${systemName}: Process started (PID: ${child.pid})`);
      
    } catch (error) {
      console.log(`❌ ${systemName}: Failed to start - ${error.message}`);
    }
  }

  /**
   * Wait for system to be healthy
   */
  async waitForHealth(systemName, timeout = 30000) {
    const config = AI_SYSTEMS[systemName];
    const startTime = Date.now();
    
    console.log(`🔍 Waiting for ${systemName} health check...`);
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(config.healthCheck);
        if (response.ok) {
          console.log(`✅ ${systemName}: Health check passed`);
          return true;
        }
      } catch {
        // Health check failed, continue waiting
      }
      
      await this.sleep(1000);
    }
    
    console.log(`⚠️  ${systemName}: Health check timeout (${timeout}ms)`);
    return false;
  }

  /**
   * Start continuous health monitoring
   */
  startHealthMonitoring() {
    console.log('\n📊 Starting health monitoring...');
    
    setInterval(async () => {
      const healthStatus = await this.checkAllHealth();
      this.healthChecks.set(Date.now(), healthStatus);
      
      // Log any unhealthy systems
      const unhealthySystems = Object.entries(healthStatus)
        .filter(([_, healthy]) => !healthy)
        .map(([name]) => name);
      
      if (unhealthySystems.length > 0) {
        console.log(`⚠️  Unhealthy systems: ${unhealthySystems.join(', ')}`);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Check health of all systems
   */
  async checkAllHealth() {
    const healthStatus = {};
    
    for (const [systemName, config] of Object.entries(AI_SYSTEMS)) {
      try {
        const response = await fetch(config.healthCheck, { 
          method: 'GET',
          timeout: 5000 
        });
        healthStatus[systemName] = response.ok;
      } catch {
        healthStatus[systemName] = false;
      }
    }
    
    return healthStatus;
  }

  /**
   * Stop all systems
   */
  async stopAll() {
    console.log('\n🛑 Stopping all AI systems...');
    
    const reverseOrder = [...this.startupOrder].reverse();
    
    for (const systemName of reverseOrder) {
      const process = this.processes.get(systemName);
      if (process) {
        console.log(`🛑 Stopping ${systemName}...`);
        process.kill('SIGTERM');
        
        // Wait a bit for graceful shutdown
        await this.sleep(2000);
        
        if (!process.killed) {
          console.log(`🔪 Force killing ${systemName}...`);
          process.kill('SIGKILL');
        }
      }
    }
    
    console.log('✅ All systems stopped');
  }

  /**
   * Restart specific system
   */
  async restartSystem(systemName) {
    if (!AI_SYSTEMS[systemName]) {
      console.log(`❌ Unknown system: ${systemName}`);
      return;
    }

    console.log(`🔄 Restarting ${systemName}...`);
    
    // Stop the system
    const process = this.processes.get(systemName);
    if (process) {
      process.kill('SIGTERM');
      await this.sleep(2000);
    }

    // Start it again
    await this.startSystem(systemName);
    await this.waitForHealth(systemName);
    
    console.log(`✅ ${systemName} restarted successfully`);
  }

  /**
   * Print current system status
   */
  printSystemStatus() {
    console.log('\n📊 System Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const [systemName, config] of Object.entries(AI_SYSTEMS)) {
      const isRunning = this.processes.has(systemName);
      const status = isRunning ? '🟢 RUNNING' : '🔴 STOPPED';
      console.log(`${systemName.padEnd(20)} ${status.padEnd(12)} http://localhost:${config.port}`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Run shell command
   */
  runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle graceful shutdown
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      await this.stopAll();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}

// CLI Interface
const orchestrator = new DevOrchestrator();
const command = process.argv[2];
const systemName = process.argv[3];

switch (command) {
  case 'start':
    orchestrator.setupGracefulShutdown();
    orchestrator.startAll();
    break;
    
  case 'stop':
    orchestrator.stopAll().then(() => process.exit(0));
    break;
    
  case 'restart':
    if (systemName) {
      orchestrator.restartSystem(systemName).then(() => process.exit(0));
    } else {
      console.log('Usage: npm run dev restart <system-name>');
      process.exit(1);
    }
    break;
    
  case 'status':
    orchestrator.checkAllHealth().then(health => {
      orchestrator.printSystemStatus();
      console.log('\n🔍 Health Status:');
      for (const [name, isHealthy] of Object.entries(health)) {
        console.log(`${name.padEnd(20)} ${isHealthy ? '🟢 HEALTHY' : '🔴 UNHEALTHY'}`);
      }
      process.exit(0);
    });
    break;
    
  default:
    console.log(`
🎯 KRINS Development Orchestrator

Commands:
  start                 Start all AI systems
  stop                  Stop all AI systems
  restart <system>      Restart specific system
  status               Show system status and health

Available Systems:
  ${Object.keys(AI_SYSTEMS).join(', ')}

Examples:
  node scripts/dev-orchestrator.js start
  node scripts/dev-orchestrator.js restart mcp-ai-team
  node scripts/dev-orchestrator.js status
`);
    process.exit(0);
}