/**
 * 🧠 KRINS Memory Store
 * PostgreSQL with pgvector for high-performance semantic memory storage
 */

import pkg from 'pg';
const { Client, Pool } = pkg;
import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';

export class MemoryStore {
  constructor(config = {}) {
    this.config = {
      host: config.host || process.env.POSTGRES_HOST || 'localhost',
      port: config.port || process.env.POSTGRES_PORT || 5432,
      database: config.database || process.env.POSTGRES_DB || 'krins_memory',
      user: config.user || process.env.POSTGRES_USER || 'postgres',
      password: config.password || process.env.POSTGRES_PASSWORD || 'password',
      max: config.max || 20, // max pool connections
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
      ...config
    };

    this.pool = null;
    this.isConnected = false;

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [MemoryStore] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });

    this.stats = {
      total_stored: 0,
      total_retrieved: 0,
      total_searches: 0,
      connection_errors: 0
    };
  }

  /**
   * Initialize PostgreSQL connection with pgvector
   */
  async initialize() {
    try {
      this.logger.info('Initializing PostgreSQL connection with pgvector...');

      // Create connection pool
      this.pool = new Pool(this.config);

      // Test connection
      const client = await this.pool.connect();
      
      try {
        // Test basic connectivity
        const result = await client.query('SELECT NOW()');
        this.logger.info('Database connection established', { 
          server_time: result.rows[0].now 
        });

        // Enable pgvector extension
        await client.query('CREATE EXTENSION IF NOT EXISTS vector');
        this.logger.info('pgvector extension enabled');

        // Create tables if they don't exist
        await this.createTables(client);
        
        this.isConnected = true;
        this.logger.info('Memory store initialization completed successfully');
        
      } finally {
        client.release();
      }

    } catch (error) {
      this.stats.connection_errors++;
      this.logger.error('Failed to initialize memory store', { error: error.message });
      throw new Error(`Memory store initialization failed: ${error.message}`);
    }
  }

  /**
   * Create necessary database tables
   */
  async createTables(client) {
    const createTablesSQL = `
      -- Main memory table with pgvector embeddings
      CREATE TABLE IF NOT EXISTS memories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'general',
        embedding vector(512), -- Universal Sentence Encoder produces 512-dim vectors
        metadata JSONB DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        source VARCHAR(100) DEFAULT 'api'
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
      CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING gin(tags);
      CREATE INDEX IF NOT EXISTS idx_memories_metadata ON memories USING gin(metadata);
      
      -- Create vector similarity index (HNSW for fast similarity search)
      CREATE INDEX IF NOT EXISTS idx_memories_embedding_hnsw 
      ON memories USING hnsw (embedding vector_cosine_ops) 
      WITH (m = 16, ef_construction = 64);

      -- Create IVFFlat index as alternative
      CREATE INDEX IF NOT EXISTS idx_memories_embedding_ivfflat
      ON memories USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);

      -- Search analytics table
      CREATE TABLE IF NOT EXISTS search_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        query TEXT NOT NULL,
        query_embedding vector(512),
        results_count INTEGER DEFAULT 0,
        max_similarity FLOAT DEFAULT 0,
        search_time_ms INTEGER DEFAULT 0,
        filters JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Pattern matching table for AI integration
      CREATE TABLE IF NOT EXISTS ai_patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pattern_name VARCHAR(200) NOT NULL,
        pattern_type VARCHAR(100) NOT NULL,
        pattern_content TEXT NOT NULL,
        pattern_embedding vector(512),
        language VARCHAR(50) DEFAULT 'typescript',
        specialist_id VARCHAR(100),
        usage_count INTEGER DEFAULT 0,
        success_rate FLOAT DEFAULT 100.0,
        metadata JSONB DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for AI patterns
      CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON ai_patterns(pattern_type);
      CREATE INDEX IF NOT EXISTS idx_ai_patterns_language ON ai_patterns(language);
      CREATE INDEX IF NOT EXISTS idx_ai_patterns_specialist ON ai_patterns(specialist_id);
      CREATE INDEX IF NOT EXISTS idx_ai_patterns_embedding_hnsw 
      ON ai_patterns USING hnsw (pattern_embedding vector_cosine_ops) 
      WITH (m = 16, ef_construction = 64);

      -- Update trigger for timestamps
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER IF NOT EXISTS update_memories_updated_at 
        BEFORE UPDATE ON memories 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await client.query(createTablesSQL);
    this.logger.info('Database tables created/verified successfully');
  }

  /**
   * Store memory item with embedding
   */
  async store(memoryItem) {
    if (!this.isConnected) {
      throw new Error('Memory store not initialized');
    }

    const {
      content,
      type = 'general',
      embedding,
      metadata = {},
      tags = [],
      source = 'api'
    } = memoryItem;

    if (!content || typeof content !== 'string') {
      throw new Error('Content is required and must be a string');
    }

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Embedding is required and must be an array');
    }

    const client = await this.pool.connect();
    
    try {
      const id = uuidv4();
      const embeddingVector = `[${embedding.join(',')}]`;
      
      const query = `
        INSERT INTO memories (id, content, type, embedding, metadata, tags, source)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
      `;
      
      const result = await client.query(query, [
        id,
        content,
        type,
        embeddingVector,
        JSON.stringify(metadata),
        tags,
        source
      ]);

      this.stats.total_stored++;
      
      this.logger.info('Memory item stored', {
        id,
        type,
        content_length: content.length,
        tags_count: tags.length
      });

      return {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      };

    } catch (error) {
      this.logger.error('Failed to store memory item', { error: error.message });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve memory item by ID
   */
  async get(id) {
    if (!this.isConnected) {
      throw new Error('Memory store not initialized');
    }

    if (!id) {
      throw new Error('ID is required');
    }

    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT id, content, type, metadata, tags, source, created_at, updated_at
        FROM memories 
        WHERE id = $1
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      this.stats.total_retrieved++;
      
      const memory = {
        ...result.rows[0],
        metadata: result.rows[0].metadata || {}
      };

      this.logger.debug('Memory item retrieved', { id, type: memory.type });
      
      return memory;

    } catch (error) {
      this.logger.error('Failed to retrieve memory item', { id, error: error.message });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Search memories using vector similarity
   */
  async searchSimilar(queryEmbedding, options = {}) {
    if (!this.isConnected) {
      throw new Error('Memory store not initialized');
    }

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      throw new Error('Query embedding is required and must be an array');
    }

    const {
      limit = 10,
      threshold = 0.7,
      type_filter = null,
      tags_filter = [],
      metadata_filter = {}
    } = options;

    const client = await this.pool.connect();
    const startTime = Date.now();
    
    try {
      let whereClause = '';
      let queryParams = [`[${queryEmbedding.join(',')}]`, limit];
      let paramCount = 2;

      // Build WHERE clause for filters
      const conditions = [];
      
      if (type_filter) {
        conditions.push(`type = $${++paramCount}`);
        queryParams.push(type_filter);
      }
      
      if (tags_filter.length > 0) {
        conditions.push(`tags && $${++paramCount}`);
        queryParams.push(tags_filter);
      }
      
      // Add metadata filters
      for (const [key, value] of Object.entries(metadata_filter)) {
        conditions.push(`metadata->>'${key}' = $${++paramCount}`);
        queryParams.push(value);
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      const query = `
        SELECT 
          id, content, type, metadata, tags, source, created_at,
          1 - (embedding <=> $1) as similarity
        FROM memories
        ${whereClause}
        ORDER BY embedding <=> $1
        LIMIT $2
      `;
      
      const result = await client.query(query, queryParams);
      
      // Filter by similarity threshold
      const filteredResults = result.rows.filter(row => row.similarity >= threshold);
      
      const searchTime = Date.now() - startTime;
      this.stats.total_searches++;

      this.logger.info('Vector similarity search completed', {
        results_found: filteredResults.length,
        search_time_ms: searchTime,
        threshold,
        filters: { type_filter, tags_filter, metadata_filter }
      });

      // Store search analytics
      await this.storeSearchAnalytics(client, {
        query_embedding: queryEmbedding,
        results_count: filteredResults.length,
        max_similarity: filteredResults[0]?.similarity || 0,
        search_time_ms: searchTime,
        filters: { type_filter, tags_filter, metadata_filter }
      });

      return {
        results: filteredResults.map(row => ({
          ...row,
          similarity: Math.round(row.similarity * 10000) / 10000, // 4 decimal places
          metadata: row.metadata || {}
        })),
        search_time: searchTime,
        total_found: filteredResults.length
      };

    } catch (error) {
      this.logger.error('Vector search failed', { error: error.message });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Store search analytics
   */
  async storeSearchAnalytics(client, analytics) {
    try {
      const {
        query = 'vector_search',
        query_embedding,
        results_count,
        max_similarity,
        search_time_ms,
        filters
      } = analytics;

      const embeddingVector = `[${query_embedding.join(',')}]`;
      
      const insertQuery = `
        INSERT INTO search_analytics (query, query_embedding, results_count, max_similarity, search_time_ms, filters)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      await client.query(insertQuery, [
        query,
        embeddingVector,
        results_count,
        max_similarity,
        search_time_ms,
        JSON.stringify(filters)
      ]);

    } catch (error) {
      this.logger.error('Failed to store search analytics', { error: error.message });
      // Don't throw - analytics failure shouldn't break search
    }
  }

  /**
   * Get store analytics
   */
  async getAnalytics() {
    if (!this.isConnected) {
      return this.stats;
    }

    const client = await this.pool.connect();
    
    try {
      const queries = [
        'SELECT COUNT(*) as total_memories FROM memories',
        'SELECT type, COUNT(*) as count FROM memories GROUP BY type',
        'SELECT AVG(search_time_ms) as avg_search_time, COUNT(*) as total_searches FROM search_analytics',
        'SELECT COUNT(*) as total_ai_patterns FROM ai_patterns'
      ];

      const results = await Promise.all(
        queries.map(query => client.query(query))
      );

      return {
        ...this.stats,
        total_memories: parseInt(results[0].rows[0].total_memories),
        memories_by_type: results[1].rows.reduce((acc, row) => {
          acc[row.type] = parseInt(row.count);
          return acc;
        }, {}),
        average_search_time_ms: parseFloat(results[2].rows[0]?.avg_search_time || 0),
        database_searches: parseInt(results[2].rows[0]?.total_searches || 0),
        total_ai_patterns: parseInt(results[3].rows[0].total_ai_patterns)
      };

    } catch (error) {
      this.logger.error('Failed to get analytics', { error: error.message });
      return this.stats;
    } finally {
      client.release();
    }
  }

  /**
   * Store AI pattern
   */
  async storeAIPattern(pattern) {
    if (!this.isConnected) {
      throw new Error('Memory store not initialized');
    }

    const {
      pattern_name,
      pattern_type,
      pattern_content,
      pattern_embedding,
      language = 'typescript',
      specialist_id,
      metadata = {},
      tags = []
    } = pattern;

    const client = await this.pool.connect();
    
    try {
      const id = uuidv4();
      const embeddingVector = `[${pattern_embedding.join(',')}]`;
      
      const query = `
        INSERT INTO ai_patterns (id, pattern_name, pattern_type, pattern_content, pattern_embedding, language, specialist_id, metadata, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `;
      
      const result = await client.query(query, [
        id,
        pattern_name,
        pattern_type,
        pattern_content,
        embeddingVector,
        language,
        specialist_id,
        JSON.stringify(metadata),
        tags
      ]);

      this.logger.info('AI pattern stored', {
        id,
        pattern_name,
        pattern_type,
        language,
        specialist_id
      });

      return {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      };

    } catch (error) {
      this.logger.error('Failed to store AI pattern', { error: error.message });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.isConnected;
  }

  /**
   * Close connection pool
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      this.logger.info('Memory store connection pool closed');
    }
  }
}