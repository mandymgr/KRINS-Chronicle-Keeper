/**
 * 🌉 KRINS AI Message Router
 * Revolutionary intelligent message routing between AI systems
 */

import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';
import EventEmitter from 'eventemitter3';

export class AIMessageRouter extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      max_queue_size: config.max_queue_size || 10000,
      message_ttl: config.message_ttl || 300000, // 5 minutes
      retry_attempts: config.retry_attempts || 3,
      retry_delay: config.retry_delay || 5000, // 5 seconds
      priority_levels: config.priority_levels || ['low', 'normal', 'high', 'critical'],
      ...config
    };

    // Message queues by priority
    this.messageQueues = new Map();
    this.config.priority_levels.forEach(level => {
      this.messageQueues.set(level, []);
    });

    // Active message tracking
    this.activeMessages = new Map();
    this.messageHistory = [];
    this.failedMessages = new Map();

    // Routing tables
    this.routingTable = new Map(); // system_id -> connection details
    this.capabilityRouting = new Map(); // capability -> [system_ids]
    
    // Performance metrics
    this.routingStats = {
      messages_routed: 0,
      messages_failed: 0,
      average_routing_time: 0,
      queue_sizes: {},
      retry_statistics: {
        total_retries: 0,
        successful_retries: 0,
        failed_retries: 0
      }
    };

    this.isReady = false;

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [MessageRouter] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });
  }

  /**
   * Initialize the message router
   */
  async initialize() {
    try {
      this.logger.info('Initializing AI Message Router...');
      
      // Start message processing loops
      this.startMessageProcessor();
      this.startMaintenanceTasks();
      
      this.isReady = true;
      this.logger.info('AI Message Router initialized successfully');
      
    } catch (error) {
      this.logger.error('Message Router initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Register AI system for routing
   */
  registerAISystem(systemId, systemInfo) {
    const routingInfo = {
      id: systemId,
      name: systemInfo.name,
      capabilities: systemInfo.capabilities || [],
      endpoint: systemInfo.endpoint,
      connection_type: systemInfo.connection_type || 'http',
      websocket_connection: systemInfo.websocket_connection || null,
      status: 'active',
      registered_at: new Date(),
      last_message: null,
      message_count: 0,
      response_times: []
    };

    this.routingTable.set(systemId, routingInfo);

    // Update capability routing
    routingInfo.capabilities.forEach(capability => {
      if (!this.capabilityRouting.has(capability)) {
        this.capabilityRouting.set(capability, []);
      }
      this.capabilityRouting.get(capability).push(systemId);
    });

    this.logger.info('AI system registered for routing', {
      system_id: systemId,
      capabilities: routingInfo.capabilities,
      connection_type: routingInfo.connection_type
    });

    this.emit('system-registered', routingInfo);
  }

  /**
   * Route message between AI systems
   */
  async routeMessage(messageRequest) {
    const startTime = Date.now();
    const messageId = uuidv4();

    try {
      const message = {
        id: messageId,
        from: messageRequest.from,
        to: messageRequest.to,
        type: messageRequest.type,
        content: messageRequest.content,
        session_id: messageRequest.session_id,
        priority: messageRequest.priority || 'normal',
        created_at: new Date(),
        ttl: new Date(Date.now() + this.config.message_ttl),
        attempts: 0,
        routing_metadata: {
          start_time: startTime,
          routing_strategy: 'direct'
        }
      };

      this.logger.info('Routing message', {
        message_id: messageId,
        from: message.from,
        to: message.to,
        type: message.type,
        priority: message.priority
      });

      // Validate message
      const validation = this.validateMessage(message);
      if (!validation.valid) {
        throw new Error(`Message validation failed: ${validation.error}`);
      }

      // Determine routing strategy
      const routingStrategy = this.determineRoutingStrategy(message);
      message.routing_metadata.routing_strategy = routingStrategy;

      // Route based on strategy
      let routingResult;
      switch (routingStrategy) {
        case 'direct':
          routingResult = await this.routeDirectMessage(message);
          break;
        case 'capability':
          routingResult = await this.routeByCapability(message);
          break;
        case 'broadcast':
          routingResult = await this.broadcastMessage(message);
          break;
        case 'queue':
          routingResult = await this.queueMessage(message);
          break;
        default:
          throw new Error(`Unknown routing strategy: ${routingStrategy}`);
      }

      // Track message
      this.activeMessages.set(messageId, {
        ...message,
        routing_result: routingResult,
        routing_time: Date.now() - startTime
      });

      // Update statistics
      this.routingStats.messages_routed++;
      this.updateAverageRoutingTime(Date.now() - startTime);

      this.emit('message-routed', {
        message,
        routing_result: routingResult,
        routing_time: Date.now() - startTime
      });

      this.logger.info('Message routed successfully', {
        message_id: messageId,
        routing_strategy: routingStrategy,
        routing_time: `${Date.now() - startTime}ms`
      });

      return {
        ...message,
        routing_result: routingResult
      };

    } catch (error) {
      this.routingStats.messages_failed++;
      this.logger.error('Message routing failed', {
        message_id: messageId,
        error: error.message
      });

      // Store failed message for retry
      this.failedMessages.set(messageId, {
        message: messageRequest,
        error: error.message,
        failed_at: new Date(),
        retry_count: 0
      });

      throw error;
    }
  }

  /**
   * Validate message before routing
   */
  validateMessage(message) {
    if (!message.from) {
      return { valid: false, error: 'Missing sender (from)' };
    }

    if (!message.to && message.routing_metadata?.routing_strategy !== 'broadcast') {
      return { valid: false, error: 'Missing recipient (to)' };
    }

    if (!message.type) {
      return { valid: false, error: 'Missing message type' };
    }

    if (!message.content) {
      return { valid: false, error: 'Missing message content' };
    }

    if (!this.config.priority_levels.includes(message.priority)) {
      return { valid: false, error: `Invalid priority level: ${message.priority}` };
    }

    // Check if sender is registered
    if (!this.routingTable.has(message.from)) {
      return { valid: false, error: `Sender not registered: ${message.from}` };
    }

    // Check if recipient is registered (for direct routing)
    if (message.to && !this.routingTable.has(message.to)) {
      return { valid: false, error: `Recipient not registered: ${message.to}` };
    }

    return { valid: true };
  }

  /**
   * Determine optimal routing strategy
   */
  determineRoutingStrategy(message) {
    // Specific recipient - direct routing
    if (message.to && this.routingTable.has(message.to)) {
      const recipientStatus = this.routingTable.get(message.to).status;
      if (recipientStatus === 'active') {
        return 'direct';
      } else {
        return 'queue'; // Queue if recipient is not active
      }
    }

    // No specific recipient but has capability requirements
    if (message.capability_requirements && message.capability_requirements.length > 0) {
      return 'capability';
    }

    // Broadcast type messages
    if (message.type === 'broadcast' || message.type === 'coordination-announcement') {
      return 'broadcast';
    }

    // Default to queueing for processing
    return 'queue';
  }

  /**
   * Route message directly to specific AI system
   */
  async routeDirectMessage(message) {
    const recipient = this.routingTable.get(message.to);
    
    if (!recipient) {
      throw new Error(`Recipient not found: ${message.to}`);
    }

    if (recipient.status !== 'active') {
      throw new Error(`Recipient not active: ${message.to}`);
    }

    try {
      const deliveryResult = await this.deliverMessage(recipient, message);
      
      // Update recipient statistics
      recipient.last_message = new Date();
      recipient.message_count++;
      
      return {
        strategy: 'direct',
        recipient: recipient.id,
        delivery_status: 'delivered',
        delivery_result: deliveryResult
      };

    } catch (error) {
      this.logger.error('Direct message delivery failed', {
        message_id: message.id,
        recipient: message.to,
        error: error.message
      });
      
      // Queue for retry
      await this.queueMessageForRetry(message, error);
      
      return {
        strategy: 'direct',
        recipient: recipient.id,
        delivery_status: 'failed',
        error: error.message,
        queued_for_retry: true
      };
    }
  }

  /**
   * Route message by capability requirements
   */
  async routeByCapability(message) {
    const requiredCapabilities = message.capability_requirements || [];
    const suitableRecipients = [];

    // Find AI systems with required capabilities
    for (const capability of requiredCapabilities) {
      const systemsWithCapability = this.capabilityRouting.get(capability) || [];
      
      for (const systemId of systemsWithCapability) {
        const system = this.routingTable.get(systemId);
        if (system && system.status === 'active' && !suitableRecipients.includes(system)) {
          suitableRecipients.push(system);
        }
      }
    }

    if (suitableRecipients.length === 0) {
      throw new Error(`No active AI systems found with required capabilities: ${requiredCapabilities.join(', ')}`);
    }

    // Select best recipient based on load and response time
    const selectedRecipient = this.selectOptimalRecipient(suitableRecipients, message);
    
    try {
      const deliveryResult = await this.deliverMessage(selectedRecipient, {
        ...message,
        to: selectedRecipient.id // Set the selected recipient
      });

      return {
        strategy: 'capability',
        selected_recipient: selectedRecipient.id,
        suitable_recipients: suitableRecipients.map(r => r.id),
        delivery_status: 'delivered',
        delivery_result: deliveryResult
      };

    } catch (error) {
      this.logger.error('Capability-based routing failed', {
        message_id: message.id,
        selected_recipient: selectedRecipient.id,
        error: error.message
      });
      
      // Try next suitable recipient
      const remainingRecipients = suitableRecipients.filter(r => r.id !== selectedRecipient.id);
      if (remainingRecipients.length > 0) {
        return await this.tryAlternativeRecipients(message, remainingRecipients);
      }
      
      throw error;
    }
  }

  /**
   * Broadcast message to multiple AI systems
   */
  async broadcastMessage(message) {
    const activeRecipients = Array.from(this.routingTable.values())
      .filter(system => system.status === 'active' && system.id !== message.from);

    if (activeRecipients.length === 0) {
      throw new Error('No active AI systems available for broadcast');
    }

    const deliveryResults = [];
    const failures = [];

    // Parallel delivery to all active systems
    const deliveryPromises = activeRecipients.map(async (recipient) => {
      try {
        const result = await this.deliverMessage(recipient, {
          ...message,
          to: recipient.id
        });
        
        deliveryResults.push({
          recipient: recipient.id,
          status: 'delivered',
          result
        });
        
      } catch (error) {
        failures.push({
          recipient: recipient.id,
          status: 'failed',
          error: error.message
        });
        
        this.logger.warn('Broadcast delivery failed to recipient', {
          message_id: message.id,
          recipient: recipient.id,
          error: error.message
        });
      }
    });

    await Promise.allSettled(deliveryPromises);

    return {
      strategy: 'broadcast',
      total_recipients: activeRecipients.length,
      successful_deliveries: deliveryResults.length,
      failed_deliveries: failures.length,
      delivery_results: deliveryResults,
      failures
    };
  }

  /**
   * Queue message for later processing
   */
  async queueMessage(message) {
    const priority = message.priority || 'normal';
    const queue = this.messageQueues.get(priority);

    if (!queue) {
      throw new Error(`Invalid priority level: ${priority}`);
    }

    if (queue.length >= this.config.max_queue_size) {
      throw new Error(`Message queue full for priority: ${priority}`);
    }

    // Add to appropriate priority queue
    queue.push({
      ...message,
      queued_at: new Date(),
      queue_priority: priority
    });

    // Update queue size statistics
    this.updateQueueSizeStats();

    this.logger.info('Message queued', {
      message_id: message.id,
      priority,
      queue_size: queue.length
    });

    return {
      strategy: 'queue',
      priority,
      queue_position: queue.length,
      estimated_processing_time: this.estimateProcessingTime(priority, queue.length)
    };
  }

  /**
   * Select optimal recipient based on performance metrics
   */
  selectOptimalRecipient(recipients, message) {
    // Simple load-based selection (can be enhanced with more sophisticated algorithms)
    return recipients.reduce((best, current) => {
      const bestLoad = best.message_count / (best.capabilities.length || 1);
      const currentLoad = current.message_count / (current.capabilities.length || 1);
      
      const bestAvgResponseTime = this.calculateAverageResponseTime(best);
      const currentAvgResponseTime = this.calculateAverageResponseTime(current);
      
      // Prefer lower load and faster response times
      const bestScore = bestLoad + (bestAvgResponseTime / 1000);
      const currentScore = currentLoad + (currentAvgResponseTime / 1000);
      
      return currentScore < bestScore ? current : best;
    });
  }

  /**
   * Calculate average response time for AI system
   */
  calculateAverageResponseTime(system) {
    if (!system.response_times || system.response_times.length === 0) {
      return 1000; // Default 1 second
    }
    
    const sum = system.response_times.reduce((acc, time) => acc + time, 0);
    return sum / system.response_times.length;
  }

  /**
   * Deliver message to specific AI system
   */
  async deliverMessage(recipient, message) {
    const deliveryStart = Date.now();

    try {
      let deliveryResult;

      // Deliver via WebSocket if available
      if (recipient.websocket_connection && recipient.websocket_connection.readyState === 1) {
        deliveryResult = await this.deliverViaWebSocket(recipient, message);
      } 
      // Fallback to HTTP delivery
      else if (recipient.endpoint) {
        deliveryResult = await this.deliverViaHTTP(recipient, message);
      } 
      else {
        throw new Error(`No delivery method available for recipient: ${recipient.id}`);
      }

      // Record response time
      const responseTime = Date.now() - deliveryStart;
      if (!recipient.response_times) recipient.response_times = [];
      recipient.response_times.push(responseTime);
      
      // Keep only last 100 response times for moving average
      if (recipient.response_times.length > 100) {
        recipient.response_times = recipient.response_times.slice(-100);
      }

      return deliveryResult;

    } catch (error) {
      this.logger.error('Message delivery failed', {
        message_id: message.id,
        recipient: recipient.id,
        delivery_time: Date.now() - deliveryStart,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Deliver message via WebSocket
   */
  async deliverViaWebSocket(recipient, message) {
    return new Promise((resolve, reject) => {
      try {
        const wsMessage = JSON.stringify({
          type: 'ai-message',
          data: message,
          timestamp: new Date().toISOString()
        });

        recipient.websocket_connection.send(wsMessage);
        
        // For now, assume successful delivery (could implement acknowledgment system)
        resolve({
          delivery_method: 'websocket',
          delivered_at: new Date(),
          message_size: wsMessage.length
        });

      } catch (error) {
        reject(new Error(`WebSocket delivery failed: ${error.message}`));
      }
    });
  }

  /**
   * Deliver message via HTTP
   */
  async deliverViaHTTP(recipient, message) {
    const response = await fetch(`${recipient.endpoint}/api/messages/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Message-ID': message.id,
        'X-Sender-ID': message.from
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`HTTP delivery failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    return {
      delivery_method: 'http',
      delivered_at: new Date(),
      response_status: response.status,
      response_data: responseData
    };
  }

  /**
   * Start message processing loops
   */
  startMessageProcessor() {
    // Process messages by priority (highest priority first)
    const processPriorityQueue = async (priority) => {
      const queue = this.messageQueues.get(priority);
      if (!queue || queue.length === 0) return;

      const message = queue.shift(); // FIFO within priority
      
      if (new Date() > message.ttl) {
        this.logger.warn('Message expired in queue', {
          message_id: message.id,
          priority,
          expired_at: message.ttl
        });
        return;
      }

      try {
        // Re-route the queued message
        await this.routeMessage(message);
      } catch (error) {
        this.logger.error('Queued message processing failed', {
          message_id: message.id,
          error: error.message
        });
      }
    };

    // Process queues in priority order
    setInterval(async () => {
      for (const priority of ['critical', 'high', 'normal', 'low']) {
        await processPriorityQueue(priority);
      }
    }, 100); // Process every 100ms

    this.logger.info('Message processor started');
  }

  /**
   * Start maintenance tasks
   */
  startMaintenanceTasks() {
    // Clean up expired messages
    setInterval(() => {
      this.cleanupExpiredMessages();
    }, 60000); // Every minute

    // Retry failed messages
    setInterval(() => {
      this.retryFailedMessages();
    }, 30000); // Every 30 seconds

    // Update queue size statistics
    setInterval(() => {
      this.updateQueueSizeStats();
    }, 10000); // Every 10 seconds
  }

  /**
   * Clean up expired messages
   */
  cleanupExpiredMessages() {
    const now = new Date();
    let cleaned = 0;

    // Clean active messages
    for (const [messageId, messageData] of this.activeMessages) {
      if (now > messageData.ttl) {
        this.activeMessages.delete(messageId);
        cleaned++;
      }
    }

    // Clean message queues
    for (const [priority, queue] of this.messageQueues) {
      const initialSize = queue.length;
      const validMessages = queue.filter(message => now <= message.ttl);
      this.messageQueues.set(priority, validMessages);
      cleaned += initialSize - validMessages.length;
    }

    if (cleaned > 0) {
      this.logger.info('Cleaned up expired messages', { messages_cleaned: cleaned });
    }
  }

  /**
   * Retry failed messages
   */
  async retryFailedMessages() {
    const now = new Date();
    const retryPromises = [];

    for (const [messageId, failedData] of this.failedMessages) {
      if (failedData.retry_count >= this.config.retry_attempts) {
        // Max retries reached, remove from failed messages
        this.failedMessages.delete(messageId);
        this.routingStats.retry_statistics.failed_retries++;
        continue;
      }

      const timeSinceFailure = now - failedData.failed_at;
      if (timeSinceFailure >= this.config.retry_delay * (failedData.retry_count + 1)) {
        // Time for retry
        failedData.retry_count++;
        this.routingStats.retry_statistics.total_retries++;

        const retryPromise = this.routeMessage(failedData.message)
          .then(() => {
            this.failedMessages.delete(messageId);
            this.routingStats.retry_statistics.successful_retries++;
            this.logger.info('Message retry successful', {
              message_id: messageId,
              retry_count: failedData.retry_count
            });
          })
          .catch((error) => {
            failedData.failed_at = new Date(); // Update failure time for next retry
            this.logger.warn('Message retry failed', {
              message_id: messageId,
              retry_count: failedData.retry_count,
              error: error.message
            });
          });

        retryPromises.push(retryPromise);
      }
    }

    if (retryPromises.length > 0) {
      await Promise.allSettled(retryPromises);
    }
  }

  /**
   * Update queue size statistics
   */
  updateQueueSizeStats() {
    for (const [priority, queue] of this.messageQueues) {
      this.routingStats.queue_sizes[priority] = queue.length;
    }
  }

  /**
   * Update average routing time
   */
  updateAverageRoutingTime(newTime) {
    const total = this.routingStats.messages_routed;
    const currentAvg = this.routingStats.average_routing_time;
    this.routingStats.average_routing_time = ((currentAvg * (total - 1)) + newTime) / total;
  }

  /**
   * Queue message for retry
   */
  async queueMessageForRetry(message, error) {
    const retryMessage = {
      ...message,
      retry_reason: error.message,
      original_failure_time: new Date()
    };

    return await this.queueMessage(retryMessage);
  }

  /**
   * Try alternative recipients for capability-based routing
   */
  async tryAlternativeRecipients(message, alternativeRecipients) {
    for (const recipient of alternativeRecipients) {
      try {
        const deliveryResult = await this.deliverMessage(recipient, {
          ...message,
          to: recipient.id
        });

        return {
          strategy: 'capability',
          selected_recipient: recipient.id,
          delivery_status: 'delivered',
          delivery_result: deliveryResult,
          attempted_alternatives: true
        };

      } catch (error) {
        this.logger.warn('Alternative recipient also failed', {
          message_id: message.id,
          alternative_recipient: recipient.id,
          error: error.message
        });
        continue;
      }
    }

    throw new Error('All alternative recipients failed');
  }

  /**
   * Estimate processing time for queued message
   */
  estimateProcessingTime(priority, queuePosition) {
    const processingRates = {
      critical: 10, // messages per second
      high: 8,
      normal: 5,
      low: 2
    };

    const rate = processingRates[priority] || 1;
    return Math.ceil(queuePosition / rate) * 1000; // milliseconds
  }

  /**
   * Get routing statistics
   */
  async getStats() {
    return {
      ...this.routingStats,
      active_messages: this.activeMessages.size,
      failed_messages: this.failedMessages.size,
      registered_systems: this.routingTable.size,
      capability_routes: this.capabilityRouting.size,
      is_ready: this.isReady
    };
  }

  /**
   * Check if router is ready
   */
  isReady() {
    return this.isReady;
  }
}