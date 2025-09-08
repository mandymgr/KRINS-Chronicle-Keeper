/**
 * 🔍 KRINS Pattern Analyzer
 * Revolutionary system that analyzes GitHub code changes to discover reusable patterns
 */

import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';

export class PatternAnalyzer {
  constructor(config = {}) {
    this.config = {
      semanticSearchServer: config.semanticSearchServer || 'http://localhost:3003',
      patternThreshold: config.patternThreshold || 0.7,
      minPatternSize: config.minPatternSize || 10, // minimum lines
      maxPatternSize: config.maxPatternSize || 200, // maximum lines
      supportedLanguages: config.supportedLanguages || [
        'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php'
      ],
      ...config
    };

    // Pattern analysis statistics
    this.stats = {
      files_analyzed: 0,
      patterns_discovered: 0,
      patterns_stored: 0,
      analysis_time_total: 0,
      average_analysis_time: 0,
      languages_processed: new Set()
    };

    // Pattern templates and recognizers
    this.patternRecognizers = {
      'api-endpoint': {
        keywords: ['route', 'endpoint', 'get', 'post', 'put', 'delete', 'api'],
        patterns: [
          /app\.(get|post|put|delete|patch)\s*\(/,
          /router\.(get|post|put|delete|patch)\s*\(/,
          /@(Get|Post|Put|Delete|Patch|RequestMapping)/,
          /def\s+\w+\s*\([^)]*\)\s*->\s*(Response|dict)/
        ]
      },
      'database-model': {
        keywords: ['model', 'schema', 'table', 'entity', 'orm'],
        patterns: [
          /class\s+\w+\s*\([^)]*Model[^)]*\)/,
          /class\s+\w+\s*\([^)]*Entity[^)]*\)/,
          /@Entity/,
          /const\s+\w+Schema\s*=/,
          /mongoose\.Schema/
        ]
      },
      'auth-middleware': {
        keywords: ['auth', 'authenticate', 'authorize', 'middleware', 'guard'],
        patterns: [
          /function\s+auth\w*/,
          /const\s+auth\w*\s*=/,
          /@UseGuards\(/,
          /def\s+auth\w*\s*\(/,
          /middleware.*auth/i
        ]
      },
      'validation-schema': {
        keywords: ['validation', 'validator', 'schema', 'validate'],
        patterns: [
          /Joi\./,
          /yup\./,
          /z\./,
          /@IsString|@IsNumber|@IsEmail/,
          /ValidationSchema/,
          /validate\w*Schema/
        ]
      },
      'error-handler': {
        keywords: ['error', 'exception', 'catch', 'handler'],
        patterns: [
          /catch\s*\([^)]*\)/,
          /except\s+\w+:/,
          /try\s*{[\s\S]*catch/,
          /@ExceptionHandler/,
          /ErrorHandler/,
          /handleError/
        ]
      },
      'config-pattern': {
        keywords: ['config', 'configuration', 'settings', 'env'],
        patterns: [
          /process\.env\./,
          /config\./,
          /settings\./,
          /Configuration/,
          /ConfigService/
        ]
      },
      'service-pattern': {
        keywords: ['service', 'repository', 'dao', 'provider'],
        patterns: [
          /class\s+\w+Service/,
          /class\s+\w+Repository/,
          /@Service/,
          /@Repository/,
          /@Injectable/
        ]
      },
      'component-pattern': {
        keywords: ['component', 'react', 'vue', 'angular'],
        patterns: [
          /function\s+\w+\([^)]*\)\s*{[\s\S]*return\s*</,
          /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*</,
          /@Component/,
          /React\.Component/,
          /Vue\.extend/
        ]
      }
    };

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [PatternAnalyzer] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });
  }

  /**
   * Analyze GitHub event for code patterns
   */
  async analyzeEvent(eventType, payload) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting pattern analysis', {
        event_type: eventType
      });

      const analysisResult = {
        patterns_discovered: [],
        files_analyzed: 0,
        analysis_time: 0,
        success: true,
        recommendations: []
      };

      let filesToAnalyze = [];

      // Extract files based on event type
      switch (eventType) {
        case 'pull_request':
          filesToAnalyze = await this.extractFilesFromPR(payload);
          break;
        
        case 'push':
          filesToAnalyze = await this.extractFilesFromPush(payload);
          break;
        
        default:
          this.logger.debug('Event type not suitable for pattern analysis', {
            event_type: eventType
          });
          return analysisResult;
      }

      // Filter files by supported languages
      const supportedFiles = filesToAnalyze.filter(file => 
        this.isSupportedLanguage(file.filename)
      );

      if (supportedFiles.length === 0) {
        this.logger.info('No supported files found for pattern analysis');
        return analysisResult;
      }

      // Analyze each file for patterns
      for (const file of supportedFiles) {
        try {
          const filePatterns = await this.analyzeFile(file);
          analysisResult.patterns_discovered.push(...filePatterns);
          analysisResult.files_analyzed++;
          
          // Update language stats
          const language = this.detectLanguage(file.filename);
          this.stats.languages_processed.add(language);
          
        } catch (error) {
          this.logger.error('Failed to analyze file', {
            filename: file.filename,
            error: error.message
          });
        }
      }

      // Generate recommendations
      analysisResult.recommendations = this.generateRecommendations(
        analysisResult.patterns_discovered
      );

      // Update statistics
      const analysisTime = Date.now() - startTime;
      this.updateStats(analysisResult.files_analyzed, analysisResult.patterns_discovered.length, analysisTime);

      analysisResult.analysis_time = analysisTime;

      this.logger.info('Pattern analysis completed', {
        files_analyzed: analysisResult.files_analyzed,
        patterns_found: analysisResult.patterns_discovered.length,
        analysis_time: `${analysisTime}ms`
      });

      return analysisResult;

    } catch (error) {
      this.logger.error('Pattern analysis failed', {
        event_type: eventType,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Extract files from pull request payload
   */
  async extractFilesFromPR(payload) {
    const files = [];
    
    if (payload.files) {
      // Files are directly available in payload
      return payload.files.map(file => ({
        filename: file.filename,
        content: file.patch || '',
        status: file.status,
        additions: file.additions || 0,
        deletions: file.deletions || 0,
        changes: file.changes || 0
      }));
    }

    // If files not in payload, we'd need to fetch them from GitHub API
    // For now, return empty array as we don't have the content
    this.logger.warn('No file content available in PR payload');
    return files;
  }

  /**
   * Extract files from push payload
   */
  async extractFilesFromPush(payload) {
    const files = [];
    
    if (payload.commits) {
      // Extract modified files from commits
      for (const commit of payload.commits) {
        if (commit.added) {
          files.push(...commit.added.map(filename => ({
            filename,
            status: 'added',
            content: '', // Would need to fetch from API
            commit_sha: commit.id
          })));
        }
        
        if (commit.modified) {
          files.push(...commit.modified.map(filename => ({
            filename,
            status: 'modified', 
            content: '', // Would need to fetch from API
            commit_sha: commit.id
          })));
        }
      }
    }

    return files;
  }

  /**
   * Analyze individual file for patterns
   */
  async analyzeFile(file) {
    const patterns = [];
    const language = this.detectLanguage(file.filename);
    
    if (!file.content || file.content.length === 0) {
      this.logger.debug('Skipping file with no content', { filename: file.filename });
      return patterns;
    }

    // Extract code content from diff if it's a patch
    const codeContent = this.extractCodeFromPatch(file.content, file.status);
    
    if (codeContent.length < this.config.minPatternSize) {
      return patterns;
    }

    // Apply pattern recognizers
    for (const [patternType, recognizer] of Object.entries(this.patternRecognizers)) {
      const matches = this.findPatternMatches(codeContent, recognizer, patternType);
      
      for (const match of matches) {
        const pattern = {
          id: uuidv4(),
          type: patternType,
          name: this.generatePatternName(match, patternType),
          language: language,
          code: match.code,
          description: this.generatePatternDescription(match, patternType),
          file_origin: {
            filename: file.filename,
            line_start: match.line_start,
            line_end: match.line_end,
            file_status: file.status
          },
          metadata: {
            confidence: match.confidence,
            complexity: this.calculateComplexity(match.code),
            reusability_score: this.calculateReusability(match, patternType),
            tags: this.generateTags(match, patternType, language)
          },
          discovered_at: new Date().toISOString()
        };

        patterns.push(pattern);
      }
    }

    this.logger.debug('Patterns found in file', {
      filename: file.filename,
      patterns_found: patterns.length
    });

    return patterns;
  }

  /**
   * Extract actual code content from git patch/diff
   */
  extractCodeFromPatch(content, status) {
    if (status === 'added' || !content.includes('@@')) {
      return content;
    }

    // Extract added lines from diff
    const lines = content.split('\n');
    const codeLines = [];

    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        codeLines.push(line.substring(1)); // Remove + prefix
      } else if (!line.startsWith('-') && !line.startsWith('@@') && !line.startsWith('+++') && !line.startsWith('---')) {
        codeLines.push(line); // Context line
      }
    }

    return codeLines.join('\n');
  }

  /**
   * Find pattern matches using recognizer
   */
  findPatternMatches(code, recognizer, patternType) {
    const matches = [];
    const lines = code.split('\n');
    
    // Check for regex patterns
    for (const regex of recognizer.patterns) {
      const regexMatches = [...code.matchAll(new RegExp(regex.source, 'gm'))];
      
      for (const match of regexMatches) {
        const matchIndex = match.index;
        const lineNumber = code.substring(0, matchIndex).split('\n').length;
        
        // Extract surrounding context
        const startLine = Math.max(0, lineNumber - 5);
        const endLine = Math.min(lines.length - 1, lineNumber + 10);
        const contextCode = lines.slice(startLine, endLine + 1).join('\n');

        if (contextCode.length >= this.config.minPatternSize &&
            contextCode.length <= this.config.maxPatternSize) {
          
          matches.push({
            code: contextCode,
            line_start: startLine + 1,
            line_end: endLine + 1,
            confidence: this.calculateConfidence(contextCode, recognizer),
            match_type: 'regex'
          });
        }
      }
    }

    // Check for keyword density
    if (matches.length === 0) {
      const keywordMatches = this.findKeywordPatterns(code, recognizer, patternType);
      matches.push(...keywordMatches);
    }

    return matches;
  }

  /**
   * Find patterns based on keyword density
   */
  findKeywordPatterns(code, recognizer, patternType) {
    const matches = [];
    const lines = code.split('\n');
    const windowSize = 20; // lines to analyze at once

    for (let i = 0; i < lines.length - windowSize; i += 10) {
      const window = lines.slice(i, i + windowSize);
      const windowCode = window.join('\n');
      
      const keywordCount = recognizer.keywords.filter(keyword =>
        windowCode.toLowerCase().includes(keyword.toLowerCase())
      ).length;

      const keywordDensity = keywordCount / recognizer.keywords.length;
      
      if (keywordDensity >= 0.3 && windowCode.length >= this.config.minPatternSize) {
        matches.push({
          code: windowCode,
          line_start: i + 1,
          line_end: i + windowSize,
          confidence: keywordDensity,
          match_type: 'keyword'
        });
      }
    }

    return matches;
  }

  /**
   * Calculate pattern confidence score
   */
  calculateConfidence(code, recognizer) {
    let confidence = 0;
    
    // Regex match confidence
    const regexMatches = recognizer.patterns.filter(pattern => 
      pattern.test(code)
    ).length;
    confidence += (regexMatches / recognizer.patterns.length) * 0.7;

    // Keyword confidence
    const keywordMatches = recognizer.keywords.filter(keyword =>
      code.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    confidence += (keywordMatches / recognizer.keywords.length) * 0.3;

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate code complexity score
   */
  calculateComplexity(code) {
    let complexity = 1;
    
    // Cyclomatic complexity indicators
    const complexityIndicators = [
      /if\s*\(/g, /else/g, /while\s*\(/g, /for\s*\(/g,
      /switch\s*\(/g, /case\s+/g, /catch\s*\(/g,
      /&&/g, /\|\|/g, /\?.*:/g
    ];

    for (const indicator of complexityIndicators) {
      const matches = code.match(indicator);
      if (matches) {
        complexity += matches.length;
      }
    }

    return Math.min(complexity, 20); // Cap at 20
  }

  /**
   * Calculate reusability score
   */
  calculateReusability(match, patternType) {
    let score = 0;

    // Base score by pattern type
    const baseScores = {
      'api-endpoint': 0.8,
      'database-model': 0.7,
      'auth-middleware': 0.9,
      'validation-schema': 0.8,
      'error-handler': 0.9,
      'config-pattern': 0.6,
      'service-pattern': 0.8,
      'component-pattern': 0.7
    };

    score = baseScores[patternType] || 0.5;

    // Adjust based on code characteristics
    if (match.code.includes('export') || match.code.includes('module.exports')) {
      score += 0.1; // Exportable
    }

    if (match.code.includes('interface') || match.code.includes('type')) {
      score += 0.1; // Has type definitions
    }

    if (match.code.match(/\/\*\*[\s\S]*\*\//)) {
      score += 0.05; // Has documentation
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate pattern tags
   */
  generateTags(match, patternType, language) {
    const tags = [patternType, language];
    
    // Add framework-specific tags
    const frameworkKeywords = {
      'react': ['react', 'jsx', 'component', 'hook'],
      'express': ['express', 'app.', 'router.'],
      'nestjs': ['@Injectable', '@Controller', '@Get', '@Post'],
      'django': ['django', 'models.Model', 'def get', 'def post'],
      'spring': ['@Component', '@Service', '@Repository', '@RestController']
    };

    for (const [framework, keywords] of Object.entries(frameworkKeywords)) {
      if (keywords.some(keyword => match.code.includes(keyword))) {
        tags.push(framework);
      }
    }

    // Add complexity tags
    const complexity = this.calculateComplexity(match.code);
    if (complexity <= 3) tags.push('simple');
    else if (complexity <= 7) tags.push('moderate');
    else tags.push('complex');

    return tags;
  }

  /**
   * Generate pattern name
   */
  generatePatternName(match, patternType) {
    // Extract function/class/variable names from code
    const namePatterns = [
      /(?:function|const|let|var)\s+(\w+)/,
      /class\s+(\w+)/,
      /(\w+)\s*[:=]\s*function/,
      /def\s+(\w+)/,
      /public\s+\w+\s+(\w+)/
    ];

    for (const pattern of namePatterns) {
      const match_result = match.code.match(pattern);
      if (match_result) {
        return `${match_result[1]} ${patternType.replace('-', ' ')} Pattern`;
      }
    }

    // Generate generic name
    const typeNames = {
      'api-endpoint': 'API Endpoint',
      'database-model': 'Database Model',
      'auth-middleware': 'Authentication Middleware',
      'validation-schema': 'Validation Schema',
      'error-handler': 'Error Handler',
      'config-pattern': 'Configuration',
      'service-pattern': 'Service Class',
      'component-pattern': 'UI Component'
    };

    return typeNames[patternType] || 'Code Pattern';
  }

  /**
   * Generate pattern description
   */
  generatePatternDescription(match, patternType) {
    const descriptions = {
      'api-endpoint': 'Reusable API endpoint implementation with request handling and response formatting',
      'database-model': 'Database model structure with schema definition and relationships',
      'auth-middleware': 'Authentication and authorization middleware for request validation',
      'validation-schema': 'Input validation schema for data integrity and security',
      'error-handler': 'Centralized error handling pattern for consistent error responses',
      'config-pattern': 'Configuration management pattern for environment variables and settings',
      'service-pattern': 'Business logic service class with dependency injection',
      'component-pattern': 'Reusable UI component with props and state management'
    };

    let description = descriptions[patternType] || 'Reusable code pattern';
    
    // Add context-specific details
    if (match.match_type === 'regex') {
      description += ' (detected via code structure analysis)';
    } else {
      description += ' (detected via semantic analysis)';
    }

    return description;
  }

  /**
   * Generate recommendations based on discovered patterns
   */
  generateRecommendations(patterns) {
    const recommendations = [];
    
    if (patterns.length === 0) {
      return [{
        type: 'info',
        title: 'No Patterns Detected',
        description: 'No significant code patterns were found in this change set.',
        priority: 'low'
      }];
    }

    // Pattern reusability recommendations
    const highReusabilityPatterns = patterns.filter(p => p.metadata.reusability_score > 0.8);
    if (highReusabilityPatterns.length > 0) {
      recommendations.push({
        type: 'optimization',
        title: 'High Reusability Patterns Found',
        description: `Found ${highReusabilityPatterns.length} patterns with high reusability. Consider extracting these as shared utilities.`,
        patterns: highReusabilityPatterns.map(p => p.id),
        priority: 'high'
      });
    }

    // Pattern duplication detection
    const patternGroups = this.groupSimilarPatterns(patterns);
    for (const [type, typePatterns] of Object.entries(patternGroups)) {
      if (typePatterns.length > 1) {
        recommendations.push({
          type: 'duplication',
          title: `Multiple ${type} Patterns Detected`,
          description: `Found ${typePatterns.length} similar ${type} patterns. Consider consolidating to reduce duplication.`,
          patterns: typePatterns.map(p => p.id),
          priority: 'medium'
        });
      }
    }

    // Missing pattern recommendations
    const missingPatterns = this.detectMissingPatterns(patterns);
    recommendations.push(...missingPatterns);

    return recommendations;
  }

  /**
   * Group similar patterns together
   */
  groupSimilarPatterns(patterns) {
    return patterns.reduce((groups, pattern) => {
      if (!groups[pattern.type]) {
        groups[pattern.type] = [];
      }
      groups[pattern.type].push(pattern);
      return groups;
    }, {});
  }

  /**
   * Detect potentially missing patterns
   */
  detectMissingPatterns(patterns) {
    const recommendations = [];
    const foundTypes = new Set(patterns.map(p => p.type));

    // Common pattern combinations
    if (foundTypes.has('api-endpoint') && !foundTypes.has('error-handler')) {
      recommendations.push({
        type: 'suggestion',
        title: 'Consider Adding Error Handling',
        description: 'API endpoints detected without corresponding error handling patterns.',
        priority: 'medium'
      });
    }

    if (foundTypes.has('database-model') && !foundTypes.has('validation-schema')) {
      recommendations.push({
        type: 'suggestion',
        title: 'Consider Adding Validation',
        description: 'Database models detected without corresponding validation patterns.',
        priority: 'medium'
      });
    }

    if (foundTypes.has('api-endpoint') && !foundTypes.has('auth-middleware')) {
      recommendations.push({
        type: 'security',
        title: 'Consider Adding Authentication',
        description: 'API endpoints detected without authentication middleware.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Store patterns in semantic search backend
   */
  async storePatterns(patterns) {
    if (patterns.length === 0) return { success: true, stored: 0 };

    try {
      const response = await fetch(`${this.config.semanticSearchServer}/api/patterns/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patterns: patterns,
          source: 'github-webhook',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to store patterns: ${response.statusText}`);
      }

      const result = await response.json();
      this.stats.patterns_stored += patterns.length;

      this.logger.info('Patterns stored successfully', {
        patterns_stored: patterns.length
      });

      return { success: true, stored: patterns.length, response: result };

    } catch (error) {
      this.logger.error('Failed to store patterns', {
        patterns_count: patterns.length,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check if language is supported
   */
  isSupportedLanguage(filename) {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript', 
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c': 'c'
    };

    const language = languageMap[extension];
    return language && this.config.supportedLanguages.includes(language);
  }

  /**
   * Detect programming language from filename
   */
  detectLanguage(filename) {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript', 
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'cs': 'csharp'
    };

    return languageMap[extension] || 'unknown';
  }

  /**
   * Update analysis statistics
   */
  updateStats(filesAnalyzed, patternsDiscovered, analysisTime) {
    this.stats.files_analyzed += filesAnalyzed;
    this.stats.patterns_discovered += patternsDiscovered;
    this.stats.analysis_time_total += analysisTime;
    
    const totalAnalyses = this.stats.files_analyzed;
    this.stats.average_analysis_time = 
      totalAnalyses > 0 ? this.stats.analysis_time_total / totalAnalyses : 0;
  }

  /**
   * Get analysis statistics
   */
  getStats() {
    return {
      ...this.stats,
      languages_processed: Array.from(this.stats.languages_processed),
      patterns_per_file: this.stats.files_analyzed > 0 ? 
        (this.stats.patterns_discovered / this.stats.files_analyzed).toFixed(2) : 0
    };
  }
}