#!/usr/bin/env bun
/**
 * 🧠 ADR Parser - Intelligent Architectural Decision Parsing
 * 
 * Advanced NLP-powered parser that understands ADR content and extracts
 * actionable intelligence for AI systems and code generation
 */

import { DecisionTracker, ADR, Evidence } from '../DECISION_MANAGEMENT/decision-tracker';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ParsedADR {
  id: string;
  originalADR: ADR;
  semanticAnalysis: SemanticAnalysis;
  technicalRequirements: TechnicalRequirement[];
  implementationRules: ImplementationRule[];
  codeTemplates: CodeTemplate[];
  validationCriteria: ValidationCriterion[];
  antiPatterns: AntiPattern[];
  integrationPoints: IntegrationPoint[];
  businessRules: BusinessRule[];
  qualityAttributes: QualityAttribute[];
  metadata: {
    parsedAt: Date;
    parserVersion: string;
    confidenceScore: number;
    complexityScore: number;
    actionabilityScore: number;
  };
}

export interface SemanticAnalysis {
  keyEntities: Entity[];
  relationships: Relationship[];
  intent: 'prescriptive' | 'descriptive' | 'restrictive' | 'advisory';
  scope: 'system' | 'component' | 'interface' | 'process' | 'data';
  urgency: 'immediate' | 'planned' | 'future' | 'conditional';
  stakeholders: string[];
  impactedSystems: string[];
  dependencies: string[];
}

export interface Entity {
  type: 'technology' | 'component' | 'process' | 'data' | 'interface' | 'constraint';
  name: string;
  description: string;
  attributes: Record<string, string>;
  confidence: number;
}

export interface Relationship {
  type: 'depends_on' | 'implements' | 'replaces' | 'extends' | 'configures' | 'validates';
  source: string;
  target: string;
  description: string;
  strength: 'weak' | 'medium' | 'strong';
}

export interface TechnicalRequirement {
  id: string;
  type: 'functional' | 'non_functional' | 'constraint' | 'interface';
  priority: 'must' | 'should' | 'could' | 'wont';
  description: string;
  acceptanceCriteria: string[];
  testableConditions: string[];
  dependencies: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface ImplementationRule {
  id: string;
  type: 'code_structure' | 'naming_convention' | 'pattern_usage' | 'configuration' | 'deployment';
  rule: string;
  rationale: string;
  examples: string[];
  violations: string[];
  automationPossible: boolean;
  validationMethod: string;
}

export interface CodeTemplate {
  id: string;
  language: string;
  framework?: string;
  templateType: 'class' | 'function' | 'config' | 'test' | 'interface' | 'component';
  name: string;
  template: string;
  placeholders: Placeholder[];
  usage: string;
  relatedPatterns: string[];
}

export interface Placeholder {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  defaultValue?: string;
  required: boolean;
  validation?: string;
}

export interface ValidationCriterion {
  id: string;
  type: 'automated' | 'manual' | 'performance' | 'security' | 'usability';
  description: string;
  checkMethod: string;
  expectedResult: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  automatable: boolean;
}

export interface AntiPattern {
  id: string;
  name: string;
  description: string;
  whyProblematic: string;
  commonCauses: string[];
  detectionMethod: string;
  refactoringApproach: string;
  examples: string[];
}

export interface IntegrationPoint {
  id: string;
  type: 'api' | 'database' | 'message_queue' | 'file_system' | 'external_service';
  name: string;
  description: string;
  protocol: string;
  dataFormat: string;
  security: string[];
  errorHandling: string;
  monitoring: string[];
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  actions: string[];
  exceptions: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
}

export interface QualityAttribute {
  name: 'performance' | 'security' | 'reliability' | 'usability' | 'maintainability' | 'scalability';
  requirements: string[];
  metrics: string[];
  targets: Record<string, string>;
  tradeoffs: string[];
}

export interface ParsingContext {
  existingADRs: ParsedADR[];
  targetLanguages: string[];
  frameworkPreferences: string[];
  organizationalPatterns: string[];
  complianceRequirements: string[];
}

export class ADRParser {
  private decisionTracker: DecisionTracker;
  private parsedADRs = new Map<string, ParsedADR>();
  private entityExtractors: EntityExtractor[];
  private ruleExtractors: RuleExtractor[];

  constructor(chronicleKeeperPath: string = process.cwd()) {
    this.decisionTracker = new DecisionTracker(chronicleKeeperPath);
    this.entityExtractors = this.initializeEntityExtractors();
    this.ruleExtractors = this.initializeRuleExtractors();
    this.parseAllADRs();
  }

  /**
   * 🧠 Parse single ADR with full semantic analysis
   */
  async parseADR(adrId: string, context?: ParsingContext): Promise<ParsedADR> {
    const adr = this.decisionTracker.getADR(adrId);
    if (!adr) {
      throw new Error(`ADR not found: ${adrId}`);
    }

    const startTime = Date.now();

    const parsed: ParsedADR = {
      id: adrId,
      originalADR: adr,
      semanticAnalysis: await this.performSemanticAnalysis(adr),
      technicalRequirements: await this.extractTechnicalRequirements(adr),
      implementationRules: await this.extractImplementationRules(adr),
      codeTemplates: await this.generateCodeTemplates(adr, context),
      validationCriteria: await this.extractValidationCriteria(adr),
      antiPatterns: await this.extractAntiPatterns(adr),
      integrationPoints: await this.extractIntegrationPoints(adr),
      businessRules: await this.extractBusinessRules(adr),
      qualityAttributes: await this.extractQualityAttributes(adr),
      metadata: {
        parsedAt: new Date(),
        parserVersion: '3.0.0',
        confidenceScore: 0,
        complexityScore: 0,
        actionabilityScore: 0
      }
    };

    // Calculate metadata scores
    parsed.metadata.confidenceScore = this.calculateConfidenceScore(parsed);
    parsed.metadata.complexityScore = this.calculateComplexityScore(parsed);
    parsed.metadata.actionabilityScore = this.calculateActionabilityScore(parsed);

    // Cache the result
    this.parsedADRs.set(adrId, parsed);

    console.log(`🧠 Parsed ${adrId} in ${Date.now() - startTime}ms`);
    return parsed;
  }

  /**
   * 🔍 Perform semantic analysis of ADR content
   */
  private async performSemanticAnalysis(adr: ADR): Promise<SemanticAnalysis> {
    const fullText = `${adr.title} ${adr.problem} ${adr.decision} ${adr.rationale}`;
    
    const analysis: SemanticAnalysis = {
      keyEntities: [],
      relationships: [],
      intent: this.determineIntent(adr),
      scope: this.determineScope(adr),
      urgency: this.determineUrgency(adr),
      stakeholders: this.extractStakeholders(adr),
      impactedSystems: this.extractImpactedSystems(adr),
      dependencies: this.extractDependencies(adr)
    };

    // Extract entities using multiple extractors
    for (const extractor of this.entityExtractors) {
      const entities = extractor.extract(fullText, adr);
      analysis.keyEntities.push(...entities);
    }

    // Remove duplicate entities
    analysis.keyEntities = this.deduplicateEntities(analysis.keyEntities);

    // Extract relationships between entities
    analysis.relationships = this.extractRelationships(analysis.keyEntities, adr);

    return analysis;
  }

  /**
   * 🎯 Determine ADR intent
   */
  private determineIntent(adr: ADR): SemanticAnalysis['intent'] {
    const decision = adr.decision.toLowerCase();
    
    if (decision.includes('must') || decision.includes('shall') || decision.includes('required')) {
      return 'prescriptive';
    }
    if (decision.includes('should not') || decision.includes('avoid') || decision.includes('forbidden')) {
      return 'restrictive';
    }
    if (decision.includes('recommend') || decision.includes('suggest') || decision.includes('consider')) {
      return 'advisory';
    }
    return 'descriptive';
  }

  /**
   * 🎯 Determine ADR scope
   */
  private determineScope(adr: ADR): SemanticAnalysis['scope'] {
    const text = `${adr.problem} ${adr.decision}`.toLowerCase();
    
    if (text.includes('system') || text.includes('architecture') || text.includes('entire')) {
      return 'system';
    }
    if (text.includes('api') || text.includes('interface') || text.includes('endpoint')) {
      return 'interface';
    }
    if (text.includes('data') || text.includes('database') || text.includes('storage')) {
      return 'data';
    }
    if (text.includes('process') || text.includes('workflow') || text.includes('procedure')) {
      return 'process';
    }
    return 'component';
  }

  /**
   * ⏰ Determine urgency level
   */
  private determineUrgency(adr: ADR): SemanticAnalysis['urgency'] {
    const text = `${adr.problem} ${adr.decision}`.toLowerCase();
    
    if (text.includes('immediate') || text.includes('urgent') || text.includes('critical')) {
      return 'immediate';
    }
    if (text.includes('planned') || text.includes('scheduled') || text.includes('next release')) {
      return 'planned';
    }
    if (text.includes('future') || text.includes('eventually') || text.includes('long term')) {
      return 'future';
    }
    return 'conditional';
  }

  /**
   * 👥 Extract stakeholders from ADR
   */
  private extractStakeholders(adr: ADR): string[] {
    const stakeholders: string[] = [];
    const text = `${adr.problem} ${adr.decision} ${adr.rationale}`.toLowerCase();
    
    // Common stakeholder patterns
    const patterns = [
      /(\w+)\s+team/g,
      /(\w+)\s+department/g,
      /(developers?|engineers?|architects?|designers?|users?|customers?|clients?)/g,
      /(security|operations|devops|qa|testing)\s+team/g
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const stakeholder = match[1];
        if (stakeholder && stakeholder.length > 2 && !stakeholders.includes(stakeholder)) {
          stakeholders.push(stakeholder);
        }
      }
    }

    return stakeholders;
  }

  /**
   * 🏗️ Extract impacted systems
   */
  private extractImpactedSystems(adr: ADR): string[] {
    const systems: string[] = [];
    const text = `${adr.problem} ${adr.decision} ${adr.rationale}`.toLowerCase();
    
    // System naming patterns
    const patterns = [
      /(\w+)\s+(service|system|api|component|module|library)/g,
      /(frontend|backend|database|cache|queue|storage|auth|payment|notification)\s+system/g,
      /(\w+)[-_](\w+)(?:\s+system)?/g
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const system = match[0].trim();
        if (system.length > 3 && !systems.includes(system)) {
          systems.push(system);
        }
      }
    }

    return systems;
  }

  /**
   * 🔗 Extract dependencies
   */
  private extractDependencies(adr: ADR): string[] {
    const dependencies: string[] = [];
    const text = `${adr.problem} ${adr.decision} ${adr.rationale}`;
    
    // Look for ADR references
    const adrRefs = [...text.matchAll(/ADR-(\d{4})/g)];
    for (const match of adrRefs) {
      dependencies.push(`ADR-${match[1]}`);
    }

    // Look for technology dependencies
    const techKeywords = ['depends on', 'requires', 'uses', 'integrates with', 'built on'];
    for (const keyword of techKeywords) {
      const regex = new RegExp(`${keyword}\\s+([\\w\\s-]+?)(?:[.;,]|$)`, 'gi');
      const matches = [...text.matchAll(regex)];
      for (const match of matches) {
        const dep = match[1].trim();
        if (dep.length > 2 && !dependencies.includes(dep)) {
          dependencies.push(dep);
        }
      }
    }

    return dependencies;
  }

  /**
   * 🔧 Extract technical requirements
   */
  private async extractTechnicalRequirements(adr: ADR): Promise<TechnicalRequirement[]> {
    const requirements: TechnicalRequirement[] = [];
    const text = `${adr.problem} ${adr.decision} ${adr.rationale}`;

    // Extract functional requirements
    const functionalPatterns = [
      /the system (must|shall|should|will) ([^.;]+)/gi,
      /it is required that ([^.;]+)/gi,
      /(must|shall|should) (implement|provide|support|handle) ([^.;]+)/gi
    ];

    let reqId = 1;
    for (const pattern of functionalPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const priority = this.mapPriorityKeyword(match[1]);
        const description = match[2] || match[3] || match[1];
        
        requirements.push({
          id: `req_${adr.id}_${reqId++}`,
          type: 'functional',
          priority,
          description: description.trim(),
          acceptanceCriteria: this.generateAcceptanceCriteria(description),
          testableConditions: this.generateTestableConditions(description),
          dependencies: [],
          estimatedEffort: this.estimateEffort(description)
        });
      }
    }

    // Extract non-functional requirements (performance, security, etc.)
    const nfrKeywords = ['performance', 'security', 'scalability', 'availability', 'reliability', 'maintainability'];
    for (const keyword of nfrKeywords) {
      const regex = new RegExp(`${keyword}[^.;]*([^.;]+)`, 'gi');
      const matches = [...text.matchAll(regex)];
      for (const match of matches) {
        requirements.push({
          id: `nfr_${adr.id}_${reqId++}`,
          type: 'non_functional',
          priority: 'should',
          description: `${keyword}: ${match[0].trim()}`,
          acceptanceCriteria: [`${keyword} requirements must be met`],
          testableConditions: [`Verify ${keyword} metrics`],
          dependencies: [],
          estimatedEffort: 'medium'
        });
      }
    }

    return requirements;
  }

  /**
   * 📋 Extract implementation rules
   */
  private async extractImplementationRules(adr: ADR): Promise<ImplementationRule[]> {
    const rules: ImplementationRule[] = [];
    
    for (const extractor of this.ruleExtractors) {
      const extractedRules = extractor.extract(adr);
      rules.push(...extractedRules);
    }

    return rules;
  }

  /**
   * 💻 Generate code templates based on ADR
   */
  private async generateCodeTemplates(adr: ADR, context?: ParsingContext): Promise<CodeTemplate[]> {
    const templates: CodeTemplate[] = [];
    const decision = adr.decision.toLowerCase();
    
    // Database-related templates
    if (decision.includes('database') || decision.includes('postgresql') || decision.includes('mongodb')) {
      templates.push(this.generateDatabaseTemplate(adr, context));
    }

    // API-related templates
    if (decision.includes('api') || decision.includes('endpoint') || decision.includes('rest')) {
      templates.push(this.generateAPITemplate(adr, context));
    }

    // Security-related templates
    if (decision.includes('authentication') || decision.includes('authorization') || decision.includes('security')) {
      templates.push(this.generateSecurityTemplate(adr, context));
    }

    // Configuration templates
    if (decision.includes('configuration') || decision.includes('config') || decision.includes('settings')) {
      templates.push(this.generateConfigTemplate(adr, context));
    }

    return templates.filter(Boolean);
  }

  /**
   * ✅ Extract validation criteria
   */
  private async extractValidationCriteria(adr: ADR): Promise<ValidationCriterion[]> {
    const criteria: ValidationCriterion[] = [];
    const text = `${adr.decision} ${adr.rationale}`;

    // Look for testable statements
    const testPatterns = [
      /should be tested by ([^.;]+)/gi,
      /verified through ([^.;]+)/gi,
      /validated by ([^.;]+)/gi,
      /ensure that ([^.;]+)/gi
    ];

    let critId = 1;
    for (const pattern of testPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        criteria.push({
          id: `val_${adr.id}_${critId++}`,
          type: 'automated',
          description: match[1].trim(),
          checkMethod: 'Automated testing',
          expectedResult: 'Passes validation',
          severity: 'medium',
          automatable: true
        });
      }
    }

    return criteria;
  }

  /**
   * ❌ Extract anti-patterns from ADR
   */
  private async extractAntiPatterns(adr: ADR): Promise<AntiPattern[]> {
    const antiPatterns: AntiPattern[] = [];
    const text = `${adr.decision} ${adr.rationale}`;

    // Look for "avoid", "don't", "never" patterns
    const avoidPatterns = [
      /avoid ([^.;]+) because ([^.;]+)/gi,
      /don't use ([^.;]+) as ([^.;]+)/gi,
      /never ([^.;]+) since ([^.;]+)/gi
    ];

    let apId = 1;
    for (const pattern of avoidPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        antiPatterns.push({
          id: `ap_${adr.id}_${apId++}`,
          name: match[1].trim(),
          description: `Anti-pattern identified in ${adr.id}`,
          whyProblematic: match[2]?.trim() || 'Conflicts with architectural decision',
          commonCauses: ['Not following ADR guidelines'],
          detectionMethod: 'Code review',
          refactoringApproach: 'Follow the prescribed approach in the ADR',
          examples: []
        });
      }
    }

    return antiPatterns;
  }

  /**
   * 🔗 Extract integration points
   */
  private async extractIntegrationPoints(adr: ADR): Promise<IntegrationPoint[]> {
    const integrationPoints: IntegrationPoint[] = [];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();

    // API integration points
    if (text.includes('api') || text.includes('endpoint')) {
      integrationPoints.push({
        id: `int_${adr.id}_api`,
        type: 'api',
        name: 'API Integration',
        description: 'RESTful API integration as specified in ADR',
        protocol: text.includes('graphql') ? 'GraphQL' : 'REST',
        dataFormat: text.includes('json') ? 'JSON' : 'Unknown',
        security: this.extractSecurityRequirements(text),
        errorHandling: 'Standard HTTP status codes',
        monitoring: ['Response times', 'Error rates', 'Throughput']
      });
    }

    // Database integration points
    if (text.includes('database') || text.includes('storage')) {
      integrationPoints.push({
        id: `int_${adr.id}_db`,
        type: 'database',
        name: 'Database Integration',
        description: 'Database integration as specified in ADR',
        protocol: text.includes('postgresql') ? 'PostgreSQL' : 'SQL',
        dataFormat: 'Relational',
        security: ['Connection encryption', 'Authentication'],
        errorHandling: 'Database-specific error codes',
        monitoring: ['Connection pool', 'Query performance', 'Storage usage']
      });
    }

    return integrationPoints;
  }

  /**
   * 📊 Extract business rules
   */
  private async extractBusinessRules(adr: ADR): Promise<BusinessRule[]> {
    const businessRules: BusinessRule[] = [];
    const text = `${adr.problem} ${adr.decision} ${adr.rationale}`;

    // Look for business logic patterns
    const businessPatterns = [
      /if ([^,]+), then ([^.;]+)/gi,
      /when ([^,]+), the system ([^.;]+)/gi,
      /business rule: ([^.;]+)/gi
    ];

    let brId = 1;
    for (const pattern of businessPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        businessRules.push({
          id: `br_${adr.id}_${brId++}`,
          name: `Business Rule ${brId - 1}`,
          description: match[0].trim(),
          conditions: [match[1]?.trim() || ''],
          actions: [match[2]?.trim() || ''],
          exceptions: [],
          priority: 'medium',
          owner: adr.author
        });
      }
    }

    return businessRules;
  }

  /**
   * 🎯 Extract quality attributes
   */
  private async extractQualityAttributes(adr: ADR): Promise<QualityAttribute[]> {
    const attributes: QualityAttribute[] = [];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();

    const qualityKeywords = {
      performance: ['performance', 'latency', 'throughput', 'response time', 'speed'],
      security: ['security', 'authentication', 'authorization', 'encryption', 'privacy'],
      reliability: ['reliability', 'availability', 'uptime', 'fault tolerance', 'disaster recovery'],
      scalability: ['scalability', 'scale', 'load', 'capacity', 'horizontal', 'vertical'],
      maintainability: ['maintainability', 'maintenance', 'readable', 'modular', 'testable'],
      usability: ['usability', 'user experience', 'interface', 'accessibility', 'intuitive']
    };

    for (const [attribute, keywords] of Object.entries(qualityKeywords)) {
      const hasKeywords = keywords.some(keyword => text.includes(keyword));
      if (hasKeywords) {
        attributes.push({
          name: attribute as QualityAttribute['name'],
          requirements: this.extractQualityRequirements(text, keywords),
          metrics: this.getDefaultMetrics(attribute as QualityAttribute['name']),
          targets: {},
          tradeoffs: []
        });
      }
    }

    return attributes;
  }

  // Helper methods for parsing

  private mapPriorityKeyword(keyword: string): TechnicalRequirement['priority'] {
    const k = keyword.toLowerCase();
    if (k.includes('must') || k.includes('shall')) return 'must';
    if (k.includes('should')) return 'should';
    if (k.includes('could')) return 'could';
    return 'wont';
  }

  private generateAcceptanceCriteria(description: string): string[] {
    return [
      `Implementation satisfies: ${description}`,
      'Code review confirms adherence to requirement',
      'Tests validate the implementation'
    ];
  }

  private generateTestableConditions(description: string): string[] {
    return [
      `Automated test exists for: ${description}`,
      'Manual verification completed',
      'Integration test passes'
    ];
  }

  private estimateEffort(description: string): TechnicalRequirement['estimatedEffort'] {
    const complexity = description.length + (description.match(/\b(complex|difficult|challenging|intricate)\b/gi) || []).length * 50;
    if (complexity > 200) return 'high';
    if (complexity > 100) return 'medium';
    return 'low';
  }

  // Entity extraction and deduplication

  private initializeEntityExtractors(): EntityExtractor[] {
    return [
      new TechnologyEntityExtractor(),
      new ComponentEntityExtractor(),
      new ProcessEntityExtractor(),
      new DataEntityExtractor()
    ];
  }

  private initializeRuleExtractors(): RuleExtractor[] {
    return [
      new CodeStructureRuleExtractor(),
      new NamingConventionRuleExtractor(),
      new ConfigurationRuleExtractor(),
      new PatternUsageRuleExtractor()
    ];
  }

  private deduplicateEntities(entities: Entity[]): Entity[] {
    const unique = new Map<string, Entity>();
    for (const entity of entities) {
      const key = `${entity.type}_${entity.name.toLowerCase()}`;
      if (!unique.has(key) || unique.get(key)!.confidence < entity.confidence) {
        unique.set(key, entity);
      }
    }
    return Array.from(unique.values());
  }

  private extractRelationships(entities: Entity[], adr: ADR): Relationship[] {
    const relationships: Relationship[] = [];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();

    // Look for relationship keywords
    const relationshipPatterns = [
      { pattern: /(\w+)\s+depends on\s+(\w+)/g, type: 'depends_on' as const },
      { pattern: /(\w+)\s+implements\s+(\w+)/g, type: 'implements' as const },
      { pattern: /(\w+)\s+replaces\s+(\w+)/g, type: 'replaces' as const },
      { pattern: /(\w+)\s+extends\s+(\w+)/g, type: 'extends' as const },
      { pattern: /(\w+)\s+configures\s+(\w+)/g, type: 'configures' as const }
    ];

    for (const { pattern, type } of relationshipPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        relationships.push({
          type,
          source: match[1],
          target: match[2],
          description: match[0],
          strength: 'medium'
        });
      }
    }

    return relationships;
  }

  // Template generators

  private generateDatabaseTemplate(adr: ADR, context?: ParsingContext): CodeTemplate {
    const language = this.detectPrimaryLanguage(context);
    
    return {
      id: `tmpl_${adr.id}_database`,
      language,
      framework: this.detectFramework(adr, context),
      templateType: 'class',
      name: 'Database Service',
      template: this.getDatabaseTemplateCode(language),
      placeholders: [
        { name: 'TableName', type: 'string', description: 'Database table name', required: true },
        { name: 'EntityName', type: 'string', description: 'Entity class name', required: true },
        { name: 'ConnectionString', type: 'string', description: 'Database connection string', required: true }
      ],
      usage: 'Use this template to create database service classes following the ADR guidelines',
      relatedPatterns: ['Repository Pattern', 'Data Access Layer']
    };
  }

  private generateAPITemplate(adr: ADR, context?: ParsingContext): CodeTemplate {
    const language = this.detectPrimaryLanguage(context);
    
    return {
      id: `tmpl_${adr.id}_api`,
      language,
      framework: this.detectFramework(adr, context),
      templateType: 'class',
      name: 'API Controller',
      template: this.getAPITemplateCode(language),
      placeholders: [
        { name: 'EndpointName', type: 'string', description: 'API endpoint name', required: true },
        { name: 'EntityType', type: 'string', description: 'Entity type for CRUD operations', required: true },
        { name: 'ValidationRules', type: 'array', description: 'Input validation rules', required: false }
      ],
      usage: 'Use this template to create API controllers following REST conventions',
      relatedPatterns: ['REST API', 'Controller Pattern']
    };
  }

  private generateSecurityTemplate(adr: ADR, context?: ParsingContext): CodeTemplate {
    const language = this.detectPrimaryLanguage(context);
    
    return {
      id: `tmpl_${adr.id}_security`,
      language,
      templateType: 'function',
      name: 'Security Middleware',
      template: this.getSecurityTemplateCode(language),
      placeholders: [
        { name: 'AuthMethod', type: 'string', description: 'Authentication method', required: true },
        { name: 'Permissions', type: 'array', description: 'Required permissions', required: true }
      ],
      usage: 'Use this template to implement security middleware',
      relatedPatterns: ['Middleware Pattern', 'Authentication']
    };
  }

  private generateConfigTemplate(adr: ADR, context?: ParsingContext): CodeTemplate {
    return {
      id: `tmpl_${adr.id}_config`,
      language: 'yaml',
      templateType: 'config',
      name: 'Configuration File',
      template: this.getConfigTemplateCode(),
      placeholders: [
        { name: 'ServiceName', type: 'string', description: 'Name of the service', required: true },
        { name: 'Environment', type: 'string', description: 'Target environment', required: true }
      ],
      usage: 'Use this template for service configuration',
      relatedPatterns: ['Configuration Pattern']
    };
  }

  // Language and framework detection

  private detectPrimaryLanguage(context?: ParsingContext): string {
    if (context?.targetLanguages && context.targetLanguages.length > 0) {
      return context.targetLanguages[0];
    }
    return 'typescript'; // Default
  }

  private detectFramework(adr: ADR, context?: ParsingContext): string | undefined {
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();
    
    if (text.includes('express')) return 'express';
    if (text.includes('fastify')) return 'fastify';
    if (text.includes('spring')) return 'spring';
    if (text.includes('django')) return 'django';
    if (text.includes('flask')) return 'flask';
    
    if (context?.frameworkPreferences && context.frameworkPreferences.length > 0) {
      return context.frameworkPreferences[0];
    }
    
    return undefined;
  }

  // Template code generators (simplified examples)

  private getDatabaseTemplateCode(language: string): string {
    if (language === 'typescript') {
      return `
export class {{EntityName}}Repository {
  private connection: Connection;

  constructor(connectionString: string) {
    this.connection = new Connection(connectionString);
  }

  async find{{EntityName}}ById(id: string): Promise<{{EntityName}} | null> {
    const query = 'SELECT * FROM {{TableName}} WHERE id = $1';
    const result = await this.connection.query(query, [id]);
    return result.rows[0] || null;
  }

  async create{{EntityName}}(data: Create{{EntityName}}Dto): Promise<{{EntityName}}> {
    const query = 'INSERT INTO {{TableName}} (data) VALUES ($1) RETURNING *';
    const result = await this.connection.query(query, [data]);
    return result.rows[0];
  }
}`;
    }
    return '// Database template for ' + language;
  }

  private getAPITemplateCode(language: string): string {
    if (language === 'typescript') {
      return `
@Controller('{{EndpointName}}')
export class {{EntityType}}Controller {
  constructor(private readonly service: {{EntityType}}Service) {}

  @Get(':id')
  async get{{EntityType}}(@Param('id') id: string): Promise<{{EntityType}}> {
    return this.service.findById(id);
  }

  @Post()
  async create{{EntityType}}(@Body() data: Create{{EntityType}}Dto): Promise<{{EntityType}}> {
    return this.service.create(data);
  }

  @Put(':id')
  async update{{EntityType}}(@Param('id') id: string, @Body() data: Update{{EntityType}}Dto): Promise<{{EntityType}}> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async delete{{EntityType}}(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }
}`;
    }
    return '// API template for ' + language;
  }

  private getSecurityTemplateCode(language: string): string {
    if (language === 'typescript') {
      return `
export function authMiddleware(requiredPermissions: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;

      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
          req.user.permissions.includes(permission)
        );
        
        if (!hasPermission) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}`;
    }
    return '// Security template for ' + language;
  }

  private getConfigTemplateCode(): string {
    return `
version: '1.0'
service:
  name: {{ServiceName}}
  environment: {{Environment}}
  
database:
  host: \${DB_HOST:-localhost}
  port: \${DB_PORT:-5432}
  name: \${DB_NAME:-{{ServiceName}}}
  
security:
  jwt:
    secret: \${JWT_SECRET}
    expiry: \${JWT_EXPIRY:-24h}
  
monitoring:
  enabled: true
  metrics:
    - response_time
    - error_rate
    - throughput
`;
  }

  // Quality attribute helpers

  private extractQualityRequirements(text: string, keywords: string[]): string[] {
    const requirements: string[] = [];
    
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[^.;]*([^.;]+)`, 'gi');
      const matches = [...text.matchAll(regex)];
      for (const match of matches) {
        requirements.push(match[0].trim());
      }
    }

    return requirements;
  }

  private getDefaultMetrics(attribute: QualityAttribute['name']): string[] {
    const metricMap = {
      performance: ['response_time', 'throughput', 'cpu_usage', 'memory_usage'],
      security: ['failed_auth_attempts', 'security_scan_results', 'vulnerability_count'],
      reliability: ['uptime_percentage', 'mtbf', 'mttr', 'error_rate'],
      scalability: ['concurrent_users', 'transaction_volume', 'resource_utilization'],
      maintainability: ['code_coverage', 'cyclomatic_complexity', 'technical_debt'],
      usability: ['user_satisfaction', 'task_completion_rate', 'error_recovery_time']
    };

    return metricMap[attribute] || [];
  }

  private extractSecurityRequirements(text: string): string[] {
    const requirements: string[] = [];
    const securityKeywords = ['authentication', 'authorization', 'encryption', 'https', 'ssl', 'tls'];
    
    for (const keyword of securityKeywords) {
      if (text.includes(keyword)) {
        requirements.push(keyword.toUpperCase());
      }
    }

    return requirements.length > 0 ? requirements : ['Authentication required'];
  }

  // Scoring methods

  private calculateConfidenceScore(parsed: ParsedADR): number {
    let score = 50; // Base score

    // More technical requirements = higher confidence
    score += Math.min(parsed.technicalRequirements.length * 5, 20);

    // More implementation rules = higher confidence
    score += Math.min(parsed.implementationRules.length * 3, 15);

    // Code templates indicate actionability
    score += Math.min(parsed.codeTemplates.length * 5, 15);

    return Math.min(score, 100);
  }

  private calculateComplexityScore(parsed: ParsedADR): number {
    let score = 0;

    // Entity count indicates complexity
    score += Math.min(parsed.semanticAnalysis.keyEntities.length * 2, 30);

    // Relationship count indicates complexity
    score += Math.min(parsed.semanticAnalysis.relationships.length * 3, 25);

    // Quality attributes indicate complexity
    score += Math.min(parsed.qualityAttributes.length * 5, 25);

    // Integration points add complexity
    score += Math.min(parsed.integrationPoints.length * 4, 20);

    return Math.min(score, 100);
  }

  private calculateActionabilityScore(parsed: ParsedADR): number {
    let score = 0;

    // Implementation rules are directly actionable
    score += Math.min(parsed.implementationRules.length * 8, 40);

    // Code templates are highly actionable
    score += Math.min(parsed.codeTemplates.length * 10, 30);

    // Validation criteria indicate testability
    score += Math.min(parsed.validationCriteria.length * 5, 20);

    // Technical requirements indicate clear actions
    score += Math.min(parsed.technicalRequirements.length * 2, 10);

    return Math.min(score, 100);
  }

  // Bulk parsing

  private parseAllADRs(): void {
    const allADRs = this.decisionTracker.getAllADRs();
    console.log(`🧠 Starting bulk parsing of ${allADRs.length} ADRs...`);

    let parsed = 0;
    for (const adr of allADRs) {
      try {
        this.parseADR(adr.id);
        parsed++;
      } catch (error) {
        console.error(`Error parsing ${adr.id}:`, error);
      }
    }

    console.log(`✅ Parsed ${parsed}/${allADRs.length} ADRs successfully`);
  }

  /**
   * 📊 Get parsed ADR by ID
   */
  getParsedADR(adrId: string): ParsedADR | undefined {
    return this.parsedADRs.get(adrId);
  }

  /**
   * 📋 Get all parsed ADRs
   */
  getAllParsedADRs(): ParsedADR[] {
    return Array.from(this.parsedADRs.values());
  }

  /**
   * 🔍 Search parsed ADRs by criteria
   */
  searchParsedADRs(criteria: {
    hasCodeTemplates?: boolean;
    minActionability?: number;
    technologies?: string[];
    components?: string[];
  }): ParsedADR[] {
    return this.getAllParsedADRs().filter(parsed => {
      if (criteria.hasCodeTemplates && parsed.codeTemplates.length === 0) return false;
      if (criteria.minActionability && parsed.metadata.actionabilityScore < criteria.minActionability) return false;
      
      if (criteria.technologies) {
        const hasTech = criteria.technologies.some(tech =>
          parsed.semanticAnalysis.keyEntities.some(entity =>
            entity.type === 'technology' && entity.name.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasTech) return false;
      }

      if (criteria.components) {
        const hasComponent = criteria.components.some(comp =>
          parsed.semanticAnalysis.keyEntities.some(entity =>
            entity.type === 'component' && entity.name.toLowerCase().includes(comp.toLowerCase())
          )
        );
        if (!hasComponent) return false;
      }

      return true;
    });
  }

  /**
   * 📊 Generate parsing report
   */
  generateReport(): string {
    const allParsed = this.getAllParsedADRs();
    const avgConfidence = allParsed.reduce((sum, p) => sum + p.metadata.confidenceScore, 0) / allParsed.length;
    const avgComplexity = allParsed.reduce((sum, p) => sum + p.metadata.complexityScore, 0) / allParsed.length;
    const avgActionability = allParsed.reduce((sum, p) => sum + p.metadata.actionabilityScore, 0) / allParsed.length;

    return `# 🧠 ADR Parser Report

## 📊 Overview
- **Total Parsed ADRs:** ${allParsed.length}
- **Average Confidence:** ${avgConfidence.toFixed(1)}%
- **Average Complexity:** ${avgComplexity.toFixed(1)}%
- **Average Actionability:** ${avgActionability.toFixed(1)}%

## 🏆 Top Actionable ADRs
${allParsed
  .sort((a, b) => b.metadata.actionabilityScore - a.metadata.actionabilityScore)
  .slice(0, 10)
  .map(p => `- **${p.id}:** ${p.originalADR.title} (${p.metadata.actionabilityScore}% actionable)`)
  .join('\n')}

## 💻 Code Templates Generated
${allParsed
  .filter(p => p.codeTemplates.length > 0)
  .map(p => `- **${p.id}:** ${p.codeTemplates.length} templates`)
  .join('\n')}

## 🎯 Most Complex ADRs
${allParsed
  .sort((a, b) => b.metadata.complexityScore - a.metadata.complexityScore)
  .slice(0, 5)
  .map(p => `- **${p.id}:** ${p.originalADR.title} (${p.metadata.complexityScore}% complexity)`)
  .join('\n')}

---
*Generated by KRINS-Chronicle-Keeper ADR Parser*
`;
  }
}

// Entity and Rule Extractors (simplified implementations)

interface EntityExtractor {
  extract(text: string, adr: ADR): Entity[];
}

interface RuleExtractor {
  extract(adr: ADR): ImplementationRule[];
}

class TechnologyEntityExtractor implements EntityExtractor {
  extract(text: string, adr: ADR): Entity[] {
    const entities: Entity[] = [];
    const techKeywords = [
      'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'react', 'vue', 'angular', 'typescript', 'javascript',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'graphql', 'rest', 'grpc', 'kafka', 'rabbitmq'
    ];

    const lowerText = text.toLowerCase();
    for (const tech of techKeywords) {
      if (lowerText.includes(tech)) {
        entities.push({
          type: 'technology',
          name: tech,
          description: `Technology mentioned in ${adr.id}`,
          attributes: { category: 'technology' },
          confidence: 80
        });
      }
    }

    return entities;
  }
}

class ComponentEntityExtractor implements EntityExtractor {
  extract(text: string, adr: ADR): Entity[] {
    const entities: Entity[] = [];
    const componentPatterns = [
      /(\w+)\s+(service|component|module|library|system)/gi,
      /(\w+)[-_](\w+)(?:\s+component)?/gi
    ];

    for (const pattern of componentPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const name = match[1] || `${match[1]}-${match[2]}`;
        entities.push({
          type: 'component',
          name,
          description: `Component identified in ${adr.id}`,
          attributes: { type: match[2] || 'component' },
          confidence: 70
        });
      }
    }

    return entities;
  }
}

class ProcessEntityExtractor implements EntityExtractor {
  extract(text: string, adr: ADR): Entity[] {
    const entities: Entity[] = [];
    const processKeywords = [
      'authentication', 'authorization', 'validation', 'deployment',
      'testing', 'monitoring', 'logging', 'caching', 'backup'
    ];

    const lowerText = text.toLowerCase();
    for (const process of processKeywords) {
      if (lowerText.includes(process)) {
        entities.push({
          type: 'process',
          name: process,
          description: `Process mentioned in ${adr.id}`,
          attributes: { category: 'process' },
          confidence: 75
        });
      }
    }

    return entities;
  }
}

class DataEntityExtractor implements EntityExtractor {
  extract(text: string, adr: ADR): Entity[] {
    const entities: Entity[] = [];
    const dataPatterns = [
      /(\w+)\s+(data|table|collection|index|schema)/gi,
      /(user|customer|order|product|payment|session)\s+data/gi
    ];

    for (const pattern of dataPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const name = match[1] || match[0];
        entities.push({
          type: 'data',
          name,
          description: `Data entity identified in ${adr.id}`,
          attributes: { dataType: match[2] || 'data' },
          confidence: 75
        });
      }
    }

    return entities;
  }
}

class CodeStructureRuleExtractor implements RuleExtractor {
  extract(adr: ADR): ImplementationRule[] {
    const rules: ImplementationRule[] = [];
    const text = `${adr.decision} ${adr.rationale}`;

    // Look for structure-related rules
    const structurePatterns = [
      /must (be|use|follow|implement) ([^.;]+)/gi,
      /should (organize|structure|arrange) ([^.;]+)/gi
    ];

    let ruleId = 1;
    for (const pattern of structurePatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        rules.push({
          id: `rule_${adr.id}_struct_${ruleId++}`,
          type: 'code_structure',
          rule: match[0].trim(),
          rationale: 'Specified in ADR for architectural consistency',
          examples: [],
          violations: [],
          automationPossible: true,
          validationMethod: 'Static code analysis'
        });
      }
    }

    return rules;
  }
}

class NamingConventionRuleExtractor implements RuleExtractor {
  extract(adr: ADR): ImplementationRule[] {
    const rules: ImplementationRule[] = [];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();

    if (text.includes('naming') || text.includes('convention') || text.includes('prefix') || text.includes('suffix')) {
      rules.push({
        id: `rule_${adr.id}_naming`,
        type: 'naming_convention',
        rule: 'Follow naming conventions as specified in the ADR',
        rationale: 'Ensures consistency across the codebase',
        examples: [],
        violations: [],
        automationPossible: true,
        validationMethod: 'Linting rules'
      });
    }

    return rules;
  }
}

class ConfigurationRuleExtractor implements RuleExtractor {
  extract(adr: ADR): ImplementationRule[] {
    const rules: ImplementationRule[] = [];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();

    if (text.includes('config') || text.includes('setting') || text.includes('environment')) {
      rules.push({
        id: `rule_${adr.id}_config`,
        type: 'configuration',
        rule: 'Configuration must follow the structure defined in the ADR',
        rationale: 'Ensures proper configuration management',
        examples: [],
        violations: [],
        automationPossible: true,
        validationMethod: 'Configuration validation'
      });
    }

    return rules;
  }
}

class PatternUsageRuleExtractor implements RuleExtractor {
  extract(adr: ADR): ImplementationRule[] {
    const rules: ImplementationRule[] = [];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();

    const patternKeywords = ['pattern', 'singleton', 'factory', 'observer', 'strategy', 'repository'];
    const hasPattern = patternKeywords.some(keyword => text.includes(keyword));

    if (hasPattern) {
      rules.push({
        id: `rule_${adr.id}_pattern`,
        type: 'pattern_usage',
        rule: 'Use the specified design pattern as outlined in the ADR',
        rationale: 'Maintains architectural consistency and best practices',
        examples: [],
        violations: [],
        automationPossible: false,
        validationMethod: 'Code review'
      });
    }

    return rules;
  }
}

// CLI interface
if (import.meta.main) {
  const parser = new ADRParser();
  
  const command = Bun.argv[2];
  
  switch (command) {
    case 'parse':
      const adrId = Bun.argv[3];
      if (adrId) {
        parser.parseADR(adrId).then(parsed => {
          console.log(JSON.stringify(parsed, null, 2));
        }).catch(console.error);
      } else {
        console.log('Usage: bun adr-parser.ts parse <adrId>');
      }
      break;

    case 'templates':
      const targetAdr = Bun.argv[3];
      if (targetAdr) {
        const parsed = parser.getParsedADR(targetAdr);
        if (parsed) {
          console.log(`📝 Code Templates for ${targetAdr}:`);
          parsed.codeTemplates.forEach(template => {
            console.log(`- ${template.name} (${template.language})`);
          });
        } else {
          console.log(`ADR ${targetAdr} not found or not parsed`);
        }
      } else {
        console.log('Usage: bun adr-parser.ts templates <adrId>');
      }
      break;

    case 'search':
      const hasTemplates = Bun.argv.includes('--templates');
      const minActionability = Bun.argv.includes('--actionable') ? 70 : 0;
      
      const results = parser.searchParsedADRs({
        hasCodeTemplates: hasTemplates,
        minActionability
      });
      
      console.log(`🔍 Found ${results.length} matching ADRs:`);
      results.forEach(result => {
        console.log(`- ${result.id}: ${result.originalADR.title} (${result.metadata.actionabilityScore}% actionable)`);
      });
      break;

    case 'report':
      console.log(parser.generateReport());
      break;

    default:
      console.log(`
🧠 KRINS ADR Parser

Usage: bun adr-parser.ts <command>

Commands:
  parse <adrId>         Parse specific ADR with full analysis
  templates <adrId>     Show code templates for ADR
  search [--templates] [--actionable]  Search parsed ADRs
  report               Generate comprehensive parsing report

Examples:
  bun adr-parser.ts parse ADR-0001
  bun adr-parser.ts templates ADR-0001
  bun adr-parser.ts search --templates --actionable
  bun adr-parser.ts report > parsing-report.md
      `);
  }
}