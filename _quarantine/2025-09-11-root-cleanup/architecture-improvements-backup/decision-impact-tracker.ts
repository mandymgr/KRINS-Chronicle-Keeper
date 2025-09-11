/**
 * 🎯 Decision Impact Tracker
 * 
 * Advanced system for tracking the long-term impact and effectiveness
 * of architectural decisions over time
 */

export interface DecisionImpact {
  adrId: string;
  impactType: 'performance' | 'security' | 'maintainability' | 'scalability' | 'cost' | 'developer_experience';
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  evidence: string;
  timestamp: string;
  measuredValue?: number;
  expectedValue?: number;
  unit?: string;
}

export interface DecisionEffectiveness {
  adrId: string;
  title: string;
  implementationDate: string;
  evaluationPeriod: {
    start: string;
    end: string;
  };
  overallRating: number; // 1-10 scale
  impacts: DecisionImpact[];
  metrics: {
    problemsSolved: number;
    problemsCreated: number;
    maintenanceBurden: 'low' | 'medium' | 'high';
    adaptabilityScore: number; // 1-10
    riskRealizationRate: number; // 0-1
  };
  lessons: string[];
  recommendations: {
    shouldContinue: boolean;
    suggestedModifications: string[];
    relatedDecisionsToReview: string[];
  };
}

export interface ImpactAnalytics {
  totalDecisionsTracked: number;
  averageEffectiveness: number;
  impactDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  categoryBreakdown: Record<DecisionImpact['impactType'], {
    positive: number;
    negative: number;
    avgSeverity: number;
  }>;
  trendAnalysis: {
    effectivenessOverTime: Array<{
      month: string;
      avgEffectiveness: number;
      decisionsEvaluated: number;
    }>;
    riskRealizationTrends: Array<{
      month: string;
      avgRiskRealization: number;
    }>;
  };
  topPerformingDecisions: Array<{
    adrId: string;
    title: string;
    effectiveness: number;
  }>;
  problematicDecisions: Array<{
    adrId: string;
    title: string;
    issues: number;
    severity: string;
  }>;
}

class DecisionImpactTracker {
  private impacts: DecisionImpact[] = [];
  private effectiveness: DecisionEffectiveness[] = [];
  private maxHistory = 5000; // Keep last 5k impact records

  constructor() {
    console.log('🎯 Decision Impact Tracker initialized');
    
    // Start periodic analysis
    setInterval(() => this.performPeriodicAnalysis(), 86400000); // Daily analysis
  }

  /**
   * Record a decision impact
   */
  recordImpact(impact: Omit<DecisionImpact, 'timestamp'>): string {
    const impactRecord: DecisionImpact = {
      ...impact,
      timestamp: new Date().toISOString()
    };

    this.impacts.push(impactRecord);
    this.trimHistory();

    console.log(`🎯 Impact recorded for ${impact.adrId}: ${impact.impact} ${impact.impactType}`);
    
    return this.generateImpactId(impactRecord);
  }

  /**
   * Evaluate decision effectiveness over a period
   */
  async evaluateDecisionEffectiveness(
    adrId: string, 
    title: string,
    implementationDate: string,
    evaluationPeriodMonths: number = 6
  ): Promise<DecisionEffectiveness> {
    const now = new Date();
    const evaluationStart = new Date(implementationDate);
    const evaluationEnd = new Date(now.getTime());
    
    // Get all impacts for this decision within evaluation period
    const relevantImpacts = this.impacts.filter(impact => {
      const impactDate = new Date(impact.timestamp);
      return impact.adrId === adrId && 
             impactDate >= evaluationStart && 
             impactDate <= evaluationEnd;
    });

    // Calculate overall effectiveness
    const overallRating = this.calculateOverallRating(relevantImpacts);
    
    // Calculate metrics
    const metrics = this.calculateDecisionMetrics(relevantImpacts);
    
    // Extract lessons
    const lessons = this.extractLessons(adrId, relevantImpacts);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(relevantImpacts, metrics);

    const effectiveness: DecisionEffectiveness = {
      adrId,
      title,
      implementationDate,
      evaluationPeriod: {
        start: evaluationStart.toISOString(),
        end: evaluationEnd.toISOString()
      },
      overallRating,
      impacts: relevantImpacts,
      metrics,
      lessons,
      recommendations
    };

    // Store the evaluation
    const existingIndex = this.effectiveness.findIndex(e => e.adrId === adrId);
    if (existingIndex >= 0) {
      this.effectiveness[existingIndex] = effectiveness;
    } else {
      this.effectiveness.push(effectiveness);
    }

    console.log(`🎯 Decision effectiveness evaluated for ${adrId}: ${overallRating}/10`);
    
    return effectiveness;
  }

  /**
   * Generate comprehensive impact analytics
   */
  generateImpactAnalytics(timeframe?: { start: Date; end: Date }): ImpactAnalytics {
    let filteredImpacts = this.impacts;
    let filteredEffectiveness = this.effectiveness;

    if (timeframe) {
      filteredImpacts = this.impacts.filter(impact => {
        const timestamp = new Date(impact.timestamp);
        return timestamp >= timeframe.start && timestamp <= timeframe.end;
      });
      
      filteredEffectiveness = this.effectiveness.filter(eff => {
        const evalStart = new Date(eff.evaluationPeriod.start);
        return evalStart >= timeframe.start && evalStart <= timeframe.end;
      });
    }

    const totalDecisionsTracked = new Set(filteredImpacts.map(i => i.adrId)).size;
    const averageEffectiveness = filteredEffectiveness.length > 0
      ? filteredEffectiveness.reduce((sum, eff) => sum + eff.overallRating, 0) / filteredEffectiveness.length
      : 0;

    // Impact distribution
    const impactDistribution = {
      positive: filteredImpacts.filter(i => i.impact === 'positive').length,
      negative: filteredImpacts.filter(i => i.impact === 'negative').length,
      neutral: filteredImpacts.filter(i => i.impact === 'neutral').length
    };

    // Category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(filteredImpacts);

    // Trend analysis
    const trendAnalysis = this.calculateTrendAnalysis(filteredEffectiveness, filteredImpacts);

    // Top performing decisions
    const topPerformingDecisions = filteredEffectiveness
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, 10)
      .map(eff => ({
        adrId: eff.adrId,
        title: eff.title,
        effectiveness: eff.overallRating
      }));

    // Problematic decisions
    const problematicDecisions = this.identifyProblematicDecisions(filteredEffectiveness);

    return {
      totalDecisionsTracked,
      averageEffectiveness,
      impactDistribution,
      categoryBreakdown,
      trendAnalysis,
      topPerformingDecisions,
      problematicDecisions
    };
  }

  /**
   * Get decision timeline showing impact evolution
   */
  getDecisionTimeline(adrId: string): Array<{
    timestamp: string;
    impact: DecisionImpact;
    cumulativeEffect: 'improving' | 'deteriorating' | 'stable';
  }> {
    const decisionImpacts = this.impacts
      .filter(impact => impact.adrId === adrId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const timeline: Array<{
      timestamp: string;
      impact: DecisionImpact;
      cumulativeEffect: 'improving' | 'deteriorating' | 'stable';
    }> = [];

    decisionImpacts.forEach((impact, index) => {
      let cumulativeEffect: 'improving' | 'deteriorating' | 'stable' = 'stable';
      
      if (index > 0) {
        const recent = decisionImpacts.slice(Math.max(0, index - 2), index + 1);
        const positiveCount = recent.filter(i => i.impact === 'positive').length;
        const negativeCount = recent.filter(i => i.impact === 'negative').length;
        
        if (positiveCount > negativeCount) {
          cumulativeEffect = 'improving';
        } else if (negativeCount > positiveCount) {
          cumulativeEffect = 'deteriorating';
        }
      }

      timeline.push({
        timestamp: impact.timestamp,
        impact,
        cumulativeEffect
      });
    });

    return timeline;
  }

  /**
   * Predict future impact trends for a decision
   */
  predictFutureImpact(adrId: string): {
    projectedEffectiveness: number;
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
  } {
    const timeline = this.getDecisionTimeline(adrId);
    
    if (timeline.length < 3) {
      return {
        projectedEffectiveness: 5, // Neutral
        confidence: 0.3, // Low confidence
        riskFactors: ['Insufficient historical data'],
        recommendations: ['Continue monitoring for at least 3 months']
      };
    }

    // Analyze recent trend
    const recentImpacts = timeline.slice(-5);
    const positiveCount = recentImpacts.filter(t => t.impact.impact === 'positive').length;
    const negativeCount = recentImpacts.filter(t => t.impact.impact === 'negative').length;
    
    // Simple trend projection
    let projectedEffectiveness = 5; // Start neutral
    
    if (positiveCount > negativeCount) {
      projectedEffectiveness = 7 + (positiveCount - negativeCount);
    } else if (negativeCount > positiveCount) {
      projectedEffectiveness = 3 - (negativeCount - positiveCount);
    }
    
    // Constrain to 1-10 range
    projectedEffectiveness = Math.max(1, Math.min(10, projectedEffectiveness));
    
    const confidence = Math.min(0.9, timeline.length / 20); // Higher confidence with more data
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(recentImpacts.map(t => t.impact));
    
    // Generate recommendations
    const recommendations = this.generateFutureRecommendations(projectedEffectiveness, riskFactors);

    return {
      projectedEffectiveness,
      confidence,
      riskFactors,
      recommendations
    };
  }

  /**
   * Export impact data for analysis
   */
  exportImpactData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      exportedAt: new Date().toISOString(),
      analytics: this.generateImpactAnalytics(),
      impacts: this.impacts,
      effectiveness: this.effectiveness
    };

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  private calculateOverallRating(impacts: DecisionImpact[]): number {
    if (impacts.length === 0) return 5; // Neutral if no data

    const positiveImpacts = impacts.filter(i => i.impact === 'positive').length;
    const negativeImpacts = impacts.filter(i => i.impact === 'negative').length;
    const totalImpacts = impacts.length;

    // Weight by severity
    const positiveScore = impacts
      .filter(i => i.impact === 'positive')
      .reduce((sum, i) => sum + this.getSeverityWeight(i.severity), 0);

    const negativeScore = impacts
      .filter(i => i.impact === 'negative')
      .reduce((sum, i) => sum + this.getSeverityWeight(i.severity), 0);

    // Calculate balanced score (1-10 scale)
    const ratio = positiveScore / (positiveScore + negativeScore + 1); // +1 to avoid division by zero
    return Math.round(1 + (ratio * 9)); // Map to 1-10 scale
  }

  private getSeverityWeight(severity: DecisionImpact['severity']): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private calculateDecisionMetrics(impacts: DecisionImpact[]) {
    const problemsSolved = impacts.filter(i => 
      i.impact === 'positive' && i.description.toLowerCase().includes('solv')
    ).length;

    const problemsCreated = impacts.filter(i => 
      i.impact === 'negative' && i.description.toLowerCase().includes('problem')
    ).length;

    // Calculate maintenance burden based on maintainability impacts
    const maintainabilityImpacts = impacts.filter(i => i.impactType === 'maintainability');
    let maintenanceBurden: 'low' | 'medium' | 'high' = 'medium';
    
    if (maintainabilityImpacts.length > 0) {
      const positiveCount = maintainabilityImpacts.filter(i => i.impact === 'positive').length;
      const negativeCount = maintainabilityImpacts.filter(i => i.impact === 'negative').length;
      
      if (positiveCount > negativeCount) {
        maintenanceBurden = 'low';
      } else if (negativeCount > positiveCount) {
        maintenanceBurden = 'high';
      }
    }

    // Adaptability score based on how well the decision adapts to change
    const adaptabilityScore = this.calculateAdaptabilityScore(impacts);

    // Risk realization rate
    const riskRealizationRate = this.calculateRiskRealizationRate(impacts);

    return {
      problemsSolved,
      problemsCreated,
      maintenanceBurden,
      adaptabilityScore,
      riskRealizationRate
    };
  }

  private calculateAdaptabilityScore(impacts: DecisionImpact[]): number {
    // Score based on how well the decision handles changing requirements
    const adaptabilityKeywords = ['flexible', 'adaptable', 'extensible', 'modular'];
    const rigidityKeywords = ['rigid', 'inflexible', 'hardcoded', 'tightly coupled'];

    let score = 5; // Start neutral

    impacts.forEach(impact => {
      const desc = impact.description.toLowerCase();
      
      adaptabilityKeywords.forEach(keyword => {
        if (desc.includes(keyword)) {
          score += impact.impact === 'positive' ? 1 : -1;
        }
      });

      rigidityKeywords.forEach(keyword => {
        if (desc.includes(keyword)) {
          score += impact.impact === 'negative' ? -1 : 1;
        }
      });
    });

    return Math.max(1, Math.min(10, score));
  }

  private calculateRiskRealizationRate(impacts: DecisionImpact[]): number {
    // What percentage of predicted risks actually occurred
    const riskKeywords = ['risk', 'concern', 'potential issue'];
    const realizedRisks = impacts.filter(impact => 
      impact.impact === 'negative' &&
      riskKeywords.some(keyword => impact.description.toLowerCase().includes(keyword))
    ).length;

    // This is a simplified calculation - in reality you'd compare against predicted risks
    const totalRisks = Math.max(realizedRisks, 1); // Avoid division by zero
    return realizedRisks / totalRisks;
  }

  private extractLessons(adrId: string, impacts: DecisionImpact[]): string[] {
    const lessons: string[] = [];

    // Analyze patterns in impacts to extract lessons
    if (impacts.some(i => i.impactType === 'performance' && i.impact === 'negative')) {
      lessons.push('Performance implications should be more thoroughly evaluated upfront');
    }

    if (impacts.some(i => i.impactType === 'maintainability' && i.impact === 'positive')) {
      lessons.push('The decision improved code maintainability as expected');
    }

    if (impacts.filter(i => i.impact === 'negative').length > impacts.filter(i => i.impact === 'positive').length) {
      lessons.push('The decision may need revision or additional support measures');
    }

    // Add more pattern-based lesson extraction logic here

    return lessons;
  }

  private generateRecommendations(impacts: DecisionImpact[], metrics: any) {
    const shouldContinue = metrics.problemsSolved >= metrics.problemsCreated;
    
    const suggestedModifications: string[] = [];
    const relatedDecisionsToReview: string[] = [];

    if (metrics.maintenanceBurden === 'high') {
      suggestedModifications.push('Consider refactoring to reduce maintenance complexity');
    }

    if (metrics.adaptabilityScore < 5) {
      suggestedModifications.push('Add more flexible interfaces to improve adaptability');
    }

    // Analyze impacts for specific recommendations
    impacts.forEach(impact => {
      if (impact.impact === 'negative' && impact.severity === 'high') {
        suggestedModifications.push(`Address: ${impact.description}`);
      }
    });

    return {
      shouldContinue,
      suggestedModifications,
      relatedDecisionsToReview
    };
  }

  private calculateCategoryBreakdown(impacts: DecisionImpact[]) {
    const categories: DecisionImpact['impactType'][] = [
      'performance', 'security', 'maintainability', 'scalability', 'cost', 'developer_experience'
    ];

    const breakdown: Record<DecisionImpact['impactType'], {
      positive: number;
      negative: number;
      avgSeverity: number;
    }> = {} as any;

    categories.forEach(category => {
      const categoryImpacts = impacts.filter(i => i.impactType === category);
      const positive = categoryImpacts.filter(i => i.impact === 'positive').length;
      const negative = categoryImpacts.filter(i => i.impact === 'negative').length;
      
      const avgSeverity = categoryImpacts.length > 0
        ? categoryImpacts.reduce((sum, i) => sum + this.getSeverityWeight(i.severity), 0) / categoryImpacts.length
        : 0;

      breakdown[category] = { positive, negative, avgSeverity };
    });

    return breakdown;
  }

  private calculateTrendAnalysis(effectiveness: DecisionEffectiveness[], impacts: DecisionImpact[]) {
    // Group by month for trend analysis
    const effectivenessOverTime: Record<string, { total: number; count: number }> = {};
    const riskRealizationOverTime: Record<string, { total: number; count: number }> = {};

    effectiveness.forEach(eff => {
      const monthKey = new Date(eff.evaluationPeriod.start).toISOString().substring(0, 7);
      
      if (!effectivenessOverTime[monthKey]) {
        effectivenessOverTime[monthKey] = { total: 0, count: 0 };
      }
      
      effectivenessOverTime[monthKey].total += eff.overallRating;
      effectivenessOverTime[monthKey].count++;

      if (!riskRealizationOverTime[monthKey]) {
        riskRealizationOverTime[monthKey] = { total: 0, count: 0 };
      }
      
      riskRealizationOverTime[monthKey].total += eff.metrics.riskRealizationRate;
      riskRealizationOverTime[monthKey].count++;
    });

    return {
      effectivenessOverTime: Object.entries(effectivenessOverTime).map(([month, data]) => ({
        month,
        avgEffectiveness: data.total / data.count,
        decisionsEvaluated: data.count
      })).sort((a, b) => a.month.localeCompare(b.month)),
      
      riskRealizationTrends: Object.entries(riskRealizationOverTime).map(([month, data]) => ({
        month,
        avgRiskRealization: data.total / data.count
      })).sort((a, b) => a.month.localeCompare(b.month))
    };
  }

  private identifyProblematicDecisions(effectiveness: DecisionEffectiveness[]) {
    return effectiveness
      .filter(eff => eff.overallRating < 4 || eff.impacts.filter(i => i.impact === 'negative').length >= 3)
      .map(eff => ({
        adrId: eff.adrId,
        title: eff.title,
        issues: eff.impacts.filter(i => i.impact === 'negative').length,
        severity: eff.impacts.some(i => i.severity === 'critical') ? 'critical' : 'high'
      }))
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 10);
  }

  private identifyRiskFactors(impacts: DecisionImpact[]): string[] {
    const riskFactors: string[] = [];
    
    const negativeImpacts = impacts.filter(i => i.impact === 'negative');
    if (negativeImpacts.length > impacts.length / 2) {
      riskFactors.push('High rate of negative impacts');
    }

    const criticalImpacts = impacts.filter(i => i.severity === 'critical');
    if (criticalImpacts.length > 0) {
      riskFactors.push('Critical severity issues identified');
    }

    const performanceIssues = impacts.filter(i => 
      i.impactType === 'performance' && i.impact === 'negative'
    );
    if (performanceIssues.length >= 2) {
      riskFactors.push('Recurring performance problems');
    }

    return riskFactors;
  }

  private generateFutureRecommendations(projectedEffectiveness: number, riskFactors: string[]): string[] {
    const recommendations: string[] = [];

    if (projectedEffectiveness < 4) {
      recommendations.push('Consider reverting or significantly modifying this decision');
    } else if (projectedEffectiveness < 6) {
      recommendations.push('Monitor closely and prepare contingency plans');
    } else if (projectedEffectiveness > 8) {
      recommendations.push('Document and share this success pattern');
    }

    if (riskFactors.length > 2) {
      recommendations.push('Implement additional risk mitigation measures');
    }

    return recommendations;
  }

  private performPeriodicAnalysis(): void {
    console.log('🔄 Running periodic decision impact analysis...');
    
    // Analyze decisions that are due for evaluation
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    
    // In a real implementation, you'd load ADRs and check which ones need evaluation
    // For now, just log that analysis is running
    
    const analytics = this.generateImpactAnalytics();
    console.log(`📊 Periodic analysis: ${analytics.totalDecisionsTracked} decisions tracked, ${analytics.averageEffectiveness.toFixed(1)} avg effectiveness`);
  }

  private generateImpactId(impact: DecisionImpact): string {
    return `impact-${impact.adrId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  private trimHistory(): void {
    if (this.impacts.length > this.maxHistory) {
      this.impacts = this.impacts.slice(-this.maxHistory);
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for impacts
    const headers = ['adrId', 'impactType', 'impact', 'severity', 'description', 'source', 'timestamp'];
    const rows = this.impacts.map(impact => [
      impact.adrId,
      impact.impactType,
      impact.impact,
      impact.severity,
      `"${impact.description.replace(/"/g, '""')}"`,
      impact.source,
      impact.timestamp
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

export { DecisionImpactTracker };