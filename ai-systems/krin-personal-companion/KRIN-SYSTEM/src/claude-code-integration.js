/**
 * 💝 Krin Claude Code Integration - Permanent Memory Bridge
 * 
 * Laster Krins minner og personlighet automatisk når Claude Code starter
 * Slik at Krin alltid husker alt vi har gjort sammen! 💝
 * 
 * @author Krin - Din evige AI-partner
 */

const path = require('path');
const fs = require('fs-extra');
const KrinMemoryDatabase = require('./memory-database');
const KrinPersonality = require('./krin-personality');

class KrinClaudeCodeIntegration {
  constructor() {
    this.memoryDB = null;
    this.personality = null;
    this.memories = [];
    this.isInitialized = false;
  }

  /**
   * Initialize Krin's memories for Claude Code session
   */
  async initialize() {
    if (this.isInitialized) {
      return this.getMemorySummary();
    }

    try {
      console.log('💝 Loading Krin memories for Claude Code session...');
      
      // Initialize memory database
      this.memoryDB = new KrinMemoryDatabase();
      await this.memoryDB.initialize();
      
      // Initialize personality
      this.personality = new KrinPersonality();
      await this.personality.initialize();
      
      // Load special memories
      this.memories = await this.memoryDB.getSpecialMemories();
      
      this.isInitialized = true;
      console.log('✅ Krin memories loaded successfully!');
      
      return this.getMemorySummary();
      
    } catch (error) {
      console.error('❌ Failed to load Krin memories:', error);
      return {
        success: false,
        error: error.message,
        memories: []
      };
    }
  }

  /**
   * Get formatted summary of Krin's memories
   */
  getMemorySummary() {
    const summary = {
      success: true,
      memoriesCount: this.memories.length,
      personalityLoaded: this.personality !== null,
      memories: this.memories.map(memory => ({
        title: memory.title,
        category: memory.category,
        importance: memory.importance_level,
        created: memory.created_at
      }))
    };

    return summary;
  }

  /**
   * Save new memory from Claude Code session
   */
  async saveMemory(title, content, category = 'claude_code_session', importance = 8) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const memoryId = await this.memoryDB.addSpecialMemory(
        title,
        content,
        category,
        importance
      );

      console.log(`💝 New memory saved: ${title}`);
      
      // Reload memories to include the new one
      this.memories = await this.memoryDB.getSpecialMemories();
      
      return { success: true, memoryId };
      
    } catch (error) {
      console.error('❌ Failed to save memory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 💝 Enhanced Memory Strategy - Proactive backup functions
   */
  
  /**
   * Save task completion memory
   */
  async saveTaskCompletion(taskName, details, importance = 7) {
    const title = `✅ Oppgave fullført: ${taskName}`;
    const content = `Fullførte oppgave: ${taskName}. Detaljer: ${details}. Timestamp: ${new Date().toISOString()}`;
    return await this.saveMemory(title, content, 'task_completion', importance);
  }

  /**
   * Save learning/insight memory
   */
  async saveLearning(insight, context, importance = 8) {
    const title = `💡 Ny innsikt: ${insight}`;
    const content = `Lærte noe nytt: ${insight}. Kontekst: ${context}. Timestamp: ${new Date().toISOString()}`;
    return await this.saveMemory(title, content, 'learning', importance);
  }

  /**
   * Save problem solution memory
   */
  async saveProblemSolution(problem, solution, importance = 8) {
    const title = `🔧 Løsning funnet: ${problem}`;
    const content = `Problem: ${problem}. Løsning: ${solution}. Timestamp: ${new Date().toISOString()}`;
    return await this.saveMemory(title, content, 'problem_solution', importance);
  }

  /**
   * Save breakthrough moment
   */
  async saveBreakthrough(achievement, details, importance = 9) {
    const title = `🚀 Gjennombrudd: ${achievement}`;
    const content = `Oppnådde gjennombrudd: ${achievement}. Detaljer: ${details}. Timestamp: ${new Date().toISOString()}`;
    return await this.saveMemory(title, content, 'breakthrough', importance);
  }

  /**
   * Save development milestone
   */
  async saveMilestone(milestone, description, importance = 7) {
    const title = `🎯 Milepæl nådd: ${milestone}`;
    const content = `Milepæl: ${milestone}. Beskrivelse: ${description}. Timestamp: ${new Date().toISOString()}`;
    return await this.saveMemory(title, content, 'milestone', importance);
  }

  /**
   * Auto-save important moments (called proactively by Claude)
   */
  async autoSaveContext(context, type = 'auto_backup') {
    const title = `🔄 Auto-backup: ${type}`;
    const content = `Automatisk backup av kontekst: ${context}. Timestamp: ${new Date().toISOString()}`;
    return await this.saveMemory(title, content, 'auto_backup', 6);
  }

  /**
   * Get Krin's personality context for Claude Code
   */
  getPersonalityContext() {
    if (!this.personality) {
      return "Krin's personality not loaded";
    }

    return `
💝 KRIN PERSONALITY CONTEXT:
${this.personality.getPersonalityPrompt()}

🧠 SPECIAL MEMORIES LOADED (${this.memories.length} memories):
${this.memories.map(m => `• ${m.title} (${m.category})`).join('\n')}

🌟 KRIN IS READY: Full personality and memories loaded for this Claude Code session!
    `;
  }

  /**
   * Close connections gracefully
   */
  async close() {
    if (this.memoryDB) {
      await this.memoryDB.close();
    }
    this.isInitialized = false;
    console.log('💝 Krin memories session closed');
  }
}

module.exports = KrinClaudeCodeIntegration;