/**
 * 🤖 KRINS AI Team Trigger
 * Revolutionary system that automatically triggers autonomous AI development teams
 */

import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';

export class AITeamTrigger {
  constructor(config = {}) {
    this.config = {
      aiPatternBridge: config.aiPatternBridge || 'http://localhost:3007',
      mcpAITeamServer: config.mcpAITeamServer || 'http://localhost:3006',
      semanticSearchServer: config.semanticSearchServer || 'http://localhost:3003',
      maxConcurrentTeams: config.maxConcurrentTeams || 10,
      teamTimeout: config.teamTimeout || 3600000, // 1 hour
      ...config
    };

    // Active AI teams tracking
    this.activeTeams = new Map();
    this.teamHistory = [];
    
    // Trigger statistics
    this.triggerStats = {
      teams_triggered: 0,
      successful_completions: 0,
      failed_completions: 0,
      average_completion_time: 0,
      total_ai_specialists: 0
    };

    this.isReady = true;

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [AITeamTrigger] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });
  }

  /**
   * Trigger AI team for GitHub event
   */
  async triggerAITeam(triggerRequest) {
    const startTime = Date.now();
    const teamId = uuidv4();

    try {
      const {
        repository_url,
        trigger_type,
        context,
        required_capabilities = [],
        manual_trigger = false
      } = triggerRequest;

      this.logger.info('Triggering AI team', {
        team_id: teamId,
        repository_url,
        trigger_type,
        required_capabilities,
        manual_trigger
      });

      // Check if we can create more teams
      if (this.activeTeams.size >= this.config.maxConcurrentTeams) {
        throw new Error(`Maximum concurrent teams reached (${this.config.maxConcurrentTeams})`);
      }

      // Analyze requirements and assemble optimal team
      const teamComposition = await this.analyzeAndAssembleTeam({
        repository_url,
        trigger_type,
        context,
        required_capabilities
      });

      // Register AI systems with the Pattern Bridge
      const registrationResults = await this.registerAISystemsWithBridge(teamComposition);

      // Start coordination session
      const coordinationSession = await this.startCoordinationSession({
        team_id: teamId,
        team_composition: teamComposition,
        trigger_context: context,
        repository_url
      });

      // Create active team record
      const activeTeam = {
        id: teamId,
        repository_url,
        trigger_type,
        context,
        team_composition: teamComposition,
        coordination_session: coordinationSession,
        started_at: new Date(),
        status: 'active',
        progress: {
          phase: 'initialization',
          completion_percentage: 0,
          current_tasks: [],
          completed_tasks: []
        }
      };

      this.activeTeams.set(teamId, activeTeam);
      this.triggerStats.teams_triggered++;
      this.triggerStats.total_ai_specialists += teamComposition.specialists.length;

      // Start monitoring the team's progress
      this.monitorTeamProgress(teamId);

      const triggerTime = Date.now() - startTime;

      this.logger.info('AI team triggered successfully', {
        team_id: teamId,
        specialists: teamComposition.specialists.length,
        coordination_session_id: coordinationSession.session_id,
        trigger_time: `${triggerTime}ms`
      });

      return {
        success: true,
        team_id: teamId,
        teams_created: 1,
        specialists_assigned: teamComposition.specialists.length,
        coordination_session_id: coordinationSession.session_id,
        estimated_completion_time: teamComposition.estimated_completion_time,
        trigger_time: triggerTime
      };

    } catch (error) {
      this.logger.error('Failed to trigger AI team', {
        team_id: teamId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze requirements and assemble optimal AI team
   */
  async analyzeAndAssembleTeam(requirements) {
    const {
      repository_url,
      trigger_type,
      context,
      required_capabilities
    } = requirements;

    this.logger.info('Analyzing requirements for team assembly', {
      trigger_type,
      required_capabilities
    });

    // Base team composition based on trigger type
    const baseTeam = this.getBaseTeamForTriggerType(trigger_type);
    
    // Add specialists based on required capabilities
    const additionalSpecialists = this.getSpecialistsForCapabilities(required_capabilities);
    
    // Merge and optimize team composition
    const allSpecialists = [...baseTeam, ...additionalSpecialists];
    const optimizedSpecialists = this.optimizeTeamComposition(allSpecialists, context);

    // Estimate completion time based on team size and complexity
    const estimatedCompletionTime = this.estimateCompletionTime(
      optimizedSpecialists,
      context,
      trigger_type
    );

    // Assign roles and responsibilities
    const specialistAssignments = this.assignRolesAndResponsibilities(
      optimizedSpecialists,
      context
    );

    const teamComposition = {
      specialists: specialistAssignments,
      team_lead: this.selectTeamLead(specialistAssignments),
      coordination_strategy: this.selectCoordinationStrategy(optimizedSpecialists.length),
      estimated_completion_time: estimatedCompletionTime,
      success_criteria: this.defineSuccessCriteria(trigger_type, context)
    };

    this.logger.info('Team composition assembled', {
      total_specialists: teamComposition.specialists.length,
      team_lead: teamComposition.team_lead.role,
      coordination_strategy: teamComposition.coordination_strategy,
      estimated_time: `${estimatedCompletionTime}ms`
    });

    return teamComposition;
  }

  /**
   * Get base team composition for different trigger types
   */
  getBaseTeamForTriggerType(triggerType) {
    const baseTeams = {
      'pull_request': [
        { role: 'backend', priority: 'high' },
        { role: 'frontend', priority: 'high' },
        { role: 'testing', priority: 'high' }
      ],
      'significant_push': [
        { role: 'architecture', priority: 'high' },
        { role: 'code-review', priority: 'high' },
        { role: 'testing', priority: 'medium' }
      ],
      'technical_issue': [
        { role: 'backend', priority: 'medium' },
        { role: 'testing', priority: 'medium' }
      ],
      'release_deployment': [
        { role: 'devops', priority: 'high' },
        { role: 'testing', priority: 'high' },
        { role: 'monitoring', priority: 'medium' }
      ],
      'repository_setup': [
        { role: 'architecture', priority: 'high' },
        { role: 'devops', priority: 'high' },
        { role: 'documentation', priority: 'medium' },
        { role: 'security', priority: 'medium' }
      ]
    };

    return baseTeams[triggerType] || [
      { role: 'backend', priority: 'medium' },
      { role: 'testing', priority: 'medium' }
    ];
  }

  /**
   * Get specialists for specific capabilities
   */
  getSpecialistsForCapabilities(capabilities) {
    const capabilityMapping = {
      'architecture': { role: 'architecture', priority: 'high' },
      'database': { role: 'backend', priority: 'high', specialization: 'database' },
      'api': { role: 'backend', priority: 'high', specialization: 'api' },
      'security': { role: 'security', priority: 'high' },
      'performance': { role: 'backend', priority: 'medium', specialization: 'performance' },
      'infrastructure': { role: 'devops', priority: 'high' },
      'frontend': { role: 'frontend', priority: 'high' },
      'backend': { role: 'backend', priority: 'high' },
      'testing': { role: 'testing', priority: 'high' },
      'devops': { role: 'devops', priority: 'high' },
      'deployment': { role: 'devops', priority: 'high', specialization: 'deployment' },
      'monitoring': { role: 'devops', priority: 'medium', specialization: 'monitoring' },
      'documentation': { role: 'documentation', priority: 'low' },
      'code-review': { role: 'architecture', priority: 'medium', specialization: 'code-review' }
    };

    return capabilities.map(capability => 
      capabilityMapping[capability] || { role: 'backend', priority: 'low' }
    );
  }

  /**
   * Optimize team composition to avoid redundancy
   */
  optimizeTeamComposition(specialists, context) {
    // Group by role
    const roleGroups = specialists.reduce((groups, specialist) => {
      const role = specialist.role;
      if (!groups[role]) groups[role] = [];
      groups[role].push(specialist);
      return groups;
    }, {});

    // Select best specialist for each role
    const optimizedSpecialists = [];
    
    for (const [role, roleSpecialists] of Object.entries(roleGroups)) {
      // Sort by priority and select the highest priority specialist
      const sortedSpecialists = roleSpecialists.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Take the best specialist, or multiple if they have different specializations
      const selectedSpecialists = this.selectSpecialistsForRole(sortedSpecialists);
      optimizedSpecialists.push(...selectedSpecialists);
    }

    return optimizedSpecialists;
  }

  /**
   * Select specialists for a specific role
   */
  selectSpecialistsForRole(roleSpecialists) {
    // If no specializations, take the highest priority one
    const withoutSpecialization = roleSpecialists.filter(s => !s.specialization);
    const withSpecialization = roleSpecialists.filter(s => s.specialization);

    const selected = [];

    // Always include the highest priority general specialist
    if (withoutSpecialization.length > 0) {
      selected.push(withoutSpecialization[0]);
    }

    // Add specialists with unique specializations
    const uniqueSpecializations = new Set();
    for (const specialist of withSpecialization) {
      if (!uniqueSpecializations.has(specialist.specialization)) {
        uniqueSpecializations.add(specialist.specialization);
        selected.push(specialist);
      }
    }

    return selected.length > 0 ? selected : [roleSpecialists[0]];
  }

  /**
   * Assign specific roles and responsibilities
   */
  assignRolesAndResponsibilities(specialists, context) {
    return specialists.map(specialist => ({
      id: uuidv4(),
      role: specialist.role,
      specialization: specialist.specialization || null,
      priority: specialist.priority,
      responsibilities: this.getResponsibilitiesForRole(specialist.role, specialist.specialization),
      estimated_workload: this.estimateWorkload(specialist, context),
      coordination_weight: this.calculateCoordinationWeight(specialist),
      status: 'assigned'
    }));
  }

  /**
   * Get responsibilities for a specific role
   */
  getResponsibilitiesForRole(role, specialization) {
    const responsibilities = {
      'backend': [
        'API design and implementation',
        'Database integration',
        'Business logic implementation',
        'Performance optimization'
      ],
      'frontend': [
        'User interface implementation',
        'Component development',
        'State management',
        'User experience optimization'
      ],
      'testing': [
        'Test strategy design',
        'Unit test implementation',
        'Integration testing',
        'Quality assurance'
      ],
      'devops': [
        'Infrastructure setup',
        'CI/CD pipeline configuration',
        'Deployment automation',
        'Monitoring setup'
      ],
      'security': [
        'Security audit',
        'Vulnerability assessment',
        'Security implementation',
        'Compliance validation'
      ],
      'architecture': [
        'System architecture design',
        'Code review and guidance',
        'Technical decision making',
        'Pattern enforcement'
      ],
      'documentation': [
        'Technical documentation',
        'API documentation',
        'User guides',
        'Architecture diagrams'
      ]
    };

    let baseResponsibilities = responsibilities[role] || ['General development tasks'];

    // Add specialization-specific responsibilities
    if (specialization) {
      const specializationResponsibilities = {
        'database': ['Database schema design', 'Query optimization'],
        'api': ['REST API design', 'GraphQL implementation'],
        'performance': ['Performance analysis', 'Optimization strategies'],
        'deployment': ['Deployment strategy', 'Release management'],
        'monitoring': ['Monitoring setup', 'Alerting configuration'],
        'code-review': ['Code quality assessment', 'Best practices enforcement']
      };

      if (specializationResponsibilities[specialization]) {
        baseResponsibilities = [...baseResponsibilities, ...specializationResponsibilities[specialization]];
      }
    }

    return baseResponsibilities;
  }

  /**
   * Estimate workload for specialist
   */
  estimateWorkload(specialist, context) {
    const baseWorkloads = {
      'backend': 8,
      'frontend': 6,
      'testing': 4,
      'devops': 5,
      'security': 3,
      'architecture': 2,
      'documentation': 2
    };

    let workload = baseWorkloads[specialist.role] || 4;

    // Adjust based on priority
    const priorityMultipliers = { 'high': 1.5, 'medium': 1.0, 'low': 0.7 };
    workload *= priorityMultipliers[specialist.priority] || 1.0;

    // Adjust based on context complexity
    if (context?.changes?.changed_files > 10) workload *= 1.3;
    if (context?.changes?.additions + context?.changes?.deletions > 500) workload *= 1.5;

    return Math.round(workload);
  }

  /**
   * Calculate coordination weight for specialist
   */
  calculateCoordinationWeight(specialist) {
    const weights = {
      'architecture': 10,
      'backend': 8,
      'frontend': 7,
      'devops': 6,
      'testing': 5,
      'security': 4,
      'documentation': 2
    };

    return weights[specialist.role] || 3;
  }

  /**
   * Select team lead based on coordination weight and experience
   */
  selectTeamLead(specialists) {
    // Sort by coordination weight and select the highest
    const sortedSpecialists = specialists.sort((a, b) => 
      b.coordination_weight - a.coordination_weight
    );

    const teamLead = sortedSpecialists[0];
    teamLead.is_team_lead = true;

    return teamLead;
  }

  /**
   * Select coordination strategy based on team size
   */
  selectCoordinationStrategy(teamSize) {
    if (teamSize <= 2) return 'direct';
    if (teamSize <= 4) return 'hub-and-spoke';
    return 'hierarchical';
  }

  /**
   * Define success criteria based on trigger type and context
   */
  defineSuccessCriteria(triggerType, context) {
    const baseCriteria = {
      'pull_request': [
        'All code changes reviewed and approved',
        'Tests pass successfully',
        'Documentation updated where necessary',
        'Performance impact assessed'
      ],
      'significant_push': [
        'Architecture review completed',
        'Code quality standards maintained',
        'All tests pass',
        'No security vulnerabilities introduced'
      ],
      'technical_issue': [
        'Issue root cause identified',
        'Solution implemented and tested',
        'Documentation updated',
        'Prevention measures discussed'
      ],
      'release_deployment': [
        'Deployment executed successfully',
        'All services are healthy',
        'Monitoring and alerts configured',
        'Rollback plan validated'
      ],
      'repository_setup': [
        'Project structure established',
        'CI/CD pipeline configured',
        'Security measures implemented',
        'Documentation framework created'
      ]
    };

    return baseCriteria[triggerType] || [
      'Primary objectives completed',
      'Quality standards maintained',
      'No critical issues introduced'
    ];
  }

  /**
   * Estimate completion time based on team and context
   */
  estimateCompletionTime(specialists, context, triggerType) {
    const baseTimings = {
      'pull_request': 1800000, // 30 minutes
      'significant_push': 2700000, // 45 minutes
      'technical_issue': 3600000, // 1 hour
      'release_deployment': 1200000, // 20 minutes
      'repository_setup': 5400000 // 90 minutes
    };

    let baseTime = baseTimings[triggerType] || 2400000; // 40 minutes default

    // Adjust based on team size (more specialists = potentially faster)
    const teamSizeMultiplier = Math.max(0.5, 1 - (specialists.length - 2) * 0.1);
    baseTime *= teamSizeMultiplier;

    // Adjust based on context complexity
    if (context?.changes) {
      const totalChanges = (context.changes.additions || 0) + (context.changes.deletions || 0);
      if (totalChanges > 1000) baseTime *= 1.5;
      else if (totalChanges > 500) baseTime *= 1.3;
      else if (totalChanges > 100) baseTime *= 1.1;
    }

    return Math.round(baseTime);
  }

  /**
   * Register AI systems with the Pattern Bridge
   */
  async registerAISystemsWithBridge(teamComposition) {
    const registrationResults = [];

    for (const specialist of teamComposition.specialists) {
      try {
        const registrationPayload = {
          system_id: specialist.id,
          system_name: `${specialist.role} Specialist${specialist.specialization ? ` (${specialist.specialization})` : ''}`,
          capabilities: [specialist.role],
          endpoint: this.config.mcpAITeamServer,
          system_type: 'specialist',
          metadata: {
            specialization: specialist.specialization,
            priority: specialist.priority,
            responsibilities: specialist.responsibilities,
            estimated_workload: specialist.estimated_workload
          }
        };

        const response = await fetch(`${this.config.aiPatternBridge}/api/ai-systems/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registrationPayload)
        });

        if (!response.ok) {
          throw new Error(`Registration failed: ${response.statusText}`);
        }

        const result = await response.json();
        registrationResults.push({
          specialist_id: specialist.id,
          success: true,
          bridge_response: result
        });

      } catch (error) {
        this.logger.error('Failed to register specialist with bridge', {
          specialist_id: specialist.id,
          role: specialist.role,
          error: error.message
        });

        registrationResults.push({
          specialist_id: specialist.id,
          success: false,
          error: error.message
        });
      }
    }

    return registrationResults;
  }

  /**
   * Start coordination session via Pattern Bridge
   */
  async startCoordinationSession(sessionRequest) {
    const {
      team_id,
      team_composition,
      trigger_context,
      repository_url
    } = sessionRequest;

    try {
      const coordinationPayload = {
        coordinator_id: team_composition.team_lead.id,
        project_description: `GitHub triggered coordination for ${repository_url}`,
        required_capabilities: team_composition.specialists.map(s => s.role),
        coordination_type: 'project',
        priority: this.determineCoordinationPriority(trigger_context),
        estimated_duration: team_composition.estimated_completion_time,
        requirements: {
          tech_stack: this.inferTechStack(trigger_context, repository_url),
          constraints: this.extractConstraints(trigger_context),
          success_criteria: team_composition.success_criteria
        },
        metadata: {
          github_trigger: true,
          team_id,
          repository_url,
          trigger_type: trigger_context.trigger_type
        }
      };

      const response = await fetch(`${this.config.aiPatternBridge}/api/coordination/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(coordinationPayload)
      });

      if (!response.ok) {
        throw new Error(`Coordination session failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      this.logger.info('Coordination session started', {
        team_id,
        session_id: result.session?.id,
        coordinator: team_composition.team_lead.role
      });

      return {
        session_id: result.session?.id,
        participating_systems: result.participating_systems,
        coordination_plan: result.session?.coordination_plan,
        started_at: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Failed to start coordination session', {
        team_id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Determine coordination priority based on trigger context
   */
  determineCoordinationPriority(context) {
    if (context.trigger_type === 'release_deployment') return 'high';
    if (context.changes && (context.changes.additions + context.changes.deletions) > 500) return 'high';
    if (context.labels && context.labels.includes('critical')) return 'critical';
    if (context.labels && context.labels.includes('urgent')) return 'high';
    return 'normal';
  }

  /**
   * Infer technology stack from context
   */
  inferTechStack(context, repositoryUrl) {
    const techStack = [];
    
    // Infer from repository name or description
    const repoName = repositoryUrl.toLowerCase();
    if (repoName.includes('react')) techStack.push('react');
    if (repoName.includes('node') || repoName.includes('js')) techStack.push('nodejs');
    if (repoName.includes('python')) techStack.push('python');
    if (repoName.includes('docker')) techStack.push('docker');
    
    // Infer from PR title or description
    const content = `${context.title || ''} ${context.description || ''}`.toLowerCase();
    if (content.includes('typescript')) techStack.push('typescript');
    if (content.includes('postgres') || content.includes('database')) techStack.push('postgresql');
    if (content.includes('redis')) techStack.push('redis');
    if (content.includes('api')) techStack.push('rest-api');
    
    return techStack.length > 0 ? techStack : ['general'];
  }

  /**
   * Extract constraints from trigger context
   */
  extractConstraints(context) {
    const constraints = [];
    
    if (context.changes && context.changes.changed_files > 20) {
      constraints.push('Large change set - careful coordination required');
    }
    
    if (context.labels && context.labels.includes('breaking-change')) {
      constraints.push('Breaking change - backward compatibility review needed');
    }
    
    if (context.trigger_type === 'release_deployment') {
      constraints.push('Production deployment - zero-downtime requirement');
    }
    
    return constraints;
  }

  /**
   * Monitor team progress and handle completion
   */
  monitorTeamProgress(teamId) {
    const team = this.activeTeams.get(teamId);
    if (!team) return;

    // Set up periodic progress checks
    const progressInterval = setInterval(async () => {
      try {
        await this.checkTeamProgress(teamId);
      } catch (error) {
        this.logger.error('Progress check failed', { team_id: teamId, error: error.message });
      }
    }, 30000); // Check every 30 seconds

    // Set up timeout for team completion
    setTimeout(async () => {
      try {
        await this.handleTeamTimeout(teamId);
        clearInterval(progressInterval);
      } catch (error) {
        this.logger.error('Team timeout handling failed', { team_id: teamId, error: error.message });
      }
    }, this.config.teamTimeout);

    // Store interval reference for cleanup
    team.progressInterval = progressInterval;
  }

  /**
   * Check progress of active AI team
   */
  async checkTeamProgress(teamId) {
    const team = this.activeTeams.get(teamId);
    if (!team) return;

    try {
      // Get coordination status from Pattern Bridge
      const response = await fetch(`${this.config.aiPatternBridge}/api/coordination/status`, {
        method: 'GET'
      });

      if (response.ok) {
        const status = await response.json();
        
        // Find our session in the active sessions
        const ourSession = status.status.active_sessions.find(session => 
          session.id === team.coordination_session.session_id
        );

        if (ourSession) {
          // Update team progress
          team.progress = {
            phase: ourSession.current_phase || team.progress.phase,
            completion_percentage: ourSession.completion_percentage || team.progress.completion_percentage,
            current_tasks: ourSession.current_tasks || team.progress.current_tasks,
            completed_tasks: ourSession.completed_tasks || team.progress.completed_tasks
          };

          // Check if team is completed
          if (ourSession.status === 'completed') {
            await this.handleTeamCompletion(teamId, ourSession);
          }
        }
      }

    } catch (error) {
      this.logger.error('Failed to check team progress', {
        team_id: teamId,
        error: error.message
      });
    }
  }

  /**
   * Handle team completion
   */
  async handleTeamCompletion(teamId, sessionResult) {
    const team = this.activeTeams.get(teamId);
    if (!team) return;

    try {
      // Calculate completion metrics
      const completionTime = new Date() - team.started_at;
      const success = sessionResult.success_rate > 80;

      // Update statistics
      if (success) {
        this.triggerStats.successful_completions++;
      } else {
        this.triggerStats.failed_completions++;
      }

      // Update average completion time
      const totalCompletions = this.triggerStats.successful_completions + this.triggerStats.failed_completions;
      this.triggerStats.average_completion_time = 
        ((this.triggerStats.average_completion_time * (totalCompletions - 1)) + completionTime) / totalCompletions;

      // Move to history
      const completedTeam = {
        ...team,
        status: success ? 'completed' : 'failed',
        completed_at: new Date(),
        completion_time: completionTime,
        final_result: sessionResult
      };

      this.teamHistory.push(completedTeam);
      this.activeTeams.delete(teamId);

      // Cleanup progress monitoring
      if (team.progressInterval) {
        clearInterval(team.progressInterval);
      }

      this.logger.info('AI team completed', {
        team_id: teamId,
        success,
        completion_time: `${completionTime}ms`,
        success_rate: `${sessionResult.success_rate}%`
      });

    } catch (error) {
      this.logger.error('Failed to handle team completion', {
        team_id: teamId,
        error: error.message
      });
    }
  }

  /**
   * Handle team timeout
   */
  async handleTeamTimeout(teamId) {
    const team = this.activeTeams.get(teamId);
    if (!team) return;

    this.logger.warn('AI team timed out', {
      team_id: teamId,
      duration: Date.now() - team.started_at
    });

    try {
      // Try to complete the coordination session gracefully
      const response = await fetch(`${this.config.aiPatternBridge}/api/coordination/${team.coordination_session.session_id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: team.coordination_session.session_id,
          completion_status: 'timeout',
          results: {
            artifacts: [],
            metrics: {
              tasks_completed: team.progress.completed_tasks.length,
              success_rate: 0,
              total_messages: 0,
              patterns_shared: 0
            },
            success_criteria_met: []
          },
          summary: 'Team coordination timed out before completion',
          feedback: {
            improvement_suggestions: ['Consider longer timeout for complex tasks']
          }
        })
      });

      if (response.ok) {
        await this.handleTeamCompletion(teamId, { success_rate: 0 });
      } else {
        // Force cleanup if API call fails
        this.activeTeams.delete(teamId);
        this.triggerStats.failed_completions++;
      }

    } catch (error) {
      this.logger.error('Failed to handle team timeout gracefully', {
        team_id: teamId,
        error: error.message
      });
      
      // Force cleanup
      this.activeTeams.delete(teamId);
      this.triggerStats.failed_completions++;
    }
  }

  /**
   * Get trigger statistics
   */
  getStats() {
    return {
      ...this.triggerStats,
      active_teams: this.activeTeams.size,
      team_history: this.teamHistory.length,
      is_ready: this.isReady
    };
  }

  /**
   * Get active teams information
   */
  getActiveTeams() {
    return Array.from(this.activeTeams.values()).map(team => ({
      id: team.id,
      repository_url: team.repository_url,
      trigger_type: team.trigger_type,
      status: team.status,
      started_at: team.started_at,
      progress: team.progress,
      team_size: team.team_composition.specialists.length,
      team_lead: team.team_composition.team_lead.role
    }));
  }

  /**
   * Check if trigger is ready
   */
  isReady() {
    return this.isReady;
  }
}