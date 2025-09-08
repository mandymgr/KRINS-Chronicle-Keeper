/**
 * 🛡️ KRINS GitHub Webhook Validators
 * Comprehensive validation system for GitHub webhook events and AI team requests
 */

import Joi from 'joi';
import { createHmac } from 'crypto';
import { createLogger, format, transports } from 'winston';

export class GitHubWebhookValidators {
  constructor(config = {}) {
    this.config = {
      webhookSecret: config.webhookSecret || process.env.GITHUB_WEBHOOK_SECRET,
      strictValidation: config.strictValidation || false,
      allowedEventTypes: config.allowedEventTypes || [
        'push', 'pull_request', 'issues', 'release', 'create', 'delete',
        'fork', 'watch', 'star', 'commit_comment', 'pull_request_review',
        'deployment', 'deployment_status', 'ping'
      ],
      maxPayloadSize: config.maxPayloadSize || 50 * 1024 * 1024, // 50MB
      ...config
    };

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [WebhookValidators] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });

    // Initialize validation schemas
    this.initializeSchemas();
  }

  /**
   * Initialize Joi validation schemas
   */
  initializeSchemas() {
    // Base repository schema
    this.repositorySchema = Joi.object({
      id: Joi.number().required(),
      name: Joi.string().required(),
      full_name: Joi.string().required(),
      owner: Joi.object({
        id: Joi.number().required(),
        login: Joi.string().required(),
        type: Joi.string().valid('User', 'Organization').required()
      }).required(),
      private: Joi.boolean().required(),
      description: Joi.string().allow(null),
      language: Joi.string().allow(null),
      default_branch: Joi.string().required(),
      html_url: Joi.string().uri().required(),
      clone_url: Joi.string().uri().required()
    });

    // Base user schema
    this.userSchema = Joi.object({
      id: Joi.number().required(),
      login: Joi.string().required(),
      type: Joi.string().valid('User', 'Bot', 'Organization').required(),
      site_admin: Joi.boolean(),
      avatar_url: Joi.string().uri(),
      html_url: Joi.string().uri()
    });

    // Commit schema
    this.commitSchema = Joi.object({
      id: Joi.string().required(),
      message: Joi.string().required(),
      author: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        username: Joi.string()
      }).required(),
      committer: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        username: Joi.string()
      }),
      timestamp: Joi.string().isoDate().required(),
      url: Joi.string().uri().required(),
      added: Joi.array().items(Joi.string()),
      removed: Joi.array().items(Joi.string()),
      modified: Joi.array().items(Joi.string())
    });

    // Event-specific schemas
    this.eventSchemas = {
      push: this.createPushEventSchema(),
      pull_request: this.createPullRequestEventSchema(),
      issues: this.createIssueEventSchema(),
      release: this.createReleaseEventSchema(),
      create: this.createCreateEventSchema(),
      delete: this.createDeleteEventSchema(),
      fork: this.createForkEventSchema(),
      watch: this.createWatchEventSchema(),
      star: this.createStarEventSchema(),
      commit_comment: this.createCommitCommentEventSchema(),
      pull_request_review: this.createPullRequestReviewEventSchema(),
      deployment: this.createDeploymentEventSchema(),
      deployment_status: this.createDeploymentStatusEventSchema(),
      ping: this.createPingEventSchema()
    };

    // AI Team Request schema
    this.aiTeamRequestSchema = Joi.object({
      repository_url: Joi.string().uri().required(),
      trigger_type: Joi.string().valid(
        'pull_request', 'significant_push', 'technical_issue',
        'release_deployment', 'repository_setup', 'manual_trigger'
      ).required(),
      context: Joi.object({
        trigger_type: Joi.string(),
        title: Joi.string(),
        description: Joi.string(),
        labels: Joi.array().items(Joi.string()),
        changes: Joi.object({
          files: Joi.number().min(0),
          additions: Joi.number().min(0),
          deletions: Joi.number().min(0),
          changed_files: Joi.number().min(0)
        }),
        priority: Joi.string().valid('critical', 'high', 'medium', 'low', 'normal')
      }).required(),
      required_capabilities: Joi.array().items(
        Joi.string().valid(
          'architecture', 'backend', 'frontend', 'testing', 'devops',
          'security', 'database', 'api', 'performance', 'monitoring',
          'documentation', 'code-review'
        )
      ).default([]),
      manual_trigger: Joi.boolean().default(false),
      team_preferences: Joi.object({
        max_team_size: Joi.number().min(1).max(10),
        coordination_strategy: Joi.string().valid('direct', 'hub-and-spoke', 'hierarchical'),
        timeout_minutes: Joi.number().min(5).max(180)
      })
    });

    // ADR Generation Request schema
    this.adrGenerationRequestSchema = Joi.object({
      analysis: Joi.object({
        shouldGenerateADR: Joi.boolean().required(),
        confidence: Joi.number().min(0).max(100).required(),
        category: Joi.string().valid(
          'architectural', 'technical', 'security', 'performance',
          'integration', 'infrastructure', 'process'
        ).required(),
        title: Joi.string().required(),
        context: Joi.object().required(),
        reasoning: Joi.array().items(Joi.string()).required()
      }).required(),
      additional_context: Joi.object().optional()
    });

    // Pattern Analysis Request schema
    this.patternAnalysisRequestSchema = Joi.object({
      event_type: Joi.string().valid(...this.config.allowedEventTypes).required(),
      payload: Joi.object().required(),
      files: Joi.array().items(Joi.object({
        filename: Joi.string().required(),
        content: Joi.string().allow(''),
        status: Joi.string().valid('added', 'modified', 'removed'),
        additions: Joi.number().min(0),
        deletions: Joi.number().min(0),
        changes: Joi.number().min(0)
      }))
    });
  }

  /**
   * Validate GitHub webhook request
   */
  async validateWebhookRequest(headers, body, rawBody) {
    const validationResult = {
      valid: false,
      errors: [],
      warnings: []
    };

    try {
      // Validate headers
      const headerValidation = this.validateWebhookHeaders(headers);
      if (!headerValidation.valid) {
        validationResult.errors.push(...headerValidation.errors);
        return validationResult;
      }

      // Validate signature if webhook secret is configured
      if (this.config.webhookSecret) {
        const signatureValidation = this.validateWebhookSignature(headers, rawBody);
        if (!signatureValidation.valid) {
          validationResult.errors.push(...signatureValidation.errors);
          return validationResult;
        }
      } else {
        validationResult.warnings.push('Webhook signature validation skipped - no secret configured');
      }

      // Validate payload size
      if (rawBody && rawBody.length > this.config.maxPayloadSize) {
        validationResult.errors.push(`Payload size exceeds maximum allowed (${this.config.maxPayloadSize} bytes)`);
        return validationResult;
      }

      // Validate JSON structure
      let payload;
      try {
        payload = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (error) {
        validationResult.errors.push('Invalid JSON payload');
        return validationResult;
      }

      // Validate event type
      const eventType = headers['x-github-event'];
      if (!this.config.allowedEventTypes.includes(eventType)) {
        validationResult.errors.push(`Event type '${eventType}' is not allowed`);
        return validationResult;
      }

      // Validate event payload structure
      const payloadValidation = this.validateEventPayload(eventType, payload);
      if (!payloadValidation.valid) {
        if (this.config.strictValidation) {
          validationResult.errors.push(...payloadValidation.errors);
          return validationResult;
        } else {
          validationResult.warnings.push(...payloadValidation.errors);
        }
      }

      validationResult.valid = true;
      validationResult.event_type = eventType;
      validationResult.payload = payload;

      this.logger.debug('Webhook request validation passed', {
        event_type: eventType,
        repository: payload.repository?.full_name,
        warnings: validationResult.warnings.length
      });

    } catch (error) {
      validationResult.errors.push(`Validation error: ${error.message}`);
      
      this.logger.error('Webhook request validation failed', {
        error: error.message
      });
    }

    return validationResult;
  }

  /**
   * Validate webhook headers
   */
  validateWebhookHeaders(headers) {
    const result = { valid: true, errors: [] };
    
    // Required headers
    const requiredHeaders = ['x-github-event', 'x-github-delivery', 'user-agent'];
    
    for (const header of requiredHeaders) {
      if (!headers[header]) {
        result.valid = false;
        result.errors.push(`Missing required header: ${header}`);
      }
    }

    // Validate User-Agent
    if (headers['user-agent'] && !headers['user-agent'].includes('GitHub-Hookshot')) {
      result.valid = false;
      result.errors.push('Invalid User-Agent - not from GitHub');
    }

    // Validate Content-Type
    if (headers['content-type'] && !headers['content-type'].includes('application/json')) {
      result.valid = false;
      result.errors.push('Invalid Content-Type - must be application/json');
    }

    return result;
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(headers, rawBody) {
    const result = { valid: true, errors: [] };
    
    const signature = headers['x-hub-signature-256'];
    if (!signature) {
      result.valid = false;
      result.errors.push('Missing webhook signature');
      return result;
    }

    try {
      const expectedSignature = 'sha256=' + createHmac('sha256', this.config.webhookSecret)
        .update(rawBody, 'utf8')
        .digest('hex');

      if (signature !== expectedSignature) {
        result.valid = false;
        result.errors.push('Invalid webhook signature');
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Signature validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate event payload structure
   */
  validateEventPayload(eventType, payload) {
    const result = { valid: true, errors: [] };
    
    const schema = this.eventSchemas[eventType];
    if (!schema) {
      result.errors.push(`No validation schema available for event type: ${eventType}`);
      return result;
    }

    const { error } = schema.validate(payload, { abortEarly: false });
    if (error) {
      result.valid = false;
      result.errors = error.details.map(detail => detail.message);
    }

    return result;
  }

  /**
   * Validate AI team trigger request
   */
  validateAITeamRequest(request) {
    const result = { valid: true, errors: [], warnings: [] };

    const { error, value } = this.aiTeamRequestSchema.validate(request, { abortEarly: false });
    
    if (error) {
      result.valid = false;
      result.errors = error.details.map(detail => detail.message);
      return result;
    }

    // Additional business logic validation
    const businessValidation = this.validateAITeamBusinessRules(value);
    if (!businessValidation.valid) {
      result.errors.push(...businessValidation.errors);
      result.valid = false;
    }

    result.warnings.push(...businessValidation.warnings);
    result.validated_request = value;

    return result;
  }

  /**
   * Validate ADR generation request
   */
  validateADRGenerationRequest(request) {
    const result = { valid: true, errors: [] };

    const { error } = this.adrGenerationRequestSchema.validate(request, { abortEarly: false });
    
    if (error) {
      result.valid = false;
      result.errors = error.details.map(detail => detail.message);
      return result;
    }

    // Validate confidence threshold
    if (request.analysis.confidence < 60) {
      result.errors.push('Analysis confidence too low for ADR generation (minimum 60%)');
      result.valid = false;
    }

    return result;
  }

  /**
   * Validate pattern analysis request
   */
  validatePatternAnalysisRequest(request) {
    const result = { valid: true, errors: [] };

    const { error } = this.patternAnalysisRequestSchema.validate(request, { abortEarly: false });
    
    if (error) {
      result.valid = false;
      result.errors = error.details.map(detail => detail.message);
      return result;
    }

    return result;
  }

  /**
   * Validate AI team business rules
   */
  validateAITeamBusinessRules(request) {
    const result = { valid: true, errors: [], warnings: [] };

    // Check for reasonable team size based on capabilities
    const maxRecommendedTeamSize = Math.max(3, Math.ceil(request.required_capabilities.length * 1.5));
    const requestedTeamSize = request.team_preferences?.max_team_size || maxRecommendedTeamSize;

    if (requestedTeamSize > maxRecommendedTeamSize) {
      result.warnings.push(`Requested team size (${requestedTeamSize}) is larger than recommended (${maxRecommendedTeamSize})`);
    }

    // Validate capability combinations
    const conflictingCapabilities = this.findConflictingCapabilities(request.required_capabilities);
    if (conflictingCapabilities.length > 0) {
      result.warnings.push(`Potentially conflicting capabilities detected: ${conflictingCapabilities.join(', ')}`);
    }

    // Check for minimum viable team
    if (request.required_capabilities.length === 0) {
      result.warnings.push('No specific capabilities requested - will use default team composition');
    }

    // Validate trigger type and context alignment
    const contextValidation = this.validateTriggerContextAlignment(request.trigger_type, request.context);
    if (!contextValidation.valid) {
      result.errors.push(...contextValidation.errors);
      result.valid = false;
    }

    return result;
  }

  /**
   * Find conflicting capabilities
   */
  findConflictingCapabilities(capabilities) {
    const conflicts = [];
    const conflictPairs = [
      ['frontend', 'api'], // Usually complementary, but could indicate unclear requirements
      ['testing', 'performance'] // Often overlapping
    ];

    for (const [cap1, cap2] of conflictPairs) {
      if (capabilities.includes(cap1) && capabilities.includes(cap2)) {
        conflicts.push(`${cap1} + ${cap2}`);
      }
    }

    return conflicts;
  }

  /**
   * Validate trigger type and context alignment
   */
  validateTriggerContextAlignment(triggerType, context) {
    const result = { valid: true, errors: [] };

    const requiredContextFields = {
      'pull_request': ['title', 'changes'],
      'significant_push': ['changes'],
      'technical_issue': ['title', 'description'],
      'release_deployment': ['title'],
      'repository_setup': ['description'],
      'manual_trigger': []
    };

    const required = requiredContextFields[triggerType] || [];
    
    for (const field of required) {
      if (!context[field]) {
        result.valid = false;
        result.errors.push(`Missing required context field '${field}' for trigger type '${triggerType}'`);
      }
    }

    return result;
  }

  // Event-specific schema creators

  createPushEventSchema() {
    return Joi.object({
      ref: Joi.string().required(),
      before: Joi.string().required(),
      after: Joi.string().required(),
      created: Joi.boolean().required(),
      deleted: Joi.boolean().required(),
      forced: Joi.boolean().required(),
      base_ref: Joi.string().allow(null),
      compare: Joi.string().uri().required(),
      commits: Joi.array().items(this.commitSchema).required(),
      head_commit: this.commitSchema.allow(null),
      repository: this.repositorySchema.required(),
      pusher: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      }).required(),
      sender: this.userSchema.required()
    });
  }

  createPullRequestEventSchema() {
    return Joi.object({
      action: Joi.string().valid(
        'opened', 'edited', 'closed', 'assigned', 'unassigned',
        'review_requested', 'review_request_removed', 'labeled',
        'unlabeled', 'synchronize', 'ready_for_review', 'locked', 'unlocked'
      ).required(),
      number: Joi.number().required(),
      pull_request: Joi.object({
        id: Joi.number().required(),
        number: Joi.number().required(),
        state: Joi.string().valid('open', 'closed').required(),
        title: Joi.string().required(),
        body: Joi.string().allow(null),
        user: this.userSchema.required(),
        created_at: Joi.string().isoDate().required(),
        updated_at: Joi.string().isoDate().required(),
        closed_at: Joi.string().isoDate().allow(null),
        merged_at: Joi.string().isoDate().allow(null),
        head: Joi.object({
          label: Joi.string().required(),
          ref: Joi.string().required(),
          sha: Joi.string().required(),
          repo: this.repositorySchema.allow(null)
        }).required(),
        base: Joi.object({
          label: Joi.string().required(),
          ref: Joi.string().required(),
          sha: Joi.string().required(),
          repo: this.repositorySchema.required()
        }).required(),
        draft: Joi.boolean().required(),
        merged: Joi.boolean().required(),
        mergeable: Joi.boolean().allow(null),
        html_url: Joi.string().uri().required(),
        url: Joi.string().uri().required()
      }).required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createIssueEventSchema() {
    return Joi.object({
      action: Joi.string().valid(
        'opened', 'edited', 'deleted', 'pinned', 'unpinned',
        'closed', 'reopened', 'assigned', 'unassigned',
        'labeled', 'unlabeled', 'locked', 'unlocked', 'transferred',
        'milestoned', 'demilestoned'
      ).required(),
      issue: Joi.object({
        id: Joi.number().required(),
        number: Joi.number().required(),
        title: Joi.string().required(),
        body: Joi.string().allow(null),
        user: this.userSchema.required(),
        labels: Joi.array().items(Joi.object({
          id: Joi.number().required(),
          name: Joi.string().required(),
          color: Joi.string().required(),
          description: Joi.string().allow(null)
        })),
        state: Joi.string().valid('open', 'closed').required(),
        assignee: this.userSchema.allow(null),
        assignees: Joi.array().items(this.userSchema),
        milestone: Joi.object({
          id: Joi.number().required(),
          title: Joi.string().required(),
          description: Joi.string().allow(null),
          state: Joi.string().valid('open', 'closed').required(),
          due_on: Joi.string().isoDate().allow(null)
        }).allow(null),
        created_at: Joi.string().isoDate().required(),
        updated_at: Joi.string().isoDate().required(),
        closed_at: Joi.string().isoDate().allow(null),
        html_url: Joi.string().uri().required(),
        url: Joi.string().uri().required()
      }).required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createReleaseEventSchema() {
    return Joi.object({
      action: Joi.string().valid(
        'published', 'unpublished', 'created', 'edited', 'deleted', 'prereleased', 'released'
      ).required(),
      release: Joi.object({
        id: Joi.number().required(),
        tag_name: Joi.string().required(),
        target_commitish: Joi.string().required(),
        name: Joi.string().allow(null),
        draft: Joi.boolean().required(),
        author: this.userSchema.required(),
        prerelease: Joi.boolean().required(),
        created_at: Joi.string().isoDate().required(),
        published_at: Joi.string().isoDate().allow(null),
        assets: Joi.array().items(Joi.object({
          id: Joi.number().required(),
          name: Joi.string().required(),
          content_type: Joi.string().required(),
          size: Joi.number().required(),
          download_count: Joi.number().required(),
          browser_download_url: Joi.string().uri().required()
        })),
        body: Joi.string().allow(null),
        html_url: Joi.string().uri().required(),
        url: Joi.string().uri().required()
      }).required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createCreateEventSchema() {
    return Joi.object({
      ref: Joi.string().required(),
      ref_type: Joi.string().valid('repository', 'branch', 'tag').required(),
      master_branch: Joi.string().required(),
      description: Joi.string().allow(null),
      pusher_type: Joi.string().valid('user', 'deploy_key').required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createDeleteEventSchema() {
    return Joi.object({
      ref: Joi.string().required(),
      ref_type: Joi.string().valid('branch', 'tag').required(),
      pusher_type: Joi.string().valid('user', 'deploy_key').required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createForkEventSchema() {
    return Joi.object({
      forkee: this.repositorySchema.required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createWatchEventSchema() {
    return Joi.object({
      action: Joi.string().valid('started').required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createStarEventSchema() {
    return Joi.object({
      action: Joi.string().valid('created', 'deleted').required(),
      starred_at: Joi.string().isoDate().allow(null),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createCommitCommentEventSchema() {
    return Joi.object({
      action: Joi.string().valid('created').required(),
      comment: Joi.object({
        id: Joi.number().required(),
        body: Joi.string().required(),
        commit_id: Joi.string().required(),
        user: this.userSchema.required(),
        path: Joi.string().allow(null),
        position: Joi.number().allow(null),
        line: Joi.number().allow(null),
        created_at: Joi.string().isoDate().required(),
        updated_at: Joi.string().isoDate().required(),
        html_url: Joi.string().uri().required(),
        url: Joi.string().uri().required()
      }).required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createPullRequestReviewEventSchema() {
    return Joi.object({
      action: Joi.string().valid('submitted', 'edited', 'dismissed').required(),
      review: Joi.object({
        id: Joi.number().required(),
        user: this.userSchema.required(),
        body: Joi.string().allow(null),
        commit_id: Joi.string().required(),
        submitted_at: Joi.string().isoDate().allow(null),
        state: Joi.string().valid('approved', 'changes_requested', 'commented', 'dismissed').required(),
        html_url: Joi.string().uri().required(),
        pull_request_url: Joi.string().uri().required()
      }).required(),
      pull_request: Joi.object({
        id: Joi.number().required(),
        number: Joi.number().required(),
        title: Joi.string().required(),
        user: this.userSchema.required()
      }).required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createDeploymentEventSchema() {
    return Joi.object({
      deployment: Joi.object({
        id: Joi.number().required(),
        sha: Joi.string().required(),
        ref: Joi.string().required(),
        task: Joi.string().required(),
        environment: Joi.string().required(),
        description: Joi.string().allow(null),
        creator: this.userSchema.required(),
        created_at: Joi.string().isoDate().required(),
        updated_at: Joi.string().isoDate().required(),
        url: Joi.string().uri().required()
      }).required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createDeploymentStatusEventSchema() {
    return Joi.object({
      deployment_status: Joi.object({
        id: Joi.number().required(),
        state: Joi.string().valid('error', 'failure', 'inactive', 'in_progress', 'queued', 'pending', 'success').required(),
        creator: this.userSchema.required(),
        description: Joi.string().allow(null),
        target_url: Joi.string().uri().allow(null),
        created_at: Joi.string().isoDate().required(),
        updated_at: Joi.string().isoDate().required(),
        deployment_url: Joi.string().uri().required(),
        repository_url: Joi.string().uri().required()
      }).required(),
      deployment: Joi.object({
        id: Joi.number().required(),
        sha: Joi.string().required(),
        ref: Joi.string().required(),
        environment: Joi.string().required(),
        creator: this.userSchema.required(),
        created_at: Joi.string().isoDate().required(),
        url: Joi.string().uri().required()
      }).required(),
      repository: this.repositorySchema.required(),
      sender: this.userSchema.required()
    });
  }

  createPingEventSchema() {
    return Joi.object({
      zen: Joi.string().required(),
      hook_id: Joi.number().required(),
      hook: Joi.object().required(),
      repository: this.repositorySchema.allow(null),
      sender: this.userSchema.allow(null)
    });
  }

  /**
   * Get validation statistics
   */
  getValidationStats() {
    return {
      supported_events: this.config.allowedEventTypes,
      max_payload_size: this.config.maxPayloadSize,
      strict_validation: this.config.strictValidation,
      webhook_secret_configured: Boolean(this.config.webhookSecret),
      schemas_loaded: Object.keys(this.eventSchemas).length
    };
  }
}