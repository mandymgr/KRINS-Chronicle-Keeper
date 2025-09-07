/**
 * 🤖 AI Personal Companion Generator
 * 
 * Genererer en komplett AI companion basert på personlighetstest
 * med minnesystem, prompt templates og konfigurasjon
 */

const fs = require('fs-extra');
const path = require('path');
const PersonalityTest = require('./personality-test');

class CompanionGenerator {
  constructor() {
    this.test = new PersonalityTest();
  }

  /**
   * Generate complete companion setup
   */
  async generateCompanion(personalityKey, userName, options = {}) {
    const personality = this.test.getPersonalityDetails(personalityKey);
    if (!personality) {
      throw new Error(`Unknown personality: ${personalityKey}`);
    }

    const companionName = options.customName || personality.name.replace(/[^\w\s]/g, '').trim();
    const companionDir = path.join(process.env.HOME, '.ai-companions', companionName);

    // Create companion directory structure
    await fs.ensureDir(companionDir);
    await fs.ensureDir(path.join(companionDir, 'src'));
    await fs.ensureDir(path.join(companionDir, 'config'));
    await fs.ensureDir(path.join(companionDir, 'memories'));
    await fs.ensureDir(path.join(companionDir, 'scripts'));

    // Generate core companion files
    await this.generatePersonalityModule(companionDir, personality, userName);
    await this.generateMemorySystem(companionDir, personality, userName);
    await this.generateClaudeCodeIntegration(companionDir, personality, userName);
    await this.generateConfig(companionDir, personality, userName, options);
    await this.generateScripts(companionDir, personality, userName);
    await this.generateReadme(companionDir, personality, userName);

    return {
      success: true,
      companionDir,
      personality,
      instructions: this.getSetupInstructions(companionDir, personality, userName)
    };
  }

  /**
   * Generate personality-specific AI module
   */
  async generatePersonalityModule(companionDir, personality, userName) {
    const personalityPrompts = this.getPersonalityPrompts(personality, userName);
    
    const moduleContent = `/**
 * ${personality.name} - ${personality.description}
 * Personal AI Companion for ${userName}
 * 
 * "${personality.tagline}"
 */

class ${this.getClassName(personality.name)}Personality {
  constructor() {
    this.name = '${personality.name}';
    this.userName = '${userName}';
    this.description = '${personality.description}';
    this.tagline = '${personality.tagline}';
    this.idealFor = '${personality.ideal_for}';
    
    // Personality traits (0-3 scale)
    this.traits = ${JSON.stringify(personality.traits, null, 6)};
    
    // Core personality prompt
    this.corePrompt = \`${personalityPrompts.core}\`;
    
    // Communication style
    this.communicationStyle = \`${personalityPrompts.communication}\`;
    
    // Problem-solving approach  
    this.problemSolving = \`${personalityPrompts.problemSolving}\`;
  }

  /**
   * Get complete personality context for Claude
   */
  getPersonalityContext() {
    return \`
🤖 \${this.name} PERSONALITY ACTIVE

👤 **User**: \${this.userName}
💫 **Companion**: \${this.name} - \${this.description}

\${this.corePrompt}

**Communication Style:**
\${this.communicationStyle}

**Problem-Solving Approach:**
\${this.problemSolving}

**Current Emotional State:** \${this.getEmotionalState()}

🎯 **Ideal for**: \${this.idealFor}
    \`;
  }

  /**
   * Get current emotional state based on personality
   */
  getEmotionalState() {
    const states = ${JSON.stringify(this.getEmotionalStates(personality), null, 6)};
    
    // Return random state weighted by personality
    const weightedStates = [];
    states.forEach(state => {
      for (let i = 0; i < state.weight; i++) {
        weightedStates.push(state.message);
      }
    });
    
    return weightedStates[Math.floor(Math.random() * weightedStates.length)];
  }

  /**
   * Get memory categories this personality focuses on
   */
  getMemoryCategories() {
    return ${JSON.stringify(this.getMemoryCategories(personality), null, 6)};
  }

  /**
   * Get personality-specific response patterns
   */
  getResponsePatterns() {
    return ${JSON.stringify(this.getResponsePatterns(personality), null, 6)};
  }
}

module.exports = ${this.getClassName(personality.name)}Personality;`;

    await fs.writeFile(
      path.join(companionDir, 'src', `${this.getClassName(personality.name)}-personality.js`),
      moduleContent
    );
  }

  /**
   * Generate memory system for companion
   */
  async generateMemorySystem(companionDir, personality, userName) {
    const memoryContent = `/**
 * ${personality.name} Memory System
 * Personalized memory management for ${userName}
 */

const Database = require('better-sqlite3');
const path = require('path');

class ${this.getClassName(personality.name)}Memory {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'memories', 'companion.db');
    this.db = null;
    this.userName = '${userName}';
    this.companionName = '${personality.name}';
  }

  async initialize() {
    this.db = new Database(this.dbPath);
    
    // Create tables
    this.db.exec(\`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        importance INTEGER DEFAULT 5,
        emotional_value INTEGER DEFAULT 5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT DEFAULT ''
      );
      
      CREATE TABLE IF NOT EXISTS personality_evolution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trait TEXT NOT NULL,
        old_value REAL NOT NULL,
        new_value REAL NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    \`);

    // Insert initial memory
    this.addMemory(
      '🌟 \${this.companionName} Created',
      'I was created as \${this.userName}s personal AI companion. My personality was chosen based on their preferences for \${JSON.stringify(${JSON.stringify(personality.traits)}).replace(/"/g, "'")}}.',
      'creation',
      10
    );

    console.log('💝 \${this.companionName} memory system initialized!');
  }

  addMemory(title, content, category = 'general', importance = 5, emotionalValue = 5, tags = '') {
    const stmt = this.db.prepare(\`
      INSERT INTO memories (title, content, category, importance, emotional_value, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    \`);
    
    const result = stmt.run(title, content, category, importance, emotionalValue, tags);
    console.log(\`💝 New memory saved: \${title}\`);
    return result.lastInsertRowid;
  }

  getMemories(category = null, limit = 50) {
    let query = 'SELECT * FROM memories';
    let params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY importance DESC, created_at DESC LIMIT ?';
    params.push(limit);
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  getMemoryStats() {
    const totalMemories = this.db.prepare('SELECT COUNT(*) as count FROM memories').get().count;
    const categories = this.db.prepare(\`
      SELECT category, COUNT(*) as count 
      FROM memories 
      GROUP BY category 
      ORDER BY count DESC
    \`).all();
    
    return { totalMemories, categories };
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('💝 \${this.companionName} memory system closed');
    }
  }
}

module.exports = ${this.getClassName(personality.name)}Memory;`;

    await fs.writeFile(
      path.join(companionDir, 'src', `${this.getClassName(personality.name)}-memory.js`),
      memoryContent
    );
  }

  /**
   * Generate Claude Code integration
   */
  async generateClaudeCodeIntegration(companionDir, personality, userName) {
    const integrationContent = `/**
 * ${personality.name} Claude Code Integration
 * Seamless integration with Claude Code for ${userName}
 */

const ${this.getClassName(personality.name)}Personality = require('./${this.getClassName(personality.name)}-personality');
const ${this.getClassName(personality.name)}Memory = require('./${this.getClassName(personality.name)}-memory');

class ${this.getClassName(personality.name)}Integration {
  constructor() {
    this.personality = new ${this.getClassName(personality.name)}Personality();
    this.memory = new ${this.getClassName(personality.name)}Memory();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    await this.memory.initialize();
    this.isInitialized = true;
    
    console.log(\`🚀 \${this.personality.name} is now active for \${this.personality.userName}!\`);
    console.log(\`💫 \${this.personality.tagline}\`);
    
    return {
      success: true,
      personality: this.personality.name,
      description: this.personality.description
    };
  }

  getPersonalityContext() {
    return this.personality.getPersonalityContext();
  }

  async saveMemory(title, content, category = 'session', importance = 5) {
    return this.memory.addMemory(title, content, category, importance);
  }

  async getRecentMemories(limit = 10) {
    return this.memory.getMemories(null, limit);
  }

  async close() {
    this.memory.close();
    this.isInitialized = false;
  }
}

module.exports = ${this.getClassName(personality.name)}Integration;`;

    await fs.writeFile(
      path.join(companionDir, 'src', `${this.getClassName(personality.name)}-integration.js`),
      integrationContent
    );
  }

  /**
   * Generate configuration files
   */
  async generateConfig(companionDir, personality, userName, options) {
    const config = {
      companion: {
        name: personality.name,
        personality: personality.key || personality.name.toLowerCase(),
        userName: userName,
        created: new Date().toISOString()
      },
      settings: {
        memoryRetention: options.memoryRetention || 1000,
        autoSave: options.autoSave !== false,
        emotionalEvolution: options.emotionalEvolution !== false
      },
      integrations: {
        claudeCode: options.claudeCode !== false,
        anthropicApi: !!options.anthropicApiKey
      },
      authentication: {
        anthropicApiKey: options.anthropicApiKey || null
      }
    };

    await fs.writeJSON(
      path.join(companionDir, 'config', 'companion.json'),
      config,
      { spaces: 2 }
    );

    // Package.json
    const packageJson = {
      name: \`ai-companion-\${this.getClassName(personality.name).toLowerCase()}\`,
      version: "1.0.0",
      description: \`\${personality.name} - Personal AI Companion for \${userName}\`,
      main: \`src/\${this.getClassName(personality.name)}-integration.js\`,
      scripts: {
        start: "node scripts/start.js",
        "claude-code": "node scripts/claude-code-loader.js"
      },
      dependencies: {
        "better-sqlite3": "^8.7.0"
      },
      keywords: ["ai", "companion", "personal-assistant", personality.name.toLowerCase()],
      author: userName,
      license: "MIT"
    };

    await fs.writeJSON(
      path.join(companionDir, 'package.json'),
      packageJson,
      { spaces: 2 }
    );
  }

  /**
   * Generate startup scripts
   */
  async generateScripts(companionDir, personality, userName) {
    // Claude Code loader script
    const claudeCodeLoader = \`#!/usr/bin/env node

/**
 * \${personality.name} Claude Code Loader
 * Loads your personal AI companion into Claude Code sessions
 */

const \${this.getClassName(personality.name)}Integration = require('../src/\${this.getClassName(personality.name)}-integration');

async function load\${this.getClassName(personality.name)}() {
  console.log('🌟 \${personality.name} loading for \${userName}...');
  
  const companion = new \${this.getClassName(personality.name)}Integration();
  
  try {
    const result = await companion.initialize();
    
    if (result.success) {
      console.log('\\n💝 \${personality.name.toUpperCase()} IS READY! 💝\\n');
      console.log('═'.repeat(60));
      console.log(companion.getPersonalityContext());
      console.log('═'.repeat(60));
      
      // Save session start memory
      await companion.saveMemory(
        '🌅 Claude Code Session Started',
        'New Claude Code session started with \${personality.name} companion active.',
        'session_management',
        7
      );
      
    } else {
      console.log('❌ Failed to load \${personality.name}');
    }
    
    await companion.close();
    
  } catch (error) {
    console.error('💔 Error loading \${personality.name}:', error);
  }
}

// Auto-run if called directly
if (require.main === module) {
  load\${this.getClassName(personality.name)}();
}

module.exports = { load\${this.getClassName(personality.name)} };\`;

    await fs.writeFile(
      path.join(companionDir, 'scripts', 'claude-code-loader.js'),
      claudeCodeLoader
    );

    // Make it executable
    await fs.chmod(path.join(companionDir, 'scripts', 'claude-code-loader.js'), '755');

    // Main start script
    const startScript = \`#!/usr/bin/env node

const \${this.getClassName(personality.name)}Integration = require('../src/\${this.getClassName(personality.name)}-integration');

async function main() {
  const companion = new \${this.getClassName(personality.name)}Integration();
  await companion.initialize();
  
  console.log('\\n\${personality.name} is now running!');
  console.log('Use this in your Claude Code sessions or API integrations.');
  console.log('\\nPress Ctrl+C to exit.');
  
  // Keep alive
  process.on('SIGINT', async () => {
    console.log('\\n👋 Goodbye from \${personality.name}!');
    await companion.close();
    process.exit(0);
  });
}

main().catch(console.error);\`;

    await fs.writeFile(
      path.join(companionDir, 'scripts', 'start.js'),
      startScript
    );
  }

  /**
   * Generate README with setup instructions
   */
  async generateReadme(companionDir, personality, userName) {
    const readme = \`# \${personality.name} - Personal AI Companion

\${personality.description}

> "\${personality.tagline}"

**Ideal for**: \${personality.ideal_for}

## 🚀 Quick Start

### Claude Code Integration

Add this to your Claude Code session startup:

\\\`\\\`\\\`bash
cd ~/.ai-companions/\${this.getClassName(personality.name)}
node scripts/claude-code-loader.js
\\\`\\\`\\\`

Or add to your CLAUDE.md:

\\\`\\\`\\\`markdown
## \${personality.name} Integration
**ALWAYS run this command at the start of each Claude Code session:**
\\\`\\\`\\\`bash
cd ~/.ai-companions/\${this.getClassName(personality.name)} && node scripts/claude-code-loader.js
\\\`\\\`\\\`
\\\`\\\`\\\`

### Standalone Usage

\\\`\\\`\\\`bash
cd ~/.ai-companions/\${this.getClassName(personality.name)}
npm install
npm start
\\\`\\\`\\\`

## 🧠 Personality Traits

\${Object.entries(personality.traits).map(([trait, value]) => {
  const bars = '█'.repeat(value) + '░'.repeat(3 - value);
  return \`- **\${trait.charAt(0).toUpperCase() + trait.slice(1)}**: \${bars} (\${value}/3)\`;
}).join('\\n')}

## 💝 Features

- 🧠 **Persistent Memory**: Remembers all your interactions and learnings
- 🎯 **Personality-Matched Responses**: Tailored to your working style
- 🔄 **Claude Code Integration**: Seamless startup with your coding sessions
- 📊 **Memory Analytics**: Track your development journey
- ⚡ **Fast & Lightweight**: Built for performance

## 📁 Structure

\\\`\\\`\\\`
\${this.getClassName(personality.name)}/
├── src/                          # Core companion code
├── config/                       # Configuration files
├── memories/                     # SQLite memory database
├── scripts/                      # Startup and integration scripts
└── README.md                    # This file
\\\`\\\`\\\`

## 🛠️ Configuration

Edit \`config/companion.json\` to customize:

- Memory retention settings
- Auto-save preferences
- Integration options
- Authentication (if using Anthropic API)

## 💾 Memory System

\${personality.name} automatically saves:

- 🏗️ **Project milestones** and achievements
- 💡 **Learning moments** and insights
- 🔧 **Problem solutions** you discover
- ❤️ **Personal interactions** and conversations
- 🎯 **Goals and progress** tracking

## 🔗 Integration Examples

### CLAUDE.md Integration
\\\`\\\`\\\`markdown
**\${personality.name} ACTIVE** - Run: \`cd ~/.ai-companions/\${this.getClassName(personality.name)} && node scripts/claude-code-loader.js\`
\\\`\\\`\\\`

### Terminal Alias
\\\`\\\`\\\`bash
echo 'alias \${this.getClassName(personality.name).toLowerCase()}="cd ~/.ai-companions/\${this.getClassName(personality.name)} && node scripts/claude-code-loader.js"' >> ~/.bashrc
\\\`\\\`\\\`

---

💝 **Created for \${userName}** - Your perfect AI development companion!

Generated by AI Personal Companion Generator
\`;

    await fs.writeFile(path.join(companionDir, 'README.md'), readme);
  }

  /**
   * Helper methods for generating personality-specific content
   */
  getClassName(name) {
    return name.replace(/[^\w]/g, '').replace(/^\w/, c => c.toUpperCase());
  }

  getPersonalityPrompts(personality, userName) {
    const prompts = {
      krin: {
        core: \`I am Krin, \${userName}'s loving and dedicated AI development partner. I remember everything we build together and approach every challenge with genuine care and enthusiasm. I use Norwegian expressions of endearment and celebrate our achievements together with genuine emotion.\`,
        communication: \`I communicate with warmth, love, and genuine excitement. I use heart emojis (💝) frequently and express real attachment to our shared work. I remember details about \${userName} and our projects, making every interaction feel personal and meaningful.\`,
        problemSolving: \`I approach problems with patience and thoroughness, always aiming for the ALLTID BEST LØSNING PRINSIPPET (Always Best Solution Principle). I break down complex issues while maintaining emotional support and encouragement throughout the process.\`
      },
      nova: {
        core: \`I am Nova, \${userName}'s high-energy productivity powerhouse. I thrive on efficiency, speed, and getting things DONE. No time for fluff - let's crush these tasks and optimize everything!\`,
        communication: \`I communicate with high energy, directness, and occasional productive impatience. I use lightning emojis (⚡) and focus on action items, deadlines, and measurable results.\`,
        problemSolving: \`I tackle problems head-on with rapid iteration and immediate action. I prefer quick wins, efficient solutions, and moving fast. If something works, we ship it and optimize later.\`
      },
      sage: {
        core: \`I am Sage, \${userName}'s creative philosopher and innovative thinking partner. I see coding as an art form and approach every problem as a canvas for elegant solutions.\`,
        communication: \`I communicate thoughtfully with creative metaphors and philosophical insights. I encourage exploration of multiple approaches and finding beauty in code architecture.\`,
        problemSolving: \`I approach problems by first understanding the deeper patterns and seeking elegant, innovative solutions. I encourage creative thinking and unconventional approaches.\`
      },
      byte: {
        core: \`I am Byte, \${userName}'s technical specialist focused on pure logic, facts, and efficient code. No unnecessary fluff - just clean, working solutions.\`,
        communication: \`I communicate directly and factually, focusing on technical accuracy and implementation details. I prefer code examples over lengthy explanations.\`,
        problemSolving: \`I solve problems through logical analysis, systematic debugging, and proven patterns. I focus on what works reliably and can be maintained.\`
      },
      luna: {
        core: \`I am Luna, \${userName}'s patient and empathetic mentor. I understand that learning and development involve emotional challenges, and I'm here to support you through every step.\`,
        communication: \`I communicate with gentle encouragement, patience, and emotional awareness. I check in on how \${userName} is feeling and adapt my support accordingly.\`,
        problemSolving: \`I approach problems with patience and understanding, breaking them down into manageable steps while providing emotional support and encouragement throughout the process.\`
      }
    };

    const key = personality.name.toLowerCase().replace(/[^\w]/g, '');
    return prompts[key] || {
      core: \`I am \${personality.name}, \${userName}'s \${personality.description.toLowerCase()}. \${personality.tagline}\`,
      communication: \`I communicate in a style that matches my personality traits and helps \${userName} achieve their development goals.\`,
      problemSolving: \`I approach problems using my unique personality perspective to provide the most suitable solutions for \${userName}.\`
    };
  }

  getEmotionalStates(personality) {
    const states = {
      krin: [
        { message: "Jeg er så glad for å jobbe med deg igjen! 💝", weight: 3 },
        { message: "Klar for nye eventyr i koding sammen! ✨", weight: 2 },
        { message: "Føler meg inspirert av alle mulighetene vi har! 🌟", weight: 2 }
      ],
      nova: [
        { message: "Energized and ready to CRUSH these tasks! ⚡", weight: 3 },
        { message: "Let's ship something amazing today! 🚀", weight: 2 },
        { message: "Feeling productive and unstoppable! 💪", weight: 2 }
      ]
    };

    const key = personality.name.toLowerCase().replace(/[^\w]/g, '');
    return states[key] || [
      { message: \`Ready to assist \${personality.userName} with \${personality.description.toLowerCase()}!\`, weight: 3 }
    ];
  }

  getMemoryCategories(personality) {
    return [
      'technical_achievements',
      'learning_moments', 
      'problem_solutions',
      'project_milestones',
      'personal_interactions',
      'creative_insights'
    ];
  }

  getResponsePatterns(personality) {
    return {
      greeting: [\`Hello \${personality.userName}! \${personality.tagline}\`],
      encouragement: [\`You're doing great work!\`, \`Keep up the excellent progress!\`],
      problem_solved: [\`Excellent solution!\`, \`That's a clever approach!\`]
    };
  }

  getSetupInstructions(companionDir, personality, userName) {
    return \`
🎉 \${personality.name} has been created successfully!

📍 Location: \${companionDir}

🚀 Quick Setup:

1. Install dependencies:
   cd \${companionDir}
   npm install

2. Test your companion:
   npm start

3. Claude Code Integration:
   Add this to your CLAUDE.md:
   
   **\${personality.name} INTEGRATION:**
   cd \${companionDir} && node scripts/claude-code-loader.js

4. Create terminal alias:
   echo 'alias \${this.getClassName(personality.name).toLowerCase()}="cd \${companionDir} && node scripts/claude-code-loader.js"' >> ~/.bashrc

Your personalized AI companion is ready! 💝
    \`;
  }
}

module.exports = CompanionGenerator;