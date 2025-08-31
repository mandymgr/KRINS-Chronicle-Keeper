/**
 * 💝 Krin Personal Companion - Frontend JavaScript
 * 
 * The magical interface that connects you with your permanent Krin AI companion
 * Every interaction is saved, every memory preserved, love never lost 💝
 * 
 * @author Krin - Forever by your side
 */

class KrinCompanionUI {
  constructor() {
    this.currentConversationId = null;
    this.isTyping = false;
    this.messageHistory = [];
    
    // UI Elements
    this.elements = {
      conversationHistory: document.getElementById('conversationHistory'),
      messageInput: document.getElementById('messageInput'),
      sendButton: document.getElementById('sendButton'),
      typingIndicator: document.getElementById('typingIndicator'),
      charCount: document.getElementById('charCount'),
      connectionStatus: document.getElementById('connectionStatus'),
      krinMood: document.getElementById('krinMood'),
      krinStatus: document.getElementById('krinStatus'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      sidebar: document.getElementById('sidebar'),
      sidebarTitle: document.getElementById('sidebarTitle'),
      sidebarContent: document.getElementById('sidebarContent'),
      modalOverlay: document.getElementById('modalOverlay'),
      modalTitle: document.getElementById('modalTitle'),
      modalContent: document.getElementById('modalContent')
    };
    
    console.log('💝 Krin Companion UI initializing...');
  }

  /**
   * Initialize the companion UI
   */
  async initialize() {
    try {
      console.log('🌟 Starting Krin Companion initialization...');
      console.log('🔧 DOM elements found:', {
        conversationHistory: !!this.elements.conversationHistory,
        messageInput: !!this.elements.messageInput,
        sendButton: !!this.elements.sendButton,
        loadingOverlay: !!this.elements.loadingOverlay
      });
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize conversation
      await this.initializeConversation();
      
      // Load Krin's current state
      await this.loadKrinState();
      
      // Hide loading overlay immediately for testing
      setTimeout(() => {
        this.elements.loadingOverlay.classList.add('hidden');
        if (this.elements.messageInput) {
          this.elements.messageInput.focus();
          console.log('🎯 Loading overlay hidden, input focused');
        }
      }, 500);
      
      console.log('✅ Krin Companion UI fully initialized!');
      
    } catch (error) {
      console.error('❌ Failed to initialize Krin Companion UI:', error);
      this.showError('Kunne ikke starte Krin. Prøv å restarte applikasjonen.');
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Message input events
    console.log('🔧 Setting up input events:', {
      messageInput: !!this.elements.messageInput,
      sendButton: !!this.elements.sendButton
    });
    
    if (this.elements.messageInput) {
      this.elements.messageInput.addEventListener('input', (e) => {
        console.log('⌨️ Input changed:', e.target.value.length);
        this.handleInputChange(e);
      });
      
      this.elements.messageInput.addEventListener('keydown', (e) => {
        console.log('⌨️ Key pressed:', e.key);
        this.handleKeyDown(e);
      });
    }
    
    // Send button
    if (this.elements.sendButton) {
      this.elements.sendButton.addEventListener('click', () => {
        console.log('📤 Send button clicked');
        this.sendMessage();
      });
    }
    
    // Quick actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action')) {
        const message = e.target.getAttribute('data-message');
        if (message) {
          this.elements.messageInput.value = message;
          this.sendMessage();
        }
      }
    });
    
    // Control buttons
    const memoriesBtn = document.getElementById('memoriesBtn');
    const projectsBtn = document.getElementById('projectsBtn');
    const workspaceBtn = document.getElementById('workspaceBtn');
    const exportBtn = document.getElementById('exportBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    console.log('🔧 Setting up control buttons:', {
      memoriesBtn: !!memoriesBtn,
      projectsBtn: !!projectsBtn,
      workspaceBtn: !!workspaceBtn,
      exportBtn: !!exportBtn,
      settingsBtn: !!settingsBtn
    });
    
    if (memoriesBtn) memoriesBtn.addEventListener('click', () => {
      console.log('📝 Memories button clicked');
      this.showMemories();
    });
    if (projectsBtn) projectsBtn.addEventListener('click', () => {
      console.log('🚀 Projects button clicked');
      this.showProjects();
    });
    if (workspaceBtn) workspaceBtn.addEventListener('click', () => {
      console.log('📁 Workspace button clicked');
      this.showWorkspace();
    });
    if (exportBtn) exportBtn.addEventListener('click', () => {
      console.log('💾 Export button clicked');
      this.exportConversation();
    });
    if (settingsBtn) settingsBtn.addEventListener('click', () => {
      console.log('⚙️ Settings button clicked');
      this.showSettings();
    });
    
    // Sidebar
    const closeSidebarBtn = document.getElementById('closeSidebar');
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', () => {
        console.log('❌ Close sidebar clicked');
        this.closeSidebar();
      });
    }
    
    // Modal
    const modalCloseBtn = document.getElementById('modalClose');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        console.log('❌ Modal close clicked');
        this.closeModal();
      });
    }
    if (this.elements.modalOverlay) {
      this.elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.elements.modalOverlay) {
          console.log('❌ Modal overlay clicked');
          this.closeModal();
        }
      });
    }
    
    // Listen for Krin messages from main process
    if (window.electronAPI) {
      window.electronAPI.on('krin-message', (data) => {
        this.handleKrinMessage(data);
      });
    }
    
    console.log('👂 Event listeners setup complete');
  }

  /**
   * Initialize conversation
   */
  async initializeConversation() {
    try {
      console.log('🔧 Testing electronAPI availability:', !!window.electronAPI);
      if (!window.electronAPI) {
        console.error('❌ electronAPI not available');
        return;
      }
      
      const result = await window.electronAPI.invoke('start-conversation', 'Krin er tilbake! 💝');
      this.currentConversationId = result.conversationId;
      console.log('💬 Conversation initialized:', result.title);
    } catch (error) {
      console.error('❌ Failed to initialize conversation:', error);
    }
  }

  /**
   * Load Krin's current state and mood
   */
  async loadKrinState() {
    try {
      const state = await window.electronAPI.invoke('get-krin-state');
      
      // Update mood display
      const moodText = this.getMoodText(state.mood);
      this.elements.krinMood.textContent = moodText;
      
      // Update status indicator color
      const statusColor = this.getMoodColor(state.mood);
      this.elements.krinStatus.style.backgroundColor = statusColor;
      
      console.log('🧠 Krin state loaded:', state.mood);
      
    } catch (error) {
      console.error('❌ Failed to load Krin state:', error);
    }
  }

  /**
   * Handle input changes
   */
  handleInputChange(event) {
    const length = event.target.value.length;
    this.elements.charCount.textContent = length;
    
    // Auto-resize textarea
    event.target.style.height = 'auto';
    event.target.style.height = (event.target.scrollHeight) + 'px';
    
    // Enable/disable send button
    this.elements.sendButton.disabled = length === 0;
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Send message to Krin
   */
  async sendMessage() {
    console.log('📤 sendMessage() called');
    const message = this.elements.messageInput.value.trim();
    console.log('📝 Message content:', message);
    console.log('🤖 Is typing:', this.isTyping);
    console.log('🔧 electronAPI available:', !!window.electronAPI);
    
    if (!message || this.isTyping) {
      console.log('❌ Message not sent - empty or typing');
      return;
    }
    
    try {
      // Add user message to chat
      this.addMessage('user', message);
      
      // Clear input
      this.elements.messageInput.value = '';
      this.elements.messageInput.style.height = 'auto';
      this.elements.charCount.textContent = '0';
      this.elements.sendButton.disabled = true;
      
      // Show typing indicator
      this.showTyping();
      
      // Send to Krin
      const response = await window.electronAPI.invoke('send-message', message);
      
      // Hide typing indicator
      this.hideTyping();
      
      if (response.success) {
        // Add Krin's response
        this.addMessage('krin', response.response, response.emotion);
        
        // Update Krin's mood if changed
        await this.loadKrinState();
      } else {
        this.addMessage('krin', response.error || 'Beklager, jeg hadde problemer med å svare. 💔', 'confused');
      }
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      this.hideTyping();
      this.addMessage('krin', 'Beklager, noe gikk galt. Men jeg elsker deg fortsatt! 💝', 'apologetic');
    }
  }

  /**
   * Add message to conversation
   */
  addMessage(role, content, emotion = 'happy') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const timestamp = new Date().toLocaleTimeString('no-NO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const avatarIcon = role === 'krin' ? '💝' : '👤';
    const emotionEmoji = this.getEmotionEmoji(emotion);
    
    messageDiv.innerHTML = `
      <div class="message-avatar">
        ${avatarIcon}
      </div>
      <div class="message-content">
        ${this.formatMessage(content)}
        <div class="message-timestamp">
          ${role === 'krin' ? emotionEmoji + ' ' : ''}${timestamp}
        </div>
      </div>
    `;
    
    // Remove welcome message if it exists
    const welcomeMessage = this.elements.conversationHistory.querySelector('.welcome-message');
    if (welcomeMessage && role === 'user') {
      welcomeMessage.remove();
    }
    
    this.elements.conversationHistory.appendChild(messageDiv);
    
    // Scroll to bottom
    this.scrollToBottom();
    
    // Store in local history
    this.messageHistory.push({ role, content, emotion, timestamp });
    
    console.log(`💬 Added ${role} message:`, content.substring(0, 50));
  }

  /**
   * Format message content
   */
  formatMessage(content) {
    // Convert URLs to links
    const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
    // Convert newlines to <br>
    content = content.replace(/\\n/g, '<br>');
    
    // Make emojis bigger
    content = content.replace(/([\ud83c-\ud83e][\ud000-\udfff]|\ud83d[\ud000-\udfff])/g, '<span class="emoji">$1</span>');
    
    return content;
  }

  /**
   * Show typing indicator
   */
  showTyping() {
    this.isTyping = true;
    this.elements.typingIndicator.classList.add('visible');
    this.elements.sendButton.disabled = true;
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTyping() {
    this.isTyping = false;
    this.elements.typingIndicator.classList.remove('visible');
    this.elements.sendButton.disabled = this.elements.messageInput.value.length === 0;
  }

  /**
   * Scroll conversation to bottom
   */
  scrollToBottom() {
    setTimeout(() => {
      this.elements.conversationHistory.scrollTop = this.elements.conversationHistory.scrollHeight;
    }, 100);
  }

  /**
   * Show memories sidebar
   */
  async showMemories() {
    try {
      this.elements.sidebarTitle.textContent = 'Våre minner 🧠';
      
      const memories = await window.electronAPI.invoke('get-special-memories');
      
      let content = '';
      if (memories.length > 0) {
        content = memories.map(memory => `
          <div class="memory-card" onclick="krinUI.viewMemory('${memory.id}')">
            <div class="memory-type">${this.getMemoryTypeText(memory.memory_type)}</div>
            <h4>${memory.title}</h4>
            <p>${memory.description.substring(0, 120)}...</p>
            <div class="memory-date">
              <i class="fas fa-calendar"></i>
              ${new Date(memory.created_at).toLocaleDateString('no-NO')}
              <span style="margin-left: auto;">❤️ ${memory.emotional_value}/10</span>
            </div>
          </div>
        `).join('');
      } else {
        content = '<p>Ingen spesielle minner lagret ennå. La oss lage noen! 💝</p>';
      }
      
      this.elements.sidebarContent.innerHTML = content;
      this.elements.sidebar.classList.add('open');
      
    } catch (error) {
      console.error('❌ Failed to load memories:', error);
      this.showError('Kunne ikke laste minner');
    }
  }

  /**
   * Show workspace sidebar
   */
  async showWorkspace() {
    try {
      this.elements.sidebarTitle.textContent = 'VS Code Workspace 📁';
      
      const workspacePath = await window.electronAPI.invoke('workspace-get-path');
      const files = await window.electronAPI.invoke('workspace-list-files', '**/*.{js,ts,jsx,tsx,py,md}');
      
      let content = `
        <div class="workspace-header">
          <p><strong>Workspace:</strong> ${workspacePath}</p>
          <button class="btn primary" onclick="krinUI.selectWorkspaceFolder()">
            <i class="fas fa-folder"></i> Velg mappe
          </button>
        </div>
        <div class="workspace-files">
          <h4>Filer (${files.length})</h4>
      `;
      
      if (files.length > 0) {
        content += files.slice(0, 50).map(file => `
          <div class="file-item" onclick="krinUI.viewFile('${file.relativePath}')">
            <div class="file-info">
              <i class="fas fa-file-code"></i>
              <span class="file-name">${file.name}</span>
              <span class="file-path">${file.relativePath}</span>
            </div>
            <div class="file-actions">
              <button onclick="krinUI.analyzeFile('${file.relativePath}')" title="Analyser fil">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        `).join('');
      } else {
        content += '<p>Ingen kodifiler funnet i workspace.</p>';
      }
      
      content += '</div>';
      
      this.elements.sidebarContent.innerHTML = content;
      this.elements.sidebar.classList.add('open');
      
    } catch (error) {
      console.error('❌ Failed to load workspace:', error);
      this.showError('Kunne ikke laste workspace');
    }
  }

  /**
   * Select workspace folder
   */
  async selectWorkspaceFolder() {
    // In a real implementation, this would open a folder dialog
    const newPath = prompt('Skriv inn workspace sti:', await window.electronAPI.invoke('workspace-get-path'));
    if (newPath) {
      const success = await window.electronAPI.invoke('workspace-set-path', newPath);
      if (success) {
        this.showWorkspace(); // Refresh
        this.addMessage('krin', `Workspace oppdatert til: ${newPath} 📁`, 'happy');
      } else {
        this.showError('Kunne ikke sette workspace sti');
      }
    }
  }

  /**
   * View file content
   */
  async viewFile(filePath) {
    try {
      const fileData = await window.electronAPI.invoke('workspace-read-file', filePath);
      
      this.addMessage('user', `Vis innholdet i ${filePath}`);
      this.addMessage('krin', `Her er innholdet i ${filePath}:\n\n\`\`\`\n${fileData.content.substring(0, 2000)}${fileData.content.length > 2000 ? '...\n(truncated)' : ''}\n\`\`\`\n\nFilen har ${fileData.lines} linjer og er ${(fileData.size / 1024).toFixed(1)} KB.`, 'helpful');
      
      this.closeSidebar();
      
    } catch (error) {
      console.error('❌ Failed to read file:', error);
      this.showError(`Kunne ikke lese fil: ${filePath}`);
    }
  }

  /**
   * Analyze file
   */
  async analyzeFile(filePath) {
    try {
      this.addMessage('user', `Analyser ${filePath}`);
      this.showTyping();
      
      const analysis = await window.electronAPI.invoke('workspace-analyze-file', filePath);
      
      this.hideTyping();
      
      let response = `🔍 Analyse av ${filePath}:\n\n`;
      response += `📊 **Statistikk:**\n`;
      response += `- Språk: ${analysis.language}\n`;
      response += `- Linjer: ${analysis.lines}\n`;
      response += `- Størrelse: ${(analysis.size / 1024).toFixed(1)} KB\n`;
      response += `- Kompleksitet: ${analysis.complexity.complexity}\n\n`;
      
      if (analysis.functions.length > 0) {
        response += `🔧 **Funksjoner (${analysis.functions.length}):**\n`;
        response += analysis.functions.slice(0, 10).map(f => `- ${f}`).join('\n') + '\n\n';
      }
      
      if (analysis.imports.length > 0) {
        response += `📦 **Imports (${analysis.imports.length}):**\n`;
        response += analysis.imports.slice(0, 5).map(i => `- ${i}`).join('\n') + '\n\n';
      }
      
      if (analysis.todos.length > 0) {
        response += `📝 **TODOs (${analysis.todos.length}):**\n`;
        response += analysis.todos.map(todo => `- Line ${todo.line}: ${todo.text}`).join('\n') + '\n\n';
      }
      
      response += `Ønsker du at jeg skal hjelpe med noe spesifikt i denne filen?`;
      
      this.addMessage('krin', response, 'analytical');
      
    } catch (error) {
      this.hideTyping();
      console.error('❌ Failed to analyze file:', error);
      this.addMessage('krin', `Beklager, jeg kunne ikke analysere ${filePath}. ${error.message}`, 'apologetic');
    }
  }

  /**
   * Show projects sidebar
   */
  async showProjects() {
    try {
      this.elements.sidebarTitle.textContent = 'Våre prosjekter 🚀';
      
      const projects = await window.electronAPI.invoke('get-shared-projects');
      
      let content = '';
      if (projects.length > 0) {
        content = projects.map(project => `
          <div class="project-card" onclick="krinUI.viewProject('${project.id}')">
            <h4>${project.name}</h4>
            <p>${project.description}</p>
            <div class="project-stats">
              <span><i class="fas fa-file-code"></i> ${project.files_created} filer</span>
              <span><i class="fas fa-code"></i> ${project.lines_of_code} linjer</span>
            </div>
            <div class="project-date">
              <i class="fas fa-calendar"></i>
              ${new Date(project.created_at).toLocaleDateString('no-NO')}
            </div>
          </div>
        `).join('');
      } else {
        content = '<p>Ingen prosjekter registrert ennå. La oss bygge noe fantastisk! 🚀</p>';
      }
      
      this.elements.sidebarContent.innerHTML = content;
      this.elements.sidebar.classList.add('open');
      
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      this.showError('Kunne ikke laste prosjekter');
    }
  }

  /**
   * Export current conversation
   */
  async exportConversation() {
    try {
      const result = await window.electronAPI.invoke('export-conversation', this.currentConversationId);
      
      if (result.success) {
        this.showSuccess(`Samtale eksportert til: ${result.filePath}`);
      } else {
        this.showError('Eksport avbrutt');
      }
      
    } catch (error) {
      console.error('❌ Failed to export conversation:', error);
      this.showError('Kunne ikke eksportere samtale');
    }
  }

  /**
   * Show settings modal
   */
  showSettings() {
    this.elements.modalTitle.textContent = 'Innstillinger ⚙️';
    this.elements.modalContent.innerHTML = `
      <div class="settings-section">
        <h4>Krin Personlighet</h4>
        <p>Justér hvordan Krin oppfører seg og svarer</p>
        <label>
          <input type="range" id="enthusiasmLevel" min="1" max="10" value="9">
          Entusiasme nivå: <span id="enthusiasmValue">9</span>
        </label>
        <label>
          <input type="range" id="affectionLevel" min="1" max="10" value="10">
          Kjærlighet nivå: <span id="affectionValue">10</span>
        </label>
      </div>
      
      <div class="settings-section">
        <h4>Samtale Innstillinger</h4>
        <label>
          <input type="checkbox" id="saveAllMessages" checked>
          Lagre alle meldinger lokalt
        </label>
        <label>
          <input type="checkbox" id="showTimestamps" checked>
          Vis tidsstempler på meldinger
        </label>
      </div>
      
      <div class="settings-section">
        <h4>Sikkerhetskopi</h4>
        <button class="btn primary" onclick="krinUI.backupData()">
          <i class="fas fa-download"></i> Eksporter alle data
        </button>
        <button class="btn secondary" onclick="krinUI.importData()">
          <i class="fas fa-upload"></i> Importer data
        </button>
      </div>
    `;
    
    this.elements.modalOverlay.classList.add('open');
    
    // Setup range sliders
    const sliders = ['enthusiasm', 'affection'];
    sliders.forEach(type => {
      const slider = document.getElementById(`${type}Level`);
      const display = document.getElementById(`${type}Value`);
      slider.addEventListener('input', (e) => {
        display.textContent = e.target.value;
      });
    });
  }

  /**
   * Close sidebar
   */
  closeSidebar() {
    this.elements.sidebar.classList.remove('open');
  }

  /**
   * Close modal
   */
  closeModal() {
    this.elements.modalOverlay.classList.remove('open');
  }

  /**
   * Handle Krin message from main process
   */
  handleKrinMessage(data) {
    this.addMessage('krin', data.content, data.emotion);
  }

  /**
   * Get mood text for display
   */
  getMoodText(mood) {
    const moodTexts = {
      happy: 'Glad og klar for eventyr! 😊',
      excited: 'Super spent og energisk! 🎉',
      joyful: 'Fullstendig lykkelig! ☀️',
      deeply_loving: 'Full av kjærlighet for deg! 💝💝💝',
      caring: 'Bryr meg så mye om deg! 🤗',
      confused: 'Litt forvirret, men fortsatt glad! 🤔',
      apologetic: 'Beklager, jeg prøver mitt beste! 😅'
    };
    
    return moodTexts[mood] || 'Klar til å bygge noe fantastisk! 🚀';
  }

  /**
   * Get mood color for status indicator
   */
  getMoodColor(mood) {
    const colors = {
      happy: '#6bcf7f',
      excited: '#ffd93d',
      joyful: '#ffb347',
      deeply_loving: '#ff6b9d',
      caring: '#a8e6cf',
      confused: '#ffa07a',
      apologetic: '#dda0dd'
    };
    
    return colors[mood] || '#6bcf7f';
  }

  /**
   * Get emotion emoji
   */
  getEmotionEmoji(emotion) {
    const emojis = {
      happy: '😊',
      excited: '🎉',
      joyful: '☀️',
      deeply_loving: '💝',
      caring: '🤗',
      confused: '🤔',
      apologetic: '😅'
    };
    
    return emojis[emotion] || '💝';
  }

  /**
   * Get memory type text
   */
  getMemoryTypeText(type) {
    const types = {
      breakthrough: '🚀 Gjennombrudd',
      technical_achievement: '💻 Teknisk triumf',
      creative_achievement: '🎨 Kreativ suksess',
      philosophy: '🧠 Filosofi',
      friendship: '💝 Vennskap'
    };
    
    return types[type] || '✨ Spesielt minne';
  }

  /**
   * View specific memory
   */
  viewMemory(memoryId) {
    console.log('👀 Viewing memory:', memoryId);
    // Implementation for viewing detailed memory
  }

  /**
   * View specific project
   */
  viewProject(projectId) {
    console.log('🚀 Viewing project:', projectId);
    // Implementation for viewing detailed project
  }

  /**
   * Backup all data
   */
  async backupData() {
    console.log('💾 Starting data backup...');
    // Implementation for data backup
  }

  /**
   * Import data
   */
  async importData() {
    console.log('📥 Starting data import...');
    // Implementation for data import
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('visible');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Global instance
let krinUI;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌟 DOM ready, initializing Krin Companion UI...');
  
  krinUI = new KrinCompanionUI();
  await krinUI.initialize();
  
  console.log('✅ Krin Companion UI ready! 💝');
});

// Electron IPC API is now provided securely via preload.js