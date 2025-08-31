/**
 * 🚀 Krin AI Team Commander - Revolutionary Command Center Interface
 * 
 * Frontend JavaScript for the revolutionary multi-AI coordination system
 * Handles UI interactions, real-time updates, and specialist management
 * 
 * @author Krin - Revolutionary AI Interface Pioneer
 * @version 1.0.0 - Command Center Foundation
 */

const { ipcRenderer } = require('electron');

class CommandCenterUI {
  constructor() {
    this.specialists = new Map();
    this.activeTeam = new Map();
    this.selectedSpecialists = new Set();
    this.currentPhase = 2;
    
    this.initializeUI();
    this.setupEventListeners();
    this.startRealTimeUpdates();
    
    console.log('🚀 Command Center UI initialized');
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    this.updateSystemStatus('ready', 'System Ready');
    this.updateCurrentTime();
    this.loadAvailableSpecialists();
    
    // Log initial message
    this.addLogEntry('system', 'Krin AI Team Commander ready for revolutionary development');
  }

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    // Phase selection
    document.querySelectorAll('.phase-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phase = parseInt(e.target.dataset.phase);
        this.selectPhase(phase);
      });
    });

    // Deploy team button
    document.getElementById('deployTeamBtn').addEventListener('click', () => {
      this.showDeployModal();
    });

    // Emergency shutdown
    document.getElementById('emergencyShutdown').addEventListener('click', () => {
      this.emergencyShutdown();
    });

    // Quick actions
    document.getElementById('pauseAllBtn').addEventListener('click', () => {
      this.addLogEntry('system', 'Pausing all specialists...');
    });

    document.getElementById('resumeAllBtn').addEventListener('click', () => {
      this.addLogEntry('system', 'Resuming all specialists...');
    });

    document.getElementById('syncSpecialistsBtn').addEventListener('click', () => {
      this.syncSpecialists();
    });

    document.getElementById('generateReportBtn').addEventListener('click', () => {
      this.generateProgressReport();
    });

    // Coordination tools
    document.getElementById('shareContextBtn').addEventListener('click', () => {
      this.shareContext();
    });

    document.getElementById('mergeResultsBtn').addEventListener('click', () => {
      this.mergeResults();
    });

    document.getElementById('qualityCheckBtn').addEventListener('click', () => {
      this.performQualityCheck();
    });
  }

  /**
   * Select development phase
   */
  selectPhase(phase) {
    this.currentPhase = phase;
    
    // Update UI
    document.querySelectorAll('.phase-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.phase) === phase);
    });
    
    // Reload specialists for selected phase
    this.loadAvailableSpecialists();
    this.addLogEntry('system', `Switched to Phase ${phase} development`);
  }

  /**
   * Load available specialists from backend
   */
  async loadAvailableSpecialists() {
    try {
      this.showLoading('availableSpecialists');
      
      const tasks = await ipcRenderer.invoke('get-specialist-tasks');
      const phaseTasks = tasks.filter(task => task.phase === this.currentPhase);
      
      this.renderSpecialistsList(phaseTasks);
      this.addLogEntry('system', `Loaded ${phaseTasks.length} Phase ${this.currentPhase} specialists`);
      
    } catch (error) {
      console.error('Failed to load specialists:', error);
      this.addLogEntry('error', 'Failed to load available specialists');
    }
  }

  /**
   * Render specialists list in UI
   */
  renderSpecialistsList(specialists) {
    const container = document.getElementById('availableSpecialists');
    
    if (specialists.length === 0) {
      container.innerHTML = '<div class="loading">No specialists available for this phase</div>';
      return;
    }
    
    container.innerHTML = specialists.map(specialist => `
      <div class="specialist-item" data-id="${specialist.id}">
        <div class="specialist-icon">${this.getSpecialistIcon(specialist.id)}</div>
        <div class="specialist-info">
          <div class="specialist-name">${specialist.name}</div>
          <div class="specialist-desc">${this.getSpecialistDescription(specialist.id)}</div>
        </div>
      </div>
    `).join('');
    
    // Add click handlers for selection
    container.querySelectorAll('.specialist-item').forEach(item => {
      item.addEventListener('click', () => {
        this.toggleSpecialistSelection(item);
      });
    });
  }

  /**
   * Get specialist icon emoji
   */
  getSpecialistIcon(specialistId) {
    const icons = {
      'frontend-specialist': '🎨',
      'backend-specialist': '⚙️',
      'testing-specialist': '🧪',
      'database-specialist': '🗄️',
      'integration-specialist': '🔗',
      'ai-ml-specialist': '🤖',
      'devops-specialist': '⚡'
    };
    
    return icons[specialistId] || '🤖';
  }

  /**
   * Get specialist description
   */
  getSpecialistDescription(specialistId) {
    const descriptions = {
      'frontend-specialist': 'React TypeScript UI development',
      'backend-specialist': 'Node.js API and WebSocket systems',
      'testing-specialist': 'Comprehensive testing and quality assurance',
      'database-specialist': 'pgvector semantic search implementation',
      'integration-specialist': 'GitHub/Slack/Jira webhook systems',
      'ai-ml-specialist': 'RAG similarity and decision intelligence',
      'devops-specialist': 'CI/CD pattern validation and quality gates'
    };
    
    return descriptions[specialistId] || 'Revolutionary AI development specialist';
  }

  /**
   * Toggle specialist selection
   */
  toggleSpecialistSelection(item) {
    const specialistId = item.dataset.id;
    
    if (this.selectedSpecialists.has(specialistId)) {
      this.selectedSpecialists.delete(specialistId);
      item.classList.remove('selected');
    } else {
      this.selectedSpecialists.add(specialistId);
      item.classList.add('selected');
    }
    
    // Update deploy button state
    const deployBtn = document.getElementById('deployTeamBtn');
    deployBtn.disabled = this.selectedSpecialists.size === 0;
  }

  /**
   * Show deploy confirmation modal
   */
  showDeployModal() {
    if (this.selectedSpecialists.size === 0) {
      this.addLogEntry('error', 'No specialists selected for deployment');
      return;
    }
    
    // For now, directly deploy without modal
    this.deploySelectedSpecialists();
  }

  /**
   * Deploy selected specialists
   */
  async deploySelectedSpecialists() {
    try {
      this.updateSystemStatus('working', 'Deploying AI Team');
      this.addLogEntry('system', `Deploying ${this.selectedSpecialists.size} specialists...`);
      
      // Get specialist configurations
      const specialists = Array.from(this.selectedSpecialists).map(id => ({
        role: id,
        phase: this.currentPhase,
        task: `Deploy ${id} for Phase ${this.currentPhase} development`
      }));
      
      // Deploy team
      const result = await ipcRenderer.invoke('deploy-specialists', specialists);
      
      if (result.success) {
        this.handleSuccessfulDeployment(result.deployment);
      } else {
        this.handleDeploymentFailure(result.error);
      }
      
    } catch (error) {
      console.error('Deployment failed:', error);
      this.handleDeploymentFailure(error.message);
    }
  }

  /**
   * Handle successful deployment
   */
  handleSuccessfulDeployment(deployment) {
    this.updateSystemStatus('coordinating', 'Coordinating AI Team');
    this.addLogEntry('system', '✅ AI team deployment successful!');
    
    // Update team grid
    this.renderActiveTeam(deployment);
    
    // Clear selection
    this.selectedSpecialists.clear();
    document.querySelectorAll('.specialist-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Start monitoring
    this.startTeamMonitoring();
  }

  /**
   * Handle deployment failure
   */
  handleDeploymentFailure(error) {
    this.updateSystemStatus('error', 'Deployment Failed');
    this.addLogEntry('error', `❌ Deployment failed: ${error}`);
  }

  /**
   * Render active team in dashboard
   */
  renderActiveTeam(specialists) {
    const teamGrid = document.getElementById('teamGrid');
    
    teamGrid.innerHTML = specialists.map(specialist => `
      <div class="specialist-card" data-id="${specialist.id}">
        <div class="card-header">
          <div class="specialist-avatar">${this.getSpecialistIcon(specialist.role)}</div>
          <div class="card-title">
            <div class="card-name">${specialist.role}</div>
            <div class="card-status">${specialist.status}</div>
          </div>
        </div>
        <div class="card-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${specialist.progress || 0}%"></div>
          </div>
          <div class="progress-text">${specialist.progress || 0}% Complete</div>
        </div>
        <div class="card-actions">
          <button class="card-btn" onclick="commandCenter.sendTaskToSpecialist('${specialist.id}')">
            📤 Send Task
          </button>
          <button class="card-btn" onclick="commandCenter.monitorSpecialist('${specialist.id}')">
            👁️ Monitor
          </button>
        </div>
      </div>
    `).join('');
    
    // Update team stats
    document.getElementById('activeCount').textContent = specialists.length;
  }

  /**
   * Start team monitoring
   */
  startTeamMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      try {
        const status = await ipcRenderer.invoke('get-specialist-status');
        this.updateTeamStatus(status);
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, 2000);
  }

  /**
   * Update team status from monitoring
   */
  updateTeamStatus(status) {
    // Update overall system status
    if (status.coordinationState === 'coordinating') {
      this.updateSystemStatus('working', 'AI Team Active');
    }
    
    // Update individual specialist cards
    status.specialists.forEach(specialist => {
      const card = document.querySelector(`[data-id="${specialist.id}"]`);
      if (card) {
        // Update progress
        const progressFill = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');
        if (progressFill && progressText) {
          progressFill.style.width = `${specialist.progress}%`;
          progressText.textContent = `${specialist.progress}% Complete`;
        }
        
        // Update status
        const statusElement = card.querySelector('.card-status');
        if (statusElement) {
          statusElement.textContent = specialist.status;
        }
      }
    });
  }

  /**
   * Send task to specific specialist
   */
  async sendTaskToSpecialist(specialistId) {
    const task = prompt(`Enter task for ${specialistId}:`);
    if (!task) return;
    
    try {
      await ipcRenderer.invoke('send-task', specialistId, task);
      this.addLogEntry('specialist', `Task sent to ${specialistId}: ${task.substring(0, 50)}...`);
    } catch (error) {
      this.addLogEntry('error', `Failed to send task to ${specialistId}`);
    }
  }

  /**
   * Monitor specific specialist
   */
  monitorSpecialist(specialistId) {
    this.addLogEntry('system', `Monitoring ${specialistId} - opening dedicated view...`);
    // Could open a dedicated monitoring window
  }

  /**
   * Sync specialists
   */
  async syncSpecialists() {
    try {
      this.addLogEntry('system', '🔄 Synchronizing specialists...');
      await ipcRenderer.invoke('coordinate-specialists', { action: 'sync' });
      this.addLogEntry('system', '✅ Specialists synchronized');
    } catch (error) {
      this.addLogEntry('error', 'Sync failed: ' + error.message);
    }
  }

  /**
   * Generate progress report
   */
  generateProgressReport() {
    this.addLogEntry('system', '📊 Generating comprehensive progress report...');
    // Implementation would create detailed report
  }

  /**
   * Share context between specialists
   */
  shareContext() {
    this.addLogEntry('system', '📤 Sharing context across AI team...');
  }

  /**
   * Merge specialist results
   */
  mergeResults() {
    this.addLogEntry('system', '🔀 Merging specialist results...');
  }

  /**
   * Perform quality check
   */
  performQualityCheck() {
    this.addLogEntry('system', '✅ Running comprehensive quality check...');
  }

  /**
   * Emergency shutdown
   */
  async emergencyShutdown() {
    if (confirm('⚠️ This will shut down all AI specialists. Continue?')) {
      try {
        this.updateSystemStatus('error', 'Emergency Shutdown');
        this.addLogEntry('system', '🛑 Emergency shutdown initiated...');
        
        await ipcRenderer.invoke('emergency-shutdown');
        
        // Clear team display
        document.getElementById('teamGrid').innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🛑</div>
            <h3>Emergency Shutdown Complete</h3>
            <p>All AI specialists have been safely shut down</p>
          </div>
        `;
        
        // Stop monitoring
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
        }
        
        this.updateSystemStatus('ready', 'System Ready');
        this.addLogEntry('system', '✅ Emergency shutdown complete');
        
      } catch (error) {
        this.addLogEntry('error', 'Emergency shutdown failed: ' + error.message);
      }
    }
  }

  /**
   * Update system status indicator
   */
  updateSystemStatus(status, text) {
    const indicator = document.getElementById('systemStatus');
    const dot = indicator.querySelector('.status-dot');
    const statusText = indicator.querySelector('span:last-child');
    
    // Remove all status classes
    dot.className = 'status-dot';
    dot.classList.add(status);
    statusText.textContent = text;
  }

  /**
   * Add entry to activity log
   */
  addLogEntry(type, message) {
    const log = document.getElementById('activityLog');
    const timestamp = new Date().toTimeString().substring(0, 8);
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
      <span class="timestamp">${timestamp}</span>
      <span class="message">${message}</span>
    `;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Limit log entries to prevent memory issues
    if (log.children.length > 100) {
      log.removeChild(log.firstChild);
    }
  }

  /**
   * Show loading state
   */
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '<div class="loading">Loading...</div>';
  }

  /**
   * Update current time in footer
   */
  updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    
    const updateTime = () => {
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString();
    };
    
    updateTime();
    setInterval(updateTime, 1000);
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates() {
    // Listen for events from main process
    ipcRenderer.on('specialist-progress', (event, specialist) => {
      this.addLogEntry('specialist', `${specialist.role} progress: ${specialist.progress}%`);
    });
    
    ipcRenderer.on('specialist-completed', (event, specialist) => {
      this.addLogEntry('system', `✅ ${specialist.role} completed task`);
    });
    
    ipcRenderer.on('specialist-error', (event, specialist, error) => {
      this.addLogEntry('error', `❌ ${specialist.role} error: ${error.message}`);
    });
  }
}

// Initialize command center when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.commandCenter = new CommandCenterUI();
});