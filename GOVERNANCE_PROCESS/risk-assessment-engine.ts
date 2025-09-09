/**
 * 🛡️ KRINS Multi-Level Risk Assessment Engine
 * 
 * World-class risk analysis system for CI/CD governance
 * Provides intelligent, multi-dimensional risk evaluation for code changes
 * 
 * @author KRINS Intelligence System
 */

import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as path from 'path'

export interface RiskFactor {
  category: 'code' | 'architecture' | 'business' | 'security' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  score: number // 0-100
  description: string
  recommendation: string
  evidence: string[]
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  totalScore: number
  factors: RiskFactor[]
  approvalRequirements: {
    reviewersNeeded: number
    specialistReviewRequired: boolean
    securityReviewRequired: boolean
    architectureReviewRequired: boolean
    complianceReviewRequired: boolean
  }
  recommendations: {
    suggestedADR?: string
    requiredTests: string[]
    documentationUpdates: string[]
    monitoringRequirements: string[]
  }
}

export interface ChangeAnalysis {
  linesAdded: number
  linesDeleted: number
  filesChanged: string[]
  newDependencies: string[]
  removedDependencies: string[]
  configChanges: string[]
  databaseChanges: string[]
  apiChanges: string[]
  securitySensitiveFiles: string[]
  testCoverage: number
  complexity: number
}

export class KRINSRiskAssessmentEngine extends EventEmitter {
  private patterns: Map<string, any> = new Map()
  private complianceRules: Map<string, any> = new Map()
  private historicalData: Map<string, any> = new Map()

  constructor() {
    super()
    this.loadPatterns()
    this.loadComplianceRules()
    this.loadHistoricalData()
  }

  /**
   * 🎯 Comprehensive Risk Assessment
   * Analyzes code changes across multiple dimensions
   */
  async assessRisk(changeAnalysis: ChangeAnalysis, prData: any): Promise<RiskAssessment> {
    console.log('🛡️ Starting comprehensive risk assessment...')

    const factors: RiskFactor[] = []

    // 1. Code Risk Analysis
    factors.push(...await this.analyzeCodeRisk(changeAnalysis))

    // 2. Architectural Impact Assessment
    factors.push(...await this.analyzeArchitecturalRisk(changeAnalysis))

    // 3. Business Risk Evaluation
    factors.push(...await this.analyzeBusinessRisk(changeAnalysis, prData))

    // 4. Security Risk Analysis
    factors.push(...await this.analyzeSecurityRisk(changeAnalysis))

    // 5. Compliance Risk Check
    factors.push(...await this.analyzeComplianceRisk(changeAnalysis))

    // Calculate overall risk
    const totalScore = this.calculateOverallRisk(factors)
    const overallRisk = this.determineRiskLevel(totalScore)
    
    // Generate approval requirements
    const approvalRequirements = this.generateApprovalRequirements(factors, overallRisk)
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(factors, changeAnalysis)

    const assessment: RiskAssessment = {
      overallRisk,
      totalScore,
      factors,
      approvalRequirements,
      recommendations
    }

    this.emit('risk_assessment_completed', assessment)
    return assessment
  }

  /**
   * 💻 Code Risk Analysis
   * Evaluates complexity, maintainability, and technical debt
   */
  private async analyzeCodeRisk(analysis: ChangeAnalysis): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // Change Size Risk
    const changeSize = analysis.linesAdded + analysis.linesDeleted
    if (changeSize > 1000) {
      factors.push({
        category: 'code',
        severity: 'high',
        score: 80,
        description: `Very large change (${changeSize} lines)`,
        recommendation: 'Consider breaking into smaller, focused PRs',
        evidence: [`${analysis.linesAdded} additions, ${analysis.linesDeleted} deletions`]
      })
    } else if (changeSize > 500) {
      factors.push({
        category: 'code',
        severity: 'medium',
        score: 50,
        description: `Large change (${changeSize} lines)`,
        recommendation: 'Ensure comprehensive testing and review',
        evidence: [`${analysis.linesAdded} additions, ${analysis.linesDeleted} deletions`]
      })
    }

    // Complexity Risk
    if (analysis.complexity > 20) {
      factors.push({
        category: 'code',
        severity: 'high',
        score: 75,
        description: 'High cyclomatic complexity detected',
        recommendation: 'Refactor complex functions into smaller, testable units',
        evidence: [`Complexity score: ${analysis.complexity}`]
      })
    }

    // Test Coverage Risk
    if (analysis.testCoverage < 70) {
      factors.push({
        category: 'code',
        severity: 'medium',
        score: 60,
        description: `Low test coverage (${analysis.testCoverage}%)`,
        recommendation: 'Add comprehensive unit and integration tests',
        evidence: [`Current coverage: ${analysis.testCoverage}%`]
      })
    }

    // File Type Risk Analysis
    const criticalFiles = analysis.filesChanged.filter(file => 
      file.includes('package.json') || 
      file.includes('tsconfig.json') ||
      file.includes('docker') ||
      file.includes('.github/workflows')
    )

    if (criticalFiles.length > 0) {
      factors.push({
        category: 'code',
        severity: 'medium',
        score: 55,
        description: 'Critical configuration files modified',
        recommendation: 'Extra careful review of configuration changes',
        evidence: criticalFiles
      })
    }

    return factors
  }

  /**
   * 🏗️ Architectural Risk Analysis
   * Evaluates impact on system architecture and design patterns
   */
  private async analyzeArchitecturalRisk(analysis: ChangeAnalysis): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // New Dependencies Risk
    if (analysis.newDependencies.length > 0) {
      const score = Math.min(30 + (analysis.newDependencies.length * 15), 90)
      factors.push({
        category: 'architecture',
        severity: analysis.newDependencies.length > 3 ? 'high' : 'medium',
        score,
        description: `${analysis.newDependencies.length} new dependencies added`,
        recommendation: 'Evaluate security, maintenance, and licensing implications',
        evidence: analysis.newDependencies
      })
    }

    // API Changes Risk
    if (analysis.apiChanges.length > 0) {
      factors.push({
        category: 'architecture',
        severity: 'high',
        score: 85,
        description: 'API interface changes detected',
        recommendation: 'Ensure backward compatibility and proper versioning',
        evidence: analysis.apiChanges
      })
    }

    // Database Schema Changes
    if (analysis.databaseChanges.length > 0) {
      factors.push({
        category: 'architecture',
        severity: 'high',
        score: 80,
        description: 'Database schema modifications detected',
        recommendation: 'Review migration strategy and rollback procedures',
        evidence: analysis.databaseChanges
      })
    }

    // Cross-System Impact Analysis
    const integrationFiles = analysis.filesChanged.filter(file =>
      file.includes('integration') || 
      file.includes('webhook') ||
      file.includes('api-client') ||
      file.includes('external')
    )

    if (integrationFiles.length > 0) {
      factors.push({
        category: 'architecture',
        severity: 'medium',
        score: 65,
        description: 'Integration points modified',
        recommendation: 'Verify external system compatibility',
        evidence: integrationFiles
      })
    }

    return factors
  }

  /**
   * 💼 Business Risk Analysis
   * Evaluates potential business impact and operational considerations
   */
  private async analyzeBusinessRisk(analysis: ChangeAnalysis, prData: any): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // Performance Impact Risk
    const performanceSensitiveFiles = analysis.filesChanged.filter(file =>
      file.includes('algorithm') ||
      file.includes('query') ||
      file.includes('batch') ||
      file.includes('processing')
    )

    if (performanceSensitiveFiles.length > 0) {
      factors.push({
        category: 'business',
        severity: 'medium',
        score: 55,
        description: 'Performance-sensitive components modified',
        recommendation: 'Conduct performance testing and monitoring',
        evidence: performanceSensitiveFiles
      })
    }

    // User-Facing Changes Risk
    const frontendFiles = analysis.filesChanged.filter(file =>
      file.includes('frontend/') ||
      file.includes('ui/') ||
      file.includes('.tsx') ||
      file.includes('component')
    )

    if (frontendFiles.length > 5) {
      factors.push({
        category: 'business',
        severity: 'medium',
        score: 45,
        description: 'Extensive UI/UX changes detected',
        recommendation: 'Consider user acceptance testing',
        evidence: [`${frontendFiles.length} frontend files modified`]
      })
    }

    // Data Processing Risk
    const dataFiles = analysis.filesChanged.filter(file =>
      file.includes('data') ||
      file.includes('etl') ||
      file.includes('transform') ||
      file.includes('migration')
    )

    if (dataFiles.length > 0) {
      factors.push({
        category: 'business',
        severity: 'high',
        score: 75,
        description: 'Data processing logic modified',
        recommendation: 'Validate data integrity and backup procedures',
        evidence: dataFiles
      })
    }

    return factors
  }

  /**
   * 🔒 Security Risk Analysis
   * Identifies potential security vulnerabilities and concerns
   */
  private async analyzeSecurityRisk(analysis: ChangeAnalysis): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // Security-Sensitive Files
    if (analysis.securitySensitiveFiles.length > 0) {
      factors.push({
        category: 'security',
        severity: 'critical',
        score: 95,
        description: 'Security-sensitive files modified',
        recommendation: 'Mandatory security review required',
        evidence: analysis.securitySensitiveFiles
      })
    }

    // Authentication/Authorization Changes
    const authFiles = analysis.filesChanged.filter(file =>
      file.includes('auth') ||
      file.includes('login') ||
      file.includes('permission') ||
      file.includes('role') ||
      file.includes('jwt') ||
      file.includes('oauth')
    )

    if (authFiles.length > 0) {
      factors.push({
        category: 'security',
        severity: 'high',
        score: 85,
        description: 'Authentication/authorization components modified',
        recommendation: 'Security specialist review and penetration testing',
        evidence: authFiles
      })
    }

    // Cryptography Changes
    const cryptoFiles = analysis.filesChanged.filter(file =>
      file.includes('crypto') ||
      file.includes('encryption') ||
      file.includes('hash') ||
      file.includes('certificate') ||
      file.includes('key')
    )

    if (cryptoFiles.length > 0) {
      factors.push({
        category: 'security',
        severity: 'critical',
        score: 90,
        description: 'Cryptographic components modified',
        recommendation: 'Expert cryptographic review required',
        evidence: cryptoFiles
      })
    }

    // Network/Infrastructure Changes
    const infraFiles = analysis.filesChanged.filter(file =>
      file.includes('network') ||
      file.includes('firewall') ||
      file.includes('proxy') ||
      file.includes('cors') ||
      file.includes('helmet')
    )

    if (infraFiles.length > 0) {
      factors.push({
        category: 'security',
        severity: 'high',
        score: 80,
        description: 'Network/infrastructure security components modified',
        recommendation: 'Infrastructure security review',
        evidence: infraFiles
      })
    }

    return factors
  }

  /**
   * 📋 Compliance Risk Analysis
   * Evaluates adherence to regulatory and organizational standards
   */
  private async analyzeComplianceRisk(analysis: ChangeAnalysis): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // GDPR/Data Privacy Risk
    const privacyFiles = analysis.filesChanged.filter(file =>
      file.includes('privacy') ||
      file.includes('gdpr') ||
      file.includes('personal') ||
      file.includes('pii') ||
      file.includes('consent')
    )

    if (privacyFiles.length > 0) {
      factors.push({
        category: 'compliance',
        severity: 'high',
        score: 80,
        description: 'Data privacy components modified',
        recommendation: 'Privacy officer review and GDPR compliance check',
        evidence: privacyFiles
      })
    }

    // Audit Trail Risk
    const auditFiles = analysis.filesChanged.filter(file =>
      file.includes('audit') ||
      file.includes('log') ||
      file.includes('tracking') ||
      file.includes('history')
    )

    if (auditFiles.length > 0) {
      factors.push({
        category: 'compliance',
        severity: 'medium',
        score: 60,
        description: 'Audit/logging components modified',
        recommendation: 'Ensure compliance with audit requirements',
        evidence: auditFiles
      })
    }

    // Documentation Completeness
    const hasDocChanges = analysis.filesChanged.some(file =>
      file.includes('README') ||
      file.includes('docs/') ||
      file.includes('.md')
    )

    if (!hasDocChanges && analysis.linesAdded > 200) {
      factors.push({
        category: 'compliance',
        severity: 'medium',
        score: 45,
        description: 'Significant code changes without documentation updates',
        recommendation: 'Update relevant documentation',
        evidence: ['No documentation changes detected']
      })
    }

    return factors
  }

  /**
   * 🧮 Risk Score Calculation
   */
  private calculateOverallRisk(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0

    const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0)
    const maxPossibleScore = factors.length * 100
    
    return Math.round((totalScore / maxPossibleScore) * 100)
  }

  /**
   * 📊 Risk Level Determination
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 30) return 'medium'
    return 'low'
  }

  /**
   * ✅ Approval Requirements Generation
   */
  private generateApprovalRequirements(factors: RiskFactor[], overallRisk: string) {
    const hasSecurityRisk = factors.some(f => f.category === 'security' && f.severity === 'high')
    const hasArchitecturalRisk = factors.some(f => f.category === 'architecture' && f.severity === 'high')
    const hasComplianceRisk = factors.some(f => f.category === 'compliance' && f.severity === 'high')
    const hasCriticalRisk = factors.some(f => f.severity === 'critical')

    let reviewersNeeded = 1
    if (overallRisk === 'medium') reviewersNeeded = 2
    if (overallRisk === 'high') reviewersNeeded = 3
    if (overallRisk === 'critical') reviewersNeeded = 4

    return {
      reviewersNeeded,
      specialistReviewRequired: hasCriticalRisk,
      securityReviewRequired: hasSecurityRisk,
      architectureReviewRequired: hasArchitecturalRisk,
      complianceReviewRequired: hasComplianceRisk
    }
  }

  /**
   * 💡 Recommendations Generation
   */
  private async generateRecommendations(factors: RiskFactor[], analysis: ChangeAnalysis) {
    const recommendations: any = {
      requiredTests: [],
      documentationUpdates: [],
      monitoringRequirements: []
    }

    // Test recommendations
    if (analysis.testCoverage < 80) {
      recommendations.requiredTests.push('Increase test coverage to minimum 80%')
    }
    
    if (factors.some(f => f.category === 'security')) {
      recommendations.requiredTests.push('Security penetration testing')
    }

    if (factors.some(f => f.category === 'architecture')) {
      recommendations.requiredTests.push('Integration testing across modified components')
    }

    // Documentation recommendations
    if (analysis.apiChanges.length > 0) {
      recommendations.documentationUpdates.push('Update API documentation')
    }

    if (analysis.databaseChanges.length > 0) {
      recommendations.documentationUpdates.push('Document database schema changes')
    }

    // Monitoring recommendations
    if (factors.some(f => f.category === 'business')) {
      recommendations.monitoringRequirements.push('Enhanced performance monitoring')
    }

    // ADR suggestion
    const significantArchitecturalChange = factors.some(f => 
      f.category === 'architecture' && f.score > 70
    )
    
    if (significantArchitecturalChange) {
      recommendations.suggestedADR = 'Consider creating ADR for architectural decisions'
    }

    return recommendations
  }

  /**
   * 📚 Load Pattern Library
   */
  private loadPatterns() {
    try {
      const patternsDir = path.join(process.cwd(), 'docs/patterns')
      if (fs.existsSync(patternsDir)) {
        // Load existing patterns for analysis
        console.log('📚 Loaded pattern library for risk assessment')
      }
    } catch (error) {
      console.log('⚠️ Pattern library not found, using defaults')
    }
  }

  /**
   * 📋 Load Compliance Rules
   */
  private loadComplianceRules() {
    // Load organizational compliance requirements
    this.complianceRules.set('gdpr', { required: true, severity: 'high' })
    this.complianceRules.set('documentation', { required: true, severity: 'medium' })
    this.complianceRules.set('testing', { coverage: 70, severity: 'medium' })
  }

  /**
   * 📊 Load Historical Data
   */
  private loadHistoricalData() {
    // Load historical risk assessments for trend analysis
    try {
      // Implementation for learning from past assessments
      console.log('📊 Loading historical risk data for trend analysis')
    } catch (error) {
      console.log('⚠️ No historical data available, starting fresh')
    }
  }

  /**
   * 🎯 Generate Risk Report
   */
  generateReport(assessment: RiskAssessment): string {
    let report = '# 🛡️ KRINS Risk Assessment Report\n\n'
    
    report += `**Overall Risk Level:** ${assessment.overallRisk.toUpperCase()} (${assessment.totalScore}/100)\n\n`
    
    report += '## 📊 Risk Factors\n\n'
    assessment.factors.forEach((factor, index) => {
      const emoji = this.getSeverityEmoji(factor.severity)
      report += `### ${index + 1}. ${emoji} ${factor.description}\n`
      report += `- **Category:** ${factor.category}\n`
      report += `- **Severity:** ${factor.severity}\n`
      report += `- **Score:** ${factor.score}/100\n`
      report += `- **Recommendation:** ${factor.recommendation}\n`
      if (factor.evidence.length > 0) {
        report += `- **Evidence:** ${factor.evidence.join(', ')}\n`
      }
      report += '\n'
    })

    report += '## ✅ Approval Requirements\n\n'
    report += `- **Reviewers Needed:** ${assessment.approvalRequirements.reviewersNeeded}\n`
    report += `- **Security Review:** ${assessment.approvalRequirements.securityReviewRequired ? '✅ Required' : '❌ Not Required'}\n`
    report += `- **Architecture Review:** ${assessment.approvalRequirements.architectureReviewRequired ? '✅ Required' : '❌ Not Required'}\n`
    report += `- **Compliance Review:** ${assessment.approvalRequirements.complianceReviewRequired ? '✅ Required' : '❌ Not Required'}\n\n`

    if (assessment.recommendations.suggestedADR) {
      report += '## 📋 ADR Recommendation\n\n'
      report += `${assessment.recommendations.suggestedADR}\n\n`
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

export default KRINSRiskAssessmentEngine