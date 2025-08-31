#!/usr/bin/env node

/**
 * Pattern Analytics Engine for Dev Memory OS
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
      'debug': '📊'
    }[level] || '📋';
    
    console.log(`${prefix} ${message}`);
  }

  async initialize() {
    this.log('info', 'Initializing Pattern Analytics Engine...');
    
    try {
      await this.loadExistingPatterns();
      await this.loadHistoricalData();
      await this.initializeMetrics();
      
      this.isRunning = true;
      this.startRealTimeTracking();
      
      this.log('success', 'Pattern Analytics Engine initialized successfully');
      return true;
    } catch (error) {
      this.log('error', `Failed to initialize: ${error.message}`);
      return false;
    }
  }

  async loadExistingPatterns() {
    const patternsDir = path.join(this.rootDir, 'docs', 'patterns');
    
    try {
      const files = await fs.readdir(patternsDir);
      const patternFiles = files.filter(file => file.endsWith('-pattern.md'));
      
      for (const file of patternFiles) {
        const patternPath = path.join(patternsDir, file);
        const content = await fs.readFile(patternPath, 'utf-8');
        const pattern = this.parsePatternFile(content, file);
        
        this.analyticsData.patterns.set(pattern.id, {
          ...pattern,
          createdAt: await this.getFileCreatedTime(patternPath),
          lastModified: await this.getFileModifiedTime(patternPath),
          usageCount: 0,
          successRate: 0,
          teamAdoption: [],
          effectiveness: 0
        });
      }
      
      this.log('info', `Loaded ${this.analyticsData.patterns.size} patterns for analytics`);
    } catch (error) {
      this.log('warn', `Could not load patterns: ${error.message}`);
    }
  }

  parsePatternFile(content, filename) {
    const lines = content.split('\\n');
    const pattern = {
      id: filename.replace('-pattern.md', ''),
      filename: filename,
      name: '',
      category: '',
      complexity: 'medium',
      languages: [],
      description: ''
    };
    
    // Parse pattern name
    const titleMatch = lines[0]?.match(/# Pattern: (.+)/);
    if (titleMatch) {
      pattern.name = titleMatch[1].trim();
    }
    
    // Parse category from name or content
    pattern.category = this.inferPatternCategory(pattern.name);
    
    // Parse complexity
    if (content.includes('complexity: high') || content.includes('complex')) {
      pattern.complexity = 'high';
    } else if (content.includes('complexity: low') || content.includes('simple')) {
      pattern.complexity = 'low';
    }
    
    // Parse supported languages
    const codeBlocks = content.match(/```(\\w+)/g) || [];
    pattern.languages = [...new Set(codeBlocks.map(block => block.replace('```', '')))];
    
    return pattern;
  }

  inferPatternCategory(patternName) {
    const name = patternName.toLowerCase();
    
    if (name.includes('api') || name.includes('service') || name.includes('backend')) return 'backend';
    if (name.includes('ui') || name.includes('component') || name.includes('frontend')) return 'frontend';
    if (name.includes('test') || name.includes('validation')) return 'testing';
    if (name.includes('security') || name.includes('auth')) return 'security';
    if (name.includes('performance') || name.includes('cache')) return 'performance';
    if (name.includes('ci') || name.includes('deploy')) return 'devops';
    
    return 'general';
  }

  async getFileCreatedTime(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.birthtime;
    } catch (error) {
      return new Date();
    }
  }

  async getFileModifiedTime(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.mtime;
    } catch (error) {
      return new Date();
    }
  }

  async loadHistoricalData() {
    try {
      const analyticsFile = path.join(this.rootDir, 'analytics-data.json');
      const data = await fs.readFile(analyticsFile, 'utf-8');
      const historicalData = JSON.parse(data);
      
      // Merge historical data with current patterns
      for (const [patternId, pattern] of this.analyticsData.patterns.entries()) {
        const historical = historicalData.patterns?.[patternId];
        if (historical) {
          pattern.usageCount = historical.usageCount || 0;
          pattern.successRate = historical.successRate || 0;
          pattern.teamAdoption = historical.teamAdoption || [];
          pattern.effectiveness = historical.effectiveness || 0;
        }
      }
      
      this.log('info', 'Loaded historical analytics data');
    } catch (error) {
      this.log('debug', 'No historical data found, starting fresh');
    }
  }

  async initializeMetrics() {
    // Initialize real-time metrics tracking
    this.analyticsData.metrics = {
      totalPatterns: this.analyticsData.patterns.size,
      activePatterns: 0,
      averageUsage: 0,
      topCategories: [],
      adoptionRate: 0,
      effectivenessScore: 0,
      lastUpdated: new Date().toISOString()
    };
    
    this.updateMetrics();
  }

  startRealTimeTracking() {
    // Update analytics every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateRealTimeMetrics();
    }, 30000);
    
    // Watch for pattern file changes
    this.watchPatternFiles();
    
    this.log('info', 'Real-time analytics tracking started');
  }

  async updateRealTimeMetrics() {
    try {
      // Simulate pattern usage tracking (in production, this would come from actual usage)
      this.simulatePatternUsage();
      
      // Update metrics
      this.updateMetrics();
      
      // Generate trend data
      this.updateTrends();
      
      // Emit analytics update event
      this.emit('analytics-updated', this.getAnalyticsSummary());
      
    } catch (error) {
      this.log('error', `Analytics update failed: ${error.message}`);
    }
  }

  simulatePatternUsage() {
    // In a real implementation, this would track actual pattern usage from:
    // - Code analysis
    // - Git commit analysis
    // - Developer surveys
    // - Performance metrics
    
    for (const [patternId, pattern] of this.analyticsData.patterns.entries()) {
      // Simulate realistic usage patterns
      const baseUsage = Math.random() * 10;
      const categoryMultiplier = this.getCategoryUsageMultiplier(pattern.category);
      const ageMultiplier = this.getAgeUsageMultiplier(pattern.createdAt);
      
      pattern.usageCount += Math.floor(baseUsage * categoryMultiplier * ageMultiplier);
      pattern.successRate = Math.min(100, pattern.successRate + (Math.random() * 2 - 1)); // Small random changes
      pattern.effectiveness = this.calculateEffectiveness(pattern);
      
      // Simulate team adoption
      if (Math.random() < 0.1) {
        const teams = ['backend', 'frontend', 'mobile', 'devops', 'qa'];
        const team = teams[Math.floor(Math.random() * teams.length)];
        if (!pattern.teamAdoption.includes(team)) {
          pattern.teamAdoption.push(team);
        }
      }
    }
  }

  getCategoryUsageMultiplier(category) {
    const multipliers = {
      'backend': 1.5,
      'frontend': 1.3,
      'security': 1.2,
      'performance': 1.1,
      'testing': 1.0,
      'devops': 0.9,
      'general': 0.8
    };
    return multipliers[category] || 1.0;
  }

  getAgeUsageMultiplier(createdAt) {
    const daysSinceCreation = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    
    // Newer patterns get more initial usage, older patterns stabilize
    if (daysSinceCreation < 7) return 1.5; // New pattern bonus
    if (daysSinceCreation < 30) return 1.2;
    if (daysSinceCreation < 90) return 1.0;
    return 0.8; // Older patterns may decline
  }

  calculateEffectiveness(pattern) {
    // Effectiveness based on usage, success rate, and team adoption
    const usageScore = Math.min(100, pattern.usageCount / 10);
    const successScore = pattern.successRate || 70;
    const adoptionScore = (pattern.teamAdoption.length / 5) * 100;
    
    return Math.round((usageScore * 0.4 + successScore * 0.4 + adoptionScore * 0.2));
  }

  updateMetrics() {
    const patterns = Array.from(this.analyticsData.patterns.values());
    
    this.analyticsData.metrics = {
      totalPatterns: patterns.length,
      activePatterns: patterns.filter(p => p.usageCount > 0).length,
      averageUsage: patterns.reduce((sum, p) => sum + p.usageCount, 0) / patterns.length,
      averageEffectiveness: patterns.reduce((sum, p) => sum + p.effectiveness, 0) / patterns.length,
      topCategories: this.calculateTopCategories(patterns),
      adoptionRate: this.calculateAdoptionRate(patterns),
      lastUpdated: new Date().toISOString()
    };
  }

  calculateTopCategories(patterns) {
    const categories = {};
    
    patterns.forEach(pattern => {
      const category = pattern.category;
      if (!categories[category]) {
        categories[category] = { name: category, usage: 0, count: 0 };
      }
      categories[category].usage += pattern.usageCount;
      categories[category].count++;
    });
    
    return Object.values(categories)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
  }

  calculateAdoptionRate(patterns) {
    const totalTeams = 5; // backend, frontend, mobile, devops, qa
    const adoptedPatterns = patterns.filter(p => p.teamAdoption.length > 0);
    
    return Math.round((adoptedPatterns.length / patterns.length) * 100);
  }

  updateTrends() {
    const now = new Date().toISOString();
    const trendPoint = {
      timestamp: now,
      totalUsage: Array.from(this.analyticsData.patterns.values()).reduce((sum, p) => sum + p.usageCount, 0),
      activePatterns: this.analyticsData.metrics.activePatterns,
      averageEffectiveness: this.analyticsData.metrics.averageEffectiveness
    };
    
    this.analyticsData.trends.push(trendPoint);
    
    // Keep last 100 trend points (last ~50 minutes at 30s intervals)
    if (this.analyticsData.trends.length > 100) {
      this.analyticsData.trends = this.analyticsData.trends.slice(-100);
    }
  }

  async watchPatternFiles() {
    try {
      const patternsDir = path.join(this.rootDir, 'docs', 'patterns');
      
      // Simple polling-based file watching (in production, use fs.watch)
      setInterval(async () => {
        await this.checkForPatternChanges();
      }, 60000); // Check every minute
      
    } catch (error) {
      this.log('warn', `Could not setup pattern file watching: ${error.message}`);
    }
  }

  async checkForPatternChanges() {
    try {
      const patternsDir = path.join(this.rootDir, 'docs', 'patterns');
      const files = await fs.readdir(patternsDir);
      const patternFiles = files.filter(file => file.endsWith('-pattern.md'));
      
      for (const file of patternFiles) {
        const patternPath = path.join(patternsDir, file);
        const patternId = file.replace('-pattern.md', '');
        const lastModified = await this.getFileModifiedTime(patternPath);
        
        const existingPattern = this.analyticsData.patterns.get(patternId);
        
        if (!existingPattern) {
          // New pattern detected
          const content = await fs.readFile(patternPath, 'utf-8');
          const pattern = this.parsePatternFile(content, file);
          
          this.analyticsData.patterns.set(patternId, {
            ...pattern,
            createdAt: await this.getFileCreatedTime(patternPath),
            lastModified: lastModified,
            usageCount: 0,
            successRate: 70,
            teamAdoption: [],
            effectiveness: 0
          });
          
          this.log('success', `New pattern detected: ${pattern.name}`);
          this.emit('pattern-added', pattern);
          
        } else if (lastModified > new Date(existingPattern.lastModified)) {
          // Pattern updated
          existingPattern.lastModified = lastModified;
          this.log('info', `Pattern updated: ${existingPattern.name}`);
          this.emit('pattern-updated', existingPattern);
        }
      }
      
    } catch (error) {
      this.log('warn', `Pattern change detection failed: ${error.message}`);
    }
  }

  getAnalyticsSummary() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.analyticsData.metrics,
      patterns: this.getTopPatterns(10),
      trends: this.analyticsData.trends.slice(-20), // Last 20 trend points
      categories: this.analyticsData.metrics.topCategories
    };
  }

  getTopPatterns(limit = 10) {
    return Array.from(this.analyticsData.patterns.values())
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, limit)
      .map(pattern => ({
        id: pattern.id,
        name: pattern.name,
        category: pattern.category,
        usageCount: pattern.usageCount,
        successRate: pattern.successRate,
        effectiveness: pattern.effectiveness,
        teamAdoption: pattern.teamAdoption.length,
        lastUsed: pattern.lastModified
      }));
  }

  async generateAnalyticsReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.analyticsData.metrics,
      patterns: {
        total: this.analyticsData.patterns.size,
        byCategory: this.analyticsData.metrics.topCategories,
        topPerforming: this.getTopPatterns(5),
        underutilized: this.getUnderutilizedPatterns()
      },
      trends: {
        usage: this.analyzeUsageTrends(),
        adoption: this.analyzeAdoptionTrends(),
        effectiveness: this.analyzeEffectivenessTrends()
      },
      recommendations: this.generateRecommendations()
    };
    
    // Save report to file
    const reportPath = path.join(this.rootDir, 'pattern-analytics-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log('success', `Analytics report generated: ${reportPath}`);
    return report;
  }

  getUnderutilizedPatterns() {
    return Array.from(this.analyticsData.patterns.values())
      .filter(pattern => pattern.usageCount < 5 && pattern.teamAdoption.length < 2)
      .sort((a, b) => a.usageCount - b.usageCount)
      .slice(0, 5)
      .map(pattern => ({
        id: pattern.id,
        name: pattern.name,
        category: pattern.category,
        usageCount: pattern.usageCount,
        createdAt: pattern.createdAt
      }));
  }

  analyzeUsageTrends() {
    if (this.analyticsData.trends.length < 2) return { trend: 'insufficient-data', change: 0 };
    
    const recent = this.analyticsData.trends.slice(-10);
    const older = this.analyticsData.trends.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, t) => sum + t.totalUsage, 0) / recent.length;
    const olderAvg = older.reduce((sum, t) => sum + t.totalUsage, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      change: Math.round(change),
      recent: Math.round(recentAvg),
      previous: Math.round(olderAvg)
    };
  }

  analyzeAdoptionTrends() {
    const patterns = Array.from(this.analyticsData.patterns.values());
    const totalPatterns = patterns.length;
    const adoptedPatterns = patterns.filter(p => p.teamAdoption.length > 0).length;
    
    return {
      rate: Math.round((adoptedPatterns / totalPatterns) * 100),
      adopted: adoptedPatterns,
      total: totalPatterns,
      multiTeamPatterns: patterns.filter(p => p.teamAdoption.length >= 2).length
    };
  }

  analyzeEffectivenessTrends() {
    if (this.analyticsData.trends.length < 2) return { trend: 'insufficient-data' };
    
    const recent = this.analyticsData.trends.slice(-5);
    const recentAvg = recent.reduce((sum, t) => sum + t.averageEffectiveness, 0) / recent.length;
    
    return {
      average: Math.round(recentAvg),
      highEffectiveness: Array.from(this.analyticsData.patterns.values()).filter(p => p.effectiveness > 80).length,
      needsImprovement: Array.from(this.analyticsData.patterns.values()).filter(p => p.effectiveness < 50).length
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const patterns = Array.from(this.analyticsData.patterns.values());
    
    // Check for underutilized patterns
    const underutilized = patterns.filter(p => p.usageCount < 3 && (Date.now() - new Date(p.createdAt)) > 30 * 24 * 60 * 60 * 1000);
    if (underutilized.length > 0) {
      recommendations.push({
        type: 'underutilized-patterns',
        priority: 'medium',
        message: `${underutilized.length} patterns created over 30 days ago have low usage. Consider promotion or retirement.`,
        patterns: underutilized.map(p => p.name).slice(0, 3)
      });
    }
    
    // Check for missing categories
    const categories = new Set(patterns.map(p => p.category));
    const recommendedCategories = ['security', 'performance', 'testing'];
    const missingCategories = recommendedCategories.filter(cat => !categories.has(cat));
    
    if (missingCategories.length > 0) {
      recommendations.push({
        type: 'missing-categories',
        priority: 'high',
        message: `Consider creating patterns for missing categories: ${missingCategories.join(', ')}`,
        categories: missingCategories
      });
    }
    
    // Check for single-team patterns
    const singleTeamPatterns = patterns.filter(p => p.teamAdoption.length === 1 && p.usageCount > 10);
    if (singleTeamPatterns.length > 0) {
      recommendations.push({
        type: 'expand-adoption',
        priority: 'medium',
        message: `${singleTeamPatterns.length} high-usage patterns could benefit from broader team adoption`,
        patterns: singleTeamPatterns.slice(0, 3).map(p => p.name)
      });
    }
    
    return recommendations;
  }

  async saveAnalyticsData() {
    try {
      const dataToSave = {
        timestamp: new Date().toISOString(),
        patterns: Object.fromEntries(this.analyticsData.patterns),
        metrics: this.analyticsData.metrics,
        trends: this.analyticsData.trends.slice(-50) // Save last 50 trend points
      };
      
      const analyticsFile = path.join(this.rootDir, 'analytics-data.json');
      await fs.writeFile(analyticsFile, JSON.stringify(dataToSave, null, 2));
      
      this.log('debug', 'Analytics data saved successfully');
    } catch (error) {
      this.log('error', `Failed to save analytics data: ${error.message}`);
    }
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isRunning = false;
    this.saveAnalyticsData();
    this.log('info', 'Pattern Analytics Engine stopped');
  }
}

// CLI interface
async function main() {
  const engine = new PatternAnalyticsEngine();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down Pattern Analytics Engine...');
    engine.stop();
    process.exit(0);
  });
  
  const initialized = await engine.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  // Generate initial report
  const report = await engine.generateAnalyticsReport();
  console.log('\\n📊 Initial Analytics Report Generated');
  console.log(`📋 Total Patterns: ${report.summary.totalPatterns}`);
  console.log(`⚡ Active Patterns: ${report.summary.activePatterns}`);
  console.log(`📈 Average Effectiveness: ${Math.round(report.summary.averageEffectiveness)}%`);
  
  // Keep running for real-time analytics
  console.log('\\n🔄 Real-time analytics engine is running...');
  console.log('Press Ctrl+C to stop');
}

if (require.main === module) {
  main();
}

module.exports = PatternAnalyticsEngine;