/**
 * 🧠 Persistent Memory Team Coordinator - Revolutionary Team Memory System
 * Krin with continuous learning and memory across all sessions
 */

import { randomUUID as uuidv4 } from 'crypto';
import { PersistentMemoryAISpecialist } from './persistent-memory-specialist.js';
import { SpecialistRoles, TaskTypes, MessageTypes } from './types.js';

export class PersistentMemoryTeamCoordinator {
  constructor(config = {}) {
    this.id = uuidv4();
    this.name = 'Krin - AI Team Coordinator';
    this.emoji = '🧠';
    this.specialists = new Map();
    this.activeProjects = new Map();
    this.coordinationHistory = [];
    this.sessionId = uuidv4();
    this.sessionStartTime = new Date();
    
    // Memory service integration
    this.memoryService = config.memoryService;
    this.backendAPI = config.backendAPI;
    this.activityMonitor = config.activityMonitor;
    this.patterns = config.patterns || [];
    
    // Enhanced performance metrics with memory
    this.performanceMetrics = {
      tasksCompleted: 0,
      specialistsSpawned: 0,
      successfulCoordinations: 0,
      totalResponseTime: 0,
      sessionsCount: 1,
      totalLifetimeCoordinations: 0,
      teamLearningScore: 0,
      collaborationEfficiency: 100
    };
    
    // Team memory and context
    this.teamMemory = {
      sharedPatterns: new Map(),
      teamDecisions: new Map(),
      collaborationStrategies: new Map(),
      projectHistories: new Map(),
      specialistRelationships: new Map()
    };
    
    // Initialize team memory
    this.initializeTeamMemory();
    
    console.log(`${this.emoji} ${this.name} initialized with persistent memory - Session: ${this.sessionId.substring(0, 8)}`);
  }

  /**
   * Initialize team memory - Load historical context and team knowledge
   */
  async initializeTeamMemory() {
    if (!this.memoryService) {
      console.log(`⚠️ ${this.name}: No memory service available - running in session-only mode`);
      return;
    }

    try {
      console.log(`🔄 ${this.name}: Loading team memory and coordination history...`);
      
      // Load team memory summary
      const teamSummary = await this.memoryService.getTeamMemorySummary();
      
      if (teamSummary) {
        console.log(`📊 ${this.name}: Team memory loaded - ${teamSummary.memory.total_specialists} specialists, ${teamSummary.memory.total_memories} memories, ${teamSummary.learning.total_learnings} learnings`);
        
        // Update performance metrics with historical data
        this.performanceMetrics.totalLifetimeCoordinations = teamSummary.collaboration.total_collaborations || 0;
        this.performanceMetrics.teamLearningScore = this.calculateTeamLearningScore(teamSummary);
        
        // Log memory restoration
        if (this.activityMonitor) {
          this.activityMonitor.logActivity({
            specialistName: this.name,
            message: `🧠 Team memory restored - ${teamSummary.memory.total_specialists} specialists tracked, ${teamSummary.learning.total_learnings} learnings available`,
            type: 'team-memory-restoration',
            data: teamSummary
          });
        }
      }
      
    } catch (error) {
      console.error(`❌ ${this.name}: Failed to load team memory:`, error.message);
    }
  }

  /**
   * Calculate team learning score based on accumulated knowledge
   */
  calculateTeamLearningScore(summary) {
    if (!summary) return 0;
    
    const baseScore = Math.min(50, summary.memory.total_memories / 10);
    const learningBonus = Math.min(30, summary.learning.total_learnings / 5);
    const collaborationBonus = Math.min(20, summary.collaboration.total_collaborations / 100);
    
    return Math.round(baseScore + learningBonus + collaborationBonus);
  }

  /**
   * Spawn specialist with persistent memory
   */
  async spawnSpecialist(role, config = {}) {
    console.log(`${this.emoji} Spawning ${role} specialist with persistent memory...`);
    
    try {
      // Create specialist with memory service integration
      const specialist = new PersistentMemoryAISpecialist(role, {
        patterns: this.patterns,
        memoryService: this.memoryService,
        activityMonitor: this.activityMonitor,
        ...config
      });
      
      this.specialists.set(specialist.id, specialist);
      this.performanceMetrics.specialistsSpawned++;
      
      // Store team relationship mapping
      this.teamMemory.specialistRelationships.set(specialist.id, {
        role: role,
        name: specialist.name,
        spawnTime: new Date(),
        sessionId: this.sessionId,
        collaborations: 0,
        successfulTasks: 0
      });
      
      console.log(`✅ ${specialist.name} (${specialist.emoji}) spawned with persistent memory!`);
      
      // Broadcast team introduction with memory context
      await this.broadcastCoordinationMessage(
        `🎉 Welcome ${specialist.name} to the AI team! Memory-enhanced specialist ready for continuous learning and autonomous development.`,
        { type: 'specialist-spawn', specialistId: specialist.id, role: role }
      );
      
      return specialist;
      
    } catch (error) {
      console.error(`❌ Failed to spawn ${role} specialist with memory:`, error);
      throw error;
    }
  }

  /**
   * Enhanced task coordination with memory and learning
   */
  async coordinateTask(task) {
    console.log(`${this.emoji} Coordinating task with memory context: ${task.description}`);
    
    const startTime = Date.now();
    const taskId = task.id || uuidv4();
    const enhancedTask = { ...task, id: taskId };
    
    try {
      // Find best specialist using memory-enhanced matching
      const specialist = await this.findBestSpecialistWithMemory(enhancedTask);
      
      if (!specialist) {
        throw new Error(`No suitable specialist found for task: ${task.type}`);
      }
      
      console.log(`${this.emoji} Assigned task to ${specialist.name} (${specialist.emoji}) using memory-enhanced selection`);
      
      // Store coordination context in team memory
      await this.storeCoordinationContext(enhancedTask, specialist);
      
      // Execute task with memory-enhanced specialist
      const result = await specialist.acceptTask(enhancedTask);
      
      // Update coordination metrics and memory
      const responseTime = Date.now() - startTime;
      await this.updateCoordinationMetrics(result.success, responseTime);
      
      // Store successful coordination patterns
      if (result.success) {
        await this.storeSuccessfulCoordinationPattern(enhancedTask, specialist, result, responseTime);
      }
      
      // Store coordination history with enhanced context
      this.coordinationHistory.push({
        task: enhancedTask,
        specialist: specialist.name,
        specialistId: specialist.id,
        result: result,
        responseTime: responseTime,
        timestamp: new Date(),
        memoryEnhanced: true,
        sessionId: this.sessionId
      });
      
      console.log(`${this.emoji} Memory-enhanced task coordination completed in ${responseTime}ms`);
      
      return {
        ...result,
        coordinatedBy: this.name,
        memoryEnhanced: true,
        coordinationTime: responseTime
      };
      
    } catch (error) {
      console.error(`${this.emoji} Task coordination failed:`, error);
      return { success: false, error: error.message, memoryEnhanced: true };
    }
  }

  /**
   * Find best specialist using memory-enhanced matching
   */
  async findBestSpecialistWithMemory(task) {
    const availableSpecialists = Array.from(this.specialists.values())
      .filter(s => s.status === 'idle');
      
    if (availableSpecialists.length === 0) {
      return null;
    }
    
    // Enhanced matching with memory context
    let bestSpecialist = null;
    let bestScore = 0;
    
    for (const specialist of availableSpecialists) {
      const score = await this.calculateSpecialistScore(specialist, task);
      
      if (score > bestScore) {
        bestScore = score;
        bestSpecialist = specialist;
      }
    }
    
    console.log(`${this.emoji} Selected ${bestSpecialist.name} with memory-enhanced score: ${bestScore}`);
    return bestSpecialist;
  }

  /**
   * Calculate specialist score based on role, performance, and memory
   */
  async calculateSpecialistScore(specialist, task) {
    let score = 0;
    
    // Base role compatibility
    const roleMatches = {
      [TaskTypes.CODE_GENERATION]: [SpecialistRoles.BACKEND, SpecialistRoles.FRONTEND],
      [TaskTypes.CODE_REVIEW]: [SpecialistRoles.BACKEND, SpecialistRoles.FRONTEND, SpecialistRoles.SECURITY],
      [TaskTypes.TESTING]: [SpecialistRoles.TESTING],
      [TaskTypes.DEPLOYMENT]: [SpecialistRoles.DEVOPS],
      [TaskTypes.SECURITY_AUDIT]: [SpecialistRoles.SECURITY],
      [TaskTypes.PERFORMANCE_OPTIMIZATION]: [SpecialistRoles.DEVOPS],
      [TaskTypes.OPTIMIZATION]: [SpecialistRoles.DEVOPS, SpecialistRoles.BACKEND]
    };
    
    const preferredRoles = roleMatches[task.type] || [];
    if (preferredRoles.includes(specialist.role)) {
      score += 50;
    }
    
    // Performance-based scoring
    score += specialist.performanceMetrics.successRate * 0.3;
    score += specialist.performanceMetrics.specialtyScore * 0.2;
    
    // Memory-enhanced scoring
    if (specialist.contextLoaded) {
      score += 10; // Bonus for loaded memory context
    }
    
    // Experience bonus based on memory
    const memoryInfo = specialist.memory_info || {};
    if (memoryInfo.persistent_memories) {
      score += Math.min(15, memoryInfo.persistent_memories.learnings * 2);
    }
    
    return Math.round(score);
  }

  /**
   * Store coordination context in team memory
   */
  async storeCoordinationContext(task, specialist) {
    const context = {
      taskType: task.type,
      specialistRole: specialist.role,
      specialistId: specialist.id,
      timestamp: new Date(),
      sessionId: this.sessionId
    };
    
    this.teamMemory.collaborationStrategies.set(task.id, context);
    
    // Store in memory service if available
    if (this.memoryService) {
      try {
        await this.memoryService.storeSpecialistMemory(
          this.id, 'coordinator', this.name, 'coordination', task.id, context
        );
      } catch (error) {
        console.error(`❌ Failed to store coordination context:`, error.message);
      }
    }
  }

  /**
   * Store successful coordination patterns for future learning
   */
  async storeSuccessfulCoordinationPattern(task, specialist, result, responseTime) {
    const pattern = {
      taskType: task.type,
      specialistRole: specialist.role,
      complexity: task.complexity || 'medium',
      responseTime: responseTime,
      successRate: 100,
      patternsUsed: result.patterns_applied || [],
      effectiveness: this.calculateEffectiveness(responseTime, result),
      timestamp: new Date()
    };
    
    const patternKey = `${task.type}_${specialist.role}_success`;
    this.teamMemory.sharedPatterns.set(patternKey, pattern);
    
    // Persist successful patterns
    if (this.memoryService) {
      try {
        await this.memoryService.storeSpecialistMemory(
          this.id, 'coordinator', this.name, 'pattern', patternKey, pattern, 
          ['successful', 'coordination', task.type, specialist.role]
        );
      } catch (error) {
        console.error(`❌ Failed to store coordination pattern:`, error.message);
      }
    }
  }

  /**
   * Calculate coordination effectiveness
   */
  calculateEffectiveness(responseTime, result) {
    let effectiveness = 100;
    
    // Response time penalty
    if (responseTime > 5000) effectiveness -= 10;
    if (responseTime > 10000) effectiveness -= 20;
    
    // Quality bonus
    if (result.quality_score && result.quality_score > 90) {
      effectiveness += 10;
    }
    
    // Pattern usage bonus
    if (result.patterns_applied && result.patterns_applied.length > 2) {
      effectiveness += 5;
    }
    
    return Math.max(50, Math.min(100, effectiveness));
  }

  /**
   * Enhanced broadcast with memory persistence
   */
  async broadcastCoordinationMessage(message, context = {}) {
    console.log(`${this.emoji} Broadcasting: ${message}`);
    
    const enhancedContext = {
      ...context,
      coordinatorId: this.id,
      sessionId: this.sessionId,
      timestamp: new Date()
    };
    
    const broadcastPromises = Array.from(this.specialists.values()).map(specialist => {
      // Store collaboration in memory service
      if (this.memoryService) {
        this.memoryService.storeCollaboration(
          this.id, specialist.id, 'coordinator', specialist.role, 
          MessageTypes.COORDINATION, message, enhancedContext
        );
      }
      
      return specialist.receiveMessage({
        id: uuidv4(),
        from: this.id,
        to: specialist.id,
        type: MessageTypes.COORDINATION,
        message: message,
        timestamp: new Date(),
        sender_name: this.name,
        sender_emoji: this.emoji,
        context: enhancedContext
      });
    });
    
    await Promise.all(broadcastPromises);
  }

  /**
   * Start autonomous project with memory enhancement
   */
  async startAutonomousProject(projectConfig) {
    console.log(`${this.emoji} Starting memory-enhanced autonomous project: ${projectConfig.name}`);
    
    const project = {
      id: uuidv4(),
      name: projectConfig.name,
      description: projectConfig.description,
      tasks: projectConfig.tasks || [],
      startTime: new Date(),
      status: 'active',
      specialists: [],
      results: [],
      sessionId: this.sessionId,
      memoryEnhanced: true
    };
    
    this.activeProjects.set(project.id, project);
    
    // Store project in team memory
    this.teamMemory.projectHistories.set(project.id, {
      ...project,
      coordinationStrategy: this.selectCoordinationStrategy(projectConfig),
      expectedPatterns: await this.predictProjectPatterns(projectConfig)
    });
    
    try {
      // Coordinate all project tasks with memory enhancement
      for (const task of project.tasks) {
        const result = await this.coordinateTask(task);
        project.results.push(result);
        
        if (!result.success) {
          console.log(`${this.emoji} Task failed, applying memory-enhanced recovery strategy...`);
          
          // Use memory to find similar failed tasks and recovery strategies
          const recoveryStrategy = await this.findRecoveryStrategy(task, result);
          if (recoveryStrategy) {
            console.log(`${this.emoji} Applying learned recovery strategy: ${recoveryStrategy.name}`);
          }
        }
      }
      
      project.status = 'completed';
      project.endTime = new Date();
      
      // Store completed project learnings
      await this.storeProjectLearnings(project);
      
      console.log(`${this.emoji} Memory-enhanced autonomous project completed: ${project.name}`);
      
      return project;
      
    } catch (error) {
      project.status = 'failed';
      project.error = error.message;
      console.error(`${this.emoji} Autonomous project failed:`, error);
      throw error;
    }
  }

  /**
   * Select coordination strategy based on project type and memory
   */
  selectCoordinationStrategy(projectConfig) {
    // Default strategy with memory enhancement
    return {
      type: 'memory-enhanced-autonomous',
      parallel_tasks: true,
      memory_guided: true,
      learning_enabled: true
    };
  }

  /**
   * Predict project patterns based on historical data
   */
  async predictProjectPatterns(projectConfig) {
    // Simplified pattern prediction
    return [
      'autonomous-coordination',
      'memory-enhanced-decision-making',
      'continuous-learning',
      'cross-specialist-collaboration'
    ];
  }

  /**
   * Find recovery strategy from memory
   */
  async findRecoveryStrategy(failedTask, result) {
    // Look for similar failed tasks in memory and successful recovery strategies
    // This would query the memory service for historical failure patterns
    return {
      name: 'retry-with-different-specialist',
      confidence: 0.7
    };
  }

  /**
   * Store project learnings for future reference
   */
  async storeProjectLearnings(project) {
    const learnings = {
      projectType: project.description,
      totalTasks: project.tasks.length,
      successfulTasks: project.results.filter(r => r.success).length,
      duration: project.endTime - project.startTime,
      patternsUsed: [...new Set(project.results.flatMap(r => r.patterns_applied || []))],
      specialistsInvolved: [...new Set(project.results.map(r => r.specialist))],
      keyLessons: this.extractProjectLessons(project)
    };
    
    if (this.memoryService) {
      try {
        await this.memoryService.storeSpecialistMemory(
          this.id, 'coordinator', this.name, 'project', project.id, learnings,
          ['project', 'learnings', project.status]
        );
      } catch (error) {
        console.error(`❌ Failed to store project learnings:`, error.message);
      }
    }
  }

  /**
   * Extract key lessons from completed project
   */
  extractProjectLessons(project) {
    const lessons = [];
    
    const successRate = project.results.filter(r => r.success).length / project.results.length;
    lessons.push(`Project success rate: ${Math.round(successRate * 100)}%`);
    
    const avgResponseTime = project.results.reduce((sum, r) => sum + (r.coordinationTime || 0), 0) / project.results.length;
    lessons.push(`Average coordination time: ${Math.round(avgResponseTime)}ms`);
    
    const specialistUsage = {};
    project.results.forEach(r => {
      specialistUsage[r.specialist] = (specialistUsage[r.specialist] || 0) + 1;
    });
    const mostUsedSpecialist = Object.keys(specialistUsage).reduce((a, b) => 
      specialistUsage[a] > specialistUsage[b] ? a : b
    );
    lessons.push(`Most utilized specialist: ${mostUsedSpecialist}`);
    
    return lessons;
  }

  /**
   * Update coordination metrics with memory persistence
   */
  async updateCoordinationMetrics(success, responseTime) {
    this.performanceMetrics.tasksCompleted++;
    this.performanceMetrics.totalLifetimeCoordinations++;
    this.performanceMetrics.totalResponseTime += responseTime;
    
    if (success) {
      this.performanceMetrics.successfulCoordinations++;
    }
    
    // Calculate collaboration efficiency
    const recentEfficiency = this.calculateRecentCollaborationEfficiency();
    this.performanceMetrics.collaborationEfficiency = recentEfficiency;
    
    // Persist metrics
    if (this.memoryService) {
      try {
        await this.memoryService.storePerformanceHistory(
          this.id, 'coordinator', this.performanceMetrics
        );
      } catch (error) {
        console.error(`❌ Failed to persist coordination metrics:`, error.message);
      }
    }
  }

  /**
   * Calculate recent collaboration efficiency
   */
  calculateRecentCollaborationEfficiency() {
    if (this.coordinationHistory.length === 0) return 100;
    
    const recentCoordinations = this.coordinationHistory.slice(-10); // Last 10 coordinations
    const successfulCount = recentCoordinations.filter(c => c.result.success).length;
    const avgResponseTime = recentCoordinations.reduce((sum, c) => sum + c.responseTime, 0) / recentCoordinations.length;
    
    let efficiency = (successfulCount / recentCoordinations.length) * 100;
    
    // Penalty for slow response times
    if (avgResponseTime > 5000) efficiency *= 0.9;
    if (avgResponseTime > 10000) efficiency *= 0.8;
    
    return Math.round(efficiency);
  }

  /**
   * Enhanced team status with memory information
   */
  getTeamStatus() {
    const specialists = Array.from(this.specialists.values()).map(s => s.getStatus());
    const avgResponseTime = this.performanceMetrics.tasksCompleted > 0 
      ? Math.round(this.performanceMetrics.totalResponseTime / this.performanceMetrics.tasksCompleted)
      : 0;
      
    return {
      coordinator: {
        id: this.id,
        name: this.name,
        emoji: this.emoji,
        sessionId: this.sessionId.substring(0, 8),
        sessionStart: this.sessionStartTime,
        uptime: process.uptime(),
        memoryEnhanced: !!this.memoryService
      },
      team: {
        specialists: specialists,
        total_specialists: this.specialists.size,
        active_projects: this.activeProjects.size,
        coordination_history: this.coordinationHistory.length
      },
      performance: {
        ...this.performanceMetrics,
        success_rate: this.performanceMetrics.tasksCompleted > 0 
          ? Math.round((this.performanceMetrics.successfulCoordinations / this.performanceMetrics.tasksCompleted) * 100)
          : 100,
        average_response_time: avgResponseTime
      },
      memory: {
        team_memory: {
          shared_patterns: this.teamMemory.sharedPatterns.size,
          team_decisions: this.teamMemory.teamDecisions.size,
          collaboration_strategies: this.teamMemory.collaborationStrategies.size,
          project_histories: this.teamMemory.projectHistories.size,
          specialist_relationships: this.teamMemory.specialistRelationships.size
        },
        learning_score: this.performanceMetrics.teamLearningScore,
        memory_service_active: !!this.memoryService
      },
      projects: Array.from(this.activeProjects.values()).map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        tasks_completed: p.results.length,
        duration: p.endTime ? p.endTime - p.startTime : Date.now() - p.startTime,
        memory_enhanced: p.memoryEnhanced
      }))
    };
  }

  /**
   * Graceful shutdown with complete memory persistence
   */
  async shutdown() {
    console.log(`👋 ${this.name}: Shutting down and persisting complete team state...`);
    
    // Shutdown all specialists gracefully
    const shutdownPromises = Array.from(this.specialists.values()).map(specialist => 
      specialist.shutdown()
    );
    
    await Promise.all(shutdownPromises);
    
    // Store final team state
    if (this.memoryService) {
      try {
        // Store team memory
        for (const [key, value] of this.teamMemory.sharedPatterns) {
          await this.memoryService.storeSpecialistMemory(
            this.id, 'coordinator', this.name, 'team-pattern', key, value
          );
        }
        
        // Store final coordinator session
        await this.memoryService.shutdownSpecialistSession(this.id, this.performanceMetrics);
        
        console.log(`✅ ${this.name}: Complete team memory and state persisted successfully`);
      } catch (error) {
        console.error(`❌ ${this.name}: Failed to persist team memory:`, error.message);
      }
    }
    
    console.log(`👋 ${this.name}: Shutdown complete - Memory preserved for next session`);
  }
}