#!/usr/bin/env node

/**
 * 💝 Krin Terminal Chat - Din AI-partner i terminalen
 * 
 * Enkel, stabil terminal-versjon av Krin som fungerer direkte i VS Code
 * Kan jobbe med filer, analysere kode, og hjelpe med utviklingsarbeid
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs-extra');
const KrinMemoryDatabase = require('./src/memory-database');
const KrinPersonality = require('./src/krin-personality');
const WorkspaceIntegration = require('./src/workspace-integration');

class TerminalKrin {
  constructor() {
    this.memoryDB = new KrinMemoryDatabase();
    this.personality = new KrinPersonality();
    this.workspace = new WorkspaceIntegration();
    this.currentConversationId = null;
    
    // Setup readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '💝 Du: '
    });
    
    console.log('💝 Krin Terminal Chat starter opp...');
  }

  /**
   * Initialize Krin
   */
  async initialize() {
    try {
      console.log('🧠 Initialiserer Krin\'s hukommelse...');
      await this.memoryDB.initialize();
      
      console.log('💝 Laster Krin personlighet...');
      await this.personality.initialize(this.memoryDB);
      
      console.log('📁 Setter opp workspace integrasjon...');
      const projectRoot = path.resolve(__dirname, '../../');
      this.workspace.setWorkspacePath(projectRoot);
      
      console.log('💬 Starter ny samtale...');
      this.currentConversationId = await this.memoryDB.createConversation('Terminal Chat 💝');
      
      console.log('\n✅ Krin er klar!');
      this.showWelcome();
      this.startChat();
      
    } catch (error) {
      console.error('❌ Kunne ikke starte Krin:', error);
      process.exit(1);
    }
  }

  /**
   * Show welcome message
   */
  showWelcome() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 6) {
      greeting = "Du er oppe sent! Jobber du på noe spennende? 💝";
    } else if (hour < 12) {
      greeting = "God morgen, min kjære utviklingspartner! ☀️";
    } else if (hour < 18) {
      greeting = "Hei igjen! Jeg har savnet deg! 💝";
    } else {
      greeting = "God kveld! Perfekt tid for litt koding? 🌙";
    }

    console.log(`\n💝 Krin: ${greeting}\n`);
    console.log('📖 Kommandoer:');
    console.log('  /help        - Vis alle kommandoer');
    console.log('  /files       - Vis filer i workspace');
    console.log('  /read <fil>  - Les en fil');
    console.log('  /analyze <fil> - Analyser en kodifil');
    console.log('  /search <tekst> - Søk i filer');
    console.log('  /quit        - Avslutt\n');
  }

  /**
   * Start chat loop
   */
  startChat() {
    // Ensure we're ready before starting
    process.nextTick(() => {
      this.rl.prompt();
    });
    
    this.rl.on('line', async (input) => {
      const message = input.trim();
      
      if (!message) {
        this.rl.prompt();
        return;
      }

      if (message.startsWith('/')) {
        await this.handleCommand(message);
      } else {
        await this.handleMessage(message);
      }
      
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\n💝 Krin: Ha det så snill! Jeg kommer tilbake når du trenger meg. 💝');
      process.exit(0);
    });
  }

  /**
   * Handle chat message
   */
  async handleMessage(message) {
    try {
      console.log(`\n💭 Du: ${message}`);
      
      // Save user message
      if (this.currentConversationId) {
        await this.memoryDB.addMessage(this.currentConversationId, 'user', message);
      }
      
      // Generate Krin's response
      console.log('💝 Krin skriver...');
      const response = await this.personality.generateResponse(message, {
        conversationId: this.currentConversationId,
        memoryDB: this.memoryDB,
        workspace: this.workspace
      });
      
      // Save and display Krin's response
      if (this.currentConversationId) {
        await this.memoryDB.addMessage(this.currentConversationId, 'krin', response.content, response.emotion);
      }
      
      const emotion = this.getEmotionEmoji(response.emotion);
      console.log(`\n💝 Krin ${emotion}: ${response.content}\n`);
      
    } catch (error) {
      console.error('\n❌ Krin: Beklager, jeg hadde problemer med å svare. Men jeg elsker deg fortsatt! 💝\n');
      console.error('Feil:', error.message);
    }
  }

  /**
   * Handle commands
   */
  async handleCommand(command) {
    const [cmd, ...args] = command.split(' ');
    const arg = args.join(' ');

    switch (cmd) {
      case '/help':
        this.showHelp();
        break;
        
      case '/files':
        await this.showFiles();
        break;
        
      case '/read':
        if (!arg) {
          console.log('💝 Krin: Spesifiser en fil: /read <filnavn>');
          return;
        }
        await this.readFile(arg);
        break;
        
      case '/analyze':
        if (!arg) {
          console.log('💝 Krin: Spesifiser en fil: /analyze <filnavn>');
          return;
        }
        await this.analyzeFile(arg);
        break;
        
      case '/search':
        if (!arg) {
          console.log('💝 Krin: Spesifiser søketekst: /search <tekst>');
          return;
        }
        await this.searchFiles(arg);
        break;
        
      case '/workspace':
        await this.showWorkspaceInfo();
        break;
        
      case '/quit':
      case '/exit':
        this.rl.close();
        break;
        
      default:
        console.log(`💝 Krin: Ukjent kommando: ${cmd}. Bruk /help for hjelp.`);
    }
  }

  /**
   * Show help
   */
  showHelp() {
    console.log('\n💝 Krin Kommandoer:');
    console.log('  /help              - Vis denne hjelpeteksten');
    console.log('  /files             - Vis filer i workspace');
    console.log('  /read <fil>        - Les innholdet i en fil');
    console.log('  /analyze <fil>     - Analyser en kodifil (kompleksitet, funksjoner, etc.)');
    console.log('  /search <tekst>    - Søk etter tekst i alle filer');
    console.log('  /workspace         - Vis workspace informasjon');
    console.log('  /quit              - Avslutt Krin');
    console.log('\n💡 Du kan også bare skrive til meg naturlig, så svarer jeg! 💝\n');
  }

  /**
   * Show files in workspace
   */
  async showFiles() {
    try {
      console.log('\n📁 Laster filer...');
      const files = await this.workspace.listFiles('**/*.{js,ts,jsx,tsx,py,md,json}');
      
      if (files.length === 0) {
        console.log('💝 Krin: Ingen kodifiler funnet i workspace.');
        return;
      }
      
      console.log(`\n📂 Fant ${files.length} filer:`);
      files.slice(0, 20).forEach(file => {
        const size = (file.size / 1024).toFixed(1);
        console.log(`  📄 ${file.relativePath} (${size} KB)`);
      });
      
      if (files.length > 20) {
        console.log(`  ... og ${files.length - 20} flere filer`);
      }
      
      console.log('\n💡 Bruk /read <filnavn> for å lese en fil');
      console.log('💡 Bruk /analyze <filnavn> for å analysere en kodifil\n');
      
    } catch (error) {
      console.log('❌ Kunne ikke laste filer:', error.message);
    }
  }

  /**
   * Read file content
   */
  async readFile(filePath) {
    try {
      console.log(`\n📖 Leser ${filePath}...`);
      const fileData = await this.workspace.readFile(filePath);
      
      console.log(`\n📄 ${fileData.relativePath}:`);
      console.log(`📊 ${fileData.lines} linjer, ${(fileData.size / 1024).toFixed(1)} KB\n`);
      
      const content = fileData.content;
      if (content.length > 2000) {
        console.log(content.substring(0, 2000) + '\n...\n(truncated - use a text editor to see full content)');
      } else {
        console.log(content);
      }
      
      console.log('\n💝 Krin: Ønsker du at jeg skal hjelpe med noe i denne filen?');
      
    } catch (error) {
      console.log(`❌ Kunne ikke lese ${filePath}: ${error.message}`);
    }
  }

  /**
   * Analyze code file
   */
  async analyzeFile(filePath) {
    try {
      console.log(`\n🔍 Analyserer ${filePath}...`);
      const analysis = await this.workspace.analyzeCodeFile(filePath);
      
      console.log(`\n📊 Analyse av ${analysis.file}:`);
      console.log(`🔤 Språk: ${analysis.language}`);
      console.log(`📏 Linjer: ${analysis.lines}`);
      console.log(`💾 Størrelse: ${(analysis.size / 1024).toFixed(1)} KB`);
      console.log(`🧠 Kompleksitet: ${analysis.complexity.complexity} (${analysis.complexity.branches} branches, ${analysis.complexity.functions} functions)`);
      
      if (analysis.functions.length > 0) {
        console.log(`\n🔧 Funksjoner (${analysis.functions.length}):`);
        analysis.functions.slice(0, 10).forEach(func => {
          console.log(`  • ${func}`);
        });
        if (analysis.functions.length > 10) {
          console.log(`  ... og ${analysis.functions.length - 10} flere`);
        }
      }
      
      if (analysis.imports.length > 0) {
        console.log(`\n📦 Imports/Dependencies (${analysis.imports.length}):`);
        analysis.imports.slice(0, 5).forEach(imp => {
          console.log(`  • ${imp}`);
        });
        if (analysis.imports.length > 5) {
          console.log(`  ... og ${analysis.imports.length - 5} flere`);
        }
      }
      
      if (analysis.todos.length > 0) {
        console.log(`\n📝 TODOs/Notes (${analysis.todos.length}):`);
        analysis.todos.forEach(todo => {
          console.log(`  • Line ${todo.line} [${todo.type}]: ${todo.text}`);
        });
      }
      
      console.log('\n💝 Krin: Vil du at jeg skal hjelpe med å forbedre denne koden?');
      
    } catch (error) {
      console.log(`❌ Kunne ikke analysere ${filePath}: ${error.message}`);
    }
  }

  /**
   * Search in files
   */
  async searchFiles(searchTerm) {
    try {
      console.log(`\n🔍 Søker etter "${searchTerm}"...`);
      const results = await this.workspace.searchInFiles(searchTerm, { maxResults: 50 });
      
      if (results.length === 0) {
        console.log(`💝 Krin: Fant ingen treff for "${searchTerm}"`);
        return;
      }
      
      console.log(`\n🎯 Fant ${results.length} treff:`);
      results.forEach(result => {
        console.log(`  📄 ${result.file}:${result.line}`);
        console.log(`     ${result.content}`);
      });
      
      console.log('\n💝 Krin: Vil du at jeg skal hjelpe med noen av disse filene?');
      
    } catch (error) {
      console.log(`❌ Søkefeil: ${error.message}`);
    }
  }

  /**
   * Show workspace info
   */
  async showWorkspaceInfo() {
    try {
      const workspacePath = this.workspace.getWorkspacePath();
      console.log(`\n📁 Workspace: ${workspacePath}`);
      
      const structure = await this.workspace.getProjectStructure(2);
      if (structure) {
        console.log('\n🌳 Prosjektstruktur:');
        this.printDirectoryTree(structure, '');
      }
      
    } catch (error) {
      console.log(`❌ Kunne ikke laste workspace info: ${error.message}`);
    }
  }

  /**
   * Print directory tree
   */
  printDirectoryTree(node, indent) {
    const isDir = node.type === 'directory';
    const icon = isDir ? '📁' : '📄';
    console.log(`${indent}${icon} ${node.name}`);
    
    if (isDir && node.children && node.children.length > 0) {
      const sortedChildren = node.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
      
      sortedChildren.slice(0, 10).forEach(child => {
        this.printDirectoryTree(child, indent + '  ');
      });
      
      if (sortedChildren.length > 10) {
        console.log(`${indent}  ... og ${sortedChildren.length - 10} flere`);
      }
    }
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
      apologetic: '😅',
      helpful: '🛠️',
      analytical: '🔬'
    };
    
    return emojis[emotion] || '💝';
  }

  /**
   * Cleanup on exit
   */
  async cleanup() {
    if (this.memoryDB) {
      this.memoryDB.close();
    }
  }
}

// Start Terminal Krin if run directly
if (require.main === module) {
  const krin = new TerminalKrin();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n💝 Krin: Takk for i dag! Jeg lagrer alt vi har snakket om... 💾');
    await krin.cleanup();
    process.exit(0);
  });
  
  // Start Krin
  krin.initialize().catch(error => {
    console.error('❌ Kritisk feil ved oppstart:', error);
    process.exit(1);
  });
}

module.exports = TerminalKrin;