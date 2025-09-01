/**
 * 🧠 RAG System - Retrieval Augmented Generation Intelligence
 * 
 * Advanced knowledge retrieval with Supabase + pgvector for
 * semantic search and context-aware AI responses.
 * 
 * @author Krin - Superintelligence Knowledge Architect 🧠💝
 */

const { Pool } = require('pg');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

class RAGSystem {
  constructor() {
    this.pg = null;
    this.openai = null;
    this.initialized = false;
    this.embeddingModel = 'text-embedding-ada-002'; 
    this.vectorDimension = 1536; // Standard ada-002 embedding dimension, compatible with pgvector ivfflat
    this.knowledgeBase = new Map();
    
    console.log('🧠 RAG System initializing...');
  }

  /**
   * Initialize RAG system with Supabase and OpenAI
   */
  async initialize() {
    try {
      console.log('🔧 Setting up RAG intelligence system...');
      
      // Initialize PostgreSQL client
      await this.initializePostgreSQL();
      
      // Initialize OpenAI client
      await this.initializeOpenAI();
      
      // Setup vector database
      await this.setupVectorDatabase();
      
      // Load initial knowledge base
      await this.loadInitialKnowledge();
      
      this.initialized = true;
      console.log('✅ RAG System fully operational!');
      
    } catch (error) {
      console.error('❌ Failed to initialize RAG system:', error);
      // Continue without RAG for graceful degradation
      this.initialized = false;
    }
  }

  /**
   * Initialize PostgreSQL client for Railway
   */
  async initializePostgreSQL() {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (databaseUrl) {
      // Railway provides DATABASE_URL
      this.pg = new Pool({ connectionString: databaseUrl });
    } else {
      // Local development fallback
      this.pg = new Pool({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'krins_superintelligence',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password'
      });
    }
    
    // Test connection
    try {
      await this.pg.query('SELECT 1');
      console.log('✅ PostgreSQL connection established');
    } catch (error) {
      console.warn('⚠️  PostgreSQL connection failed, using local fallback:', error.message);
      this.pg = null;
    }
  }

  /**
   * Initialize OpenAI client
   */
  async initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY || 'your-openai-key';
    
    if (apiKey && apiKey !== 'your-openai-key') {
      this.openai = new OpenAI({ apiKey });
      
      // Test API connection
      try {
        const response = await this.openai.embeddings.create({
          model: this.embeddingModel,
          input: 'Test embedding',
        });
        
        console.log('✅ OpenAI API connection established');
      } catch (error) {
        console.warn('⚠️  OpenAI API connection failed:', error.message);
        this.openai = null;
      }
    } else {
      console.warn('⚠️  OpenAI API key not found, using local embeddings');
      this.openai = null;
    }
  }

  /**
   * Setup vector database schema
   */
  async setupVectorDatabase() {
    if (!this.pg) return;

    try {
      // Enable pgvector extension
      await this.pg.query('CREATE EXTENSION IF NOT EXISTS vector');
      
      // Create knowledge table with vector support
      await this.pg.query(`
        CREATE TABLE IF NOT EXISTS krins_knowledge (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT,
          tags TEXT[],
          source TEXT,
          embedding vector(${this.vectorDimension}),
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'
        )
      `);

      // Create vector similarity search index
      await this.pg.query(`
        CREATE INDEX IF NOT EXISTS krins_knowledge_embedding_idx 
        ON krins_knowledge USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);

      console.log('✅ Vector database schema ready');
    } catch (error) {
      console.warn('⚠️  Vector database setup failed:', error.message);
    }
  }

  /**
   * Load initial knowledge base
   */
  async loadInitialKnowledge() {
    const knowledgeData = [
      {
        id: uuidv4(),
        title: 'Krins Multi-Agent Architecture',
        content: 'Krins superintelligence system uses 7 specialized agents: Architect, Security, Performance, Product, Compliance, Research, and Red Team. Each agent has unique expertise and works collaboratively.',
        category: 'architecture',
        tags: ['agents', 'architecture', 'superintelligence'],
        source: 'krins_system',
        timestamp: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Revolutionary Development Principles',
        content: 'ALLTID BEST LØSNING PRINSIPPET: Always work toward the most elegant, complete solution. Never take shortcuts. Perfect implementation over quick fixes.',
        category: 'principles',
        tags: ['principles', 'quality', 'excellence'],
        source: 'krins_memory',
        timestamp: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Advanced AI Coordination',
        content: 'Multi-agent coordination with RAG integration, scenario extrapolation (1-1000+ years), self-improvement loops, and meta-reflection capabilities.',
        category: 'ai_systems',
        tags: ['ai', 'coordination', 'rag', 'scenarios'],
        source: 'krins_system',
        timestamp: new Date().toISOString()
      }
    ];

    // Store in local knowledge base
    knowledgeData.forEach(item => {
      this.knowledgeBase.set(item.id, item);
    });

    // Store in vector database if available
    if (this.supabase && this.openai) {
      for (const item of knowledgeData) {
        await this.storeKnowledge(item);
      }
    }

    console.log(`✅ Initial knowledge base loaded: ${knowledgeData.length} items`);
  }

  /**
   * Store knowledge with vector embedding
   */
  async storeKnowledge(knowledgeItem) {
    try {
      // Generate embedding if OpenAI is available
      let embedding = null;
      if (this.openai) {
        const response = await this.openai.embeddings.create({
          model: this.embeddingModel,
          input: `${knowledgeItem.title} ${knowledgeItem.content}`,
        });
        embedding = response.data[0].embedding;
      }

      // Store locally
      this.knowledgeBase.set(knowledgeItem.id, {
        ...knowledgeItem,
        embedding
      });

      // Store in PostgreSQL if available
      if (this.pg) {
        await this.pg.query(`
          INSERT INTO krins_knowledge (id, title, content, category, tags, source, embedding, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            category = EXCLUDED.category,
            tags = EXCLUDED.tags,
            source = EXCLUDED.source,
            embedding = EXCLUDED.embedding,
            timestamp = EXCLUDED.timestamp
        `, [
          knowledgeItem.id,
          knowledgeItem.title,
          knowledgeItem.content,
          knowledgeItem.category,
          knowledgeItem.tags,
          knowledgeItem.source,
          embedding ? JSON.stringify(embedding) : null,
          knowledgeItem.timestamp
        ]);
      }

      return knowledgeItem.id;
      
    } catch (error) {
      console.error('❌ Failed to store knowledge:', error);
      return null;
    }
  }

  /**
   * Query knowledge base with semantic search
   */
  async query(query, options = {}) {
    const {
      limit = 10,
      threshold = 0.7,
      category = null,
      agent = null
    } = options;

    try {
      console.log(`🔍 Querying RAG system: "${query.substring(0, 100)}..."`);

      let results = [];

      // Semantic search with embeddings if available
      if (this.pg && this.openai) {
        results = await this.semanticSearch(query, { limit, threshold, category });
      }

      // Fallback to local text search
      if (results.length === 0) {
        results = await this.localTextSearch(query, { limit, category });
      }

      console.log(`✅ RAG query complete: ${results.length} results found`);
      
      return {
        query,
        results,
        method: this.pg && this.openai ? 'semantic' : 'local',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ RAG query failed:', error);
      return {
        query,
        results: [],
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Semantic search using vector similarity
   */
  async semanticSearch(query, options) {
    try {
      // Generate query embedding
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: query,
      });
      const queryEmbedding = response.data[0].embedding;

      // Search vector database using PostgreSQL
      let query_sql = `
        SELECT id, title, content, category, tags, source, timestamp,
               1 - (embedding <=> $1::vector) as similarity
        FROM krins_knowledge
        WHERE 1 - (embedding <=> $1::vector) > $2
      `;
      
      let params = [JSON.stringify(queryEmbedding), options.threshold || 0.7];
      
      if (options.category) {
        query_sql += ` AND category = $3`;
        params.push(options.category);
      }
      
      query_sql += ` ORDER BY similarity DESC LIMIT $${params.length + 1}`;
      params.push(options.limit || 10);

      const result = await this.pg.query(query_sql, params);
      return result.rows || [];
      
    } catch (error) {
      console.warn('⚠️  Semantic search error:', error.message);
      return [];
    }
  }

  /**
   * Local text search fallback
   */
  async localTextSearch(query, options) {
    const queryLower = query.toLowerCase();
    const results = [];

    for (const [id, item] of this.knowledgeBase.entries()) {
      if (options.category && item.category !== options.category) {
        continue;
      }

      // Simple text matching
      const titleMatch = item.title.toLowerCase().includes(queryLower);
      const contentMatch = item.content.toLowerCase().includes(queryLower);
      const tagMatch = item.tags.some(tag => 
        tag.toLowerCase().includes(queryLower) || 
        queryLower.includes(tag.toLowerCase())
      );

      if (titleMatch || contentMatch || tagMatch) {
        results.push({
          ...item,
          similarity: titleMatch ? 0.9 : (contentMatch ? 0.7 : 0.5)
        });
      }

      if (results.length >= options.limit) break;
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Add new knowledge to the system
   */
  async addKnowledge(title, content, category = 'general', tags = [], source = 'user') {
    const knowledgeItem = {
      id: uuidv4(),
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : [tags],
      source,
      timestamp: new Date().toISOString()
    };

    const id = await this.storeKnowledge(knowledgeItem);
    
    if (id) {
      console.log(`✅ Knowledge added: "${title}"`);
      return id;
    } else {
      console.error(`❌ Failed to add knowledge: "${title}"`);
      return null;
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      postgresConnected: !!this.pg,
      openaiConnected: !!this.openai,
      knowledgeCount: this.knowledgeBase.size,
      embeddingModel: this.embeddingModel,
      vectorDimension: this.vectorDimension,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate contextual response using RAG
   */
  async generateResponse(query, context = {}) {
    try {
      // Query knowledge base
      const knowledge = await this.query(query, { limit: 5 });
      
      // This would integrate with LLM for response generation
      // For now, return structured knowledge
      return {
        query,
        context,
        knowledge: knowledge.results,
        response: `Based on ${knowledge.results.length} knowledge sources, here are the relevant insights...`,
        confidence: knowledge.results.length > 0 ? 0.8 : 0.3,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ RAG response generation failed:', error);
      return {
        query,
        context,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = RAGSystem;