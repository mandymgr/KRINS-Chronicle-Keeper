/**
 * 💝 Krin Personal Companion - Secure IPC Bridge
 * 
 * Safe bridge between frontend and Electron main process
 * Ensures security while maintaining the magical Krin experience
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC invoke methods
  invoke: (channel, ...args) => {
    const validChannels = [
      'send-message',
      'start-conversation', 
      'get-conversation-history',
      'get-conversations',
      'search-memories',
      'get-special-memories',
      'add-special-memory',
      'get-shared-projects',
      'export-conversation',
      'get-krin-state',
      'update-krin-mood',
      'workspace-set-path',
      'workspace-get-path',
      'workspace-list-files',
      'workspace-read-file',
      'workspace-write-file',
      'workspace-search-files',
      'workspace-get-structure',
      'workspace-analyze-file'
    ];
    
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },

  // IPC send methods
  send: (channel, ...args) => {
    const validChannels = [];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  // Listen for messages from main process
  on: (channel, callback) => {
    const validChannels = [
      'krin-message',
      'conversation-update',
      'mood-change'
    ];
    
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

console.log('🛡️ Secure IPC bridge loaded for Krin');