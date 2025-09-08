/**
 * 🧠 KRINS Semantic Search Engine
 * Advanced TensorFlow-based semantic similarity and embedding generation
 */

import * as tf from '@tensorflow/tfjs-node';
import * as use from 'universal-sentence-encoder';
import { createLogger, format, transports } from 'winston';

export class SemanticSearchEngine {
  constructor(config = {}) {
    this.model = null;
    this.isModelReady = false;
    this.config = {
      similarity_threshold: config.similarity_threshold || 0.7,
      max_results: config.max_results || 50,
      cache_embeddings: config.cache_embeddings !== false,
      ...config
    };
    
    // Embedding cache for performance
    this.embeddingCache = new Map();
    this.searchStats = {
      total_searches: 0,
      total_embeddings: 0,
      cache_hits: 0,
      average_response_time: 0
    };

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [SemanticEngine] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new transports.Console({ level: 'info' })
      ]
    });
  }

  /**
   * Initialize the Universal Sentence Encoder model
   */
  async initialize() {
    try {
      this.logger.info('Loading Universal Sentence Encoder model...');
      const startTime = Date.now();
      
      // Load the Universal Sentence Encoder model
      this.model = await use.load();
      
      const loadTime = Date.now() - startTime;
      this.isModelReady = true;
      
      this.logger.info('Universal Sentence Encoder model loaded successfully', {
        load_time: `${loadTime}ms`,
        model_ready: true
      });
      
      // Test the model with a sample sentence
      await this.generateEmbedding('Test initialization');
      this.logger.info('Model initialization test completed');
      
    } catch (error) {
      this.logger.error('Failed to initialize semantic engine', { error: error.message });
      throw new Error(`Semantic engine initialization failed: ${error.message}`);
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text, useCache = true) {
    if (!this.isModelReady) {
      throw new Error('Semantic engine not initialized. Call initialize() first.');
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Text must be a non-empty string');
    }

    const normalizedText = text.trim().toLowerCase();
    
    // Check cache first
    if (useCache && this.config.cache_embeddings && this.embeddingCache.has(normalizedText)) {
      this.searchStats.cache_hits++;
      return this.embeddingCache.get(normalizedText);
    }

    try {
      const startTime = Date.now();
      
      // Generate embedding using Universal Sentence Encoder
      const embeddings = await this.model.embed([text]);
      const embedding = await embeddings.array();
      const embeddingVector = embedding[0]; // Get first (and only) embedding
      
      // Cleanup TensorFlow tensors
      embeddings.dispose();
      
      const processingTime = Date.now() - startTime;
      this.searchStats.total_embeddings++;
      
      // Cache the embedding
      if (useCache && this.config.cache_embeddings) {
        this.embeddingCache.set(normalizedText, embeddingVector);
        
        // Limit cache size to prevent memory issues
        if (this.embeddingCache.size > 10000) {
          const firstKey = this.embeddingCache.keys().next().value;
          this.embeddingCache.delete(firstKey);
        }
      }

      this.logger.debug('Generated embedding', {
        text: text.substring(0, 50) + '...',
        embedding_length: embeddingVector.length,
        processing_time: `${processingTime}ms`
      });

      return embeddingVector;
      
    } catch (error) {
      this.logger.error('Failed to generate embedding', { 
        error: error.message,
        text: text.substring(0, 100)
      });
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateSimilarity(vector1, vector2) {
    if (!Array.isArray(vector1) || !Array.isArray(vector2)) {
      throw new Error('Both vectors must be arrays');
    }
    
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same length');
    }

    // Calculate dot product
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    // Handle edge cases
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    // Calculate cosine similarity
    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    
    // Clamp to [-1, 1] range due to floating point precision
    return Math.max(-1, Math.min(1, similarity));
  }

  /**
   * Perform semantic search against stored embeddings
   */
  async search(query, options = {}) {
    const startTime = Date.now();
    this.searchStats.total_searches++;

    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Query must be a non-empty string');
      }

      const {
        embeddings_data = [],
        filters = {},
        limit = this.config.max_results,
        similarity_threshold = this.config.similarity_threshold,
        include_scores = true
      } = options;

      this.logger.info('Performing semantic search', {
        query: query.substring(0, 50) + '...',
        data_points: embeddings_data.length,
        threshold: similarity_threshold,
        limit
      });

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Calculate similarities
      const results = [];
      
      for (const item of embeddings_data) {
        if (!item.embedding) continue;
        
        // Apply filters
        let passes_filter = true;
        for (const [key, value] of Object.entries(filters)) {
          if (item.metadata && item.metadata[key] !== value) {
            passes_filter = false;
            break;
          }
        }
        
        if (!passes_filter) continue;

        // Calculate similarity
        const similarity = this.calculateSimilarity(queryEmbedding, item.embedding);
        
        if (similarity >= similarity_threshold) {
          const result = {
            id: item.id,
            content: item.content,
            type: item.type,
            metadata: item.metadata,
            tags: item.tags,
            similarity_score: similarity
          };

          if (include_scores) {
            result.similarity_score = Math.round(similarity * 10000) / 10000; // 4 decimal places
          }

          results.push(result);
        }
      }

      // Sort by similarity (highest first)
      results.sort((a, b) => b.similarity_score - a.similarity_score);
      
      // Limit results
      const limitedResults = results.slice(0, limit);
      
      const searchTime = Date.now() - startTime;
      
      // Update average response time
      this.searchStats.average_response_time = 
        (this.searchStats.average_response_time * (this.searchStats.total_searches - 1) + searchTime) / this.searchStats.total_searches;

      this.logger.info('Search completed', {
        query: query.substring(0, 50) + '...',
        results_found: limitedResults.length,
        search_time: `${searchTime}ms`,
        best_score: limitedResults[0]?.similarity_score || 0
      });

      return {
        results: limitedResults,
        query,
        search_time: searchTime,
        total_found: limitedResults.length,
        threshold_used: similarity_threshold
      };

    } catch (error) {
      this.logger.error('Search failed', { error: error.message, query });
      throw error;
    }
  }

  /**
   * Batch generate embeddings for multiple texts
   */
  async generateBatchEmbeddings(texts, batchSize = 32) {
    if (!Array.isArray(texts)) {
      throw new Error('Texts must be an array');
    }

    if (texts.length === 0) {
      return [];
    }

    this.logger.info('Generating batch embeddings', { 
      total_texts: texts.length,
      batch_size: batchSize
    });

    const embeddings = [];
    
    // Process in batches to avoid memory issues
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const startTime = Date.now();
      
      try {
        const batchEmbeddings = await this.model.embed(batch);
        const embeddingArrays = await batchEmbeddings.array();
        
        embeddings.push(...embeddingArrays);
        
        // Cleanup
        batchEmbeddings.dispose();
        
        const processingTime = Date.now() - startTime;
        this.logger.debug('Processed batch', {
          batch_number: Math.floor(i / batchSize) + 1,
          batch_size: batch.length,
          processing_time: `${processingTime}ms`
        });
        
      } catch (error) {
        this.logger.error('Batch processing failed', { 
          batch_start: i,
          batch_size: batch.length,
          error: error.message
        });
        throw error;
      }
    }

    this.searchStats.total_embeddings += embeddings.length;
    
    this.logger.info('Batch embedding generation completed', {
      total_embeddings: embeddings.length
    });

    return embeddings;
  }

  /**
   * Get engine statistics
   */
  async getStats() {
    return {
      model_ready: this.isModelReady,
      cache_size: this.embeddingCache.size,
      ...this.searchStats,
      memory_usage: {
        cache_size_mb: Math.round(JSON.stringify([...this.embeddingCache]).length / 1024 / 1024 * 100) / 100
      }
    };
  }

  /**
   * Clear embedding cache
   */
  clearCache() {
    this.embeddingCache.clear();
    this.logger.info('Embedding cache cleared');
  }

  /**
   * Check if engine is ready
   */
  isReady() {
    return this.isModelReady;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.clearCache();
    if (this.model) {
      // TensorFlow cleanup is handled automatically
      this.model = null;
      this.isModelReady = false;
    }
    this.logger.info('Semantic engine cleaned up');
  }
}