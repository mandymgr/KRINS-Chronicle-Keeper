/**
 * Pattern Recommendations API for Dev Memory OS
 * AI-powered pattern suggestions and recommendations
 */

const express = require('express');
const EmbeddingService = require('../../embedding/embedding-service');
const { initializeDatabase } = require('../../database/connection');
const DatabaseQueries = require('../../database/queries');

const router = express.Router();

class PatternRecommendationsAPI {
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
            
            console.log('Pattern Recommendations API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Pattern Recommendations API:', error);
            throw error;
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
                problem_type = null,
                technology_stack = [],
                team_size = null,
                complexity_level = null,
                similarity_threshold = 0.6,
                max_results = 10,
                min_effectiveness_score = 2.0,
                include_usage_stats = false
            } = req.query;

            let recommendations = [];

            if (query && query.trim().length > 0) {
                // Generate embedding for the query
                const queryEmbedding = await this.embeddingService.generateEmbedding(query.trim());

                // Search for similar patterns
                const patterns = await this.queries.searchSimilarPatterns(queryEmbedding, {
                    contextTags: this.parseArrayParam(context_tags),
                    threshold: parseFloat(similarity_threshold),
                    limit: parseInt(max_results),
                    category: category || null
                });

                recommendations = patterns.filter(pattern => 
                    !min_effectiveness_score || 
                    !pattern.effectiveness_score || 
                    parseFloat(pattern.effectiveness_score) >= parseFloat(min_effectiveness_score)
                );

            } else {
                // If no query, use context-based recommendations
                recommendations = await this.getContextBasedRecommendations({
                    context_tags: this.parseArrayParam(context_tags),
                    category,
                    problem_type,
                    technology_stack: this.parseArrayParam(technology_stack),
                    team_size,
                    complexity_level,
                    max_results: parseInt(max_results),
                    min_effectiveness_score: parseFloat(min_effectiveness_score)
                });
            }

            // Enhance recommendations with additional metadata
            const enhancedRecommendations = await this.enhanceRecommendations(
                recommendations, 
                {
                    include_usage_stats: include_usage_stats === 'true',
                    context_tags: this.parseArrayParam(context_tags),
                    technology_stack: this.parseArrayParam(technology_stack)
                }
            );

            res.json({
                success: true,
                query: query.trim() || null,
                filters: {
                    context_tags: this.parseArrayParam(context_tags),
                    category: category || null,
                    problem_type: problem_type || null,
                    technology_stack: this.parseArrayParam(technology_stack),
                    team_size: team_size || null,
                    complexity_level: complexity_level || null,
                    min_effectiveness_score: min_effectiveness_score || null
                },
                similarity_threshold: query ? parseFloat(similarity_threshold) : null,
                recommendations: enhancedRecommendations,
                total_found: enhancedRecommendations.length,
                recommendation_engine: 'semantic_similarity',
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
     * Get pattern recommendations for a specific ADR
     * GET /api/patterns/recommend-for-adr/:adrId
     */
    async recommendPatternsForADR(req, res) {
        try {
            const { adrId } = req.params;
            const {
                max_results = 5,
                similarity_threshold = 0.6,
                include_reasoning = true
            } = req.query;

            // Get the ADR
            const adr = await this.queries.getADRById(adrId);
            if (!adr) {
                return res.status(404).json({
                    error: 'ADR not found',
                    adr_id: adrId,
                    code: 'ADR_NOT_FOUND'
                });
            }

            // Generate query from ADR content
            const adrQuery = this.generateQueryFromADR(adr);
            
            // Generate embedding for the combined ADR content
            const queryEmbedding = await this.embeddingService.generateEmbedding(adrQuery);

            // Search for relevant patterns
            const patterns = await this.queries.searchSimilarPatterns(queryEmbedding, {
                threshold: parseFloat(similarity_threshold),
                limit: parseInt(max_results)
            });

            // Generate reasoning for each recommendation
            const recommendationsWithReasoning = patterns.map(pattern => ({
                id: pattern.id,
                name: pattern.name,
                similarity: parseFloat(pattern.similarity.toFixed(4)),
                category: pattern.category,
                description: pattern.description,
                when_to_use: pattern.when_to_use,
                context_tags: pattern.context_tags || [],
                effectiveness_score: pattern.effectiveness_score,
                author_name: pattern.author_name,
                reasoning: include_reasoning === 'true' ? 
                    this.generateRecommendationReasoning(adr, pattern) : null,
                url: `/api/patterns/${pattern.id}`
            }));

            res.json({
                success: true,
                adr: {
                    id: adr.id,
                    title: adr.title,
                    problem_statement: adr.problem_statement?.substring(0, 200) + '...'
                },
                generated_query: adrQuery.substring(0, 200) + '...',
                similarity_threshold: parseFloat(similarity_threshold),
                recommendations: recommendationsWithReasoning,
                total_found: recommendationsWithReasoning.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('ADR pattern recommendations error:', error);
            res.status(500).json({
                error: 'Failed to get pattern recommendations for ADR',
                message: error.message,
                code: 'ADR_RECOMMENDATIONS_ERROR'
            });
        }
    }

    /**
     * Get trending patterns based on usage
     * GET /api/patterns/trending
     */
    async getTrendingPatterns(req, res) {
        try {
            const {
                days = 30,
                max_results = 10,
                category = null,
                min_usage_count = 1
            } = req.query;

            const query = `
                SELECT 
                    p.id, p.name, p.category, p.description,
                    p.when_to_use, p.context_tags, p.effectiveness_score,
                    p.usage_count, p.created_at, p.updated_at,
                    u.username as author_name,
                    COUNT(pu.id) as recent_usage_count,
                    COALESCE(AVG(
                        CASE pu.outcome 
                            WHEN 'success' THEN 5 
                            WHEN 'partial' THEN 3 
                            WHEN 'failure' THEN 1 
                            ELSE 3 
                        END
                    ), 3) as recent_success_rate
                FROM patterns p
                LEFT JOIN users u ON p.author_id = u.id
                LEFT JOIN pattern_usage pu ON p.id = pu.pattern_id 
                    AND pu.created_at >= NOW() - INTERVAL '${parseInt(days)} days'
                WHERE 
                    p.status = 'active'
                    AND p.usage_count >= $1
                    ${category ? 'AND p.category = $2' : ''}
                GROUP BY p.id, u.username
                ORDER BY 
                    recent_usage_count DESC,
                    recent_success_rate DESC,
                    p.effectiveness_score DESC NULLS LAST,
                    p.usage_count DESC
                LIMIT $${category ? '3' : '2'};
            `;

            const params = [parseInt(min_usage_count)];
            if (category) params.push(category);
            params.push(parseInt(max_results));

            const result = await this.db.query(query, params);

            const trendingPatterns = result.rows.map(pattern => ({
                id: pattern.id,
                name: pattern.name,
                category: pattern.category,
                description: pattern.description?.substring(0, 200) + '...',
                when_to_use: pattern.when_to_use?.substring(0, 150) + '...',
                context_tags: pattern.context_tags || [],
                effectiveness_score: pattern.effectiveness_score,
                total_usage_count: parseInt(pattern.usage_count),
                recent_usage_count: parseInt(pattern.recent_usage_count),
                recent_success_rate: parseFloat(pattern.recent_success_rate.toFixed(2)),
                author_name: pattern.author_name,
                created_at: pattern.created_at,
                url: `/api/patterns/${pattern.id}`,
                trend_score: this.calculateTrendScore(pattern)
            }));

            res.json({
                success: true,
                period_days: parseInt(days),
                category: category || null,
                min_usage_count: parseInt(min_usage_count),
                trending_patterns: trendingPatterns,
                total_found: trendingPatterns.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Trending patterns error:', error);
            res.status(500).json({
                error: 'Failed to get trending patterns',
                message: error.message,
                code: 'TRENDING_PATTERNS_ERROR'
            });
        }
    }

    // Helper methods

    parseArrayParam(param) {
        if (Array.isArray(param)) return param;
        if (typeof param === 'string' && param.length > 0) {
            return param.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
        return [];
    }

    async getContextBasedRecommendations(options) {
        const {
            context_tags,
            category,
            technology_stack,
            max_results,
            min_effectiveness_score
        } = options;

        let whereConditions = ['p.status = \'active\''];
        let params = [];
        let paramIndex = 1;

        if (category) {
            whereConditions.push(`p.category = $${paramIndex}`);
            params.push(category);
            paramIndex++;
        }

        if (context_tags && context_tags.length > 0) {
            whereConditions.push(`p.context_tags && $${paramIndex}`);
            params.push(context_tags);
            paramIndex++;
        }

        if (min_effectiveness_score) {
            whereConditions.push(`(p.effectiveness_score IS NULL OR p.effectiveness_score >= $${paramIndex})`);
            params.push(min_effectiveness_score);
            paramIndex++;
        }

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
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY 
                COALESCE(p.effectiveness_score, 0) DESC,
                p.usage_count DESC,
                p.created_at DESC
            LIMIT $${paramIndex};
        `;

        params.push(max_results);

        const result = await this.db.query(query, params);
        return result.rows;
    }

    async enhanceRecommendations(recommendations, options) {
        return recommendations.map(pattern => ({
            id: pattern.id,
            name: pattern.name,
            similarity: typeof pattern.similarity === 'number' ? parseFloat(pattern.similarity.toFixed(4)) : null,
            category: pattern.category,
            description: pattern.description?.substring(0, 200) + '...',
            when_to_use: pattern.when_to_use?.substring(0, 150) + '...',
            when_not_to_use: pattern.when_not_to_use?.substring(0, 150) + '...',
            context_tags: pattern.context_tags || [],
            effectiveness_score: pattern.effectiveness_score,
            usage_count: pattern.usage_count || 0,
            author_name: pattern.author_name,
            created_at: pattern.created_at,
            context_match: this.calculateContextMatch(
                pattern.context_tags || [], 
                options.context_tags || []
            ),
            technology_match: this.calculateTechnologyMatch(
                pattern.context_tags || [],
                options.technology_stack || []
            ),
            recommendation_reason: this.generateRecommendationReason(pattern, options),
            url: `/api/patterns/${pattern.id}`
        }));
    }

    generateQueryFromADR(adr) {
        const parts = [];
        if (adr.problem_statement) parts.push(adr.problem_statement);
        if (adr.decision) parts.push(adr.decision);
        if (adr.rationale) parts.push(adr.rationale);
        return parts.join(' ').substring(0, 1000); // Limit length
    }

    generateRecommendationReasoning(adr, pattern) {
        const reasons = [];
        
        if (pattern.similarity > 0.8) {
            reasons.push('High semantic similarity to ADR content');
        }
        
        if (pattern.effectiveness_score > 4.0) {
            reasons.push('High effectiveness score from community feedback');
        }
        
        if (pattern.usage_count > 10) {
            reasons.push('Widely adopted pattern with proven track record');
        }

        return reasons.length > 0 ? reasons.join('; ') : 'Relevant to problem domain';
    }

    calculateContextMatch(patternTags, queryTags) {
        if (!patternTags || !queryTags || queryTags.length === 0) return 0;
        
        const intersection = patternTags.filter(tag => 
            queryTags.some(queryTag => 
                queryTag.toLowerCase().includes(tag.toLowerCase()) ||
                tag.toLowerCase().includes(queryTag.toLowerCase())
            )
        );
        
        return intersection.length / queryTags.length;
    }

    calculateTechnologyMatch(patternTags, techStack) {
        if (!patternTags || !techStack || techStack.length === 0) return 0;
        
        const techMatches = patternTags.filter(tag => 
            techStack.some(tech => 
                tag.toLowerCase().includes(tech.toLowerCase()) ||
                tech.toLowerCase().includes(tag.toLowerCase())
            )
        );
        
        return techMatches.length / techStack.length;
    }

    generateRecommendationReason(pattern, options) {
        const reasons = [];
        
        if (pattern.similarity && pattern.similarity > 0.7) {
            reasons.push('semantic match');
        }
        
        const contextMatch = this.calculateContextMatch(
            pattern.context_tags || [], 
            options.context_tags || []
        );
        if (contextMatch > 0.5) {
            reasons.push('context alignment');
        }
        
        if (pattern.effectiveness_score > 3.5) {
            reasons.push('high effectiveness');
        }
        
        if (pattern.usage_count > 5) {
            reasons.push('community validated');
        }

        return reasons.length > 0 ? reasons.join(', ') : 'general relevance';
    }

    calculateTrendScore(pattern) {
        const recentWeight = 0.4;
        const successWeight = 0.3;
        const effectivenessWeight = 0.2;
        const usageWeight = 0.1;

        const recentScore = Math.min(parseInt(pattern.recent_usage_count) / 10, 1);
        const successScore = parseFloat(pattern.recent_success_rate) / 5;
        const effectivenessScore = pattern.effectiveness_score ? 
            parseFloat(pattern.effectiveness_score) / 5 : 0.6;
        const usageScore = Math.min(parseInt(pattern.usage_count) / 50, 1);

        return (
            recentScore * recentWeight +
            successScore * successWeight +
            effectivenessScore * effectivenessWeight +
            usageScore * usageWeight
        ).toFixed(3);
    }
}

// Create singleton instance
const recommendationsAPI = new PatternRecommendationsAPI();

// Middleware to ensure initialization
const ensureInitialized = async (req, res, next) => {
    try {
        await recommendationsAPI.initialize();
        next();
    } catch (error) {
        console.error('Failed to initialize recommendations API:', error);
        res.status(503).json({
            error: 'Recommendations service unavailable',
            message: 'Failed to initialize recommendations API',
            code: 'SERVICE_UNAVAILABLE'
        });
    }
};

// Routes
router.get('/recommend', ensureInitialized, (req, res) => recommendationsAPI.recommendPatterns(req, res));
router.get('/recommend-for-adr/:adrId', ensureInitialized, (req, res) => recommendationsAPI.recommendPatternsForADR(req, res));
router.get('/trending', ensureInitialized, (req, res) => recommendationsAPI.getTrendingPatterns(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        initialized: recommendationsAPI.initialized,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;