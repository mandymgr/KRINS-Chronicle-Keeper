/**
 * Hybrid Search API for Dev Memory OS
 * Combines semantic vector search with traditional keyword search for optimal results
 * Features: Multi-modal search, relevance ranking, search filters, autocomplete
 */

const express = require('express');
const EmbeddingService = require('../../embedding/embedding-service');
const { initializeDatabase } = require('../../database/connection');
const DatabaseQueries = require('../../database/queries');

const router = express.Router();

class HybridSearchAPI {
    constructor() {
        this.embeddingService = null;
        this.db = null;
        this.queries = null;
        this.initialized = false;
        
        // Search configuration
        this.searchConfig = {
            defaultSimilarityThreshold: 0.7,
            defaultMaxResults: 20,
            hybridWeights: {
                semantic: 0.7,    // Weight for semantic similarity
                keyword: 0.3      // Weight for keyword relevance
            },
            autocompleteMinLength: 2,
            autocompleteMaxSuggestions: 10
        };
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.embeddingService = new EmbeddingService({
                openaiApiKey: process.env.OPENAI_API_KEY
            });
            
            this.db = await initializeDatabase();
            this.queries = new DatabaseQueries(this.db);
            this.initialized = true;
            
            console.log('Hybrid Search API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Hybrid Search API:', error);
            throw error;
        }
    }

    /**
     * Enhanced semantic search with hybrid approach
     * POST /api/search/hybrid
     */
    async hybridSearch(req, res) {
        try {
            const {
                query,
                project_id = null,
                content_types = ['adrs', 'patterns', 'knowledge'],
                similarity_threshold = this.searchConfig.defaultSimilarityThreshold,
                max_results = this.searchConfig.defaultMaxResults,
                user_id = null,
                filters = {},
                search_mode = 'hybrid', // 'semantic', 'keyword', 'hybrid'
                boost_recent = false,
                include_snippets = true
            } = req.body;

            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                return res.status(400).json({
                    error: 'Query is required and must be a non-empty string',
                    code: 'INVALID_QUERY'
                });
            }

            const trimmedQuery = query.trim();
            
            // Generate embedding for semantic search
            let queryEmbedding = null;
            if (search_mode === 'semantic' || search_mode === 'hybrid') {
                queryEmbedding = await this.embeddingService.generateEmbedding(trimmedQuery);
            }

            const results = {
                query: trimmedQuery,
                search_mode,
                similarity_threshold,
                total_results: 0,
                results_by_type: {},
                processing_time_ms: 0,
                search_suggestions: []
            };

            const startTime = Date.now();

            // Execute searches in parallel for better performance
            const searchPromises = [];

            // Search ADRs
            if (content_types.includes('adrs')) {
                searchPromises.push(
                    this.searchADRsHybrid(queryEmbedding, trimmedQuery, {
                        projectId: project_id,
                        threshold: similarity_threshold,
                        limit: Math.floor(max_results / content_types.length),
                        searchMode: search_mode,
                        filters,
                        boostRecent: boost_recent,
                        includeSnippets: include_snippets
                    }).then(adrResults => ({ type: 'adrs', results: adrResults }))
                );
            }

            // Search Patterns
            if (content_types.includes('patterns')) {
                searchPromises.push(
                    this.searchPatternsHybrid(queryEmbedding, trimmedQuery, {
                        threshold: similarity_threshold,
                        limit: Math.floor(max_results / content_types.length),
                        searchMode: search_mode,
                        filters,
                        includeSnippets: include_snippets
                    }).then(patternResults => ({ type: 'patterns', results: patternResults }))
                );
            }

            // Execute all searches
            const searchResults = await Promise.all(searchPromises);

            // Process and rank results
            for (const { type, results: typeResults } of searchResults) {
                const processedResults = typeResults.map(item => {
                    const baseResult = {
                        id: item.id,
                        type,
                        title: item.title || item.name,
                        relevance_score: this.calculateRelevanceScore(item, search_mode),
                        created_at: item.created_at
                    };

                    if (type === 'adrs') {
                        return {
                            ...baseResult,
                            similarity: item.similarity,
                            keyword_score: item.keyword_score,
                            project_name: item.project_name,
                            component_name: item.component_name,
                            status: item.status,
                            problem_statement: include_snippets ? 
                                this.generateSnippet(item.problem_statement, trimmedQuery) : 
                                item.problem_statement?.substring(0, 150) + '...',
                            decision: include_snippets ?
                                this.generateSnippet(item.decision, trimmedQuery) :
                                item.decision?.substring(0, 150) + '...',
                            url: `/api/adrs/${item.id}`
                        };
                    } else if (type === 'patterns') {
                        return {
                            ...baseResult,
                            similarity: item.similarity,
                            keyword_score: item.keyword_score,
                            category: item.category,
                            description: include_snippets ?
                                this.generateSnippet(item.description, trimmedQuery) :
                                item.description?.substring(0, 150) + '...',
                            when_to_use: item.when_to_use?.substring(0, 100) + '...',
                            effectiveness_score: item.effectiveness_score,
                            author_name: item.author_name,
                            url: `/api/patterns/${item.id}`
                        };
                    }

                    return baseResult;
                });

                // Sort by relevance score
                processedResults.sort((a, b) => b.relevance_score - a.relevance_score);

                results.results_by_type[type] = processedResults;
                results.total_results += processedResults.length;
            }

            // Generate search suggestions if few results found
            if (results.total_results < 5) {
                results.search_suggestions = await this.generateSearchSuggestions(trimmedQuery);
            }

            results.processing_time_ms = Date.now() - startTime;

            // Log the search for analytics
            this.logSearchQuery({
                user_id,
                project_id,
                query_text: trimmedQuery,
                query_embedding: queryEmbedding,
                search_mode,
                results_found: results.total_results,
                processing_time_ms: results.processing_time_ms
            });

            res.json({
                success: true,
                ...results,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Hybrid search error:', error);
            res.status(500).json({
                error: 'Failed to perform hybrid search',
                message: error.message,
                code: 'HYBRID_SEARCH_ERROR'
            });
        }
    }

    /**
     * Hybrid ADR search combining semantic and keyword approaches
     * @private
     */
    async searchADRsHybrid(queryEmbedding, queryText, options) {
        const {
            projectId,
            threshold,
            limit,
            searchMode,
            filters,
            boostRecent,
            includeSnippets
        } = options;

        if (searchMode === 'semantic' && this.db.hasVectorExtension && queryEmbedding) {
            // Pure semantic search
            return await this.queries.searchSimilarADRs(queryEmbedding, {
                projectId,
                threshold,
                limit,
                status: filters.status || ['accepted', 'proposed']
            });
        }

        if (searchMode === 'keyword') {
            // Pure keyword search
            return await this.keywordSearchADRs(queryText, {
                projectId,
                limit,
                filters,
                boostRecent
            });
        }

        // Hybrid approach: combine both methods
        let semanticResults = [];
        let keywordResults = [];

        // Get semantic results if available
        if (this.db.hasVectorExtension && queryEmbedding) {
            semanticResults = await this.queries.searchSimilarADRs(queryEmbedding, {
                projectId,
                threshold: threshold * 0.9, // Lower threshold for hybrid
                limit: limit * 2, // Get more results to merge
                status: filters.status || ['accepted', 'proposed']
            });
        }

        // Get keyword results
        keywordResults = await this.keywordSearchADRs(queryText, {
            projectId,
            limit: limit * 2,
            filters,
            boostRecent
        });

        // Merge and rank results
        return this.mergeAndRankResults(semanticResults, keywordResults, 'adr', limit);
    }

    /**
     * Hybrid pattern search
     * @private
     */
    async searchPatternsHybrid(queryEmbedding, queryText, options) {
        const { threshold, limit, searchMode, filters, includeSnippets } = options;

        if (searchMode === 'semantic' && this.db.hasVectorExtension && queryEmbedding) {
            return await this.queries.searchSimilarPatterns(queryEmbedding, {
                contextTags: filters.context_tags,
                threshold,
                limit,
                category: filters.category
            });
        }

        if (searchMode === 'keyword') {
            return await this.keywordSearchPatterns(queryText, {
                limit,
                filters
            });
        }

        // Hybrid approach
        let semanticResults = [];
        let keywordResults = [];

        if (this.db.hasVectorExtension && queryEmbedding) {
            semanticResults = await this.queries.searchSimilarPatterns(queryEmbedding, {
                contextTags: filters.context_tags,
                threshold: threshold * 0.9,
                limit: limit * 2,
                category: filters.category
            });
        }

        keywordResults = await this.keywordSearchPatterns(queryText, {
            limit: limit * 2,
            filters
        });

        return this.mergeAndRankResults(semanticResults, keywordResults, 'pattern', limit);
    }

    /**
     * Keyword-only search for ADRs
     * @private
     */
    async keywordSearchADRs(queryText, options) {
        const { projectId, limit, filters, boostRecent } = options;

        const query = `
            SELECT 
                a.id, a.project_id, a.number, a.title, a.status,
                a.problem_statement, a.decision, a.rationale,
                a.created_at, a.updated_at,
                p.name as project_name, c.name as component_name,
                u.username as author_name,
                ts_rank_cd(
                    to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.problem_statement, '') || ' ' || COALESCE(a.decision, '')),
                    plainto_tsquery('english', $1),
                    32
                ) as keyword_score,
                0.0 as similarity
            FROM adrs a
            LEFT JOIN projects p ON a.project_id = p.id
            LEFT JOIN components c ON a.component_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE 
                a.status = ANY($2)
                ${projectId ? 'AND a.project_id = $4' : ''}
                AND (
                    to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.problem_statement, '') || ' ' || COALESCE(a.decision, '')) 
                    @@ plainto_tsquery('english', $1)
                    OR COALESCE(a.title, '') ILIKE '%' || $1 || '%'
                    OR COALESCE(a.problem_statement, '') ILIKE '%' || $1 || '%'
                    OR COALESCE(a.decision, '') ILIKE '%' || $1 || '%'
                )
            ORDER BY 
                ${boostRecent ? 'a.created_at DESC,' : ''}
                keyword_score DESC
            LIMIT $3;
        `;

        const params = [
            queryText,
            filters.status || ['accepted', 'proposed'],
            limit
        ];

        if (projectId) {
            params.push(projectId);
        }

        const result = await this.db.query(query, params);
        return result.rows;
    }

    /**
     * Keyword-only search for patterns
     * @private
     */
    async keywordSearchPatterns(queryText, options) {
        const { limit, filters } = options;

        const query = `
            SELECT 
                p.id, p.name, p.category, p.description,
                p.when_to_use, p.when_not_to_use, p.context_tags,
                p.effectiveness_score, p.usage_count,
                p.created_at, p.updated_at,
                u.username as author_name,
                ts_rank_cd(
                    to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.when_to_use, '')),
                    plainto_tsquery('english', $1),
                    32
                ) as keyword_score,
                0.0 as similarity
            FROM patterns p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE 
                p.status = 'active'
                ${filters.category ? 'AND p.category = $3' : ''}
                AND (
                    to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.when_to_use, '')) 
                    @@ plainto_tsquery('english', $1)
                    OR COALESCE(p.name, '') ILIKE '%' || $1 || '%'
                    OR COALESCE(p.description, '') ILIKE '%' || $1 || '%'
                    OR COALESCE(p.when_to_use, '') ILIKE '%' || $1 || '%'
                )
            ORDER BY keyword_score DESC
            LIMIT $2;
        `;

        const params = [queryText, limit];
        if (filters.category) {
            params.push(filters.category);
        }

        const result = await this.db.query(query, params);
        return result.rows;
    }

    /**
     * Merge semantic and keyword results with intelligent ranking
     * @private
     */
    mergeAndRankResults(semanticResults, keywordResults, type, limit) {
        const resultMap = new Map();
        const { semantic: semanticWeight, keyword: keywordWeight } = this.searchConfig.hybridWeights;

        // Add semantic results
        semanticResults.forEach(item => {
            resultMap.set(item.id, {
                ...item,
                semantic_score: item.similarity || 0,
                keyword_score: 0
            });
        });

        // Merge keyword results
        keywordResults.forEach(item => {
            if (resultMap.has(item.id)) {
                // Update existing result with keyword score
                const existing = resultMap.get(item.id);
                existing.keyword_score = item.keyword_score || 0;
            } else {
                // Add new keyword-only result
                resultMap.set(item.id, {
                    ...item,
                    semantic_score: 0,
                    keyword_score: item.keyword_score || 0
                });
            }
        });

        // Calculate hybrid scores and sort
        const mergedResults = Array.from(resultMap.values())
            .map(item => ({
                ...item,
                hybrid_score: (item.semantic_score * semanticWeight) + (item.keyword_score * keywordWeight)
            }))
            .sort((a, b) => b.hybrid_score - a.hybrid_score)
            .slice(0, limit);

        return mergedResults;
    }

    /**
     * Calculate relevance score based on search mode
     * @private
     */
    calculateRelevanceScore(item, searchMode) {
        if (searchMode === 'semantic') {
            return item.similarity || item.semantic_score || 0;
        }
        
        if (searchMode === 'keyword') {
            return item.keyword_score || 0;
        }
        
        // Hybrid mode
        return item.hybrid_score || 
               ((item.similarity || item.semantic_score || 0) * this.searchConfig.hybridWeights.semantic) +
               ((item.keyword_score || 0) * this.searchConfig.hybridWeights.keyword);
    }

    /**
     * Generate highlighted snippets for search results
     * @private
     */
    generateSnippet(text, query, maxLength = 200) {
        if (!text || !query) return text?.substring(0, maxLength) + '...';

        const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
        let snippet = text;

        // Simple highlighting - could be enhanced with more sophisticated algorithms
        queryWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            snippet = snippet.replace(regex, '<mark>$1</mark>');
        });

        // Truncate if too long
        if (snippet.length > maxLength) {
            snippet = snippet.substring(0, maxLength) + '...';
        }

        return snippet;
    }

    /**
     * Generate search suggestions for queries with few results
     * @private
     */
    async generateSearchSuggestions(query) {
        const suggestions = [];

        try {
            // Get popular search terms
            const popularTerms = await this.db.query(`
                SELECT query_text, COUNT(*) as search_count
                FROM search_queries
                WHERE query_text IS NOT NULL
                AND created_at >= NOW() - INTERVAL '30 days'
                GROUP BY query_text
                ORDER BY search_count DESC
                LIMIT 5
            `);

            suggestions.push(...popularTerms.rows.map(row => ({
                type: 'popular',
                text: row.query_text,
                reason: `Searched ${row.search_count} times`
            })));

            // Get related terms from ADR titles
            const relatedADRs = await this.db.query(`
                SELECT title
                FROM adrs
                WHERE title ILIKE '%' || $1 || '%'
                LIMIT 3
            `, [query]);

            suggestions.push(...relatedADRs.rows.map(row => ({
                type: 'related_adr',
                text: row.title,
                reason: 'Related ADR title'
            })));

        } catch (error) {
            console.warn('Could not generate search suggestions:', error.message);
        }

        return suggestions.slice(0, this.searchConfig.autocompleteMaxSuggestions);
    }

    /**
     * Log search query for analytics
     * @private
     */
    async logSearchQuery(searchData) {
        try {
            await this.queries.logSearch(searchData);
        } catch (error) {
            console.warn('Failed to log search query:', error.message);
        }
    }

    /**
     * Autocomplete endpoint for search suggestions
     * GET /api/search/autocomplete
     */
    async autocomplete(req, res) {
        try {
            const { q: query, limit = this.searchConfig.autocompleteMaxSuggestions } = req.query;

            if (!query || query.length < this.searchConfig.autocompleteMinLength) {
                return res.json({
                    success: true,
                    suggestions: [],
                    query: query || ''
                });
            }

            const suggestions = [];

            // Get suggestions from ADR titles
            const adrTitles = await this.db.query(`
                SELECT DISTINCT title as suggestion, 'adr' as source
                FROM adrs
                WHERE title ILIKE '%' || $1 || '%'
                ORDER BY title
                LIMIT $2
            `, [query, Math.floor(limit / 2)]);

            suggestions.push(...adrTitles.rows);

            // Get suggestions from pattern names
            const patternNames = await this.db.query(`
                SELECT DISTINCT name as suggestion, 'pattern' as source
                FROM patterns
                WHERE name ILIKE '%' || $1 || '%'
                AND status = 'active'
                ORDER BY name
                LIMIT $2
            `, [query, Math.floor(limit / 2)]);

            suggestions.push(...patternNames.rows);

            res.json({
                success: true,
                suggestions: suggestions.slice(0, limit),
                query,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Autocomplete error:', error);
            res.status(500).json({
                error: 'Failed to get autocomplete suggestions',
                message: error.message,
                code: 'AUTOCOMPLETE_ERROR'
            });
        }
    }
}

// Create singleton instance
const hybridSearchAPI = new HybridSearchAPI();

// Middleware to ensure initialization
const ensureInitialized = async (req, res, next) => {
    try {
        await hybridSearchAPI.initialize();
        next();
    } catch (error) {
        console.error('Failed to initialize hybrid search API:', error);
        res.status(503).json({
            error: 'Search service unavailable',
            message: 'Failed to initialize hybrid search API',
            code: 'SERVICE_UNAVAILABLE'
        });
    }
};

// Routes
router.post('/hybrid', ensureInitialized, (req, res) => hybridSearchAPI.hybridSearch(req, res));
router.get('/autocomplete', ensureInitialized, (req, res) => hybridSearchAPI.autocomplete(req, res));

// Health check endpoint
router.get('/hybrid/health', (req, res) => {
    res.json({
        success: true,
        initialized: hybridSearchAPI.initialized,
        config: hybridSearchAPI.searchConfig,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;