/**
 * 🧠 KRINS Pattern Matcher
 * Advanced AI pattern recognition and code analysis
 */

import { createLogger, format, transports } from 'winston';

export class PatternMatcher {
  constructor(config = {}) {
    this.config = {
      max_pattern_length: config.max_pattern_length || 10000,
      min_pattern_score: config.min_pattern_score || 0.6,
      cache_patterns: config.cache_patterns !== false,
      ...config
    };

    this.patternCache = new Map();
    this.languagePatterns = new Map();
    this.stats = {
      patterns_matched: 0,
      cache_hits: 0,
      total_analyses: 0,
      average_analysis_time: 0
    };

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [PatternMatcher] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });

    // Initialize built-in patterns
    this.initializeBuiltInPatterns();
  }

  /**
   * Initialize the pattern matcher
   */
  async initialize() {
    this.logger.info('Initializing Pattern Matcher...');
    
    // Load advanced patterns from knowledge base
    await this.loadAdvancedPatterns();
    
    this.logger.info('Pattern Matcher initialized successfully', {
      builtin_patterns: this.languagePatterns.size,
      total_patterns: Array.from(this.languagePatterns.values()).reduce((sum, patterns) => sum + patterns.length, 0)
    });
  }

  /**
   * Initialize built-in code patterns
   */
  initializeBuiltInPatterns() {
    // TypeScript/JavaScript patterns
    this.languagePatterns.set('typescript', [
      {
        name: 'React Component',
        pattern: /export\s+(default\s+)?function\s+\w+.*\{[\s\S]*return[\s\S]*<.*>[\s\S]*<\/.*>[\s\S]*\}/g,
        type: 'component',
        score: 0.9,
        description: 'React functional component pattern',
        tags: ['react', 'component', 'jsx']
      },
      {
        name: 'API Route Handler',
        pattern: /export\s+(default\s+)?async\s+function\s+(GET|POST|PUT|DELETE|PATCH).*\(.*request.*response.*\)/g,
        type: 'api',
        score: 0.95,
        description: 'Next.js API route handler pattern',
        tags: ['api', 'nextjs', 'handler']
      },
      {
        name: 'Custom Hook',
        pattern: /export\s+(default\s+)?function\s+use\w+.*\{[\s\S]*return[\s\S]*\}/g,
        type: 'hook',
        score: 0.9,
        description: 'React custom hook pattern',
        tags: ['react', 'hook', 'custom']
      },
      {
        name: 'Interface Definition',
        pattern: /export\s+interface\s+\w+\s*\{[\s\S]*\}/g,
        type: 'interface',
        score: 0.8,
        description: 'TypeScript interface definition',
        tags: ['typescript', 'interface', 'type']
      },
      {
        name: 'Async Service Function',
        pattern: /export\s+(default\s+)?async\s+function\s+\w+.*\{[\s\S]*await[\s\S]*\}/g,
        type: 'service',
        score: 0.85,
        description: 'Async service function pattern',
        tags: ['async', 'service', 'function']
      },
      {
        name: 'Error Handler',
        pattern: /(try\s*\{[\s\S]*\}\s*catch\s*\([^)]*\)\s*\{[\s\S]*\}|\.catch\([^)]*\))/g,
        type: 'error-handling',
        score: 0.7,
        description: 'Error handling pattern',
        tags: ['error', 'handling', 'try-catch']
      },
      {
        name: 'State Management',
        pattern: /(useState|useReducer|useContext)\s*\([^)]*\)/g,
        type: 'state',
        score: 0.8,
        description: 'React state management pattern',
        tags: ['react', 'state', 'hooks']
      }
    ]);

    // Python patterns
    this.languagePatterns.set('python', [
      {
        name: 'FastAPI Route',
        pattern: /@app\.(get|post|put|delete|patch)\(.*\)\s*async\s+def\s+\w+/g,
        type: 'api',
        score: 0.95,
        description: 'FastAPI route handler pattern',
        tags: ['fastapi', 'api', 'route']
      },
      {
        name: 'Class Definition',
        pattern: /class\s+\w+.*:\s*[\s\S]*def\s+__init__/g,
        type: 'class',
        score: 0.8,
        description: 'Python class definition pattern',
        tags: ['python', 'class', 'oop']
      },
      {
        name: 'Async Function',
        pattern: /async\s+def\s+\w+.*:[\s\S]*await[\s\S]*/g,
        type: 'async',
        score: 0.85,
        description: 'Python async function pattern',
        tags: ['python', 'async', 'function']
      }
    ]);

    // SQL patterns
    this.languagePatterns.set('sql', [
      {
        name: 'Table Creation',
        pattern: /CREATE\s+TABLE\s+\w+\s*\([\s\S]*\)/gi,
        type: 'ddl',
        score: 0.9,
        description: 'SQL table creation pattern',
        tags: ['sql', 'ddl', 'table']
      },
      {
        name: 'Complex Join Query',
        pattern: /SELECT[\s\S]*FROM[\s\S]+JOIN[\s\S]+ON[\s\S]+/gi,
        type: 'query',
        score: 0.8,
        description: 'SQL complex join query pattern',
        tags: ['sql', 'join', 'query']
      }
    ]);

    this.logger.info('Built-in patterns initialized');
  }

  /**
   * Load advanced patterns from various sources
   */
  async loadAdvancedPatterns() {
    // This would typically load from a database or configuration files
    // For now, we'll add some advanced patterns programmatically

    const advancedPatterns = {
      typescript: [
        {
          name: 'Higher-Order Component',
          pattern: /function\s+with\w+.*\(.*Component.*\).*\{[\s\S]*return[\s\S]*function[\s\S]*\}/g,
          type: 'hoc',
          score: 0.9,
          description: 'React Higher-Order Component pattern',
          tags: ['react', 'hoc', 'pattern']
        },
        {
          name: 'Dependency Injection',
          pattern: /constructor\s*\([^)]*:\s*\w+Service[^)]*\)/g,
          type: 'di',
          score: 0.85,
          description: 'Dependency injection pattern',
          tags: ['di', 'service', 'architecture']
        },
        {
          name: 'Observer Pattern',
          pattern: /(addEventListener|subscribe|on)\s*\([^)]*\)/g,
          type: 'observer',
          score: 0.8,
          description: 'Observer/Event pattern',
          tags: ['observer', 'event', 'pattern']
        }
      ]
    };

    // Merge advanced patterns with existing ones
    for (const [language, patterns] of Object.entries(advancedPatterns)) {
      if (this.languagePatterns.has(language)) {
        this.languagePatterns.get(language).push(...patterns);
      } else {
        this.languagePatterns.set(language, patterns);
      }
    }

    this.logger.info('Advanced patterns loaded');
  }

  /**
   * Find patterns in code
   */
  async findPatterns(code, options = {}) {
    const startTime = Date.now();
    this.stats.total_analyses++;

    try {
      if (!code || typeof code !== 'string') {
        throw new Error('Code must be a non-empty string');
      }

      const {
        language = 'typescript',
        context = '',
        include_scores = true,
        min_score = this.config.min_pattern_score
      } = options;

      // Check cache first
      const cacheKey = `${language}:${this.hashCode(code)}`;
      if (this.config.cache_patterns && this.patternCache.has(cacheKey)) {
        this.stats.cache_hits++;
        return this.patternCache.get(cacheKey);
      }

      this.logger.info('Analyzing code patterns', {
        language,
        code_length: code.length,
        context: context.substring(0, 50)
      });

      const foundPatterns = [];
      const languagePatterns = this.languagePatterns.get(language.toLowerCase()) || [];

      // Analyze each pattern
      for (const pattern of languagePatterns) {
        try {
          const matches = code.match(pattern.pattern) || [];
          
          if (matches.length > 0) {
            const patternResult = {
              name: pattern.name,
              type: pattern.type,
              description: pattern.description,
              tags: pattern.tags,
              matches: matches.length,
              match_examples: matches.slice(0, 3).map(match => match.substring(0, 200)),
              confidence: this.calculatePatternConfidence(pattern, matches, code, context)
            };

            if (include_scores) {
              patternResult.score = Math.round(patternResult.confidence * 10000) / 10000;
            }

            if (patternResult.confidence >= min_score) {
              foundPatterns.push(patternResult);
              this.stats.patterns_matched++;
            }
          }
        } catch (error) {
          this.logger.warn('Pattern matching error', {
            pattern_name: pattern.name,
            error: error.message
          });
        }
      }

      // Sort by confidence
      foundPatterns.sort((a, b) => b.confidence - a.confidence);

      // Analyze code complexity and quality
      const codeMetrics = this.analyzeCodeMetrics(code, language);

      const result = {
        patterns: foundPatterns,
        language,
        code_metrics: codeMetrics,
        analysis_time: Date.now() - startTime,
        total_patterns_found: foundPatterns.length
      };

      // Update average analysis time
      this.stats.average_analysis_time = 
        (this.stats.average_analysis_time * (this.stats.total_analyses - 1) + result.analysis_time) / this.stats.total_analyses;

      // Cache result
      if (this.config.cache_patterns) {
        this.patternCache.set(cacheKey, result);
        
        // Limit cache size
        if (this.patternCache.size > 1000) {
          const firstKey = this.patternCache.keys().next().value;
          this.patternCache.delete(firstKey);
        }
      }

      this.logger.info('Pattern analysis completed', {
        patterns_found: foundPatterns.length,
        analysis_time: `${result.analysis_time}ms`,
        top_pattern: foundPatterns[0]?.name || 'none'
      });

      return result;

    } catch (error) {
      this.logger.error('Pattern analysis failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate pattern confidence score
   */
  calculatePatternConfidence(pattern, matches, code, context) {
    let confidence = pattern.score || 0.5;

    // Adjust based on match frequency
    const matchRatio = matches.length / Math.max(1, code.split('\n').length / 10);
    confidence *= Math.min(1.2, 0.8 + (matchRatio * 0.4));

    // Adjust based on context relevance
    if (context) {
      const contextBonus = this.calculateContextRelevance(pattern, context);
      confidence *= (1 + contextBonus * 0.1);
    }

    // Quality adjustments
    const avgMatchLength = matches.reduce((sum, match) => sum + match.length, 0) / matches.length;
    if (avgMatchLength > 100) confidence *= 1.1; // Longer, more detailed matches
    if (avgMatchLength < 20) confidence *= 0.9;  // Very short matches might be false positives

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Calculate context relevance
   */
  calculateContextRelevance(pattern, context) {
    const contextWords = context.toLowerCase().split(/\s+/);
    const patternTags = pattern.tags.map(tag => tag.toLowerCase());
    
    let relevanceScore = 0;
    for (const word of contextWords) {
      for (const tag of patternTags) {
        if (word.includes(tag) || tag.includes(word)) {
          relevanceScore += 0.1;
        }
      }
    }

    return Math.min(1.0, relevanceScore);
  }

  /**
   * Analyze code metrics
   */
  analyzeCodeMetrics(code, language) {
    const lines = code.split('\n');
    
    return {
      total_lines: lines.length,
      non_empty_lines: lines.filter(line => line.trim().length > 0).length,
      comment_lines: this.countCommentLines(lines, language),
      complexity_score: this.calculateComplexity(code, language),
      estimated_functions: (code.match(/function\s+\w+|def\s+\w+|=>\s*{/g) || []).length,
      estimated_classes: (code.match(/class\s+\w+/g) || []).length,
      import_statements: (code.match(/import\s+.*from|from\s+.*import/g) || []).length
    };
  }

  /**
   * Count comment lines
   */
  countCommentLines(lines, language) {
    const commentPatterns = {
      typescript: [/^\s*\/\//, /^\s*\/\*/, /^\s*\*/],
      javascript: [/^\s*\/\//, /^\s*\/\*/, /^\s*\*/],
      python: [/^\s*#/, /^\s*"""/, /^\s*'''/],
      sql: [/^\s*--/, /^\s*\/\*/]
    };

    const patterns = commentPatterns[language.toLowerCase()] || commentPatterns.typescript;
    
    return lines.filter(line => {
      const trimmed = line.trim();
      return patterns.some(pattern => pattern.test(trimmed));
    }).length;
  }

  /**
   * Calculate code complexity (simplified)
   */
  calculateComplexity(code, language) {
    const complexityPatterns = [
      /if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g,
      /&&|\|\|/g,
      /\?\s*.*:/g // ternary operators
    ];

    let complexity = 1; // base complexity
    
    for (const pattern of complexityPatterns) {
      const matches = code.match(pattern) || [];
      complexity += matches.length;
    }

    return Math.min(100, complexity); // Cap at 100
  }

  /**
   * Enrich search results with pattern matching
   */
  async enrichResults(searchResults, query) {
    const enrichedResults = [];

    for (const result of searchResults) {
      try {
        // Try to detect language from content
        const language = this.detectLanguage(result.content);
        
        if (language) {
          // Find patterns in the content
          const patternAnalysis = await this.findPatterns(result.content, {
            language,
            context: query,
            include_scores: true
          });

          enrichedResults.push({
            ...result,
            pattern_analysis: {
              detected_language: language,
              patterns_found: patternAnalysis.patterns,
              code_metrics: patternAnalysis.code_metrics,
              pattern_score: patternAnalysis.patterns[0]?.score || 0
            }
          });
        } else {
          enrichedResults.push(result);
        }
      } catch (error) {
        this.logger.warn('Failed to enrich result with patterns', {
          result_id: result.id,
          error: error.message
        });
        enrichedResults.push(result);
      }
    }

    return enrichedResults;
  }

  /**
   * Detect programming language from content
   */
  detectLanguage(content) {
    const indicators = {
      typescript: [/import.*from/, /export.*interface/, /:\s*\w+\s*=/, /React\./],
      javascript: [/function\s*\(/, /var\s+\w+/, /console\.log/, /jQuery|$/],
      python: [/def\s+\w+/, /import\s+\w+/, /if\s+__name__/, /print\(/],
      sql: [/SELECT.*FROM/, /CREATE\s+TABLE/, /INSERT\s+INTO/, /UPDATE.*SET/],
      java: [/public\s+class/, /public\s+static\s+void\s+main/, /System\.out/],
      csharp: [/using\s+System/, /public\s+class/, /Console\.WriteLine/]
    };

    for (const [language, patterns] of Object.entries(indicators)) {
      const matches = patterns.reduce((count, pattern) => {
        return count + (content.match(pattern) || []).length;
      }, 0);
      
      if (matches >= 2) {
        return language;
      }
    }

    return null;
  }

  /**
   * Generate hash for code caching
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get pattern matcher statistics
   */
  async getStats() {
    return {
      ...this.stats,
      cache_size: this.patternCache.size,
      supported_languages: Array.from(this.languagePatterns.keys()),
      total_builtin_patterns: Array.from(this.languagePatterns.values())
        .reduce((sum, patterns) => sum + patterns.length, 0)
    };
  }

  /**
   * Clear pattern cache
   */
  clearCache() {
    this.patternCache.clear();
    this.logger.info('Pattern cache cleared');
  }
}