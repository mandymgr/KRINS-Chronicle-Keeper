/**
 * Database Connection and Pool Management for Dev Memory OS
 * Production-ready PostgreSQL connections with pgvector support
 * Features: Connection pooling, health monitoring, fallback handling, vector operations
 */

const { Pool } = require('pg');

class DatabaseConnection {
    constructor(config = {}) {
        this.config = {
            user: config.user || process.env.DB_USER || 'devmemory',
            host: config.host || process.env.DB_HOST || 'localhost',
            database: config.database || process.env.DB_NAME || 'dev_memory_os',
            password: config.password || process.env.DB_PASSWORD || 'devmemory_secure_password_2024',
            port: config.port || process.env.DB_PORT || 5432,
            
            // Production-optimized connection pool settings
            max: config.max || 25, // Maximum connections for vector operations
            min: config.min || 5,  // Minimum connections to keep alive
            idleTimeoutMillis: config.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
            acquireTimeoutMillis: config.acquireTimeoutMillis || 10000,
            
            // pgvector specific settings
            application_name: 'dev-memory-os-semantic-search',
            statement_timeout: config.statement_timeout || 30000, // 30 seconds for vector operations
            query_timeout: config.query_timeout || 25000,
            
            ...config
        };

        this.pool = null;
        this.isConnected = false;
        this.hasVectorExtension = false;
        this.vectorDimensions = 1536; // OpenAI text-embedding-3-small dimensions
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 5;
        this.reconnectDelay = 2000; // Start with 2 seconds
        
        // Performance monitoring
        this.queryStats = {
            totalQueries: 0,
            slowQueries: 0,
            errorQueries: 0,
            vectorQueries: 0,
            averageQueryTime: 0
        };
    }

    /**
     * Initialize database connection pool with advanced pgvector setup
     * @returns {Promise<void>}
     */
    async connect() {
        const maxAttempts = this.maxConnectionAttempts;
        let attempt = 1;

        while (attempt <= maxAttempts) {
            try {
                console.log(`🔄 Database connection attempt ${attempt}/${maxAttempts}...`);
                
                this.pool = new Pool(this.config);
                
                // Enhanced connection setup
                await this.setupConnection();
                
                console.log('✅ Database connected successfully with enhanced pgvector support');
                this.isConnected = true;
                this.connectionAttempts = 0;
                
                // Setup connection pool event handlers
                this.setupPoolEventHandlers();
                
                return;
                
            } catch (error) {
                this.connectionAttempts = attempt;
                console.error(`❌ Database connection attempt ${attempt}/${maxAttempts} failed:`, error.message);
                
                if (attempt === maxAttempts) {
                    console.error('🔥 All database connection attempts failed. Running in degraded mode.');
                    this.hasVectorExtension = false;
                    this.isConnected = false;
                    throw new Error(`Database connection failed after ${maxAttempts} attempts: ${error.message}`);
                }
                
                // Exponential backoff
                const delay = this.reconnectDelay * Math.pow(2, attempt - 1);
                console.log(`⏳ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
            }
        }
    }

    /**
     * Advanced connection setup with pgvector optimization
     * @private
     */
    async setupConnection() {
        const client = await this.pool.connect();
        
        try {
            // Test basic connectivity
            await client.query('SELECT NOW() as current_time');
            
            // Check and setup pgvector extension
            await this.setupVectorExtension(client);
            
            // Optimize connection for vector operations
            if (this.hasVectorExtension) {
                await this.optimizeForVectorOperations(client);
            }
            
            // Verify database schema compatibility
            await this.verifySchemaCompatibility(client);
            
        } finally {
            client.release();
        }
    }

    /**
     * Setup and verify pgvector extension
     * @private
     */
    async setupVectorExtension(client) {
        try {
            // Check if pgvector extension is available
            const extensionCheck = await client.query(`
                SELECT extname, extversion 
                FROM pg_extension 
                WHERE extname = 'vector'
            `);
            
            if (extensionCheck.rows.length === 0) {
                console.warn('⚠️  pgvector extension not found - attempting to create...');
                
                try {
                    // Try to create the extension (requires superuser or appropriate permissions)
                    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
                    console.log('✅ pgvector extension created successfully');
                    this.hasVectorExtension = true;
                } catch (createError) {
                    console.warn('⚠️  Could not create pgvector extension - using fallback text search');
                    console.warn('   For full vector search capabilities, install pgvector extension manually');
                    this.hasVectorExtension = false;
                }
            } else {
                const version = extensionCheck.rows[0].extversion;
                console.log(`✅ pgvector extension available (version ${version})`);
                this.hasVectorExtension = true;
                
                // Verify vector operations work
                await client.query(`SELECT '[1,2,3]'::vector(3) <-> '[1,2,4]'::vector(3)`);
                console.log('✅ Vector operations verified');
            }
            
        } catch (error) {
            console.error('❌ pgvector setup failed:', error.message);
            this.hasVectorExtension = false;
        }
    }

    /**
     * Optimize database connection for vector operations
     * @private
     */
    async optimizeForVectorOperations(client) {
        try {
            // Set optimal work_mem for vector operations
            await client.query(`SET work_mem = '256MB'`);
            
            // Set maintenance_work_mem for index operations
            await client.query(`SET maintenance_work_mem = '512MB'`);
            
            // Enable parallel query execution for large vector operations
            await client.query(`SET max_parallel_workers_per_gather = 4`);
            
            // Optimize for vector similarity searches
            await client.query(`SET effective_cache_size = '4GB'`);
            
            console.log('✅ Database optimized for vector operations');
        } catch (error) {
            console.warn('⚠️  Could not apply vector optimizations (insufficient permissions)');
        }
    }

    /**
     * Verify database schema compatibility
     * @private
     */
    async verifySchemaCompatibility(client) {
        try {
            // Check for required tables
            const tables = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('adrs', 'patterns', 'search_queries', 'users', 'projects')
            `);
            
            const foundTables = tables.rows.map(row => row.table_name);
            const requiredTables = ['adrs', 'patterns', 'search_queries', 'users', 'projects'];
            const missingTables = requiredTables.filter(table => !foundTables.includes(table));
            
            if (missingTables.length > 0) {
                console.warn(`⚠️  Missing database tables: ${missingTables.join(', ')}`);
                console.warn('   Run database migrations to create required tables');
            } else {
                console.log('✅ All required database tables found');
            }
            
            // Check for embedding columns if pgvector is available
            if (this.hasVectorExtension) {
                const embeddingColumns = await client.query(`
                    SELECT c.table_name, c.column_name, c.data_type
                    FROM information_schema.columns c
                    WHERE c.table_schema = 'public' 
                    AND c.column_name = 'embedding'
                    AND c.table_name IN ('adrs', 'patterns')
                `);
                
                if (embeddingColumns.rows.length > 0) {
                    console.log('✅ Embedding columns found and ready for vector operations');
                } else {
                    console.warn('⚠️  No embedding columns found - vector storage will be limited');
                }
            }
            
        } catch (error) {
            console.warn('⚠️  Schema compatibility check failed:', error.message);
        }
    }

    /**
     * Setup connection pool event handlers
     * @private
     */
    setupPoolEventHandlers() {
        // Handle pool errors
        this.pool.on('error', async (err, client) => {
            console.error('💥 Unexpected database pool error:', err);
            this.queryStats.errorQueries++;
            this.isConnected = false;
            
            // Attempt reconnection
            console.log('🔄 Attempting to reconnect...');
            try {
                await this.connect();
            } catch (reconnectError) {
                console.error('❌ Reconnection failed:', reconnectError.message);
            }
        });

        // Monitor connection acquisition
        this.pool.on('acquire', () => {
            // Connection acquired from pool
        });

        // Monitor connection release
        this.pool.on('release', () => {
            // Connection released back to pool
        });

        // Handle pool connection events
        this.pool.on('connect', (client) => {
            console.log('🔗 New client connected to database pool');
        });

        this.pool.on('remove', (client) => {
            console.log('🔌 Client removed from database pool');
        });
    }

    /**
     * Execute a query with parameters and performance monitoring
     * @param {string} text - SQL query
     * @param {Array} params - Query parameters
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Query result
     */
    async query(text, params = [], options = {}) {
        if (!this.isConnected || !this.pool) {
            // Try to reconnect if disconnected
            if (!this.isConnected && this.pool) {
                try {
                    await this.connect();
                } catch (reconnectError) {
                    throw new Error('Database not connected and reconnection failed');
                }
            } else {
                throw new Error('Database not connected. Call connect() first.');
            }
        }

        const start = Date.now();
        const isVectorQuery = this.isVectorQuery(text);
        const queryId = `query_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        if (options.debug) {
            console.log(`🔍 [${queryId}] Executing query:`, text.substring(0, 100));
        }

        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            
            // Update performance statistics
            this.updateQueryStats(duration, isVectorQuery, false);
            
            // Log slow queries
            const slowThreshold = isVectorQuery ? 2000 : 1000; // Vector queries allowed more time
            if (duration > slowThreshold) {
                console.warn(`🐌 [${queryId}] Slow ${isVectorQuery ? 'vector ' : ''}query (${duration}ms):`, 
                    text.substring(0, 150) + (text.length > 150 ? '...' : ''));
                if (isVectorQuery) {
                    console.warn('   💡 Consider optimizing vector operations or adding indexes');
                }
            }
            
            // Log successful vector operations
            if (isVectorQuery && options.debug) {
                console.log(`✅ [${queryId}] Vector query completed in ${duration}ms`);
            }
            
            return result;
            
        } catch (error) {
            const duration = Date.now() - start;
            this.updateQueryStats(duration, isVectorQuery, true);
            
            console.error(`❌ [${queryId}] Database query error (${duration}ms):`, error.message);
            console.error(`   Query: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
            
            if (params && params.length > 0) {
                console.error(`   Parameters: ${JSON.stringify(params, null, 2).substring(0, 500)}`);
            }
            
            // Enhanced error handling for vector operations
            if (isVectorQuery) {
                console.error('   🔍 This was a vector operation - check pgvector extension and data types');
                if (error.message.includes('vector')) {
                    console.error('   💡 Vector-related error - ensure embeddings are properly formatted');
                }
            }
            
            throw error;
        }
    }

    /**
     * Check if query involves vector operations
     * @private
     */
    isVectorQuery(text) {
        const vectorKeywords = ['<=>', '<->', 'vector', 'embedding', 'similarity'];
        const lowerText = text.toLowerCase();
        return vectorKeywords.some(keyword => lowerText.includes(keyword));
    }

    /**
     * Update query performance statistics
     * @private
     */
    updateQueryStats(duration, isVector, hasError) {
        this.queryStats.totalQueries++;
        
        if (hasError) {
            this.queryStats.errorQueries++;
        }
        
        if (isVector) {
            this.queryStats.vectorQueries++;
        }
        
        const slowThreshold = isVector ? 2000 : 1000;
        if (duration > slowThreshold) {
            this.queryStats.slowQueries++;
        }
        
        // Update average query time (simple moving average)
        this.queryStats.averageQueryTime = (
            (this.queryStats.averageQueryTime * (this.queryStats.totalQueries - 1)) + duration
        ) / this.queryStats.totalQueries;
    }

    /**
     * Execute a vector similarity query with optimizations
     * @param {string} text - SQL query with vector operations
     * @param {Array} params - Query parameters
     * @param {Object} options - Vector query options
     * @returns {Promise<Object>} Query result
     */
    async vectorQuery(text, params = [], options = {}) {
        if (!this.hasVectorExtension) {
            throw new Error('Vector operations not available - pgvector extension not installed');
        }
        
        const enhancedOptions = {
            ...options,
            debug: options.debug || false,
            timeout: options.timeout || 30000 // 30 seconds for vector operations
        };
        
        return await this.query(text, params, enhancedOptions);
    }

    /**
     * Batch insert embeddings with transaction support
     * @param {string} table - Table name
     * @param {Array} embeddings - Array of embedding data
     * @returns {Promise<Array>} Inserted records
     */
    async batchInsertEmbeddings(table, embeddings) {
        if (!this.hasVectorExtension) {
            console.warn('Vector operations not available - skipping embedding storage');
            return [];
        }
        
        const batchSize = 50; // Process in batches to avoid memory issues
        const results = [];
        
        for (let i = 0; i < embeddings.length; i += batchSize) {
            const batch = embeddings.slice(i, i + batchSize);
            
            const batchResult = await this.transaction(async (client) => {
                const insertPromises = batch.map(item => {
                    const { id, embedding, ...data } = item;
                    const vectorString = `[${embedding.join(',')}]`;
                    
                    // Dynamic query building based on table
                    if (table === 'adrs') {
                        return client.query(`
                            UPDATE adrs 
                            SET embedding = $1::vector(${this.vectorDimensions})
                            WHERE id = $2
                            RETURNING *
                        `, [vectorString, id]);
                    } else if (table === 'patterns') {
                        return client.query(`
                            UPDATE patterns 
                            SET embedding = $1::vector(${this.vectorDimensions})
                            WHERE id = $2
                            RETURNING *
                        `, [vectorString, id]);
                    }
                });
                
                const batchResults = await Promise.all(insertPromises);
                return batchResults.map(r => r.rows[0]).filter(Boolean);
            });
            
            results.push(...batchResult);
            console.log(`✅ Processed batch ${Math.ceil((i + batchSize) / batchSize)} of ${Math.ceil(embeddings.length / batchSize)}`);
        }
        
        console.log(`🎯 Successfully processed ${results.length} embeddings for ${table}`);
        return results;
    }

    /**
     * Execute a transaction
     * @param {Function} callback - Function to execute within transaction
     * @returns {Promise<*>} Result of callback
     */
    async transaction(callback) {
        if (!this.isConnected || !this.pool) {
            throw new Error('Database not connected. Call connect() first.');
        }

        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get a client from the pool for multiple operations
     * @returns {Promise<Object>} Database client
     */
    async getClient() {
        if (!this.isConnected || !this.pool) {
            throw new Error('Database not connected. Call connect() first.');
        }

        return await this.pool.connect();
    }

    /**
     * Close all connections in the pool
     * @returns {Promise<void>}
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('Database connections closed');
        }
    }

    /**
     * Get pool statistics
     * @returns {Object} Pool statistics
     */
    getStats() {
        if (!this.pool) {
            return { totalCount: 0, idleCount: 0, waitingCount: 0 };
        }

        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount
        };
    }

    /**
     * Comprehensive database health check
     * @returns {Promise<Object>} Detailed health status
     */
    async isHealthy() {
        try {
            const healthInfo = {
                connected: this.isConnected,
                vector_extension: this.hasVectorExtension,
                pool_status: null,
                query_performance: null,
                disk_space: null,
                connection_count: null,
                last_error: null,
                timestamp: new Date().toISOString()
            };

            // Basic connectivity test
            const basicTest = await this.query('SELECT NOW() as current_time, version() as db_version');
            healthInfo.database_version = basicTest.rows[0].db_version;
            healthInfo.server_time = basicTest.rows[0].current_time;

            // Pool status
            if (this.pool) {
                healthInfo.pool_status = {
                    total_connections: this.pool.totalCount,
                    idle_connections: this.pool.idleCount,
                    waiting_clients: this.pool.waitingCount,
                    max_connections: this.config.max
                };
            }

            // Query performance statistics
            healthInfo.query_performance = {
                ...this.queryStats,
                success_rate: this.queryStats.totalQueries > 0 ? 
                    ((this.queryStats.totalQueries - this.queryStats.errorQueries) / this.queryStats.totalQueries * 100).toFixed(2) + '%' 
                    : '100%'
            };

            // Vector extension health
            if (this.hasVectorExtension) {
                try {
                    const vectorTest = await this.query(`SELECT '[1,2,3]'::vector(3) <-> '[1,2,4]'::vector(3) as similarity`);
                    healthInfo.vector_operations = 'healthy';
                    healthInfo.vector_test_similarity = vectorTest.rows[0].similarity;
                } catch (vectorError) {
                    healthInfo.vector_operations = 'error';
                    healthInfo.vector_error = vectorError.message;
                }
            }

            // Database disk space and activity
            try {
                const diskSpace = await this.query(`
                    SELECT 
                        pg_size_pretty(pg_database_size(current_database())) as database_size,
                        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
                        (SELECT count(*) FROM pg_stat_activity) as total_connections
                `);
                
                healthInfo.disk_space = diskSpace.rows[0].database_size;
                healthInfo.connection_count = {
                    active: diskSpace.rows[0].active_connections,
                    total: diskSpace.rows[0].total_connections
                };
            } catch (spaceError) {
                healthInfo.disk_space_error = spaceError.message;
            }

            return healthInfo;

        } catch (error) {
            console.error('Comprehensive health check failed:', error.message);
            return {
                connected: false,
                vector_extension: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get detailed database performance metrics
     * @returns {Promise<Object>} Performance metrics
     */
    async getPerformanceMetrics() {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }

        try {
            const metrics = {
                connection_stats: this.getStats(),
                query_stats: { ...this.queryStats },
                database_stats: null,
                vector_stats: null,
                timestamp: new Date().toISOString()
            };

            // Database activity metrics
            const dbStats = await this.query(`
                SELECT 
                    numbackends as connections,
                    xact_commit as committed_transactions,
                    xact_rollback as rolled_back_transactions,
                    blks_read as blocks_read,
                    blks_hit as blocks_hit,
                    tup_returned as tuples_returned,
                    tup_fetched as tuples_fetched,
                    tup_inserted as tuples_inserted,
                    tup_updated as tuples_updated,
                    tup_deleted as tuples_deleted
                FROM pg_stat_database 
                WHERE datname = current_database()
            `);

            metrics.database_stats = dbStats.rows[0];

            // Vector-specific metrics if available
            if (this.hasVectorExtension) {
                const vectorStats = await this.query(`
                    SELECT 
                        schemaname,
                        tablename,
                        attname,
                        n_distinct,
                        correlation
                    FROM pg_stats 
                    WHERE attname = 'embedding' 
                    AND tablename IN ('adrs', 'patterns')
                `);

                metrics.vector_stats = vectorStats.rows;
            }

            return metrics;

        } catch (error) {
            console.error('Failed to get performance metrics:', error.message);
            throw error;
        }
    }

    /**
     * Optimize database for vector operations
     * @returns {Promise<void>}
     */
    async optimizeForVectorSearch() {
        if (!this.hasVectorExtension) {
            console.warn('Cannot optimize for vector search - pgvector extension not available');
            return;
        }

        console.log('🔧 Optimizing database for vector search operations...');

        try {
            // Create vector indexes if they don't exist
            await this.createVectorIndexes();

            // Update table statistics
            await this.query('ANALYZE adrs');
            await this.query('ANALYZE patterns');

            // Set optimal configuration for vector operations
            const optimizations = [
                "SET effective_cache_size = '4GB'",
                "SET work_mem = '256MB'",
                "SET maintenance_work_mem = '1GB'",
                "SET max_parallel_workers_per_gather = 4",
                "SET random_page_cost = 1.1",
            ];

            for (const optimization of optimizations) {
                try {
                    await this.query(optimization);
                } catch (optError) {
                    console.warn(`Could not apply optimization: ${optimization}`, optError.message);
                }
            }

            console.log('✅ Database optimization for vector search completed');

        } catch (error) {
            console.error('Failed to optimize database for vector search:', error.message);
            throw error;
        }
    }

    /**
     * Create vector indexes for optimal similarity search performance
     * @private
     */
    async createVectorIndexes() {
        const indexes = [
            {
                table: 'adrs',
                name: 'idx_adrs_embedding_cosine',
                query: 'CREATE INDEX IF NOT EXISTS idx_adrs_embedding_cosine ON adrs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)'
            },
            {
                table: 'adrs', 
                name: 'idx_adrs_embedding_l2',
                query: 'CREATE INDEX IF NOT EXISTS idx_adrs_embedding_l2 ON adrs USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)'
            },
            {
                table: 'patterns',
                name: 'idx_patterns_embedding_cosine', 
                query: 'CREATE INDEX IF NOT EXISTS idx_patterns_embedding_cosine ON patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)'
            },
            {
                table: 'patterns',
                name: 'idx_patterns_embedding_l2',
                query: 'CREATE INDEX IF NOT EXISTS idx_patterns_embedding_l2 ON patterns USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)'
            }
        ];

        for (const index of indexes) {
            try {
                console.log(`🔨 Creating vector index: ${index.name}`);
                await this.query(index.query);
                console.log(`✅ Vector index ${index.name} ready`);
            } catch (indexError) {
                console.warn(`⚠️  Could not create index ${index.name}:`, indexError.message);
                // Continue with other indexes even if one fails
            }
        }
    }

    /**
     * Monitor and log database performance periodically
     * @param {number} intervalMs - Monitoring interval in milliseconds
     */
    startPerformanceMonitoring(intervalMs = 300000) { // Default 5 minutes
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(async () => {
            try {
                const metrics = await this.getPerformanceMetrics();
                
                // Log warnings for concerning metrics
                if (metrics.connection_stats.waitingCount > 5) {
                    console.warn(`⚠️  High connection queue: ${metrics.connection_stats.waitingCount} waiting clients`);
                }
                
                if (metrics.query_stats.averageQueryTime > 1000) {
                    console.warn(`⚠️  High average query time: ${metrics.query_stats.averageQueryTime.toFixed(2)}ms`);
                }
                
                const errorRate = (metrics.query_stats.errorQueries / metrics.query_stats.totalQueries) * 100;
                if (errorRate > 5) {
                    console.warn(`⚠️  High query error rate: ${errorRate.toFixed(2)}%`);
                }
                
                // Log performance summary every hour
                if (Date.now() % (60 * 60 * 1000) < intervalMs) {
                    console.log('📊 Database Performance Summary:', {
                        total_queries: metrics.query_stats.totalQueries,
                        vector_queries: metrics.query_stats.vectorQueries,
                        avg_query_time: `${metrics.query_stats.averageQueryTime.toFixed(2)}ms`,
                        pool_utilization: `${metrics.connection_stats.totalCount}/${this.config.max}`,
                        success_rate: `${((metrics.query_stats.totalQueries - metrics.query_stats.errorQueries) / metrics.query_stats.totalQueries * 100).toFixed(1)}%`
                    });
                }
                
            } catch (monitorError) {
                console.error('Performance monitoring error:', monitorError.message);
            }
        }, intervalMs);
        
        console.log(`📊 Database performance monitoring started (interval: ${intervalMs}ms)`);
    }

    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('📊 Database performance monitoring stopped');
        }
    }
}

// Singleton instance
let dbInstance = null;

/**
 * Get database instance (singleton pattern)
 * @param {Object} config - Database configuration
 * @returns {DatabaseConnection} Database instance
 */
function getDatabase(config) {
    if (!dbInstance) {
        dbInstance = new DatabaseConnection(config);
    }
    return dbInstance;
}

/**
 * Initialize database connection
 * @param {Object} config - Database configuration
 * @returns {Promise<DatabaseConnection>} Connected database instance
 */
async function initializeDatabase(config) {
    const db = getDatabase(config);
    if (!db.isConnected) {
        await db.connect();
    }
    return db;
}

module.exports = {
    DatabaseConnection,
    getDatabase,
    initializeDatabase
};