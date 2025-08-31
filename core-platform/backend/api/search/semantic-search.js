/**
 * Semantic Search API for Dev Memory OS
 * Natural language search across ADRs, patterns, and knowledge artifacts
 */

const express = require('express');
const EmbeddingService = require('../../embedding/embedding-service');
const { initializeDatabase } = require('../../database/connection');
const DatabaseQueries = require('../../database/queries');

const router = express.Router();

class SemanticSearchAPI {
    constructor() {
        this.embeddingService = null;
        this.db = null;
        this.queries = null;
        this.initialized = false;
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
            
            console.log('Semantic Search API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Semantic Search API:', error);
            throw error;
        }
    }

    /**
     * Natural language search across all content types
     * POST /api/search/semantic
     */
    async semanticSearch(req, res) {
        try {
            const {
                query,
                project_id = null,
                content_types = ['adrs', 'patterns', 'knowledge'],
                similarity_threshold = 0.7,
                max_results = 20,
                user_id = null
            } = req.body;

            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                return res.status(400).json({
                    error: 'Query is required and must be a non-empty string',
                    code: 'INVALID_QUERY'
                });
            }

            // Generate embedding for the search query
            const queryEmbedding = await this.embeddingService.generateEmbedding(query.trim());

            const results = {
                query: query.trim(),
                similarity_threshold,
                total_results: 0,
                results_by_type: {}
            };

            // Search ADRs if requested
            if (content_types.includes('adrs')) {
                const adrResults = await this.queries.searchSimilarADRs(queryEmbedding, {
                    projectId: project_id,
                    threshold: similarity_threshold,
                    limit: Math.floor(max_results / content_types.length),
                    queryText: query.trim()
                });

                results.results_by_type.adrs = adrResults.map(adr => ({
                    id: adr.id,
                    type: 'adr',
                    title: adr.title,
                    similarity: parseFloat(adr.similarity.toFixed(4)),
                    project_name: adr.project_name,
                    component_name: adr.component_name,
                    status: adr.status,
                    problem_statement: adr.problem_statement?.substring(0, 200) + '...',
                    created_at: adr.created_at,
                    url: `/api/adrs/${adr.id}`
                }));
                
                results.total_results += adrResults.length;
            }

            // Search Patterns if requested
            if (content_types.includes('patterns')) {
                const patternResults = await this.queries.searchSimilarPatterns(queryEmbedding, {
                    threshold: similarity_threshold,
                    limit: Math.floor(max_results / content_types.length),
                    queryText: query.trim()
                });

                results.results_by_type.patterns = patternResults.map(pattern => ({
                    id: pattern.id,
                    type: 'pattern',
                    name: pattern.name,
                    similarity: parseFloat(pattern.similarity.toFixed(4)),
                    category: pattern.category,
                    description: pattern.description?.substring(0, 200) + '...',
                    effectiveness_score: pattern.effectiveness_score,
                    author_name: pattern.author_name,
                    created_at: pattern.created_at,
                    url: `/api/patterns/${pattern.id}`
                }));
                
                results.total_results += patternResults.length;
            }

            // Search Knowledge Artifacts if requested (implement when needed)
            if (content_types.includes('knowledge')) {
                results.results_by_type.knowledge = [];
                // TODO: Implement knowledge artifacts search when the table is populated
            }

            // Log the search for analytics
            if (user_id || project_id) {
                try {
                    await this.queries.logSearch({
                        user_id,
                        project_id,
                        query_text: query.trim(),
                        query_embedding: queryEmbedding,
                        results_found: results.total_results
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
            console.error('Semantic search error:', error);
            res.status(500).json({
                error: 'Failed to perform semantic search',
                message: error.message,
                code: 'SEARCH_ERROR'
            });
        }
    }

    /**
     * Find similar ADRs to a given ADR
     * GET /api/search/similar/:adr-id
     */
    async findSimilarADRs(req, res) {
        try {
            const { adrId } = req.params;
            const {
                similarity_threshold = 0.6,
                max_results = 10,
                include_same_project = true
            } = req.query;

            if (!adrId) {
                return res.status(400).json({
                    error: 'ADR ID is required',
                    code: 'INVALID_ADR_ID'
                });
            }

            // Get the reference ADR
            const referenceADR = await this.queries.getADRById(adrId);
            if (!referenceADR) {
                return res.status(404).json({
                    error: 'ADR not found',
                    code: 'ADR_NOT_FOUND'
                });
            }

            if (!referenceADR.embedding) {
                return res.status(400).json({
                    error: 'Reference ADR has no embedding vector',
                    code: 'NO_EMBEDDING'
                });
            }

            // Parse the embedding vector from PostgreSQL format
            const embeddingString = referenceADR.embedding.replace(/[\[\]]/g, '');
            const referenceEmbedding = embeddingString.split(',').map(Number);

            // Search for similar ADRs
            const similarADRs = await this.queries.searchSimilarADRs(referenceEmbedding, {
                projectId: include_same_project === 'false' ? null : referenceADR.project_id,
                threshold: parseFloat(similarity_threshold),
                limit: parseInt(max_results) + 1 // +1 to account for the reference ADR itself
            });

            // Filter out the reference ADR itself
            const filteredResults = similarADRs.filter(adr => adr.id !== adrId);

            const results = filteredResults.map(adr => ({
                id: adr.id,
                title: adr.title,
                similarity: parseFloat(adr.similarity.toFixed(4)),
                project_name: adr.project_name,
                component_name: adr.component_name,
                status: adr.status,
                problem_statement: adr.problem_statement?.substring(0, 200) + '...',
                decision: adr.decision?.substring(0, 200) + '...',
                created_at: adr.created_at,
                url: `/api/adrs/${adr.id}`
            }));

            res.json({
                success: true,
                reference_adr: {
                    id: referenceADR.id,
                    title: referenceADR.title,
                    project_name: referenceADR.project_name
                },
                similarity_threshold: parseFloat(similarity_threshold),
                similar_adrs: results,
                total_found: results.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Similar ADRs search error:', error);
            res.status(500).json({
                error: 'Failed to find similar ADRs',
                message: error.message,
                code: 'SIMILAR_SEARCH_ERROR'
            });
        }
    }

    /**
     * Get pattern recommendations based on query or context
     * GET /api/patterns/recommend
     */
    async recommendPatterns(req, res) {
        try {
            const {
                query = '',
                context_tags = [],
                category = null,
                similarity_threshold = 0.6,
                max_results = 10,
                min_effectiveness_score = 2.0
            } = req.query;

            let results = [];

            if (query && query.trim().length > 0) {
                // Generate embedding for the query
                const queryEmbedding = await this.embeddingService.generateEmbedding(query.trim());

                // Search for similar patterns
                const patterns = await this.queries.searchSimilarPatterns(queryEmbedding, {
                    contextTags: Array.isArray(context_tags) ? context_tags : (context_tags ? [context_tags] : null),
                    threshold: parseFloat(similarity_threshold),
                    limit: parseInt(max_results),
                    category: category || null
                });

                results = patterns.filter(pattern => 
                    !min_effectiveness_score || 
                    !pattern.effectiveness_score || 
                    parseFloat(pattern.effectiveness_score) >= parseFloat(min_effectiveness_score)
                );

            } else {
                // If no query, return top patterns by effectiveness and usage
                const query = `
                    SELECT 
                        p.id, p.name, p.category, p.description,
                        p.when_to_use, p.when_not_to_use, p.context_tags,
                        p.effectiveness_score, p.usage_count,
                        p.created_at, p.updated_at,
                        u.username as author_name,
                        0.0 as similarity
                    FROM patterns p
                    LEFT JOIN users u ON p.author_id = u.id
                    WHERE 
                        p.status = 'active'
                        ${category ? 'AND p.category = $1' : ''}
                        ${min_effectiveness_score ? `AND (p.effectiveness_score IS NULL OR p.effectiveness_score >= ${parseFloat(min_effectiveness_score)})` : ''}
                        ${context_tags && context_tags.length > 0 ? `AND p.context_tags && $${category ? '2' : '1'}` : ''}
                    ORDER BY 
                        COALESCE(p.effectiveness_score, 0) DESC,
                        p.usage_count DESC,
                        p.created_at DESC
                    LIMIT $${(category ? 1 : 0) + (context_tags && context_tags.length > 0 ? 1 : 0) + 1};
                `;

                const params = [];
                if (category) params.push(category);
                if (context_tags && context_tags.length > 0) {
                    const tagsArray = Array.isArray(context_tags) ? context_tags : [context_tags];
                    params.push(tagsArray);
                }
                params.push(parseInt(max_results));

                const dbResults = await this.db.query(query, params);
                results = dbResults.rows;
            }

            const recommendations = results.map(pattern => ({
                id: pattern.id,
                name: pattern.name,
                similarity: query ? parseFloat(pattern.similarity.toFixed(4)) : null,
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

            res.json({
                success: true,
                query: query.trim() || null,
                context_tags: Array.isArray(context_tags) ? context_tags : (context_tags ? [context_tags] : []),
                category: category || null,
                similarity_threshold: query ? parseFloat(similarity_threshold) : null,
                recommendations,
                total_found: recommendations.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Pattern recommendations error:', error);
            res.status(500).json({
                error: 'Failed to get pattern recommendations',
                message: error.message,
                code: 'RECOMMENDATIONS_ERROR'
            });
        }
    }

    /**
     * Get search statistics and analytics
     * GET /api/search/analytics
     */
    async getSearchAnalytics(req, res) {
        try {
            const {
                project_id = null,
                days = 30
            } = req.query;

            const query = `
                SELECT 
                    COUNT(*) as total_searches,
                    AVG(results_found) as avg_results_per_search,
                    AVG(satisfaction_rating) as avg_satisfaction,
                    COUNT(DISTINCT user_id) as unique_users,
                    DATE_TRUNC('day', created_at) as search_date,
                    COUNT(*) as daily_searches
                FROM search_queries
                WHERE 
                    created_at >= NOW() - INTERVAL '${parseInt(days)} days'
                    ${project_id ? 'AND project_id = $1' : ''}
                GROUP BY DATE_TRUNC('day', created_at)
                ORDER BY search_date DESC
                LIMIT 30;
            `;

            const params = project_id ? [project_id] : [];
            const result = await this.db.query(query, params);

            // Get top search terms
            const topSearchesQuery = `
                SELECT 
                    query_text,
                    COUNT(*) as search_count,
                    AVG(results_found) as avg_results,
                    AVG(satisfaction_rating) as avg_satisfaction
                FROM search_queries
                WHERE 
                    created_at >= NOW() - INTERVAL '${parseInt(days)} days'
                    ${project_id ? 'AND project_id = $1' : ''}
                    AND query_text IS NOT NULL
                GROUP BY query_text
                ORDER BY search_count DESC
                LIMIT 10;
            `;

            const topSearches = await this.db.query(topSearchesQuery, params);

            res.json({
                success: true,
                period_days: parseInt(days),
                project_id: project_id || null,
                daily_searches: result.rows,
                top_search_terms: topSearches.rows,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Search analytics error:', error);
            res.status(500).json({
                error: 'Failed to get search analytics',
                message: error.message,
                code: 'ANALYTICS_ERROR'
            });
        }
    }
}

// Create singleton instance
const searchAPI = new SemanticSearchAPI();

// Middleware to ensure initialization
const ensureInitialized = async (req, res, next) => {
    try {
        await searchAPI.initialize();
        next();
    } catch (error) {
        console.error('Failed to initialize search API:', error);
        res.status(503).json({
            error: 'Search service unavailable',
            message: 'Failed to initialize search API',
            code: 'SERVICE_UNAVAILABLE'
        });
    }
};

// Routes
router.post('/semantic', ensureInitialized, (req, res) => searchAPI.semanticSearch(req, res));
router.get('/similar/:adrId', ensureInitialized, (req, res) => searchAPI.findSimilarADRs(req, res));
router.get('/analytics', ensureInitialized, (req, res) => searchAPI.getSearchAnalytics(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        initialized: searchAPI.initialized,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;