/**
 * >� Krin AI Team Coordinator - Revolutionary Team Leadership System
 * Autonomous AI team coordination with real-time collaboration
 */

import { randomUUID as uuidv4 } from 'crypto';
import { AISpecialist } from './ai-specialist.js';
import { SpecialistRoles, TaskTypes, MessageTypes } from './types.js';

export class KrinAITeamCoordinator {
  constructor(config = {}) {
    this.id = uuidv4();
    this.name = 'Krin - AI Team Coordinator';
    this.emoji = '>�';
    this.specialists = new Map();
    this.activeProjects = new Map();
    this.coordinationHistory = [];
    this.performanceMetrics = {
      tasksCompleted: 0,
      specialistsSpawned: 0,
      successfulCoordinations: 0,
      totalResponseTime: 0
    };
    
    // System integration
    this.patterns = config.patterns || [];
    this.backendAPI = config.backendAPI;
    this.activityMonitor = config.activityMonitor;
    
    console.log(`${this.emoji} ${this.name} initialized - Ready for AI team coordination!`);
  }

  /**
   * Spawn a new AI specialist
   */
  async spawnSpecialist(role, config = {}) {
    console.log(`${this.emoji} Spawning ${role} specialist...`);
    
    try {
      const specialist = new AISpecialist(role, {
        patterns: this.patterns,
        activityMonitor: this.activityMonitor,
        ...config
      });
      
      this.specialists.set(specialist.id, specialist);
      this.performanceMetrics.specialistsSpawned++;
      
      console.log(` ${specialist.name} (${specialist.emoji}) spawned successfully!`);
      
      // Broadcast introduction to team
      await this.broadcastCoordinationMessage(
        `<� Welcome ${specialist.name} to the AI team! Ready for autonomous development.`
      );
      
      return specialist;
      
    } catch (error) {
      console.error(`L Failed to spawn ${role} specialist:`, error);
      throw error;
    }
  }

  /**
   * Coordinate autonomous task execution across specialists
   */
  async coordinateTask(task) {
    console.log(`${this.emoji} Coordinating task: ${task.description}`);
    
    const startTime = Date.now();
    
    try {
      // Find best specialist for task
      const specialist = this.findBestSpecialist(task);
      
      if (!specialist) {
        throw new Error(`No suitable specialist found for task: ${task.type}`);
      }
      
      console.log(`${this.emoji} Assigned task to ${specialist.name} (${specialist.emoji})`);
      
      // Execute task with specialist
      const result = await specialist.acceptTask(task);
      
      // Update coordination metrics
      const responseTime = Date.now() - startTime;
      this.updateCoordinationMetrics(result.success, responseTime);
      
      // Store coordination history
      this.coordinationHistory.push({
        task: task,
        specialist: specialist.name,
        result: result,
        responseTime: responseTime,
        timestamp: new Date()
      });
      
      console.log(`${this.emoji} Task coordination completed in ${responseTime}ms`);
      
      return result;
      
    } catch (error) {
      console.error(`${this.emoji} Task coordination failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find the best specialist for a given task
   */
  findBestSpecialist(task) {
    const availableSpecialists = Array.from(this.specialists.values())
      .filter(s => s.status === 'idle');
      
    if (availableSpecialists.length === 0) {
      return null;
    }
    
    // Role-based matching
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
    
    // Find specialist with matching role
    for (const role of preferredRoles) {
      const specialist = availableSpecialists.find(s => s.role === role);
      if (specialist) return specialist;
    }
    
    // Fallback to any available specialist
    return availableSpecialists[0];
  }

  /**
   * Broadcast message to all specialists
   */
  async broadcastCoordinationMessage(message) {
    console.log(`${this.emoji} Broadcasting: ${message}`);
    
    const broadcastPromises = Array.from(this.specialists.values()).map(specialist => {
      return specialist.receiveMessage({
        id: uuidv4(),
        from: this.id,
        to: specialist.id,
        type: MessageTypes.COORDINATION,
        message: message,
        timestamp: new Date(),
        sender_name: this.name,
        sender_emoji: this.emoji
      });
    });
    
    await Promise.all(broadcastPromises);
  }

  /**
   * Start autonomous project development
   */
  async startAutonomousProject(projectConfig) {
    console.log(`${this.emoji} Starting autonomous project: ${projectConfig.name}`);
    
    const project = {
      id: uuidv4(),
      name: projectConfig.name,
      description: projectConfig.description,
      tasks: projectConfig.tasks || [],
      startTime: new Date(),
      status: 'active',
      specialists: [],
      results: []
    };
    
    this.activeProjects.set(project.id, project);
    
    try {
      // Coordinate all project tasks
      for (const task of project.tasks) {
        const result = await this.coordinateTask(task);
        project.results.push(result);
        
        if (!result.success) {
          console.log(`${this.emoji} Task failed, adjusting project strategy...`);
        }
      }
      
      project.status = 'completed';
      project.endTime = new Date();
      
      console.log(`${this.emoji} Autonomous project completed: ${project.name}`);
      
      return project;
      
    } catch (error) {
      project.status = 'failed';
      project.error = error.message;
      console.error(`${this.emoji} Autonomous project failed:`, error);
      throw error;
    }
  }

  /**
   * Update coordination performance metrics
   */
  updateCoordinationMetrics(success, responseTime) {
    this.performanceMetrics.tasksCompleted++;
    this.performanceMetrics.totalResponseTime += responseTime;
    
    if (success) {
      this.performanceMetrics.successfulCoordinations++;
    }
  }

  /**
   * Get comprehensive team status
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
        uptime: process.uptime()
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
      projects: Array.from(this.activeProjects.values()).map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        tasks_completed: p.results.length,
        duration: p.endTime ? p.endTime - p.startTime : Date.now() - p.startTime
      }))
    };
  }

  /**
   * Get specialist by ID
   */
  getSpecialist(specialistId) {
    return this.specialists.get(specialistId);
  }

  /**
   * Remove specialist from team
   */
  async removeSpecialist(specialistId) {
    const specialist = this.specialists.get(specialistId);
    if (!specialist) {
      throw new Error('Specialist not found');
    }
    
    console.log(`${this.emoji} Removing specialist: ${specialist.name}`);
    this.specialists.delete(specialistId);
    
    await this.broadcastCoordinationMessage(
      `=K ${specialist.name} has left the AI team. Thanks for the contributions!`
    );
  }

  /**
   * Get active specialists for API
   */
  getActiveSpecialists() {
    return Array.from(this.specialists.values()).map(s => s.getStatus());
  }

  /**
   * Get coordination metrics and status
   */
  getCoordinationStatus() {
    return {
      coordinator: {
        id: this.id,
        name: this.name,
        emoji: this.emoji
      },
      specialists: {
        total: this.specialists.size,
        active: Array.from(this.specialists.values())
          .filter(s => s.status === 'active' || s.status === 'busy').length,
        idle: Array.from(this.specialists.values())
          .filter(s => s.status === 'idle').length
      },
      projects: {
        active: Array.from(this.activeProjects.values())
          .filter(p => p.status === 'active').length,
        completed: this.performanceMetrics.successfulCoordinations
      },
      metrics: this.performanceMetrics,
      recent_messages: this.coordinationHistory.slice(-10).map(h => ({
        id: h.task?.id || Date.now(),
        from: 'coordinator',
        message: `Task assigned to ${h.specialist}`,
        type: 'coordination',
        timestamp: h.timestamp,
        sender_name: this.name,
        sender_emoji: this.emoji
      }))
    };
  }
}