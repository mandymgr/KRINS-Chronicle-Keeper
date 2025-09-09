/**
 * 🎯 AI Context Quality Metrics System
 * 
 * Advanced telemetry and analytics for AI context generation quality
 * Tracks relevance, confidence, performance, and effectiveness metrics
 */

export interface ContextMetric {
  id: string;
  timestamp: string;
  query: string;
  contextType: string;
  aiSystem: string;
  task: string;
  confidence: number;
  relevanceScores: number[];
  sourcesUsed: string[];
  responseTime: number;
  cacheHit: boolean;
  userFeedback?: ContextFeedback;
  errorOccurred: boolean;
  errorType?: string;
}

export interface ContextFeedback {
  helpfulness: number; // 1-5 scale
  accuracy: number; // 1-5 scale  
  completeness: number; // 1-5 scale
  comments?: string;
  timestamp: string;
}

export interface QualityAnalytics {
  totalRequests: number;
  averageConfidence: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  sourceDistribution: Record<string, number>;
  confidenceDistribution: {
    high: number; // >0.8
    medium: number; // 0.5-0.8
    low: number; // <0.5
  };
  userSatisfaction: {
    averageHelpfulness: number;
    averageAccuracy: number;
    averageCompleteness: number;
  };
  trendsOverTime: {
    daily: Array<{ date: string; avgConfidence: number; requests: number }>;
    weekly: Array<{ week: string; avgConfidence: number; requests: number }>;
  };
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  success: boolean;
  errorDetails?: string;
}

class ContextQualityMetrics {
  private metrics: ContextMetric[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private maxMetricsHistory = 10000; // Keep last 10k metrics
  
  constructor() {
    console.log('📊 Context Quality Metrics initialized');
    
    // Start periodic cleanup
    setInterval(() => this.cleanup(), 60000 * 60); // Hourly cleanup
  }

  /**
   * Record a context generation event
   */
  recordContextGeneration(data: {
    query: string;
    contextType: string;
    aiSystem: string;
    task: string;
    confidence: number;
    relevanceScores: number[];
    sourcesUsed: string[];
    responseTime: number;
    cacheHit: boolean;
    errorOccurred: boolean;
    errorType?: string;
  }): string {
    const metricId = this.generateMetricId();
    
    const metric: ContextMetric = {
      id: metricId,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.metrics.push(metric);
    this.trimMetricsHistory();

    console.log(`📊 Context metric recorded: ${metricId} (confidence: ${data.confidence.toFixed(2)})`);
    
    return metricId;
  }

  /**
   * Record user feedback for a context generation
   */
  recordUserFeedback(metricId: string, feedback: Omit<ContextFeedback, 'timestamp'>): boolean {
    const metric = this.metrics.find(m => m.id === metricId);
    
    if (!metric) {
      console.error(`❌ Metric not found: ${metricId}`);
      return false;
    }

    metric.userFeedback = {
      ...feedback,
      timestamp: new Date().toISOString()
    };

    console.log(`📊 User feedback recorded for metric: ${metricId}`);
    console.log(`   Helpfulness: ${feedback.helpfulness}/5, Accuracy: ${feedback.accuracy}/5`);
    
    return true;
  }

  /**
   * Record performance metrics for internal operations
   */
  recordPerformance(operation: string, duration: number, success: boolean, errorDetails?: string): void {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      success,
      errorDetails
    };

    this.performanceMetrics.push(metric);
    
    // Keep only recent performance metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  /**
   * Generate comprehensive quality analytics
   */
  generateQualityAnalytics(timeframe?: { start: Date; end: Date }): QualityAnalytics {
    let filteredMetrics = this.metrics;

    if (timeframe) {
      filteredMetrics = this.metrics.filter(m => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= timeframe.start && timestamp <= timeframe.end;
      });
    }

    const totalRequests = filteredMetrics.length;
    
    if (totalRequests === 0) {
      return this.getEmptyAnalytics();
    }

    // Calculate basic metrics
    const averageConfidence = filteredMetrics.reduce((sum, m) => sum + m.confidence, 0) / totalRequests;
    const averageResponseTime = filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const cacheHits = filteredMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = cacheHits / totalRequests;
    const errorRate = filteredMetrics.filter(m => m.errorOccurred).length / totalRequests;

    // Source distribution
    const sourceDistribution: Record<string, number> = {};
    filteredMetrics.forEach(m => {
      m.sourcesUsed.forEach(source => {
        sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
      });
    });

    // Confidence distribution
    const confidenceDistribution = {
      high: filteredMetrics.filter(m => m.confidence > 0.8).length,
      medium: filteredMetrics.filter(m => m.confidence >= 0.5 && m.confidence <= 0.8).length,
      low: filteredMetrics.filter(m => m.confidence < 0.5).length
    };

    // User satisfaction (from feedback)
    const metricsWithFeedback = filteredMetrics.filter(m => m.userFeedback);
    const userSatisfaction = {
      averageHelpfulness: metricsWithFeedback.length > 0 
        ? metricsWithFeedback.reduce((sum, m) => sum + (m.userFeedback?.helpfulness || 0), 0) / metricsWithFeedback.length 
        : 0,
      averageAccuracy: metricsWithFeedback.length > 0 
        ? metricsWithFeedback.reduce((sum, m) => sum + (m.userFeedback?.accuracy || 0), 0) / metricsWithFeedback.length 
        : 0,
      averageCompleteness: metricsWithFeedback.length > 0 
        ? metricsWithFeedback.reduce((sum, m) => sum + (m.userFeedback?.completeness || 0), 0) / metricsWithFeedback.length 
        : 0
    };

    // Trends over time
    const trendsOverTime = this.calculateTrends(filteredMetrics);

    return {
      totalRequests,
      averageConfidence,
      averageResponseTime,
      cacheHitRate,
      errorRate,
      sourceDistribution,
      confidenceDistribution,
      userSatisfaction,
      trendsOverTime
    };
  }

  /**
   * Get metrics for specific AI system
   */
  getAISystemMetrics(aiSystem: string, timeframe?: { start: Date; end: Date }): QualityAnalytics {
    let filteredMetrics = this.metrics.filter(m => m.aiSystem === aiSystem);

    if (timeframe) {
      filteredMetrics = filteredMetrics.filter(m => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= timeframe.start && timestamp <= timeframe.end;
      });
    }

    return this.generateQualityAnalytics(timeframe);
  }

  /**
   * Get metrics for specific context type
   */
  getContextTypeMetrics(contextType: string, timeframe?: { start: Date; end: Date }): QualityAnalytics {
    const originalMetrics = this.metrics;
    
    this.metrics = this.metrics.filter(m => m.contextType === contextType);
    const analytics = this.generateQualityAnalytics(timeframe);
    this.metrics = originalMetrics;
    
    return analytics;
  }

  /**
   * Identify quality issues and recommendations
   */
  identifyQualityIssues(): Array<{
    issue: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
    affectedMetrics: number;
  }> {
    const analytics = this.generateQualityAnalytics();
    const issues: Array<{
      issue: string;
      severity: 'high' | 'medium' | 'low';
      recommendation: string;
      affectedMetrics: number;
    }> = [];

    // Low confidence rate
    if (analytics.confidenceDistribution.low / analytics.totalRequests > 0.3) {
      issues.push({
        issue: 'High rate of low-confidence responses',
        severity: 'high',
        recommendation: 'Review ADR content quality and search algorithms',
        affectedMetrics: analytics.confidenceDistribution.low
      });
    }

    // High error rate
    if (analytics.errorRate > 0.1) {
      issues.push({
        issue: 'High error rate in context generation',
        severity: 'high',
        recommendation: 'Investigate error causes and improve error handling',
        affectedMetrics: Math.round(analytics.totalRequests * analytics.errorRate)
      });
    }

    // Poor performance
    if (analytics.averageResponseTime > 2000) {
      issues.push({
        issue: 'Slow context generation performance',
        severity: 'medium',
        recommendation: 'Optimize search algorithms and caching strategies',
        affectedMetrics: analytics.totalRequests
      });
    }

    // Low cache hit rate
    if (analytics.cacheHitRate < 0.3) {
      issues.push({
        issue: 'Low cache effectiveness',
        severity: 'medium',
        recommendation: 'Review caching strategy and cache expiration policies',
        affectedMetrics: analytics.totalRequests
      });
    }

    // Low user satisfaction
    if (analytics.userSatisfaction.averageHelpfulness < 3.0 && analytics.userSatisfaction.averageHelpfulness > 0) {
      issues.push({
        issue: 'Low user satisfaction with context quality',
        severity: 'high',
        recommendation: 'Review context relevance algorithms and source selection',
        affectedMetrics: this.metrics.filter(m => m.userFeedback).length
      });
    }

    return issues;
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json', timeframe?: { start: Date; end: Date }): string {
    let filteredMetrics = this.metrics;

    if (timeframe) {
      filteredMetrics = this.metrics.filter(m => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= timeframe.start && timestamp <= timeframe.end;
      });
    }

    if (format === 'csv') {
      return this.exportToCSV(filteredMetrics);
    }

    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      totalMetrics: filteredMetrics.length,
      analytics: this.generateQualityAnalytics(timeframe),
      metrics: filteredMetrics
    }, null, 2);
  }

  /**
   * Get real-time quality dashboard data
   */
  getDashboardData(): {
    liveMetrics: {
      requestsLast24h: number;
      avgConfidenceLast24h: number;
      errorRateLast24h: number;
      avgResponseTimeLast24h: number;
    };
    recentIssues: Array<{
      issue: string;
      severity: 'high' | 'medium' | 'low';
      recommendation: string;
      affectedMetrics: number;
    }>;
    topQueries: Array<{ query: string; count: number; avgConfidence: number }>;
    performanceOverTime: Array<{ timestamp: string; confidence: number; responseTime: number }>;
  } {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = this.metrics.filter(m => new Date(m.timestamp) >= last24h);

    const liveMetrics = {
      requestsLast24h: recent.length,
      avgConfidenceLast24h: recent.length > 0 
        ? recent.reduce((sum, m) => sum + m.confidence, 0) / recent.length 
        : 0,
      errorRateLast24h: recent.length > 0 
        ? recent.filter(m => m.errorOccurred).length / recent.length 
        : 0,
      avgResponseTimeLast24h: recent.length > 0 
        ? recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length 
        : 0
    };

    const recentIssues = this.identifyQualityIssues();

    // Top queries analysis
    const queryCount: Record<string, { count: number; totalConfidence: number }> = {};
    recent.forEach(m => {
      const key = m.query.toLowerCase();
      if (!queryCount[key]) {
        queryCount[key] = { count: 0, totalConfidence: 0 };
      }
      queryCount[key].count++;
      queryCount[key].totalConfidence += m.confidence;
    });

    const topQueries = Object.entries(queryCount)
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgConfidence: data.totalConfidence / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Performance over time (last hour, 5-minute intervals)
    const performanceOverTime = this.getPerformanceTimeSeries(recent);

    return {
      liveMetrics,
      recentIssues,
      topQueries,
      performanceOverTime
    };
  }

  private generateMetricId(): string {
    return `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private trimMetricsHistory(): void {
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  private cleanup(): void {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const initialCount = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => new Date(m.timestamp) >= cutoff);
    
    if (this.metrics.length < initialCount) {
      console.log(`📊 Cleaned up ${initialCount - this.metrics.length} old metrics`);
    }
  }

  private getEmptyAnalytics(): QualityAnalytics {
    return {
      totalRequests: 0,
      averageConfidence: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      sourceDistribution: {},
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      userSatisfaction: { averageHelpfulness: 0, averageAccuracy: 0, averageCompleteness: 0 },
      trendsOverTime: { daily: [], weekly: [] }
    };
  }

  private calculateTrends(metrics: ContextMetric[]): {
    daily: Array<{ date: string; avgConfidence: number; requests: number }>;
    weekly: Array<{ week: string; avgConfidence: number; requests: number }>;
  } {
    const daily: Record<string, { total: number; count: number }> = {};
    const weekly: Record<string, { total: number; count: number }> = {};

    metrics.forEach(m => {
      const date = new Date(m.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      const weekKey = this.getWeekKey(date);

      // Daily aggregation
      if (!daily[dateKey]) {
        daily[dateKey] = { total: 0, count: 0 };
      }
      daily[dateKey].total += m.confidence;
      daily[dateKey].count++;

      // Weekly aggregation  
      if (!weekly[weekKey]) {
        weekly[weekKey] = { total: 0, count: 0 };
      }
      weekly[weekKey].total += m.confidence;
      weekly[weekKey].count++;
    });

    return {
      daily: Object.entries(daily).map(([date, data]) => ({
        date,
        avgConfidence: data.total / data.count,
        requests: data.count
      })).sort((a, b) => a.date.localeCompare(b.date)),
      weekly: Object.entries(weekly).map(([week, data]) => ({
        week,
        avgConfidence: data.total / data.count,
        requests: data.count
      })).sort((a, b) => a.week.localeCompare(b.week))
    };
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private exportToCSV(metrics: ContextMetric[]): string {
    const headers = [
      'id', 'timestamp', 'query', 'contextType', 'aiSystem', 'task',
      'confidence', 'averageRelevanceScore', 'sourcesUsed', 'responseTime',
      'cacheHit', 'errorOccurred', 'errorType', 'userHelpfulness',
      'userAccuracy', 'userCompleteness', 'userComments'
    ];

    const rows = metrics.map(m => [
      m.id,
      m.timestamp,
      `"${m.query.replace(/"/g, '""')}"`,
      m.contextType,
      m.aiSystem,
      m.task,
      m.confidence.toString(),
      (m.relevanceScores.length > 0 
        ? (m.relevanceScores.reduce((a, b) => a + b) / m.relevanceScores.length).toString() 
        : '0'),
      `"${m.sourcesUsed.join(',')}"`,
      m.responseTime.toString(),
      m.cacheHit.toString(),
      m.errorOccurred.toString(),
      m.errorType || '',
      m.userFeedback?.helpfulness?.toString() || '',
      m.userFeedback?.accuracy?.toString() || '',
      m.userFeedback?.completeness?.toString() || '',
      m.userFeedback?.comments ? `"${m.userFeedback.comments.replace(/"/g, '""')}"` : ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\\n');
  }

  private getPerformanceTimeSeries(metrics: ContextMetric[]): Array<{ timestamp: string; confidence: number; responseTime: number }> {
    const lastHour = Date.now() - 60 * 60 * 1000;
    const recentMetrics = metrics.filter(m => new Date(m.timestamp).getTime() >= lastHour);
    
    return recentMetrics
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(m => ({
        timestamp: m.timestamp,
        confidence: m.confidence,
        responseTime: m.responseTime
      }));
  }
}

export { ContextQualityMetrics };