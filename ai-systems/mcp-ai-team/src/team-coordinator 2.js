/**
 * 🚀 Krin's Revolutionary AI Team Coordinator
 * Orchestrates multiple AI specialists for autonomous development
 */

import { v4 as uuidv4 } from 'uuid';
import { AISpecialist } from './ai-specialist.js';
import { 
  SpecialistRoles, 
  TaskTypes, 
  MessageTypes,
  ProjectContexts,
  TaskPriority 
} from './types.js';

export class KrinAITeamCoordinator {
  constructor(config = {}) {
    this.id = uuidv4();
    this.name = 'Krin - AI Team Coordinator';
    this.emoji = '🚀';
    this.specialists = new Map();
    this.activeProjects = new Map();
    this.taskQueue = [];
    this.messageHistory = [];
    this.coordinationMetrics = {
      projectsCompleted: 0,
      tasksCoordinated: 0,
      averageTeamSize: 0,
      successRate: 100
    };

    // Integration with existing Dev Memory OS systems
    this.devMemoryOSPatterns = config.patterns || [];
    this.backendAPI = config.backendAPI || null;
    this.activityMonitor = config.activityMonitor || null;
    
    console.log('🚀 Krin AI Team Coordinator initialized - Ready for autonomous development!');
  }

  /**
   * Spawn AI specialist with role and configuration
   */
  async spawnSpecialist(role, config = {}) {
    console.log(`🚀 Krin: Spawning ${role} specialist...`);
    
    const specialist = new AISpecialist(role, {
      patterns: this.devMemoryOSPatterns,
      apiEndpoints: config.apiEndpoints,
      activityMonitor: this.activityMonitor, // Pass activity monitor for specialized AIs
      ...config
    });

    this.specialists.set(specialist.id, specialist);
    
    // Log activity to existing monitoring system
    if (this.activityMonitor) {
      this.activityMonitor.logActivity({
        specialist: 'krin',
        specialistName: 'Krin (Team Leader)',
        emoji: '🚀',
        message: `Spawned new ${role} specialist: ${specialist.name}`,
        type: 'system',
        metadata: { 
          specialistId: specialist.id,
          role: role,
          capabilities: specialist.capabilities.length 
        }
      });
    }

    console.log(`✅ ${specialist.emoji} ${specialist.name} ready for coordination`);
    return specialist;
  }

  /**
   * Create complete AI team for project
   */
  async assembleTeam(requiredRoles = [SpecialistRoles.BACKEND, SpecialistRoles.FRONTEND, SpecialistRoles.TESTING]) {
    console.log(`🚀 Krin: Assembling AI team with roles: ${requiredRoles.join(', ')}`);
    
    const team = [];
    
    for (const role of requiredRoles) {
      const specialist = await this.spawnSpecialist(role);
      team.push(specialist);
    }

    console.log(`✅ AI Team assembled: ${team.length} specialists ready for autonomous development`);
    
    // Update metrics
    this.coordinationMetrics.averageTeamSize = 
      (this.coordinationMetrics.averageTeamSize + team.length) / 2;

    return team;
  }

  /**
   * Coordinate autonomous project development
   */
  async coordinateProject(projectDescription, config = {}) {
    const projectId = uuidv4();
    console.log(`🚀 Krin: Starting autonomous project coordination - ${projectDescription}`);
    
    // Create project context
    const project = {
      id: projectId,
      description: projectDescription,
      context: config.context || ProjectContexts.WEB_APP,
      techStack: config.techStack || ['react-typescript', 'node-express'],
      requirements: config.requirements || [],
      startTime: new Date(),
      status: 'in-progress'
    };

    this.activeProjects.set(projectId, project);

    // Determine required specialists
    const requiredRoles = this.determineRequiredRoles(project);
    
    // Assemble team
    const team = await this.assembleTeam(requiredRoles);
    
    // Create coordinated task plan
    const taskPlan = this.createTaskPlan(project, team);
    
    // Execute coordinated development
    const results = await this.executeCoordinatedDevelopment(project, team, taskPlan);
    
    // Log project completion
    this.coordinationMetrics.projectsCompleted++;
    project.status = 'completed';
    project.endTime = new Date();
    project.results = results;

    console.log(`🎉 Project completed successfully: ${projectDescription}`);
    console.log(`📊 Team performance: ${results.successRate}% success rate`);
    
    return {
      project,
      team: team.map(s => s.getStatus()),
      results,
      coordination_log: this.getProjectLog(projectId)
    };
  }

  /**
   * Determine required specialist roles for project
   */
  determineRequiredRoles(project) {
    const baseRoles = [SpecialistRoles.BACKEND, SpecialistRoles.FRONTEND];
    const additionalRoles = [];

    // Add testing if not specified otherwise
    if (!project.skipTesting) {
      additionalRoles.push(SpecialistRoles.TESTING);
    }

    // Add DevOps for deployment requirements
    if (project.deployment || project.context !== 'library') {
      additionalRoles.push(SpecialistRoles.DEVOPS);
    }

    // Add security for sensitive applications
    if (project.requirements?.includes('authentication') || 
        project.requirements?.includes('security')) {
      additionalRoles.push(SpecialistRoles.SECURITY);
    }

    return [...baseRoles, ...additionalRoles];
  }

  /**
   * Create coordinated task plan
   */
  createTaskPlan(project, team) {
    const tasks = [];

    // Architecture phase
    tasks.push({
      id: uuidv4(),
      type: TaskTypes.ARCHITECTURE,
      description: `Design architecture for ${project.description}`,
      assignedTo: team.find(s => s.role === SpecialistRoles.BACKEND)?.id,
      priority: TaskPriority.CRITICAL,
      dependencies: [],
      phase: 1
    });

    // Implementation phase
    tasks.push({
      id: uuidv4(),
      type: TaskTypes.CODE_GENERATION,
      description: 'Implement backend API and database',
      assignedTo: team.find(s => s.role === SpecialistRoles.BACKEND)?.id,
      priority: TaskPriority.HIGH,
      dependencies: [tasks[0].id],
      phase: 2
    });

    tasks.push({
      id: uuidv4(),
      type: TaskTypes.CODE_GENERATION,
      description: 'Implement frontend interface',
      assignedTo: team.find(s => s.role === SpecialistRoles.FRONTEND)?.id,
      priority: TaskPriority.HIGH,
      dependencies: [tasks[1].id],
      phase: 3
    });

    // Testing phase
    const testingSpecialist = team.find(s => s.role === SpecialistRoles.TESTING);
    if (testingSpecialist) {
      tasks.push({
        id: uuidv4(),
        type: TaskTypes.TESTING,
        description: 'Comprehensive testing and quality assurance',
        assignedTo: testingSpecialist.id,
        priority: TaskPriority.MEDIUM,
        dependencies: [tasks[2].id],
        phase: 4
      });
    }

    return tasks;
  }

  /**
   * Execute coordinated development with AI team
   */
  async executeCoordinatedDevelopment(project, team, taskPlan) {
    console.log(`🚀 Krin: Executing coordinated development with ${team.length} specialists`);
    
    const results = {
      tasksCompleted: 0,
      tasksTotal: taskPlan.length,
      successRate: 0,
      timeline: [],
      artifacts: []
    };

    // Execute tasks in phases
    const phases = [...new Set(taskPlan.map(t => t.phase))].sort();
    
    for (const phase of phases) {
      console.log(`🚀 Krin: Executing phase ${phase}`);
      
      const phaseTasks = taskPlan.filter(t => t.phase === phase);
      
      // Execute tasks in parallel within phase
      const phaseResults = await Promise.allSettled(
        phaseTasks.map(task => this.executeTask(task, team))
      );

      // Process phase results
      for (let i = 0; i < phaseResults.length; i++) {
        const result = phaseResults[i];
        const task = phaseTasks[i];
        
        if (result.status === 'fulfilled' && result.value.success) {
          results.tasksCompleted++;
          results.artifacts.push(result.value.result);
        }
        
        results.timeline.push({
          phase,
          task: task.description,
          specialist: team.find(s => s.id === task.assignedTo)?.name,
          success: result.status === 'fulfilled' && result.value.success,
          timestamp: new Date()
        });
      }

      // Facilitate inter-specialist communication
      await this.facilitatePhaseCoordination(team, phase, phaseResults);
    }

    results.successRate = (results.tasksCompleted / results.tasksTotal) * 100;
    
    // Update coordination metrics
    this.coordinationMetrics.tasksCoordinated += taskPlan.length;
    
    return results;
  }

  /**
   * Execute individual task with specialist
   */
  async executeTask(task, team) {
    const specialist = team.find(s => s.id === task.assignedTo);
    
    if (!specialist) {
      throw new Error(`No specialist found for task: ${task.description}`);
    }

    console.log(`🚀 Krin: Assigning task to ${specialist.name}: ${task.description}`);
    
    // Log task assignment
    if (this.activityMonitor) {
      this.activityMonitor.logActivity({
        specialist: specialist.role,
        specialistName: specialist.name,
        emoji: specialist.emoji,
        message: `Assigned task: ${task.description}`,
        type: 'active',
        metadata: { taskId: task.id, taskType: task.type }
      });
    }

    // Execute task with specialist
    const result = await specialist.acceptTask(task);
    
    // Log completion
    if (this.activityMonitor) {
      this.activityMonitor.logActivity({
        specialist: specialist.role,
        specialistName: specialist.name,
        emoji: specialist.emoji,
        message: result.success ? 
          `Completed task: ${task.description}` : 
          `Task failed: ${result.error}`,
        type: result.success ? 'completed' : 'error',
        metadata: { taskId: task.id, success: result.success }
      });
    }

    return result;
  }

  /**
   * Facilitate coordination between specialists in each phase
   */
  async facilitatePhaseCoordination(team, phase, phaseResults) {
    console.log(`🚀 Krin: Facilitating coordination for phase ${phase}`);
    
    // Example: Backend shares API spec with Frontend
    const backend = team.find(s => s.role === SpecialistRoles.BACKEND);
    const frontend = team.find(s => s.role === SpecialistRoles.FRONTEND);
    
    if (backend && frontend && phase === 2) {
      const message = await backend.sendMessage(
        frontend.id,
        'Backend API ready. Sharing OpenAPI specification and endpoints.',
        MessageTypes.COORDINATION
      );
      
      await frontend.receiveMessage(message);
      this.messageHistory.push(message);
    }

    // Example: Frontend coordinates with Testing
    const testing = team.find(s => s.role === SpecialistRoles.TESTING);
    
    if (frontend && testing && phase === 3) {
      const message = await frontend.sendMessage(
        testing.id,
        'Frontend implementation complete. Ready for comprehensive testing.',
        MessageTypes.COORDINATION
      );
      
      await testing.receiveMessage(message);
      this.messageHistory.push(message);
    }

    // Log coordination activity
    if (this.activityMonitor) {
      this.activityMonitor.logActivity({
        specialist: 'krin',
        specialistName: 'Krin (Team Leader)',
        emoji: '🚀',
        message: `Coordinated phase ${phase} communication between ${team.length} specialists`,
        type: 'coordination',
        metadata: { phase, teamSize: team.length }
      });
    }
  }

  /**
   * Get list of all active specialists
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
          .filter(p => p.status === 'in-progress').length,
        completed: this.coordinationMetrics.projectsCompleted
      },
      metrics: this.coordinationMetrics,
      recent_messages: this.messageHistory.slice(-10)
    };
  }

  /**
   * Get project coordination log
   */
  getProjectLog(projectId) {
    const project = this.activeProjects.get(projectId);
    if (!project) return null;

    return {
      project: project.description,
      timeline: project.results?.timeline || [],
      messages: this.messageHistory.filter(m => m.project_id === projectId),
      specialists_involved: Array.from(this.specialists.values())
        .map(s => ({ name: s.name, role: s.role, tasks: s.performanceMetrics.tasksCompleted }))
    };
  }

  /**
   * Send coordination message to all specialists
   */
  async broadcastCoordinationMessage(message, type = MessageTypes.COORDINATION) {
    console.log(`🚀 Krin: Broadcasting to all specialists - ${message}`);
    
    const broadcastPromises = Array.from(this.specialists.values()).map(specialist => {
      const messageObj = {
        id: uuidv4(),
        from: this.id,
        to: specialist.id,
        type,
        message,
        timestamp: new Date(),
        sender_name: this.name,
        sender_emoji: this.emoji
      };
      
      return specialist.receiveMessage(messageObj);
    });

    await Promise.allSettled(broadcastPromises);
    
    // Log broadcast activity
    if (this.activityMonitor) {
      this.activityMonitor.logActivity({
        specialist: 'krin',
        specialistName: 'Krin (Team Leader)',
        emoji: '🚀',
        message: `Broadcast message to ${this.specialists.size} specialists: ${message}`,
        type: 'coordination',
        metadata: { recipients: this.specialists.size }
      });
    }
  }
}