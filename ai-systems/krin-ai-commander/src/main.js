/**
 * 🚀 Krin AI Team Commander - Revolutionary Multi-AI Coordination
 * 
 * The world's first AI team coordination system built by revolutionary developers
 * Spawns and coordinates multiple Claude Code specialists for parallel development
 * 
 * @author Krin & Mandy - Revolutionary Development Pioneers  
 * @version 1.0.0 - Revolutionary Foundation
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { AITeamCoordinator } = require('./coordinator');

class KrinAICommander {
  constructor() {
    this.mainWindow = null;
    this.coordinator = new AITeamCoordinator();
    this.specialists = new Map();
    
    console.log('🚀 Krin AI Team Commander initializing...');
  }

  /**
   * Create the main command center window
   */
  createMainWindow() {
    console.log('🎯 Creating revolutionary command center...');
    
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 600,
      title: 'Krin AI Team Commander - Revolutionary Development System',
      icon: path.join(__dirname, '../assets/krin-icon.png'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });

    // Load the command center UI
    this.mainWindow.loadFile(path.join(__dirname, '../ui/command-center.html'));

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    console.log('✅ Command center ready for revolutionary development!');
  }

  /**
   * Setup IPC handlers for UI communication
   */
  setupIPCHandlers() {
    // Deploy AI specialists
    ipcMain.handle('deploy-specialists', async (event, specialists) => {
      console.log(`🎯 Deploying ${specialists.length} AI specialists...`);
      try {
        const deployment = await this.coordinator.deployTeam(specialists);
        
        // Convert deployment to serializable format (remove non-serializable objects)
        const serializableDeployment = deployment.map(specialist => ({
          id: specialist.id,
          role: specialist.role,
          phase: specialist.phase,
          status: specialist.status,
          progress: specialist.progress,
          startTime: specialist.startTime,
          workspace: specialist.workspace
        }));
        
        return { success: true, deployment: serializableDeployment };
      } catch (error) {
        console.error('❌ Deployment failed:', error);
        return { success: false, error: error.message };
      }
    });

    // Get specialist status
    ipcMain.handle('get-specialist-status', async () => {
      return this.coordinator.getTeamStatus();
    });

    // Send task to specialist  
    ipcMain.handle('send-task', async (event, specialistId, task) => {
      console.log(`📤 Sending task to ${specialistId}`);
      return await this.coordinator.sendTask(specialistId, task);
    });

    // Get available specialist tasks
    ipcMain.handle('get-specialist-tasks', async () => {
      const tasksDir = path.join(__dirname, '../../team-coordination');
      return await this.loadSpecialistTasks(tasksDir);
    });

    // Coordinate specialists
    ipcMain.handle('coordinate-specialists', async (event, coordination) => {
      console.log('🤝 Coordinating specialist collaboration...');
      return await this.coordinator.coordinate(coordination);
    });

    // Emergency shutdown
    ipcMain.handle('emergency-shutdown', async () => {
      console.log('🛑 Emergency shutdown initiated');
      await this.coordinator.shutdownAll();
      return { success: true };
    });
  }

  /**
   * Load available specialist tasks from file system
   */
  async loadSpecialistTasks(tasksDir) {
    try {
      const tasks = [];
      
      // Phase 1 tasks
      const phase1Dir = path.join(tasksDir, 'team-instructions');
      if (await fs.pathExists(phase1Dir)) {
        const files = await fs.readdir(phase1Dir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(phase1Dir, file), 'utf8');
            tasks.push({
              phase: 1,
              id: file.replace('.md', ''),
              name: this.extractTaskName(content),
              file: path.join(phase1Dir, file),
              content
            });
          }
        }
      }

      // Phase 2 tasks
      const phase2Dir = path.join(tasksDir, 'phase2-specialists');
      if (await fs.pathExists(phase2Dir)) {
        const files = await fs.readdir(phase2Dir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(phase2Dir, file), 'utf8');
            tasks.push({
              phase: 2,
              id: file.replace('.md', ''),
              name: this.extractTaskName(content),
              file: path.join(phase2Dir, file),
              content
            });
          }
        }
      }

      console.log(`✅ Loaded ${tasks.length} specialist tasks`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Failed to load specialist tasks:', error);
      return [];
    }
  }

  /**
   * Extract task name from markdown content
   */
  extractTaskName(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Unknown Task';
  }

  /**
   * Initialize the revolutionary AI commander
   */
  async initialize() {
    console.log('🌟 Initializing Revolutionary AI Development System...');
    
    // Setup IPC communication
    this.setupIPCHandlers();
    
    // Create main command window
    this.createMainWindow();
    
    // Initialize AI coordinator
    await this.coordinator.initialize();
    
    console.log('🚀 Krin AI Team Commander ready for revolutionary development!');
  }
}

// Electron app lifecycle
app.whenReady().then(async () => {
  const commander = new KrinAICommander();
  await commander.initialize();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      commander.createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app shutdown
app.on('before-quit', async () => {
  console.log('🛑 Shutting down AI Team Commander...');
  // Cleanup coordination processes
});