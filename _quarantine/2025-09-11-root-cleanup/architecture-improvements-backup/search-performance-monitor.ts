/**
 * 🔍 Semantic Search Performance Monitor
 * 
 * Advanced monitoring system for pgvector semantic search performance,
 * query optimization, and relevance quality tracking
 */

export interface SearchQuery {
  id: string;
  query: string;
  embedding: number[];
  filters: Record<string, any>;
  limit: number;
  timestamp: string;
}

export interface SearchResult {
  queryId: string;
  results: Array<{
    id: string;
    content: string;
    similarity: number;
    metadata: Record<string, any>;
  }>;
  totalResults: number;
  executionTime: number;
  indexUsed?: string;
  planDetails?: any;
}

export interface SearchMetrics {
  queryId: string;
  timestamp: string;
  queryType: 'vector' | 'hybrid' | 'text';
  dimensions: number;
  resultCount: number;
  executionTime: number;
  indexScanTime: number;
  embeddingGenerationTime: number;
  postgresQueryTime: number;
  similarity: {
    average: number;
    highest: number;
    lowest: number;
  };
  performance: {
    queriesPerSecond: number;
    memoryUsage: number;
    indexHitRate: number;
  };
  quality: {
    relevanceScore: number;
    userSatisfaction?: number;
    clickThroughRate?: number;
  };
}

export interface PerformanceAnalytics {
  totalQueries: number;
  averageExecutionTime: number;
  averageRelevanceScore: number;
  queryDistribution: {
    vector: number;
    hybrid: number;
    text: number;
  };
  performanceTrends: {
    hourly: Array<{ hour: string; avgTime: number; queryCount: number }>;
    daily: Array<{ date: string; avgTime: number; queryCount: number }>;
  };
  indexPerformance: {
    hitRate: number;
    scanEfficiency: number;
    maintenanceNeeded: boolean;
  };
  slowQueries: Array<{
    queryId: string;
    executionTime: number;
    query: string;
    timestamp: string;
  }>;
  qualityMetrics: {
    averageRelevance: number;
    userSatisfactionTrend: number[];
    topPerformingQueries: string[];
  };
}

export interface OptimizationRecommendation {
  type: 'index' | 'query' | 'configuration' | 'hardware';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImprovement: string;
  implementation: string;
  estimatedEffort: string;
}

class SearchPerformanceMonitor {
  private metrics: SearchMetrics[] = [];
  private queries: Map<string, SearchQuery> = new Map();
  private results: Map<string, SearchResult> = new Map();
  private maxMetricsHistory = 10000;
  
  // Performance thresholds
  private readonly thresholds = {
    slowQueryTime: 1000, // 1 second
    lowRelevanceScore: 0.6,
    lowIndexHitRate: 0.8,
    highMemoryUsage: 1000 * 1024 * 1024 // 1GB
  };

  constructor(private dbConfig: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }) {
    console.log('🔍 Search Performance Monitor initialized');
    
    // Start periodic analysis
    setInterval(() => this.performPeriodicAnalysis(), 300000); // Every 5 minutes
    
    // Start performance collection
    this.startPerformanceCollection();
  }

  /**
   * Record a search query
   */
  recordQuery(query: Omit<SearchQuery, 'id' | 'timestamp'>): string {
    const queryId = this.generateQueryId();
    
    const searchQuery: SearchQuery = {
      id: queryId,
      timestamp: new Date().toISOString(),
      ...query
    };

    this.queries.set(queryId, searchQuery);
    
    return queryId;
  }

  /**
   * Record search results and calculate metrics
   */
  async recordSearchResults(queryId: string, result: Omit<SearchResult, 'queryId'>): Promise<void> {
    const query = this.queries.get(queryId);
    if (!query) {
      console.error(`❌ Query not found: ${queryId}`);
      return;
    }

    const searchResult: SearchResult = {
      queryId,
      ...result
    };

    this.results.set(queryId, searchResult);

    // Calculate comprehensive metrics
    const metrics = await this.calculateSearchMetrics(query, searchResult);
    this.metrics.push(metrics);
    
    this.trimHistory();

    // Check for performance issues
    this.checkPerformanceIssues(metrics);

    console.log(`🔍 Search metrics recorded: ${queryId} (${metrics.executionTime}ms, ${metrics.quality.relevanceScore.toFixed(2)} relevance)`);
  }

  /**
   * Calculate comprehensive search metrics
   */
  private async calculateSearchMetrics(query: SearchQuery, result: SearchResult): Promise<SearchMetrics> {
    const similarities = result.results.map(r => r.similarity);
    
    const similarity = {
      average: similarities.length > 0 ? similarities.reduce((a, b) => a + b) / similarities.length : 0,
      highest: similarities.length > 0 ? Math.max(...similarities) : 0,
      lowest: similarities.length > 0 ? Math.min(...similarities) : 0
    };

    // Determine query type
    const queryType: SearchMetrics['queryType'] = 
      query.embedding.length > 0 ? 'vector' : 'text';

    // Get system performance metrics
    const performance = await this.getSystemPerformanceMetrics();

    // Calculate quality metrics
    const quality = this.calculateQualityMetrics(similarity, result);

    return {
      queryId: query.id,
      timestamp: query.timestamp,
      queryType,
      dimensions: query.embedding.length,
      resultCount: result.results.length,
      executionTime: result.executionTime,
      indexScanTime: await this.getIndexScanTime(query.id),
      embeddingGenerationTime: await this.getEmbeddingGenerationTime(query.id),
      postgresQueryTime: await this.getPostgresQueryTime(query.id),
      similarity,
      performance,
      quality
    };
  }

  /**
   * Generate performance analytics
   */
  generatePerformanceAnalytics(timeframe?: { start: Date; end: Date }): PerformanceAnalytics {
    let filteredMetrics = this.metrics;

    if (timeframe) {
      filteredMetrics = this.metrics.filter(m => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= timeframe.start && timestamp <= timeframe.end;
      });
    }

    const totalQueries = filteredMetrics.length;
    const averageExecutionTime = totalQueries > 0 
      ? filteredMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries 
      : 0;

    const averageRelevanceScore = totalQueries > 0
      ? filteredMetrics.reduce((sum, m) => sum + m.quality.relevanceScore, 0) / totalQueries
      : 0;

    // Query type distribution
    const queryDistribution = {
      vector: filteredMetrics.filter(m => m.queryType === 'vector').length,
      hybrid: filteredMetrics.filter(m => m.queryType === 'hybrid').length,
      text: filteredMetrics.filter(m => m.queryType === 'text').length
    };

    // Performance trends
    const performanceTrends = this.calculatePerformanceTrends(filteredMetrics);

    // Index performance
    const indexPerformance = this.calculateIndexPerformance(filteredMetrics);

    // Identify slow queries
    const slowQueries = this.identifySlowQueries(filteredMetrics);

    // Quality metrics
    const qualityMetrics = this.calculateQualityAnalytics(filteredMetrics);

    return {
      totalQueries,
      averageExecutionTime,
      averageRelevanceScore,
      queryDistribution,
      performanceTrends,
      indexPerformance,
      slowQueries,
      qualityMetrics
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(): OptimizationRecommendation[] {
    const analytics = this.generatePerformanceAnalytics();
    const recommendations: OptimizationRecommendation[] = [];

    // Slow query performance
    if (analytics.averageExecutionTime > this.thresholds.slowQueryTime) {
      recommendations.push({
        type: 'index',
        priority: 'high',
        title: 'Optimize Vector Index Configuration',
        description: `Average query time (${analytics.averageExecutionTime}ms) exceeds threshold. Consider index tuning.`,
        expectedImprovement: '30-50% faster queries',
        implementation: 'Adjust m, ef_construction parameters for HNSW index',
        estimatedEffort: '2-4 hours'
      });
    }

    // Low relevance scores
    if (analytics.averageRelevanceScore < this.thresholds.lowRelevanceScore) {
      recommendations.push({
        type: 'query',
        priority: 'medium',
        title: 'Improve Embedding Quality',
        description: `Low average relevance score (${analytics.averageRelevanceScore.toFixed(2)}). Consider embedding model upgrade.`,
        expectedImprovement: '15-25% better relevance',
        implementation: 'Upgrade to newer embedding model or fine-tune current model',
        estimatedEffort: '1-2 days'
      });
    }

    // Index performance issues
    if (analytics.indexPerformance.hitRate < this.thresholds.lowIndexHitRate) {
      recommendations.push({
        type: 'index',
        priority: 'medium',
        title: 'Index Maintenance Required',
        description: `Index hit rate (${(analytics.indexPerformance.hitRate * 100).toFixed(1)}%) below threshold.`,
        expectedImprovement: '10-20% faster queries',
        implementation: 'Run VACUUM and REINDEX on vector columns',
        estimatedEffort: '30 minutes maintenance window'
      });
    }

    // Too many slow queries
    if (analytics.slowQueries.length > totalQueries * 0.1) {
      recommendations.push({
        type: 'configuration',
        priority: 'high',
        title: 'Database Configuration Tuning',
        description: `${analytics.slowQueries.length} slow queries detected. Database parameters may need adjustment.`,
        expectedImprovement: '20-40% better overall performance',
        implementation: 'Adjust work_mem, shared_buffers, and pgvector-specific settings',
        estimatedEffort: '4-6 hours including testing'
      });
    }

    // Memory usage concerns
    const avgMemoryUsage = this.getAverageMemoryUsage();
    if (avgMemoryUsage > this.thresholds.highMemoryUsage) {
      recommendations.push({
        type: 'hardware',
        priority: 'medium',
        title: 'Memory Optimization',
        description: `High memory usage detected (${(avgMemoryUsage / 1024 / 1024).toFixed(0)}MB average).`,
        expectedImprovement: 'Better query concurrency',
        implementation: 'Increase RAM or optimize vector dimensions',
        estimatedEffort: 'Hardware upgrade or 2-3 hours optimization'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get real-time performance dashboard data
   */
  getRealTimeDashboard(): {
    currentMetrics: {
      queriesLastMinute: number;
      avgResponseTimeLastMinute: number;
      avgRelevanceLastMinute: number;
      activeConnections: number;
    };
    recentSlowQueries: Array<{
      queryId: string;
      executionTime: number;
      timestamp: string;
    }>;
    performanceAlerts: Array<{
      type: string;
      message: string;
      severity: 'warning' | 'critical';
      timestamp: string;
    }>;
    systemHealth: {
      indexHealth: 'good' | 'warning' | 'critical';
      memoryUsage: number;
      diskUsage: number;
      connectionPool: number;
    };
  } {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentMetrics = this.metrics.filter(m => new Date(m.timestamp) >= oneMinuteAgo);

    const currentMetrics = {
      queriesLastMinute: recentMetrics.length,
      avgResponseTimeLastMinute: recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length
        : 0,
      avgRelevanceLastMinute: recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.quality.relevanceScore, 0) / recentMetrics.length
        : 0,
      activeConnections: this.getActiveConnections()
    };

    const recentSlowQueries = this.metrics
      .filter(m => m.executionTime > this.thresholds.slowQueryTime)
      .slice(-5)
      .map(m => ({
        queryId: m.queryId,
        executionTime: m.executionTime,
        timestamp: m.timestamp
      }));

    const performanceAlerts = this.generatePerformanceAlerts();
    const systemHealth = this.getSystemHealth();

    return {
      currentMetrics,
      recentSlowQueries,
      performanceAlerts,
      systemHealth
    };
  }

  /**
   * Export performance data
   */
  exportPerformanceData(format: 'json' | 'csv' = 'json', timeframe?: { start: Date; end: Date }): string {
    const analytics = this.generatePerformanceAnalytics(timeframe);
    const recommendations = this.generateOptimizationRecommendations();

    const data = {
      exportedAt: new Date().toISOString(),
      analytics,
      recommendations,
      rawMetrics: this.metrics.filter(m => {
        if (!timeframe) return true;
        const timestamp = new Date(m.timestamp);
        return timestamp >= timeframe.start && timestamp <= timeframe.end;
      })
    };

    if (format === 'csv') {
      return this.convertMetricsToCSV(data.rawMetrics);
    }

    return JSON.stringify(data, null, 2);
  }

  // Private helper methods

  private generateQueryId(): string {
    return `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private trimHistory(): void {
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      
      // Also clean up old queries and results
      const validQueryIds = new Set(this.metrics.map(m => m.queryId));
      for (const [queryId] of this.queries) {
        if (!validQueryIds.has(queryId)) {
          this.queries.delete(queryId);
          this.results.delete(queryId);
        }
      }
    }
  }

  private checkPerformanceIssues(metrics: SearchMetrics): void {
    if (metrics.executionTime > this.thresholds.slowQueryTime) {
      console.warn(`⚠️ Slow query detected: ${metrics.queryId} (${metrics.executionTime}ms)`);
    }

    if (metrics.quality.relevanceScore < this.thresholds.lowRelevanceScore) {
      console.warn(`⚠️ Low relevance query: ${metrics.queryId} (${metrics.quality.relevanceScore.toFixed(2)})`);
    }

    if (metrics.performance.memoryUsage > this.thresholds.highMemoryUsage) {
      console.warn(`⚠️ High memory usage: ${metrics.queryId} (${(metrics.performance.memoryUsage / 1024 / 1024).toFixed(0)}MB)`);
    }
  }

  private async getSystemPerformanceMetrics(): Promise<SearchMetrics['performance']> {
    // In a real implementation, these would query the actual database and system
    return {
      queriesPerSecond: this.calculateQueriesPerSecond(),
      memoryUsage: await this.getCurrentMemoryUsage(),
      indexHitRate: await this.getIndexHitRate()
    };
  }

  private calculateQualityMetrics(similarity: SearchMetrics['similarity'], result: SearchResult): SearchMetrics['quality'] {
    // Quality score based on similarity scores and result distribution
    const relevanceScore = similarity.average * 0.7 + (similarity.highest > 0.8 ? 0.3 : 0);
    
    return {
      relevanceScore: Math.min(1, relevanceScore),
      // User satisfaction and CTR would be filled by external systems
      userSatisfaction: undefined,
      clickThroughRate: undefined
    };
  }

  private calculatePerformanceTrends(metrics: SearchMetrics[]) {
    // Group by hour and day
    const hourlyData: Record<string, { total: number; count: number }> = {};
    const dailyData: Record<string, { total: number; count: number }> = {};

    metrics.forEach(m => {
      const date = new Date(m.timestamp);
      const hourKey = date.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      const dayKey = date.toISOString().substring(0, 10); // YYYY-MM-DD

      // Hourly aggregation
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { total: 0, count: 0 };
      }
      hourlyData[hourKey].total += m.executionTime;
      hourlyData[hourKey].count++;

      // Daily aggregation
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { total: 0, count: 0 };
      }
      dailyData[dayKey].total += m.executionTime;
      dailyData[dayKey].count++;
    });

    return {
      hourly: Object.entries(hourlyData).map(([hour, data]) => ({
        hour,
        avgTime: data.total / data.count,
        queryCount: data.count
      })).sort((a, b) => a.hour.localeCompare(b.hour)),
      
      daily: Object.entries(dailyData).map(([date, data]) => ({
        date,
        avgTime: data.total / data.count,
        queryCount: data.count
      })).sort((a, b) => a.date.localeCompare(b.date))
    };
  }

  private calculateIndexPerformance(metrics: SearchMetrics[]) {
    const avgHitRate = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.performance.indexHitRate, 0) / metrics.length
      : 0;

    const scanEfficiency = this.calculateScanEfficiency(metrics);
    const maintenanceNeeded = avgHitRate < this.thresholds.lowIndexHitRate;

    return {
      hitRate: avgHitRate,
      scanEfficiency,
      maintenanceNeeded
    };
  }

  private identifySlowQueries(metrics: SearchMetrics[]) {
    return metrics
      .filter(m => m.executionTime > this.thresholds.slowQueryTime)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10)
      .map(m => {
        const query = this.queries.get(m.queryId);
        return {
          queryId: m.queryId,
          executionTime: m.executionTime,
          query: query?.query || 'Unknown query',
          timestamp: m.timestamp
        };
      });
  }

  private calculateQualityAnalytics(metrics: SearchMetrics[]) {
    const averageRelevance = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.quality.relevanceScore, 0) / metrics.length
      : 0;

    // Calculate satisfaction trend (would use actual user feedback in real implementation)
    const userSatisfactionTrend = this.calculateSatisfactionTrend(metrics);

    // Identify top performing queries
    const topPerformingQueries = metrics
      .filter(m => m.quality.relevanceScore > 0.8)
      .sort((a, b) => b.quality.relevanceScore - a.quality.relevanceScore)
      .slice(0, 5)
      .map(m => this.queries.get(m.queryId)?.query || 'Unknown')
      .filter((query, index, self) => self.indexOf(query) === index);

    return {
      averageRelevance,
      userSatisfactionTrend,
      topPerformingQueries
    };
  }

  private startPerformanceCollection(): void {
    // Start background performance monitoring
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  private performPeriodicAnalysis(): void {
    console.log('🔄 Running periodic search performance analysis...');
    
    const analytics = this.generatePerformanceAnalytics();
    console.log(`🔍 Analysis: ${analytics.totalQueries} queries, ${analytics.averageExecutionTime.toFixed(0)}ms avg, ${analytics.averageRelevanceScore.toFixed(2)} relevance`);
    
    const recommendations = this.generateOptimizationRecommendations();
    if (recommendations.length > 0) {
      console.log(`💡 ${recommendations.length} optimization recommendations available`);
      recommendations.slice(0, 3).forEach(rec => {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.title}`);
      });
    }
  }

  // Placeholder methods for database/system integration
  private async getIndexScanTime(queryId: string): Promise<number> { return 0; }
  private async getEmbeddingGenerationTime(queryId: string): Promise<number> { return 0; }
  private async getPostgresQueryTime(queryId: string): Promise<number> { return 0; }
  private calculateQueriesPerSecond(): number { return 0; }
  private async getCurrentMemoryUsage(): Promise<number> { return 0; }
  private async getIndexHitRate(): Promise<number> { return 1; }
  private getAverageMemoryUsage(): number { return 0; }
  private getActiveConnections(): number { return 0; }
  private calculateScanEfficiency(metrics: SearchMetrics[]): number { return 1; }
  private calculateSatisfactionTrend(metrics: SearchMetrics[]): number[] { return []; }
  private generatePerformanceAlerts(): any[] { return []; }
  private getSystemHealth(): any { return {}; }
  private collectSystemMetrics(): void { }
  
  private convertMetricsToCSV(metrics: SearchMetrics[]): string {
    const headers = [
      'queryId', 'timestamp', 'queryType', 'dimensions', 'resultCount',
      'executionTime', 'avgSimilarity', 'highestSimilarity', 'relevanceScore'
    ];
    
    const rows = metrics.map(m => [
      m.queryId,
      m.timestamp,
      m.queryType,
      m.dimensions.toString(),
      m.resultCount.toString(),
      m.executionTime.toString(),
      m.similarity.average.toFixed(4),
      m.similarity.highest.toFixed(4),
      m.quality.relevanceScore.toFixed(4)
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

export { SearchPerformanceMonitor };