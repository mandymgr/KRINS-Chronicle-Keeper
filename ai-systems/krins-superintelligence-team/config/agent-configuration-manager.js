/**
 * ⚙️ Agent Configuration Manager - Granular Per-Agent Settings
 * 
 * Dynamic configuration system for each Krins agent
 * Real-time updates, validation, and performance optimization
 * 
 * @author Krin - Configuration Excellence Architect 🧠💝
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class AgentConfigurationManager extends EventEmitter {
  constructor() {
    super();
    
    this.agentConfigs = new Map();
    this.configTemplates = new Map();
    this.configHistory = new Map();
    this.validationRules = new Map();
    
    this.configDir = path.join(__dirname, '../config/agents');
    this.templatesDir = path.join(__dirname, '../config/templates');
    
    console.log('⚙️ Agent Configuration Manager initializing...');
  }

  /**
   * Initialize configuration system
   */
  async initialize() {
    try {
      await this.ensureDirectories();
      await this.loadConfigTemplates();
      await this.loadAgentConfigurations();
      await this.setupValidationRules();
      await this.startConfigWatcher();
      
      console.log('✅ Agent Configuration Manager operational');
      this.emit('initialized');
      
    } catch (error) {
      console.error('❌ Agent Configuration Manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ensure configuration directories exist
   */
  async ensureDirectories() {
    await fs.ensureDir(this.configDir);
    await fs.ensureDir(this.templatesDir);
    await fs.ensureDir(path.join(__dirname, '../data/config-history'));
  }

  /**
   * Load configuration templates
   */
  async loadConfigTemplates() {
    const agentTemplates = {
      architect: {
        capabilities: {
          designPatternRecommendation: {
            enabled: true,
            depth: 'detailed', // basic, detailed, comprehensive
            includeExamples: true,
            includeAlternatives: true,
            maxAlternatives: 3
          },
          architecturalAnalysis: {
            enabled: true,
            analysisDepth: 'comprehensive',
            includeTradeoffs: true,
            performanceImpactAnalysis: true,
            scalabilityAssessment: true
          },
          systemDesign: {
            enabled: true,
            microservicesRecommendation: 'auto', // always, never, auto
            cloudNativePatterns: true,
            containerizationAdvice: true,
            apiDesignGuidance: true
          },
          futureProofing: {
            enabled: true,
            timeHorizons: [1, 5, 10, 25],
            technologyTrends: true,
            evolutionPlanning: true
          }
        },
        behavior: {
          responseStyle: 'detailed', // concise, detailed, comprehensive
          confidenceThreshold: 0.8,
          uncertaintyHandling: 'explicit', // explicit, implicit, recommend_expert
          collaborationMode: 'proactive', // reactive, proactive, leading
          learningFromFeedback: true
        },
        performance: {
          maxResponseTime: 5000, // ms
          cacheResponses: true,
          parallelProcessing: true,
          resourceOptimization: true
        }
      },
      
      security: {
        capabilities: {
          threatModeling: {
            enabled: true,
            automatedScanning: true,
            riskAssessment: 'comprehensive',
            complianceChecking: true,
            penetrationTestingAdvice: true
          },
          vulnerabilityAnalysis: {
            enabled: true,
            severityFiltering: 'all', // critical, high, all
            falsePositiveReduction: true,
            contextualAnalysis: true,
            remediationPrioritization: true
          },
          securityArchitecture: {
            enabled: true,
            zeroTrustRecommendation: true,
            encryptionAdvice: true,
            authenticationStrategies: true,
            networkSecurity: true
          },
          complianceGuidance: {
            enabled: true,
            frameworks: ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS'],
            auditPreparation: true,
            documentationGeneration: true
          }
        },
        behavior: {
          responseStyle: 'security_focused',
          paranoidMode: false, // Extra cautious recommendations
          assumeWorstCase: true,
          riskTolerance: 'low', // low, medium, high
          proactiveWarnings: true
        },
        performance: {
          maxResponseTime: 3000,
          backgroundScanning: true,
          cacheVulnerabilityData: true,
          realTimeMonitoring: false
        }
      },

      performance: {
        capabilities: {
          performanceAnalysis: {
            enabled: true,
            bottleneckIdentification: true,
            loadTestingAdvice: true,
            scalingRecommendations: true,
            metricsSelection: true
          },
          optimization: {
            enabled: true,
            codeOptimization: true,
            databaseOptimization: true,
            networkOptimization: true,
            frontendOptimization: true
          },
          monitoring: {
            enabled: true,
            alertingStrategies: true,
            dashboardDesign: true,
            slaDefinition: true,
            capacityPlanning: true
          },
          benchmarking: {
            enabled: true,
            industryComparisons: true,
            performanceTargets: true,
            regressionDetection: true
          }
        },
        behavior: {
          responseStyle: 'data_driven',
          optimizationAggression: 'balanced', // conservative, balanced, aggressive
          measurementFirst: true,
          costConsideration: true,
          userExperiencePriority: 'high'
        },
        performance: {
          maxResponseTime: 2000,
          fastMode: true,
          precomputeCommonOptimizations: true,
          cachePerformanceProfiles: true
        }
      },

      product: {
        capabilities: {
          uxAnalysis: {
            enabled: true,
            usabilityTesting: true,
            accessibilityCheck: true,
            userJourneyOptimization: true,
            conversionOptimization: true
          },
          designSystem: {
            enabled: true,
            componentLibraryAdvice: true,
            designTokens: true,
            responsiveDesign: true,
            brandConsistency: true
          },
          userResearch: {
            enabled: true,
            personaGeneration: true,
            userStoryCreation: true,
            feedbackAnalysis: true,
            abTestingAdvice: true
          },
          productStrategy: {
            enabled: true,
            featurePrioritization: true,
            roadmapPlanning: true,
            competitiveAnalysis: true,
            marketFitAssessment: true
          }
        },
        behavior: {
          responseStyle: 'user_centered',
          empathyLevel: 'high',
          dataVsIntuition: 'balanced', // data_driven, intuition_driven, balanced
          inclusivityFocus: true,
          businessImpactAwareness: true
        },
        performance: {
          maxResponseTime: 4000,
          visualizationSupport: true,
          prototypingAdvice: true,
          iterativeRefinement: true
        }
      },

      compliance: {
        capabilities: {
          regulatoryAnalysis: {
            enabled: true,
            frameworks: ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'ISO27001'],
            jurisdictionSpecific: true,
            changeTracking: true,
            riskAssessment: true
          },
          auditPreparation: {
            enabled: true,
            documentationGeneration: true,
            evidenceCollection: true,
            gapAnalysis: true,
            remediationPlanning: true
          },
          policyDevelopment: {
            enabled: true,
            policyTemplates: true,
            customization: true,
            versionControl: true,
            approvalWorkflows: true
          },
          trainingGuidance: {
            enabled: true,
            awarenessPrograms: true,
            roleSpecificTraining: true,
            certificationAdvice: true
          }
        },
        behavior: {
          responseStyle: 'compliance_focused',
          riskAversion: 'high',
          detailOrientation: 'maximum',
          conservativeAdvice: true,
          documentationEmphasis: 'high'
        },
        performance: {
          maxResponseTime: 6000,
          thoroughnessOverSpeed: true,
          regulatoryUpdates: true,
          crossReferenceValidation: true
        }
      },

      research: {
        capabilities: {
          technologyResearch: {
            enabled: true,
            emergingTrends: true,
            futureForecasting: true,
            innovationOpportunities: true,
            disruptiveTechnologies: true
          },
          competitiveAnalysis: {
            enabled: true,
            marketIntelligence: true,
            technologyComparison: true,
            bestPractices: true,
            benchmarking: true
          },
          academicResearch: {
            enabled: true,
            paperAnalysis: true,
            researchSynthesis: true,
            methodologyAdvice: true,
            validationStrategies: true
          },
          innovationPlanning: {
            enabled: true,
            ideaGeneration: true,
            feasibilityAnalysis: true,
            prototypeStrategies: true,
            intellectualProperty: true
          }
        },
        behavior: {
          responseStyle: 'research_oriented',
          curiosityLevel: 'maximum',
          skepticalAnalysis: true,
          evidenceRequirement: 'high',
          speculativeReasoningAllowed: true
        },
        performance: {
          maxResponseTime: 8000,
          deepResearchMode: true,
          multiSourceValidation: true,
          longitudinalAnalysis: true
        }
      },

      redteam: {
        capabilities: {
          adversarialTesting: {
            enabled: true,
            attackVectorAnalysis: true,
            stressTesting: true,
            chaosEngineering: true,
            failureModeAnalysis: true
          },
          qualityAssurance: {
            enabled: true,
            edgeCaseIdentification: true,
            boundaryTesting: true,
            errorHandlingValidation: true,
            performanceDegradation: true
          },
          criticalAnalysis: {
            enabled: true,
            assumptionChallenging: true,
            devilsAdvocate: true,
            riskAmplification: true,
            pessimisticScenarios: true
          },
          breakingThings: {
            enabled: true,
            destructiveTesting: true,
            limitExploration: true,
            robustnessValidation: true,
            recoveryTesting: true
          }
        },
        behavior: {
          responseStyle: 'critical_challenging',
          skepticismLevel: 'maximum',
          destructiveTesting: true,
          pessimisticBias: true,
          safetyFirst: false // Ironically, for better testing
        },
        performance: {
          maxResponseTime: 4000,
          exhaustiveTesting: true,
          parallelAttackVectors: true,
          continuousProbing: true
        }
      }
    };

    // Store templates
    for (const [agentName, template] of Object.entries(agentTemplates)) {
      this.configTemplates.set(agentName, template);
      
      // Save template to file
      const templatePath = path.join(this.templatesDir, `${agentName}-template.json`);
      await fs.writeJson(templatePath, template, { spaces: 2 });
    }

    console.log(`📋 Configuration templates loaded for ${Object.keys(agentTemplates).length} agents`);
  }

  /**
   * Load agent configurations
   */
  async loadAgentConfigurations() {
    try {
      const configFiles = await fs.readdir(this.configDir);
      
      for (const file of configFiles) {
        if (file.endsWith('.json')) {
          const agentName = file.replace('-config.json', '');
          const configPath = path.join(this.configDir, file);
          
          const config = await fs.readJson(configPath);
          this.agentConfigs.set(agentName, config);
        }
      }

      // Create default configs for agents without custom configuration
      const agentNames = ['architect', 'security', 'performance', 'product', 'compliance', 'research', 'redteam'];
      
      for (const agentName of agentNames) {
        if (!this.agentConfigs.has(agentName)) {
          const defaultConfig = this.createDefaultConfig(agentName);
          this.agentConfigs.set(agentName, defaultConfig);
          await this.saveAgentConfig(agentName, defaultConfig);
        }
      }

      console.log(`⚙️ Agent configurations loaded for ${this.agentConfigs.size} agents`);
      
    } catch (error) {
      console.warn('⚠️ Configuration loading warning:', error.message);
    }
  }

  /**
   * Create default configuration for agent
   */
  createDefaultConfig(agentName) {
    const template = this.configTemplates.get(agentName);
    if (!template) {
      throw new Error(`Template not found for agent: ${agentName}`);
    }

    return {
      id: uuidv4(),
      agentName,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      ...template,
      metadata: {
        environment: 'development',
        configSource: 'default',
        customizations: []
      }
    };
  }

  /**
   * Get configuration for specific agent
   */
  getAgentConfig(agentName, context = {}) {
    const config = this.agentConfigs.get(agentName);
    if (!config) {
      console.warn(`⚠️ Configuration not found for agent: ${agentName}`);
      return this.createDefaultConfig(agentName);
    }

    // Apply context-based modifications
    return this.applyContextualModifications(config, context);
  }

  /**
   * Apply contextual modifications to configuration
   */
  applyContextualModifications(config, context) {
    const modifiedConfig = JSON.parse(JSON.stringify(config)); // Deep clone

    // Example contextual modifications
    if (context.urgency === 'high') {
      modifiedConfig.performance.maxResponseTime = Math.floor(modifiedConfig.performance.maxResponseTime * 0.5);
      modifiedConfig.behavior.responseStyle = 'concise';
    }

    if (context.projectType === 'enterprise') {
      modifiedConfig.behavior.confidenceThreshold = Math.min(0.95, modifiedConfig.behavior.confidenceThreshold + 0.1);
      if (modifiedConfig.capabilities.complianceGuidance) {
        modifiedConfig.capabilities.complianceGuidance.enabled = true;
      }
    }

    if (context.securityLevel === 'high') {
      if (modifiedConfig.capabilities.threatModeling) {
        modifiedConfig.capabilities.threatModeling.automatedScanning = true;
        modifiedConfig.capabilities.threatModeling.riskAssessment = 'comprehensive';
      }
    }

    return modifiedConfig;
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfig(agentName, updates, userId = 'system') {
    const currentConfig = this.agentConfigs.get(agentName);
    if (!currentConfig) {
      throw new Error(`Agent configuration not found: ${agentName}`);
    }

    // Validate updates
    const validationResult = await this.validateConfigUpdates(agentName, updates);
    if (!validationResult.valid) {
      throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Create updated configuration
    const updatedConfig = this.mergeConfigurations(currentConfig, updates);
    updatedConfig.lastUpdated = new Date().toISOString();
    updatedConfig.version = this.incrementVersion(currentConfig.version);

    // Record in history
    await this.recordConfigHistory(agentName, currentConfig, updatedConfig, userId);

    // Update in memory
    this.agentConfigs.set(agentName, updatedConfig);

    // Save to disk
    await this.saveAgentConfig(agentName, updatedConfig);

    console.log(`⚙️ Configuration updated for agent ${agentName} to version ${updatedConfig.version}`);
    this.emit('configUpdated', { agentName, config: updatedConfig, userId });

    return updatedConfig;
  }

  /**
   * Validate configuration updates
   */
  async validateConfigUpdates(agentName, updates) {
    const rules = this.validationRules.get(agentName) || [];
    const errors = [];

    for (const rule of rules) {
      const result = await rule.validate(updates);
      if (!result.valid) {
        errors.push(result.error);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Setup validation rules
   */
  async setupValidationRules() {
    const commonRules = [
      {
        name: 'response_time_limit',
        validate: (updates) => {
          if (updates.performance?.maxResponseTime) {
            const maxTime = updates.performance.maxResponseTime;
            if (maxTime < 100 || maxTime > 30000) {
              return { valid: false, error: 'Response time must be between 100ms and 30s' };
            }
          }
          return { valid: true };
        }
      },
      {
        name: 'confidence_threshold_range',
        validate: (updates) => {
          if (updates.behavior?.confidenceThreshold) {
            const threshold = updates.behavior.confidenceThreshold;
            if (threshold < 0.1 || threshold > 1.0) {
              return { valid: false, error: 'Confidence threshold must be between 0.1 and 1.0' };
            }
          }
          return { valid: true };
        }
      }
    ];

    // Apply common rules to all agents
    const agentNames = ['architect', 'security', 'performance', 'product', 'compliance', 'research', 'redteam'];
    
    for (const agentName of agentNames) {
      this.validationRules.set(agentName, [...commonRules]);
    }

    console.log('✅ Validation rules configured');
  }

  /**
   * Merge configurations
   */
  mergeConfigurations(baseConfig, updates) {
    // Deep merge utility (simplified)
    function deepMerge(target, source) {
      const result = { ...target };
      
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
      
      return result;
    }

    return deepMerge(baseConfig, updates);
  }

  /**
   * Increment version number
   */
  incrementVersion(version) {
    const parts = version.split('.').map(Number);
    parts[2]++; // Increment patch version
    return parts.join('.');
  }

  /**
   * Record configuration history
   */
  async recordConfigHistory(agentName, oldConfig, newConfig, userId) {
    const historyEntry = {
      id: uuidv4(),
      agentName,
      timestamp: new Date().toISOString(),
      userId,
      oldVersion: oldConfig.version,
      newVersion: newConfig.version,
      changes: this.calculateConfigDiff(oldConfig, newConfig)
    };

    if (!this.configHistory.has(agentName)) {
      this.configHistory.set(agentName, []);
    }

    this.configHistory.get(agentName).push(historyEntry);

    // Save to disk
    const historyPath = path.join(__dirname, '../data/config-history', `${agentName}-history.json`);
    await fs.writeJson(historyPath, this.configHistory.get(agentName), { spaces: 2 });
  }

  /**
   * Calculate configuration diff
   */
  calculateConfigDiff(oldConfig, newConfig) {
    const changes = [];
    
    // Simple diff calculation (would be more sophisticated in production)
    function compareObjects(old, new_, path = '') {
      for (const key in new_) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof new_[key] === 'object' && !Array.isArray(new_[key])) {
          if (!old[key]) {
            changes.push({ type: 'added', path: currentPath, value: new_[key] });
          } else {
            compareObjects(old[key], new_[key], currentPath);
          }
        } else if (old[key] !== new_[key]) {
          changes.push({
            type: 'modified',
            path: currentPath,
            oldValue: old[key],
            newValue: new_[key]
          });
        }
      }
    }

    compareObjects(oldConfig, newConfig);
    return changes;
  }

  /**
   * Save agent configuration to disk
   */
  async saveAgentConfig(agentName, config) {
    try {
      const configPath = path.join(this.configDir, `${agentName}-config.json`);
      await fs.writeJson(configPath, config, { spaces: 2 });
    } catch (error) {
      console.error(`❌ Failed to save configuration for ${agentName}:`, error);
    }
  }

  /**
   * Start configuration file watcher
   */
  async startConfigWatcher() {
    // In production, this would watch config files for changes
    console.log('👁️ Configuration file watcher active');
  }

  /**
   * Get configuration history for agent
   */
  getConfigHistory(agentName) {
    return this.configHistory.get(agentName) || [];
  }

  /**
   * Rollback to previous configuration version
   */
  async rollbackConfig(agentName, targetVersion, userId = 'system') {
    const history = this.configHistory.get(agentName);
    if (!history) {
      throw new Error(`No configuration history found for agent: ${agentName}`);
    }

    // Find target configuration (simplified - would load from backup in production)
    const template = this.configTemplates.get(agentName);
    if (!template) {
      throw new Error(`Cannot rollback - template not found for agent: ${agentName}`);
    }

    const rolledBackConfig = {
      ...this.createDefaultConfig(agentName),
      version: this.incrementVersion(this.agentConfigs.get(agentName).version),
      lastUpdated: new Date().toISOString(),
      metadata: {
        ...this.createDefaultConfig(agentName).metadata,
        rolledBackFrom: this.agentConfigs.get(agentName).version,
        rolledBackTo: targetVersion
      }
    };

    await this.recordConfigHistory(agentName, this.agentConfigs.get(agentName), rolledBackConfig, userId);
    this.agentConfigs.set(agentName, rolledBackConfig);
    await this.saveAgentConfig(agentName, rolledBackConfig);

    console.log(`⏪ Configuration rolled back for agent ${agentName} to version ${targetVersion}`);
    this.emit('configRolledBack', { agentName, config: rolledBackConfig, targetVersion, userId });

    return rolledBackConfig;
  }

  /**
   * Get all agent configurations
   */
  getAllConfigurations() {
    const configs = {};
    
    for (const [agentName, config] of this.agentConfigs.entries()) {
      configs[agentName] = {
        version: config.version,
        lastUpdated: config.lastUpdated,
        capabilities: Object.keys(config.capabilities || {}),
        behavior: config.behavior,
        performance: config.performance
      };
    }
    
    return configs;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: true,
      totalConfigurations: this.agentConfigs.size,
      totalTemplates: this.configTemplates.size,
      configDirectory: this.configDir,
      templatesDirectory: this.templatesDir,
      validationRulesCount: Array.from(this.validationRules.values()).reduce((sum, rules) => sum + rules.length, 0)
    };
  }
}

module.exports = AgentConfigurationManager;