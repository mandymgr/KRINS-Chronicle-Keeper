#!/usr/bin/env bun

/**
 * Pattern Analytics Engine for KRINS-Chronicle-Keeper
 * Real-time pattern usage tracking and analytics
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class PatternAnalyticsEngine extends EventEmitter {
  constructor() {
    super();
    this.rootDir = process.cwd();
    this.analyticsData = {
      patterns: new Map(),
      usage: new Map(),
      trends: [],
      performance: new Map(),
      teams: new Map()
    };
    this.isRunning = false;
    this.updateInterval = null;
  }

  log(level, message) {
    const prefix = {
      'error': '❌',
      'warn': '⚠️ ',
      'info': '✅',
      'success': '🎉',
      'analytics': '📊'
    }[level] || '📋';
    
    console.log(`${prefix} ${message}`);
  }

  async start() {
    if (this.isRunning) {
      this.log('warn', 'Analytics engine already running');
      return;
    }

    this.log('info', 'Starting pattern analytics engine...');
    this.isRunning = true;

    try {
      await this.initializeData();
      await this.scanPatterns();
      await this.analyzeUsage();
      
      // Start periodic updates
      this.updateInterval = setInterval(() => {
        this.periodicUpdate();
      }, 60000); // Every minute

      this.log('success', 'Analytics engine started successfully');
      this.emit('started');
    } catch (error) {
      this.log('error', `Failed to start analytics engine: ${error.message}`);
      this.isRunning = false;
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) return;

    this.log('info', 'Stopping analytics engine...');
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    await this.saveAnalyticsData();
    this.isRunning = false;
    
    this.log('success', 'Analytics engine stopped');
    this.emit('stopped');
  }

  async initializeData() {
    const analyticsFile = path.join(this.rootDir, '.pattern-analytics.json');
    
    try {
      const data = await fs.readFile(analyticsFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Restore Maps from JSON objects
      this.analyticsData.patterns = new Map(Object.entries(parsed.patterns || {}));
      this.analyticsData.usage = new Map(Object.entries(parsed.usage || {}));
      this.analyticsData.trends = parsed.trends || [];
      this.analyticsData.performance = new Map(Object.entries(parsed.performance || {}));
      this.analyticsData.teams = new Map(Object.entries(parsed.teams || {}));
      
      this.log('info', 'Loaded existing analytics data');
    } catch (error) {
      this.log('info', 'No existing analytics data found, starting fresh');
    }
  }

  async scanPatterns() {
    const patternsDir = path.join(this.rootDir, 'docs', 'patterns');
    
    try {
      await this.scanDirectory(patternsDir);
    } catch (error) {
      this.log('warn', `Could not scan patterns directory: ${error.message}`);
    }
  }

  async scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (entry.name.endsWith('-pattern.md')) {
          await this.analyzePattern(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  async analyzePattern(patternFile) {
    try {
      const content = await fs.readFile(patternFile, 'utf8');
      const stats = await fs.stat(patternFile);
      
      const analysis = {
        file: patternFile,
        name: this.extractPatternName(content),
        category: this.extractCategory(patternFile),
        complexity: this.calculateComplexity(content),
        codeExamples: this.countCodeExamples(content),
        relatedADRs: this.extractADRs(content),
        lastModified: stats.mtime,
        size: stats.size,
        readability: this.calculateReadability(content),
        completeness: this.assessCompleteness(content)
      };

      this.analyticsData.patterns.set(patternFile, analysis);
      
      // Track usage trends
      this.updateUsageMetrics(analysis);
      
    } catch (error) {
      this.log('warn', `Could not analyze pattern ${patternFile}: ${error.message}`);
    }
  }

  extractPatternName(content) {
    const titleMatch = content.match(/^# (.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Unknown Pattern';
  }

  extractCategory(filePath) {
    const parts = filePath.split(path.sep);
    const patternsIndex = parts.findIndex(part => part === 'patterns');
    return patternsIndex !== -1 && parts[patternsIndex + 1] ? parts[patternsIndex + 1] : 'uncategorized';
  }

  calculateComplexity(content) {
    // Simple complexity calculation based on various factors
    let complexity = 0;
    
    // Code blocks add complexity
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    complexity += codeBlocks * 2;
    
    // Sections add structure complexity
    const sections = (content.match(/^##/gm) || []).length;
    complexity += sections;
    
    // References to other patterns/ADRs add integration complexity
    const references = (content.match(/ADR-\d+|pattern/gi) || []).length;
    complexity += references;
    
    // Length contributes to complexity
    complexity += Math.floor(content.length / 1000);
    
    return Math.min(complexity, 100); // Cap at 100
  }

  countCodeExamples(content) {
    return (content.match(/```[\s\S]*?```/g) || []).length;
  }

  extractADRs(content) {
    const adrMatches = content.match(/ADR-\d{4}/g);
    return adrMatches ? [...new Set(adrMatches)] : [];
  }

  calculateReadability(content) {
    // Simple readability score
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Flesch-like formula adapted for technical docs
    let readability = 206.835 - (1.015 * avgWordsPerSentence);
    
    // Adjust for technical content
    const technicalTerms = (content.match(/\b(API|SDK|JSON|HTTP|async|await|interface|class|function)\b/gi) || []).length;
    readability -= (technicalTerms / words) * 50;
    
    return Math.max(0, Math.min(100, readability));
  }

  assessCompleteness(content) {
    const requiredSections = [
      '## Description',
      '## Usage', 
      '## Implementation',
      '## Examples',
      '## Related ADRs'
    ];
    
    let completeness = 0;
    requiredSections.forEach(section => {
      if (content.includes(section)) completeness += 20;
    });
    
    // Check for code examples
    if (this.countCodeExamples(content) > 0) completeness += 10;
    
    // Check for placeholders (negative points)
    const placeholders = (content.match(/\[Add your|\[Describe|\[List/gi) || []).length;
    completeness -= placeholders * 5;
    
    return Math.max(0, Math.min(100, completeness));
  }

  updateUsageMetrics(analysis) {
    const category = analysis.category;
    const usage = this.analyticsData.usage.get(category) || {
      count: 0,
      lastUsed: new Date(),
      avgComplexity: 0,
      avgCompleteness: 0
    };
    
    usage.count++;
    usage.lastUsed = new Date();
    usage.avgComplexity = (usage.avgComplexity + analysis.complexity) / 2;
    usage.avgCompleteness = (usage.avgCompleteness + analysis.completeness) / 2;
    
    this.analyticsData.usage.set(category, usage);
  }

  async analyzeUsage() {
    this.log('analytics', 'Analyzing pattern usage trends...');
    
    // Analyze by category
    const categories = [...this.analyticsData.patterns.values()].reduce((acc, pattern) => {
      acc[pattern.category] = (acc[pattern.category] || 0) + 1;
      return acc;
    }, {});
    
    // Analyze complexity distribution
    const complexities = [...this.analyticsData.patterns.values()].map(p => p.complexity);
    const avgComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;
    
    // Analyze completeness
    const completeness = [...this.analyticsData.patterns.values()].map(p => p.completeness);
    const avgCompleteness = completeness.reduce((a, b) => a + b, 0) / completeness.length;
    
    // Store trend data
    const trend = {
      timestamp: new Date().toISOString(),
      totalPatterns: this.analyticsData.patterns.size,
      categories: Object.keys(categories).length,
      avgComplexity: Math.round(avgComplexity),
      avgCompleteness: Math.round(avgCompleteness),
      categoryDistribution: categories
    };
    
    this.analyticsData.trends.push(trend);
    
    // Keep only last 30 trend points
    if (this.analyticsData.trends.length > 30) {
      this.analyticsData.trends = this.analyticsData.trends.slice(-30);
    }
    
    this.log('analytics', `Current metrics: ${trend.totalPatterns} patterns, ${avgComplexity.toFixed(1)} avg complexity, ${avgCompleteness.toFixed(1)}% avg completeness`);
  }

  async periodicUpdate() {
    if (!this.isRunning) return;
    
    try {
      await this.scanPatterns();
      await this.analyzeUsage();
      await this.saveAnalyticsData();
      
      this.emit('updated', this.getMetrics());
    } catch (error) {
      this.log('error', `Periodic update failed: ${error.message}`);
    }
  }

  async saveAnalyticsData() {
    const analyticsFile = path.join(this.rootDir, '.pattern-analytics.json');
    
    const data = {
      patterns: Object.fromEntries(this.analyticsData.patterns),
      usage: Object.fromEntries(this.analyticsData.usage),
      trends: this.analyticsData.trends,
      performance: Object.fromEntries(this.analyticsData.performance),
      teams: Object.fromEntries(this.analyticsData.teams),
      lastUpdated: new Date().toISOString()
    };
    
    try {
      await fs.writeFile(analyticsFile, JSON.stringify(data, null, 2));
      this.log('info', 'Analytics data saved');
    } catch (error) {
      this.log('error', `Failed to save analytics data: ${error.message}`);
    }
  }

  getMetrics() {
    const patterns = [...this.analyticsData.patterns.values()];
    const usage = [...this.analyticsData.usage.values()];
    const latestTrend = this.analyticsData.trends[this.analyticsData.trends.length - 1];
    
    return {
      summary: {
        totalPatterns: patterns.length,
        totalCategories: new Set(patterns.map(p => p.category)).size,
        avgComplexity: patterns.reduce((sum, p) => sum + p.complexity, 0) / patterns.length || 0,
        avgCompleteness: patterns.reduce((sum, p) => sum + p.completeness, 0) / patterns.length || 0
      },
      categories: [...this.analyticsData.usage.entries()].map(([name, data]) => ({
        name,
        count: data.count,
        avgComplexity: data.avgComplexity,
        avgCompleteness: data.avgCompleteness
      })),
      trends: this.analyticsData.trends,
      topPatterns: patterns
        .sort((a, b) => b.completeness - a.completeness)
        .slice(0, 10)
        .map(p => ({
          name: p.name,
          category: p.category,
          completeness: p.completeness,
          complexity: p.complexity
        })),
      needsAttention: patterns
        .filter(p => p.completeness < 70 || p.complexity > 80)
        .map(p => ({
          name: p.name,
          category: p.category,
          issue: p.completeness < 70 ? 'Low completeness' : 'High complexity',
          value: p.completeness < 70 ? p.completeness : p.complexity
        }))
    };
  }

  async generateReport() {
    const metrics = this.getMetrics();
    const reportPath = path.join(this.rootDir, 'pattern-analytics-report.json');
    
    try {
      await fs.writeFile(reportPath, JSON.stringify(metrics, null, 2));
      this.log('success', `Analytics report generated: ${reportPath}`);
      
      // Console report
      console.log('\n📊 PATTERN ANALYTICS REPORT');
      console.log('==========================');
      console.log(`Total Patterns: ${metrics.summary.totalPatterns}`);
      console.log(`Categories: ${metrics.summary.totalCategories}`);
      console.log(`Average Complexity: ${metrics.summary.avgComplexity.toFixed(1)}`);
      console.log(`Average Completeness: ${metrics.summary.avgCompleteness.toFixed(1)}%`);
      
      if (metrics.needsAttention.length > 0) {
        console.log('\n⚠️  PATTERNS NEEDING ATTENTION:');
        metrics.needsAttention.forEach((pattern, index) => {
          console.log(`${index + 1}. ${pattern.name} (${pattern.category}): ${pattern.issue} (${pattern.value})`);
        });
      }
      
      console.log('\n🏆 TOP PATTERNS BY COMPLETENESS:');
      metrics.topPatterns.slice(0, 5).forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.name} (${pattern.completeness}%)`);
      });
      
      return reportPath;
    } catch (error) {
      this.log('error', `Failed to generate report: ${error.message}`);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const engine = new PatternAnalyticsEngine();
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
📊 KRINS-Chronicle-Keeper Pattern Analytics Engine

Usage:
  node pattern-analytics-engine.js                # Start analytics engine
  node pattern-analytics-engine.js --report      # Generate analytics report
  node pattern-analytics-engine.js --metrics     # Show current metrics
  
Options:
  --report     Generate comprehensive analytics report
  --metrics    Display current metrics summary
  --daemon     Run in daemon mode (continuous monitoring)
  
Examples:
  node pattern-analytics-engine.js --report
  node pattern-analytics-engine.js --metrics
  node pattern-analytics-engine.js --daemon
`);
    return;
  }
  
  try {
    if (args.includes('--report')) {
      await engine.start();
      const reportPath = await engine.generateReport();
      await engine.stop();
      console.log(`\nReport saved to: ${reportPath}`);
    } else if (args.includes('--metrics')) {
      await engine.start();
      const metrics = engine.getMetrics();
      console.log('\n📊 CURRENT METRICS');
      console.log('==================');
      console.log(JSON.stringify(metrics.summary, null, 2));
      await engine.stop();
    } else if (args.includes('--daemon')) {
      await engine.start();
      console.log('Analytics engine running in daemon mode. Press Ctrl+C to stop.');
      
      process.on('SIGINT', async () => {
        console.log('\nShutting down...');
        await engine.stop();
        process.exit(0);
      });
    } else {
      await engine.start();
      await engine.generateReport();
      await engine.stop();
    }
  } catch (error) {
    console.error('❌ Analytics engine failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PatternAnalyticsEngine;