/**
 * Intelligent Autocomplete API for Dev Memory OS
 * Enhanced semantic autocomplete with search history, trending suggestions, and caching
 * Part of Krin's revolutionary AI team coordination system
 */

const express = require('express');
const EmbeddingService = require('../../embedding/embedding-service');
const { initializeDatabase } = require('../../database/connection');

const router = express.Router();

class IntelligentAutocompleteAPI {
    constructor() {
        this.embeddingService = null;
        this.db = null;
        this.initialized = false;
        this.cache = new Map(); // Simple in-memory cache
        this.cacheExpiry = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
        
        // Start cache cleanup interval
        this.setupCacheCleanup();
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.embeddingService = new EmbeddingService({
                openaiApiKey: process.env.OPENAI_API_KEY
            });
            
            this.db = await initializeDatabase();
            this.initialized = true;
            
            console.log('Intelligent Autocomplete API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Intelligent Autocomplete API:', error);
            throw error;
        }
    }

    /**
     * Set up automatic cache cleanup to prevent memory leaks
     */
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, expiry] of this.cacheExpiry.entries()) {
                if (expiry < now) {
                    this.cache.delete(key);
                    this.cacheExpiry.delete(key);
                }
            }
        }, 60 * 1000); // Clean up every minute
    }

    /**
     * Get cached result if available and not expired
     */
    getCachedResult(cacheKey) {
        const expiry = this.cacheExpiry.get(cacheKey);
        if (expiry && expiry > Date.now()) {
            return this.cache.get(cacheKey);
        }
        // Clean up expired cache entry
        this.cache.delete(cacheKey);
        this.cacheExpiry.delete(cacheKey);
        return null;
    }

    /**
     * Cache a result with expiration
     */
    setCachedResult(cacheKey, result) {
        this.cache.set(cacheKey, result);
        this.cacheExpiry.set(cacheKey, Date.now() + this.cacheDuration);
    }

    /**
     * Enhanced semantic autocomplete with intelligence
     * GET /api/search/autocomplete/intelligent
     */
    async getIntelligentAutocomplete(req, res) {
        try {
            const { 
                q, 
                limit = 10, 
                content_type = null,
                include_semantic = 'false',
                include_trending = 'false',
                include_history = 'false',
                user_id = null,
                project_id = null
            } = req.query;

            // Parse boolean parameters properly from query strings
            const semanticEnabled = include_semantic === 'true';
            const trendingEnabled = include_trending === 'true';
            const historyEnabled = include_history === 'true';

            if (!q || q.length < 1) {
                return res.json({
                    success: true,
                    suggestions: await this.getTrendingSuggestions(parseInt(limit), content_type),
                    suggestion_type: 'trending',
                    query: q || '',
                    cache_hit: false,
                    timestamp: new Date().toISOString()
                });
            }

            const cacheKey = `autocomplete:${q}:${content_type}:${limit}:${include_semantic}:${include_trending}:${include_history}`;
            const cachedResult = this.getCachedResult(cacheKey);
            if (cachedResult) {
                return res.json({
                    ...cachedResult,
                    cache_hit: true,
                    timestamp: new Date().toISOString()
                });
            }

            const suggestions = new Map(); // Use Map to maintain order and prevent duplicates
            const suggestionSources = [];

            // 1. Direct text matches (always included for immediate feedback)
            const directMatches = await this.getDirectMatches(q, parseInt(limit), content_type);
            directMatches.forEach(suggestion => {
                if (!suggestions.has(suggestion.text)) {
                    suggestions.set(suggestion.text, {
                        ...suggestion,
                        sources: ['direct_match']
                    });
                }
            });
            if (directMatches.length > 0) suggestionSources.push('direct_match');

            // 2. Semantic similarity suggestions (if enabled and query is long enough)
            if (semanticEnabled && q.length >= 3) {
                try {
                    const semanticMatches = await this.getSemanticSuggestions(q, parseInt(limit), content_type);
                    semanticMatches.forEach(suggestion => {
                        const key = suggestion.text;
                        if (suggestions.has(key)) {
                            suggestions.get(key).sources.push('semantic');
                        } else if (suggestions.size < parseInt(limit)) {
                            suggestions.set(key, {
                                ...suggestion,
                                sources: ['semantic']
                            });
                        }
                    });
                    if (semanticMatches.length > 0) suggestionSources.push('semantic');
                } catch (semanticError) {
                    console.warn('Semantic suggestions failed:', semanticError.message);
                    // Continue without semantic suggestions
                }
            }

            // 3. Search history suggestions (if enabled and user context available)
            if (historyEnabled && (user_id || project_id)) {
                const historyMatches = await this.getHistorySuggestions(
                    q, parseInt(limit), user_id, project_id, content_type
                );
                historyMatches.forEach(suggestion => {
                    const key = suggestion.text;
                    if (suggestions.has(key)) {
                        suggestions.get(key).sources.push('history');
                    } else if (suggestions.size < parseInt(limit)) {
                        suggestions.set(key, {
                            ...suggestion,
                            sources: ['history']
                        });
                    }
                });
                if (historyMatches.length > 0) suggestionSources.push('history');
            }

            // 4. Trending suggestions as fallback (if enabled and not enough suggestions)
            if (trendingEnabled && suggestions.size < parseInt(limit)) {
                const remaining = parseInt(limit) - suggestions.size;
                const trendingMatches = await this.getTrendingSuggestions(remaining, content_type, q);
                trendingMatches.forEach(suggestion => {
                    const key = suggestion.text;
                    if (!suggestions.has(key)) {
                        suggestions.set(key, {
                            ...suggestion,
                            sources: ['trending']
                        });
                    }
                });
                if (trendingMatches.length > 0) suggestionSources.push('trending');
            }

            const finalSuggestions = Array.from(suggestions.values()).slice(0, parseInt(limit));

            // Log the autocomplete query for future improvements
            if (user_id || project_id) {
                try {
                    await this.logAutocompleteQuery(user_id, project_id, q, finalSuggestions.length);
                } catch (logError) {
                    console.warn('Failed to log autocomplete query:', logError.message);
                }
            }

            const result = {
                success: true,
                suggestions: finalSuggestions,
                suggestion_sources: suggestionSources,
                query: q,
                total_found: finalSuggestions.length,
                cache_hit: false,
                response_features: {
                    semantic_enabled: semanticEnabled,
                    history_enabled: historyEnabled,
                    trending_enabled: trendingEnabled
                }
            };

            // Cache the result
            this.setCachedResult(cacheKey, result);

            res.json({
                ...result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Intelligent autocomplete error:', error);
            res.status(500).json({
                error: 'Failed to get intelligent suggestions',
                message: error.message,
                code: 'INTELLIGENT_AUTOCOMPLETE_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get direct text matches from ADRs and patterns
     */
    async getDirectMatches(query, limit, contentType) {
        const suggestions = [];

        try {
            // Get matches from ADR titles
            if (!contentType || contentType === 'adrs') {
                const adrQuery = `
                    SELECT title, 'adr' as type, created_at, 'direct_match' as match_type
                    FROM adrs 
                    WHERE title ILIKE '%' || $1 || '%' 
                    AND status IN ('accepted', 'proposed')
                    ORDER BY 
                        CASE 
                            WHEN title ILIKE $1 || '%' THEN 1
                            WHEN title ILIKE '%' || $1 THEN 2
                            ELSE 3
                        END,
                        created_at DESC
                    LIMIT $2;
                `;
                const adrResults = await this.db.query(adrQuery, [query, Math.ceil(limit / 2)]);
                adrResults.rows.forEach(row => {
                    suggestions.push({
                        text: row.title,
                        type: row.type,
                        match_type: row.match_type,
                        score: 1.0,
                        metadata: {
                            source: 'adr',
                            created_at: row.created_at
                        }
                    });
                });
            }

            // Get matches from pattern names
            if (!contentType || contentType === 'patterns') {
                const patternQuery = `
                    SELECT name, 'pattern' as type, created_at, 'direct_match' as match_type
                    FROM patterns 
                    WHERE name ILIKE '%' || $1 || '%' 
                    AND status = 'active'
                    ORDER BY 
                        CASE 
                            WHEN name ILIKE $1 || '%' THEN 1
                            WHEN name ILIKE '%' || $1 THEN 2
                            ELSE 3
                        END,
                        created_at DESC
                    LIMIT $2;
                `;
                const patternResults = await this.db.query(patternQuery, [query, Math.ceil(limit / 2)]);
                patternResults.rows.forEach(row => {
                    suggestions.push({
                        text: row.name,
                        type: row.type,
                        match_type: row.match_type,
                        score: 1.0,
                        metadata: {
                            source: 'pattern',
                            created_at: row.created_at
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Direct matches query failed:', error);
        }

        return suggestions;
    }

    /**
     * Get semantic suggestions using embedding similarity
     */
    async getSemanticSuggestions(query, limit, contentType) {
        const suggestions = [];

        try {
            // Generate embedding for the query
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);

            // Search similar ADRs (fallback to text search when no embeddings)
            if (!contentType || contentType === 'adrs') {
                // Check if pgvector is available first
                let adrQuery;
                let params;
                
                try {
                    // Try vector search first
                    adrQuery = `
                        SELECT 
                            title, 
                            'adr' as type,
                            created_at,
                            (1 - (embedding <=> $1::vector)) as similarity
                        FROM adrs 
                        WHERE 
                            embedding IS NOT NULL
                            AND status IN ('accepted', 'proposed')
                            AND (1 - (embedding <=> $1::vector)) > 0.6
                        ORDER BY embedding <=> $1::vector
                        LIMIT $2;
                    `;                    
                    params = [JSON.stringify(queryEmbedding), Math.ceil(limit / 2)];
                    
                    const adrResults = await this.db.query(adrQuery, params);
                    adrResults.rows.forEach(row => {
                        suggestions.push({
                            text: row.title,
                            type: row.type,
                            match_type: 'semantic',
                            score: parseFloat(row.similarity.toFixed(4)),
                            metadata: {
                                source: 'adr',
                                similarity: row.similarity,
                                created_at: row.created_at
                            }
                        });
                    });
                } catch (vectorError) {
                    // Fall back to text-based semantic search using full-text search
                    console.log('Vector search failed, falling back to text search for ADRs');
                    adrQuery = `
                        SELECT 
                            title,
                            'adr' as type,
                            created_at,
                            ts_rank(
                                to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(problem_statement, '') || ' ' || COALESCE(decision, '')), 
                                plainto_tsquery('english', $1)
                            ) as similarity
                        FROM adrs 
                        WHERE 
                            status IN ('accepted', 'proposed')
                            AND (
                                to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(problem_statement, '') || ' ' || COALESCE(decision, '')) @@ plainto_tsquery('english', $1)
                            )
                        ORDER BY similarity DESC
                        LIMIT $2;
                    `;
                    params = [query, Math.ceil(limit / 2)];
                    
                    try {
                        const adrResults = await this.db.query(adrQuery, params);
                        adrResults.rows.forEach(row => {
                            suggestions.push({
                                text: row.title,
                                type: row.type,
                                match_type: 'semantic_text',
                                score: parseFloat((row.similarity || 0.7).toFixed(4)),
                                metadata: {
                                    source: 'adr',
                                    similarity: row.similarity,
                                    created_at: row.created_at
                                }
                            });
                        });
                    } catch (textError) {
                        console.warn('Text-based semantic search also failed for ADRs:', textError.message);
                    }
                }
            }

            // Search similar patterns (fallback to text search when no embeddings)
            if (!contentType || contentType === 'patterns') {
                let patternQuery;
                let params;
                
                try {
                    // Try vector search first
                    patternQuery = `
                        SELECT 
                            name, 
                            'pattern' as type,
                            created_at,
                            (1 - (embedding <=> $1::vector)) as similarity
                        FROM patterns 
                        WHERE 
                            embedding IS NOT NULL
                            AND status = 'active'
                            AND (1 - (embedding <=> $1::vector)) > 0.6
                        ORDER BY embedding <=> $1::vector
                        LIMIT $2;
                    `;
                    params = [JSON.stringify(queryEmbedding), Math.ceil(limit / 2)];
                    
                    const patternResults = await this.db.query(patternQuery, params);
                    patternResults.rows.forEach(row => {
                        suggestions.push({
                            text: row.name,
                            type: row.type,
                            match_type: 'semantic',
                            score: parseFloat(row.similarity.toFixed(4)),
                            metadata: {
                                source: 'pattern',
                                similarity: row.similarity,
                                created_at: row.created_at
                            }
                        });
                    });
                } catch (vectorError) {
                    // Fall back to text-based semantic search using full-text search
                    console.log('Vector search failed, falling back to text search for patterns');
                    patternQuery = `
                        SELECT 
                            name,
                            'pattern' as type,
                            created_at,
                            ts_rank(
                                to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(when_to_use, '')), 
                                plainto_tsquery('english', $1)
                            ) as similarity
                        FROM patterns 
                        WHERE 
                            status = 'active'
                            AND (
                                to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(when_to_use, '')) @@ plainto_tsquery('english', $1)
                            )
                        ORDER BY similarity DESC
                        LIMIT $2;
                    `;
                    params = [query, Math.ceil(limit / 2)];
                    
                    try {
                        const patternResults = await this.db.query(patternQuery, params);
                        patternResults.rows.forEach(row => {
                            suggestions.push({
                                text: row.name,
                                type: row.type,
                                match_type: 'semantic_text',
                                score: parseFloat((row.similarity || 0.7).toFixed(4)),
                                metadata: {
                                    source: 'pattern',
                                    similarity: row.similarity,
                                    created_at: row.created_at
                                }
                            });
                        });
                    } catch (textError) {
                        console.warn('Text-based semantic search also failed for patterns:', textError.message);
                    }
                }
            }

        } catch (error) {
            console.error('Semantic suggestions failed:', error);
            throw error; // Re-throw to handle in caller
        }

        // Sort by similarity score and return
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Get suggestions based on search history
     */
    async getHistorySuggestions(query, limit, userId, projectId, contentType) {
        const suggestions = [];

        try {
            // Get popular searches from history that match the query
            const historyQuery = `
                SELECT 
                    query_text,
                    COUNT(*) as frequency,
                    MAX(created_at) as last_used,
                    AVG(results_found) as avg_results
                FROM search_queries 
                WHERE 
                    query_text ILIKE '%' || $1 || '%'
                    ${userId ? 'AND (user_id = $2 OR user_id IS NULL)' : ''}
                    ${projectId ? `AND (project_id = $${userId ? 3 : 2} OR project_id IS NULL)` : ''}
                    AND created_at >= NOW() - INTERVAL '30 days'
                    AND results_found > 0
                GROUP BY query_text
                ORDER BY frequency DESC, last_used DESC
                LIMIT $${(userId ? 1 : 0) + (projectId ? 1 : 0) + 2};
            `;

            const params = [query];
            if (userId) params.push(userId);
            if (projectId) params.push(projectId);
            params.push(limit);

            const historyResults = await this.db.query(historyQuery, params);
            historyResults.rows.forEach(row => {
                suggestions.push({
                    text: row.query_text,
                    type: 'query',
                    match_type: 'history',
                    score: Math.min(row.frequency / 10, 1.0), // Normalize frequency to 0-1 scale
                    metadata: {
                        source: 'history',
                        frequency: row.frequency,
                        last_used: row.last_used,
                        avg_results: parseFloat(row.avg_results)
                    }
                });
            });
        } catch (error) {
            console.error('History suggestions query failed:', error);
        }

        return suggestions;
    }

    /**
     * Get trending suggestions (most popular recent searches)
     */
    async getTrendingSuggestions(limit, contentType, excludeQuery = null) {
        const suggestions = [];

        try {
            // Get trending searches from the last 7 days
            const trendingQuery = `
                SELECT 
                    query_text,
                    COUNT(*) as frequency,
                    MAX(created_at) as last_used,
                    AVG(results_found) as avg_results
                FROM search_queries 
                WHERE 
                    created_at >= NOW() - INTERVAL '7 days'
                    AND results_found > 0
                    AND LENGTH(query_text) >= 3
                    ${excludeQuery ? 'AND query_text != $1' : ''}
                GROUP BY query_text
                HAVING COUNT(*) >= 2
                ORDER BY frequency DESC, last_used DESC
                LIMIT $${excludeQuery ? 2 : 1};
            `;

            const params = excludeQuery ? [excludeQuery, limit] : [limit];
            const trendingResults = await this.db.query(trendingQuery, params);
            
            trendingResults.rows.forEach(row => {
                suggestions.push({
                    text: row.query_text,
                    type: 'query',
                    match_type: 'trending',
                    score: Math.min(row.frequency / 10, 1.0),
                    metadata: {
                        source: 'trending',
                        frequency: row.frequency,
                        last_used: row.last_used,
                        avg_results: parseFloat(row.avg_results)
                    }
                });
            });

            // If not enough trending queries, add some popular ADR/Pattern titles
            if (suggestions.length < limit) {
                const remaining = limit - suggestions.length;
                
                // Add popular ADR titles
                if (!contentType || contentType === 'adrs') {
                    const popularADRQuery = `
                        SELECT DISTINCT title, 'adr' as type, created_at
                        FROM adrs 
                        WHERE status IN ('accepted', 'proposed')
                        ORDER BY created_at DESC
                        LIMIT $1;
                    `;
                    
                    const popularADRs = await this.db.query(popularADRQuery, [Math.ceil(remaining / 2)]);
                    popularADRs.rows.forEach(row => {
                        suggestions.push({
                            text: row.title,
                            type: row.type,
                            match_type: 'trending',
                            score: 0.5,
                            metadata: {
                                source: 'popular_content',
                                created_at: row.created_at
                            }
                        });
                    });
                }
                
                // Add popular pattern names
                if (!contentType || contentType === 'patterns') {
                    const popularPatternQuery = `
                        SELECT name, 'pattern' as type, created_at, usage_count
                        FROM patterns 
                        WHERE status = 'active'
                        ORDER BY COALESCE(usage_count, 0) DESC, created_at DESC
                        LIMIT $1;
                    `;
                    
                    const popularPatterns = await this.db.query(popularPatternQuery, [Math.ceil(remaining / 2)]);
                    popularPatterns.rows.forEach(row => {
                        suggestions.push({
                            text: row.name,
                            type: row.type,
                            match_type: 'trending',
                            score: 0.5,
                            metadata: {
                                source: 'popular_content',
                                usage_count: row.usage_count,
                                created_at: row.created_at
                            }
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Trending suggestions query failed:', error);
        }

        return suggestions.slice(0, limit);
    }

    /**
     * Log autocomplete query for analytics and improvement
     */
    async logAutocompleteQuery(userId, projectId, query, suggestionsCount) {
        try {
            const logQuery = `
                INSERT INTO search_queries (
                    user_id, project_id, query_text, results_found, 
                    search_mode, response_time_ms, created_at
                ) VALUES ($1, $2, $3, $4, 'autocomplete', 0, NOW());
            `;

            await this.db.query(logQuery, [userId, projectId, query, suggestionsCount]);
        } catch (error) {
            console.error('Failed to log autocomplete query:', error);
            // Don't throw - logging failures shouldn't break autocomplete
        }
    }

    /**
     * Get autocomplete analytics
     * GET /api/search/autocomplete/analytics
     */
    async getAutocompleteAnalytics(req, res) {
        try {
            const { project_id = null, days = 7 } = req.query;

            // Get autocomplete usage statistics
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_autocomplete_queries,
                    COUNT(DISTINCT user_id) as unique_users,
                    AVG(LENGTH(query_text)) as avg_query_length,
                    DATE_TRUNC('day', created_at) as query_date,
                    COUNT(*) as daily_queries
                FROM search_queries
                WHERE 
                    search_mode = 'autocomplete'
                    AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
                    ${project_id ? 'AND project_id = $1' : ''}
                GROUP BY DATE_TRUNC('day', created_at)
                ORDER BY query_date DESC;
            `;

            const params = project_id ? [project_id] : [];
            const statsResult = await this.db.query(statsQuery, params);

            // Get most popular autocomplete queries
            const popularQuery = `
                SELECT 
                    query_text,
                    COUNT(*) as frequency,
                    MAX(created_at) as last_used
                FROM search_queries
                WHERE 
                    search_mode = 'autocomplete'
                    AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
                    ${project_id ? 'AND project_id = $1' : ''}
                GROUP BY query_text
                ORDER BY frequency DESC
                LIMIT 10;
            `;

            const popularResult = await this.db.query(popularQuery, params);

            res.json({
                success: true,
                period_days: parseInt(days),
                project_id: project_id || null,
                daily_statistics: statsResult.rows,
                popular_queries: popularResult.rows,
                cache_stats: {
                    cache_size: this.cache.size,
                    cache_hit_ratio: 'calculated_in_production' // Would need request tracking for real hit ratio
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Autocomplete analytics error:', error);
            res.status(500).json({
                error: 'Failed to get autocomplete analytics',
                message: error.message,
                code: 'ANALYTICS_ERROR'
            });
        }
    }

    /**
     * Clear autocomplete cache
     * POST /api/search/autocomplete/clear-cache
     */
    async clearCache(req, res) {
        try {
            const cacheSize = this.cache.size;
            this.cache.clear();
            this.cacheExpiry.clear();

            res.json({
                success: true,
                message: `Cleared ${cacheSize} cached entries`,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Cache clear error:', error);
            res.status(500).json({
                error: 'Failed to clear cache',
                message: error.message,
                code: 'CACHE_CLEAR_ERROR'
            });
        }
    }
}

// Create singleton instance
const intelligentAutocompleteAPI = new IntelligentAutocompleteAPI();

// Middleware to ensure initialization
const ensureInitialized = async (req, res, next) => {
    try {
        await intelligentAutocompleteAPI.initialize();
        next();
    } catch (error) {
        console.error('Failed to initialize intelligent autocomplete API:', error);
        res.status(503).json({
            error: 'Autocomplete service unavailable',
            message: 'Failed to initialize intelligent autocomplete API',
            code: 'SERVICE_UNAVAILABLE'
        });
    }
};

// Routes
router.get('/intelligent', ensureInitialized, (req, res) => 
    intelligentAutocompleteAPI.getIntelligentAutocomplete(req, res)
);

router.get('/analytics', ensureInitialized, (req, res) => 
    intelligentAutocompleteAPI.getAutocompleteAnalytics(req, res)
);

router.post('/clear-cache', ensureInitialized, (req, res) => 
    intelligentAutocompleteAPI.clearCache(req, res)
);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        initialized: intelligentAutocompleteAPI.initialized,
        cache_size: intelligentAutocompleteAPI.cache.size,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;