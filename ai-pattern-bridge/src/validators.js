/**
 * 🌉 KRINS AI Pattern Bridge Validators
 * Comprehensive validation system for AI coordination requests
 */

import Joi from 'joi';

/**
 * Validate AI system registration request
 */
export const validateBridgeRequest = (req, res, next) => {
  const schema = Joi.object({
    system_id: Joi.string().required().min(1).max(100).trim(),
    system_name: Joi.string().required().min(1).max(200).trim(),
    capabilities: Joi.array().items(
      Joi.string().valid(
        'backend', 'frontend', 'testing', 'devops', 'security', 
        'ui-design', 'data-analysis', 'ml-training', 'api-design',
        'database', 'architecture', 'performance', 'documentation'
      )
    ).min(1).required(),
    endpoint: Joi.string().uri().required(),
    system_type: Joi.string().valid('specialist', 'coordinator', 'monitor', 'bridge').default('specialist'),
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'AI system registration validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate coordination session start request
 */
export const validateCoordinationStart = (req, res, next) => {
  const schema = Joi.object({
    coordinator_id: Joi.string().required().min(1).max(100).trim(),
    project_description: Joi.string().required().min(10).max(2000).trim(),
    required_capabilities: Joi.array().items(
      Joi.string().valid(
        'backend', 'frontend', 'testing', 'devops', 'security', 
        'ui-design', 'data-analysis', 'ml-training', 'api-design',
        'database', 'architecture', 'performance', 'documentation'
      )
    ).min(1).required(),
    coordination_type: Joi.string().valid('project', 'analysis', 'review', 'optimization').default('project'),
    priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
    estimated_duration: Joi.number().integer().min(60000).max(14400000).default(3600000), // 1 min to 4 hours
    requirements: Joi.object({
      tech_stack: Joi.array().items(Joi.string().max(50)).default([]),
      constraints: Joi.array().items(Joi.string().max(200)).default([]),
      success_criteria: Joi.array().items(Joi.string().max(300)).default([])
    }).default({}),
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Coordination session validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate message routing request
 */
export const validateMessageRouting = (req, res, next) => {
  const schema = Joi.object({
    from_system: Joi.string().required().min(1).max(100).trim(),
    to_system: Joi.string().max(100).trim().when('routing_strategy', {
      is: 'direct',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    message_type: Joi.string().required().valid(
      'coordination', 'question', 'answer', 'notification', 'request', 
      'response', 'status-update', 'error', 'warning', 'broadcast'
    ),
    content: Joi.object().required(),
    coordination_session_id: Joi.string().max(100).optional(),
    priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
    routing_strategy: Joi.string().valid('direct', 'capability', 'broadcast', 'queue').default('direct'),
    capability_requirements: Joi.array().items(Joi.string().max(50)).when('routing_strategy', {
      is: 'capability',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    ttl: Joi.number().integer().min(60000).max(3600000).default(300000), // 1 min to 1 hour
    requires_response: Joi.boolean().default(false),
    response_timeout: Joi.number().integer().min(5000).max(300000).default(30000), // 5s to 5 min
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Message routing validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate pattern synchronization request
 */
export const validatePatternSync = (req, res, next) => {
  const schema = Joi.object({
    source_system: Joi.string().required().min(1).max(100).trim(),
    patterns: Joi.array().items(
      Joi.object({
        id: Joi.string().max(100).optional(),
        name: Joi.string().required().min(1).max(200).trim(),
        type: Joi.string().required().valid(
          'component', 'service', 'utility', 'hook', 'api', 'database', 
          'configuration', 'testing', 'deployment', 'security', 'performance'
        ),
        content: Joi.alternatives().try(
          Joi.string().max(50000),
          Joi.object()
        ).required(),
        language: Joi.string().valid(
          'typescript', 'javascript', 'python', 'java', 'csharp', 'go', 'rust', 'sql'
        ).default('typescript'),
        description: Joi.string().max(1000).optional(),
        version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).default('1.0.0'),
        tags: Joi.array().items(Joi.string().max(50)).default([]),
        dependencies: Joi.array().items(Joi.string().max(100)).default([]),
        usage_contexts: Joi.array().items(Joi.string().max(100)).default([]),
        confidence_score: Joi.number().min(0).max(1).default(0.8),
        metadata: Joi.object().default({})
      })
    ).min(1).required(),
    target_systems: Joi.array().items(Joi.string().max(100)).default([]),
    sync_type: Joi.string().valid('broadcast', 'selective', 'request-response').default('broadcast'),
    conflict_resolution: Joi.string().valid('merge', 'replace', 'skip', 'prompt').default('merge'),
    batch_size: Joi.number().integer().min(1).max(100).default(50),
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Pattern synchronization validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate event subscription request
 */
export const validateEventSubscription = (req, res, next) => {
  const schema = Joi.object({
    subscriber_id: Joi.string().required().min(1).max(100).trim(),
    event_types: Joi.alternatives().try(
      Joi.string().valid('*'),
      Joi.array().items(
        Joi.string().valid(
          'ai-system-registered', 'ai-system-disconnected',
          'coordination-session-started', 'coordination-session-completed',
          'pattern-discovered', 'pattern-synchronized',
          'message-routed', 'learning-stored',
          'error-occurred', 'performance-alert',
          'system-health-update'
        )
      ).min(1)
    ).required(),
    subscription_options: Joi.object({
      priority_filter: Joi.array().items(
        Joi.string().valid('low', 'normal', 'high', 'critical')
      ).default([]),
      replay_events: Joi.boolean().default(false),
      batch_delivery: Joi.boolean().default(false),
      max_batch_size: Joi.number().integer().min(1).max(1000).default(100),
      delivery_timeout: Joi.number().integer().min(1000).max(300000).default(30000)
    }).default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Event subscription validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate coordination session completion request
 */
export const validateSessionCompletion = (req, res, next) => {
  const schema = Joi.object({
    session_id: Joi.string().required().min(1).max(100).trim(),
    completion_status: Joi.string().required().valid('completed', 'failed', 'cancelled', 'timeout'),
    results: Joi.object({
      artifacts: Joi.array().items(
        Joi.object({
          type: Joi.string().required().valid('code', 'documentation', 'configuration', 'test', 'deployment'),
          name: Joi.string().required().max(200),
          content: Joi.alternatives().try(Joi.string(), Joi.object()),
          metadata: Joi.object().default({})
        })
      ).default([]),
      metrics: Joi.object({
        tasks_completed: Joi.number().integer().min(0),
        success_rate: Joi.number().min(0).max(100),
        total_messages: Joi.number().integer().min(0),
        patterns_shared: Joi.number().integer().min(0),
        coordination_events: Joi.number().integer().min(0)
      }).default({}),
      success_criteria_met: Joi.array().items(Joi.string().max(300)).default([]),
      lessons_learned: Joi.array().items(Joi.string().max(500)).default([])
    }).required(),
    summary: Joi.string().required().min(10).max(2000).trim(),
    feedback: Joi.object({
      coordinator_rating: Joi.number().min(1).max(5).optional(),
      specialist_ratings: Joi.object().pattern(
        Joi.string(), 
        Joi.number().min(1).max(5)
      ).default({}),
      improvement_suggestions: Joi.array().items(Joi.string().max(500)).default([])
    }).default({}),
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Session completion validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate learning data storage request
 */
export const validateLearningData = (req, res, next) => {
  const schema = Joi.object({
    learning_type: Joi.string().required().valid(
      'pattern-discovery', 'coordination-insight', 'performance-optimization',
      'error-resolution', 'workflow-improvement', 'communication-enhancement',
      'general-learning'
    ),
    source_system: Joi.string().required().min(1).max(100).trim(),
    session_id: Joi.string().max(100).optional(),
    learning_content: Joi.object({
      title: Joi.string().required().min(1).max(200).trim(),
      description: Joi.string().required().min(10).max(2000).trim(),
      context: Joi.object().required(),
      insights: Joi.array().items(Joi.string().max(500)).min(1).required(),
      applicable_scenarios: Joi.array().items(Joi.string().max(200)).default([]),
      confidence_level: Joi.number().min(0).max(1).default(0.5)
    }).required(),
    impact_metrics: Joi.object({
      success_rate_improvement: Joi.number().min(0).max(1).optional(),
      performance_improvement: Joi.number().min(0).optional(),
      usage_frequency: Joi.number().integer().min(0).default(0),
      adoption_rate: Joi.number().min(0).max(1).optional()
    }).default({}),
    tags: Joi.array().items(Joi.string().max(50)).default([]),
    priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Learning data validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate system health report
 */
export const validateHealthReport = (req, res, next) => {
  const schema = Joi.object({
    system_id: Joi.string().required().min(1).max(100).trim(),
    health_status: Joi.string().required().valid('healthy', 'warning', 'critical', 'offline'),
    metrics: Joi.object({
      cpu_usage: Joi.number().min(0).max(100).optional(),
      memory_usage: Joi.number().min(0).max(100).optional(),
      disk_usage: Joi.number().min(0).max(100).optional(),
      response_time: Joi.number().min(0).optional(),
      error_rate: Joi.number().min(0).max(100).optional(),
      active_connections: Joi.number().integer().min(0).optional()
    }).default({}),
    issues: Joi.array().items(
      Joi.object({
        type: Joi.string().required().valid('performance', 'connectivity', 'resource', 'logic', 'security'),
        severity: Joi.string().required().valid('low', 'medium', 'high', 'critical'),
        description: Joi.string().required().max(500),
        first_observed: Joi.date().iso().default(() => new Date()),
        frequency: Joi.string().valid('once', 'intermittent', 'frequent', 'constant').default('once')
      })
    ).default([]),
    recommendations: Joi.array().items(Joi.string().max(300)).default([]),
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Health report validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate generic request with common fields
 */
export const validateGenericRequest = (req, res, next) => {
  const schema = Joi.object({
    request_id: Joi.string().max(100).optional(),
    timestamp: Joi.date().iso().default(() => new Date()),
    metadata: Joi.object().default({})
  }).unknown(true); // Allow additional fields

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Request validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Create custom validator for specific use cases
 */
export const createCustomValidator = (customSchema) => {
  return (req, res, next) => {
    const { error, value } = customSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Custom validation failed',
        details: error.details.map(detail => detail.message),
        timestamp: new Date().toISOString()
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Validate query parameters for search and filtering
 */
export const validateQueryParams = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(50),
    sort_by: Joi.string().valid('created_at', 'updated_at', 'name', 'priority', 'status').default('created_at'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc'),
    filter: Joi.object().default({}),
    search: Joi.string().max(500).optional()
  });

  const { error, value } = schema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.query = value;
  next();
};

/**
 * Validate WebSocket connection authentication
 */
export const validateWebSocketAuth = (info) => {
  const { origin, req } = info;
  
  // Check system ID header
  const systemId = req.headers['x-ai-system-id'];
  if (!systemId || typeof systemId !== 'string' || systemId.length === 0) {
    return false;
  }

  // Check if system ID format is valid
  if (systemId.length > 100) {
    return false;
  }

  // Additional auth checks could go here
  // For example, API key validation, rate limiting, etc.

  return true;
};

/**
 * Error handler for validation failures
 */
export const handleValidationError = (error, req, res, next) => {
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  next(error);
};