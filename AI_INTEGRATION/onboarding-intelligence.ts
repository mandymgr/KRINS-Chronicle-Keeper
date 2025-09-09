/**
 * 🎓 KRINS AI-Powered Onboarding Intelligence
 * 
 * Personalized learning paths and organizational intelligence onboarding:
 * - Adaptive learning based on role and experience
 * - Decision-making pattern analysis and training
 * - Interactive ADR workshops and simulations  
 * - Team collaboration skill development
 * - Evidence collection and analysis training
 * - Continuous competency assessment and growth
 * 
 * @author KRINS Intelligence System
 */

import { EventEmitter } from 'events'
import fs from 'fs-extra'
import path from 'path'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  experience_level: 'junior' | 'mid' | 'senior' | 'expert'
  skills: string[]
  learning_preferences: {
    pace: 'slow' | 'moderate' | 'fast'
    style: 'visual' | 'hands-on' | 'reading' | 'mixed'
    time_available: number // minutes per day
  }
  timezone: string
  start_date: Date
}

interface LearningModule {
  id: string
  title: string
  description: string
  type: 'tutorial' | 'workshop' | 'simulation' | 'assessment' | 'project'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  prerequisites: string[]
  skills_developed: string[]
  competencies: string[]
  content: {
    theory?: string
    examples?: any[]
    exercises?: Exercise[]
    assessment?: Assessment
  }
  adaptable: boolean
  personalization_factors: string[]
}

interface Exercise {
  id: string
  type: 'adr_creation' | 'decision_analysis' | 'evidence_collection' | 'stakeholder_mapping'
  title: string
  description: string
  scenario: string
  expected_outcome: string
  hints?: string[]
  solution?: any
  evaluation_criteria: string[]
}

interface Assessment {
  id: string
  type: 'quiz' | 'practical' | 'peer_review' | 'self_reflection'
  questions: Question[]
  passing_score: number
  adaptive: boolean
}

interface Question {
  id: string
  type: 'multiple_choice' | 'open_ended' | 'scenario_based' | 'drag_drop'
  question: string
  options?: string[]
  correct_answer?: string | string[]
  explanation?: string
  difficulty: number
  competency: string
}

interface LearningPath {
  id: string
  title: string
  description: string
  target_role: string
  target_level: string
  estimated_duration_days: number
  modules: string[]
  milestones: Milestone[]
  personalization_rules: PersonalizationRule[]
  success_criteria: string[]
}

interface Milestone {
  id: string
  title: string
  description: string
  required_modules: string[]
  competency_threshold: number
  reward?: string
  celebration_message: string
}

interface PersonalizationRule {
  condition: string
  action: 'skip_module' | 'add_module' | 'adjust_difficulty' | 'change_pace' | 'provide_extra_support'
  target: string
  parameters?: any
}

interface UserProgress {
  user_id: string
  learning_path_id: string
  current_module?: string
  completed_modules: string[]
  module_progress: Map<string, ModuleProgress>
  milestones_achieved: string[]
  competency_scores: Map<string, number>
  learning_velocity: number
  engagement_level: number
  last_active: Date
  total_time_spent: number
  adaptations_applied: string[]
}

interface ModuleProgress {
  module_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
  progress_percentage: number
  time_spent: number
  attempts: number
  exercises_completed: string[]
  assessment_scores: number[]
  feedback: string[]
  difficulties_encountered: string[]
  adaptations_needed: string[]
}

interface LearningAnalytics {
  user_id: string
  learning_patterns: {
    preferred_time_of_day: string[]
    session_duration_average: number
    completion_rate: number
    retry_patterns: string[]
  }
  competency_development: {
    [competency: string]: {
      initial_score: number
      current_score: number
      growth_rate: number
      time_to_proficiency: number
    }
  }
  engagement_metrics: {
    active_days: number
    streak_current: number
    streak_longest: number
    interaction_quality: number
  }
  recommendations: string[]
}

/**
 * KRINS AI-Powered Onboarding Intelligence System
 */
export class KRINSOnboardingIntelligence extends EventEmitter {
  private users = new Map<string, User>()
  private learningModules = new Map<string, LearningModule>()
  private learningPaths = new Map<string, LearningPath>()
  private userProgress = new Map<string, UserProgress>()
  private analytics = new Map<string, LearningAnalytics>()
  private dataDirectory: string

  constructor() {
    super()
    this.dataDirectory = path.join(process.cwd(), 'data', 'onboarding')
    this.initialize()
  }

  private async initialize() {
    console.log('🎓 Initializing KRINS AI-Powered Onboarding Intelligence...')
    
    await fs.ensureDir(this.dataDirectory)
    
    // Load built-in learning content
    await this.loadLearningContent()
    
    // Initialize AI models for personalization
    await this.initializeAI()
    
    console.log(`✅ Onboarding Intelligence initialized with ${this.learningModules.size} modules and ${this.learningPaths.size} paths`)
  }

  /**
   * Load built-in learning content and paths
   */
  private async loadLearningContent() {
    // Core organizational intelligence modules
    const coreModules: LearningModule[] = [
      {
        id: 'intro_organizational_intelligence',
        title: 'Introduction to Organizational Intelligence',
        description: 'Understanding how decisions shape organizations and the role of institutional memory',
        type: 'tutorial',
        difficulty: 'beginner',
        duration_minutes: 45,
        prerequisites: [],
        skills_developed: ['organizational_awareness', 'decision_thinking'],
        competencies: ['organizational_intelligence_fundamentals'],
        content: {
          theory: 'Organizational intelligence is the collective ability of an organization to gather, process, and apply knowledge to make effective decisions...',
          examples: [
            {
              title: 'Netflix Architecture Evolution',
              description: 'How Netflix documented their microservices transition through ADRs',
              decisions: ['Microservices adoption', 'Technology stack choices', 'Data architecture']
            }
          ],
          exercises: [
            {
              id: 'analyze_decision_pattern',
              type: 'decision_analysis',
              title: 'Analyze a Decision Pattern',
              description: 'Review a series of related decisions and identify patterns',
              scenario: 'Your team has made 5 architecture decisions over the past year. Analyze the pattern.',
              expected_outcome: 'Identify decision themes, success patterns, and improvement opportunities',
              evaluation_criteria: ['Pattern recognition', 'Critical thinking', 'Improvement suggestions']
            }
          ]
        },
        adaptable: true,
        personalization_factors: ['role', 'experience_level', 'department']
      },
      {
        id: 'adr_fundamentals',
        title: 'Architecture Decision Records - Fundamentals',
        description: 'Learn to create, maintain, and leverage ADRs for better decision-making',
        type: 'workshop',
        difficulty: 'beginner',
        duration_minutes: 90,
        prerequisites: ['intro_organizational_intelligence'],
        skills_developed: ['adr_writing', 'decision_documentation'],
        competencies: ['adr_proficiency'],
        content: {
          theory: 'Architecture Decision Records (ADRs) are short text files that capture important architectural decisions...',
          exercises: [
            {
              id: 'create_first_adr',
              type: 'adr_creation',
              title: 'Create Your First ADR',
              description: 'Document a real decision from your team using proper ADR format',
              scenario: 'Your team needs to choose between REST and GraphQL for a new API',
              expected_outcome: 'Well-structured ADR with problem, alternatives, decision, and rationale',
              hints: ['Focus on the "why" not just the "what"', 'Include trade-offs', 'Consider future implications'],
              evaluation_criteria: ['Structure', 'Clarity', 'Rationale quality', 'Future considerations']
            }
          ],
          assessment: {
            id: 'adr_fundamentals_quiz',
            type: 'practical',
            questions: [
              {
                id: 'adr_structure',
                type: 'scenario_based',
                question: 'Given this decision scenario, create an ADR structure...',
                difficulty: 2,
                competency: 'adr_proficiency'
              }
            ],
            passing_score: 80,
            adaptive: true
          }
        },
        adaptable: true,
        personalization_factors: ['role', 'technical_background', 'writing_preference']
      },
      {
        id: 'evidence_driven_decisions',
        title: 'Evidence-Driven Decision Making',
        description: 'Learn to collect, analyze, and use evidence to improve decision outcomes',
        type: 'workshop',
        difficulty: 'intermediate',
        duration_minutes: 120,
        prerequisites: ['adr_fundamentals'],
        skills_developed: ['evidence_collection', 'data_analysis', 'outcome_tracking'],
        competencies: ['evidence_driven_thinking'],
        content: {
          exercises: [
            {
              id: 'design_evidence_plan',
              type: 'evidence_collection',
              title: 'Design an Evidence Collection Plan',
              description: 'Create a comprehensive plan for tracking decision outcomes',
              scenario: 'Your team decided to adopt microservices. Design a 6-month evidence collection plan.',
              expected_outcome: 'Detailed plan with metrics, collection methods, and evaluation criteria',
              evaluation_criteria: ['Metric selection', 'Collection feasibility', 'Evaluation approach']
            }
          ]
        },
        adaptable: true,
        personalization_factors: ['role', 'analytical_skills', 'data_comfort']
      },
      {
        id: 'stakeholder_collaboration',
        title: 'Stakeholder Collaboration in Decision Making',
        description: 'Master the art of involving stakeholders effectively in decision processes',
        type: 'simulation',
        difficulty: 'intermediate',
        duration_minutes: 100,
        prerequisites: ['adr_fundamentals'],
        skills_developed: ['stakeholder_mapping', 'collaboration', 'communication'],
        competencies: ['collaborative_decision_making'],
        content: {
          exercises: [
            {
              id: 'stakeholder_mapping_exercise',
              type: 'stakeholder_mapping',
              title: 'Map Decision Stakeholders',
              description: 'Identify and categorize all stakeholders for a complex decision',
              scenario: 'Your organization is considering a major platform migration',
              expected_outcome: 'Comprehensive stakeholder map with influence/interest analysis',
              evaluation_criteria: ['Completeness', 'Categorization accuracy', 'Influence assessment']
            }
          ]
        },
        adaptable: true,
        personalization_factors: ['role', 'communication_style', 'organization_size']
      },
      {
        id: 'decision_pattern_analysis',
        title: 'Advanced Decision Pattern Analysis',
        description: 'Learn to identify and leverage decision patterns for organizational learning',
        type: 'project',
        difficulty: 'advanced',
        duration_minutes: 180,
        prerequisites: ['evidence_driven_decisions', 'stakeholder_collaboration'],
        skills_developed: ['pattern_recognition', 'data_analysis', 'strategic_thinking'],
        competencies: ['decision_intelligence_mastery'],
        content: {
          exercises: [
            {
              id: 'analyze_organization_patterns',
              type: 'decision_analysis',
              title: 'Analyze Your Organization\'s Decision Patterns',
              description: 'Conduct a comprehensive analysis of decision patterns in your organization',
              scenario: 'Analyze the last 20 architectural decisions in your organization',
              expected_outcome: 'Pattern analysis report with insights and recommendations',
              evaluation_criteria: ['Pattern identification', 'Analysis depth', 'Actionable insights', 'Presentation quality']
            }
          ]
        },
        adaptable: true,
        personalization_factors: ['experience_level', 'analytical_depth', 'leadership_role']
      }
    ]

    // Store modules
    coreModules.forEach(module => {
      this.learningModules.set(module.id, module)
    })

    // Define learning paths for different roles
    const learningPaths: LearningPath[] = [
      {
        id: 'architect_foundation',
        title: 'Solution Architect - Organizational Intelligence Foundation',
        description: 'Comprehensive path for solution architects to master organizational decision-making',
        target_role: 'architect',
        target_level: 'all',
        estimated_duration_days: 14,
        modules: [
          'intro_organizational_intelligence',
          'adr_fundamentals', 
          'evidence_driven_decisions',
          'stakeholder_collaboration',
          'decision_pattern_analysis'
        ],
        milestones: [
          {
            id: 'first_adr_milestone',
            title: 'First ADR Master',
            description: 'Successfully created and documented your first high-quality ADR',
            required_modules: ['adr_fundamentals'],
            competency_threshold: 80,
            celebration_message: '🎉 Congratulations! You\'ve mastered ADR fundamentals. Ready for more advanced topics!'
          },
          {
            id: 'evidence_master_milestone', 
            title: 'Evidence-Driven Decision Master',
            description: 'Demonstrated proficiency in evidence-based decision making',
            required_modules: ['evidence_driven_decisions'],
            competency_threshold: 85,
            celebration_message: '📊 Excellent! You\'re now equipped with evidence-driven decision making skills!'
          }
        ],
        personalization_rules: [
          {
            condition: 'experience_level === "expert"',
            action: 'skip_module',
            target: 'intro_organizational_intelligence'
          },
          {
            condition: 'department === "platform"',
            action: 'add_module',
            target: 'platform_specific_decisions'
          }
        ],
        success_criteria: [
          'Complete all core modules with 80%+ scores',
          'Create 3 real-world ADRs',
          'Demonstrate evidence collection in practice',
          'Successfully collaborate on team decision'
        ]
      },
      {
        id: 'developer_essentials',
        title: 'Developer - Decision Making Essentials',
        description: 'Essential organizational intelligence skills for developers',
        target_role: 'developer',
        target_level: 'all',
        estimated_duration_days: 7,
        modules: [
          'intro_organizational_intelligence',
          'adr_fundamentals',
          'stakeholder_collaboration'
        ],
        milestones: [
          {
            id: 'dev_adr_milestone',
            title: 'Developer ADR Contributor',
            description: 'Can effectively contribute to ADR creation and review processes',
            required_modules: ['adr_fundamentals'],
            competency_threshold: 75,
            celebration_message: '👨‍💻 Great job! You can now contribute effectively to team decision processes!'
          }
        ],
        personalization_rules: [
          {
            condition: 'experience_level === "junior"',
            action: 'adjust_difficulty',
            target: 'all_modules',
            parameters: { reduce_complexity: true, add_mentoring: true }
          }
        ],
        success_criteria: [
          'Understand ADR process and purpose',
          'Can review ADRs effectively',
          'Contribute meaningfully to decision discussions'
        ]
      },
      {
        id: 'manager_leadership',
        title: 'Engineering Manager - Decision Leadership',
        description: 'Leadership-focused path for engineering managers',
        target_role: 'manager',
        target_level: 'all', 
        estimated_duration_days: 10,
        modules: [
          'intro_organizational_intelligence',
          'adr_fundamentals',
          'stakeholder_collaboration',
          'decision_pattern_analysis'
        ],
        milestones: [
          {
            id: 'leader_stakeholder_milestone',
            title: 'Stakeholder Collaboration Master',
            description: 'Demonstrated excellence in facilitating multi-stakeholder decisions',
            required_modules: ['stakeholder_collaboration'],
            competency_threshold: 90,
            celebration_message: '👑 Outstanding! You\'ve mastered the art of collaborative decision making!'
          }
        ],
        personalization_rules: [
          {
            condition: 'team_size > 10',
            action: 'add_module',
            target: 'large_team_decision_scaling'
          }
        ],
        success_criteria: [
          'Lead team through complex decision process',
          'Establish decision-making culture in team',
          'Scale decision processes effectively'
        ]
      }
    ]

    // Store learning paths
    learningPaths.forEach(path => {
      this.learningPaths.set(path.id, path)
    })

    console.log(`📚 Loaded ${coreModules.length} learning modules and ${learningPaths.length} learning paths`)
  }

  /**
   * Initialize AI models for personalization
   */
  private async initializeAI() {
    // Mock AI initialization - in real implementation, this would load ML models
    console.log('🧠 AI personalization models initialized')
  }

  /**
   * Create personalized onboarding plan for a user
   */
  public async createPersonalizedOnboarding(user: User): Promise<LearningPath> {
    console.log(`🎯 Creating personalized onboarding for ${user.name} (${user.role})`)

    // Find best matching learning path
    const basePath = this.findBestLearningPath(user)
    
    if (!basePath) {
      throw new Error(`No suitable learning path found for role: ${user.role}`)
    }

    // Personalize the path based on user characteristics
    const personalizedPath = await this.personalizelearningPath(basePath, user)

    // Initialize user progress tracking
    const progress: UserProgress = {
      user_id: user.id,
      learning_path_id: personalizedPath.id,
      completed_modules: [],
      module_progress: new Map(),
      milestones_achieved: [],
      competency_scores: new Map(),
      learning_velocity: 1.0,
      engagement_level: 0.5,
      last_active: new Date(),
      total_time_spent: 0,
      adaptations_applied: []
    }

    this.userProgress.set(user.id, progress)
    this.users.set(user.id, user)

    // Initialize analytics
    this.initializeUserAnalytics(user.id)

    // Emit event
    this.emit('onboarding_created', { user, learningPath: personalizedPath })

    console.log(`✅ Personalized onboarding created for ${user.name}: ${personalizedPath.title}`)
    return personalizedPath
  }

  /**
   * Find best learning path for user
   */
  private findBestLearningPath(user: User): LearningPath | null {
    const paths = Array.from(this.learningPaths.values())
    
    // Score paths based on role and level match
    const scoredPaths = paths.map(path => {
      let score = 0
      
      // Role match
      if (path.target_role === user.role || path.target_role === 'all') {
        score += 100
      }
      
      // Level consideration
      if (path.target_level === user.experience_level || path.target_level === 'all') {
        score += 50
      }
      
      return { path, score }
    })

    // Return highest scoring path
    const bestMatch = scoredPaths.sort((a, b) => b.score - a.score)[0]
    return bestMatch?.path || null
  }

  /**
   * Personalize learning path based on user characteristics
   */
  private async personalizelearningPath(basePath: LearningPath, user: User): Promise<LearningPath> {
    const personalizedPath = JSON.parse(JSON.stringify(basePath)) // Deep clone

    // Apply personalization rules
    for (const rule of basePath.personalization_rules) {
      if (this.evaluatePersonalizationCondition(rule.condition, user)) {
        await this.applyPersonalizationAction(rule, personalizedPath, user)
      }
    }

    // Adjust based on learning preferences
    await this.adjustForLearningPreferences(personalizedPath, user)

    personalizedPath.id = `${basePath.id}_personalized_${user.id}`
    personalizedPath.title = `${personalizedPath.title} (Personalized for ${user.name})`

    return personalizedPath
  }

  /**
   * Evaluate personalization condition
   */
  private evaluatePersonalizationCondition(condition: string, user: User): boolean {
    // Simple condition evaluation - in real implementation, use a proper expression evaluator
    try {
      const context = {
        experience_level: user.experience_level,
        role: user.role,
        department: user.department,
        skills: user.skills
      }
      
      // Basic condition checking
      if (condition.includes('experience_level')) {
        return condition.includes(user.experience_level)
      }
      if (condition.includes('department')) {
        return condition.includes(user.department)
      }
      if (condition.includes('role')) {
        return condition.includes(user.role)
      }
      
      return false
    } catch (error) {
      console.warn(`Failed to evaluate condition: ${condition}`, error)
      return false
    }
  }

  /**
   * Apply personalization action
   */
  private async applyPersonalizationAction(rule: PersonalizationRule, path: LearningPath, user: User) {
    switch (rule.action) {
      case 'skip_module':
        path.modules = path.modules.filter(m => m !== rule.target)
        console.log(`⏭️ Skipped module ${rule.target} for ${user.name}`)
        break
        
      case 'add_module':
        if (!path.modules.includes(rule.target)) {
          path.modules.push(rule.target)
          console.log(`➕ Added module ${rule.target} for ${user.name}`)
        }
        break
        
      case 'adjust_difficulty':
        // Mark for difficulty adjustment during module delivery
        console.log(`🔧 Marked difficulty adjustment for ${user.name}`)
        break
        
      case 'change_pace':
        // Adjust estimated duration based on pace preference
        const paceMultiplier = user.learning_preferences.pace === 'fast' ? 0.7 : 
                              user.learning_preferences.pace === 'slow' ? 1.5 : 1.0
        path.estimated_duration_days = Math.ceil(path.estimated_duration_days * paceMultiplier)
        console.log(`⏱️ Adjusted pace for ${user.name}: ${path.estimated_duration_days} days`)
        break
    }
  }

  /**
   * Adjust for learning preferences
   */
  private async adjustForLearningPreferences(path: LearningPath, user: User) {
    // Adjust module order based on preferences
    if (user.learning_preferences.style === 'hands-on') {
      // Prioritize workshop and simulation modules
      path.modules.sort((a, b) => {
        const moduleA = this.learningModules.get(a)
        const moduleB = this.learningModules.get(b)
        
        if (!moduleA || !moduleB) return 0
        
        const handsOnTypes = ['workshop', 'simulation', 'project']
        const aIsHandsOn = handsOnTypes.includes(moduleA.type)
        const bIsHandsOn = handsOnTypes.includes(moduleB.type)
        
        if (aIsHandsOn && !bIsHandsOn) return -1
        if (!aIsHandsOn && bIsHandsOn) return 1
        return 0
      })
    }
  }

  /**
   * Initialize user analytics
   */
  private initializeUserAnalytics(userId: string) {
    const analytics: LearningAnalytics = {
      user_id: userId,
      learning_patterns: {
        preferred_time_of_day: [],
        session_duration_average: 0,
        completion_rate: 0,
        retry_patterns: []
      },
      competency_development: {},
      engagement_metrics: {
        active_days: 0,
        streak_current: 0,
        streak_longest: 0,
        interaction_quality: 0
      },
      recommendations: []
    }

    this.analytics.set(userId, analytics)
  }

  /**
   * Get next module for user
   */
  public getNextModule(userId: string): LearningModule | null {
    const progress = this.userProgress.get(userId)
    if (!progress) return null

    const path = this.learningPaths.get(progress.learning_path_id)
    if (!path) return null

    // Find next uncompleted module
    for (const moduleId of path.modules) {
      if (!progress.completed_modules.includes(moduleId)) {
        const module = this.learningModules.get(moduleId)
        if (module) {
          // Apply any needed personalizations
          return this.personalizeModule(module, userId)
        }
      }
    }

    return null // All modules completed
  }

  /**
   * Personalize module for specific user
   */
  private personalizeModule(module: LearningModule, userId: string): LearningModule {
    const user = this.users.get(userId)
    if (!user || !module.adaptable) return module

    const personalizedModule = JSON.parse(JSON.stringify(module)) // Deep clone

    // Adjust difficulty based on user level
    if (user.experience_level === 'junior') {
      personalizedModule.content.exercises?.forEach(exercise => {
        if (exercise.hints) {
          exercise.hints.push('Take your time and don\'t hesitate to ask for help')
        }
      })
    }

    // Adjust examples based on department
    if (personalizedModule.content.examples) {
      personalizedModule.content.examples = personalizedModule.content.examples.filter(example => {
        // Include more relevant examples based on user's context
        return true // For now, include all examples
      })
    }

    return personalizedModule
  }

  /**
   * Record module completion
   */
  public async recordModuleCompletion(userId: string, moduleId: string, score: number, timeSpent: number, feedback?: string): Promise<void> {
    const progress = this.userProgress.get(userId)
    if (!progress) {
      throw new Error(`No progress found for user: ${userId}`)
    }

    // Update module progress
    const moduleProgress: ModuleProgress = {
      module_id: moduleId,
      status: score >= 80 ? 'mastered' : score >= 60 ? 'completed' : 'in_progress',
      progress_percentage: 100,
      time_spent: timeSpent,
      attempts: (progress.module_progress.get(moduleId)?.attempts || 0) + 1,
      exercises_completed: [], // Would track individual exercises
      assessment_scores: [score],
      feedback: feedback ? [feedback] : [],
      difficulties_encountered: [],
      adaptations_needed: []
    }

    progress.module_progress.set(moduleId, moduleProgress)

    // Update completion if successful
    if (moduleProgress.status === 'completed' || moduleProgress.status === 'mastered') {
      if (!progress.completed_modules.includes(moduleId)) {
        progress.completed_modules.push(moduleId)
      }
    }

    // Update overall progress
    progress.total_time_spent += timeSpent
    progress.last_active = new Date()

    // Check for milestone achievements
    await this.checkMilestoneAchievements(userId)

    // Update analytics
    await this.updateLearningAnalytics(userId, moduleId, score, timeSpent)

    // Emit completion event
    this.emit('module_completed', {
      userId,
      moduleId,
      score,
      timeSpent,
      status: moduleProgress.status
    })

    console.log(`📖 Module completed: ${moduleId} by ${userId} (score: ${score})`)
  }

  /**
   * Check and award milestone achievements
   */
  private async checkMilestoneAchievements(userId: string): Promise<void> {
    const progress = this.userProgress.get(userId)
    const path = this.learningPaths.get(progress?.learning_path_id || '')
    
    if (!progress || !path) return

    for (const milestone of path.milestones) {
      // Skip if already achieved
      if (progress.milestones_achieved.includes(milestone.id)) continue

      // Check if requirements are met
      const requiredModulesCompleted = milestone.required_modules.every(
        moduleId => progress.completed_modules.includes(moduleId)
      )

      if (requiredModulesCompleted) {
        // Check competency threshold if applicable
        let competencyMet = true
        if (milestone.competency_threshold > 0) {
          const relevantScores = Array.from(progress.module_progress.values())
            .filter(mp => milestone.required_modules.includes(mp.module_id))
            .flatMap(mp => mp.assessment_scores)
          
          const averageScore = relevantScores.length > 0 
            ? relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length
            : 0

          competencyMet = averageScore >= milestone.competency_threshold
        }

        if (competencyMet) {
          progress.milestones_achieved.push(milestone.id)
          
          // Emit milestone achievement
          this.emit('milestone_achieved', {
            userId,
            milestone,
            celebrationMessage: milestone.celebration_message
          })

          console.log(`🏆 Milestone achieved: ${milestone.title} by ${userId}`)
        }
      }
    }
  }

  /**
   * Update learning analytics
   */
  private async updateLearningAnalytics(userId: string, moduleId: string, score: number, timeSpent: number): Promise<void> {
    const analytics = this.analytics.get(userId)
    if (!analytics) return

    // Update completion rate
    const progress = this.userProgress.get(userId)
    if (progress) {
      const path = this.learningPaths.get(progress.learning_path_id)
      if (path) {
        analytics.learning_patterns.completion_rate = 
          progress.completed_modules.length / path.modules.length
      }
    }

    // Update session duration
    if (analytics.learning_patterns.session_duration_average === 0) {
      analytics.learning_patterns.session_duration_average = timeSpent
    } else {
      analytics.learning_patterns.session_duration_average = 
        (analytics.learning_patterns.session_duration_average + timeSpent) / 2
    }

    // Update engagement
    analytics.engagement_metrics.active_days += 1
    
    // Generate recommendations
    analytics.recommendations = await this.generatePersonalizedRecommendations(userId)
  }

  /**
   * Generate personalized recommendations
   */
  private async generatePersonalizedRecommendations(userId: string): Promise<string[]> {
    const progress = this.userProgress.get(userId)
    const analytics = this.analytics.get(userId)
    
    if (!progress || !analytics) return []

    const recommendations: string[] = []

    // Based on completion rate
    if (analytics.learning_patterns.completion_rate < 0.5) {
      recommendations.push('Consider breaking learning sessions into smaller chunks for better retention')
    }

    // Based on score patterns
    const recentScores = Array.from(progress.module_progress.values())
      .flatMap(mp => mp.assessment_scores)
      .slice(-3)
    
    if (recentScores.length > 0) {
      const averageRecentScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      
      if (averageRecentScore < 70) {
        recommendations.push('Review previous modules to strengthen foundational knowledge')
      } else if (averageRecentScore > 90) {
        recommendations.push('You\'re excelling! Consider exploring advanced topics or mentoring others')
      }
    }

    // Time-based recommendations
    if (analytics.learning_patterns.session_duration_average > 120) {
      recommendations.push('Consider shorter, more frequent learning sessions for better focus')
    }

    return recommendations
  }

  /**
   * Get user progress summary
   */
  public getUserProgressSummary(userId: string) {
    const progress = this.userProgress.get(userId)
    const analytics = this.analytics.get(userId)
    const user = this.users.get(userId)
    
    if (!progress || !analytics || !user) return null

    const path = this.learningPaths.get(progress.learning_path_id)
    
    return {
      user,
      learningPath: path,
      progress: {
        modulesCompleted: progress.completed_modules.length,
        totalModules: path?.modules.length || 0,
        completionPercentage: path ? (progress.completed_modules.length / path.modules.length) * 100 : 0,
        milestonesAchieved: progress.milestones_achieved.length,
        totalTimeSpent: progress.total_time_spent,
        lastActive: progress.last_active
      },
      analytics: {
        completionRate: analytics.learning_patterns.completion_rate,
        averageSessionDuration: analytics.learning_patterns.session_duration_average,
        engagementLevel: analytics.engagement_metrics.interaction_quality,
        currentStreak: analytics.engagement_metrics.streak_current
      },
      recommendations: analytics.recommendations,
      nextModule: this.getNextModule(userId)
    }
  }

  /**
   * Get all learning paths
   */
  public getAllLearningPaths(): LearningPath[] {
    return Array.from(this.learningPaths.values())
  }

  /**
   * Get all learning modules
   */
  public getAllLearningModules(): LearningModule[] {
    return Array.from(this.learningModules.values())
  }

  /**
   * Get learning analytics for all users
   */
  public getSystemAnalytics() {
    const allProgress = Array.from(this.userProgress.values())
    const allAnalytics = Array.from(this.analytics.values())

    return {
      totalUsers: this.users.size,
      activeUsers: allProgress.filter(p => {
        const daysSinceActive = (Date.now() - p.last_active.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceActive <= 7
      }).length,
      averageCompletionRate: allAnalytics.length > 0 
        ? allAnalytics.reduce((sum, a) => sum + a.learning_patterns.completion_rate, 0) / allAnalytics.length
        : 0,
      totalModulesCompleted: allProgress.reduce((sum, p) => sum + p.completed_modules.length, 0),
      totalLearningTime: allProgress.reduce((sum, p) => sum + p.total_time_spent, 0),
      popularModules: this.getPopularModules(),
      learningPaths: this.learningPaths.size,
      modules: this.learningModules.size
    }
  }

  /**
   * Get most popular modules
   */
  private getPopularModules() {
    const moduleCompletions = new Map<string, number>()
    
    Array.from(this.userProgress.values()).forEach(progress => {
      progress.completed_modules.forEach(moduleId => {
        moduleCompletions.set(moduleId, (moduleCompletions.get(moduleId) || 0) + 1)
      })
    })

    return Array.from(moduleCompletions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([moduleId, count]) => ({
        module: this.learningModules.get(moduleId),
        completions: count
      }))
  }
}

export default KRINSOnboardingIntelligence