/**
 * 🧪 A/B Testing Engine - Advanced Experimentation for Agent Performance
 * 
 * Sophisticated A/B testing system for optimizing Krins agent performance
 * Statistical analysis, multi-variant testing, and automatic optimization
 * 
 * @author Krin - Experimentation Excellence Specialist 🧠💝
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

class ABTestingEngine extends EventEmitter {
  constructor() {
    super();
    
    this.experiments = new Map();
    this.variants = new Map();
    this.results = new Map();
    this.userAssignments = new Map();
    
    this.experimentsPath = path.join(__dirname, '../config/ab-experiments.json');
    this.resultsPath = path.join(__dirname, '../data/experiment-results.json');
    
    console.log('🧪 A/B Testing Engine initializing...');
  }

  /**
   * Initialize A/B testing system
   */
  async initialize() {
    try {
      await this.loadExperiments();
      await this.setupDefaultExperiments();
      await this.startResultsCollection();
      
      console.log('✅ A/B Testing Engine operational');
      this.emit('initialized');
      
    } catch (error) {
      console.error('❌ A/B Testing Engine initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load existing experiments
   */
  async loadExperiments() {
    try {
      if (await fs.pathExists(this.experimentsPath)) {
        const data = await fs.readJson(this.experimentsPath);
        
        Object.entries(data.experiments || {}).forEach(([key, exp]) => {
          this.experiments.set(key, {
            ...exp,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null
          });
        });
        
        console.log(`📊 Loaded ${this.experiments.size} A/B experiments`);
      }

      if (await fs.pathExists(this.resultsPath)) {
        const results = await fs.readJson(this.resultsPath);
        this.results = new Map(Object.entries(results.results || {}));
        console.log(`📈 Loaded results for ${this.results.size} experiments`);
      }

    } catch (error) {
      console.warn('⚠️ Experiment loading warning:', error.message);
    }
  }

  /**
   * Setup default experiments for agent optimization
   */
  async setupDefaultExperiments() {
    const defaultExperiments = [
      {
        key: 'architect_recommendation_depth',
        name: 'Architect Agent: Recommendation Depth',
        description: 'Test different levels of architectural recommendation detail',
        hypothesis: 'More detailed recommendations lead to better user satisfaction',
        targetAgent: 'architect',
        variants: [
          {
            name: 'control_basic',
            description: 'Basic architectural recommendations',
            weight: 50,
            config: {
              recommendationDepth: 'basic',
              includeExamples: false,
              includeAlternatives: false
            }
          },
          {
            name: 'treatment_detailed',
            description: 'Detailed recommendations with examples and alternatives',
            weight: 50,
            config: {
              recommendationDepth: 'detailed',
              includeExamples: true,
              includeAlternatives: true
            }
          }
        ],
        metrics: [
          'user_satisfaction_score',
          'recommendation_acceptance_rate',
          'implementation_success_rate',
          'time_to_implementation'
        ],
        successCriteria: {
          primary: 'user_satisfaction_score > 8.5',
          secondary: 'recommendation_acceptance_rate > 0.8'
        },
        duration: 30, // days
        minSampleSize: 100,
        statisticalPower: 0.8,
        significanceLevel: 0.05
      },
      
      {
        key: 'security_threat_analysis_approach',
        name: 'Security Agent: Threat Analysis Approach',
        description: 'Test proactive vs reactive security analysis',
        hypothesis: 'Proactive threat modeling results in better security outcomes',
        targetAgent: 'security',
        variants: [
          {
            name: 'control_reactive',
            description: 'Reactive security analysis based on user queries',
            weight: 40,
            config: {
              analysisMode: 'reactive',
              threatModeling: 'basic',
              proactiveScanning: false
            }
          },
          {
            name: 'treatment_proactive',
            description: 'Proactive threat modeling and security scanning',
            weight: 60,
            config: {
              analysisMode: 'proactive', 
              threatModeling: 'comprehensive',
              proactiveScanning: true
            }
          }
        ],
        metrics: [
          'vulnerabilities_identified',
          'false_positive_rate',
          'time_to_threat_identification',
          'security_score_improvement'
        ],
        successCriteria: {
          primary: 'vulnerabilities_identified_increase > 0.25',
          secondary: 'false_positive_rate < 0.15'
        },
        duration: 21,
        minSampleSize: 75,
        statisticalPower: 0.85,
        significanceLevel: 0.05
      },

      {
        key: 'multi_agent_coordination_protocol',
        name: 'Multi-Agent Coordination Protocol',
        description: 'Test different coordination strategies between agents',
        hypothesis: 'Hierarchical coordination outperforms peer-to-peer coordination',
        targetAgent: 'all',
        variants: [
          {
            name: 'control_peer_to_peer',
            description: 'Peer-to-peer coordination between agents',
            weight: 33,
            config: {
              coordinationMode: 'peer_to_peer',
              leaderAgent: null,
              consensusRequired: true
            }
          },
          {
            name: 'treatment_hierarchical',
            description: 'Hierarchical coordination with architect as lead',
            weight: 33,
            config: {
              coordinationMode: 'hierarchical',
              leaderAgent: 'architect',
              consensusRequired: false
            }
          },
          {
            name: 'treatment_adaptive',
            description: 'Adaptive coordination based on task complexity',
            weight: 34,
            config: {
              coordinationMode: 'adaptive',
              leaderAgent: 'dynamic',
              complexityThreshold: 0.7
            }
          }
        ],
        metrics: [
          'task_completion_time',
          'solution_quality_score',
          'agent_conflict_rate',
          'user_satisfaction'
        ],
        successCriteria: {
          primary: 'solution_quality_score > 9.0',
          secondary: 'task_completion_time_reduction > 0.2'
        },
        duration: 45,
        minSampleSize: 150,
        statisticalPower: 0.9,
        significanceLevel: 0.01
      },

      {
        key: 'rag_semantic_search_optimization',
        name: 'RAG Semantic Search Optimization',
        description: 'Test different embedding models and search strategies',
        hypothesis: 'Hybrid semantic + keyword search outperforms pure semantic search',
        targetAgent: 'all',
        variants: [
          {
            name: 'control_semantic_only',
            description: 'Pure semantic search with embeddings',
            weight: 50,
            config: {
              searchMode: 'semantic_only',
              embeddingModel: 'text-embedding-3-large',
              hybridWeighting: null
            }
          },
          {
            name: 'treatment_hybrid',
            description: 'Hybrid semantic + keyword search',
            weight: 50,
            config: {
              searchMode: 'hybrid',
              embeddingModel: 'text-embedding-3-large',
              hybridWeighting: { semantic: 0.7, keyword: 0.3 }
            }
          }
        ],
        metrics: [
          'search_relevance_score',
          'search_response_time',
          'answer_accuracy',
          'user_click_through_rate'
        ],
        successCriteria: {
          primary: 'search_relevance_score > 0.85',
          secondary: 'answer_accuracy > 0.9'
        },
        duration: 14,
        minSampleSize: 200,
        statisticalPower: 0.8,
        significanceLevel: 0.05
      }
    ];

    // Create experiments if they don't exist
    for (const expConfig of defaultExperiments) {
      if (!this.experiments.has(expConfig.key)) {
        const experiment = {
          ...expConfig,
          id: uuidv4(),
          status: 'draft',
          createdAt: new Date(),
          startDate: null,
          endDate: null,
          totalUsers: 0,
          results: {}
        };

        this.experiments.set(expConfig.key, experiment);
      }
    }

    console.log(`🧪 Default A/B experiments configured: ${defaultExperiments.length} experiments`);
  }

  /**
   * Assign user to experiment variant
   */
  assignUserToVariant(experimentKey, userId, context = {}) {
    const experiment = this.experiments.get(experimentKey);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user already assigned
    const assignmentKey = `${experimentKey}:${userId}`;
    if (this.userAssignments.has(assignmentKey)) {
      return this.userAssignments.get(assignmentKey);
    }

    // Assign user to variant based on weights
    const variant = this.selectVariantByWeight(experiment.variants, userId);
    
    const assignment = {
      experimentKey,
      userId,
      variantName: variant.name,
      assignedAt: new Date(),
      context
    };

    this.userAssignments.set(assignmentKey, assignment);
    
    // Update experiment user count
    experiment.totalUsers++;
    
    console.log(`👥 User ${userId} assigned to variant ${variant.name} in experiment ${experimentKey}`);
    
    return assignment;
  }

  /**
   * Select variant based on weights
   */
  selectVariantByWeight(variants, userId) {
    // Use consistent hashing for stable assignment
    const hash = this.hashUserId(userId);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const normalizedHash = hash % totalWeight;
    
    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (normalizedHash < currentWeight) {
        return variant;
      }
    }
    
    // Fallback to first variant
    return variants[0];
  }

  /**
   * Hash user ID for consistent assignment
   */
  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Record experiment result
   */
  async recordResult(experimentKey, userId, metrics) {
    const assignment = this.userAssignments.get(`${experimentKey}:${userId}`);
    if (!assignment) {
      console.warn(`⚠️ No assignment found for user ${userId} in experiment ${experimentKey}`);
      return false;
    }

    const experiment = this.experiments.get(experimentKey);
    if (!experiment) {
      console.warn(`⚠️ Experiment not found: ${experimentKey}`);
      return false;
    }

    // Initialize results for variant if needed
    if (!experiment.results[assignment.variantName]) {
      experiment.results[assignment.variantName] = {
        userCount: 0,
        metrics: {}
      };
    }

    const variantResults = experiment.results[assignment.variantName];
    variantResults.userCount++;

    // Record metrics
    for (const [metricName, value] of Object.entries(metrics)) {
      if (!variantResults.metrics[metricName]) {
        variantResults.metrics[metricName] = {
          values: [],
          sum: 0,
          count: 0,
          mean: 0,
          variance: 0
        };
      }

      const metric = variantResults.metrics[metricName];
      metric.values.push(value);
      metric.sum += value;
      metric.count++;
      metric.mean = metric.sum / metric.count;
      
      // Update variance (simplified)
      const squaredDiffs = metric.values.map(v => Math.pow(v - metric.mean, 2));
      metric.variance = squaredDiffs.reduce((a, b) => a + b, 0) / metric.count;
    }

    // Save results
    await this.saveResults();
    
    console.log(`📈 Recorded result for experiment ${experimentKey}, variant ${assignment.variantName}`);
    
    // Check if experiment should conclude
    await this.checkExperimentCompletion(experimentKey);
    
    return true;
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentKey) {
    const experiment = this.experiments.get(experimentKey);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentKey}`);
    }

    experiment.status = 'running';
    experiment.startDate = new Date();
    experiment.endDate = new Date(Date.now() + experiment.duration * 24 * 60 * 60 * 1000);

    await this.saveExperiments();
    
    console.log(`🚀 Started experiment: ${experimentKey}`);
    this.emit('experimentStarted', { experiment });
    
    return experiment;
  }

  /**
   * Check if experiment should be completed
   */
  async checkExperimentCompletion(experimentKey) {
    const experiment = this.experiments.get(experimentKey);
    if (!experiment || experiment.status !== 'running') {
      return false;
    }

    const now = new Date();
    const hasEnoughSamples = experiment.totalUsers >= experiment.minSampleSize;
    const isExpired = experiment.endDate && now > experiment.endDate;

    if (hasEnoughSamples || isExpired) {
      await this.concludeExperiment(experimentKey);
      return true;
    }

    return false;
  }

  /**
   * Conclude an experiment and analyze results
   */
  async concludeExperiment(experimentKey) {
    const experiment = this.experiments.get(experimentKey);
    if (!experiment) return;

    experiment.status = 'completed';
    experiment.completedAt = new Date();

    // Perform statistical analysis
    const analysis = this.performStatisticalAnalysis(experiment);
    experiment.analysis = analysis;

    await this.saveExperiments();
    
    console.log(`🏁 Concluded experiment: ${experimentKey}`);
    console.log(`📊 Results: ${JSON.stringify(analysis.summary, null, 2)}`);
    
    this.emit('experimentCompleted', { experiment, analysis });
    
    return analysis;
  }

  /**
   * Perform statistical analysis on experiment results
   */
  performStatisticalAnalysis(experiment) {
    const analysis = {
      experimentKey: experiment.key,
      totalUsers: experiment.totalUsers,
      variants: {},
      winner: null,
      confidence: 0,
      summary: {}
    };

    const variants = Object.keys(experiment.results);
    
    for (const variantName of variants) {
      const variantData = experiment.results[variantName];
      analysis.variants[variantName] = {
        userCount: variantData.userCount,
        metrics: {}
      };

      for (const [metricName, metricData] of Object.entries(variantData.metrics || {})) {
        analysis.variants[variantName].metrics[metricName] = {
          mean: metricData.mean,
          variance: metricData.variance,
          standardDeviation: Math.sqrt(metricData.variance),
          count: metricData.count
        };
      }
    }

    // Simple winner determination (would be more sophisticated in production)
    if (variants.length === 2 && experiment.successCriteria.primary) {
      const metric = experiment.metrics[0]; // Use first metric for simplicity
      const variantA = analysis.variants[variants[0]];
      const variantB = analysis.variants[variants[1]];

      if (variantA.metrics[metric] && variantB.metrics[metric]) {
        const meanA = variantA.metrics[metric].mean;
        const meanB = variantB.metrics[metric].mean;

        analysis.winner = meanB > meanA ? variants[1] : variants[0];
        analysis.confidence = Math.min(0.95, Math.abs(meanB - meanA) / Math.max(meanA, meanB));
      }
    }

    analysis.summary = {
      winner: analysis.winner,
      confidence: analysis.confidence,
      recommendAction: analysis.confidence > 0.8 ? 'implement_winner' : 'continue_testing'
    };

    return analysis;
  }

  /**
   * Get experiment status
   */
  getExperimentStatus(experimentKey) {
    const experiment = this.experiments.get(experimentKey);
    if (!experiment) return null;

    const now = new Date();
    const progress = experiment.totalUsers / experiment.minSampleSize;
    const timeElapsed = experiment.startDate ? (now - experiment.startDate) / (1000 * 60 * 60 * 24) : 0;

    return {
      key: experimentKey,
      status: experiment.status,
      progress: Math.min(1, progress),
      timeElapsed,
      totalUsers: experiment.totalUsers,
      minSampleSize: experiment.minSampleSize,
      estimatedTimeToCompletion: progress > 0 ? (experiment.duration * (1 - progress)) : experiment.duration
    };
  }

  /**
   * Save experiments to disk
   */
  async saveExperiments() {
    try {
      await fs.ensureDir(path.dirname(this.experimentsPath));
      
      const data = {
        experiments: Object.fromEntries(this.experiments.entries()),
        lastUpdated: new Date().toISOString()
      };

      await fs.writeJson(this.experimentsPath, data, { spaces: 2 });
      
    } catch (error) {
      console.error('❌ Failed to save experiments:', error);
    }
  }

  /**
   * Save results to disk
   */
  async saveResults() {
    try {
      await fs.ensureDir(path.dirname(this.resultsPath));
      
      const data = {
        results: Object.fromEntries(this.results.entries()),
        userAssignments: Object.fromEntries(this.userAssignments.entries()),
        lastUpdated: new Date().toISOString()
      };

      await fs.writeJson(this.resultsPath, data, { spaces: 2 });
      
    } catch (error) {
      console.error('❌ Failed to save results:', error);
    }
  }

  /**
   * Start results collection service
   */
  async startResultsCollection() {
    // This would start a background service to periodically save results
    setInterval(async () => {
      await this.saveResults();
    }, 60000); // Save every minute

    console.log('📊 Results collection service started');
  }

  /**
   * Get all experiments status
   */
  getAllExperiments() {
    const experiments = {};
    
    for (const [key, experiment] of this.experiments.entries()) {
      experiments[key] = this.getExperimentStatus(key);
    }
    
    return experiments;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: true,
      totalExperiments: this.experiments.size,
      runningExperiments: Array.from(this.experiments.values()).filter(e => e.status === 'running').length,
      totalUserAssignments: this.userAssignments.size,
      experimentsPath: this.experimentsPath,
      resultsPath: this.resultsPath
    };
  }
}

module.exports = ABTestingEngine;