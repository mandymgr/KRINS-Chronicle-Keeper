/**
 * 🌉 KRINS Event Bus
 * Revolutionary real-time event coordination system for AI-to-AI communication
 */

import EventEmitter from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';

export class EventBus extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      max_listeners: config.max_listeners || 1000,
      event_ttl: config.event_ttl || 300000, // 5 minutes
      history_size: config.history_size || 10000,
      batch_size: config.batch_size || 100,
      replay_buffer_size: config.replay_buffer_size || 1000,
      priority_levels: config.priority_levels || ['low', 'normal', 'high', 'critical'],
      ...config
    };

    // Event management
    this.eventHistory = [];
    this.eventSubscriptions = new Map(); // subscriber_id -> subscription details
    this.eventFilters = new Map(); // subscriber_id -> filter functions
    this.eventQueues = new Map(); // priority -> event queue
    this.replayBuffer = []; // Buffer for new subscribers

    // Event categories and their handlers
    this.eventCategories = new Set([
      'ai-system-registered',
      'ai-system-disconnected',
      'coordination-session-started',
      'coordination-session-completed',
      'pattern-discovered',
      'pattern-synchronized',
      'message-routed',
      'learning-stored',
      'error-occurred',
      'performance-alert',
      'system-health-update'
    ]);

    // Performance metrics
    this.eventStats = {
      events_published: 0,
      events_delivered: 0,
      events_filtered: 0,
      active_subscribers: 0,
      average_delivery_time: 0,
      failed_deliveries: 0,
      replay_requests: 0
    };

    // Initialize priority queues
    this.config.priority_levels.forEach(level => {
      this.eventQueues.set(level, []);
    });

    this.isReady = false;

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [EventBus] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });

    // Set max listeners to prevent memory leak warnings
    this.setMaxListeners(this.config.max_listeners);
  }

  /**
   * Initialize the event bus
   */
  async initialize() {
    try {
      this.logger.info('Initializing KRINS Event Bus...');
      
      // Start event processing loops
      this.startEventProcessor();
      this.startMaintenanceTasks();
      
      // Setup default event handlers
      this.setupDefaultHandlers();
      
      this.isReady = true;
      this.logger.info('Event Bus initialized successfully', {
        max_listeners: this.config.max_listeners,
        event_categories: this.eventCategories.size,
        priority_levels: this.config.priority_levels
      });
      
    } catch (error) {
      this.logger.error('Event Bus initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Subscribe to events with optional filtering
   */
  subscribe(subscriberId, eventTypes, options = {}) {
    try {
      const {
        filter_function = null,
        priority_filter = [],
        replay_events = false,
        batch_delivery = false,
        max_batch_size = this.config.batch_size
      } = options;

      // Validate event types
      const validEventTypes = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
      const invalidTypes = validEventTypes.filter(type => 
        type !== '*' && !this.eventCategories.has(type)
      );

      if (invalidTypes.length > 0) {
        throw new Error(`Invalid event types: ${invalidTypes.join(', ')}`);
      }

      // Create subscription record
      const subscription = {
        id: subscriberId,
        event_types: validEventTypes,
        subscribed_at: new Date(),
        last_event_received: null,
        events_received: 0,
        filter_function,
        priority_filter,
        batch_delivery,
        max_batch_size,
        event_batch: []
      };

      this.eventSubscriptions.set(subscriberId, subscription);
      
      // Store filter function separately for performance
      if (filter_function && typeof filter_function === 'function') {
        this.eventFilters.set(subscriberId, filter_function);
      }

      // Add event listeners for each event type
      for (const eventType of validEventTypes) {
        if (eventType === '*') {
          // Subscribe to all events
          this.eventCategories.forEach(category => {
            this.addListener(category, (eventData) => {
              this.deliverEventToSubscriber(subscriberId, category, eventData);
            });
          });
        } else {
          this.addListener(eventType, (eventData) => {
            this.deliverEventToSubscriber(subscriberId, eventType, eventData);
          });
        }
      }

      this.eventStats.active_subscribers++;

      this.logger.info('Event subscription created', {
        subscriber_id: subscriberId,
        event_types: validEventTypes,
        has_filter: !!filter_function,
        batch_delivery
      });

      // Replay recent events if requested
      if (replay_events) {
        this.replayEventsForSubscriber(subscriberId, subscription);
      }

      return {
        subscription_id: subscriberId,
        subscribed_events: validEventTypes,
        subscribed_at: subscription.subscribed_at
      };

    } catch (error) {
      this.logger.error('Event subscription failed', {
        subscriber_id: subscriberId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriberId) {
    try {
      const subscription = this.eventSubscriptions.get(subscriberId);
      if (!subscription) {
        this.logger.warn('Subscription not found', { subscriber_id: subscriberId });
        return false;
      }

      // Remove all event listeners for this subscriber
      for (const eventType of subscription.event_types) {
        if (eventType === '*') {
          this.eventCategories.forEach(category => {
            this.removeAllListeners(category);
          });
        } else {
          this.removeAllListeners(eventType);
        }
      }

      // Clean up subscription data
      this.eventSubscriptions.delete(subscriberId);
      this.eventFilters.delete(subscriberId);
      
      this.eventStats.active_subscribers--;

      this.logger.info('Event subscription removed', {
        subscriber_id: subscriberId,
        events_received: subscription.events_received
      });

      return true;

    } catch (error) {
      this.logger.error('Event unsubscription failed', {
        subscriber_id: subscriberId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Publish event to the bus
   */
  async publishEvent(eventType, eventData, options = {}) {
    const eventId = uuidv4();
    const publishStart = Date.now();

    try {
      const {
        priority = 'normal',
        source = 'unknown',
        metadata = {},
        batch_publish = false,
        ttl = this.config.event_ttl
      } = options;

      // Validate event type
      if (!this.eventCategories.has(eventType)) {
        this.logger.warn('Publishing unregistered event type', { event_type: eventType });
        this.eventCategories.add(eventType); // Auto-register
      }

      // Validate priority
      if (!this.config.priority_levels.includes(priority)) {
        throw new Error(`Invalid priority level: ${priority}`);
      }

      // Create event object
      const event = {
        id: eventId,
        type: eventType,
        data: eventData,
        metadata: {
          ...metadata,
          source,
          priority,
          published_at: new Date().toISOString(),
          ttl: new Date(Date.now() + ttl).toISOString(),
          version: '1.0.0'
        }
      };

      // Add to event history
      this.addToEventHistory(event);

      // Add to replay buffer for new subscribers
      this.addToReplayBuffer(event);

      // Queue for delivery based on priority
      if (batch_publish) {
        this.queueEventForBatch(event);
      } else {
        await this.deliverEventImmediately(event);
      }

      this.eventStats.events_published++;
      const publishTime = Date.now() - publishStart;

      // Update average delivery time
      this.updateAverageDeliveryTime(publishTime);

      this.logger.info('Event published', {
        event_id: eventId,
        event_type: eventType,
        priority,
        source,
        publish_time: `${publishTime}ms`,
        listeners: this.listenerCount(eventType)
      });

      return {
        event_id: eventId,
        published_at: event.metadata.published_at,
        delivered_to: this.listenerCount(eventType),
        publish_time: publishTime
      };

    } catch (error) {
      this.logger.error('Event publishing failed', {
        event_id: eventId,
        event_type: eventType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Deliver event to specific subscriber
   */
  async deliverEventToSubscriber(subscriberId, eventType, eventData) {
    const deliveryStart = Date.now();

    try {
      const subscription = this.eventSubscriptions.get(subscriberId);
      if (!subscription) {
        this.logger.warn('Subscription not found for delivery', {
          subscriber_id: subscriberId,
          event_type: eventType
        });
        return;
      }

      // Apply filters
      const shouldDeliver = this.shouldDeliverEvent(subscriberId, eventType, eventData);
      if (!shouldDeliver) {
        this.eventStats.events_filtered++;
        return;
      }

      // Update subscription statistics
      subscription.events_received++;
      subscription.last_event_received = new Date();

      // Batch delivery if configured
      if (subscription.batch_delivery) {
        subscription.event_batch.push({
          type: eventType,
          data: eventData,
          delivered_at: new Date().toISOString()
        });

        if (subscription.event_batch.length >= subscription.max_batch_size) {
          await this.deliverEventBatch(subscriberId, subscription.event_batch);
          subscription.event_batch = [];
        }
      } else {
        // Immediate delivery
        await this.deliverSingleEvent(subscriberId, eventType, eventData);
      }

      this.eventStats.events_delivered++;
      
      const deliveryTime = Date.now() - deliveryStart;
      this.logger.debug('Event delivered to subscriber', {
        subscriber_id: subscriberId,
        event_type: eventType,
        delivery_time: `${deliveryTime}ms`
      });

    } catch (error) {
      this.eventStats.failed_deliveries++;
      this.logger.error('Event delivery failed', {
        subscriber_id: subscriberId,
        event_type: eventType,
        error: error.message
      });
    }
  }

  /**
   * Check if event should be delivered to subscriber
   */
  shouldDeliverEvent(subscriberId, eventType, eventData) {
    const subscription = this.eventSubscriptions.get(subscriberId);
    if (!subscription) return false;

    // Check priority filter
    if (subscription.priority_filter.length > 0) {
      const eventPriority = eventData.metadata?.priority || 'normal';
      if (!subscription.priority_filter.includes(eventPriority)) {
        return false;
      }
    }

    // Apply custom filter function
    const filterFunction = this.eventFilters.get(subscriberId);
    if (filterFunction) {
      try {
        return filterFunction(eventType, eventData);
      } catch (filterError) {
        this.logger.error('Filter function error', {
          subscriber_id: subscriberId,
          error: filterError.message
        });
        return true; // Default to delivering on filter error
      }
    }

    return true;
  }

  /**
   * Deliver single event immediately
   */
  async deliverSingleEvent(subscriberId, eventType, eventData) {
    // This would typically integrate with WebSocket or HTTP delivery
    // For now, we just emit the event
    this.emit(`delivery:${subscriberId}`, {
      event_type: eventType,
      event_data: eventData,
      delivered_at: new Date().toISOString()
    });
  }

  /**
   * Deliver batch of events
   */
  async deliverEventBatch(subscriberId, eventBatch) {
    this.emit(`batch-delivery:${subscriberId}`, {
      events: eventBatch,
      batch_size: eventBatch.length,
      delivered_at: new Date().toISOString()
    });

    this.logger.info('Event batch delivered', {
      subscriber_id: subscriberId,
      batch_size: eventBatch.length
    });
  }

  /**
   * Deliver event immediately to all listeners
   */
  async deliverEventImmediately(event) {
    // Emit to all listeners of this event type
    this.emit(event.type, event.data, event.metadata);
    
    // Also emit to wildcard listeners
    this.emit('*', event);
  }

  /**
   * Queue event for batch delivery
   */
  queueEventForBatch(event) {
    const priority = event.metadata.priority;
    const queue = this.eventQueues.get(priority);
    
    if (queue) {
      queue.push(event);
      
      if (queue.length >= this.config.batch_size) {
        this.processBatchQueue(priority);
      }
    }
  }

  /**
   * Process batch queue for specific priority
   */
  async processBatchQueue(priority) {
    const queue = this.eventQueues.get(priority);
    if (!queue || queue.length === 0) return;

    const events = queue.splice(0, this.config.batch_size);
    
    for (const event of events) {
      await this.deliverEventImmediately(event);
    }

    this.logger.debug('Batch queue processed', {
      priority,
      events_processed: events.length,
      remaining_in_queue: queue.length
    });
  }

  /**
   * Add event to history
   */
  addToEventHistory(event) {
    this.eventHistory.push(event);
    
    // Limit history size
    if (this.eventHistory.length > this.config.history_size) {
      this.eventHistory.shift();
    }
  }

  /**
   * Add event to replay buffer
   */
  addToReplayBuffer(event) {
    this.replayBuffer.push(event);
    
    // Limit replay buffer size
    if (this.replayBuffer.length > this.config.replay_buffer_size) {
      this.replayBuffer.shift();
    }
  }

  /**
   * Replay events for new subscriber
   */
  async replayEventsForSubscriber(subscriberId, subscription) {
    try {
      this.eventStats.replay_requests++;
      
      const relevantEvents = this.replayBuffer.filter(event => {
        return subscription.event_types.includes('*') || 
               subscription.event_types.includes(event.type);
      });

      this.logger.info('Replaying events for subscriber', {
        subscriber_id: subscriberId,
        events_to_replay: relevantEvents.length,
        total_buffer_size: this.replayBuffer.length
      });

      for (const event of relevantEvents) {
        await this.deliverEventToSubscriber(subscriberId, event.type, event.data);
        
        // Small delay to prevent overwhelming the subscriber
        await new Promise(resolve => setTimeout(resolve, 10));
      }

    } catch (error) {
      this.logger.error('Event replay failed', {
        subscriber_id: subscriberId,
        error: error.message
      });
    }
  }

  /**
   * Setup default event handlers
   */
  setupDefaultHandlers() {
    // Handle system health events
    this.on('system-health-update', (data) => {
      if (data.status === 'critical') {
        this.publishEvent('performance-alert', {
          alert_type: 'system-critical',
          details: data,
          severity: 'high'
        }, { priority: 'critical' });
      }
    });

    // Handle error events
    this.on('error-occurred', (data) => {
      this.logger.error('System error event', data);
      
      // Publish performance alert for critical errors
      if (data.severity === 'critical') {
        this.publishEvent('performance-alert', {
          alert_type: 'critical-error',
          error: data,
          requires_attention: true
        }, { priority: 'critical' });
      }
    });

    // Log all coordination events
    this.on('coordination-session-started', (data) => {
      this.logger.info('Coordination session started via event bus', {
        session_id: data.session_id
      });
    });

    this.on('coordination-session-completed', (data) => {
      this.logger.info('Coordination session completed via event bus', {
        session_id: data.session_id,
        duration: data.duration
      });
    });
  }

  /**
   * Start event processing loops
   */
  startEventProcessor() {
    // Process batch queues periodically
    setInterval(() => {
      for (const priority of this.config.priority_levels) {
        this.processBatchQueue(priority);
      }
    }, 1000); // Every second

    // Deliver pending batches for subscribers
    setInterval(() => {
      this.deliverPendingBatches();
    }, 5000); // Every 5 seconds

    this.logger.info('Event processor started');
  }

  /**
   * Deliver pending batches for all subscribers
   */
  async deliverPendingBatches() {
    for (const [subscriberId, subscription] of this.eventSubscriptions) {
      if (subscription.batch_delivery && subscription.event_batch.length > 0) {
        await this.deliverEventBatch(subscriberId, subscription.event_batch);
        subscription.event_batch = [];
      }
    }
  }

  /**
   * Start maintenance tasks
   */
  startMaintenanceTasks() {
    // Clean up expired events
    setInterval(() => {
      this.cleanupExpiredEvents();
    }, 300000); // Every 5 minutes

    // Update performance statistics
    setInterval(() => {
      this.updatePerformanceStats();
    }, 60000); // Every minute

    // Health check for subscribers
    setInterval(() => {
      this.checkSubscriberHealth();
    }, 120000); // Every 2 minutes
  }

  /**
   * Clean up expired events
   */
  cleanupExpiredEvents() {
    const now = new Date();
    let cleaned = 0;

    // Clean event history
    this.eventHistory = this.eventHistory.filter(event => {
      const ttl = new Date(event.metadata.ttl);
      const isExpired = now > ttl;
      if (isExpired) cleaned++;
      return !isExpired;
    });

    // Clean replay buffer
    this.replayBuffer = this.replayBuffer.filter(event => {
      const ttl = new Date(event.metadata.ttl);
      const isExpired = now > ttl;
      if (isExpired) cleaned++;
      return !isExpired;
    });

    if (cleaned > 0) {
      this.logger.info('Cleaned up expired events', { events_cleaned: cleaned });
    }
  }

  /**
   * Update performance statistics
   */
  updatePerformanceStats() {
    // Calculate performance metrics
    const totalSubscriptions = this.eventSubscriptions.size;
    const totalEvents = this.eventHistory.length;
    
    this.logger.debug('Event Bus performance stats', {
      active_subscribers: totalSubscriptions,
      events_in_history: totalEvents,
      events_published: this.eventStats.events_published,
      events_delivered: this.eventStats.events_delivered,
      average_delivery_time: `${this.eventStats.average_delivery_time}ms`
    });
  }

  /**
   * Check health of subscribers
   */
  checkSubscriberHealth() {
    const now = new Date();
    const staleThreshold = 300000; // 5 minutes

    for (const [subscriberId, subscription] of this.eventSubscriptions) {
      if (subscription.last_event_received) {
        const timeSinceLastEvent = now - subscription.last_event_received;
        
        if (timeSinceLastEvent > staleThreshold && subscription.events_received === 0) {
          this.logger.warn('Potentially stale subscriber detected', {
            subscriber_id: subscriberId,
            subscribed_at: subscription.subscribed_at,
            last_event: subscription.last_event_received,
            events_received: subscription.events_received
          });
        }
      }
    }
  }

  /**
   * Update average delivery time
   */
  updateAverageDeliveryTime(newTime) {
    const totalEvents = this.eventStats.events_published;
    if (totalEvents === 0) {
      this.eventStats.average_delivery_time = newTime;
    } else {
      this.eventStats.average_delivery_time = 
        ((this.eventStats.average_delivery_time * (totalEvents - 1)) + newTime) / totalEvents;
    }
  }

  /**
   * Get event statistics
   */
  async getStats() {
    return {
      ...this.eventStats,
      event_history_size: this.eventHistory.length,
      replay_buffer_size: this.replayBuffer.length,
      registered_event_types: this.eventCategories.size,
      priority_queue_sizes: Object.fromEntries(
        Array.from(this.eventQueues.entries()).map(([priority, queue]) => [priority, queue.length])
      ),
      is_ready: this.isReady
    };
  }

  /**
   * Get event history
   */
  getEventHistory(filter = {}) {
    const { event_type, since, limit = 100 } = filter;
    
    let filteredHistory = this.eventHistory;

    if (event_type) {
      filteredHistory = filteredHistory.filter(event => event.type === event_type);
    }

    if (since) {
      const sinceDate = new Date(since);
      filteredHistory = filteredHistory.filter(event => 
        new Date(event.metadata.published_at) >= sinceDate
      );
    }

    return filteredHistory.slice(-limit);
  }

  /**
   * Register new event category
   */
  registerEventCategory(category, description = '') {
    this.eventCategories.add(category);
    this.logger.info('Event category registered', { category, description });
  }

  /**
   * Check if event bus is ready
   */
  isReady() {
    return this.isReady;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.logger.info('Shutting down Event Bus...');
    
    // Remove all listeners
    this.removeAllListeners();
    
    // Clear data structures
    this.eventSubscriptions.clear();
    this.eventFilters.clear();
    this.eventHistory.length = 0;
    this.replayBuffer.length = 0;
    
    this.isReady = false;
    this.logger.info('Event Bus shutdown completed');
  }
}