/**
 * Production Logging System for Dev Memory OS
 * Railway-optimized structured logging with monitoring integration
 */

const winston = require('winston');
const path = require('path');

class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.isProduction = process.env.NODE_ENV === 'production';
        this.serviceName = 'dev-memory-os';
        
        this.setupLogger();
        this.setupErrorHandlers();
    }

    setupLogger() {
        // Custom format for structured logging
        const customFormat = winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss.SSS'
            }),
            winston.format.errors({ stack: true }),
            winston.format.metadata({
                fillExcept: ['timestamp', 'level', 'message']
            }),
            this.isProduction ? winston.format.json() : winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        );

        const transports = [
            // Console transport for Railway logs
            new winston.transports.Console({
                level: this.logLevel,
                format: customFormat,
                handleExceptions: true,
                handleRejections: true
            })
        ];

        // File transports for local development
        if (!this.isProduction) {
            transports.push(
                new winston.transports.File({
                    filename: path.join(process.cwd(), 'logs', 'error.log'),
                    level: 'error',
                    format: winston.format.json(),
                    maxsize: 5242880, // 5MB
                    maxFiles: 3
                }),
                new winston.transports.File({
                    filename: path.join(process.cwd(), 'logs', 'combined.log'),
                    format: winston.format.json(),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })
            );
        }

        this.logger = winston.createLogger({
            level: this.logLevel,
            format: customFormat,
            defaultMeta: {
                service: this.serviceName,
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            },
            transports,
            exitOnError: false
        });

        // Add context to all logs
        this.addRequestContext();
    }

    setupErrorHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception', {
                error: error.message,
                stack: error.stack,
                type: 'uncaughtException'
            });
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Promise Rejection', {
                reason: reason instanceof Error ? reason.message : reason,
                stack: reason instanceof Error ? reason.stack : undefined,
                type: 'unhandledRejection'
            });
        });
    }

    addRequestContext() {
        // Middleware to add request context to logs
        this.requestMiddleware = (req, res, next) => {
            const requestId = req.headers['x-request-id'] || this.generateRequestId();
            req.requestId = requestId;

            // Add request context to logger
            req.logger = this.logger.child({
                requestId,
                method: req.method,
                path: req.path,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });

            // Log request
            req.logger.info('Request started', {
                method: req.method,
                url: req.originalUrl,
                headers: this.sanitizeHeaders(req.headers),
                query: req.query
            });

            const startTime = Date.now();

            // Override res.end to log response
            const originalEnd = res.end;
            res.end = function(chunk, encoding) {
                const duration = Date.now() - startTime;
                
                req.logger.info('Request completed', {
                    statusCode: res.statusCode,
                    duration,
                    responseSize: res.get('content-length') || (chunk ? chunk.length : 0)
                });

                // Log slow requests
                if (duration > 1000) {
                    req.logger.warn('Slow request detected', {
                        duration,
                        threshold: 1000
                    });
                }

                originalEnd.call(this, chunk, encoding);
            };

            next();
        };
    }

    // Database query logging
    logDatabaseQuery(query, duration, error = null) {
        const logData = {
            type: 'database_query',
            query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
            duration,
            isSlowQuery: duration > 1000
        };

        if (error) {
            this.logger.error('Database query failed', {
                ...logData,
                error: error.message,
                stack: error.stack
            });
        } else if (duration > 1000) {
            this.logger.warn('Slow database query', logData);
        } else {
            this.logger.debug('Database query executed', logData);
        }
    }

    // Vector search logging
    logVectorSearch(query, resultCount, duration, metadata = {}) {
        this.logger.info('Vector search performed', {
            type: 'vector_search',
            query: query.substring(0, 100),
            resultCount,
            duration,
            ...metadata
        });
    }

    // API endpoint logging
    logAPICall(endpoint, method, statusCode, duration, metadata = {}) {
        this.logger.info('API call completed', {
            type: 'api_call',
            endpoint,
            method,
            statusCode,
            duration,
            ...metadata
        });
    }

    // Security event logging
    logSecurityEvent(event, level = 'warn', metadata = {}) {
        this.logger[level]('Security event', {
            type: 'security_event',
            event,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    // Performance monitoring
    logPerformanceMetrics(metrics) {
        this.logger.info('Performance metrics', {
            type: 'performance_metrics',
            ...metrics
        });
    }

    // Business logic logging
    logBusinessEvent(event, metadata = {}) {
        this.logger.info('Business event', {
            type: 'business_event',
            event,
            ...metadata
        });
    }

    // Error logging with context
    logError(error, context = {}) {
        this.logger.error('Application error', {
            type: 'application_error',
            error: error.message,
            stack: error.stack,
            ...context
        });
    }

    // System health logging
    logSystemHealth(healthData) {
        this.logger.info('System health check', {
            type: 'system_health',
            ...healthData
        });
    }

    // Utility methods
    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    sanitizeHeaders(headers) {
        const sensitive = ['authorization', 'x-api-key', 'cookie'];
        const sanitized = { ...headers };
        
        sensitive.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }

    // Get logger instance with additional context
    child(context) {
        return this.logger.child(context);
    }

    // Direct access to logger methods
    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    // Performance timer utility
    startTimer() {
        const start = process.hrtime.bigint();
        return {
            end: () => {
                const end = process.hrtime.bigint();
                return Number(end - start) / 1000000; // Convert to milliseconds
            }
        };
    }

    // Log aggregation for Railway
    getLogStats() {
        // In a real implementation, this would gather stats from log aggregation service
        return {
            totalRequests: 0,
            errorRate: 0,
            averageResponseTime: 0,
            slowQueries: 0
        };
    }
}

// Create singleton instance
const logger = new Logger();

// Export both the logger instance and the class
module.exports = logger;
module.exports.Logger = Logger;

// Export middleware for easy use
module.exports.requestMiddleware = logger.requestMiddleware;