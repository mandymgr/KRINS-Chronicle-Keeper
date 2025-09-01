const cluster = require('cluster');
const os = require('os');
const Redis = require('redis');
const { EventEmitter } = require('events');

class HorizontalScaler extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxWorkers: config.maxWorkers || os.cpus().length,
            minWorkers: config.minWorkers || 2,
            scalingThreshold: {
                cpu: config.cpuThreshold || 80,
                memory: config.memoryThreshold || 85,
                requests: config.requestsThreshold || 1000
            },
            cooldownPeriod: config.cooldownPeriod || 300000, // 5 minutes
            healthCheckInterval: config.healthCheckInterval || 30000, // 30 seconds
            redisConfig: config.redis || {
                host: 'localhost',
                port: 6379
            },
            ...config
        };
        
        this.workers = new Map();
        this.metrics = new Map();
        this.lastScaleAction = 0;
        this.redis = null;
        
        this.initializeRedis();
        this.setupProcessHandlers();
        
        // Nordic scaling philosophy - efficient and thoughtful
        console.log('🇳🇴 Krins Horizontal Scaler initialized with Nordic efficiency');
    }

    async initializeRedis() {
        try {
            this.redis = Redis.createClient(this.config.redisConfig);
            await this.redis.connect();
            
            console.log('🔄 Connected to Redis for distributed coordination');
            
            // Subscribe to scaling events from other instances
            const subscriber = this.redis.duplicate();
            await subscriber.connect();
            await subscriber.subscribe('krins:scaling', this.handleScalingEvent.bind(this));
            
        } catch (error) {
            console.warn('⚠️ Redis connection failed, running in single-instance mode:', error.message);
        }
    }

    async start() {
        if (cluster.isPrimary) {
            console.log('🚀 Starting Krins Superintelligence in cluster mode');
            console.log(`📊 Initial worker count: ${this.config.minWorkers}`);
            
            // Start initial workers
            for (let i = 0; i < this.config.minWorkers; i++) {
                this.spawnWorker();
            }
            
            // Start monitoring
            this.startHealthMonitoring();
            this.startAutoScaling();
            
            // Handle worker lifecycle
            this.setupWorkerHandlers();
            
        } else {
            // Worker process - start the actual application
            console.log(`👷 Worker ${process.pid} starting...`);
            this.startWorkerProcess();
        }
    }

    spawnWorker() {
        const worker = cluster.fork();
        const workerId = worker.id;
        
        this.workers.set(workerId, {
            id: workerId,
            pid: worker.process.pid,
            startTime: Date.now(),
            status: 'starting',
            cpu: 0,
            memory: 0,
            requests: 0,
            errors: 0,
            lastHealthCheck: Date.now()
        });

        worker.on('message', (message) => {
            this.handleWorkerMessage(workerId, message);
        });

        worker.on('exit', (code, signal) => {
            console.log(`👷 Worker ${workerId} (${worker.process.pid}) exited with ${signal || code}`);
            this.workers.delete(workerId);
            
            // Respawn if not graceful shutdown
            if (!worker.exitedAfterDisconnect) {
                setTimeout(() => this.spawnWorker(), 1000);
            }
        });

        console.log(`✅ Worker ${workerId} spawned (PID: ${worker.process.pid})`);
        return worker;
    }

    setupWorkerHandlers() {
        cluster.on('exit', (worker, code, signal) => {
            const workerId = worker.id;
            const workerInfo = this.workers.get(workerId);
            
            if (workerInfo) {
                console.log(`💀 Worker ${workerId} died (${signal || code})`);
                
                // Update metrics
                if (this.redis) {
                    this.redis.incr('krins:worker_deaths');
                }
                
                // Respawn if needed
                if (!worker.exitedAfterDisconnect && this.workers.size < this.config.minWorkers) {
                    console.log('♻️ Respawning worker to maintain minimum count');
                    setTimeout(() => this.spawnWorker(), 2000);
                }
            }
        });
    }

    startWorkerProcess() {
        // This would be called in each worker to start the actual Krins application
        const { KrinsOrchestrator } = require('../orchestrator/main');
        
        const orchestrator = new KrinsOrchestrator({
            workerId: cluster.worker.id,
            isPrimary: false,
            horizontalScaler: this
        });
        
        orchestrator.start().then(() => {
            // Notify primary that worker is ready
            process.send({
                type: 'worker_ready',
                workerId: cluster.worker.id,
                pid: process.pid
            });
            
            console.log(`🎯 Worker ${cluster.worker.id} ready for requests`);
        }).catch(error => {
            console.error('❌ Worker startup failed:', error);
            process.exit(1);
        });

        // Send periodic health updates to primary
        setInterval(() => {
            const usage = process.cpuUsage();
            const memory = process.memoryUsage();
            
            process.send({
                type: 'health_update',
                workerId: cluster.worker.id,
                metrics: {
                    cpu: usage.user + usage.system,
                    memory: memory.heapUsed / memory.heapTotal * 100,
                    uptime: process.uptime(),
                    requests: this.getRequestCount(),
                    errors: this.getErrorCount()
                }
            });
        }, 10000); // Every 10 seconds
    }

    handleWorkerMessage(workerId, message) {
        const worker = this.workers.get(workerId);
        if (!worker) return;

        switch (message.type) {
            case 'worker_ready':
                worker.status = 'ready';
                worker.readyTime = Date.now();
                console.log(`✅ Worker ${workerId} is ready (startup: ${worker.readyTime - worker.startTime}ms)`);
                this.emit('worker_ready', workerId);
                break;

            case 'health_update':
                this.updateWorkerMetrics(workerId, message.metrics);
                break;

            case 'request_completed':
                worker.requests++;
                break;

            case 'error_occurred':
                worker.errors++;
                this.handleWorkerError(workerId, message.error);
                break;

            case 'scale_request':
                this.handleScaleRequest(message.direction, message.reason);
                break;
        }
    }

    updateWorkerMetrics(workerId, metrics) {
        const worker = this.workers.get(workerId);
        if (worker) {
            Object.assign(worker, metrics);
            worker.lastHealthCheck = Date.now();
            
            // Store metrics for analysis
            const key = `worker_${workerId}_metrics`;
            if (!this.metrics.has(key)) {
                this.metrics.set(key, []);
            }
            
            const workerMetrics = this.metrics.get(key);
            workerMetrics.push({
                timestamp: Date.now(),
                ...metrics
            });
            
            // Keep only last hour of metrics
            const oneHourAgo = Date.now() - 3600000;
            const recentMetrics = workerMetrics.filter(m => m.timestamp > oneHourAgo);
            this.metrics.set(key, recentMetrics);
        }
    }

    startHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, this.config.healthCheckInterval);
        
        console.log(`🏥 Health monitoring started (interval: ${this.config.healthCheckInterval}ms)`);
    }

    async performHealthCheck() {
        const now = Date.now();
        const unhealthyWorkers = [];
        
        for (const [workerId, worker] of this.workers) {
            // Check if worker is responding
            const timeSinceLastCheck = now - worker.lastHealthCheck;
            if (timeSinceLastCheck > this.config.healthCheckInterval * 2) {
                unhealthyWorkers.push(workerId);
                console.warn(`⚠️ Worker ${workerId} not responding (${timeSinceLastCheck}ms ago)`);
            }
            
            // Check resource usage
            if (worker.memory > 95) {
                console.warn(`⚠️ Worker ${workerId} high memory usage: ${worker.memory}%`);
            }
            
            if (worker.cpu > 95) {
                console.warn(`⚠️ Worker ${workerId} high CPU usage: ${worker.cpu}%`);
            }
        }
        
        // Restart unhealthy workers
        for (const workerId of unhealthyWorkers) {
            await this.restartWorker(workerId);
        }
        
        // Update global health metrics
        if (this.redis) {
            const healthData = {
                timestamp: now,
                totalWorkers: this.workers.size,
                healthyWorkers: this.workers.size - unhealthyWorkers.length,
                avgCpu: this.getAverageMetric('cpu'),
                avgMemory: this.getAverageMetric('memory'),
                totalRequests: this.getTotalRequests(),
                totalErrors: this.getTotalErrors()
            };
            
            await this.redis.setEx('krins:cluster_health', 60, JSON.stringify(healthData));
        }
    }

    startAutoScaling() {
        setInterval(() => {
            this.evaluateScaling();
        }, 30000); // Every 30 seconds
        
        console.log('📈 Auto-scaling evaluation started');
    }

    async evaluateScaling() {
        const now = Date.now();
        
        // Respect cooldown period
        if (now - this.lastScaleAction < this.config.cooldownPeriod) {
            return;
        }

        const metrics = this.calculateClusterMetrics();
        const shouldScale = this.shouldScale(metrics);
        
        if (shouldScale.scale) {
            await this.executeScaling(shouldScale.direction, shouldScale.reason, metrics);
        }
    }

    calculateClusterMetrics() {
        const workers = Array.from(this.workers.values());
        
        return {
            workerCount: workers.length,
            avgCpu: this.getAverageMetric('cpu'),
            avgMemory: this.getAverageMetric('memory'),
            totalRequests: this.getTotalRequests(),
            totalErrors: this.getTotalErrors(),
            requestRate: this.getRequestRate(),
            errorRate: this.getErrorRate(),
            responseTime: this.getAverageResponseTime()
        };
    }

    shouldScale(metrics) {
        // Scale up conditions
        if (metrics.avgCpu > this.config.scalingThreshold.cpu &&
            metrics.workerCount < this.config.maxWorkers) {
            return {
                scale: true,
                direction: 'up',
                reason: `High CPU usage: ${metrics.avgCpu}%`
            };
        }
        
        if (metrics.avgMemory > this.config.scalingThreshold.memory &&
            metrics.workerCount < this.config.maxWorkers) {
            return {
                scale: true,
                direction: 'up',
                reason: `High memory usage: ${metrics.avgMemory}%`
            };
        }
        
        if (metrics.requestRate > this.config.scalingThreshold.requests &&
            metrics.workerCount < this.config.maxWorkers) {
            return {
                scale: true,
                direction: 'up',
                reason: `High request rate: ${metrics.requestRate}/min`
            };
        }
        
        // Scale down conditions
        if (metrics.avgCpu < 30 && metrics.avgMemory < 50 &&
            metrics.requestRate < this.config.scalingThreshold.requests * 0.3 &&
            metrics.workerCount > this.config.minWorkers) {
            return {
                scale: true,
                direction: 'down',
                reason: `Low resource usage: CPU ${metrics.avgCpu}%, Memory ${metrics.avgMemory}%`
            };
        }
        
        return { scale: false };
    }

    async executeScaling(direction, reason, metrics) {
        console.log(`📊 Scaling ${direction}: ${reason}`);
        
        try {
            if (direction === 'up') {
                const newWorker = this.spawnWorker();
                console.log(`⬆️ Scaled UP: Added worker ${newWorker.id} (Total: ${this.workers.size})`);
            } else if (direction === 'down') {
                await this.gracefullyRemoveWorker();
                console.log(`⬇️ Scaled DOWN: Removed worker (Total: ${this.workers.size})`);
            }
            
            this.lastScaleAction = Date.now();
            
            // Notify other instances via Redis
            if (this.redis) {
                await this.redis.publish('krins:scaling', JSON.stringify({
                    action: direction,
                    reason,
                    timestamp: Date.now(),
                    newWorkerCount: this.workers.size,
                    metrics
                }));
            }
            
            this.emit('scaled', { direction, reason, workerCount: this.workers.size });
            
        } catch (error) {
            console.error(`❌ Scaling ${direction} failed:`, error);
        }
    }

    async gracefullyRemoveWorker() {
        // Find the worker with lowest load
        let targetWorker = null;
        let lowestLoad = Infinity;
        
        for (const [workerId, worker] of this.workers) {
            const load = (worker.cpu + worker.memory) / 2;
            if (load < lowestLoad) {
                lowestLoad = load;
                targetWorker = workerId;
            }
        }
        
        if (targetWorker) {
            const clusterWorker = Object.values(cluster.workers).find(w => w.id === targetWorker);
            if (clusterWorker) {
                console.log(`🔄 Gracefully shutting down worker ${targetWorker}`);
                clusterWorker.disconnect();
                
                // Give worker time to finish requests
                setTimeout(() => {
                    if (!clusterWorker.isDead()) {
                        clusterWorker.kill();
                    }
                }, 30000); // 30 seconds
            }
        }
    }

    async restartWorker(workerId) {
        console.log(`🔄 Restarting unhealthy worker ${workerId}`);
        
        const clusterWorker = Object.values(cluster.workers).find(w => w.id === workerId);
        if (clusterWorker) {
            clusterWorker.kill();
            // New worker will be spawned automatically by the exit handler
        }
    }

    handleScalingEvent(message) {
        try {
            const event = JSON.parse(message);
            console.log(`🌐 Distributed scaling event: ${event.action} - ${event.reason}`);
            
            this.emit('distributed_scale', event);
        } catch (error) {
            console.error('Error handling scaling event:', error);
        }
    }

    // Metrics calculation helpers
    getAverageMetric(metric) {
        const workers = Array.from(this.workers.values());
        if (workers.length === 0) return 0;
        
        const sum = workers.reduce((acc, worker) => acc + (worker[metric] || 0), 0);
        return sum / workers.length;
    }

    getTotalRequests() {
        return Array.from(this.workers.values())
            .reduce((acc, worker) => acc + (worker.requests || 0), 0);
    }

    getTotalErrors() {
        return Array.from(this.workers.values())
            .reduce((acc, worker) => acc + (worker.errors || 0), 0);
    }

    getRequestRate() {
        // Calculate requests per minute based on recent metrics
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        let totalRecentRequests = 0;
        for (const [key, metrics] of this.metrics) {
            if (key.includes('worker_') && key.includes('_metrics')) {
                const recentMetrics = metrics.filter(m => m.timestamp > oneMinuteAgo);
                if (recentMetrics.length > 1) {
                    const oldestRecent = recentMetrics[0];
                    const newestRecent = recentMetrics[recentMetrics.length - 1];
                    totalRecentRequests += (newestRecent.requests || 0) - (oldestRecent.requests || 0);
                }
            }
        }
        
        return totalRecentRequests;
    }

    getErrorRate() {
        const totalRequests = this.getTotalRequests();
        const totalErrors = this.getTotalErrors();
        
        return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    }

    getAverageResponseTime() {
        // Simplified - would need more sophisticated tracking
        return 100; // milliseconds
    }

    getRequestCount() {
        // This would be implemented by the worker to track its requests
        return process.requestCount || 0;
    }

    getErrorCount() {
        // This would be implemented by the worker to track its errors
        return process.errorCount || 0;
    }

    setupProcessHandlers() {
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught exception in scaler:', error);
        });
        process.on('unhandledRejection', (reason) => {
            console.error('❌ Unhandled rejection in scaler:', reason);
        });
    }

    async gracefulShutdown(signal) {
        console.log(`🛑 Received ${signal}, starting graceful shutdown...`);
        
        if (cluster.isPrimary) {
            // Disconnect all workers
            for (const worker of Object.values(cluster.workers)) {
                worker.disconnect();
            }
            
            // Wait for workers to exit
            await new Promise((resolve) => {
                const checkWorkers = () => {
                    if (Object.keys(cluster.workers).length === 0) {
                        resolve();
                    } else {
                        setTimeout(checkWorkers, 100);
                    }
                };
                checkWorkers();
            });
        }
        
        // Close Redis connection
        if (this.redis) {
            await this.redis.quit();
        }
        
        console.log('🇳🇴 Krins Horizontal Scaler shutdown complete');
        process.exit(0);
    }

    // Public API for external monitoring
    getClusterStatus() {
        return {
            workerCount: this.workers.size,
            workers: Array.from(this.workers.values()),
            metrics: this.calculateClusterMetrics(),
            config: this.config,
            lastScaleAction: this.lastScaleAction
        };
    }

    async getDistributedStatus() {
        if (!this.redis) return null;
        
        try {
            const healthData = await this.redis.get('krins:cluster_health');
            return healthData ? JSON.parse(healthData) : null;
        } catch (error) {
            console.error('Error getting distributed status:', error);
            return null;
        }
    }
}

module.exports = { HorizontalScaler };