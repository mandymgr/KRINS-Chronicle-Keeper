/**
 * Embedding Service for Dev Memory OS
 * Provides OpenAI embeddings integration for semantic search
 * Supports batch processing and real-time embedding generation
 */

const crypto = require('crypto');

class EmbeddingService {
    constructor(options = {}) {
        this.openaiApiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;
        this.openaiApiUrl = 'https://api.openai.com/v1/embeddings';
        this.model = options.model || 'text-embedding-ada-002';
        this.maxTokens = options.maxTokens || 8191; // Ada-002 limit
        this.batchSize = options.batchSize || 100; // OpenAI batch limit
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
        
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
        }
    }

    /**
     * Generate embedding for a single text
     * @param {string} text - Text to embed
     * @param {Object} options - Additional options
     * @returns {Promise<number[]>} Embedding vector (1536 dimensions for ada-002)
     */
    async generateEmbedding(text, options = {}) {
        if (!text || typeof text !== 'string') {
            throw new Error('Text must be a non-empty string');
        }

        const processedText = this._preprocessText(text);
        
        try {
            const response = await this._callOpenAI([processedText], options);
            return response.data[0].embedding;
        } catch (error) {
            console.error('Failed to generate embedding:', error.message);
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    /**
     * Generate embeddings for multiple texts in batches
     * @param {string[]} texts - Array of texts to embed
     * @param {Object} options - Additional options
     * @returns {Promise<Object[]>} Array of {text, embedding, index} objects
     */
    async generateBatchEmbeddings(texts, options = {}) {
        if (!Array.isArray(texts) || texts.length === 0) {
            throw new Error('Texts must be a non-empty array');
        }

        const processedTexts = texts.map(text => this._preprocessText(text));
        const results = [];
        
        // Process in batches
        for (let i = 0; i < processedTexts.length; i += this.batchSize) {
            const batch = processedTexts.slice(i, i + this.batchSize);
            
            try {
                console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(processedTexts.length / this.batchSize)}`);
                
                const response = await this._callOpenAI(batch, options);
                
                response.data.forEach((item, batchIndex) => {
                    const originalIndex = i + batchIndex;
                    results.push({
                        text: texts[originalIndex],
                        embedding: item.embedding,
                        index: originalIndex
                    });
                });

                // Rate limiting: wait between batches
                if (i + this.batchSize < processedTexts.length) {
                    await this._delay(500);
                }
                
            } catch (error) {
                console.error(`Failed to process batch starting at index ${i}:`, error.message);
                
                // For batch failures, try individual processing
                for (let j = 0; j < batch.length; j++) {
                    try {
                        const singleResponse = await this._callOpenAI([batch[j]], options);
                        const originalIndex = i + j;
                        results.push({
                            text: texts[originalIndex],
                            embedding: singleResponse.data[0].embedding,
                            index: originalIndex
                        });
                    } catch (singleError) {
                        console.error(`Failed to process text at index ${i + j}:`, singleError.message);
                        results.push({
                            text: texts[i + j],
                            embedding: null,
                            error: singleError.message,
                            index: i + j
                        });
                    }
                    await this._delay(100);
                }
            }
        }

        return results;
    }

    /**
     * Generate embedding for ADR content
     * @param {Object} adr - ADR object with title, problem_statement, decision, etc.
     * @returns {Promise<number[]>} Embedding vector
     */
    async generateADREmbedding(adr) {
        if (!adr || typeof adr !== 'object') {
            throw new Error('ADR must be a valid object');
        }

        // Combine relevant ADR fields for embedding
        const content = this._combineADRContent(adr);
        return await this.generateEmbedding(content);
    }

    /**
     * Generate embedding for pattern content
     * @param {Object} pattern - Pattern object
     * @returns {Promise<number[]>} Embedding vector
     */
    async generatePatternEmbedding(pattern) {
        if (!pattern || typeof pattern !== 'object') {
            throw new Error('Pattern must be a valid object');
        }

        // Combine relevant pattern fields for embedding
        const content = this._combinePatternContent(pattern);
        return await this.generateEmbedding(content);
    }

    /**
     * Calculate cosine similarity between two embedding vectors
     * @param {number[]} embedding1 
     * @param {number[]} embedding2 
     * @returns {number} Similarity score (0-1, higher is more similar)
     */
    calculateSimilarity(embedding1, embedding2) {
        if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
            throw new Error('Embeddings must be arrays');
        }

        if (embedding1.length !== embedding2.length) {
            throw new Error('Embeddings must have the same length');
        }

        const dotProduct = embedding1.reduce((sum, val, i) => sum + (val * embedding2[i]), 0);
        const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + (val * val), 0));
        const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + (val * val), 0));

        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * Get embedding cache key for text
     * @param {string} text 
     * @returns {string} Hash-based cache key
     */
    getCacheKey(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    // Private methods

    /**
     * Preprocess text for embedding
     * @param {string} text 
     * @returns {string} Processed text
     */
    _preprocessText(text) {
        if (!text) return '';
        
        // Remove excessive whitespace and normalize
        let processed = text.trim().replace(/\s+/g, ' ');
        
        // Truncate if too long (rough token estimation: 1 token ≈ 4 characters)
        const maxChars = this.maxTokens * 4;
        if (processed.length > maxChars) {
            processed = processed.substring(0, maxChars).trim();
        }

        return processed;
    }

    /**
     * Combine ADR fields for embedding
     * @param {Object} adr 
     * @returns {string} Combined content
     */
    _combineADRContent(adr) {
        const parts = [];
        
        if (adr.title) parts.push(`Title: ${adr.title}`);
        if (adr.problem_statement) parts.push(`Problem: ${adr.problem_statement}`);
        if (adr.decision) parts.push(`Decision: ${adr.decision}`);
        if (adr.rationale) parts.push(`Rationale: ${adr.rationale}`);
        
        if (adr.alternatives && Array.isArray(adr.alternatives)) {
            const altText = adr.alternatives.map(alt => 
                typeof alt === 'string' ? alt : JSON.stringify(alt)
            ).join(' ');
            parts.push(`Alternatives: ${altText}`);
        }

        return parts.join('\n\n');
    }

    /**
     * Combine pattern fields for embedding
     * @param {Object} pattern 
     * @returns {string} Combined content
     */
    _combinePatternContent(pattern) {
        const parts = [];
        
        if (pattern.name) parts.push(`Name: ${pattern.name}`);
        if (pattern.category) parts.push(`Category: ${pattern.category}`);
        if (pattern.description) parts.push(`Description: ${pattern.description}`);
        if (pattern.when_to_use) parts.push(`When to use: ${pattern.when_to_use}`);
        if (pattern.when_not_to_use) parts.push(`When not to use: ${pattern.when_not_to_use}`);
        
        if (pattern.context_tags && Array.isArray(pattern.context_tags)) {
            parts.push(`Tags: ${pattern.context_tags.join(', ')}`);
        }

        return parts.join('\n\n');
    }

    /**
     * Call OpenAI API with retry logic
     * @param {string[]} texts 
     * @param {Object} options 
     * @returns {Promise<Object>} API response
     */
    async _callOpenAI(texts, options = {}) {
        const requestBody = {
            model: this.model,
            input: texts,
            encoding_format: 'float'
        };

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(this.openaiApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.openaiApiKey}`
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                console.warn(`Attempt ${attempt}/${this.retryAttempts} failed:`, error.message);
                
                if (attempt === this.retryAttempts) {
                    throw error;
                }

                await this._delay(this.retryDelay * attempt);
            }
        }
    }

    /**
     * Delay execution
     * @param {number} ms 
     * @returns {Promise<void>}
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = EmbeddingService;