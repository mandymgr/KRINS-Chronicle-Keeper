#!/usr/bin/env bun

/**
 * Pattern-AI Coordinator for Dev Memory OS
 * Integrates established patterns with AI team coordination system
 */

const fs = require('fs');
const path = require('path');

class PatternAICoordinator {
  constructor() {
    this.rootDir = process.cwd();
    this.patternsDir = path.join(this.rootDir, 'docs', 'patterns');
    this.mcpServerUrl = 'http://localhost:3006';
    this.patterns = new Map();
  }

  log(level, message) {
    const prefix = {
      'error': '❌',
      'warn': '⚠️ ',
      'info': '✅',
      'success': '🎉',
      'debug': '🔍'
    }[level] || '📋';
    
    console.log(`${prefix} ${message}`);
  }

  async loadPatterns() {
    this.log('debug', 'Loading existing patterns from docs/patterns/');
    
    if (!fs.existsSync(this.patternsDir)) {
      this.log('warn', 'Patterns directory not found');
      return;
    }
    
    const patternFiles = fs.readdirSync(this.patternsDir)
      .filter(file => file.endsWith('-pattern.md') && file !== 'TEMPLATE-pattern.md');
    
    for (const file of patternFiles) {
      try {
        const content = fs.readFileSync(path.join(this.patternsDir, file), 'utf-8');
        const pattern = this.parsePattern(content, file);
        this.patterns.set(pattern.id, pattern);
      } catch (error) {
        this.log('warn', `Could not parse pattern ${file}: ${error.message}`);
      }
    }
    
    this.log('info', `Loaded ${this.patterns.size} patterns`);
  }

  parsePattern(content, filename) {
    const lines = content.split('\n');
    const pattern = {
      id: filename.replace('-pattern.md', ''),
      filename: filename,
      name: '',
      whenToUse: '',
      whenNotToUse: '',
      context: '',
      steps: [],
      languages: [],
      useCases: [],
      relatedPatterns: []
    };
    
    // Parse pattern name from first line
    const titleMatch = lines[0].match(/# Pattern: (.+)/);
    if (titleMatch) {
      pattern.name = titleMatch[1].trim();
    }
    
    // Parse when to use/not use from second line
    const usageMatch = lines[1] ? lines[1].match(/\*\*Når bruke:\*\* ([^•]+)•\s*\*\*Ikke bruk når:\*\* ([^•]+)•\s*\*\*Kontekst:\*\* (.+)/) : null;
    if (usageMatch) {
      pattern.whenToUse = usageMatch[1].trim();
      pattern.whenNotToUse = usageMatch[2].trim();
      pattern.context = usageMatch[3].trim();
    }
    
    // Parse steps
    let inStepsSection = false;
    for (const line of lines) {
      if (line.includes('## Steg-for-steg')) {
        inStepsSection = true;
        continue;
      }
      if (inStepsSection && line.startsWith('##')) {
        inStepsSection = false;
        continue;
      }
      if (inStepsSection && line.match(/^\d+\)/)) {
        pattern.steps.push(line.replace(/^\d+\)\s*/, '').trim());
      }
    }
    
    // Detect supported languages from code blocks
    const codeBlocks = content.match(/```(\w+)/g) || [];
    pattern.languages = [...new Set(codeBlocks.map(block => block.replace('```', '')))];
    
    return pattern;
  }

  async createPatternTaskMapping() {
    const taskMappings = {
      // Backend patterns -> Backend Specialist
      backend: [
        'api-rate-limiting',
        'database-connection-pool',
        'authentication-service',
        'caching-strategy',
        'message-queue',
        'circuit-breaker',
        'microservice-communication',
        'data-validation'
      ],
      
      // Frontend patterns -> Frontend Specialist  
      frontend: [
        'component-composition',
        'state-management',
        'error-boundary',
        'lazy-loading',
        'responsive-design',
        'ui-component-library',
        'form-validation',
        'accessibility'
      ],
      
      // Testing patterns -> Testing Specialist
      testing: [
        'integration-testing',
        'unit-testing',
        'e2e-testing',
        'test-data-management',
        'mocking-strategy',
        'performance-testing',
        'security-testing',
        'test-automation'
      ],
      
      // Performance patterns -> Performance Specialist
      performance: [
        'caching-strategy',
        'lazy-loading', 
        'code-splitting',
        'image-optimization',
        'database-optimization',
        'api-optimization',
        'memory-management',
        'load-balancing'
      ],
      
      // Security patterns -> Security Specialist
      security: [
        'authentication-service',
        'authorization',
        'input-validation',
        'secure-communication',
        'secret-management',
        'audit-logging',
        'encryption',
        'security-headers'
      ]
    };
    
    return taskMappings;
  }

  async generateAITeamTasks(patterns) {
    this.log('debug', 'Generating AI team tasks based on patterns...');
    
    const taskMappings = await this.createPatternTaskMapping();
    const aiTasks = [];
    
    for (const [patternId, pattern] of patterns) {
      // Determine which specialists should handle this pattern
      const assignedSpecialists = [];
      
      for (const [specialist, patternIds] of Object.entries(taskMappings)) {
        if (patternIds.some(id => patternId.includes(id))) {
          assignedSpecialists.push(specialist);
        }
      }
      
      // If no specific mapping, assign based on context or languages
      if (assignedSpecialists.length === 0) {
        if (pattern.languages.includes('ts') || pattern.languages.includes('js')) {
          assignedSpecialists.push('frontend', 'backend');
        } else if (pattern.languages.includes('py')) {
          assignedSpecialists.push('backend');
        } else {
          assignedSpecialists.push('backend'); // Default to backend
        }
      }
      
      // Create task for each specialist
      for (const specialist of assignedSpecialists) {
        aiTasks.push({
          id: `${patternId}-${specialist}-implementation`,
          patternId: patternId,
          patternName: pattern.name,
          specialist: specialist,
          priority: this.calculatePriority(pattern),
          estimatedComplexity: this.estimateComplexity(pattern),
          taskDescription: `Implement ${pattern.name} pattern using ${specialist} expertise`,
          steps: pattern.steps,
          requirements: {
            whenToUse: pattern.whenToUse,
            context: pattern.context,
            languages: pattern.languages,
            relatedPatterns: pattern.relatedPatterns
          },
          deliverables: this.generateDeliverables(pattern, specialist)
        });
      }
    }
    
    this.log('info', `Generated ${aiTasks.length} AI team tasks from ${patterns.size} patterns`);
    return aiTasks;
  }

  calculatePriority(pattern) {
    let score = 5; // Default medium priority
    
    // High priority patterns
    const highPriorityKeywords = ['security', 'authentication', 'error', 'validation', 'testing'];
    if (highPriorityKeywords.some(keyword => pattern.name.toLowerCase().includes(keyword))) {
      score += 3;
    }
    
    // Context-based priority
    if (pattern.context.includes('@cloud')) score += 2;
    if (pattern.context.includes('@PII')) score += 4;
    
    // Steps complexity
    if (pattern.steps.length > 5) score += 1;
    if (pattern.languages.length > 2) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  estimateComplexity(pattern) {
    let complexity = 'medium';
    
    const highComplexityKeywords = ['authentication', 'security', 'performance', 'distributed', 'microservice'];
    const lowComplexityKeywords = ['component', 'ui', 'styling', 'formatting'];
    
    const patternText = pattern.name.toLowerCase();
    
    if (highComplexityKeywords.some(keyword => patternText.includes(keyword))) {
      complexity = 'high';
    } else if (lowComplexityKeywords.some(keyword => patternText.includes(keyword))) {
      complexity = 'low';
    }
    
    // Adjust based on steps count
    if (pattern.steps.length > 7) complexity = 'high';
    if (pattern.steps.length < 3) complexity = 'low';
    
    return complexity;
  }

  generateDeliverables(pattern, specialist) {
    const baseDeliverables = [
      `Implement ${pattern.name} according to pattern specification`,
      `Create comprehensive tests for ${pattern.name}`,
      `Add documentation and usage examples`,
      `Ensure compliance with established patterns`
    ];
    
    const specialistDeliverables = {
      backend: [
        'API endpoints and business logic',
        'Database schema and migrations',
        'Error handling and logging',
        'Performance optimization'
      ],
      frontend: [
        'React components and hooks', 
        'State management integration',
        'UI/UX implementation',
        'Responsive design and accessibility'
      ],
      testing: [
        'Unit test suites',
        'Integration test scenarios', 
        'End-to-end test cases',
        'Test coverage reports'
      ],
      performance: [
        'Performance benchmarks',
        'Optimization implementations',
        'Monitoring and metrics',
        'Load testing scenarios'
      ],
      security: [
        'Security implementation',
        'Threat modeling',
        'Security testing',
        'Compliance validation'
      ]
    };
    
    return [...baseDeliverables, ...(specialistDeliverables[specialist] || [])];
  }

  async sendTasksToMCPServer(tasks) {
    this.log('debug', 'Sending pattern-based tasks to MCP AI Team Server...');
    
    try {
      // Group tasks by specialist
      const tasksBySpecialist = {};
      for (const task of tasks) {
        if (!tasksBySpecialist[task.specialist]) {
          tasksBySpecialist[task.specialist] = [];
        }
        tasksBySpecialist[task.specialist].push(task);
      }
      
      // Send tasks to each specialist
      for (const [specialist, specialistTasks] of Object.entries(tasksBySpecialist)) {
        const payload = {
          type: 'pattern_tasks_assignment',
          specialist: specialist,
          tasks: specialistTasks,
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'pattern-ai-coordinator',
            total_patterns: this.patterns.size,
            coordinator_version: '1.0.0'
          }
        };
        
        // In a real implementation, we'd use fetch to send to MCP server
        // For now, we'll save to a file that MCP server can pick up
        const outputFile = path.join(this.rootDir, `pattern-tasks-${specialist}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
        
        this.log('success', `Generated ${specialistTasks.length} pattern-based tasks for ${specialist} specialist`);
      }
      
      return true;
    } catch (error) {
      this.log('error', `Failed to send tasks to MCP server: ${error.message}`);
      return false;
    }
  }

  async generateCoordinationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPatterns: this.patterns.size,
        patternCategories: this.categorizePatterns(),
        specialistWorkload: this.calculateSpecialistWorkload()
      },
      patternAnalysis: this.analyzePatterns(),
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(this.rootDir, 'pattern-coordination-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('success', `Pattern coordination report generated: ${reportPath}`);
    return report;
  }

  categorizePatterns() {
    const categories = {};
    
    for (const [id, pattern] of this.patterns) {
      const category = this.inferCategory(pattern);
      if (!categories[category]) categories[category] = 0;
      categories[category]++;
    }
    
    return categories;
  }

  inferCategory(pattern) {
    const name = pattern.name.toLowerCase();
    
    if (name.includes('api') || name.includes('service') || name.includes('backend')) return 'backend';
    if (name.includes('ui') || name.includes('component') || name.includes('frontend')) return 'frontend';
    if (name.includes('test') || name.includes('validation')) return 'testing';
    if (name.includes('security') || name.includes('auth')) return 'security';
    if (name.includes('performance') || name.includes('cache')) return 'performance';
    
    return 'general';
  }

  calculateSpecialistWorkload() {
    // This would calculate estimated workload per specialist
    return {
      backend: Math.floor(Math.random() * 20) + 10,
      frontend: Math.floor(Math.random() * 15) + 8,
      testing: Math.floor(Math.random() * 12) + 5,
      performance: Math.floor(Math.random() * 10) + 3,
      security: Math.floor(Math.random() * 8) + 2
    };
  }

  analyzePatterns() {
    const analysis = [];
    
    for (const [id, pattern] of this.patterns) {
      analysis.push({
        id: id,
        name: pattern.name,
        complexity: this.estimateComplexity(pattern),
        priority: this.calculatePriority(pattern),
        languages: pattern.languages,
        stepsCount: pattern.steps.length,
        category: this.inferCategory(pattern)
      });
    }
    
    return analysis.sort((a, b) => b.priority - a.priority);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Pattern coverage recommendations
    const categories = this.categorizePatterns();
    if (categories.security < 2) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'Consider adding more security patterns to improve system security coverage'
      });
    }
    
    if (categories.testing < 3) {
      recommendations.push({
        type: 'quality',
        priority: 'medium', 
        message: 'Add more testing patterns to improve code quality and reliability'
      });
    }
    
    // AI team coordination recommendations
    recommendations.push({
      type: 'coordination',
      priority: 'medium',
      message: 'Implement pattern-driven task delegation for improved AI team efficiency'
    });
    
    return recommendations;
  }

  async displaySummary(tasks, report) {
    console.log('\\n' + '='.repeat(70));
    console.log('🤖 PATTERN-AI COORDINATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`📊 Patterns Analyzed: ${this.patterns.size}`);
    console.log(`🎯 AI Tasks Generated: ${tasks.length}`);
    
    const tasksBySpecialist = {};
    for (const task of tasks) {
      tasksBySpecialist[task.specialist] = (tasksBySpecialist[task.specialist] || 0) + 1;
    }
    
    console.log('\\n👥 Task Distribution:');
    for (const [specialist, count] of Object.entries(tasksBySpecialist)) {
      console.log(`  • ${specialist}: ${count} tasks`);
    }
    
    console.log('\\n📋 Top Priority Patterns:');
    const topPatterns = report.patternAnalysis.slice(0, 5);
    for (const pattern of topPatterns) {
      console.log(`  • ${pattern.name} (Priority: ${pattern.priority}, Complexity: ${pattern.complexity})`);
    }
    
    console.log('\\n💡 Recommendations:');
    for (const rec of report.recommendations) {
      console.log(`  • [${rec.priority.toUpperCase()}] ${rec.message}`);
    }
    
    console.log('\\n🚀 Next Steps:');
    console.log('  1. Review generated pattern tasks for each AI specialist');
    console.log('  2. Integrate pattern-based task delegation with MCP server');
    console.log('  3. Monitor pattern implementation progress');
    console.log('  4. Update patterns based on AI team feedback');
    console.log('='.repeat(70));
  }
}

// CLI interface
async function main() {
  try {
    const coordinator = new PatternAICoordinator();
    
    console.log('🚀 Starting Pattern-AI Coordination System...\\n');
    
    // Load existing patterns
    await coordinator.loadPatterns();
    
    // Generate AI team tasks based on patterns
    const tasks = await coordinator.generateAITeamTasks(coordinator.patterns);
    
    // Send tasks to MCP server (or save for pickup)
    await coordinator.sendTasksToMCPServer(tasks);
    
    // Generate coordination report
    const report = await coordinator.generateCoordinationReport();
    
    // Display summary
    await coordinator.displaySummary(tasks, report);
    
  } catch (error) {
    console.error('❌ Pattern-AI coordination failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PatternAICoordinator;