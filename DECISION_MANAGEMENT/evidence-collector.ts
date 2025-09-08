#!/usr/bin/env bun
/**
 * 📊 Evidence Collector - Advanced Metrics and Feedback Collection
 * 
 * Intelligent evidence gathering system for ADR validation and continuous improvement
 * with automated data collection and trend analysis
 */

import { DecisionTracker, ADR, Evidence } from './decision-tracker';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export interface MetricConfiguration {
  id: string;
  name: string;
  type: 'performance' | 'business' | 'technical' | 'user_satisfaction' | 'cost';
  source: 'git' | 'database' | 'api' | 'log' | 'survey' | 'manual';
  query: string;
  unit: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  thresholds: {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
  };
  relatedADRs: string[];
  automated: boolean;
}

export interface EvidenceCollection {
  id: string;
  adrId: string;
  collectionDate: Date;
  metrics: CollectedMetric[];
  incidents: IncidentReport[];
  feedback: UserFeedback[];
  performance: PerformanceData[];
  costs: CostData[];
  summary: {
    overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
    keyFindings: string[];
    recommendations: string[];
    trendsDetected: string[];
  };
}

export interface CollectedMetric {
  configId: string;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
  confidence: number;
  trend: 'improving' | 'stable' | 'degrading' | 'unknown';
  comparedToPrevious: number; // percentage change
}

export interface IncidentReport {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  relatedComponents: string[];
  resolution: string;
  rootCause: string;
  preventionMeasures: string[];
  relatedADRs: string[];
}

export interface UserFeedback {
  id: string;
  timestamp: Date;
  source: 'survey' | 'interview' | 'support_ticket' | 'github_issue' | 'slack';
  category: 'usability' | 'performance' | 'feature_request' | 'bug_report' | 'general';
  sentiment: 'positive' | 'neutral' | 'negative';
  score?: number; // 1-10 if applicable
  comment: string;
  relatedFeatures: string[];
  actionable: boolean;
}

export interface PerformanceData {
  timestamp: Date;
  metric: string;
  value: number;
  unit: string;
  endpoint?: string;
  component: string;
  environment: 'development' | 'staging' | 'production';
}

export interface CostData {
  timestamp: Date;
  category: 'infrastructure' | 'development' | 'maintenance' | 'support' | 'licensing';
  amount: number;
  currency: string;
  description: string;
  allocatedTo: string[];
  recurring: boolean;
  frequency?: 'monthly' | 'annually';
}

export interface TrendAnalysis {
  metric: string;
  period: '7d' | '30d' | '90d' | '1y';
  trend: 'improving' | 'stable' | 'degrading' | 'unknown';
  changePercentage: number;
  dataPoints: number;
  confidence: number;
  anomaliesDetected: number;
  seasonalityDetected: boolean;
  forecast?: {
    nextValue: number;
    confidence: number;
    date: Date;
  };
}

export class EvidenceCollector {
  private tracker: DecisionTracker;
  private configFile: string;
  private evidenceDir: string;
  private configurations: Map<string, MetricConfiguration> = new Map();

  constructor(chronicleKeeperPath: string = process.cwd()) {
    this.tracker = new DecisionTracker(chronicleKeeperPath);
    this.configFile = join(chronicleKeeperPath, 'DECISION_MANAGEMENT', 'evidence-config.json');
    this.evidenceDir = join(chronicleKeeperPath, 'DECISION_MANAGEMENT', 'evidence');
    
    this.loadConfigurations();
    this.ensureEvidenceDirectory();
  }

  /**
   * 📋 Load metric configurations
   */
  private loadConfigurations(): void {
    if (existsSync(this.configFile)) {
      try {
        const configs: MetricConfiguration[] = JSON.parse(readFileSync(this.configFile, 'utf-8'));
        for (const config of configs) {
          this.configurations.set(config.id, config);
        }
        console.log(`📋 Loaded ${this.configurations.size} metric configurations`);
      } catch (error) {
        console.error('Error loading configurations:', error);
      }
    } else {
      this.createDefaultConfigurations();
    }
  }

  /**
   * 🛠️ Create default metric configurations
   */
  private createDefaultConfigurations(): void {
    const defaults: MetricConfiguration[] = [
      {
        id: 'build_success_rate',
        name: 'Build Success Rate',
        type: 'technical',
        source: 'git',
        query: 'git log --oneline --grep="build:" --since="1 week ago" | wc -l',
        unit: 'percentage',
        frequency: 'daily',
        thresholds: { excellent: 95, good: 90, warning: 80, critical: 70 },
        relatedADRs: [],
        automated: true
      },
      {
        id: 'deployment_frequency',
        name: 'Deployment Frequency',
        type: 'performance',
        source: 'git',
        query: 'git log --oneline --grep="deploy" --since="1 month ago" | wc -l',
        unit: 'deployments/month',
        frequency: 'weekly',
        thresholds: { excellent: 20, good: 10, warning: 5, critical: 1 },
        relatedADRs: [],
        automated: true
      },
      {
        id: 'test_coverage',
        name: 'Test Coverage',
        type: 'technical',
        source: 'api',
        query: 'npm run test:coverage | grep "All files" | awk "{print $4}"',
        unit: 'percentage',
        frequency: 'daily',
        thresholds: { excellent: 90, good: 80, warning: 70, critical: 50 },
        relatedADRs: [],
        automated: true
      },
      {
        id: 'response_time_p95',
        name: 'API Response Time (95th percentile)',
        type: 'performance',
        source: 'log',
        query: 'tail -1000 /var/log/app.log | grep "response_time" | awk "{print $5}" | sort -n | tail -50',
        unit: 'milliseconds',
        frequency: 'hourly',
        thresholds: { excellent: 200, good: 500, warning: 1000, critical: 2000 },
        relatedADRs: [],
        automated: true
      },
      {
        id: 'user_satisfaction',
        name: 'User Satisfaction Score',
        type: 'user_satisfaction',
        source: 'survey',
        query: 'manual',
        unit: 'score',
        frequency: 'monthly',
        thresholds: { excellent: 8, good: 7, warning: 6, critical: 5 },
        relatedADRs: [],
        automated: false
      }
    ];

    for (const config of defaults) {
      this.configurations.set(config.id, config);
    }

    this.saveConfigurations();
    console.log('🛠️ Created default metric configurations');
  }

  /**
   * 💾 Save configurations to file
   */
  private saveConfigurations(): void {
    const configs = Array.from(this.configurations.values());
    writeFileSync(this.configFile, JSON.stringify(configs, null, 2));
  }

  /**
   * 📁 Ensure evidence directory exists
   */
  private ensureEvidenceDirectory(): void {
    if (!existsSync(this.evidenceDir)) {
      execSync(`mkdir -p "${this.evidenceDir}"`);
    }
  }

  /**
   * 📊 Collect evidence for ADR
   */
  async collectEvidence(adrId: string): Promise<EvidenceCollection> {
    const adr = this.tracker.getADR(adrId);
    if (!adr) {
      throw new Error(`ADR not found: ${adrId}`);
    }

    const collection: EvidenceCollection = {
      id: `evidence_${adrId}_${Date.now()}`,
      adrId,
      collectionDate: new Date(),
      metrics: [],
      incidents: [],
      feedback: [],
      performance: [],
      costs: [],
      summary: {
        overallHealth: 'good',
        keyFindings: [],
        recommendations: [],
        trendsDetected: []
      }
    };

    // Collect metrics
    for (const config of this.configurations.values()) {
      if (config.relatedADRs.includes(adrId) || config.relatedADRs.length === 0) {
        try {
          const metric = await this.collectMetric(config);
          if (metric) {
            collection.metrics.push(metric);
          }
        } catch (error) {
          console.error(`Error collecting metric ${config.id}:`, error);
        }
      }
    }

    // Collect incidents
    collection.incidents = await this.collectIncidents(adrId);

    // Collect user feedback
    collection.feedback = await this.collectUserFeedback(adrId);

    // Collect performance data
    collection.performance = await this.collectPerformanceData(adrId);

    // Collect cost data
    collection.costs = await this.collectCostData(adrId);

    // Generate summary
    collection.summary = this.generateSummary(collection);

    // Save collection
    await this.saveEvidenceCollection(collection);

    // Update ADR with new evidence
    for (const metric of collection.metrics) {
      const evidence: Evidence = {
        id: `${collection.id}_${metric.configId}`,
        type: 'metric',
        description: this.configurations.get(metric.configId)?.name || metric.configId,
        value: metric.value,
        unit: metric.unit,
        date: metric.timestamp,
        source: metric.source,
        confidence: metric.confidence,
        trend: metric.trend
      };
      this.tracker.addEvidence(adrId, evidence);
    }

    return collection;
  }

  /**
   * 📊 Collect single metric
   */
  private async collectMetric(config: MetricConfiguration): Promise<CollectedMetric | null> {
    if (!config.automated) {
      console.log(`Skipping manual metric: ${config.name}`);
      return null;
    }

    try {
      let value: number;
      const timestamp = new Date();

      switch (config.source) {
        case 'git':
          const gitOutput = execSync(config.query, { encoding: 'utf-8' });
          value = parseFloat(gitOutput.trim());
          break;

        case 'api':
          // For API calls, would need to implement HTTP client
          console.log(`API collection not yet implemented for ${config.name}`);
          return null;

        case 'log':
          const logOutput = execSync(config.query, { encoding: 'utf-8' });
          const lines = logOutput.trim().split('\n');
          const numbers = lines.map(line => parseFloat(line)).filter(n => !isNaN(n));
          value = numbers.length > 0 ? numbers.reduce((a, b) => a + b) / numbers.length : 0;
          break;

        case 'database':
          console.log(`Database collection not yet implemented for ${config.name}`);
          return null;

        default:
          console.log(`Unknown source: ${config.source}`);
          return null;
      }

      // Calculate trend compared to previous value
      const previousValue = await this.getPreviousMetricValue(config.id);
      const comparedToPrevious = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

      // Determine trend
      let trend: CollectedMetric['trend'] = 'stable';
      if (Math.abs(comparedToPrevious) > 10) {
        trend = comparedToPrevious > 0 ? 'improving' : 'degrading';
      }

      return {
        configId: config.id,
        value,
        unit: config.unit,
        timestamp,
        source: config.source,
        confidence: 85, // Default confidence
        trend,
        comparedToPrevious
      };

    } catch (error) {
      console.error(`Error collecting metric ${config.name}:`, error);
      return null;
    }
  }

  /**
   * 📈 Get previous metric value for trend calculation
   */
  private async getPreviousMetricValue(configId: string): Promise<number | null> {
    // Scan evidence files for previous values
    if (!existsSync(this.evidenceDir)) return null;

    const files = readdirSync(this.evidenceDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    for (const file of files.slice(0, 10)) { // Check last 10 collections
      try {
        const data: EvidenceCollection = JSON.parse(
          readFileSync(join(this.evidenceDir, file), 'utf-8')
        );
        
        const metric = data.metrics.find(m => m.configId === configId);
        if (metric) {
          return metric.value;
        }
      } catch (error) {
        continue; // Skip invalid files
      }
    }

    return null;
  }

  /**
   * 🚨 Collect incidents related to ADR
   */
  private async collectIncidents(adrId: string): Promise<IncidentReport[]> {
    // This would typically integrate with incident management systems
    // For now, return empty array - could be extended to read from:
    // - PagerDuty API
    // - JIRA tickets
    // - GitHub issues
    // - Log files for error patterns

    const incidents: IncidentReport[] = [];

    // Example: Check Git history for incident-related commits
    try {
      const gitLog = execSync(
        `git log --oneline --grep="fix\\|bug\\|incident" --since="1 month ago"`,
        { encoding: 'utf-8' }
      );

      const commits = gitLog.trim().split('\n').filter(line => line.trim());
      
      for (const commit of commits.slice(0, 5)) { // Limit to recent 5
        const [hash, ...messageParts] = commit.split(' ');
        const message = messageParts.join(' ');

        if (message.toLowerCase().includes('critical') || message.toLowerCase().includes('urgent')) {
          incidents.push({
            id: `incident_${hash}`,
            timestamp: new Date(),
            severity: message.toLowerCase().includes('critical') ? 'critical' : 'high',
            title: message,
            description: `Git commit: ${commit}`,
            relatedComponents: ['general'],
            resolution: 'Resolved via code fix',
            rootCause: 'To be determined',
            preventionMeasures: ['Additional testing', 'Code review'],
            relatedADRs: [adrId]
          });
        }
      }
    } catch (error) {
      console.error('Error collecting incidents from Git:', error);
    }

    return incidents;
  }

  /**
   * 💬 Collect user feedback
   */
  private async collectUserFeedback(adrId: string): Promise<UserFeedback[]> {
    // This would integrate with feedback systems:
    // - Customer support tickets
    // - App store reviews
    // - Internal surveys
    // - GitHub issues/discussions
    // - Slack feedback channels

    const feedback: UserFeedback[] = [];

    // Example: Check GitHub issues for user feedback
    try {
      // This is a placeholder - in reality would use GitHub API
      const sampleFeedback: UserFeedback[] = [
        {
          id: 'feedback_1',
          timestamp: new Date(),
          source: 'github_issue',
          category: 'performance',
          sentiment: 'negative',
          score: 3,
          comment: 'API response times have increased significantly',
          relatedFeatures: ['api'],
          actionable: true
        }
      ];

      feedback.push(...sampleFeedback);
    } catch (error) {
      console.error('Error collecting user feedback:', error);
    }

    return feedback;
  }

  /**
   * ⚡ Collect performance data
   */
  private async collectPerformanceData(adrId: string): Promise<PerformanceData[]> {
    const performanceData: PerformanceData[] = [];

    // Example: Collect from application logs
    try {
      // In real implementation, would parse actual log files or query monitoring systems
      const sampleData: PerformanceData[] = [
        {
          timestamp: new Date(),
          metric: 'response_time_avg',
          value: 245,
          unit: 'ms',
          endpoint: '/api/v1/users',
          component: 'user-service',
          environment: 'production'
        },
        {
          timestamp: new Date(),
          metric: 'memory_usage',
          value: 75,
          unit: '%',
          component: 'backend',
          environment: 'production'
        }
      ];

      performanceData.push(...sampleData);
    } catch (error) {
      console.error('Error collecting performance data:', error);
    }

    return performanceData;
  }

  /**
   * 💰 Collect cost data
   */
  private async collectCostData(adrId: string): Promise<CostData[]> {
    const costData: CostData[] = [];

    // Example: Would integrate with cloud provider billing APIs
    // AWS Cost Explorer, Google Cloud Billing, Azure Cost Management
    try {
      const sampleCosts: CostData[] = [
        {
          timestamp: new Date(),
          category: 'infrastructure',
          amount: 1250.00,
          currency: 'USD',
          description: 'Monthly AWS infrastructure costs',
          allocatedTo: ['backend', 'database'],
          recurring: true,
          frequency: 'monthly'
        }
      ];

      costData.push(...sampleCosts);
    } catch (error) {
      console.error('Error collecting cost data:', error);
    }

    return costData;
  }

  /**
   * 📋 Generate summary from collected evidence
   */
  private generateSummary(collection: EvidenceCollection): EvidenceCollection['summary'] {
    const summary: EvidenceCollection['summary'] = {
      overallHealth: 'good',
      keyFindings: [],
      recommendations: [],
      trendsDetected: []
    };

    // Analyze metrics for overall health
    const healthScores: number[] = [];
    
    for (const metric of collection.metrics) {
      const config = this.configurations.get(metric.configId);
      if (!config) continue;

      let healthScore = 100;
      if (metric.value <= config.thresholds.critical) healthScore = 0;
      else if (metric.value <= config.thresholds.warning) healthScore = 25;
      else if (metric.value <= config.thresholds.good) healthScore = 50;
      else if (metric.value <= config.thresholds.excellent) healthScore = 75;

      healthScores.push(healthScore);

      // Add key findings
      if (healthScore < 50) {
        summary.keyFindings.push(`${config.name} is below acceptable threshold (${metric.value} ${metric.unit})`);
        summary.recommendations.push(`Investigate and improve ${config.name}`);
      }

      // Detect trends
      if (Math.abs(metric.comparedToPrevious) > 20) {
        const direction = metric.comparedToPrevious > 0 ? 'increased' : 'decreased';
        summary.trendsDetected.push(`${config.name} has ${direction} by ${Math.abs(metric.comparedToPrevious).toFixed(1)}%`);
      }
    }

    // Calculate overall health
    if (healthScores.length > 0) {
      const avgHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
      if (avgHealth >= 75) summary.overallHealth = 'excellent';
      else if (avgHealth >= 50) summary.overallHealth = 'good';
      else if (avgHealth >= 25) summary.overallHealth = 'warning';
      else summary.overallHealth = 'critical';
    }

    // Analyze incidents
    const criticalIncidents = collection.incidents.filter(i => i.severity === 'critical').length;
    if (criticalIncidents > 0) {
      summary.keyFindings.push(`${criticalIncidents} critical incidents detected`);
      summary.recommendations.push('Review and address critical incidents');
      summary.overallHealth = 'critical';
    }

    // Analyze feedback sentiment
    const negativeFeedback = collection.feedback.filter(f => f.sentiment === 'negative').length;
    if (negativeFeedback > collection.feedback.length * 0.3) {
      summary.keyFindings.push(`High negative feedback ratio: ${negativeFeedback}/${collection.feedback.length}`);
      summary.recommendations.push('Address user concerns and improve user experience');
    }

    // Default recommendations if none generated
    if (summary.recommendations.length === 0) {
      summary.recommendations.push('Continue monitoring key metrics');
      summary.recommendations.push('Maintain current performance levels');
    }

    return summary;
  }

  /**
   * 💾 Save evidence collection to file
   */
  private async saveEvidenceCollection(collection: EvidenceCollection): Promise<void> {
    const filename = `${collection.adrId}_${collection.collectionDate.toISOString().split('T')[0]}.json`;
    const filepath = join(this.evidenceDir, filename);
    
    writeFileSync(filepath, JSON.stringify(collection, null, 2));
    console.log(`💾 Saved evidence collection: ${filename}`);
  }

  /**
   * 📈 Analyze trends across multiple collections
   */
  analyzeTrends(adrId: string, period: TrendAnalysis['period'] = '30d'): TrendAnalysis[] {
    const analyses: TrendAnalysis[] = [];

    // Get all evidence collections for ADR
    const collections = this.getEvidenceCollections(adrId);
    if (collections.length < 2) {
      console.log('Insufficient data for trend analysis');
      return analyses;
    }

    // Group metrics by type
    const metricGroups = new Map<string, CollectedMetric[]>();
    for (const collection of collections) {
      for (const metric of collection.metrics) {
        if (!metricGroups.has(metric.configId)) {
          metricGroups.set(metric.configId, []);
        }
        metricGroups.get(metric.configId)!.push(metric);
      }
    }

    // Analyze each metric group
    for (const [configId, metrics] of metricGroups) {
      const config = this.configurations.get(configId);
      if (!config || metrics.length < 2) continue;

      // Sort by timestamp
      metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Calculate trend
      const values = metrics.map(m => m.value);
      const trend = this.calculateTrend(values);
      
      // Calculate change percentage
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const changePercentage = ((lastValue - firstValue) / firstValue) * 100;

      // Detect anomalies (values more than 2 standard deviations from mean)
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
      const anomalies = values.filter(v => Math.abs(v - mean) > 2 * stdDev).length;

      analyses.push({
        metric: config.name,
        period,
        trend,
        changePercentage,
        dataPoints: values.length,
        confidence: Math.min(values.length * 10, 100),
        anomaliesDetected: anomalies,
        seasonalityDetected: this.detectSeasonality(values)
      });
    }

    return analyses;
  }

  /**
   * 📊 Calculate trend from values
   */
  private calculateTrend(values: number[]): TrendAnalysis['trend'] {
    if (values.length < 2) return 'stable';

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determine variance to detect volatility
    const mean = sumY / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    if (coefficientOfVariation > 0.3) return 'unknown';
    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'improving' : 'degrading';
  }

  /**
   * 🔍 Detect seasonality in data
   */
  private detectSeasonality(values: number[]): boolean {
    if (values.length < 8) return false;

    // Simple autocorrelation check for weekly pattern (if we have enough data)
    if (values.length >= 14) {
      const correlation = this.calculateAutocorrelation(values, 7);
      return Math.abs(correlation) > 0.3;
    }

    return false;
  }

  /**
   * 📈 Calculate autocorrelation for seasonality detection
   */
  private calculateAutocorrelation(values: number[], lag: number): number {
    if (values.length <= lag) return 0;

    const n = values.length - lag;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * 📁 Get evidence collections for ADR
   */
  private getEvidenceCollections(adrId: string): EvidenceCollection[] {
    const collections: EvidenceCollection[] = [];
    
    if (!existsSync(this.evidenceDir)) return collections;

    const files = readdirSync(this.evidenceDir)
      .filter(f => f.startsWith(adrId) && f.endsWith('.json'))
      .sort();

    for (const file of files) {
      try {
        const data: EvidenceCollection = JSON.parse(
          readFileSync(join(this.evidenceDir, file), 'utf-8')
        );
        collections.push(data);
      } catch (error) {
        console.error(`Error reading evidence file ${file}:`, error);
      }
    }

    return collections;
  }

  /**
   * 📊 Generate evidence report
   */
  generateReport(adrId?: string): string {
    const adrs = adrId ? [adrId] : this.tracker.getAllADRs().map(a => a.id);
    let report = `# 📊 Evidence Collection Report\n\n`;
    
    if (adrId) {
      const adr = this.tracker.getADR(adrId);
      report += `## ADR: ${adr?.title || adrId}\n\n`;
    }

    for (const id of adrs.slice(0, 10)) { // Limit to 10 ADRs
      const collections = this.getEvidenceCollections(id);
      if (collections.length === 0) continue;

      const latest = collections[collections.length - 1];
      report += `### ${id}\n`;
      report += `- **Overall Health:** ${latest.summary.overallHealth}\n`;
      report += `- **Last Collection:** ${latest.collectionDate.toISOString().split('T')[0]}\n`;
      report += `- **Metrics Collected:** ${latest.metrics.length}\n`;
      
      if (latest.summary.keyFindings.length > 0) {
        report += `- **Key Findings:**\n`;
        latest.summary.keyFindings.forEach(finding => {
          report += `  - ${finding}\n`;
        });
      }

      // Trend analysis
      const trends = this.analyzeTrends(id);
      if (trends.length > 0) {
        report += `- **Trends:**\n`;
        trends.slice(0, 3).forEach(trend => {
          report += `  - ${trend.metric}: ${trend.trend} (${trend.changePercentage.toFixed(1)}%)\n`;
        });
      }

      report += `\n`;
    }

    report += `---\n*Generated by KRINS-Chronicle-Keeper Evidence Collector*\n`;
    return report;
  }
}

// CLI interface
if (import.meta.main) {
  const collector = new EvidenceCollector();
  
  const command = Bun.argv[2];
  
  switch (command) {
    case 'collect':
      const adrId = Bun.argv[3];
      if (adrId) {
        collector.collectEvidence(adrId).then(collection => {
          console.log(`✅ Evidence collected for ${adrId}`);
          console.log(`Overall Health: ${collection.summary.overallHealth}`);
          console.log(`Metrics: ${collection.metrics.length}`);
          console.log(`Key Findings: ${collection.summary.keyFindings.length}`);
        }).catch(console.error);
      } else {
        console.log('Usage: bun evidence-collector.ts collect <adrId>');
      }
      break;

    case 'trends':
      const targetAdr = Bun.argv[3];
      const period = Bun.argv[4] as TrendAnalysis['period'] || '30d';
      
      if (targetAdr) {
        const trends = collector.analyzeTrends(targetAdr, period);
        console.log(`📈 Trend Analysis for ${targetAdr} (${period}):`);
        trends.forEach(trend => {
          console.log(`- ${trend.metric}: ${trend.trend} (${trend.changePercentage.toFixed(1)}%)`);
          console.log(`  Data Points: ${trend.dataPoints}, Confidence: ${trend.confidence}%`);
          if (trend.anomaliesDetected > 0) {
            console.log(`  ⚠️ Anomalies Detected: ${trend.anomaliesDetected}`);
          }
        });
      } else {
        console.log('Usage: bun evidence-collector.ts trends <adrId> [period]');
      }
      break;

    case 'report':
      const reportAdr = Bun.argv[3];
      console.log(collector.generateReport(reportAdr));
      break;

    default:
      console.log(`
📊 KRINS Evidence Collector

Usage: bun evidence-collector.ts <command>

Commands:
  collect <adrId>        Collect evidence for ADR
  trends <adrId> [period] Analyze trends for ADR
  report [adrId]         Generate evidence report

Examples:
  bun evidence-collector.ts collect ADR-0001
  bun evidence-collector.ts trends ADR-0001 30d
  bun evidence-collector.ts report > evidence-report.md
      `);
  }
}