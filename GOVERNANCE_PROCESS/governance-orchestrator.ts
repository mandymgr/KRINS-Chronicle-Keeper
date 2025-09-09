/**
 * 🎭 KRINS Governance Orchestrator
 * 
 * Central orchestration system that coordinates all governance components:
 * - Risk Assessment Engine
 * - Decision Validator
 * - Architectural Advisor
 * - Review Assignment
 * - Compliance Monitoring
 * 
 * @author KRINS Intelligence System
 */

import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as path from 'path'
import KRINSRiskAssessmentEngine, { ChangeAnalysis, RiskAssessment } from './risk-assessment-engine'
import KRINSDecisionValidator, { ValidationResult } from './decision-validator'
import KRINSArchitecturalAdvisor, { ArchitecturalAdvice } from './architectural-advisor'

export interface GovernanceRequest {
  id: string
  type: 'pull_request' | 'push' | 'scheduled_review'
  metadata: {
    repository: string
    branch: string
    author: string
    title: string
    description?: string
    timestamp: Date
  }
  changes: ChangeAnalysis
  context?: Record<string, any>
}

export interface GovernanceDecision {
  requestId: string
  approved: boolean
  confidence: number // 0-100
  riskAssessment: RiskAssessment
  validationResult: ValidationResult
  architecturalAdvice: ArchitecturalAdvice[]
  requirements: GovernanceRequirements
  recommendations: GovernanceRecommendation[]
  rationale: string
  timestamp: Date
}

export interface GovernanceRequirements {
  reviewers: ReviewerRequirement[]
  approvals: ApprovalRequirement[]
  tests: TestRequirement[]
  documentation: DocumentationRequirement[]
  compliance: ComplianceRequirement[]
}

export interface ReviewerRequirement {
  type: 'individual' | 'team' | 'role'
  identifier: string
  specialty: string
  mandatory: boolean
  reason: string
}

export interface ApprovalRequirement {
  level: 'peer' | 'senior' | 'architect' | 'security' | 'compliance'
  count: number
  specialties: string[]
}

export interface TestRequirement {
  type: 'unit' | 'integration' | 'security' | 'performance' | 'e2e'
  coverage: number
  mandatory: boolean
  reason: string
}

export interface DocumentationRequirement {
  type: 'adr' | 'api_docs' | 'readme' | 'runbook' | 'security_docs'
  action: 'create' | 'update' | 'review'
  mandatory: boolean
  reason: string
}

export interface ComplianceRequirement {
  standard: 'gdpr' | 'security' | 'accessibility' | 'performance'
  check: string
  mandatory: boolean
}

export interface GovernanceRecommendation {
  category: 'improvement' | 'optimization' | 'security' | 'architecture'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  implementation: string[]
  benefits: string[]
}

export interface GovernanceMetrics {
  totalRequests: number
  approvalRate: number
  averageRiskScore: number
  riskDistribution: Record<string, number>
  validationSuccessRate: number
  averageReviewTime: number
  topRiskFactors: Array<{ factor: string; frequency: number }>
  improvementTrends: Array<{ metric: string; trend: 'improving' | 'stable' | 'concerning' }>
}

export class KRINSGovernanceOrchestrator extends EventEmitter {
  private riskEngine: KRINSRiskAssessmentEngine
  private validator: KRINSDecisionValidator
  private advisor: KRINSArchitecturalAdvisor
  private decisions: Map<string, GovernanceDecision> = new Map()
  private metrics: GovernanceMetrics

  constructor() {
    super()
    this.riskEngine = new KRINSRiskAssessmentEngine()
    this.validator = new KRINSDecisionValidator()
    this.advisor = new KRINSArchitecturalAdvisor()
    this.metrics = this.initializeMetrics()
    this.setupEventHandlers()
  }

  /**
   * 🎯 Main Governance Entry Point
   * Orchestrates the complete governance workflow
   */
  async processGovernanceRequest(request: GovernanceRequest): Promise<GovernanceDecision> {
    console.log(`🎭 Processing governance request: ${request.id}`)
    this.emit('governance_request_received', request)

    try {
      // Phase 1: Risk Assessment
      console.log('📊 Phase 1: Comprehensive Risk Assessment')
      const riskAssessment = await this.riskEngine.assessRisk(request.changes, request.metadata)

      // Phase 2: Decision Validation
      console.log('🧠 Phase 2: Intelligent Decision Validation')
      const validationResult = await this.validator.validateChanges(request.changes, request.metadata)

      // Phase 3: Architectural Advisory (for medium+ risk)
      console.log('🏗️ Phase 3: Proactive Architectural Guidance')
      let architecturalAdvice: ArchitecturalAdvice[] = []
      if (riskAssessment.overallRisk !== 'low') {
        architecturalAdvice = await this.advisor.provideGuidance(
          request.metadata.title,
          request.changes.filesChanged,
          request.changes
        )
      }

      // Phase 4: Generate Governance Requirements
      console.log('📋 Phase 4: Generate Governance Requirements')
      const requirements = this.generateRequirements(riskAssessment, validationResult, architecturalAdvice)

      // Phase 5: Generate Recommendations
      console.log('💡 Phase 5: Generate Improvement Recommendations')
      const recommendations = this.generateRecommendations(riskAssessment, validationResult, architecturalAdvice)

      // Phase 6: Make Final Decision
      console.log('🚦 Phase 6: Final Governance Decision')
      const decision = this.makeGovernanceDecision(
        request,
        riskAssessment,
        validationResult,
        architecturalAdvice,
        requirements,
        recommendations
      )

      // Store decision and update metrics
      this.decisions.set(request.id, decision)
      this.updateMetrics(decision)

      this.emit('governance_decision_made', decision)
      console.log(`✅ Governance decision completed: ${decision.approved ? 'APPROVED' : 'BLOCKED'}`)

      return decision

    } catch (error) {
      console.error(`❌ Governance processing failed: ${error.message}`)
      
      // Create fallback decision
      const fallbackDecision: GovernanceDecision = {
        requestId: request.id,
        approved: false,
        confidence: 0,
        riskAssessment: {} as RiskAssessment,
        validationResult: {} as ValidationResult,
        architecturalAdvice: [],
        requirements: this.getDefaultRequirements(),
        recommendations: [],
        rationale: `Governance processing failed: ${error.message}. Manual review required.`,
        timestamp: new Date()
      }

      this.emit('governance_error', { request, error, fallbackDecision })
      return fallbackDecision
    }
  }

  /**
   * 📋 Generate Governance Requirements
   */
  private generateRequirements(
    risk: RiskAssessment,
    validation: ValidationResult,
    advice: ArchitecturalAdvice[]
  ): GovernanceRequirements {
    const requirements: GovernanceRequirements = {
      reviewers: [],
      approvals: [],
      tests: [],
      documentation: [],
      compliance: []
    }

    // Reviewer Requirements
    requirements.reviewers.push({
      type: 'individual',
      identifier: 'tech-lead',
      specialty: 'general',
      mandatory: true,
      reason: 'All changes require technical leadership review'
    })

    if (risk.approvalRequirements.securityReviewRequired) {
      requirements.reviewers.push({
        type: 'team',
        identifier: 'security-team',
        specialty: 'security',
        mandatory: true,
        reason: 'Security-sensitive changes detected'
      })
    }

    if (risk.approvalRequirements.architectureReviewRequired) {
      requirements.reviewers.push({
        type: 'role',
        identifier: 'architect',
        specialty: 'architecture',
        mandatory: true,
        reason: 'Architectural impact detected'
      })
    }

    // Approval Requirements
    const approvalCount = Math.max(2, risk.approvalRequirements.reviewersNeeded)
    requirements.approvals.push({
      level: risk.overallRisk === 'critical' ? 'architect' : 'senior',
      count: approvalCount,
      specialties: this.extractRequiredSpecialties(risk, advice)
    })

    // Test Requirements
    if (validation.violations.some(v => v.ruleId === 'test-coverage')) {
      requirements.tests.push({
        type: 'unit',
        coverage: 80,
        mandatory: true,
        reason: 'Insufficient test coverage detected'
      })
    }

    if (risk.factors.some(f => f.category === 'security')) {
      requirements.tests.push({
        type: 'security',
        coverage: 100,
        mandatory: true,
        reason: 'Security changes require comprehensive security testing'
      })
    }

    // Documentation Requirements
    if (risk.recommendations.suggestedADR) {
      requirements.documentation.push({
        type: 'adr',
        action: 'create',
        mandatory: risk.overallRisk === 'high' || risk.overallRisk === 'critical',
        reason: 'Significant architectural decision requires documentation'
      })
    }

    // Compliance Requirements
    if (risk.factors.some(f => f.category === 'compliance')) {
      requirements.compliance.push({
        standard: 'gdpr',
        check: 'data-privacy-impact-assessment',
        mandatory: true
      })
    }

    return requirements
  }

  /**
   * 💡 Generate Recommendations
   */
  private generateRecommendations(
    risk: RiskAssessment,
    validation: ValidationResult,
    advice: ArchitecturalAdvice[]
  ): GovernanceRecommendation[] {
    const recommendations: GovernanceRecommendation[] = []

    // Risk-based recommendations
    if (risk.overallRisk === 'high' || risk.overallRisk === 'critical') {
      recommendations.push({
        category: 'improvement',
        priority: 'high',
        title: 'Consider Breaking Down Large Changes',
        description: 'This change has high risk due to its size and complexity.',
        implementation: [
          'Split into smaller, focused pull requests',
          'Each PR should address a single concern',
          'Implement incremental rollout strategy'
        ],
        benefits: [
          'Easier to review and understand',
          'Reduced risk of introducing bugs',
          'Faster feedback and iteration'
        ]
      })
    }

    // Validation-based recommendations
    if (!validation.passed) {
      recommendations.push({
        category: 'improvement',
        priority: 'high',
        title: 'Address Validation Issues',
        description: 'Code changes do not comply with established standards.',
        implementation: validation.violations.map(v => v.suggestion),
        benefits: [
          'Improved code quality',
          'Better maintainability',
          'Compliance with organizational standards'
        ]
      })
    }

    // Architecture-based recommendations
    const criticalAdvice = advice.filter(a => a.priority === 'critical' || a.priority === 'high')
    criticalAdvice.forEach(item => {
      recommendations.push({
        category: 'architecture',
        priority: item.priority,
        title: item.title,
        description: item.description,
        implementation: item.implementation,
        benefits: [
          `Maintainability: ${item.impact.maintainability}/10`,
          `Performance: ${item.impact.performance}/10`,
          `Security: ${item.impact.security}/10`
        ]
      })
    })

    // Security recommendations
    if (risk.factors.some(f => f.category === 'security' && f.severity === 'high')) {
      recommendations.push({
        category: 'security',
        priority: 'critical',
        title: 'Implement Security Best Practices',
        description: 'Security-sensitive changes require additional safeguards.',
        implementation: [
          'Conduct security code review',
          'Run security vulnerability scans',
          'Implement additional monitoring',
          'Create security incident response plan'
        ],
        benefits: [
          'Reduced security risk',
          'Better incident response',
          'Improved compliance'
        ]
      })
    }

    return recommendations
  }

  /**
   * 🚦 Make Final Governance Decision
   */
  private makeGovernanceDecision(
    request: GovernanceRequest,
    risk: RiskAssessment,
    validation: ValidationResult,
    advice: ArchitecturalAdvice[],
    requirements: GovernanceRequirements,
    recommendations: GovernanceRecommendation[]
  ): GovernanceDecision {
    let approved = true
    let confidence = 100
    let rationale = 'All governance checks passed successfully.'

    // Check validation blockers
    if (validation.blockers.length > 0) {
      approved = false
      confidence = 0
      rationale = `Validation failed with ${validation.blockers.length} blocking issues: ${
        validation.blockers.map(b => b.message).join(', ')
      }`
    }

    // Check critical risk factors
    const criticalRiskFactors = risk.factors.filter(f => f.severity === 'critical')
    if (criticalRiskFactors.length > 0) {
      approved = false
      confidence = Math.min(confidence, 20)
      rationale += ` Critical risk factors detected: ${
        criticalRiskFactors.map(f => f.description).join(', ')
      }`
    }

    // Adjust confidence based on risk score
    confidence = Math.min(confidence, 100 - risk.totalScore)

    // Check for mandatory requirements
    const mandatoryDocs = requirements.documentation.filter(d => d.mandatory)
    if (mandatoryDocs.length > 0 && risk.overallRisk === 'critical') {
      approved = false
      confidence = Math.min(confidence, 30)
      rationale += ` Mandatory documentation required for critical changes.`
    }

    return {
      requestId: request.id,
      approved,
      confidence,
      riskAssessment: risk,
      validationResult: validation,
      architecturalAdvice: advice,
      requirements,
      recommendations,
      rationale,
      timestamp: new Date()
    }
  }

  /**
   * 📊 Get Governance Analytics
   */
  getAnalytics(timeRange?: { start: Date; end: Date }): GovernanceMetrics {
    // In a real implementation, this would filter by timeRange
    return this.metrics
  }

  /**
   * 📈 Generate Governance Dashboard
   */
  async generateDashboard(): Promise<string> {
    const analytics = this.getAnalytics()
    
    let dashboard = '# 🛡️ KRINS Governance Dashboard\n\n'
    dashboard += `**Generated:** ${new Date().toISOString()}\n\n`
    
    dashboard += '## 📊 Key Metrics\n\n'
    dashboard += `- **Total Requests:** ${analytics.totalRequests}\n`
    dashboard += `- **Approval Rate:** ${analytics.approvalRate.toFixed(1)}%\n`
    dashboard += `- **Average Risk Score:** ${analytics.averageRiskScore.toFixed(1)}/100\n`
    dashboard += `- **Validation Success:** ${analytics.validationSuccessRate.toFixed(1)}%\n\n`
    
    dashboard += '## 🎯 Risk Distribution\n\n'
    Object.entries(analytics.riskDistribution).forEach(([level, count]) => {
      const emoji = level === 'critical' ? '🔴' : 
                   level === 'high' ? '🟠' : 
                   level === 'medium' ? '🟡' : '🟢'
      dashboard += `- ${emoji} **${level}:** ${count} requests\n`
    })
    
    dashboard += '\n## 🔍 Top Risk Factors\n\n'
    analytics.topRiskFactors.slice(0, 5).forEach((factor, index) => {
      dashboard += `${index + 1}. **${factor.factor}** (${factor.frequency} occurrences)\n`
    })
    
    dashboard += '\n## 📈 Improvement Trends\n\n'
    analytics.improvementTrends.forEach(trend => {
      const emoji = trend.trend === 'improving' ? '📈' : 
                   trend.trend === 'stable' ? '➡️' : '📉'
      dashboard += `- ${emoji} **${trend.metric}:** ${trend.trend}\n`
    })
    
    return dashboard
  }

  /**
   * 🔧 Helper Methods
   */
  private extractRequiredSpecialties(risk: RiskAssessment, advice: ArchitecturalAdvice[]): string[] {
    const specialties = new Set<string>()
    
    risk.factors.forEach(factor => {
      switch (factor.category) {
        case 'security': specialties.add('security'); break
        case 'architecture': specialties.add('architecture'); break
        case 'compliance': specialties.add('compliance'); break
        case 'performance': specialties.add('performance'); break
      }
    })
    
    return Array.from(specialties)
  }

  private getDefaultRequirements(): GovernanceRequirements {
    return {
      reviewers: [{
        type: 'individual',
        identifier: 'tech-lead',
        specialty: 'general',
        mandatory: true,
        reason: 'Default technical review'
      }],
      approvals: [{
        level: 'peer',
        count: 1,
        specialties: ['general']
      }],
      tests: [],
      documentation: [],
      compliance: []
    }
  }

  private initializeMetrics(): GovernanceMetrics {
    return {
      totalRequests: 0,
      approvalRate: 0,
      averageRiskScore: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      validationSuccessRate: 0,
      averageReviewTime: 0,
      topRiskFactors: [],
      improvementTrends: []
    }
  }

  private updateMetrics(decision: GovernanceDecision) {
    this.metrics.totalRequests++
    this.metrics.approvalRate = this.calculateApprovalRate()
    this.metrics.averageRiskScore = this.calculateAverageRiskScore()
    this.metrics.riskDistribution[decision.riskAssessment.overallRisk]++
    this.metrics.validationSuccessRate = this.calculateValidationSuccessRate()
    // Update other metrics...
  }

  private calculateApprovalRate(): number {
    const approved = Array.from(this.decisions.values()).filter(d => d.approved).length
    return (approved / this.decisions.size) * 100
  }

  private calculateAverageRiskScore(): number {
    const scores = Array.from(this.decisions.values()).map(d => d.riskAssessment.totalScore)
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  private calculateValidationSuccessRate(): number {
    const successful = Array.from(this.decisions.values()).filter(d => d.validationResult.passed).length
    return (successful / this.decisions.size) * 100
  }

  private setupEventHandlers() {
    this.riskEngine.on('risk_assessment_completed', (assessment) => {
      this.emit('risk_assessment_completed', assessment)
    })

    this.validator.on('validation_completed', (result) => {
      this.emit('validation_completed', result)
    })

    this.advisor.on('guidance_generated', (advice) => {
      this.emit('architectural_guidance_generated', advice)
    })
  }

  /**
   * 📊 Generate Comprehensive Governance Report
   */
  generateGovernanceReport(decision: GovernanceDecision): string {
    let report = '# 🛡️ KRINS Comprehensive Governance Report\n\n'
    
    report += `**Request ID:** ${decision.requestId}\n`
    report += `**Decision:** ${decision.approved ? '✅ APPROVED' : '❌ BLOCKED'}\n`
    report += `**Confidence:** ${decision.confidence}%\n`
    report += `**Timestamp:** ${decision.timestamp.toISOString()}\n\n`
    
    report += `**Rationale:** ${decision.rationale}\n\n`
    
    // Risk Assessment Section
    report += '## 🛡️ Risk Assessment\n\n'
    report += this.riskEngine.generateReport(decision.riskAssessment)
    
    // Validation Section
    report += '## 🧠 Decision Validation\n\n'
    report += this.validator.generateReport(decision.validationResult)
    
    // Architectural Advice Section
    if (decision.architecturalAdvice.length > 0) {
      report += '## 🏗️ Architectural Guidance\n\n'
      report += this.advisor.generateReport(decision.architecturalAdvice)
    }
    
    // Requirements Section
    report += '## 📋 Governance Requirements\n\n'
    report += this.formatRequirements(decision.requirements)
    
    // Recommendations Section
    if (decision.recommendations.length > 0) {
      report += '## 💡 Recommendations\n\n'
      report += this.formatRecommendations(decision.recommendations)
    }
    
    return report
  }

  private formatRequirements(requirements: GovernanceRequirements): string {
    let section = ''
    
    if (requirements.reviewers.length > 0) {
      section += '### 👥 Reviewer Requirements\n\n'
      requirements.reviewers.forEach(req => {
        const emoji = req.mandatory ? '🔴' : '🟡'
        section += `- ${emoji} **${req.identifier}** (${req.specialty}) - ${req.reason}\n`
      })
      section += '\n'
    }
    
    if (requirements.tests.length > 0) {
      section += '### 🧪 Test Requirements\n\n'
      requirements.tests.forEach(req => {
        const emoji = req.mandatory ? '🔴' : '🟡'
        section += `- ${emoji} **${req.type}** (${req.coverage}% coverage) - ${req.reason}\n`
      })
      section += '\n'
    }
    
    if (requirements.documentation.length > 0) {
      section += '### 📚 Documentation Requirements\n\n'
      requirements.documentation.forEach(req => {
        const emoji = req.mandatory ? '🔴' : '🟡'
        section += `- ${emoji} **${req.type}** (${req.action}) - ${req.reason}\n`
      })
      section += '\n'
    }
    
    return section
  }

  private formatRecommendations(recommendations: GovernanceRecommendation[]): string {
    let section = ''
    
    const byPriority = recommendations.reduce((acc, rec) => {
      if (!acc[rec.priority]) acc[rec.priority] = []
      acc[rec.priority].push(rec)
      return acc
    }, {} as Record<string, GovernanceRecommendation[]>)
    
    const priorities = ['critical', 'high', 'medium', 'low'] as const
    
    priorities.forEach(priority => {
      if (byPriority[priority]) {
        const emoji = priority === 'critical' ? '🔴' : 
                     priority === 'high' ? '🟠' : 
                     priority === 'medium' ? '🟡' : '🟢'
        
        section += `### ${emoji} ${priority.toUpperCase()} Priority\n\n`
        
        byPriority[priority].forEach(rec => {
          section += `#### ${rec.title}\n\n`
          section += `**Category:** ${rec.category}\n\n`
          section += `${rec.description}\n\n`
          
          if (rec.implementation.length > 0) {
            section += '**Implementation:**\n'
            rec.implementation.forEach(step => section += `- ${step}\n`)
            section += '\n'
          }
          
          if (rec.benefits.length > 0) {
            section += '**Benefits:**\n'
            rec.benefits.forEach(benefit => section += `- ${benefit}\n`)
            section += '\n'
          }
        })
      }
    })
    
    return section
  }
}

export default KRINSGovernanceOrchestrator