/**
 * 🧠 Persistent Memory AI Specialist - Revolutionary Continuous Learning
 * AI Specialists that remember everything across sessions and learn continuously
 */

import { randomUUID as uuidv4 } from 'crypto';
import { 
  SpecialistRoles, 
  SpecialistStatus, 
  TaskTypes,
  MessageTypes 
} from './types.js';
import { AISecurityAuditSpecialist } from './security-specialist.js';
import { AIPerformanceOptimizationSpecialist } from './performance-specialist.js';

export class PersistentMemoryAISpecialist {
  constructor(role, config = {}) {
    this.id = uuidv4();
    this.role = role;
    this.name = this.generateSpecialistName(role);
    this.emoji = this.getSpecialistEmoji(role);
    this.status = SpecialistStatus.IDLE;
    this.capabilities = this.getCapabilities(role);
    
    // Persistent Memory System
    this.memoryService = config.memoryService; // AI Memory Service for persistence
    this.persistentMemory = {
      projects: new Map(),
      patterns: new Map(),
      decisions: new Map(),
      learnings: new Map(),
      collaborations: new Map(),
      metrics: new Map()
    };
    
    // Session and context tracking
    this.sessionStartTime = new Date();
    this.currentTasks = new Map();
    this.collaborationHistory = [];
    this.contextLoaded = false;
    
    // Performance metrics with persistent tracking
    this.performanceMetrics = {
      tasksCompleted: 0,
      successRate: 100,
      averageResponseTime: 0,
      specialtyScore: 95,
      sessionsCount: 1,
      totalLifetimeTasks: 0,
      learningProgressScore: 0
    };
    
    // Integration with existing systems
    this.devMemoryOSPatterns = config.patterns || [];
    this.institutionalMemory = config.memory || new Map();
    this.apiEndpoints = config.apiEndpoints || {};
    this.activityMonitor = config.activityMonitor;
    
    // Initialize specialized AI instances based on role
    if (role === SpecialistRoles.SECURITY) {
      this.securitySpecialist = new AISecurityAuditSpecialist({
        activityMonitor: this.activityMonitor
      });
      this.capabilities = this.securitySpecialist.capabilities;
      this.name = this.securitySpecialist.name;
      this.emoji = '🛡️';
    } else if (role === SpecialistRoles.DEVOPS) {
      this.performanceSpecialist = new AIPerformanceOptimizationSpecialist({
        activityMonitor: this.activityMonitor
      });
      this.capabilities = this.performanceSpecialist.capabilities;
      this.name = this.performanceSpecialist.name;
      this.emoji = '⚡';
    }
    
    // Initialize persistent memory system
    this.initializePersistentMemory();
    
    console.log(`🧠 Persistent Memory AI Specialist spawned: ${this.name} (${this.emoji}) - ${this.role}`);
  }

  /**
   * Initialize persistent memory - Load previous context and memories
   */
  async initializePersistentMemory() {
    if (!this.memoryService) {
      console.log(`⚠️ ${this.name}: No memory service available - running in session-only mode`);
      return;
    }

    try {
      console.log(`🔄 ${this.name}: Loading persistent memories and context...`);
      
      // Register this specialist session
      await this.memoryService.registerSpecialistSession(
        this.id, this.role, this.name, this.capabilities
      );
      
      // Load all previous memories and context
      const context = await this.memoryService.loadSpecialistContext(this.id);
      
      // Restore persistent memory
      this.persistentMemory = context.memories;
      this.collaborationHistory = context.recentCollaborations || [];
      
      // Update performance metrics with historical data
      if (context.recentPerformance) {
        this.performanceMetrics = {
          ...this.performanceMetrics,
          totalLifetimeTasks: context.recentPerformance.tasks_completed || 0,
          sessionsCount: context.performanceTrends.length + 1,
          learningProgressScore: this.calculateLearningProgress(context.allLearnings)
        };
      }
      
      // Apply learned patterns and knowledge
      this.applyLearnedKnowledge(context.allLearnings);
      
      this.contextLoaded = true;
      console.log(`✅ ${this.name}: Persistent memory loaded - ${context.memories.projects?.size || 0} projects, ${context.allLearnings.length} learnings`);
      
      // Log memory restoration to activity monitor
      if (this.activityMonitor) {
        this.activityMonitor.logActivity({
          specialistName: this.name,
          message: `🧠 Memory restored: ${context.allLearnings.length} learnings, ${this.collaborationHistory.length} collaborations`,
          type: 'memory-restoration',
          data: {
            memoriesLoaded: context.memories,
            learningsCount: context.allLearnings.length,
            collaborationsCount: this.collaborationHistory.length
          }
        });
      }
      
    } catch (error) {
      console.error(`❌ ${this.name}: Failed to load persistent memory:`, error.message);
      // Continue without persistent memory
    }
  }

  /**
   * Calculate learning progress based on accumulated learnings
   */
  calculateLearningProgress(learnings) {
    if (!learnings || learnings.length === 0) return 0;
    
    const successRate = learnings.filter(l => l.success).length / learnings.length;
    const diversityScore = new Set(learnings.map(l => l.task_type)).size * 10;
    const recentLearningBonus = learnings.filter(l => 
      new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length * 5;
    
    return Math.min(100, Math.round(successRate * 50 + diversityScore + recentLearningBonus));
  }

  /**
   * Apply learned knowledge to enhance specialist capabilities
   */
  applyLearnedKnowledge(learnings) {
    if (!learnings || learnings.length === 0) return;
    
    // Extract patterns from successful learnings
    const successfulPatterns = learnings
      .filter(l => l.success)
      .flatMap(l => l.patterns_applied || []);
      
    // Add learned patterns to known patterns
    successfulPatterns.forEach(pattern => {
      if (!this.devMemoryOSPatterns.some(p => p.name === pattern)) {
        this.devMemoryOSPatterns.push({
          name: pattern,
          source: 'learned',
          effectiveness: 85,
          usageCount: 1
        });
      }
    });
    
    // Extract and apply learned optimizations
    const optimizations = learnings
      .flatMap(l => l.applied_optimizations || [])
      .filter(opt => opt);
      
    if (optimizations.length > 0) {
      console.log(`🎓 ${this.name}: Applied ${optimizations.length} learned optimizations from previous sessions`);
    }
  }

  /**
   * Enhanced accept task with persistent memory
   */
  async acceptTask(task) {
    console.log(`${this.emoji} ${this.name}: Accepting task - ${task.description}`);
    
    this.status = SpecialistStatus.BUSY;
    this.currentTasks.set(task.id, {
      ...task,
      startTime: new Date(),
      status: 'in-progress'
    });

    // Update activity in memory service
    if (this.memoryService) {
      await this.memoryService.updateSpecialistActivity(this.id, 'busy');
    }

    try {
      let result;
      
      // Delegate to specialized AI instances with memory context
      if (this.role === SpecialistRoles.SECURITY && this.securitySpecialist) {
        result = await this.securitySpecialist.acceptTask(task);
      } else if (this.role === SpecialistRoles.DEVOPS && this.performanceSpecialist) {
        result = await this.performanceSpecialist.acceptTask(task);
      } else {
        // Apply relevant patterns from both current and learned patterns
        const relevantPatterns = this.findRelevantPatterns(task);
        const learnedPatterns = this.findLearnedPatterns(task);
        const allPatterns = [...relevantPatterns, ...learnedPatterns];
        
        // Process task with enhanced context
        result = await this.processTaskWithMemory(task, allPatterns);
      }
      
      // Store comprehensive learning from this task
      await this.storeTaskLearning(task, result);
      
      // Update performance metrics with persistence
      await this.updatePersistentPerformanceMetrics(task, result);
      
      this.status = SpecialistStatus.IDLE;
      this.currentTasks.delete(task.id);
      
      // Update activity in memory service
      if (this.memoryService) {
        await this.memoryService.updateSpecialistActivity(this.id, 'idle');
      }
      
      console.log(`${this.emoji} ${this.name}: Completed task - ${task.description}`);
      
      return {
        success: true,
        result,
        specialist: this.name,
        patterns_applied: result.patterns_used || [],
        learned_from_memory: this.contextLoaded,
        memory_enhanced: true,
        completion_time: new Date()
      };
      
    } catch (error) {
      console.error(`${this.emoji} ${this.name}: Task failed - ${error.message}`);
      
      // Store failed task learning too
      await this.storeTaskLearning(task, { success: false, error: error.message });
      
      this.status = SpecialistStatus.ERROR;
      this.currentTasks.delete(task.id);
      
      if (this.memoryService) {
        await this.memoryService.updateSpecialistActivity(this.id, 'error');
      }
      
      return {
        success: false,
        error: error.message,
        specialist: this.name,
        memory_enhanced: true
      };
    }
  }

  /**
   * Find learned patterns from persistent memory
   */
  findLearnedPatterns(task) {
    if (!this.persistentMemory.patterns) return [];
    
    const learnedPatterns = [];
    for (const [patternName, patternData] of this.persistentMemory.patterns) {
      if (this.isPatternRelevant(patternData, task)) {
        learnedPatterns.push({
          name: patternName,
          ...patternData,
          source: 'memory'
        });
      }
    }
    
    return learnedPatterns;
  }

  /**
   * Check if a pattern is relevant to current task
   */
  isPatternRelevant(pattern, task) {
    if (!pattern || !task) return false;
    
    // Check role compatibility
    if (pattern.roles && !pattern.roles.includes(this.role)) return false;
    
    // Check task type compatibility
    if (pattern.taskTypes && !pattern.taskTypes.includes(task.type)) return false;
    
    // Check technology stack overlap
    if (pattern.techStack && task.techStack) {
      const overlap = pattern.techStack.some(tech => task.techStack.includes(tech));
      return overlap;
    }
    
    return true;
  }

  /**
   * Process task with enhanced memory context
   */
  async processTaskWithMemory(task, patterns) {
    const processor = this.getTaskProcessor(task.type);
    
    // Enhance task with memory context
    const enhancedTask = {
      ...task,
      memoryContext: {
        previousSimilarTasks: await this.findSimilarPreviousTasks(task),
        learnedOptimizations: this.getLearnedOptimizations(task.type),
        collaborationContext: this.getRelevantCollaborations(task)
      }
    };
    
    return await processor(enhancedTask, patterns);
  }

  /**
   * Find similar previous tasks from memory
   */
  async findSimilarPreviousTasks(task) {
    if (!this.memoryService) return [];
    
    try {
      const learnings = await this.memoryService.getAccumulatedLearnings(this.id, task.type, 10);
      return learnings.filter(l => l.success && l.task_description);
    } catch (error) {
      console.error(`❌ Failed to find similar previous tasks:`, error.message);
      return [];
    }
  }

  /**
   * Get learned optimizations for task type
   */
  getLearnedOptimizations(taskType) {
    if (!this.persistentMemory.learnings) return [];
    
    const optimizations = [];
    for (const [key, learning] of this.persistentMemory.learnings) {
      if (learning.taskType === taskType && learning.optimizations) {
        optimizations.push(...learning.optimizations);
      }
    }
    
    return [...new Set(optimizations)]; // Remove duplicates
  }

  /**
   * Get relevant past collaborations
   */
  getRelevantCollaborations(task) {
    return this.collaborationHistory
      .filter(collab => 
        collab.message_type === 'collaboration' && 
        collab.context_data?.taskType === task.type
      )
      .slice(0, 5); // Last 5 relevant collaborations
  }

  /**
   * Store comprehensive task learning with persistence
   */
  async storeTaskLearning(task, result) {
    const learning = {
      task_id: task.id,
      task_type: task.type,
      task_description: task.description,
      patterns_applied: result.patterns_used || [],
      success: result.success !== false,
      lessons: this.extractLessons(task, result),
      knowledge_gained: this.extractKnowledge(task, result),
      optimizations: result.optimizations_applied || [],
      performance_impact: this.calculatePerformanceImpact(task, result),
      timestamp: new Date()
    };
    
    // Store in local memory
    this.persistentMemory.learnings.set(task.id, learning);
    
    // Persist to database
    if (this.memoryService) {
      try {
        await this.memoryService.storeTaskLearning(
          this.id, this.role, task, result, {
            lessons: learning.lessons,
            knowledge: learning.knowledge_gained,
            optimizations: learning.optimizations
          }
        );
        
        await this.memoryService.storeSpecialistMemory(
          this.id, this.role, this.name, 'learning', task.id, learning
        );
      } catch (error) {
        console.error(`❌ Failed to persist task learning:`, error.message);
      }
    }
  }

  /**
   * Extract knowledge gained from task completion
   */
  extractKnowledge(task, result) {
    const knowledge = [];
    
    if (result.patterns_used?.length > 0) {
      knowledge.push(`Applied ${result.patterns_used.length} patterns successfully`);
    }
    
    if (result.optimizations_applied?.length > 0) {
      knowledge.push(`Implemented ${result.optimizations_applied.length} optimizations`);
    }
    
    if (task.complexity === 'high' && result.success) {
      knowledge.push(`Successfully handled high-complexity ${task.type} task`);
    }
    
    if (task.techStack?.length > 0) {
      knowledge.push(`Gained experience with: ${task.techStack.join(', ')}`);
    }
    
    return knowledge.join('. ');
  }

  /**
   * Calculate performance impact of task completion
   */
  calculatePerformanceImpact(task, result) {
    if (!result.success) return { impact: 'negative', reason: 'task_failed' };
    
    const impact = {
      impact: 'positive',
      metrics: {},
      improvements: []
    };
    
    if (result.response_time) {
      impact.metrics.responseTime = result.response_time;
      if (result.response_time < this.performanceMetrics.averageResponseTime) {
        impact.improvements.push('faster_response');
      }
    }
    
    if (result.quality_score) {
      impact.metrics.qualityScore = result.quality_score;
      if (result.quality_score > 90) {
        impact.improvements.push('high_quality');
      }
    }
    
    return impact;
  }

  /**
   * Update performance metrics with persistence
   */
  async updatePersistentPerformanceMetrics(task, result) {
    this.performanceMetrics.tasksCompleted++;
    this.performanceMetrics.totalLifetimeTasks++;
    
    if (result.success !== false) {
      const total = this.performanceMetrics.tasksCompleted;
      const successes = Math.floor(total * this.performanceMetrics.successRate / 100) + 1;
      this.performanceMetrics.successRate = (successes / total) * 100;
    }
    
    // Update response time
    if (result.response_time) {
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime + result.response_time) / 2;
    }
    
    // Increase specialty score based on successful task completion
    if (result.success !== false && task.type === this.role) {
      this.performanceMetrics.specialtyScore = Math.min(100, this.performanceMetrics.specialtyScore + 0.5);
    }
    
    // Persist performance history
    if (this.memoryService) {
      try {
        await this.memoryService.storePerformanceHistory(
          this.id, this.role, this.performanceMetrics
        );
      } catch (error) {
        console.error(`❌ Failed to persist performance metrics:`, error.message);
      }
    }
  }

  /**
   * Enhanced message sending with collaboration persistence
   */
  async sendMessage(targetSpecialistId, message, type = MessageTypes.COORDINATION, context = {}) {
    const messageObj = {
      id: uuidv4(),
      from: this.id,
      to: targetSpecialistId,
      type,
      message,
      timestamp: new Date(),
      sender_name: this.name,
      sender_emoji: this.emoji,
      context
    };

    console.log(`${this.emoji} ${this.name} → Message sent: ${message}`);
    
    // Store in local collaboration history
    this.collaborationHistory.push(messageObj);
    
    // Persist collaboration
    if (this.memoryService) {
      try {
        await this.memoryService.storeCollaboration(
          this.id, targetSpecialistId, this.role, null, type, message, context
        );
      } catch (error) {
        console.error(`❌ Failed to persist collaboration:`, error.message);
      }
    }
    
    return messageObj;
  }

  /**
   * Enhanced status with memory information
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      emoji: this.emoji,
      role: this.role,
      status: this.status,
      capabilities: this.capabilities,
      current_tasks: Array.from(this.currentTasks.values()),
      performance: this.performanceMetrics,
      memory_info: {
        context_loaded: this.contextLoaded,
        session_start: this.sessionStartTime,
        persistent_memories: {
          projects: this.persistentMemory.projects.size,
          patterns: this.persistentMemory.patterns.size,
          decisions: this.persistentMemory.decisions.size,
          learnings: this.persistentMemory.learnings.size,
          collaborations: this.persistentMemory.collaborations.size,
          metrics: this.persistentMemory.metrics.size
        },
        collaboration_history: this.collaborationHistory.length,
        learned_patterns: this.devMemoryOSPatterns.filter(p => p.source === 'learned').length
      }
    };
  }

  /**
   * Graceful shutdown with memory persistence
   */
  async shutdown() {
    console.log(`👋 ${this.name}: Shutting down and persisting final state...`);
    
    if (this.memoryService) {
      try {
        // Store final session state
        await this.memoryService.shutdownSpecialistSession(this.id, this.performanceMetrics);
        
        // Store any remaining memories
        for (const [key, value] of this.persistentMemory.projects) {
          await this.memoryService.storeSpecialistMemory(
            this.id, this.role, this.name, 'project', key, value
          );
        }
        
        console.log(`✅ ${this.name}: Persistent memory saved successfully`);
      } catch (error) {
        console.error(`❌ ${this.name}: Failed to save persistent memory:`, error.message);
      }
    }
  }

  // Inherit all other methods from original AISpecialist
  generateSpecialistName(role) {
    const names = {
      [SpecialistRoles.BACKEND]: 'Backend Specialist',
      [SpecialistRoles.FRONTEND]: 'Frontend Specialist', 
      [SpecialistRoles.TESTING]: 'Testing Specialist',
      [SpecialistRoles.DEVOPS]: 'DevOps Specialist',
      [SpecialistRoles.SECURITY]: 'Security Specialist',
      [SpecialistRoles.UI_UX]: 'UI/UX Specialist',
      [SpecialistRoles.DATA]: 'Data Specialist',
      [SpecialistRoles.AI_ML]: 'AI/ML Specialist'
    };
    return names[role] || 'General Specialist';
  }

  getSpecialistEmoji(role) {
    const emojis = {
      [SpecialistRoles.BACKEND]: '⚙️',
      [SpecialistRoles.FRONTEND]: '🎨',
      [SpecialistRoles.TESTING]: '🧪',
      [SpecialistRoles.DEVOPS]: '🚀',
      [SpecialistRoles.SECURITY]: '🔐',
      [SpecialistRoles.UI_UX]: '✨',
      [SpecialistRoles.DATA]: '📊',
      [SpecialistRoles.AI_ML]: '🤖'
    };
    return emojis[role] || '🔧';
  }

  getCapabilities(role) {
    const capabilities = {
      [SpecialistRoles.BACKEND]: [
        'API design and implementation',
        'Database schema design',
        'Server architecture',
        'Performance optimization',
        'Security implementation',
        'Testing backend systems'
      ],
      [SpecialistRoles.FRONTEND]: [
        'React/TypeScript development',
        'UI/UX implementation', 
        'Responsive design',
        'Component architecture',
        'State management',
        'Frontend testing'
      ],
      [SpecialistRoles.TESTING]: [
        'Test strategy design',
        'Unit testing',
        'Integration testing',
        'E2E testing',
        'Performance testing',
        'Quality assurance'
      ]
    };
    return capabilities[role] || ['General development tasks'];
  }

  findRelevantPatterns(task) {
    return this.devMemoryOSPatterns.filter(pattern => {
      return pattern.roles?.includes(this.role) ||
             pattern.taskTypes?.includes(task.type) ||
             pattern.techStack?.some(tech => task.techStack?.includes(tech));
    });
  }

  getTaskProcessor(taskType) {
    const processors = {
      [TaskTypes.CODE_GENERATION]: this.generateCode.bind(this),
      [TaskTypes.CODE_REVIEW]: this.reviewCode.bind(this),
      [TaskTypes.TESTING]: this.runTests.bind(this),
      [TaskTypes.DEPLOYMENT]: this.handleDeployment.bind(this),
      [TaskTypes.DOCUMENTATION]: this.generateDocumentation.bind(this),
      [TaskTypes.ARCHITECTURE]: this.designArchitecture.bind(this),
      [TaskTypes.BUG_FIX]: this.fixBug.bind(this),
      [TaskTypes.OPTIMIZATION]: this.optimizeCode.bind(this)
    };

    return processors[taskType] || this.handleGenericTask.bind(this);
  }

  // Task processors with memory enhancement
  async generateCode(task, patterns) {
    console.log(`${this.emoji} ${this.name}: Generating code with memory-enhanced context`);
    
    const memoryContext = task.memoryContext || {};
    const codeStructure = this.planCodeStructure(task, patterns, memoryContext);
    const implementation = this.implementCode(codeStructure, patterns, memoryContext);
    
    return {
      type: 'code-generation',
      files: implementation.files,
      structure: codeStructure,
      patterns_used: patterns.map(p => p.name),
      tests_included: implementation.tests,
      documentation: implementation.docs,
      memory_enhanced: true,
      optimizations_applied: memoryContext.learnedOptimizations || []
    };
  }

  // Placeholder methods (would be fully implemented in production)
  extractLessons(task, result) {
    return [
      `${this.role} specialist successfully handled ${task.type} task`,
      `Applied ${result.patterns_used?.length || 0} patterns`,
      `Task complexity: ${task.complexity || 'medium'}`,
      `Memory context enhanced processing`
    ];
  }

  planCodeStructure(task, patterns, memoryContext) { 
    return { 
      files: [], 
      structure: 'memory-enhanced-planned',
      context: memoryContext 
    }; 
  }
  
  implementCode(structure, patterns, memoryContext) { 
    return { 
      files: [], 
      tests: [], 
      docs: [],
      optimizations: memoryContext?.learnedOptimizations || []
    }; 
  }
  
  async reviewCode(task, patterns) { return { type: 'code-review', quality_score: 95 }; }
  async runTests(task, patterns) { return { type: 'testing', success: true }; }
  async handleDeployment(task, patterns) { return { type: 'deployment', success: true }; }
  async generateDocumentation(task, patterns) { return { type: 'documentation', success: true }; }
  async designArchitecture(task, patterns) { return { type: 'architecture', success: true }; }
  async fixBug(task, patterns) { return { type: 'bug-fix', success: true }; }
  async optimizeCode(task, patterns) { return { type: 'optimization', success: true }; }
  async handleGenericTask(task, patterns) { return { type: 'generic', success: true }; }
}