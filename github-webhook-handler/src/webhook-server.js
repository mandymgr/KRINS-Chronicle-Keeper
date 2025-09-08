/**
 * 🔗 KRINS Revolutionary GitHub Webhook Handler
 * World's first GitHub webhook system that triggers autonomous AI development teams
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { createLogger, format, transports } from 'winston';
import { GitHubEventProcessor } from './github-event-processor.js';
import { AITeamTrigger } from './ai-team-trigger.js';
import { ADRGenerator } from './adr-generator.js';
import { PatternAnalyzer } from './pattern-analyzer.js';
import { validateWebhookPayload } from './validators.js';

// Integration endpoints
const AI_PATTERN_BRIDGE = 'http://localhost:3007';
const MCP_AI_TEAM_SERVER = 'http://localhost:3006';
const SEMANTIC_SEARCH_SERVER = 'http://localhost:3003';
const FASTAPI_BACKEND = 'http://localhost:8000';

class KRINSGitHubWebhookHandler {
  constructor(port = 3008) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    // Initialize core components
    this.eventProcessor = new GitHubEventProcessor();
    this.aiTeamTrigger = new AITeamTrigger({
      aiPatternBridge: AI_PATTERN_BRIDGE,
      mcpAITeamServer: MCP_AI_TEAM_SERVER,
      semanticSearchServer: SEMANTIC_SEARCH_SERVER
    });
    this.adrGenerator = new ADRGenerator();
    this.patternAnalyzer = new PatternAnalyzer();
    
    // Webhook statistics
    this.webhookStats = {
      total_received: 0,
      events_processed: 0,
      ai_teams_triggered: 0,
      adrs_generated: 0,
      patterns_discovered: 0,
      errors: 0
    };

    // Setup logging
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [GitHubWebhook] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/github-webhook.log' })
      ]
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security
    this.app.use(helmet());
    
    // Rate limiting for GitHub webhooks
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // Reasonable limit for GitHub webhooks
      message: {
        error: 'Too many webhook requests',
        retry_after: '1 minute'
      }
    });
    this.app.use(limiter);

    // CORS for dashboard integration
    this.app.use(cors({
      origin: [
        'http://localhost:3000', // React frontend
        'http://localhost:5173', // Vite dev server
        'http://localhost:8000', // FastAPI backend
        'http://localhost:3006', // MCP AI Team server
        'http://localhost:3003', // Semantic search server
        'http://localhost:3007', // AI Pattern Bridge
        /^https:\/\/.*\.vercel\.app$/, // Vercel deployments
        /^https:\/\/.*\.netlify\.app$/ // Netlify deployments
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-GitHub-Event', 'X-Hub-Signature-256'],
      credentials: true
    }));

    // Body parsing for webhooks (raw for signature verification)
    this.app.use('/webhook', express.raw({ type: 'application/json' }));
    
    // JSON parsing for other endpoints
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.info(`${req.method} ${req.path}`, {
          status: res.statusCode,
          duration: `${duration}ms`,
          github_event: req.headers['x-github-event'] || 'none'
        });
      });
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'KRINS GitHub Webhook Handler',
        version: '1.0.0',
        components: {
          event_processor: true,
          ai_team_trigger: this.aiTeamTrigger.isReady(),
          adr_generator: true,
          pattern_analyzer: true
        },
        integration_endpoints: {
          ai_pattern_bridge: AI_PATTERN_BRIDGE,
          mcp_ai_team_server: MCP_AI_TEAM_SERVER,
          semantic_search_server: SEMANTIC_SEARCH_SERVER,
          fastapi_backend: FASTAPI_BACKEND
        },
        statistics: this.webhookStats,
        timestamp: new Date().toISOString()
      });
    });

    // Main GitHub webhook endpoint
    this.app.post('/webhook', validateWebhookPayload, async (req, res) => {
      const startTime = Date.now();
      
      try {
        const signature = req.headers['x-hub-signature-256'];
        const event = req.headers['x-github-event'];
        const delivery = req.headers['x-github-delivery'];
        
        this.webhookStats.total_received++;

        // Verify webhook signature
        if (!this.verifySignature(req.body, signature)) {
          this.logger.error('Invalid webhook signature', { delivery, event });
          return res.status(401).json({
            success: false,
            error: 'Invalid signature',
            timestamp: new Date().toISOString()
          });
        }

        // Parse payload
        const payload = JSON.parse(req.body.toString());
        
        this.logger.info('GitHub webhook received', {
          event,
          delivery,
          repository: payload.repository?.full_name,
          action: payload.action
        });

        // Process webhook event
        const processingResult = await this.processWebhookEvent(event, payload, {
          delivery,
          received_at: new Date().toISOString()
        });

        this.webhookStats.events_processed++;
        const processingTime = Date.now() - startTime;

        this.logger.info('Webhook processed successfully', {
          event,
          delivery,
          processing_time: `${processingTime}ms`,
          ai_teams_triggered: processingResult.ai_teams_triggered,
          adrs_generated: processingResult.adrs_generated
        });

        res.json({
          success: true,
          event,
          delivery,
          processing_result: processingResult,
          processing_time: processingTime,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.webhookStats.errors++;
        this.logger.error('Webhook processing failed', {
          error: error.message,
          delivery: req.headers['x-github-delivery'],
          event: req.headers['x-github-event']
        });
        
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Manual AI team trigger endpoint
    this.app.post('/api/trigger-ai-team', async (req, res) => {
      try {
        const {
          repository_url,
          trigger_type,
          context,
          required_capabilities = []
        } = req.body;

        if (!repository_url || !trigger_type) {
          return res.status(400).json({
            success: false,
            error: 'repository_url and trigger_type are required',
            timestamp: new Date().toISOString()
          });
        }

        const triggerResult = await this.aiTeamTrigger.triggerAITeam({
          repository_url,
          trigger_type,
          context,
          required_capabilities,
          manual_trigger: true
        });

        this.webhookStats.ai_teams_triggered++;

        res.json({
          success: true,
          trigger_result: triggerResult,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Manual AI team trigger failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Manual ADR generation endpoint
    this.app.post('/api/generate-adr', async (req, res) => {
      try {
        const {
          title,
          context,
          repository_url,
          pull_request_number,
          use_ai_analysis = true
        } = req.body;

        if (!title || !context) {
          return res.status(400).json({
            success: false,
            error: 'title and context are required',
            timestamp: new Date().toISOString()
          });
        }

        const adrResult = await this.adrGenerator.generateADR({
          title,
          context,
          repository_url,
          pull_request_number,
          use_ai_analysis,
          manual_generation: true
        });

        this.webhookStats.adrs_generated++;

        res.json({
          success: true,
          adr_result: adrResult,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Manual ADR generation failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Pattern analysis endpoint
    this.app.post('/api/analyze-patterns', async (req, res) => {
      try {
        const {
          repository_url,
          commit_sha,
          file_paths = [],
          analysis_type = 'comprehensive'
        } = req.body;

        if (!repository_url) {
          return res.status(400).json({
            success: false,
            error: 'repository_url is required',
            timestamp: new Date().toISOString()
          });
        }

        const analysisResult = await this.patternAnalyzer.analyzeRepository({
          repository_url,
          commit_sha,
          file_paths,
          analysis_type
        });

        if (analysisResult.patterns_discovered > 0) {
          this.webhookStats.patterns_discovered += analysisResult.patterns_discovered;
        }

        res.json({
          success: true,
          analysis_result: analysisResult,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Pattern analysis failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Get webhook statistics
    this.app.get('/api/statistics', (req, res) => {
      res.json({
        success: true,
        statistics: {
          ...this.webhookStats,
          uptime: process.uptime(),
          integration_status: {
            ai_pattern_bridge: this.checkEndpointHealth(AI_PATTERN_BRIDGE),
            mcp_ai_team_server: this.checkEndpointHealth(MCP_AI_TEAM_SERVER),
            semantic_search_server: this.checkEndpointHealth(SEMANTIC_SEARCH_SERVER)
          }
        },
        timestamp: new Date().toISOString()
      });
    });

    // Get recent webhook events
    this.app.get('/api/events', async (req, res) => {
      try {
        const { limit = 50, event_type, repository } = req.query;
        
        const events = await this.eventProcessor.getRecentEvents({
          limit: parseInt(limit),
          event_type,
          repository
        });

        res.json({
          success: true,
          events,
          total: events.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Failed to get webhook events', { error: error.message });
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      this.logger.error('Unhandled error', { error: error.message, path: req.path });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
        available_endpoints: [
          'GET /health',
          'POST /webhook',
          'POST /api/trigger-ai-team',
          'POST /api/generate-adr',
          'POST /api/analyze-patterns',
          'GET /api/statistics',
          'GET /api/events'
        ],
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Verify GitHub webhook signature
   */
  verifySignature(payload, signature) {
    if (!this.webhookSecret) {
      this.logger.warn('No webhook secret configured - running in development mode');
      return true;
    }

    if (!signature) {
      return false;
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    
    try {
      return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch (error) {
      this.logger.error('Signature verification error', { error: error.message });
      return false;
    }
  }

  /**
   * Process different GitHub webhook events
   */
  async processWebhookEvent(eventType, payload, metadata) {
    const processingResult = {
      event_type: eventType,
      ai_teams_triggered: 0,
      adrs_generated: 0,
      patterns_discovered: 0,
      actions_taken: []
    };

    try {
      // Process event with specialized handlers
      switch (eventType) {
        case 'pull_request':
          await this.handlePullRequestEvent(payload, processingResult);
          break;
          
        case 'push':
          await this.handlePushEvent(payload, processingResult);
          break;
          
        case 'issues':
          await this.handleIssueEvent(payload, processingResult);
          break;
          
        case 'release':
          await this.handleReleaseEvent(payload, processingResult);
          break;
          
        case 'repository':
          await this.handleRepositoryEvent(payload, processingResult);
          break;
          
        default:
          this.logger.info('Unhandled event type', { event_type: eventType });
          processingResult.actions_taken.push(`Logged unhandled event: ${eventType}`);
      }

      // Store event for analytics
      await this.eventProcessor.storeEvent({
        event_type: eventType,
        payload,
        metadata,
        processing_result: processingResult,
        processed_at: new Date().toISOString()
      });

      return processingResult;

    } catch (error) {
      this.logger.error('Event processing failed', {
        event_type: eventType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle pull request events - main AI team trigger
   */
  async handlePullRequestEvent(payload, result) {
    const { action, pull_request, repository } = payload;
    
    if (!['opened', 'synchronize', 'edited'].includes(action)) {
      return;
    }

    this.logger.info('Processing pull request event', {
      action,
      pr_number: pull_request.number,
      repository: repository.full_name,
      title: pull_request.title
    });

    try {
      // Analyze PR for AI team requirements
      const prAnalysis = await this.analyzePullRequest(pull_request, repository);
      
      // Trigger AI team if significant changes detected
      if (prAnalysis.requires_ai_team) {
        const aiTeamResult = await this.aiTeamTrigger.triggerAITeam({
          repository_url: repository.clone_url,
          trigger_type: 'pull_request',
          context: {
            pr_number: pull_request.number,
            title: pull_request.title,
            description: pull_request.body,
            changes: prAnalysis.changes,
            author: pull_request.user.login
          },
          required_capabilities: prAnalysis.required_capabilities
        });

        result.ai_teams_triggered += aiTeamResult.teams_created || 0;
        result.actions_taken.push(`Triggered AI team for PR #${pull_request.number}`);
      }

      // Generate ADR if architectural changes detected
      if (prAnalysis.requires_adr) {
        const adrResult = await this.adrGenerator.generateADR({
          title: `Architecture Decision for ${pull_request.title}`,
          context: {
            pull_request,
            repository,
            analysis: prAnalysis
          },
          use_ai_analysis: true
        });

        result.adrs_generated += adrResult.adrs_created || 0;
        result.actions_taken.push(`Generated ADR for PR #${pull_request.number}`);
      }

      // Analyze patterns in PR changes
      if (prAnalysis.changes.changed_files > 5) {
        const patternResult = await this.patternAnalyzer.analyzeChanges({
          pull_request,
          repository,
          analysis_type: 'pr_changes'
        });

        result.patterns_discovered += patternResult.patterns_discovered || 0;
        if (patternResult.patterns_discovered > 0) {
          result.actions_taken.push(`Discovered ${patternResult.patterns_discovered} new patterns`);
        }
      }

    } catch (error) {
      this.logger.error('Pull request processing failed', {
        pr_number: pull_request.number,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle push events - pattern learning and coordination
   */
  async handlePushEvent(payload, result) {
    const { commits, repository, ref } = payload;
    
    // Only process main/master branch pushes
    if (!ref.endsWith('/main') && !ref.endsWith('/master')) {
      return;
    }

    this.logger.info('Processing push event', {
      repository: repository.full_name,
      branch: ref,
      commits: commits.length
    });

    try {
      // Analyze commits for patterns
      for (const commit of commits) {
        const commitAnalysis = await this.patternAnalyzer.analyzeCommit({
          commit,
          repository
        });

        if (commitAnalysis.patterns_discovered > 0) {
          result.patterns_discovered += commitAnalysis.patterns_discovered;
          result.actions_taken.push(`Analyzed commit ${commit.id.substring(0, 7)} - found ${commitAnalysis.patterns_discovered} patterns`);
        }
      }

      // Trigger AI team for major architectural changes
      const significantCommits = commits.filter(commit => 
        commit.added.length + commit.removed.length + commit.modified.length > 10
      );

      if (significantCommits.length > 0) {
        const aiTeamResult = await this.aiTeamTrigger.triggerAITeam({
          repository_url: repository.clone_url,
          trigger_type: 'significant_push',
          context: {
            branch: ref,
            commits: significantCommits.length,
            total_changes: significantCommits.reduce((sum, c) => 
              sum + c.added.length + c.removed.length + c.modified.length, 0
            )
          },
          required_capabilities: ['architecture', 'code-review', 'testing']
        });

        result.ai_teams_triggered += aiTeamResult.teams_created || 0;
        result.actions_taken.push(`Triggered AI team for significant push (${significantCommits.length} commits)`);
      }

    } catch (error) {
      this.logger.error('Push event processing failed', {
        repository: repository.full_name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle issue events - decision tracking
   */
  async handleIssueEvent(payload, result) {
    const { action, issue, repository } = payload;
    
    if (action !== 'opened') {
      return;
    }

    this.logger.info('Processing issue event', {
      action,
      issue_number: issue.number,
      repository: repository.full_name,
      title: issue.title
    });

    try {
      // Analyze issue for architectural decision needs
      const issueAnalysis = await this.analyzeIssue(issue, repository);
      
      if (issueAnalysis.requires_architectural_decision) {
        // Generate ADR suggestion
        const adrResult = await this.adrGenerator.generateADR({
          title: `Architecture Decision for Issue #${issue.number}: ${issue.title}`,
          context: {
            issue,
            repository,
            analysis: issueAnalysis
          },
          use_ai_analysis: true
        });

        result.adrs_generated += adrResult.adrs_created || 0;
        result.actions_taken.push(`Generated ADR suggestion for issue #${issue.number}`);
      }

      // Trigger AI team for complex technical issues
      if (issueAnalysis.requires_ai_team) {
        const aiTeamResult = await this.aiTeamTrigger.triggerAITeam({
          repository_url: repository.clone_url,
          trigger_type: 'technical_issue',
          context: {
            issue_number: issue.number,
            title: issue.title,
            description: issue.body,
            labels: issue.labels.map(l => l.name)
          },
          required_capabilities: issueAnalysis.required_capabilities
        });

        result.ai_teams_triggered += aiTeamResult.teams_created || 0;
        result.actions_taken.push(`Triggered AI team for issue #${issue.number}`);
      }

    } catch (error) {
      this.logger.error('Issue event processing failed', {
        issue_number: issue.number,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle release events - deployment coordination
   */
  async handleReleaseEvent(payload, result) {
    const { action, release, repository } = payload;
    
    if (action !== 'published') {
      return;
    }

    this.logger.info('Processing release event', {
      action,
      tag: release.tag_name,
      repository: repository.full_name
    });

    try {
      // Trigger DevOps AI team for deployment coordination
      const aiTeamResult = await this.aiTeamTrigger.triggerAITeam({
        repository_url: repository.clone_url,
        trigger_type: 'release_deployment',
        context: {
          tag_name: release.tag_name,
          release_name: release.name,
          description: release.body,
          prerelease: release.prerelease
        },
        required_capabilities: ['devops', 'deployment', 'monitoring', 'testing']
      });

      result.ai_teams_triggered += aiTeamResult.teams_created || 0;
      result.actions_taken.push(`Triggered deployment AI team for release ${release.tag_name}`);

    } catch (error) {
      this.logger.error('Release event processing failed', {
        tag: release.tag_name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle repository events - setup and configuration
   */
  async handleRepositoryEvent(payload, result) {
    const { action, repository } = payload;
    
    if (action !== 'created') {
      return;
    }

    this.logger.info('Processing repository event', {
      action,
      repository: repository.full_name
    });

    try {
      // Trigger AI team for new repository setup
      const aiTeamResult = await this.aiTeamTrigger.triggerAITeam({
        repository_url: repository.clone_url,
        trigger_type: 'repository_setup',
        context: {
          name: repository.name,
          description: repository.description,
          language: repository.language,
          private: repository.private
        },
        required_capabilities: ['architecture', 'devops', 'documentation', 'security']
      });

      result.ai_teams_triggered += aiTeamResult.teams_created || 0;
      result.actions_taken.push(`Triggered setup AI team for new repository ${repository.name}`);

    } catch (error) {
      this.logger.error('Repository event processing failed', {
        repository: repository.full_name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze pull request for AI team requirements
   */
  async analyzePullRequest(pullRequest, repository) {
    const analysis = {
      requires_ai_team: false,
      requires_adr: false,
      required_capabilities: [],
      changes: {
        additions: pullRequest.additions || 0,
        deletions: pullRequest.deletions || 0,
        changed_files: pullRequest.changed_files || 0
      },
      complexity: 'low'
    };

    // Size-based analysis
    const totalChanges = analysis.changes.additions + analysis.changes.deletions;
    
    if (totalChanges > 500) {
      analysis.requires_ai_team = true;
      analysis.requires_adr = true;
      analysis.complexity = 'high';
      analysis.required_capabilities.push('architecture', 'code-review', 'testing');
    } else if (totalChanges > 100) {
      analysis.requires_ai_team = true;
      analysis.complexity = 'medium';
      analysis.required_capabilities.push('code-review', 'testing');
    }

    // Content-based analysis
    const content = `${pullRequest.title} ${pullRequest.body || ''}`.toLowerCase();
    
    const architecturalKeywords = {
      'architecture': ['architecture'],
      'database': ['database', 'migration', 'schema'],
      'api': ['api', 'endpoint', 'rest', 'graphql'],
      'security': ['security', 'auth', 'permission', 'encryption'],
      'performance': ['performance', 'optimization', 'cache'],
      'infrastructure': ['deploy', 'docker', 'kubernetes', 'ci/cd'],
      'frontend': ['frontend', 'ui', 'react', 'vue', 'angular'],
      'backend': ['backend', 'server', 'service', 'microservice']
    };

    for (const [capability, keywords] of Object.entries(architecturalKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        analysis.required_capabilities.push(capability);
        analysis.requires_ai_team = true;
        
        if (['architecture', 'database', 'api'].includes(capability)) {
          analysis.requires_adr = true;
        }
      }
    }

    // Remove duplicates
    analysis.required_capabilities = [...new Set(analysis.required_capabilities)];

    return analysis;
  }

  /**
   * Analyze issue for AI team requirements
   */
  async analyzeIssue(issue, repository) {
    const analysis = {
      requires_ai_team: false,
      requires_architectural_decision: false,
      required_capabilities: [],
      complexity: 'low'
    };

    const content = `${issue.title} ${issue.body || ''}`.toLowerCase();
    const labels = issue.labels.map(l => l.name.toLowerCase());

    // Label-based analysis
    const capabilityLabels = {
      'bug': ['backend', 'testing'],
      'enhancement': ['architecture', 'frontend'],
      'performance': ['performance', 'backend'],
      'security': ['security'],
      'architecture': ['architecture', 'documentation'],
      'deployment': ['devops', 'infrastructure']
    };

    for (const label of labels) {
      if (capabilityLabels[label]) {
        analysis.required_capabilities.push(...capabilityLabels[label]);
        analysis.requires_ai_team = true;
      }
    }

    // Content-based analysis for architectural decisions
    const architecturalTerms = [
      'should we', 'which approach', 'how to implement',
      'architecture decision', 'design choice', 'technical decision'
    ];

    if (architecturalTerms.some(term => content.includes(term))) {
      analysis.requires_architectural_decision = true;
      analysis.required_capabilities.push('architecture', 'documentation');
    }

    // Remove duplicates
    analysis.required_capabilities = [...new Set(analysis.required_capabilities)];

    if (analysis.required_capabilities.length > 2) {
      analysis.complexity = 'high';
    } else if (analysis.required_capabilities.length > 0) {
      analysis.complexity = 'medium';
    }

    return analysis;
  }

  /**
   * Check endpoint health (simplified)
   */
  async checkEndpointHealth(endpoint) {
    try {
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start the webhook server
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          this.logger.info('🔗════════════════════════════════════════════════════════════');
          this.logger.info('🔗  KRINS Revolutionary GitHub Webhook Handler');
          this.logger.info('🔗════════════════════════════════════════════════════════════');
          this.logger.info(`🔗  Server running on port ${this.port}`);
          this.logger.info(`🔗  Health check: http://localhost:${this.port}/health`);
          this.logger.info(`🔗  Webhook endpoint: http://localhost:${this.port}/webhook`);
          this.logger.info(`🔗  Integration: AI Pattern Bridge (${AI_PATTERN_BRIDGE})`);
          this.logger.info(`🔗  Integration: MCP AI Team (${MCP_AI_TEAM_SERVER})`);
          this.logger.info(`🔗  Integration: Semantic Search (${SEMANTIC_SEARCH_SERVER})`);
          this.logger.info('🔗════════════════════════════════════════════════════════════');
          resolve(this.server);
        }
      });
    });
  }

  /**
   * Stop the server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('🔗 KRINS GitHub Webhook Handler stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const handler = new KRINSGitHubWebhookHandler();
  
  handler.start().then(() => {
    console.log('🔗 KRINS GitHub Webhook Handler started successfully!');
  }).catch((error) => {
    console.error('❌ Failed to start KRINS GitHub Webhook Handler:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🔗 Shutting down KRINS GitHub Webhook Handler...');
    await handler.stop();
    process.exit(0);
  });
}

export { KRINSGitHubWebhookHandler };