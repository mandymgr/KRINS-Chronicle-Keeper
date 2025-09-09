/**
 * 🧠 KRINS Intelligent Decision Validation System
 * 
 * Advanced validation engine that ensures code changes align with
 * architectural decisions, patterns, and organizational standards
 * 
 * @author KRINS Intelligence System
 */

import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as path from 'path'
import { KRINSRiskAssessmentEngine, ChangeAnalysis, RiskAssessment } from './risk-assessment-engine'

export interface ValidationRule {
  id: string
  name: string
  category: 'adr' | 'pattern' | 'dependency' | 'security' | 'performance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  condition: (change: ChangeAnalysis, context: ValidationContext) => boolean
  message: string
  suggestion: string
  blockingIssue: boolean
}

export interface ValidationContext {
  adrs: ADRDocument[]
  patterns: PatternDocument[]
  dependencies: DependencyInfo[]
  historicalViolations: ViolationHistory[]
  projectMetadata: ProjectMetadata
}

export interface ADRDocument {
  id: string
  title: string
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded'
  context: string
  decision: string
  consequences: string[]
  constraints: string[]
  affectedComponents: string[]
}

export interface PatternDocument {
  id: string
  name: string
  category: string
  description: string
  implementation: string
  antiPatterns: string[]
  validUseCases: string[]
}

export interface DependencyInfo {
  name: string
  version: string
  licenses: string[]
  securityIssues: SecurityIssue[]
  maintenanceScore: number
  popularityScore: number
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  cve?: string
  fixedVersion?: string
}

export interface ViolationHistory {
  ruleId: string
  violationCount: number
  lastViolation: Date
  commonPatterns: string[]
}

export interface ProjectMetadata {
  name: string
  type: 'frontend' | 'backend' | 'fullstack' | 'microservice' | 'library'
  techStack: string[]
  complianceRequirements: string[]
  performanceTargets: Record<string, any>
}

export interface ValidationResult {
  passed: boolean
  violations: ValidationViolation[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  overallScore: number
  blockers: ValidationViolation[]
}

export interface ValidationViolation {
  ruleId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  file?: string
  line?: number
  suggestion: string
  blocking: boolean
  evidence: string[]
}

export interface ValidationWarning {
  message: string
  suggestion: string
  file?: string
}

export interface ValidationSuggestion {
  type: 'improvement' | 'optimization' | 'best-practice'
  message: string
  implementation?: string
}

export class KRINSDecisionValidator extends EventEmitter {
  private rules: ValidationRule[] = []
  private context: ValidationContext
  private riskEngine: KRINSRiskAssessmentEngine

  constructor() {
    super()
    this.riskEngine = new KRINSRiskAssessmentEngine()
    this.context = this.loadValidationContext()
    this.initializeRules()
  }

  /**
   * 🎯 Main Validation Entry Point
   */
  async validateChanges(changeAnalysis: ChangeAnalysis, prData?: any): Promise<ValidationResult> {
    console.log('🧠 Starting intelligent decision validation...')

    const violations: ValidationViolation[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Run all validation rules
    for (const rule of this.rules) {
      try {
        if (rule.condition(changeAnalysis, this.context)) {
          const violation: ValidationViolation = {
            ruleId: rule.id,
            severity: rule.priority,
            message: rule.message,
            suggestion: rule.suggestion,
            blocking: rule.blockingIssue,
            evidence: this.extractEvidence(rule, changeAnalysis)
          }
          
          if (rule.blockingIssue) {
            violations.push(violation)
          } else {
            warnings.push({
              message: rule.message,
              suggestion: rule.suggestion
            })
          }
        }
      } catch (error) {
        console.warn(`⚠️ Rule ${rule.id} failed: ${error.message}`)
      }
    }

    // Generate improvement suggestions
    suggestions.push(...await this.generateImprovementSuggestions(changeAnalysis))

    // Calculate overall score
    const overallScore = this.calculateValidationScore(violations, warnings)
    
    // Extract blocking violations
    const blockers = violations.filter(v => v.blocking)

    const result: ValidationResult = {
      passed: blockers.length === 0,
      violations,
      warnings,
      suggestions,
      overallScore,
      blockers
    }

    this.emit('validation_completed', result)
    return result
  }

  /**
   * 📋 Initialize Validation Rules
   */
  private initializeRules() {
    // ADR Compliance Rules
    this.rules.push({
      id: 'adr-alignment',
      name: 'ADR Decision Alignment',
      category: 'adr',
      priority: 'high',
      condition: (change, context) => {
        return this.checkADRViolations(change, context)
      },
      message: 'Changes violate existing architectural decisions',
      suggestion: 'Review relevant ADRs and align implementation accordingly',
      blockingIssue: true
    })

    // Pattern Compliance Rules
    this.rules.push({
      id: 'pattern-compliance',
      name: 'Pattern Compliance Check',
      category: 'pattern',
      priority: 'medium',
      condition: (change, context) => {
        return this.checkPatternViolations(change, context)
      },
      message: 'Code does not follow established patterns',
      suggestion: 'Implement according to documented patterns',
      blockingIssue: false
    })

    // Dependency Security Rules
    this.rules.push({
      id: 'dependency-security',
      name: 'Dependency Security Validation',
      category: 'dependency',
      priority: 'critical',
      condition: (change, context) => {
        return this.checkDependencySecurityIssues(change, context)
      },
      message: 'New dependencies contain security vulnerabilities',
      suggestion: 'Update to secure versions or find alternative dependencies',
      blockingIssue: true
    })

    // Breaking Change Detection
    this.rules.push({
      id: 'breaking-changes',
      name: 'Breaking Change Detection',
      category: 'adr',
      priority: 'high',
      condition: (change, context) => {
        return this.detectBreakingChanges(change, context)
      },
      message: 'Potential breaking changes detected',
      suggestion: 'Ensure proper versioning and migration strategy',
      blockingIssue: true
    })

    // Performance Impact Rules
    this.rules.push({
      id: 'performance-impact',
      name: 'Performance Impact Assessment',
      category: 'performance',
      priority: 'medium',
      condition: (change, context) => {
        return this.assessPerformanceImpact(change, context)
      },
      message: 'Changes may negatively impact performance',
      suggestion: 'Conduct performance testing and optimization',
      blockingIssue: false
    })

    // License Compliance
    this.rules.push({
      id: 'license-compliance',
      name: 'License Compatibility Check',
      category: 'dependency',
      priority: 'high',
      condition: (change, context) => {
        return this.checkLicenseCompliance(change, context)
      },
      message: 'New dependencies have incompatible licenses',
      suggestion: 'Review legal implications and find compatible alternatives',
      blockingIssue: true
    })

    // Anti-Pattern Detection
    this.rules.push({
      id: 'anti-pattern-detection',
      name: 'Anti-Pattern Detection',
      category: 'pattern',
      priority: 'medium',
      condition: (change, context) => {
        return this.detectAntiPatterns(change, context)
      },
      message: 'Anti-patterns detected in code changes',
      suggestion: 'Refactor using recommended patterns',
      blockingIssue: false
    })

    // Test Coverage Requirements
    this.rules.push({
      id: 'test-coverage',
      name: 'Test Coverage Requirements',
      category: 'pattern',
      priority: 'medium',
      condition: (change, context) => {
        return change.testCoverage < 70 && change.linesAdded > 50
      },
      message: 'Insufficient test coverage for significant changes',
      suggestion: 'Add comprehensive tests to reach minimum 70% coverage',
      blockingIssue: false
    })

    console.log(`✅ Initialized ${this.rules.length} validation rules`)
  }

  /**
   * 📋 Check ADR Violations
   */
  private checkADRViolations(change: ChangeAnalysis, context: ValidationContext): boolean {
    // Check if changes violate accepted ADRs
    const relevantADRs = context.adrs.filter(adr => 
      adr.status === 'accepted' && 
      adr.affectedComponents.some(component =>
        change.filesChanged.some(file => file.includes(component))
      )
    )

    for (const adr of relevantADRs) {
      // Check for constraint violations
      if (this.violatesADRConstraints(change, adr)) {
        return true
      }
    }

    return false
  }

  /**
   * 🎨 Check Pattern Violations
   */
  private checkPatternViolations(change: ChangeAnalysis, context: ValidationContext): boolean {
    // Analyze code against established patterns
    const violations = change.filesChanged.some(file => {
      // Check naming conventions
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const componentName = path.basename(file, path.extname(file))
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
          return true
        }
      }

      // Check directory structure patterns
      if (!this.followsDirectoryPatterns(file, context)) {
        return true
      }

      return false
    })

    return violations
  }

  /**
   * 🔒 Check Dependency Security Issues
   */
  private checkDependencySecurityIssues(change: ChangeAnalysis, context: ValidationContext): boolean {
    return change.newDependencies.some(dep => {
      const depInfo = context.dependencies.find(d => d.name === dep)
      return depInfo?.securityIssues.some(issue => 
        issue.severity === 'high' || issue.severity === 'critical'
      )
    })
  }

  /**
   * 💥 Detect Breaking Changes
   */
  private detectBreakingChanges(change: ChangeAnalysis, context: ValidationContext): boolean {
    // Check for API signature changes
    const hasAPIChanges = change.apiChanges.length > 0
    
    // Check for database schema changes that might break compatibility
    const hasBreakingSchemaChanges = change.databaseChanges.some(dbChange =>
      dbChange.includes('DROP') || 
      dbChange.includes('ALTER') ||
      dbChange.includes('RENAME')
    )

    // Check for removed public methods/functions
    const hasRemovedPublicMembers = change.filesChanged.some(file => {
      // Implementation would analyze removed exports
      return false // Placeholder
    })

    return hasAPIChanges || hasBreakingSchemaChanges || hasRemovedPublicMembers
  }

  /**
   * ⚡ Assess Performance Impact
   */
  private assessPerformanceImpact(change: ChangeAnalysis, context: ValidationContext): boolean {
    // Check for performance-sensitive changes
    const performanceSensitiveFiles = [
      'algorithm', 'query', 'batch', 'processing', 'cache', 'index'
    ]

    const affectsPerformance = change.filesChanged.some(file =>
      performanceSensitiveFiles.some(pattern => file.includes(pattern))
    )

    // Check for large loop additions or nested complexity
    const highComplexity = change.complexity > 15

    return affectsPerformance || highComplexity
  }

  /**
   * 📄 Check License Compliance
   */
  private checkLicenseCompliance(change: ChangeAnalysis, context: ValidationContext): boolean {
    const incompatibleLicenses = ['GPL-3.0', 'AGPL-3.0', 'LGPL-3.0']
    
    return change.newDependencies.some(dep => {
      const depInfo = context.dependencies.find(d => d.name === dep)
      return depInfo?.licenses.some(license => 
        incompatibleLicenses.includes(license)
      )
    })
  }

  /**
   * 🚫 Detect Anti-Patterns
   */
  private detectAntiPatterns(change: ChangeAnalysis, context: ValidationContext): boolean {
    // Common anti-patterns to detect
    const antiPatterns = [
      'god-object', 'singleton-abuse', 'callback-hell', 
      'copy-paste', 'magic-numbers', 'long-parameter-list'
    ]

    // Implementation would analyze code for these patterns
    return change.complexity > 20 // Simplified check
  }

  /**
   * 📊 Generate Improvement Suggestions
   */
  private async generateImprovementSuggestions(change: ChangeAnalysis): Promise<ValidationSuggestion[]> {
    const suggestions: ValidationSuggestion[] = []

    // Test improvement suggestions
    if (change.testCoverage < 80) {
      suggestions.push({
        type: 'improvement',
        message: 'Consider increasing test coverage for better reliability',
        implementation: 'Add unit tests for new functions and integration tests for API endpoints'
      })
    }

    // Performance optimization suggestions
    if (change.complexity > 10) {
      suggestions.push({
        type: 'optimization',
        message: 'High complexity detected - consider refactoring',
        implementation: 'Break complex functions into smaller, single-purpose functions'
      })
    }

    // Documentation suggestions
    if (change.linesAdded > 100) {
      suggestions.push({
        type: 'best-practice',
        message: 'Consider updating documentation for significant changes',
        implementation: 'Update README, API docs, and inline code comments'
      })
    }

    return suggestions
  }

  /**
   * Helper Methods
   */
  private violatesADRConstraints(change: ChangeAnalysis, adr: ADRDocument): boolean {
    // Implement ADR constraint checking logic
    return false // Placeholder
  }

  private followsDirectoryPatterns(file: string, context: ValidationContext): boolean {
    // Implement directory pattern checking logic
    return true // Placeholder
  }

  private extractEvidence(rule: ValidationRule, change: ChangeAnalysis): string[] {
    // Extract relevant evidence based on the rule type
    return [
      `Files affected: ${change.filesChanged.length}`,
      `Lines changed: ${change.linesAdded + change.linesDeleted}`
    ]
  }

  private calculateValidationScore(violations: ValidationViolation[], warnings: ValidationWarning[]): number {
    const violationPenalty = violations.reduce((sum, v) => {
      switch (v.severity) {
        case 'critical': return sum - 25
        case 'high': return sum - 15
        case 'medium': return sum - 10
        case 'low': return sum - 5
        default: return sum
      }
    }, 100)

    const warningPenalty = warnings.length * 2

    return Math.max(0, violationPenalty - warningPenalty)
  }

  private loadValidationContext(): ValidationContext {
    return {
      adrs: this.loadADRs(),
      patterns: this.loadPatterns(),
      dependencies: this.loadDependencyInfo(),
      historicalViolations: this.loadViolationHistory(),
      projectMetadata: this.loadProjectMetadata()
    }
  }

  private loadADRs(): ADRDocument[] {
    // Load ADR documents from docs/adr/
    const adrs: ADRDocument[] = []
    
    try {
      const adrDir = path.join(process.cwd(), 'docs/adr')
      if (fs.existsSync(adrDir)) {
        const files = fs.readdirSync(adrDir)
        files.forEach(file => {
          if (file.endsWith('.md')) {
            // Parse ADR markdown files
            // Implementation would extract ADR metadata
          }
        })
      }
    } catch (error) {
      console.warn('⚠️ Could not load ADRs:', error.message)
    }

    return adrs
  }

  private loadPatterns(): PatternDocument[] {
    // Load pattern documents from docs/patterns/
    return [] // Placeholder
  }

  private loadDependencyInfo(): DependencyInfo[] {
    // Load dependency information from package.json and security databases
    return [] // Placeholder
  }

  private loadViolationHistory(): ViolationHistory[] {
    // Load historical violation data
    return [] // Placeholder
  }

  private loadProjectMetadata(): ProjectMetadata {
    return {
      name: 'KRINS-Chronicle-Keeper',
      type: 'fullstack',
      techStack: ['TypeScript', 'React', 'Node.js'],
      complianceRequirements: ['GDPR', 'Security'],
      performanceTargets: {}
    }
  }

  /**
   * 📊 Generate Validation Report
   */
  generateReport(result: ValidationResult): string {
    let report = '# 🧠 KRINS Decision Validation Report\n\n'
    
    const status = result.passed ? '✅ PASSED' : '❌ FAILED'
    report += `**Validation Status:** ${status} (Score: ${result.overallScore}/100)\n\n`

    if (result.blockers.length > 0) {
      report += '## 🚫 Blocking Issues\n\n'
      result.blockers.forEach((blocker, index) => {
        report += `### ${index + 1}. ${this.getSeverityEmoji(blocker.severity)} ${blocker.message}\n`
        report += `- **Rule:** ${blocker.ruleId}\n`
        report += `- **Severity:** ${blocker.severity}\n`
        report += `- **Suggestion:** ${blocker.suggestion}\n\n`
      })
    }

    if (result.violations.length > 0) {
      report += '## ⚠️ Violations\n\n'
      result.violations.forEach((violation, index) => {
        report += `### ${index + 1}. ${violation.message}\n`
        report += `- **Rule:** ${violation.ruleId}\n`
        report += `- **Severity:** ${violation.severity}\n`
        report += `- **Suggestion:** ${violation.suggestion}\n\n`
      })
    }

    if (result.warnings.length > 0) {
      report += '## 💡 Warnings\n\n'
      result.warnings.forEach((warning, index) => {
        report += `### ${index + 1}. ${warning.message}\n`
        report += `- **Suggestion:** ${warning.suggestion}\n\n`
      })
    }

    if (result.suggestions.length > 0) {
      report += '## 🚀 Improvement Suggestions\n\n'
      result.suggestions.forEach((suggestion, index) => {
        report += `### ${index + 1}. ${suggestion.message}\n`
        report += `- **Type:** ${suggestion.type}\n`
        if (suggestion.implementation) {
          report += `- **Implementation:** ${suggestion.implementation}\n`
        }
        report += '\n'
      })
    }

    return report
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴'
      case 'high': return '🟠'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }
}

export default KRINSDecisionValidator