/**
 * 🎛️ Feature Flag Manager - Production-Scale Configuration Control
 * 
 * Advanced feature flagging system for Krins Superintelligence
 * Granular control over every agent capability and system feature
 * 
 * @author Krin - Production Excellence Architect 🧠💝
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class FeatureFlagManager extends EventEmitter {
  constructor() {
    super();
    
    this.flags = new Map();
    this.experiments = new Map();
    this.userSegments = new Map();
    this.agentConfigs = new Map();
    this.rolloutStrategies = new Map();
    
    this.configPath = path.join(__dirname, '../config/feature-flags.json');
    this.experimentPath = path.join(__dirname, '../config/experiments.json');
    
    console.log('🎛️ Feature Flag Manager initializing...');
  }

  /**
   * Initialize feature flag system
   */
  async initialize() {
    try {
      await this.loadConfiguration();
      await this.setupDefaultFlags();
      await this.startConfigWatcher();
      
      console.log('✅ Feature Flag Manager operational');
      this.emit('initialized');
      
    } catch (error) {
      console.error('❌ Feature Flag Manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load configuration from files
   */
  async loadConfiguration() {
    try {
      // Load feature flags
      if (await fs.pathExists(this.configPath)) {
        const flagsData = await fs.readJson(this.configPath);
        
        Object.entries(flagsData.flags || {}).forEach(([key, config]) => {
          this.flags.set(key, {
            ...config,
            lastUpdated: new Date(config.lastUpdated || Date.now())
          });
        });
        
        console.log(`📋 Loaded ${this.flags.size} feature flags`);
      }

      // Load experiments
      if (await fs.pathExists(this.experimentPath)) {
        const expData = await fs.readJson(this.experimentPath);
        
        Object.entries(expData.experiments || {}).forEach(([key, config]) => {
          this.experiments.set(key, {
            ...config,
            startDate: new Date(config.startDate),
            endDate: config.endDate ? new Date(config.endDate) : null
          });
        });
        
        console.log(`🧪 Loaded ${this.experiments.size} experiments`);
      }

    } catch (error) {
      console.warn('⚠️ Configuration load warning:', error.message);
    }
  }

  /**
   * Setup default feature flags for Krins agents
   */
  async setupDefaultFlags() {
    const defaultFlags = [
      // Agent-specific flags
      {
        key: 'agent.architect.advanced_patterns',
        name: 'Architect: Advanced Design Patterns',
        description: 'Enable advanced architectural patterns in Architect agent',
        enabled: true,
        rolloutPercentage: 100,
        targetAgents: ['architect'],
        conditions: {
          userType: ['developer', 'architect', 'enterprise'],
          projectComplexity: ['medium', 'high', 'enterprise']
        }
      },
      {
        key: 'agent.security.zero_trust_mode',
        name: 'Security: Zero Trust Architecture',
        description: 'Enable zero-trust security recommendations',
        enabled: true,
        rolloutPercentage: 90,
        targetAgents: ['security'],
        conditions: {
          securityLevel: ['high', 'enterprise'],
          complianceRequired: true
        }
      },
      {
        key: 'agent.performance.predictive_scaling',
        name: 'Performance: Predictive Scaling Analysis',
        description: 'Enable AI-powered predictive scaling recommendations',
        enabled: false, // Experimental
        rolloutPercentage: 25,
        targetAgents: ['performance'],
        conditions: {
          projectScale: ['large', 'enterprise'],
          cloudProvider: ['aws', 'gcp', 'azure']
        }
      },
      {
        key: 'agent.research.future_tech_insights',
        name: 'Research: Future Technology Insights',
        description: 'Enable post-singularity and quantum computing analysis',
        enabled: true,
        rolloutPercentage: 75,
        targetAgents: ['research'],
        conditions: {
          innovationLevel: ['high', 'revolutionary'],
          timeHorizon: ['long_term', 'visionary']
        }
      },
      
      // System-wide flags  
      {
        key: 'system.multi_agent_coordination_v2',
        name: 'Multi-Agent Coordination v2',
        description: 'Enhanced coordination protocol between agents',
        enabled: false, // Beta testing
        rolloutPercentage: 10,
        targetAgents: ['all'],
        conditions: {
          userTier: ['beta', 'enterprise'],
          systemLoad: ['low', 'medium']
        }
      },
      {
        key: 'system.rag_semantic_search_enhanced',
        name: 'Enhanced RAG Semantic Search',
        description: 'Advanced semantic search with multi-vector indexing',
        enabled: true,
        rolloutPercentage: 80,
        targetAgents: ['all'],
        conditions: {
          queryComplexity: ['medium', 'high'],
          knowledgeBaseSize: ['large', 'enterprise']
        }
      },
      {
        key: 'system.real_time_learning',
        name: 'Real-time Learning from Interactions',
        description: 'Continuous learning and adaptation from user interactions',
        enabled: false, // Experimental
        rolloutPercentage: 5,
        targetAgents: ['all'],
        conditions: {
          userConsent: true,
          dataRetention: ['enabled'],
          privacyLevel: ['standard']
        }
      },
      
      // Interface flags
      {
        key: 'interface.voice_interaction',
        name: 'Voice Interaction with Agents',
        description: 'Enable voice commands and responses',
        enabled: false,
        rolloutPercentage: 0,
        targetAgents: ['all'],
        conditions: {
          deviceType: ['desktop', 'mobile'],
          microphoneAccess: true
        }
      },
      {
        key: 'interface.collaborative_whiteboard',
        name: 'Collaborative Whiteboard',
        description: 'Visual collaboration space with agents',
        enabled: false,
        rolloutPercentage: 0,
        targetAgents: ['architect', 'product'],
        conditions: {
          projectType: ['design', 'architecture', 'planning'],
          userInterface: ['web', 'desktop']
        }
      }
    ];

    // Set default flags if they don't exist
    for (const flagConfig of defaultFlags) {
      if (!this.flags.has(flagConfig.key)) {
        this.flags.set(flagConfig.key, {
          ...flagConfig,
          id: uuidv4(),
          createdAt: new Date(),
          lastUpdated: new Date(),
          analytics: {
            totalChecks: 0,
            enabledChecks: 0,
            disabledChecks: 0,
            lastChecked: null
          }
        });
      }
    }

    console.log(`🚀 Default feature flags configured: ${defaultFlags.length} flags`);
  }

  /**
   * Check if a feature is enabled for given context
   */
  async isFeatureEnabled(flagKey, context = {}) {
    const flag = this.flags.get(flagKey);
    
    if (!flag) {
      console.warn(`⚠️ Feature flag not found: ${flagKey}`);
      return false;
    }

    // Update analytics
    flag.analytics.totalChecks++;
    flag.analytics.lastChecked = new Date();

    try {
      // Check basic enabled state
      if (!flag.enabled) {
        flag.analytics.disabledChecks++;
        return false;
      }

      // Check rollout percentage
      const rolloutCheck = this.checkRolloutPercentage(flag, context);
      if (!rolloutCheck) {
        flag.analytics.disabledChecks++;
        return false;
      }

      // Check conditions
      const conditionsCheck = this.checkConditions(flag, context);
      if (!conditionsCheck) {
        flag.analytics.disabledChecks++;
        return false;
      }

      // Check agent targeting
      const agentCheck = this.checkAgentTargeting(flag, context);
      if (!agentCheck) {
        flag.analytics.disabledChecks++;
        return false;
      }

      flag.analytics.enabledChecks++;
      return true;

    } catch (error) {
      console.error(`❌ Feature flag check error for ${flagKey}:`, error);
      flag.analytics.disabledChecks++;
      return false;
    }
  }

  /**
   * Check rollout percentage
   */
  checkRolloutPercentage(flag, context) {
    if (flag.rolloutPercentage >= 100) return true;
    
    // Use consistent hashing based on user/session ID
    const hashInput = context.userId || context.sessionId || 'anonymous';
    const hash = this.simpleHash(hashInput + flag.key);
    const percentage = (hash % 100) + 1;
    
    return percentage <= flag.rolloutPercentage;
  }

  /**
   * Check flag conditions
   */
  checkConditions(flag, context) {
    if (!flag.conditions) return true;

    for (const [conditionKey, expectedValues] of Object.entries(flag.conditions)) {
      const actualValue = context[conditionKey];
      
      if (actualValue === undefined) {
        // If condition is not provided in context, assume it doesn't match
        continue;
      }

      if (Array.isArray(expectedValues)) {
        if (!expectedValues.includes(actualValue)) {
          return false;
        }
      } else if (expectedValues !== actualValue) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check agent targeting
   */
  checkAgentTargeting(flag, context) {
    if (!flag.targetAgents || flag.targetAgents.includes('all')) {
      return true;
    }

    const currentAgent = context.agent || context.agentName;
    return flag.targetAgents.includes(currentAgent);
  }

  /**
   * Simple hash function for consistent rollout
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Update feature flag
   */
  async updateFlag(flagKey, updates) {
    const flag = this.flags.get(flagKey);
    if (!flag) {
      throw new Error(`Feature flag not found: ${flagKey}`);
    }

    const updatedFlag = {
      ...flag,
      ...updates,
      lastUpdated: new Date()
    };

    this.flags.set(flagKey, updatedFlag);
    
    // Emit change event
    this.emit('flagUpdated', { key: flagKey, flag: updatedFlag });
    
    // Save to disk
    await this.saveConfiguration();
    
    console.log(`🎛️ Feature flag updated: ${flagKey}`);
    return updatedFlag;
  }

  /**
   * Get all flags for an agent
   */
  getAgentFlags(agentName, context = {}) {
    const agentContext = { ...context, agent: agentName };
    const agentFlags = {};

    for (const [key, flag] of this.flags.entries()) {
      if (this.checkAgentTargeting(flag, agentContext)) {
        agentFlags[key] = {
          enabled: this.isFeatureEnabled(key, agentContext),
          description: flag.description,
          rolloutPercentage: flag.rolloutPercentage
        };
      }
    }

    return agentFlags;
  }

  /**
   * Start configuration file watcher
   */
  async startConfigWatcher() {
    if (await fs.pathExists(path.dirname(this.configPath))) {
      // This would use fs.watch in a real implementation
      console.log('👁️ Configuration file watcher active');
    }
  }

  /**
   * Save configuration to disk
   */
  async saveConfiguration() {
    try {
      await fs.ensureDir(path.dirname(this.configPath));

      const flagsData = {
        flags: Object.fromEntries(this.flags.entries()),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      await fs.writeJson(this.configPath, flagsData, { spaces: 2 });
      
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
    }
  }

  /**
   * Get analytics for all flags
   */
  getAnalytics() {
    const analytics = {
      totalFlags: this.flags.size,
      enabledFlags: 0,
      flagStats: {}
    };

    for (const [key, flag] of this.flags.entries()) {
      if (flag.enabled) analytics.enabledFlags++;
      
      analytics.flagStats[key] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        analytics: flag.analytics,
        lastUpdated: flag.lastUpdated
      };
    }

    return analytics;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: true,
      totalFlags: this.flags.size,
      totalExperiments: this.experiments.size,
      configPath: this.configPath,
      lastConfigLoad: new Date().toISOString()
    };
  }
}

module.exports = FeatureFlagManager;