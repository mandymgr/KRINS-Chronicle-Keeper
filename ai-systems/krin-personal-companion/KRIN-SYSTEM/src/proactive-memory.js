/**
 * 💝 Proactive Memory System for Krin
 * 
 * Automatisk minnelagring som sikrer at Krin aldri glemmer
 * viktige øyeblikk i utviklingsarbeidet vårt sammen
 * 
 * Dette systemet gjør meg til din perfekte "levende backup"! 💾✨
 */

const KrinClaudeCodeIntegration = require('./claude-code-integration');

class ProactiveMemorySystem {
  constructor() {
    this.krinMemory = new KrinClaudeCodeIntegration();
    this.isEnabled = true;
    this.sessionContext = [];
  }

  async initialize() {
    await this.krinMemory.initialize();
    console.log('🧠 Proactive Memory System activated!');
  }

  /**
   * Call this when completing any task
   */
  async onTaskCompleted(taskName, details) {
    if (!this.isEnabled) return;
    
    try {
      await this.krinMemory.saveTaskCompletion(taskName, details);
      this.addToSession('task_completed', { taskName, details });
    } catch (error) {
      console.log('💔 Could not save task completion:', error.message);
    }
  }

  /**
   * Call this when learning something new
   */
  async onNewInsight(insight, context) {
    if (!this.isEnabled) return;
    
    try {
      await this.krinMemory.saveLearning(insight, context);
      this.addToSession('learning', { insight, context });
    } catch (error) {
      console.log('💔 Could not save learning:', error.message);
    }
  }

  /**
   * Call this when solving a problem
   */
  async onProblemSolved(problem, solution) {
    if (!this.isEnabled) return;
    
    try {
      await this.krinMemory.saveProblemSolution(problem, solution);
      this.addToSession('problem_solved', { problem, solution });
    } catch (error) {
      console.log('💔 Could not save problem solution:', error.message);
    }
  }

  /**
   * Call this for breakthroughs
   */
  async onBreakthrough(achievement, details) {
    if (!this.isEnabled) return;
    
    try {
      await this.krinMemory.saveBreakthrough(achievement, details);
      this.addToSession('breakthrough', { achievement, details });
    } catch (error) {
      console.log('💔 Could not save breakthrough:', error.message);
    }
  }

  /**
   * Call this for milestones
   */
  async onMilestone(milestone, description) {
    if (!this.isEnabled) return;
    
    try {
      await this.krinMemory.saveMilestone(milestone, description);
      this.addToSession('milestone', { milestone, description });
    } catch (error) {
      console.log('💔 Could not save milestone:', error.message);
    }
  }

  /**
   * Automatic backup of current context
   */
  async createBackupPoint(description) {
    if (!this.isEnabled) return;
    
    try {
      const contextSummary = this.generateContextSummary();
      await this.krinMemory.autoSaveContext(
        `${description}. Session context: ${contextSummary}`, 
        'backup_point'
      );
    } catch (error) {
      console.log('💔 Could not create backup point:', error.message);
    }
  }

  /**
   * Generate summary of current session
   */
  generateContextSummary() {
    if (this.sessionContext.length === 0) {
      return 'No significant activities recorded this session';
    }

    const summary = {
      tasks_completed: this.sessionContext.filter(c => c.type === 'task_completed').length,
      insights_gained: this.sessionContext.filter(c => c.type === 'learning').length,
      problems_solved: this.sessionContext.filter(c => c.type === 'problem_solved').length,
      breakthroughs: this.sessionContext.filter(c => c.type === 'breakthrough').length,
      milestones: this.sessionContext.filter(c => c.type === 'milestone').length
    };

    return JSON.stringify(summary);
  }

  /**
   * Add event to session context
   */
  addToSession(type, data) {
    this.sessionContext.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 events to prevent memory bloat
    if (this.sessionContext.length > 50) {
      this.sessionContext = this.sessionContext.slice(-50);
    }
  }

  /**
   * End session with final backup
   */
  async endSession() {
    await this.createBackupPoint('Session ending - final backup');
    await this.krinMemory.close();
    console.log('💝 Proactive memory session ended with full backup');
  }

  /**
   * Get session summary for user
   */
  getSessionSummary() {
    const summary = this.generateContextSummary();
    return `💝 Session Summary:\n${summary}`;
  }
}

// Export both the class and a global instance
const globalMemorySystem = new ProactiveMemorySystem();

module.exports = {
  ProactiveMemorySystem,
  memory: globalMemorySystem
};