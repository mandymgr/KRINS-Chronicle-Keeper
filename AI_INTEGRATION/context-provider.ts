#!/usr/bin/env bun
/**
 * 🧠 Enhanced Context Provider - Unified AI Intelligence System
 * 
 * Advanced context provider that supplies architectural decisions, patterns,
 * and organizational intelligence to AI development systems.
 * Now integrated with Krin Personal Companion for dual intelligence!
 * 
 * @version 2.0.0 - Chronicle Keeper + Krin Integration
 */

import { DecisionTracker, ADR } from '../DECISION_MANAGEMENT/decision-tracker';
import { DecisionLinker } from '../DECISION_MANAGEMENT/decision-linker';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

export interface AIContext {
  id: string;
  timestamp: Date;
  requestSource: string;
  contextType: 'architectural' | 'pattern' | 'decision' | 'knowledge' | 'comprehensive';
  scope: {
    components: string[];
    technologies: string[];
    domains: string[];
  };
  decisions: ContextualADR[];
  patterns: ContextualPattern[];
  constraints: ArchitecturalConstraint[];
  recommendations: string[];
  confidence: number; // 0-100
  relevanceScore: number; // 0-100
  metadata: {
    generatedBy: string;
    chronicleKeeperVersion: string;
    processingTimeMs: number;
    totalADRsAnalyzed: number;
    totalPatternsAnalyzed: number;
  };
}

export interface ContextualADR {
  id: string;
  title: string;
  status: ADR['status'];
  component: string;
  problem: string;
  decision: string;
  rationale: string;
  relevanceScore: number; // 0-100 how relevant to current context
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  implementationGuidance: string;
  relatedDecisions: string[];
  codeExamples?: string[];
  avoidPatterns?: string[];
  mustFollowPatterns?: string[];
}

export interface ContextualPattern {
  id: string;
  name: string;
  category: 'architectural' | 'design' | 'coding' | 'testing' | 'deployment';
  language?: string;
  description: string;
  whenToUse: string;
  whenNotToUse: string;
  implementation: string;
  codeExample: string;
  relatedADRs: string[];
  complexity: 'low' | 'medium' | 'high';
  maturity: 'experimental' | 'proven' | 'deprecated';
}

export interface ArchitecturalConstraint {
  type: 'technology' | 'security' | 'performance' | 'compliance' | 'business';
  description: string;
  enforcementLevel: 'must' | 'should' | 'may' | 'must_not';
  rationale: string;
  relatedADRs: string[];
  validationCriteria?: string[];
}

export interface ContextRequest {
  source: string; // 'universe-builder', 'claude-code', 'external-ai'
  requestType: 'code-generation' | 'architecture-review' | 'pattern-suggestion' | 'decision-support';
  scope: {
    components?: string[];
    technologies?: string[];
    domains?: string[];
    problemDescription?: string;
  };
  currentCode?: string;
  proposedChanges?: string;
  filters?: {
    includeDeprecated?: boolean;
    minConfidence?: number;
    maxResults?: number;
    prioritizeRecent?: boolean;
  };
}

export class ContextProvider {
  private decisionTracker: DecisionTracker;
  private decisionLinker: DecisionLinker;
  private chronicleKeeperPath: string;
  private patternsCache = new Map<string, ContextualPattern>();
  private contextCache = new Map<string, AIContext>();

  constructor(chronicleKeeperPath: string = process.cwd()) {
    this.chronicleKeeperPath = chronicleKeeperPath;
    this.decisionTracker = new DecisionTracker(chronicleKeeperPath);
    this.decisionLinker = new DecisionLinker(chronicleKeeperPath);
    this.loadPatterns();
  }

  /**
   * 🎯 Generate AI context based on request
   */
  async generateContext(request: ContextRequest): Promise<AIContext> {
    const startTime = Date.now();

    // Generate cache key
    const cacheKey = this.generateCacheKey(request);
    if (this.contextCache.has(cacheKey)) {
      const cached = this.contextCache.get(cacheKey)!;
      console.log('🚀 Returning cached context');
      return cached;
    }

    const context: AIContext = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      requestSource: request.source,
      contextType: this.determineContextType(request),
      scope: {
        components: request.scope.components || [],
        technologies: request.scope.technologies || [],
        domains: request.scope.domains || []
      },
      decisions: [],
      patterns: [],
      constraints: [],
      recommendations: [],
      confidence: 0,
      relevanceScore: 0,
      metadata: {
        generatedBy: 'KRINS-Chronicle-Keeper-ContextProvider',
        chronicleKeeperVersion: '3.0.0',
        processingTimeMs: 0,
        totalADRsAnalyzed: 0,
        totalPatternsAnalyzed: 0
      }
    };

    // Gather relevant ADRs
    context.decisions = await this.gatherRelevantADRs(request);
    context.metadata.totalADRsAnalyzed = context.decisions.length;

    // Gather relevant patterns
    context.patterns = await this.gatherRelevantPatterns(request);
    context.metadata.totalPatternsAnalyzed = context.patterns.length;

    // Extract architectural constraints
    context.constraints = await this.extractConstraints(context.decisions);

    // Generate recommendations
    context.recommendations = await this.generateRecommendations(request, context);

    // Calculate confidence and relevance
    context.confidence = this.calculateConfidence(context);
    context.relevanceScore = this.calculateRelevance(request, context);

    // Update metadata
    context.metadata.processingTimeMs = Date.now() - startTime;

    // Cache the result
    this.contextCache.set(cacheKey, context);
    
    console.log(`🧠 Generated AI context: ${context.decisions.length} decisions, ${context.patterns.length} patterns`);
    return context;
  }

  /**
   * 🎯 Determine context type based on request
   */
  private determineContextType(request: ContextRequest): AIContext['contextType'] {
    switch (request.requestType) {
      case 'code-generation':
        return 'pattern';
      case 'architecture-review':
        return 'architectural';
      case 'decision-support':
        return 'decision';
      default:
        return 'comprehensive';
    }
  }

  /**
   * 📋 Gather relevant ADRs for the request
   */
  private async gatherRelevantADRs(request: ContextRequest): Promise<ContextualADR[]> {
    const allADRs = this.decisionTracker.getAllADRs();
    const contextualADRs: ContextualADR[] = [];

    for (const adr of allADRs) {
      // Skip deprecated unless explicitly requested
      if (adr.status === 'deprecated' && !request.filters?.includeDeprecated) {
        continue;
      }

      const relevanceScore = this.calculateADRRelevance(adr, request);
      
      // Filter by minimum confidence
      if (request.filters?.minConfidence && relevanceScore < request.filters.minConfidence) {
        continue;
      }

      const contextualADR: ContextualADR = {
        id: adr.id,
        title: adr.title,
        status: adr.status,
        component: adr.component,
        problem: adr.problem,
        decision: adr.decision,
        rationale: adr.rationale,
        relevanceScore,
        impactLevel: adr.metadata.impact,
        implementationGuidance: this.generateImplementationGuidance(adr),
        relatedDecisions: adr.linkedDecisions,
        codeExamples: this.extractCodeExamples(adr),
        avoidPatterns: this.extractAvoidPatterns(adr),
        mustFollowPatterns: this.extractMustFollowPatterns(adr)
      };

      contextualADRs.push(contextualADR);
    }

    // Sort by relevance score and limit results
    contextualADRs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const maxResults = request.filters?.maxResults || 20;
    return contextualADRs.slice(0, maxResults);
  }

  /**
   * 📊 Calculate ADR relevance score
   */
  private calculateADRRelevance(adr: ADR, request: ContextRequest): number {
    let score = 0;

    // Component matching
    if (request.scope.components) {
      const componentMatch = request.scope.components.some(comp => 
        adr.component.toLowerCase().includes(comp.toLowerCase()) ||
        comp.toLowerCase().includes(adr.component.toLowerCase())
      );
      if (componentMatch) score += 30;
    }

    // Technology matching
    if (request.scope.technologies) {
      const adrText = `${adr.title} ${adr.problem} ${adr.decision} ${adr.rationale}`.toLowerCase();
      const techMatches = request.scope.technologies.filter(tech => 
        adrText.includes(tech.toLowerCase())
      ).length;
      score += Math.min(techMatches * 20, 40);
    }

    // Problem description matching
    if (request.scope.problemDescription) {
      const similarity = this.calculateTextSimilarity(
        adr.problem.toLowerCase(),
        request.scope.problemDescription.toLowerCase()
      );
      score += similarity * 25;
    }

    // Status bonus
    if (adr.status === 'accepted') score += 15;
    else if (adr.status === 'proposed') score += 10;

    // Impact level bonus
    switch (adr.metadata.impact) {
      case 'critical': score += 20; break;
      case 'high': score += 15; break;
      case 'medium': score += 10; break;
      case 'low': score += 5; break;
    }

    // Recency bonus if requested
    if (request.filters?.prioritizeRecent) {
      const daysSinceDecision = (Date.now() - adr.date.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDecision < 30) score += 10;
      else if (daysSinceDecision < 90) score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * 🎨 Gather relevant patterns for the request
   */
  private async gatherRelevantPatterns(request: ContextRequest): Promise<ContextualPattern[]> {
    const relevantPatterns: ContextualPattern[] = [];

    for (const pattern of this.patternsCache.values()) {
      const relevanceScore = this.calculatePatternRelevance(pattern, request);
      
      if (relevanceScore > 30) { // Minimum relevance threshold
        relevantPatterns.push(pattern);
      }
    }

    // Sort by relevance and complexity (prefer simpler patterns for code generation)
    relevantPatterns.sort((a, b) => {
      if (request.requestType === 'code-generation') {
        // For code generation, prefer proven, less complex patterns
        const complexityScore = (pattern: ContextualPattern) => {
          let score = 0;
          if (pattern.maturity === 'proven') score += 20;
          if (pattern.complexity === 'low') score += 15;
          else if (pattern.complexity === 'medium') score += 10;
          return score;
        };
        return complexityScore(b) - complexityScore(a);
      }
      return 0; // Default sorting by order added
    });

    const maxResults = request.filters?.maxResults || 15;
    return relevantPatterns.slice(0, maxResults);
  }

  /**
   * 📊 Calculate pattern relevance score
   */
  private calculatePatternRelevance(pattern: ContextualPattern, request: ContextRequest): number {
    let score = 0;

    // Technology/language matching
    if (request.scope.technologies && pattern.language) {
      const techMatch = request.scope.technologies.some(tech => 
        tech.toLowerCase() === pattern.language.toLowerCase()
      );
      if (techMatch) score += 40;
    }

    // Category matching based on request type
    switch (request.requestType) {
      case 'code-generation':
        if (pattern.category === 'coding' || pattern.category === 'design') score += 25;
        break;
      case 'architecture-review':
        if (pattern.category === 'architectural') score += 30;
        break;
      default:
        score += 10; // Base score for any pattern
    }

    // Maturity bonus
    switch (pattern.maturity) {
      case 'proven': score += 20; break;
      case 'experimental': score += 5; break;
      case 'deprecated': score -= 20; break;
    }

    // Problem description matching
    if (request.scope.problemDescription) {
      const patternText = `${pattern.description} ${pattern.whenToUse}`.toLowerCase();
      if (patternText.includes(request.scope.problemDescription.toLowerCase())) {
        score += 15;
      }
    }

    return Math.max(score, 0);
  }

  /**
   * 🔒 Extract architectural constraints from decisions
   */
  private async extractConstraints(decisions: ContextualADR[]): Promise<ArchitecturalConstraint[]> {
    const constraints: ArchitecturalConstraint[] = [];

    for (const decision of decisions) {
      // Extract security constraints
      if (decision.decision.toLowerCase().includes('security') || 
          decision.decision.toLowerCase().includes('authentication') ||
          decision.decision.toLowerCase().includes('authorization')) {
        constraints.push({
          type: 'security',
          description: `Security requirement from ${decision.id}: ${decision.decision}`,
          enforcementLevel: decision.impactLevel === 'critical' ? 'must' : 'should',
          rationale: decision.rationale,
          relatedADRs: [decision.id]
        });
      }

      // Extract technology constraints
      const techKeywords = ['database', 'framework', 'library', 'platform', 'language'];
      if (techKeywords.some(keyword => decision.decision.toLowerCase().includes(keyword))) {
        constraints.push({
          type: 'technology',
          description: `Technology constraint from ${decision.id}: ${decision.decision}`,
          enforcementLevel: decision.status === 'accepted' ? 'must' : 'should',
          rationale: decision.rationale,
          relatedADRs: [decision.id]
        });
      }

      // Extract performance constraints
      if (decision.decision.toLowerCase().includes('performance') ||
          decision.decision.toLowerCase().includes('latency') ||
          decision.decision.toLowerCase().includes('throughput')) {
        constraints.push({
          type: 'performance',
          description: `Performance constraint from ${decision.id}: ${decision.decision}`,
          enforcementLevel: decision.impactLevel === 'critical' ? 'must' : 'should',
          rationale: decision.rationale,
          relatedADRs: [decision.id]
        });
      }
    }

    return constraints;
  }

  /**
   * 💡 Generate recommendations based on context
   */
  private async generateRecommendations(request: ContextRequest, context: AIContext): Promise<string[]> {
    const recommendations: string[] = [];

    // Pattern-based recommendations
    if (request.requestType === 'code-generation') {
      const provenPatterns = context.patterns.filter(p => p.maturity === 'proven');
      if (provenPatterns.length > 0) {
        recommendations.push(`Use proven patterns: ${provenPatterns.slice(0, 3).map(p => p.name).join(', ')}`);
      }

      // Security recommendations
      const securityConstraints = context.constraints.filter(c => c.type === 'security');
      if (securityConstraints.length > 0) {
        recommendations.push('Ensure all security constraints are implemented as defined in related ADRs');
      }
    }

    // Architecture review recommendations
    if (request.requestType === 'architecture-review') {
      const criticalDecisions = context.decisions.filter(d => d.impactLevel === 'critical');
      if (criticalDecisions.length > 0) {
        recommendations.push(`Review alignment with ${criticalDecisions.length} critical architectural decisions`);
      }

      // Component consistency
      const components = [...new Set(context.decisions.map(d => d.component))];
      if (components.length > 3) {
        recommendations.push('Consider component boundaries and ensure proper separation of concerns');
      }
    }

    // Technology consistency
    const techConstraints = context.constraints.filter(c => c.type === 'technology');
    if (techConstraints.length > 0) {
      recommendations.push('Maintain consistency with established technology stack decisions');
    }

    // Decision support recommendations
    if (request.requestType === 'decision-support') {
      const recentDecisions = context.decisions
        .filter(d => (Date.now() - new Date(d.id.split('-')[1] || '2020').getTime()) < 90 * 24 * 60 * 60 * 1000)
        .slice(0, 5);
      
      if (recentDecisions.length > 0) {
        recommendations.push(`Consider recent decisions: ${recentDecisions.map(d => d.id).join(', ')}`);
      }
    }

    // Generic quality recommendations
    recommendations.push('Follow established coding patterns and architectural guidelines');
    recommendations.push('Ensure proper error handling and logging');
    recommendations.push('Add appropriate tests for new functionality');

    return recommendations;
  }

  /**
   * 🧮 Calculate overall confidence score
   */
  private calculateConfidence(context: AIContext): number {
    let confidence = 50; // Base confidence

    // More decisions = higher confidence (up to a point)
    confidence += Math.min(context.decisions.length * 3, 25);

    // More patterns = higher confidence
    confidence += Math.min(context.patterns.length * 2, 15);

    // Recent decisions = higher confidence
    const recentDecisions = context.decisions.filter(d => 
      (Date.now() - new Date().getTime()) < 180 * 24 * 60 * 60 * 1000 // 6 months
    );
    confidence += Math.min(recentDecisions.length * 2, 10);

    return Math.min(confidence, 100);
  }

  /**
   * 📊 Calculate relevance score
   */
  private calculateRelevance(request: ContextRequest, context: AIContext): number {
    if (context.decisions.length === 0 && context.patterns.length === 0) {
      return 0;
    }

    // Average relevance score of decisions
    const avgDecisionRelevance = context.decisions.length > 0
      ? context.decisions.reduce((sum, d) => sum + d.relevanceScore, 0) / context.decisions.length
      : 0;

    // Weight by number of relevant items found
    const itemCount = context.decisions.length + context.patterns.length;
    const itemCountScore = Math.min(itemCount * 2, 20);

    return Math.min(avgDecisionRelevance + itemCountScore, 100);
  }

  /**
   * 🔧 Generate implementation guidance for ADR
   */
  private generateImplementationGuidance(adr: ADR): string {
    const guidance: string[] = [];

    // Add basic guidance based on decision type
    if (adr.decision.toLowerCase().includes('database')) {
      guidance.push('Ensure proper connection pooling and error handling');
      guidance.push('Consider migration strategies if changing existing database');
    }

    if (adr.decision.toLowerCase().includes('api')) {
      guidance.push('Implement proper versioning strategy');
      guidance.push('Add rate limiting and authentication');
      guidance.push('Document API endpoints with OpenAPI/Swagger');
    }

    if (adr.decision.toLowerCase().includes('security')) {
      guidance.push('Follow security best practices and conduct security review');
      guidance.push('Implement proper input validation and sanitization');
    }

    if (adr.decision.toLowerCase().includes('performance')) {
      guidance.push('Establish performance benchmarks before implementation');
      guidance.push('Monitor key performance metrics post-implementation');
    }

    return guidance.length > 0 
      ? guidance.join('; ')
      : 'Follow standard implementation practices and conduct code review';
  }

  /**
   * 💻 Extract code examples from ADR
   */
  private extractCodeExamples(adr: ADR): string[] {
    const examples: string[] = [];
    
    // Look for code blocks in decision text
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [...adr.decision.matchAll(codeBlockRegex)];
    
    for (const match of matches) {
      examples.push(match[1].trim());
    }

    return examples;
  }

  /**
   * ❌ Extract patterns to avoid from ADR
   */
  private extractAvoidPatterns(adr: ADR): string[] {
    const avoidPatterns: string[] = [];
    
    // Look for "avoid", "don't use", "deprecated" patterns
    const avoidKeywords = ['avoid', 'don\'t use', 'deprecated', 'not recommended'];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();
    
    for (const keyword of avoidKeywords) {
      if (text.includes(keyword)) {
        // Extract the pattern mentioned after the keyword
        const sentences = text.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.includes(keyword)) {
            avoidPatterns.push(sentence.trim());
          }
        }
      }
    }

    return avoidPatterns;
  }

  /**
   * ✅ Extract must-follow patterns from ADR
   */
  private extractMustFollowPatterns(adr: ADR): string[] {
    const mustPatterns: string[] = [];
    
    // Look for "must", "required", "mandatory" patterns
    const mustKeywords = ['must use', 'required', 'mandatory', 'always use'];
    const text = `${adr.decision} ${adr.rationale}`.toLowerCase();
    
    for (const keyword of mustKeywords) {
      if (text.includes(keyword)) {
        const sentences = text.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.includes(keyword)) {
            mustPatterns.push(sentence.trim());
          }
        }
      }
    }

    return mustPatterns;
  }

  /**
   * 📚 Load patterns from patterns directories
   */
  private loadPatterns(): void {
    const patternsDir = join(this.chronicleKeeperPath, 'docs', 'patterns');
    if (!existsSync(patternsDir)) {
      console.warn(`Patterns directory not found: ${patternsDir}`);
      return;
    }

    const categories = ['typescript', 'python', 'java', 'architecture'];
    
    for (const category of categories) {
      const categoryDir = join(patternsDir, category);
      if (!existsSync(categoryDir)) continue;

      const files = readdirSync(categoryDir).filter(f => f.endsWith('.md'));
      
      for (const file of files) {
        try {
          const pattern = this.parsePatternFile(join(categoryDir, file), category);
          if (pattern) {
            this.patternsCache.set(pattern.id, pattern);
          }
        } catch (error) {
          console.error(`Error parsing pattern file ${file}:`, error);
        }
      }
    }

    console.log(`📚 Loaded ${this.patternsCache.size} patterns`);
  }

  /**
   * 📝 Parse pattern file into ContextualPattern
   */
  private parsePatternFile(filePath: string, category: string): ContextualPattern | null {
    const content = readFileSync(filePath, 'utf-8');
    const filename = basename(filePath, '.md');
    
    const sections = this.parseMarkdownSections(content);
    
    // Extract code examples
    const codeBlocks = [...content.matchAll(/```[\w]*\n([\s\S]*?)```/g)];
    const codeExample = codeBlocks.length > 0 ? codeBlocks[0][1].trim() : '';

    const pattern: ContextualPattern = {
      id: `pattern_${category}_${filename}`,
      name: sections.title || filename.replace(/-/g, ' '),
      category: this.mapPatternCategory(category),
      language: category === 'architecture' ? undefined : category,
      description: sections.description || sections.overview || '',
      whenToUse: sections.when_to_use || sections.usage || '',
      whenNotToUse: sections.when_not_to_use || sections.avoid || '',
      implementation: sections.implementation || sections.example || '',
      codeExample,
      relatedADRs: this.extractADRReferences(content),
      complexity: this.assessPatternComplexity(content),
      maturity: this.assessPatternMaturity(content)
    };

    return pattern;
  }

  /**
   * 🗂️ Map category string to ContextualPattern category
   */
  private mapPatternCategory(category: string): ContextualPattern['category'] {
    switch (category) {
      case 'architecture': return 'architectural';
      case 'typescript':
      case 'python':
      case 'java': return 'coding';
      default: return 'design';
    }
  }

  /**
   * 📋 Parse markdown sections
   */
  private parseMarkdownSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('# ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'title';
        currentContent = [line.substring(2)];
      } else if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = line.substring(3).toLowerCase().replace(/\s+/g, '_');
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * 🔗 Extract ADR references from content
   */
  private extractADRReferences(content: string): string[] {
    const adrRefs: string[] = [];
    const matches = content.matchAll(/ADR-(\d{4})/g);
    
    for (const match of matches) {
      const adrId = `ADR-${match[1]}`;
      if (!adrRefs.includes(adrId)) {
        adrRefs.push(adrId);
      }
    }

    return adrRefs;
  }

  /**
   * 🧮 Assess pattern complexity
   */
  private assessPatternComplexity(content: string): ContextualPattern['complexity'] {
    const wordCount = content.split(/\s+/).length;
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    
    if (wordCount > 800 || codeBlocks > 3) return 'high';
    if (wordCount > 400 || codeBlocks > 1) return 'medium';
    return 'low';
  }

  /**
   * 📊 Assess pattern maturity
   */
  private assessPatternMaturity(content: string): ContextualPattern['maturity'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('experimental') || lowerContent.includes('draft')) {
      return 'experimental';
    }
    if (lowerContent.includes('deprecated') || lowerContent.includes('obsolete')) {
      return 'deprecated';
    }
    return 'proven'; // Default
  }

  /**
   * 📊 Calculate text similarity (simple implementation)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const intersection = words1.filter(w => words2.includes(w));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * 🔑 Generate cache key for request
   */
  private generateCacheKey(request: ContextRequest): string {
    const keyParts = [
      request.source,
      request.requestType,
      JSON.stringify(request.scope),
      JSON.stringify(request.filters || {})
    ];
    return Buffer.from(keyParts.join('|')).toString('base64');
  }

  /**
   * 📤 Export context for external AI systems
   */
  exportForAI(context: AIContext): string {
    return `# 🧠 KRINS Organizational Intelligence Context

## 📋 Architectural Decisions (${context.decisions.length})
${context.decisions.map(d => `
### ${d.id}: ${d.title}
- **Status:** ${d.status}
- **Component:** ${d.component}
- **Impact:** ${d.impactLevel}
- **Relevance:** ${d.relevanceScore}%

**Problem:** ${d.problem}

**Decision:** ${d.decision}

**Implementation Guidance:** ${d.implementationGuidance}

${d.mustFollowPatterns?.length ? `**Must Follow:** ${d.mustFollowPatterns.join('; ')}` : ''}
${d.avoidPatterns?.length ? `**Avoid:** ${d.avoidPatterns.join('; ')}` : ''}
`).join('\n')}

## 🎨 Relevant Patterns (${context.patterns.length})
${context.patterns.map(p => `
### ${p.name} (${p.category})
${p.language ? `**Language:** ${p.language}` : ''}
**Complexity:** ${p.complexity} | **Maturity:** ${p.maturity}

**Description:** ${p.description}

**When to use:** ${p.whenToUse}

**Implementation:**
\`\`\`${p.language || ''}
${p.codeExample}
\`\`\`
`).join('\n')}

## 🔒 Architectural Constraints (${context.constraints.length})
${context.constraints.map(c => `
- **${c.type.toUpperCase()}** (${c.enforcementLevel}): ${c.description}
  - Rationale: ${c.rationale}
`).join('\n')}

## 💡 Recommendations
${context.recommendations.map(r => `- ${r}`).join('\n')}

---
**Context ID:** ${context.id}
**Generated:** ${context.timestamp.toISOString()}
**Confidence:** ${context.confidence}%
**Relevance:** ${context.relevanceScore}%
`;
  }
}

// CLI interface
if (import.meta.main) {
  const provider = new ContextProvider();
  
  const command = Bun.argv[2];
  
  switch (command) {
    case 'generate':
      const source = Bun.argv[3] || 'cli';
      const requestType = Bun.argv[4] as ContextRequest['requestType'] || 'code-generation';
      const problemDescription = Bun.argv[5] || 'General context request';
      
      const request: ContextRequest = {
        source,
        requestType,
        scope: { problemDescription },
        filters: { maxResults: 10 }
      };

      provider.generateContext(request).then(context => {
        console.log(provider.exportForAI(context));
      }).catch(console.error);
      break;

    case 'export':
      const contextId = Bun.argv[3];
      if (contextId) {
        // In a real implementation, would load context by ID
        console.log('Context export functionality would be implemented here');
      } else {
        console.log('Usage: bun context-provider.ts export <contextId>');
      }
      break;

    default:
      console.log(`
🧠 KRINS Context Provider

Usage: bun context-provider.ts <command>

Commands:
  generate <source> <type> <problem>    Generate AI context
  export <contextId>                    Export context by ID

Request Types:
  - code-generation
  - architecture-review
  - pattern-suggestion
  - decision-support

Examples:
  bun context-provider.ts generate universe-builder code-generation "Create user authentication"
  bun context-provider.ts generate claude-code architecture-review "API design review"
      `);
  }
}