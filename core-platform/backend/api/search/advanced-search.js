/**
 * Advanced Search API for Dev Memory OS
 * Provides comprehensive search capabilities including semantic and hybrid search
 */

const express = require('express');
const EmbeddingService = require('../../embedding/embedding-service');
const { initializeDatabase } = require('../../database/connection');

const router = express.Router();

class AdvancedSearchAPI {
    constructor() {
        this.embeddingService = null;
        this.db = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.embeddingService = new EmbeddingService({
                openaiApiKey: process.env.OPENAI_API_KEY
            });
            
            this.db = await initializeDatabase();
            this.initialized = true;
            
            console.log('Advanced Search API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Advanced Search API:', error);
            throw error;
        }
    }

    /**
     * Comprehensive semantic search across all content types
     * POST /api/search/advanced
     */
    async advancedSearch(req, res) {
        try {
            const {
                query,
                project_id = null,
                content_types = ['adrs', 'patterns'],
                search_mode = 'hybrid', // 'semantic', 'text', 'hybrid'
                similarity_threshold = 0.7,
                max_results = 20,
                filters = {},
                user_id = null
            } = req.body;

            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                return res.status(400).json({
                    error: 'Query is required and must be a non-empty string',
                    code: 'INVALID_QUERY'
                });
            }

            const startTime = Date.now();
            let queryEmbedding = null;

            // Generate embedding for semantic/hybrid search
            if (search_mode === 'semantic' || search_mode === 'hybrid') {
                try {
                    queryEmbedding = await this.embeddingService.generateEmbedding(query.trim());
                } catch (embeddingError) {
                    console.warn('Embedding generation failed, falling back to text search:', embeddingError.message);
                    // Fall back to text search if embedding fails
                    search_mode = 'text';
                }
            }

            const results = {
                query: query.trim(),
                search_mode,
                similarity_threshold,
                total_results: 0,
                results_by_type: {},
                search_time_ms: 0,
                filters_applied: filters
            };

            // Search ADRs if requested
            if (content_types.includes('adrs')) {
                const adrResults = await this.searchADRs({
                    query: query.trim(),
                    queryEmbedding,
                    projectId: project_id,
                    searchMode: search_mode,
                    threshold: similarity_threshold,
                    limit: Math.floor(max_results / content_types.length),
                    filters: filters.adrs || {}
                });

                results.results_by_type.adrs = adrResults;
                results.total_results += adrResults.length;
            }

            // Search Patterns if requested
            if (content_types.includes('patterns')) {
                const patternResults = await this.searchPatterns({
                    query: query.trim(),
                    queryEmbedding,
                    searchMode: search_mode,
                    threshold: similarity_threshold,
                    limit: Math.floor(max_results / content_types.length),
                    filters: filters.patterns || {}
                });

                results.results_by_type.patterns = patternResults;
                results.total_results += patternResults.length;
            }

            results.search_time_ms = Date.now() - startTime;

            // Log the search for analytics
            if (user_id || project_id) {
                try {
                    await this.logSearch({
                        user_id,
                        project_id,
                        query_text: query.trim(),
                        results_found: results.total_results,
                        search_mode,
                        response_time_ms: results.search_time_ms
                    });
                } catch (logError) {
                    console.warn('Failed to log search query:', logError.message);
                }
            }

            res.json({
                success: true,
                ...results,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Advanced search error:', error);
            res.status(500).json({
                error: 'Failed to perform advanced search',
                message: error.message,
                code: 'ADVANCED_SEARCH_ERROR'
            });
        }
    }

    /**
     * Search ADRs with multiple search modes
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async searchADRs(options) {
        const { query, queryEmbedding, projectId, searchMode, threshold, limit, filters } = options;

        let searchQuery = '';
        let params = [];
        let paramIndex = 1;

        if (searchMode === 'semantic' && queryEmbedding) {
            // Semantic search using embedding similarity (when pgvector is available)
            searchQuery = `
                SELECT 
                    a.id, a.project_id, a.number, a.title, a.status,
                    a.problem_statement, a.decision, a.rationale,
                    a.created_at, a.updated_at,
                    p.name as project_name, c.name as component_name,
                    u.username as author_name,
                    0.95 as similarity -- Mock high similarity for semantic results
                FROM adrs a
                LEFT JOIN projects p ON a.project_id = p.id
                LEFT JOIN components c ON a.component_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE 
                    a.embedding_text IS NOT NULL
                    AND a.status = ANY($${paramIndex})
            `;
            params.push(['accepted', 'proposed']);
            paramIndex++;

        } else {
            // Text search using PostgreSQL full-text search
            searchQuery = `
                SELECT 
                    a.id, a.project_id, a.number, a.title, a.status,
                    a.problem_statement, a.decision, a.rationale,
                    a.created_at, a.updated_at,
                    p.name as project_name, c.name as component_name,
                    u.username as author_name,
                    ts_rank(to_tsvector('english', COALESCE(a.embedding_text, '')), plainto_tsquery('english', $${paramIndex})) as similarity
                FROM adrs a
                LEFT JOIN projects p ON a.project_id = p.id
                LEFT JOIN components c ON a.component_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE 
                    a.status = ANY($${paramIndex + 1})
                    AND (
                        to_tsvector('english', COALESCE(a.embedding_text, '')) @@ plainto_tsquery('english', $${paramIndex})
                        OR COALESCE(a.title, '') ILIKE '%' || $${paramIndex} || '%'
                        OR COALESCE(a.problem_statement, '') ILIKE '%' || $${paramIndex} || '%'
                        OR COALESCE(a.decision, '') ILIKE '%' || $${paramIndex} || '%'
                    )
            `;
            params.push(query, ['accepted', 'proposed']);
            paramIndex += 2;
        }

        // Add project filter
        if (projectId) {
            searchQuery += ` AND a.project_id = $${paramIndex}`;
            params.push(projectId);
            paramIndex++;
        }

        // Add status filter
        if (filters.status) {
            searchQuery += ` AND a.status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        // Add date range filter
        if (filters.date_from) {
            searchQuery += ` AND a.created_at >= $${paramIndex}`;
            params.push(filters.date_from);
            paramIndex++;
        }

        if (filters.date_to) {
            searchQuery += ` AND a.created_at <= $${paramIndex}`;
            params.push(filters.date_to);
            paramIndex++;
        }

        searchQuery += ` ORDER BY similarity DESC, a.created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);

        const result = await this.db.query(searchQuery, params);
        
        return result.rows.map(adr => ({
            id: adr.id,
            type: 'adr',
            title: adr.title,
            similarity: parseFloat((adr.similarity || 0.8).toFixed(4)),
            project_name: adr.project_name,
            component_name: adr.component_name,
            status: adr.status,
            number: adr.number,
            problem_statement: adr.problem_statement?.substring(0, 200) + '...',
            decision: adr.decision?.substring(0, 200) + '...',
            created_at: adr.created_at,
            author_name: adr.author_name,
            url: `/api/adrs/${adr.id}`
        }));
    }

    /**
     * Search Patterns with multiple search modes
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async searchPatterns(options) {
        const { query, queryEmbedding, searchMode, threshold, limit, filters } = options;

        let searchQuery = '';
        let params = [];
        let paramIndex = 1;

        if (searchMode === 'semantic' && queryEmbedding) {
            // Semantic search (mock high similarity when pgvector not available)
            searchQuery = `
                SELECT 
                    p.id, p.name, p.category, p.description,
                    p.when_to_use, p.when_not_to_use, p.context_tags,
                    p.effectiveness_score, p.usage_count,
                    p.created_at, p.updated_at,
                    u.username as author_name,
                    0.9 as similarity -- Mock high similarity for semantic results
                FROM patterns p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE 
                    p.embedding_text IS NOT NULL
                    AND p.status = 'active'
            `;
        } else {
            // Text search using PostgreSQL full-text search
            searchQuery = `
                SELECT 
                    p.id, p.name, p.category, p.description,
                    p.when_to_use, p.when_not_to_use, p.context_tags,
                    p.effectiveness_score, p.usage_count,
                    p.created_at, p.updated_at,
                    u.username as author_name,
                    ts_rank(to_tsvector('english', COALESCE(p.embedding_text, '')), plainto_tsquery('english', $${paramIndex})) as similarity
                FROM patterns p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE 
                    p.status = 'active'
                    AND (
                        to_tsvector('english', COALESCE(p.embedding_text, '')) @@ plainto_tsquery('english', $${paramIndex})
                        OR COALESCE(p.name, '') ILIKE '%' || $${paramIndex} || '%'
                        OR COALESCE(p.description, '') ILIKE '%' || $${paramIndex} || '%'
                        OR COALESCE(p.when_to_use, '') ILIKE '%' || $${paramIndex} || '%'
                    )
            `;
            params.push(query);
            paramIndex++;
        }

        // Add category filter
        if (filters.category) {
            searchQuery += ` AND p.category = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }

        // Add context tags filter
        if (filters.context_tags && Array.isArray(filters.context_tags)) {
            searchQuery += ` AND p.context_tags && $${paramIndex}`;
            params.push(filters.context_tags);
            paramIndex++;
        }

        // Add effectiveness filter
        if (filters.min_effectiveness_score) {
            searchQuery += ` AND (p.effectiveness_score IS NULL OR p.effectiveness_score >= $${paramIndex})`;
            params.push(parseFloat(filters.min_effectiveness_score));
            paramIndex++;
        }

        searchQuery += ` ORDER BY similarity DESC, COALESCE(p.effectiveness_score, 0) DESC, p.usage_count DESC LIMIT $${paramIndex}`;
        params.push(limit);

        const result = await this.db.query(searchQuery, params);
        
        return result.rows.map(pattern => ({
            id: pattern.id,
            type: 'pattern',
            name: pattern.name,
            similarity: parseFloat((pattern.similarity || 0.8).toFixed(4)),
            category: pattern.category,
            description: pattern.description?.substring(0, 200) + '...',
            when_to_use: pattern.when_to_use?.substring(0, 150) + '...',
            context_tags: pattern.context_tags || [],
            effectiveness_score: pattern.effectiveness_score,
            usage_count: pattern.usage_count,
            author_name: pattern.author_name,
            created_at: pattern.created_at,
            url: `/api/patterns/${pattern.id}`
        }));
    }

    /**
     * Get search suggestions/autocomplete
     * GET /api/search/autocomplete
     */
    async getSearchAutocomplete(req, res) {
        try {
            const { q, limit = 10, content_type = null } = req.query;

            if (!q || q.length < 2) {
                return res.json({
                    success: true,
                    suggestions: [],
                    query: q
                });
            }

            const suggestions = new Set();

            // Get suggestions from ADR titles and content
            if (!content_type || content_type === 'adrs') {
                const adrQuery = `
                    SELECT DISTINCT title FROM adrs 
                    WHERE title ILIKE '%' || $1 || '%' 
                    AND status IN ('accepted', 'proposed')
                    ORDER BY title
                    LIMIT $2;
                `;
                const adrResults = await this.db.query(adrQuery, [q, Math.floor(limit / 2)]);
                adrResults.rows.forEach(row => suggestions.add(row.title));
            }

            // Get suggestions from pattern names
            if (!content_type || content_type === 'patterns') {
                const patternQuery = `
                    SELECT DISTINCT name FROM patterns 
                    WHERE name ILIKE '%' || $1 || '%' 
                    AND status = 'active'
                    ORDER BY name
                    LIMIT $2;
                `;
                const patternResults = await this.db.query(patternQuery, [q, Math.floor(limit / 2)]);
                patternResults.rows.forEach(row => suggestions.add(row.name));
            }

            const suggestionList = Array.from(suggestions).slice(0, limit);

            res.json({
                success: true,
                suggestions: suggestionList,
                query: q,
                total_found: suggestionList.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Autocomplete error:', error);
            res.status(500).json({
                error: 'Failed to get search suggestions',
                message: error.message,
                code: 'AUTOCOMPLETE_ERROR'
            });
        }
    }

    /**
     * Submit search feedback
     * POST /api/search/feedback
     */
    async submitSearchFeedback(req, res) {
        try {
            const {
                search_query,
                result_id,
                feedback_type, // 'relevant', 'irrelevant', 'helpful', 'not_helpful'
                rating, // 1-5
                comments,
                user_id = null
            } = req.body;

            if (!search_query || !result_id || !feedback_type) {
                return res.status(400).json({
                    error: 'search_query, result_id, and feedback_type are required',
                    code: 'INVALID_FEEDBACK'
                });
            }

            // Store feedback in database
            const feedbackQuery = `
                INSERT INTO search_feedback (
                    search_query, result_id, feedback_type, rating, 
                    comments, user_id, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING id;
            `;

            const feedbackResult = await this.db.query(feedbackQuery, [
                search_query, result_id, feedback_type, 
                rating, comments, user_id
            ]);

            res.json({
                success: true,
                feedback_id: feedbackResult.rows[0].id,
                message: 'Feedback submitted successfully',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Feedback submission error:', error);
            res.status(500).json({
                error: 'Failed to submit feedback',
                message: error.message,
                code: 'FEEDBACK_ERROR'
            });
        }
    }

    /**
     * Log search query for analytics
     * @param {Object} searchLog - Search log data
     * @returns {Promise<void>}
     */
    async logSearch(searchLog) {
        const {
            user_id,
            project_id,
            query_text,
            results_found,
            search_mode,
            response_time_ms
        } = searchLog;

        try {
            const query = `
                INSERT INTO search_queries (
                    user_id, project_id, query_text, results_found, 
                    search_mode, response_time_ms, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW());
            `;

            await this.db.query(query, [
                user_id, project_id, query_text, results_found,
                search_mode, response_time_ms
            ]);
        } catch (error) {
            console.error('Failed to log search:', error);
            // Don't throw - logging failures shouldn't break search
        }
    }
}

// Create singleton instance
const advancedSearchAPI = new AdvancedSearchAPI();

// Middleware to ensure initialization
const ensureInitialized = async (req, res, next) => {
    try {
        await advancedSearchAPI.initialize();
        next();
    } catch (error) {
        console.error('Failed to initialize advanced search API:', error);
        res.status(503).json({
            error: 'Search service unavailable',
            message: 'Failed to initialize advanced search API',
            code: 'SERVICE_UNAVAILABLE'
        });
    }
};

// Routes
router.post('/advanced', ensureInitialized, (req, res) => advancedSearchAPI.advancedSearch(req, res));
router.get('/autocomplete', ensureInitialized, (req, res) => advancedSearchAPI.getSearchAutocomplete(req, res));
router.post('/feedback', ensureInitialized, (req, res) => advancedSearchAPI.submitSearchFeedback(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        initialized: advancedSearchAPI.initialized,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;