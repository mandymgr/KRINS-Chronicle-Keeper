/**
 * 🤖 AI Team Coordinator - Revolutionary Multi-AI Management Engine
 * 
 * Coordinates multiple Claude Code specialists using browser automation
 * Handles task distribution, progress monitoring, and result coordination
 * 
 * @author Krin - Revolutionary AI Coordination Pioneer
 * @version 1.0.0 - Multi-AI Foundation
 */

const { spawn } = require('child_process');
const EventEmitter = require('events');
const os = require('os');

class AITeamCoordinator extends EventEmitter {
  constructor() {
    super();
    this.terminals = new Map();
    this.specialists = new Map();
    this.activeTeam = new Map();
    this.coordinationState = 'idle';
    this.claudePath = null;
    
    console.log('🤖 AI Team Coordinator initialized - Terminal-based coordination');
  }

  /**
   * Find Claude CLI path dynamically
   */
  async findClaudePath() {
    if (this.claudePath) return this.claudePath;
    
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec('which claude', (error, stdout) => {
        if (error || !stdout.trim()) {
          // Fallback to common npm global paths
          const possiblePaths = [
            '/usr/local/bin/claude',
            '/Users/mandymarigjervikrygg/.nvm/versions/node/v24.5.0/bin/claude',
            process.env.HOME + '/.nvm/versions/node/v24.5.0/bin/claude'
          ];
          
          for (const path of possiblePaths) {
            try {
              if (require('fs').existsSync(path)) {
                this.claudePath = path;
                resolve(path);
                return;
              }
            } catch (e) {}
          }
          resolve('claude'); // fallback to PATH
        } else {
          this.claudePath = stdout.trim();
          resolve(this.claudePath);
        }
      });
    });
  }

  /**
   * Initialize the coordination system
   */
  async initialize() {
    console.log('🚀 Starting revolutionary terminal coordination engine...');
    
    try {
      // Check if Claude Code is installed
      await this.checkClaudeCodeInstallation();
      
      console.log('✅ Terminal coordination engine ready');
      this.coordinationState = 'ready';
      
    } catch (error) {
      console.error('❌ Failed to initialize coordination engine:', error);
      throw error;
    }
  }

  /**
   * Check if Claude Code CLI is installed
   */
  async checkClaudeCodeInstallation() {
    return new Promise(async (resolve, reject) => {
      const claudePath = await this.findClaudePath();
      const checkProcess = spawn(claudePath, ['--version'], { stdio: 'pipe' });
      
      checkProcess.on('error', (error) => {
        console.log('⚠️  Claude Code CLI not found. Installing...');
        this.installClaudeCode().then(resolve).catch(reject);
      });
      
      checkProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Claude Code CLI is installed');
          resolve();
        } else {
          console.log('⚠️  Claude Code CLI not working. Installing...');
          this.installClaudeCode().then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * Install Claude Code CLI
   */
  async installClaudeCode() {
    return new Promise((resolve, reject) => {
      console.log('📦 Installing Claude Code CLI globally...');
      const installProcess = spawn('npm', ['install', '-g', '@anthropic-ai/claude-code'], { 
        stdio: 'pipe' 
      });
      
      installProcess.stdout.on('data', (data) => {
        console.log(`📦 ${data.toString().trim()}`);
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Claude Code CLI installed successfully');
          resolve();
        } else {
          reject(new Error('Failed to install Claude Code CLI'));
        }
      });
    });
  }

  /**
   * Deploy a team of AI specialists
   */
  async deployTeam(specialistConfigs) {
    if (this.coordinationState !== 'ready') {
      throw new Error('Coordination engine not ready');
    }

    console.log(`🎯 Deploying revolutionary AI team: ${specialistConfigs.length} specialists`);
    this.coordinationState = 'deploying';
    
    const deploymentResults = [];
    
    try {
      // Deploy each specialist in parallel
      const deployments = specialistConfigs.map(async (config, index) => {
        const specialist = await this.deploySpecialist(config, index);
        return specialist;
      });
      
      const specialists = await Promise.all(deployments);
      
      // Store active team
      specialists.forEach(specialist => {
        this.activeTeam.set(specialist.id, specialist);
      });
      
      this.coordinationState = 'coordinating';
      console.log('🌟 Revolutionary AI team deployment complete!');
      
      this.emit('team-deployed', specialists);
      return specialists;
      
    } catch (error) {
      console.error('❌ Team deployment failed:', error);
      this.coordinationState = 'error';
      throw error;
    }
  }

  /**
   * Deploy individual AI specialist
   */
  async deploySpecialist(config, index) {
    console.log(`🎯 Deploying specialist: ${config.role}`);
    
    try {
      // Create unique workspace directory for this specialist
      const workspaceDir = `/tmp/claude-code-${config.role}-${index}`;
      const fs = require('fs-extra');
      await fs.ensureDir(workspaceDir);
      
      // Spawn Claude Code terminal instance
      console.log(`📡 Spawning Claude Code terminal for ${config.role}...`);
      const claudePath = await this.findClaudePath();
      const terminalProcess = spawn(claudePath, [], {
        cwd: workspaceDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true,
        env: { ...process.env, CLAUDE_CODE_WORKSPACE: workspaceDir }
      });
      
      // Create specialist object
      const specialist = {
        id: `${config.role}-${index}`,
        role: config.role,
        phase: config.phase,
        terminal: terminalProcess,
        workspace: workspaceDir,
        status: 'ready',
        progress: 0,
        results: [],
        startTime: Date.now()
      };
      
      // Setup terminal monitoring
      this.setupTerminalMonitoring(specialist);
      
      // Send initial task
      if (config.task) {
        await this.sendTaskToSpecialist(specialist, config.task);
      }
      
      console.log(`✅ Specialist ${config.role} deployed in terminal`);
      return specialist;
      
    } catch (error) {
      console.error(`❌ Failed to deploy specialist ${config.role}:`, error);
      throw error;
    }
  }

  /**
   * Send task to specific specialist
   */
  async sendTaskToSpecialist(specialist, task) {
    console.log(`📤 Sending task to ${specialist.role}`);
    
    try {
      const terminal = specialist.terminal;
      
      // Send task to Claude Code terminal
      terminal.stdin.write(task + '\n');
      
      specialist.status = 'working';
      specialist.currentTask = task;
      specialist.taskStartTime = Date.now();
      
      console.log(`✅ Task sent to ${specialist.role} terminal`);
      this.emit('task-sent', specialist);
      
    } catch (error) {
      console.error(`❌ Failed to send task to ${specialist.role}:`, error);
      specialist.status = 'error';
      throw error;
    }
  }

  /**
   * Setup monitoring for specialist terminal
   */
  setupTerminalMonitoring(specialist) {
    const terminal = specialist.terminal;
    
    // Monitor terminal output
    terminal.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`${specialist.role} output:`, output.trim());
      this.handleTerminalOutput(specialist, output);
    });
    
    // Monitor terminal errors
    terminal.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`${specialist.role} error:`, error.trim());
      specialist.status = 'error';
      this.emit('specialist-error', specialist, new Error(error));
    });
    
    // Handle terminal exit
    terminal.on('close', (code) => {
      console.log(`${specialist.role} terminal exited with code:`, code);
      if (code === 0) {
        specialist.status = 'completed';
        this.emit('specialist-completed', specialist);
      } else {
        specialist.status = 'error';
        this.emit('specialist-error', specialist, new Error(`Terminal exited with code ${code}`));
      }
    });
  }

  /**
   * Handle terminal output from specialist
   */
  handleTerminalOutput(specialist, output) {
    try {
      // Update progress based on output patterns
      if (output.includes('Starting') || output.includes('Initializing')) {
        specialist.progress = Math.min(specialist.progress + 10, 100);
        this.emit('specialist-progress', specialist);
      }
      
      // Check for completion indicators
      if (this.isTaskComplete(output)) {
        specialist.status = 'completed';
        specialist.completionTime = Date.now();
        console.log(`✅ Specialist ${specialist.role} completed task`);
        this.emit('specialist-completed', specialist);
      }
      
      // Store output for analysis
      if (!specialist.outputs) specialist.outputs = [];
      specialist.outputs.push({
        timestamp: Date.now(),
        content: output.trim()
      });
      
    } catch (error) {
      console.error(`Error handling output from ${specialist.role}:`, error);
    }
  }

  /**
   * Check if specialist task is complete
   */
  isTaskComplete(responseText) {
    const completionIndicators = [
      'task completed',
      'implementation complete',
      'deliverables ready',
      'mission accomplished',
      'report back with',
      'coordination protocol'
    ];
    
    const lowerText = responseText.toLowerCase();
    return completionIndicators.some(indicator => 
      lowerText.includes(indicator)
    );
  }

  /**
   * Get current team status
   */
  getTeamStatus() {
    const status = {
      coordinationState: this.coordinationState,
      totalSpecialists: this.activeTeam.size,
      specialists: []
    };
    
    this.activeTeam.forEach(specialist => {
      status.specialists.push({
        id: specialist.id,
        role: specialist.role,
        status: specialist.status,
        progress: specialist.progress,
        runtime: Date.now() - specialist.startTime
      });
    });
    
    return status;
  }

  /**
   * Send task to specific specialist by ID
   */
  async sendTask(specialistId, task) {
    const specialist = this.activeTeam.get(specialistId);
    if (!specialist) {
      throw new Error(`Specialist ${specialistId} not found`);
    }
    
    return await this.sendTaskToSpecialist(specialist, task);
  }

  /**
   * Coordinate specialists (cross-communication)
   */
  async coordinate(coordinationConfig) {
    console.log('🤝 Coordinating specialist collaboration...');
    
    // Implementation for specialist coordination
    // This could involve sharing context between specialists
    // or synchronizing their work
    
    return { success: true, coordination: 'initiated' };
  }

  /**
   * Emergency shutdown all specialists
   */
  async shutdownAll() {
    console.log('🛑 Emergency shutdown of all specialists...');
    
    try {
      // Kill all terminal processes
      for (const specialist of this.activeTeam.values()) {
        try {
          if (specialist.terminal && !specialist.terminal.killed) {
            specialist.terminal.kill('SIGTERM');
            console.log(`🛑 Terminated ${specialist.role} terminal`);
          }
        } catch (error) {
          console.error(`Error terminating ${specialist.role}:`, error);
        }
      }
      
      this.activeTeam.clear();
      this.terminals.clear();
      this.coordinationState = 'shutdown';
      
      console.log('✅ All specialist terminals shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.shutdownAll();
  }
}

module.exports = { AITeamCoordinator };