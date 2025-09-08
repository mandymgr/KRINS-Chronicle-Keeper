/**
 * 🧠 KRINS Semantic Search Validators
 * Request validation and sanitization
 */

import Joi from 'joi';

/**
 * Validate search query request
 */
export const validateSearchQuery = (req, res, next) => {
  const schema = Joi.object({
    query: Joi.string().required().min(1).max(1000).trim(),
    filters: Joi.object({
      type: Joi.string().max(100),
      tags: Joi.array().items(Joi.string().max(50)),
      created_after: Joi.date().iso(),
      created_before: Joi.date().iso(),
      source: Joi.string().max(100)
    }).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    threshold: Joi.number().min(0).max(1).default(0.7),
    include_scores: Joi.boolean().default(true)
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate memory item storage request
 */
export const validateMemoryItem = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().required().min(1).max(50000).trim(),
    type: Joi.string().max(100).default('general'),
    metadata: Joi.object().default({}),
    tags: Joi.array().items(Joi.string().max(50)).default([]),
    source: Joi.string().max(100).default('api')
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate pattern matching request
 */
export const validatePatternMatch = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().required().min(1).max(100000),
    context: Joi.string().max(500).default(''),
    language: Joi.string().valid(
      'typescript', 'javascript', 'python', 'java', 'csharp', 'sql', 'go', 'rust'
    ).default('typescript'),
    include_scores: Joi.boolean().default(true),
    min_score: Joi.number().min(0).max(1).default(0.6)
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};

/**
 * Validate AI team sync request
 */
export const validateAITeamSync = (req, res, next) => {
  const schema = Joi.object({
    specialist_id: Joi.string().required().max(100),
    patterns: Joi.array().items(
      Joi.object({
        name: Joi.string().required().max(200),
        type: Joi.string().required().max(100),
        code: Joi.string().max(10000),
        description: Joi.string().max(500),
        language: Joi.string().max(50).default('typescript'),
        tags: Joi.array().items(Joi.string().max(50)).default([])
      })
    ).required(),
    context: Joi.string().max(200).default(''),
    metadata: Joi.object().default({})
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message),
      timestamp: new Date().toISOString()
    });
  }

  req.body = value;
  next();
};