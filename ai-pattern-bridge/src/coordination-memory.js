/**
 * 🌉 KRINS Coordination Memory
 * Advanced shared memory system for AI coordination with Redis backend
 */

import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';
import EventEmitter from 'eventemitter3';

export class CoordinationMemory extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      redis_host: config.redis_host || process.env.REDIS_HOST || 'localhost',
      redis_port: config.redis_port || process.env.REDIS_PORT || 6379,
      redis_password: config.redis_password || process.env.REDIS_PASSWORD || null,
      redis_db: config.redis_db || process.env.REDIS_DB || 0,
      key_prefix: config.key_prefix || 'krins:ai:',
      memory_ttl: config.memory_ttl || 86400, // 24 hours
      session_ttl: config.session_ttl || 3600, // 1 hour
      pattern_cache_size: config.pattern_cache_size || 10000,
      ...config
    };

    this.redisClient = null;
    this.subscriberClient = null;
    this.isReady = false;

    // Memory categories with different TTLs and strategies
    this.memoryCategories = {
      sessions: { ttl: this.config.session_ttl, persistent: false },
      patterns: { ttl: this.config.memory_ttl * 7, persistent: true }, // 7 days
      messages: { ttl: this.config.memory_ttl, persistent: false },
      learning: { ttl: this.config.memory_ttl * 30, persistent: true }, // 30 days
      context: { ttl: this.config.session_ttl, persistent: false },
      analytics: { ttl: this.config.memory_ttl * 7, persistent: true }
    };

    // Statistics
    this.memoryStats = {
      operations_count: 0,
      cache_hits: 0,
      cache_misses: 0,
      memory_usage: 0,
      active_sessions: 0,
      stored_patterns: 0,
      total_messages: 0
    };

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [CoordinationMemory] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });
  }

  /**
   * Initialize Redis connection and memory system
   */
  async initialize() {
    try {
      this.logger.info('Initializing Coordination Memory with Redis...');

      // Initialize Redis clients
      await this.initializeRedisClients();
      
      // Setup Redis event handlers
      this.setupRedisEventHandlers();
      
      // Initialize memory structures
      await this.initializeMemoryStructures();
      
      // Start maintenance tasks
      this.startMaintenanceTasks();
      
      this.isReady = true;
      this.logger.info('Coordination Memory initialized successfully', {
        redis_host: this.config.redis_host,
        redis_port: this.config.redis_port,
        key_prefix: this.config.key_prefix
      });
      
    } catch (error) {
      this.logger.error('Coordination Memory initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize Redis clients
   */
  async initializeRedisClients() {
    const redisConfig = {
      socket: {
        host: this.config.redis_host,
        port: this.config.redis_port
      },
      database: this.config.redis_db
    };

    if (this.config.redis_password) {
      redisConfig.password = this.config.redis_password;
    }

    // Main Redis client for operations
    this.redisClient = createClient(redisConfig);
    await this.redisClient.connect();

    // Separate client for pub/sub operations
    this.subscriberClient = createClient(redisConfig);
    await this.subscriberClient.connect();

    this.logger.info('Redis clients connected');
  }

  /**
   * Setup Redis event handlers
   */
  setupRedisEventHandlers() {
    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error', { error: error.message });
      this.emit('redis-error', error);
    });

    this.redisClient.on('disconnect', () => {
      this.logger.warn('Redis client disconnected');
      this.isReady = false;
      this.emit('redis-disconnected');
    });

    this.redisClient.on('reconnecting', () => {
      this.logger.info('Redis client reconnecting');
      this.emit('redis-reconnecting');
    });

    // Subscribe to coordination events
    this.subscriberClient.subscribe(`${this.config.key_prefix}events`, (message) => {
      try {
        const eventData = JSON.parse(message);
        this.emit('coordination-event', eventData);
      } catch (error) {
        this.logger.error('Failed to parse coordination event', { error: error.message });
      }
    });
  }

  /**
   * Initialize memory structures
   */
  async initializeMemoryStructures() {
    // Initialize memory category counters
    for (const category of Object.keys(this.memoryCategories)) {
      const key = this.getKey(`${category}:count`);
      const exists = await this.redisClient.exists(key);
      if (!exists) {
        await this.redisClient.set(key, '0');
      }
    }

    // Initialize global statistics
    const statsKey = this.getKey('stats');
    const statsExists = await this.redisClient.exists(statsKey);
    if (!statsExists) {
      await this.redisClient.hSet(statsKey, this.memoryStats);
    } else {
      // Load existing statistics
      const storedStats = await this.redisClient.hGetAll(statsKey);
      Object.assign(this.memoryStats, storedStats);
    }
  }

  /**
   * Store coordination session data
   */
  async storeSession(sessionId, sessionData) {
    try {
      const key = this.getKey(`sessions:${sessionId}`);
      const data = {
        ...sessionData,
        stored_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      await this.redisClient.setEx(
        key,
        this.memoryCategories.sessions.ttl,
        JSON.stringify(data)
      );

      // Update session count
      await this.redisClient.incr(this.getKey('sessions:count'));
      this.memoryStats.active_sessions++;

      // Publish coordination event
      await this.publishCoordinationEvent('session-stored', {
        session_id: sessionId,
        stored_at: data.stored_at
      });

      this.logger.info('Session stored in coordination memory', {
        session_id: sessionId,
        ttl: this.memoryCategories.sessions.ttl
      });

      return { success: true, stored_at: data.stored_at };

    } catch (error) {
      this.logger.error('Failed to store session', {
        session_id: sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Retrieve coordination session data
   */
  async getSession(sessionId) {
    try {
      const key = this.getKey(`sessions:${sessionId}`);
      const data = await this.redisClient.get(key);

      if (!data) {
        this.memoryStats.cache_misses++;
        return null;
      }

      this.memoryStats.cache_hits++;
      const sessionData = JSON.parse(data);

      // Update last accessed time
      sessionData.last_accessed = new Date().toISOString();
      await this.redisClient.setEx(
        key,
        this.memoryCategories.sessions.ttl,
        JSON.stringify(sessionData)
      );

      this.logger.debug('Session retrieved from coordination memory', {
        session_id: sessionId
      });

      return sessionData;

    } catch (error) {
      this.logger.error('Failed to retrieve session', {
        session_id: sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Store AI pattern in shared memory
   */
  async storePattern(patternId, patternData) {
    try {
      const key = this.getKey(`patterns:${patternId}`);
      const data = {
        ...patternData,
        stored_at: new Date().toISOString(),
        access_count: 0,
        last_accessed: null
      };

      // Store pattern with extended TTL
      await this.redisClient.setEx(
        key,
        this.memoryCategories.patterns.ttl,
        JSON.stringify(data)
      );

      // Add to pattern index for searching
      await this.addToPatternIndex(patternId, patternData);

      // Update pattern count
      await this.redisClient.incr(this.getKey('patterns:count'));
      this.memoryStats.stored_patterns++;

      // Publish coordination event
      await this.publishCoordinationEvent('pattern-stored', {
        pattern_id: patternId,
        pattern_name: patternData.name,
        pattern_type: patternData.type,
        stored_at: data.stored_at
      });

      this.logger.info('Pattern stored in coordination memory', {
        pattern_id: patternId,
        pattern_name: patternData.name,
        pattern_type: patternData.type
      });

      return { success: true, stored_at: data.stored_at };

    } catch (error) {
      this.logger.error('Failed to store pattern', {
        pattern_id: patternId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Retrieve AI pattern from shared memory
   */
  async getPattern(patternId) {
    try {
      const key = this.getKey(`patterns:${patternId}`);
      const data = await this.redisClient.get(key);

      if (!data) {
        this.memoryStats.cache_misses++;
        return null;
      }

      this.memoryStats.cache_hits++;
      const patternData = JSON.parse(data);

      // Update access statistics
      patternData.access_count = (patternData.access_count || 0) + 1;
      patternData.last_accessed = new Date().toISOString();

      await this.redisClient.setEx(
        key,
        this.memoryCategories.patterns.ttl,
        JSON.stringify(patternData)
      );

      this.logger.debug('Pattern retrieved from coordination memory', {
        pattern_id: patternId,
        access_count: patternData.access_count
      });

      return patternData;

    } catch (error) {
      this.logger.error('Failed to retrieve pattern', {
        pattern_id: patternId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Search patterns by criteria
   */
  async searchPatterns(searchCriteria) {
    try {
      const {
        type,
        language,
        tags = [],
        source_system,
        similarity_threshold = 0.7,
        limit = 50
      } = searchCriteria;

      const patterns = [];
      const patternKeys = await this.redisClient.keys(this.getKey('patterns:*'));

      // Process patterns in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < patternKeys.length; i += batchSize) {
        const batch = patternKeys.slice(i, i + batchSize);
        const batchData = await this.redisClient.mGet(batch);

        for (let j = 0; j < batch.length; j++) {
          if (!batchData[j]) continue;

          try {
            const pattern = JSON.parse(batchData[j]);
            let matches = true;

            // Apply filters
            if (type && pattern.type !== type) matches = false;
            if (language && pattern.language !== language) matches = false;
            if (source_system && pattern.source_system !== source_system) matches = false;
            
            if (tags.length > 0) {
              const patternTags = pattern.tags || [];
              const hasMatchingTag = tags.some(tag => patternTags.includes(tag));
              if (!hasMatchingTag) matches = false;
            }

            if (matches) {
              patterns.push({
                id: batch[j].replace(this.getKey('patterns:'), ''),
                ...pattern
              });
            }
          } catch (parseError) {
            this.logger.warn('Failed to parse pattern data', {
              key: batch[j],
              error: parseError.message
            });
          }
        }

        // Stop if we've reached the limit
        if (patterns.length >= limit) break;
      }

      // Sort by relevance (access count and recency)
      patterns.sort((a, b) => {
        const aScore = (a.access_count || 0) + (new Date(a.stored_at).getTime() / 1000000000);
        const bScore = (b.access_count || 0) + (new Date(b.stored_at).getTime() / 1000000000);
        return bScore - aScore;
      });

      const results = patterns.slice(0, limit);

      this.logger.info('Pattern search completed', {
        search_criteria: searchCriteria,
        total_found: patterns.length,
        returned: results.length
      });

      return {
        patterns: results,
        total_found: patterns.length,
        search_criteria: searchCriteria,
        search_time: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Pattern search failed', {
        search_criteria: searchCriteria,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Store message in coordination memory
   */
  async storeMessage(messageData) {
    try {
      const messageId = messageData.id || uuidv4();
      const key = this.getKey(`messages:${messageId}`);
      
      const data = {
        ...messageData,
        stored_at: new Date().toISOString()
      };

      await this.redisClient.setEx(
        key,
        this.memoryCategories.messages.ttl,
        JSON.stringify(data)
      );

      // Add to session message list if session_id exists
      if (messageData.session_id) {
        const sessionMessagesKey = this.getKey(`sessions:${messageData.session_id}:messages`);
        await this.redisClient.lPush(sessionMessagesKey, messageId);
        await this.redisClient.expire(sessionMessagesKey, this.memoryCategories.sessions.ttl);
      }

      // Update message count
      await this.redisClient.incr(this.getKey('messages:count'));
      this.memoryStats.total_messages++;

      this.logger.debug('Message stored in coordination memory', {
        message_id: messageId,
        session_id: messageData.session_id
      });

      return { message_id: messageId, stored_at: data.stored_at };

    } catch (error) {
      this.logger.error('Failed to store message', {
        message_id: messageData.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get messages for a session
   */
  async getSessionMessages(sessionId, limit = 100) {
    try {
      const sessionMessagesKey = this.getKey(`sessions:${sessionId}:messages`);
      const messageIds = await this.redisClient.lRange(sessionMessagesKey, 0, limit - 1);

      if (messageIds.length === 0) {
        return [];
      }

      // Get message data
      const messageKeys = messageIds.map(id => this.getKey(`messages:${id}`));
      const messageData = await this.redisClient.mGet(messageKeys);

      const messages = [];
      for (let i = 0; i < messageData.length; i++) {
        if (messageData[i]) {
          try {
            messages.push(JSON.parse(messageData[i]));
          } catch (parseError) {
            this.logger.warn('Failed to parse message data', {
              message_id: messageIds[i],
              error: parseError.message
            });
          }
        }
      }

      return messages.reverse(); // Return in chronological order

    } catch (error) {
      this.logger.error('Failed to get session messages', {
        session_id: sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Store learning data from AI coordination
   */
  async storeLearning(learningData) {
    try {
      const learningId = learningData.id || uuidv4();
      const key = this.getKey(`learning:${learningId}`);

      const data = {
        ...learningData,
        stored_at: new Date().toISOString(),
        importance_score: this.calculateImportanceScore(learningData)
      };

      await this.redisClient.setEx(
        key,
        this.memoryCategories.learning.ttl,
        JSON.stringify(data)
      );

      // Add to learning index for future retrieval
      await this.addToLearningIndex(learningId, data);

      // Publish learning event
      await this.publishCoordinationEvent('learning-stored', {
        learning_id: learningId,
        learning_type: learningData.type,
        importance_score: data.importance_score,
        stored_at: data.stored_at
      });

      this.logger.info('Learning data stored', {
        learning_id: learningId,
        type: learningData.type,
        importance_score: data.importance_score
      });

      return { learning_id: learningId, stored_at: data.stored_at };

    } catch (error) {
      this.logger.error('Failed to store learning data', {
        learning_id: learningData.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Archive completed session
   */
  async archiveSession(sessionData) {
    try {
      const archiveKey = this.getKey(`archive:sessions:${sessionData.id}`);
      
      const archiveData = {
        ...sessionData,
        archived_at: new Date().toISOString(),
        archive_reason: 'completed'
      };

      // Store in archive with extended TTL
      await this.redisClient.setEx(
        archiveKey,
        this.memoryCategories.learning.ttl, // Use learning TTL for archives
        JSON.stringify(archiveData)
      );

      // Remove from active sessions
      const activeKey = this.getKey(`sessions:${sessionData.id}`);
      await this.redisClient.del(activeKey);
      
      this.memoryStats.active_sessions--;

      // Publish archive event
      await this.publishCoordinationEvent('session-archived', {
        session_id: sessionData.id,
        archived_at: archiveData.archived_at
      });

      this.logger.info('Session archived', {
        session_id: sessionData.id,
        archived_at: archiveData.archived_at
      });

      return { archived_at: archiveData.archived_at };

    } catch (error) {
      this.logger.error('Failed to archive session', {
        session_id: sessionData.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Add pattern to search index
   */
  async addToPatternIndex(patternId, patternData) {
    try {
      // Create searchable index entries
      const indexKeys = [];
      
      if (patternData.type) {
        indexKeys.push(this.getKey(`index:patterns:type:${patternData.type}`));
      }
      
      if (patternData.language) {
        indexKeys.push(this.getKey(`index:patterns:language:${patternData.language}`));
      }
      
      if (patternData.source_system) {
        indexKeys.push(this.getKey(`index:patterns:source:${patternData.source_system}`));
      }

      // Add to all relevant indexes
      for (const indexKey of indexKeys) {
        await this.redisClient.sAdd(indexKey, patternId);
        await this.redisClient.expire(indexKey, this.memoryCategories.patterns.ttl);
      }

      // Add tags to tag index
      if (patternData.tags && patternData.tags.length > 0) {
        for (const tag of patternData.tags) {
          const tagKey = this.getKey(`index:patterns:tag:${tag}`);
          await this.redisClient.sAdd(tagKey, patternId);
          await this.redisClient.expire(tagKey, this.memoryCategories.patterns.ttl);
        }
      }

    } catch (error) {
      this.logger.error('Failed to add pattern to index', {
        pattern_id: patternId,
        error: error.message
      });
    }
  }

  /**
   * Add learning to search index
   */
  async addToLearningIndex(learningId, learningData) {
    try {
      const typeKey = this.getKey(`index:learning:type:${learningData.type}`);
      await this.redisClient.sAdd(typeKey, learningId);
      await this.redisClient.expire(typeKey, this.memoryCategories.learning.ttl);

      // Index by importance score ranges
      const importance = learningData.importance_score || 0;
      let importanceRange = 'low';
      if (importance > 0.7) importanceRange = 'high';
      else if (importance > 0.4) importanceRange = 'medium';

      const importanceKey = this.getKey(`index:learning:importance:${importanceRange}`);
      await this.redisClient.sAdd(importanceKey, learningId);
      await this.redisClient.expire(importanceKey, this.memoryCategories.learning.ttl);

    } catch (error) {
      this.logger.error('Failed to add learning to index', {
        learning_id: learningId,
        error: error.message
      });
    }
  }

  /**
   * Calculate importance score for learning data
   */
  calculateImportanceScore(learningData) {
    let score = 0.5; // Base score

    // Increase score based on type
    const typeScores = {
      'pattern-discovery': 0.8,
      'coordination-insight': 0.7,
      'performance-optimization': 0.9,
      'error-resolution': 0.6,
      'general-learning': 0.3
    };

    score = typeScores[learningData.type] || score;

    // Increase score based on impact metrics
    if (learningData.success_rate > 0.8) score += 0.1;
    if (learningData.performance_improvement > 0.2) score += 0.1;
    if (learningData.usage_frequency > 10) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Publish coordination event
   */
  async publishCoordinationEvent(eventType, eventData) {
    try {
      const event = {
        id: uuidv4(),
        type: eventType,
        data: eventData,
        timestamp: new Date().toISOString(),
        source: 'coordination-memory'
      };

      await this.redisClient.publish(
        `${this.config.key_prefix}events`,
        JSON.stringify(event)
      );

    } catch (error) {
      this.logger.error('Failed to publish coordination event', {
        event_type: eventType,
        error: error.message
      });
    }
  }

  /**
   * Start maintenance tasks
   */
  startMaintenanceTasks() {
    // Update statistics every minute
    setInterval(async () => {
      await this.updateStatistics();
    }, 60000);

    // Clean up expired entries every 10 minutes
    setInterval(async () => {
      await this.cleanupExpiredEntries();
    }, 600000);

    // Backup important data every hour
    setInterval(async () => {
      await this.backupCriticalData();
    }, 3600000);
  }

  /**
   * Update memory statistics
   */
  async updateStatistics() {
    try {
      // Update operation count
      this.memoryStats.operations_count++;

      // Get current memory usage from Redis
      const info = await this.redisClient.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      if (memoryMatch) {
        this.memoryStats.memory_usage = parseInt(memoryMatch[1]);
      }

      // Update statistics in Redis
      await this.redisClient.hSet(this.getKey('stats'), this.memoryStats);

    } catch (error) {
      this.logger.error('Failed to update statistics', { error: error.message });
    }
  }

  /**
   * Cleanup expired entries and indexes
   */
  async cleanupExpiredEntries() {
    try {
      let cleaned = 0;

      // Clean up expired index entries
      const indexKeys = await this.redisClient.keys(this.getKey('index:*'));
      for (const indexKey of indexKeys) {
        const ttl = await this.redisClient.ttl(indexKey);
        if (ttl === -1) { // No expiration set
          await this.redisClient.expire(indexKey, this.config.memory_ttl);
        }
      }

      // Clean up orphaned entries
      // This is a simplified cleanup - in production, you might want more sophisticated logic
      
      this.logger.info('Memory cleanup completed', { entries_cleaned: cleaned });

    } catch (error) {
      this.logger.error('Memory cleanup failed', { error: error.message });
    }
  }

  /**
   * Backup critical coordination data
   */
  async backupCriticalData() {
    try {
      // This is a placeholder for backup logic
      // In production, you might want to backup to persistent storage
      this.logger.debug('Critical data backup completed');

    } catch (error) {
      this.logger.error('Backup failed', { error: error.message });
    }
  }

  /**
   * Generate Redis key with prefix
   */
  getKey(suffix) {
    return `${this.config.key_prefix}${suffix}`;
  }

  /**
   * Get memory statistics
   */
  async getStats() {
    try {
      // Get fresh statistics from Redis
      const redisStats = await this.redisClient.hGetAll(this.getKey('stats'));
      
      return {
        ...this.memoryStats,
        ...redisStats,
        redis_connected: this.redisClient.isReady,
        is_ready: this.isReady,
        categories: Object.keys(this.memoryCategories),
        memory_usage_mb: Math.round(this.memoryStats.memory_usage / 1024 / 1024)
      };

    } catch (error) {
      this.logger.error('Failed to get statistics', { error: error.message });
      return { ...this.memoryStats, is_ready: this.isReady };
    }
  }

  /**
   * Check if memory system is ready
   */
  isReady() {
    return this.isReady && this.redisClient?.isReady;
  }

  /**
   * Close Redis connections
   */
  async close() {
    try {
      if (this.subscriberClient) {
        await this.subscriberClient.disconnect();
      }
      if (this.redisClient) {
        await this.redisClient.disconnect();
      }
      this.isReady = false;
      this.logger.info('Coordination Memory closed');
    } catch (error) {
      this.logger.error('Error closing Coordination Memory', { error: error.message });
    }
  }
}