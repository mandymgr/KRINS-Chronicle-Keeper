/**
 * 🧠 KRINS-Chronicle-Keeper AI Context Provider
 * Institutional Memory & Knowledge System - AI Integration
 */

export interface ADRContext {
  number: string;
  title: string;
  status: 'Proposed' | 'Accepted' | 'Rejected' | 'Superseded';
  context: string;
  decision: string;
  consequences: string;
  evidence?: string[];
  relatedADRs?: string[];
  lastModified: Date;
  filePath: string;
}

export interface PatternContext {
  name: string;
  language: 'typescript' | 'python' | 'java' | 'architecture';
  category: string;
  description: string;
  code?: string;
  usage: string;
  antiPatterns?: string[];
  relatedPatterns?: string[];
  lastUpdated: Date;
  filePath: string;
}

export interface RunbookContext {
  title: string;
  category: 'incident-response' | 'maintenance' | 'troubleshooting';
  summary: string;
  steps: string[];
  prerequisites?: string[];
  troubleshooting?: string[];
  relatedRunbooks?: string[];
  lastReviewed: Date;
  filePath: string;
}

export interface KnowledgeContext {
  adrs: ADRContext[];
  patterns: PatternContext[];
  runbooks: RunbookContext[];
  metadata: {
    totalDecisions: number;
    recentDecisions: ADRContext[];
    commonPatterns: PatternContext[];
    criticalRunbooks: RunbookContext[];
    lastSync: Date;
  };
}

/**
 * Main Context Provider for AI Systems
 * Aggregates institutional memory for context-aware development
 */
export class AIContextProvider {
  private adrCache: Map<string, ADRContext> = new Map();
  private patternCache: Map<string, PatternContext> = new Map();
  private runbookCache: Map<string, RunbookContext> = new Map();
  private lastCacheUpdate: Date = new Date(0);
  
  constructor(
    private readonly docsPath: string = './docs',
    private readonly cacheTimeout: number = 300000 // 5 minutes
  ) {}

  /**
   * Get complete knowledge context for AI systems
   */
  async getKnowledgeContext(): Promise<KnowledgeContext> {
    await this.refreshCache();
    
    const adrs = Array.from(this.adrCache.values());
    const patterns = Array.from(this.patternCache.values());
    const runbooks = Array.from(this.runbookCache.values());
    
    return {
      adrs,
      patterns,
      runbooks,
      metadata: {
        totalDecisions: adrs.length,
        recentDecisions: adrs
          .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
          .slice(0, 5),
        commonPatterns: patterns
          .filter(p => p.category === 'common')
          .slice(0, 10),
        criticalRunbooks: runbooks
          .filter(r => r.category === 'incident-response'),
        lastSync: this.lastCacheUpdate
      }
    };
  }

  /**
   * Get context relevant to a specific development task
   */
  async getTaskRelevantContext(
    task: string,
    language?: string,
    component?: string
  ): Promise<Partial<KnowledgeContext>> {
    const knowledge = await this.getKnowledgeContext();
    
    // Filter relevant ADRs
    const relevantADRs = knowledge.adrs.filter(adr => 
      this.isRelevantToTask(adr.title + ' ' + adr.context + ' ' + adr.decision, task)
    );
    
    // Filter relevant patterns
    const relevantPatterns = knowledge.patterns.filter(pattern => {
      const languageMatch = !language || pattern.language === language || pattern.language === 'architecture';
      const taskMatch = this.isRelevantToTask(pattern.name + ' ' + pattern.description, task);
      return languageMatch && taskMatch;
    });
    
    // Filter relevant runbooks
    const relevantRunbooks = knowledge.runbooks.filter(runbook =>
      this.isRelevantToTask(runbook.title + ' ' + runbook.summary, task)
    );
    
    return {
      adrs: relevantADRs,
      patterns: relevantPatterns,
      runbooks: relevantRunbooks,
      metadata: {
        ...knowledge.metadata,
        totalDecisions: relevantADRs.length
      }
    };
  }

  /**
   * Simple relevance scoring using keyword matching
   * In production, this could use ML-based similarity scoring
   */
  private isRelevantToTask(content: string, task: string): boolean {
    const contentLower = content.toLowerCase();
    const taskLower = task.toLowerCase();
    
    // Extract keywords from task
    const taskWords = taskLower
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
    
    // Count matches
    const matches = taskWords.filter(word => contentLower.includes(word)).length;
    
    // Return true if at least 20% of task keywords match
    return matches >= Math.max(1, Math.floor(taskWords.length * 0.2));
  }

  /**
   * Refresh internal caches if needed
   */
  private async refreshCache(): Promise<void> {
    const now = new Date();
    if (now.getTime() - this.lastCacheUpdate.getTime() < this.cacheTimeout) {
      return; // Cache is still fresh
    }

    // In a real implementation, these would read from the filesystem
    // For now, we'll simulate with placeholder data
    this.adrCache.clear();
    this.patternCache.clear();
    this.runbookCache.clear();
    
    this.lastCacheUpdate = now;
  }

  /**
   * Generate AI prompt with institutional context
   */
  async generateContextualPrompt(
    task: string,
    options: {
      includeADRs?: boolean;
      includePatterns?: boolean;
      includeRunbooks?: boolean;
      language?: string;
      maxContextLength?: number;
    } = {}
  ): Promise<string> {
    const {
      includeADRs = true,
      includePatterns = true,
      includeRunbooks = false,
      language,
      maxContextLength = 4000
    } = options;

    const context = await this.getTaskRelevantContext(task, language);
    
    let prompt = `Task: ${task}\n\n`;
    let remainingLength = maxContextLength - prompt.length;

    if (includeADRs && context.adrs && context.adrs.length > 0) {
      prompt += "📋 Relevant Architectural Decisions:\n";
      for (const adr of context.adrs.slice(0, 3)) {
        const adrText = `- ADR-${adr.number}: ${adr.title}\n  Decision: ${adr.decision.substring(0, 200)}...\n`;
        if (adrText.length < remainingLength) {
          prompt += adrText;
          remainingLength -= adrText.length;
        }
      }
      prompt += "\n";
    }

    if (includePatterns && context.patterns && context.patterns.length > 0) {
      prompt += "🎨 Relevant Patterns:\n";
      for (const pattern of context.patterns.slice(0, 3)) {
        const patternText = `- ${pattern.name} (${pattern.language}): ${pattern.description.substring(0, 150)}...\n`;
        if (patternText.length < remainingLength) {
          prompt += patternText;
          remainingLength -= patternText.length;
        }
      }
      prompt += "\n";
    }

    if (includeRunbooks && context.runbooks && context.runbooks.length > 0) {
      prompt += "📚 Relevant Procedures:\n";
      for (const runbook of context.runbooks.slice(0, 2)) {
        const runbookText = `- ${runbook.title}: ${runbook.summary.substring(0, 100)}...\n`;
        if (runbookText.length < remainingLength) {
          prompt += runbookText;
          remainingLength -= runbookText.length;
        }
      }
      prompt += "\n";
    }

    prompt += "Please consider this institutional context when working on the task.";
    
    return prompt;
  }
}

/**
 * Singleton instance for global access
 */
export const contextProvider = new AIContextProvider();

/**
 * Convenience function for quick context generation
 */
export async function getContextForTask(
  task: string,
  language?: string
): Promise<string> {
  return contextProvider.generateContextualPrompt(task, { language });
}