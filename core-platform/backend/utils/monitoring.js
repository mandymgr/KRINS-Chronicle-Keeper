/**
 * Production Monitoring System for Dev Memory OS
 * Railway-compatible performance monitoring and health checks
 */

const os = require('os');
const { performance } = require('perf_hooks');
const logger = require('./logger');

class MonitoringService {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                errors: 0,
                slowQueries: 0
            },
            performance: {
                averageResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: Infinity
            },
            database: {
                queries: 0,
                slowQueries: 0,
                errors: 0,
                averageQueryTime: 0
            },
            system: {
                uptime: 0,
                memory: {},
                cpu: {}
            }
        };

        this.responseTimes = [];
        this.isMonitoring = false;
        this.startTime = Date.now();
        
        this.setupMonitoring();
    }

    setupMonitoring() {
        // Monitor system metrics every 30 seconds
        setInterval(() => {
            this.collectSystemMetrics();
        }, 30000);

        // Clean up old metrics every 5 minutes
        setInterval(() => {
            this.cleanupMetrics();
        }, 300000);

        this.isMonitoring = true;
        logger.info('Monitoring service initialized');
    }

    // Middleware to track request metrics
    requestMetricsMiddleware() {
        return (req, res, next) => {
            const startTime = performance.now();
            
            // Track request start
            this.metrics.requests.total++;
            
            // Override res.end to capture response metrics
            const originalEnd = res.end;
            res.end = (chunk, encoding) => {
                const duration = performance.now() - startTime;
                
                // Update metrics
                this.updateResponseMetrics(res.statusCode, duration);
                
                // Log slow requests
                if (duration > 2000) {
                    logger.warn('Slow request detected', {
                        path: req.path,
                        method: req.method,
                        duration,
                        statusCode: res.statusCode
                    });
                }
                
                originalEnd.call(res, chunk, encoding);
            };
            
            next();
        };
    }

    // Update response time metrics
    updateResponseMetrics(statusCode, duration) {
        // Track success/error rates
        if (statusCode >= 200 && statusCode < 400) {
            this.metrics.requests.success++;
        } else if (statusCode >= 400) {
            this.metrics.requests.errors++;
        }

        // Update response time metrics
        this.responseTimes.push(duration);
        this.metrics.performance.maxResponseTime = Math.max(
            this.metrics.performance.maxResponseTime,
            duration
        );
        this.metrics.performance.minResponseTime = Math.min(
            this.metrics.performance.minResponseTime,
            duration
        );

        // Calculate average (keep only recent values)
        if (this.responseTimes.length > 1000) {
            this.responseTimes = this.responseTimes.slice(-500);
        }

        this.metrics.performance.averageResponseTime = 
            this.responseTimes.reduce((sum, time) => sum + time, 0) / 
            this.responseTimes.length;
    }

    // Track database query metrics
    trackDatabaseQuery(query, duration, error = null) {
        this.metrics.database.queries++;
        
        if (error) {
            this.metrics.database.errors++;
            logger.logError(error, { query: query.substring(0, 100) });
        }

        if (duration > 1000) {
            this.metrics.database.slowQueries++;
        }

        // Update average query time
        const totalQueries = this.metrics.database.queries;
        this.metrics.database.averageQueryTime = 
            ((this.metrics.database.averageQueryTime * (totalQueries - 1)) + duration) / 
            totalQueries;
    }

    // Collect system metrics
    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.system = {
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            memory: {
                rss: Math.round(memUsage.rss / 1024 / 1024), // MB
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024),
                systemTotal: Math.round(os.totalmem() / 1024 / 1024),
                systemFree: Math.round(os.freemem() / 1024 / 1024)
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
                loadAverage: os.loadavg(),
                cores: os.cpus().length
            },
            platform: os.platform(),
            nodeVersion: process.version
        };

        // Log system health if memory usage is high
        const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        if (memoryUsagePercent > 80) {
            logger.warn('High memory usage detected', {
                memoryUsagePercent: Math.round(memoryUsagePercent),
                heapUsed: this.metrics.system.memory.heapUsed,
                heapTotal: this.metrics.system.memory.heapTotal
            });
        }
    }

    // Clean up old metrics
    cleanupMetrics() {
        // Keep only recent response times
        if (this.responseTimes.length > 500) {
            this.responseTimes = this.responseTimes.slice(-250);
        }

        logger.debug('Metrics cleanup completed', {
            responseTimesCount: this.responseTimes.length
        });
    }

    // Get comprehensive health status
    async getHealthStatus() {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            
            // System metrics
            system: this.metrics.system,
            
            // Request metrics
            requests: {
                ...this.metrics.requests,
                errorRate: this.metrics.requests.total > 0 ? 
                    (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2) + '%' : 
                    '0%',
                successRate: this.metrics.requests.total > 0 ? 
                    (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2) + '%' : 
                    '0%'
            },
            
            // Performance metrics
            performance: {
                ...this.metrics.performance,
                averageResponseTime: Math.round(this.metrics.performance.averageResponseTime * 100) / 100
            },
            
            // Database metrics
            database: {
                ...this.metrics.database,
                averageQueryTime: Math.round(this.metrics.database.averageQueryTime * 100) / 100,
                slowQueryRate: this.metrics.database.queries > 0 ? 
                    (this.metrics.database.slowQueries / this.metrics.database.queries * 100).toFixed(2) + '%' : 
                    '0%'
            }
        };

        // Determine overall health status
        const errorRate = (this.metrics.requests.errors / this.metrics.requests.total) * 100;
        const memoryUsage = (this.metrics.system.memory.heapUsed / this.metrics.system.memory.heapTotal) * 100;
        
        if (errorRate > 10 || memoryUsage > 90) {
            healthStatus.status = 'unhealthy';
        } else if (errorRate > 5 || memoryUsage > 80 || this.metrics.performance.averageResponseTime > 2000) {
            healthStatus.status = 'degraded';
        }

        return healthStatus;
    }

    // Get metrics for monitoring dashboard
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000)
        };
    }

    // Performance timer for specific operations
    startTimer(operation) {
        const start = performance.now();
        return {
            end: () => {
                const duration = performance.now() - start;
                logger.debug('Operation completed', {
                    operation,
                    duration: Math.round(duration * 100) / 100
                });
                return duration;
            }
        };
    }

    // Log application events for monitoring
    logEvent(event, data = {}) {
        logger.info('Application event', {
            event,
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    // Alert conditions
    checkAlertConditions() {
        const alerts = [];
        
        // High error rate
        const errorRate = (this.metrics.requests.errors / this.metrics.requests.total) * 100;
        if (errorRate > 10) {
            alerts.push({
                type: 'high_error_rate',
                severity: 'critical',
                message: `Error rate is ${errorRate.toFixed(2)}%`,
                threshold: 10
            });
        }
        
        // High memory usage
        const memoryUsage = (this.metrics.system.memory.heapUsed / this.metrics.system.memory.heapTotal) * 100;
        if (memoryUsage > 85) {
            alerts.push({
                type: 'high_memory_usage',
                severity: 'warning',
                message: `Memory usage is ${memoryUsage.toFixed(2)}%`,
                threshold: 85
            });
        }
        
        // Slow response times
        if (this.metrics.performance.averageResponseTime > 3000) {
            alerts.push({
                type: 'slow_response_time',
                severity: 'warning',
                message: `Average response time is ${this.metrics.performance.averageResponseTime.toFixed(2)}ms`,
                threshold: 3000
            });
        }
        
        return alerts;
    }

    // Generate monitoring report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            period: '24h', // This would be configurable
            summary: {
                totalRequests: this.metrics.requests.total,
                errorRate: (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2) + '%',
                averageResponseTime: Math.round(this.metrics.performance.averageResponseTime),
                uptime: Math.floor((Date.now() - this.startTime) / 1000)
            },
            alerts: this.checkAlertConditions(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    // Generate performance recommendations
    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.database.slowQueries > this.metrics.database.queries * 0.1) {
            recommendations.push({
                type: 'database_optimization',
                message: 'Consider adding database indexes or optimizing slow queries',
                priority: 'high'
            });
        }
        
        if (this.metrics.system.memory.heapUsed > this.metrics.system.memory.heapTotal * 0.8) {
            recommendations.push({
                type: 'memory_optimization',
                message: 'Consider optimizing memory usage or increasing memory allocation',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }
}

// Create singleton instance
const monitoring = new MonitoringService();

module.exports = monitoring;