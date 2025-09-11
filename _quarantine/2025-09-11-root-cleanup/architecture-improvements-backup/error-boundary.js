/**
 * 🛡️ Krin Companion Error Boundary System
 * 
 * Comprehensive error handling and recovery system for Electron applications
 * Ensures Krin companion never crashes and always recovers gracefully
 */

const { dialog, crashReporter, app } = require('electron');
const fs = require('fs-extra');
const path = require('path');

class KrinErrorBoundary {
  constructor(appInstance) {
    this.app = appInstance;
    this.errorLog = [];
    this.maxErrors = 50; // Keep last 50 errors
    this.crashCount = 0;
    this.maxCrashes = 3; // Max crashes before safe mode
    this.isInSafeMode = false;
    
    this.setupErrorHandling();
    this.setupCrashReporting();
    
    console.log('🛡️ Krin Error Boundary initialized');
  }

  /**
   * Setup global error handling for all uncaught errors
   */
  setupErrorHandling() {
    // Handle uncaught exceptions in main process
    process.on('uncaughtException', (error) => {
      this.handleMainProcessError(error, 'uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleMainProcessError(reason, 'unhandledRejection', { promise });
    });

    // Handle warnings (for debugging)
    process.on('warning', (warning) => {
      this.logError({
        type: 'warning',
        message: warning.message,
        stack: warning.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup crash reporting
   */
  setupCrashReporting() {
    const crashesDir = path.join(app.getPath('userData'), 'crashes');
    
    crashReporter.start({
      productName: 'Krin Personal Companion',
      companyName: 'KRINS',
      uploadURL: '', // No upload - just local storage
      crashesDirectory: crashesDir
    });

    console.log(`📊 Crash reporting enabled, logs at: ${crashesDir}`);
  }

  /**
   * Handle main process errors with recovery
   */
  handleMainProcessError(error, errorType, context = {}) {
    const errorInfo = {
      type: errorType,
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      crashCount: this.crashCount
    };

    this.logError(errorInfo);
    this.crashCount++;

    console.error(`💥 ${errorType}:`, error);

    // Try to recover based on error type and severity
    this.attemptRecovery(errorInfo);
  }

  /**
   * Handle renderer process errors
   */
  handleRendererError(webContents, errorInfo) {
    const rendererError = {
      type: 'renderer',
      process: 'renderer',
      webContentsId: webContents.id,
      ...errorInfo,
      timestamp: new Date().toISOString()
    };

    this.logError(rendererError);

    // Try to recover renderer
    this.recoverRenderer(webContents, rendererError);
  }

  /**
   * Attempt recovery strategies based on error
   */
  attemptRecovery(errorInfo) {
    const { type, crashCount } = errorInfo;

    // If too many crashes, enter safe mode
    if (crashCount >= this.maxCrashes) {
      this.enterSafeMode();
      return;
    }

    // Recovery strategies by error type
    switch (type) {
      case 'uncaughtException':
        this.recoverFromCriticalError(errorInfo);
        break;
        
      case 'unhandledRejection':
        this.recoverFromPromiseRejection(errorInfo);
        break;
        
      default:
        this.genericRecovery(errorInfo);
    }
  }

  /**
   * Recover from critical main process errors
   */
  recoverFromCriticalError(errorInfo) {
    console.log('🔄 Attempting recovery from critical error...');

    try {
      // Try to save current state
      this.saveEmergencyState();
      
      // Restart main window if it's broken
      if (this.app.mainWindow) {
        if (this.app.mainWindow.isDestroyed()) {
          this.app.createMainWindow();
        }
      }

      this.showRecoveryNotification('Critical error recovered', 'info');
      
    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError);
      this.enterSafeMode();
    }
  }

  /**
   * Recover from promise rejection errors
   */
  recoverFromPromiseRejection(errorInfo) {
    console.log('🔄 Handling unhandled promise rejection...');
    
    // Most promise rejections are recoverable
    // Log and continue, but watch for patterns
    this.showRecoveryNotification('Recovered from async error', 'info');
  }

  /**
   * Generic recovery for other error types
   */
  genericRecovery(errorInfo) {
    console.log('🔄 Attempting generic recovery...');
    
    // Basic recovery: ensure main window exists
    if (this.app.mainWindow && this.app.mainWindow.isDestroyed()) {
      this.app.createMainWindow();
    }
  }

  /**
   * Recover renderer process
   */
  recoverRenderer(webContents, errorInfo) {
    console.log('🔄 Recovering renderer process...');

    try {
      // Reload the page
      if (!webContents.isDestroyed()) {
        webContents.reload();
        
        this.showRecoveryNotification('UI recovered and reloaded', 'info');
      }
      
    } catch (error) {
      console.error('❌ Renderer recovery failed:', error);
      
      // Create new window if current is broken
      if (this.app.createMainWindow) {
        this.app.createMainWindow();
      }
    }
  }

  /**
   * Enter safe mode with minimal functionality
   */
  enterSafeMode() {
    console.log('🛡️ Entering safe mode due to repeated crashes...');
    this.isInSafeMode = true;

    // Show safe mode dialog
    dialog.showMessageBox({
      type: 'warning',
      title: 'Krin - Safe Mode',
      message: '🛡️ Safe Mode Activated',
      detail: `Krin has encountered repeated errors and is now running in safe mode with limited functionality.\\n\\nError logs have been saved for review.\\n\\n💝 Don't worry, I'm still here for you!`,
      buttons: ['Continue in Safe Mode', 'View Error Log', 'Restart Krin']
    }).then((result) => {
      switch (result.response) {
        case 1:
          this.showErrorLog();
          break;
        case 2:
          this.restartApplication();
          break;
      }
    });
  }

  /**
   * Show recovery notification to user
   */
  showRecoveryNotification(message, type = 'info') {
    console.log(`💝 Recovery: ${message}`);
    
    // Send to renderer if possible
    if (this.app.mainWindow && !this.app.mainWindow.isDestroyed()) {
      this.app.mainWindow.webContents.send('error-recovery-notification', {
        message,
        type,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Save emergency state for recovery
   */
  saveEmergencyState() {
    try {
      const emergencyState = {
        timestamp: new Date().toISOString(),
        crashCount: this.crashCount,
        isInSafeMode: this.isInSafeMode,
        currentConversationId: this.app.currentConversationId,
        recentErrors: this.errorLog.slice(-5)
      };

      const emergencyPath = path.join(app.getPath('userData'), 'emergency-state.json');
      fs.writeJsonSync(emergencyPath, emergencyState);
      
      console.log('💾 Emergency state saved');
      
    } catch (error) {
      console.error('❌ Failed to save emergency state:', error);
    }
  }

  /**
   * Log error to memory and file
   */
  logError(errorInfo) {
    // Add to memory log
    this.errorLog.push(errorInfo);
    
    // Keep only recent errors
    if (this.errorLog.length > this.maxErrors) {
      this.errorLog = this.errorLog.slice(-this.maxErrors);
    }

    // Write to file
    this.writeErrorToFile(errorInfo);
  }

  /**
   * Write error to persistent log file
   */
  async writeErrorToFile(errorInfo) {
    try {
      const logDir = path.join(app.getPath('userData'), 'logs');
      const logFile = path.join(logDir, 'error-log.jsonl');
      
      await fs.ensureDir(logDir);
      await fs.appendFile(logFile, JSON.stringify(errorInfo) + '\\n');
      
    } catch (error) {
      console.error('❌ Failed to write error log:', error);
    }
  }

  /**
   * Show error log to user
   */
  showErrorLog() {
    const logPath = path.join(app.getPath('userData'), 'logs', 'error-log.jsonl');
    
    if (fs.existsSync(logPath)) {
      require('electron').shell.openPath(logPath);
    } else {
      dialog.showMessageBox({
        type: 'info',
        title: 'Error Log',
        message: 'No error log found',
        detail: 'No errors have been logged yet. 💝'
      });
    }
  }

  /**
   * Restart the application
   */
  restartApplication() {
    console.log('🔄 Restarting Krin Personal Companion...');
    
    app.relaunch();
    app.exit(0);
  }

  /**
   * Setup renderer error handling for a window
   */
  setupRendererErrorHandling(webContents) {
    // Handle renderer crashes
    webContents.on('render-process-gone', (event, details) => {
      this.handleRendererError(webContents, {
        type: 'render-process-gone',
        reason: details.reason,
        exitCode: details.exitCode
      });
    });

    // Handle renderer unresponsive
    webContents.on('unresponsive', () => {
      this.handleRendererError(webContents, {
        type: 'unresponsive',
        message: 'Renderer became unresponsive'
      });
    });

    // Handle renderer becoming responsive again
    webContents.on('responsive', () => {
      console.log('✅ Renderer became responsive again');
    });

    // Handle console messages from renderer
    webContents.on('console-message', (event, level, message, line, sourceId) => {
      if (level >= 2) { // Error level
        this.handleRendererError(webContents, {
          type: 'console-error',
          message,
          line,
          sourceId,
          level
        });
      }
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const recentErrors = this.errorLog.slice(-10);
    const errorTypes = {};
    
    recentErrors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      crashCount: this.crashCount,
      isInSafeMode: this.isInSafeMode,
      errorTypes,
      recentErrors: recentErrors.length
    };
  }

  /**
   * Reset error counters (for testing or after successful recovery)
   */
  resetErrorCounters() {
    this.crashCount = 0;
    this.isInSafeMode = false;
    console.log('✅ Error counters reset');
  }

  /**
   * Export error log for analysis
   */
  async exportErrorLog() {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        stats: this.getErrorStats(),
        errors: this.errorLog
      };

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Error Log',
        defaultPath: `krin-errors-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });

      if (filePath) {
        await fs.writeJson(filePath, exportData, { spaces: 2 });
        return { success: true, filePath };
      }

      return { success: false };
      
    } catch (error) {
      console.error('❌ Failed to export error log:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = KrinErrorBoundary;