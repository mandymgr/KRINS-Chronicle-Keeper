/**
 * Database Connection and Pool Management for Dev Memory OS
 * Handles PostgreSQL connections with pgvector support
 */

const { Pool } = require('pg');

class DatabaseConnection {
    constructor(config = {}) {
        this.config = {
            user: config.user || process.env.DB_USER || 'krinschron',
            host: config.host || process.env.DB_HOST || 'localhost',
            database: config.database || process.env.DB_NAME || 'krins_chronicle',
            password: config.password || process.env.DB_PASSWORD || 'krins_chronicle_secure_2025',
            port: config.port || process.env.DB_PORT || 5433,
            max: config.max || 20, // Maximum number of clients in the pool
            idleTimeoutMillis: config.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
            ...config
        };

        this.pool = null;
        this.isConnected = false;
        this.hasVectorExtension = false;
    }

    /**
     * Initialize database connection pool
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            this.pool = new Pool(this.config);

            // Test the connection
            const client = await this.pool.connect();
            
            // Check if pgvector extension is available (warn if not available, don't fail)
            const vectorCheck = await client.query('SELECT 1 FROM pg_extension WHERE extname = $1', ['vector']);
            if (vectorCheck.rows.length === 0) {
                console.warn('⚠️  pgvector extension is not installed - vector search will use fallback methods');
                this.hasVectorExtension = false;
            } else {
                console.log('✅ pgvector extension is available');
                this.hasVectorExtension = true;
            }

            console.log('Database connected successfully with pgvector support');
            client.release();
            
            this.isConnected = true;

            // Handle pool errors
            this.pool.on('error', (err) => {
                console.error('Unexpected database pool error:', err);
                this.isConnected = false;
            });

        } catch (error) {
            console.error('Failed to connect to database:', error.message);
            throw error;
        }
    }

    /**
     * Execute a query with parameters
     * @param {string} text - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Object>} Query result
     */
    async query(text, params) {
        if (!this.isConnected || !this.pool) {
            throw new Error('Database not connected. Call connect() first.');
        }

        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            
            if (duration > 1000) {
                console.warn(`Slow query detected (${duration}ms):`, text.substring(0, 100));
            }
            
            return result;
        } catch (error) {
            console.error('Database query error:', error.message);
            console.error('Query:', text);
            console.error('Parameters:', params);
            throw error;
        }
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
     * Check if database is healthy
     * @returns {Promise<boolean>} Health status
     */
    async isHealthy() {
        try {
            const result = await this.query('SELECT 1 as health_check');
            return result.rows.length === 1;
        } catch (error) {
            console.error('Database health check failed:', error.message);
            return false;
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