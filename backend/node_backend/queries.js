/**
 * Database Query Functions for pgvector Semantic Search
 * Handles ADR and Pattern storage with embeddings
 */

class DatabaseQueries {
    constructor(db) {
        this.db = db;
    }

    // ============= ADR OPERATIONS =============

    /**
     * Insert or update ADR with embedding
     * @param {Object} adr - ADR data
     * @param {number[]} embedding - Vector embedding
     * @returns {Promise<Object>} Created/updated ADR
     */
    async upsertADR(adr, embedding) {
        const {
            project_id,
            component_id,
            number,
            title,
            status = 'draft',
            problem_statement,
            alternatives = [],
            decision,
            rationale,
            evidence,
            author_id
        } = adr;

        const query = `
            INSERT INTO adrs (
                project_id, component_id, number, title, status,
                problem_statement, alternatives, decision, rationale, 
                evidence, author_id, embedding
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
            ON CONFLICT (project_id, number) 
            DO UPDATE SET
                component_id = EXCLUDED.component_id,
                title = EXCLUDED.title,
                status = EXCLUDED.status,
                problem_statement = EXCLUDED.problem_statement,
                alternatives = EXCLUDED.alternatives,
                decision = EXCLUDED.decision,
                rationale = EXCLUDED.rationale,
                evidence = EXCLUDED.evidence,
                embedding = EXCLUDED.embedding,
                updated_at = NOW()
            RETURNING *;
        `;

        const params = [
            project_id, component_id, number, title, status,
            problem_statement, JSON.stringify(alternatives), decision, rationale,
            evidence ? JSON.stringify(evidence) : null,
            author_id,
            `[${embedding.join(',')}]` // Format for PostgreSQL vector
        ];

        const result = await this.db.query(query, params);
        return result.rows[0];
    }

    /**
     * Get ADR by ID
     * @param {string} adrId - ADR UUID
     * @returns {Promise<Object|null>} ADR or null if not found
     */
    async getADRById(adrId) {
        const query = `
            SELECT a.*, p.name as project_name, c.name as component_name,
                   u.username as author_name
            FROM adrs a
            LEFT JOIN projects p ON a.project_id = p.id
            LEFT JOIN components c ON a.component_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.id = $1;
        `;

        const result = await this.db.query(query, [adrId]);
        return result.rows[0] || null;
    }

    /**
     * Get all ADRs for a project
     * @param {string} projectId - Project UUID
     * @param {Object} options - Query options
     * @returns {Promise<Object[]>} Array of ADRs
     */
    async getADRsByProject(projectId, options = {}) {
        const { status, limit = 100, offset = 0, includeEmbedding = false } = options;
        
        let query = `
            SELECT a.id, a.number, a.title, a.status, a.problem_statement,
                   a.decision, a.rationale, a.created_at, a.updated_at,
                   ${includeEmbedding ? 'a.embedding,' : ''}
                   p.name as project_name, c.name as component_name,
                   u.username as author_name
            FROM adrs a
            LEFT JOIN projects p ON a.project_id = p.id
            LEFT JOIN components c ON a.component_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.project_id = $1
        `;

        const params = [projectId];
        let paramIndex = 2;

        if (status) {
            query += ` AND a.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY a.number DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await this.db.query(query, params);
        return result.rows;
    }

    /**
     * Search similar ADRs using vector similarity (or fallback to text search)
     * @param {number[]} queryEmbedding - Query vector
     * @param {Object} options - Search options
     * @returns {Promise<Object[]>} Similar ADRs with similarity scores
     */
    async searchSimilarADRs(queryEmbedding, options = {}) {
        const {
            projectId = null,
            threshold = 0.7,
            limit = 10,
            status = ['accepted', 'proposed'],
            queryText = null
        } = options;

        // Check if we have pgvector support
        if (this.db.hasVectorExtension) {
            // Use vector similarity search
            const query = `
                SELECT 
                    a.id, a.project_id, a.number, a.title, a.status,
                    a.problem_statement, a.decision, a.rationale,
                    a.created_at, a.updated_at,
                    p.name as project_name, c.name as component_name,
                    u.username as author_name,
                    1 - (a.embedding <=> $1) as similarity
                FROM adrs a
                LEFT JOIN projects p ON a.project_id = p.id
                LEFT JOIN components c ON a.component_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE 
                    a.embedding IS NOT NULL
                    AND a.status = ANY($2)
                    ${projectId ? 'AND a.project_id = $4' : ''}
                    AND (1 - (a.embedding <=> $1)) >= $3
                ORDER BY a.embedding <=> $1
                LIMIT $${projectId ? '5' : '4'};
            `;

            const params = [
                `[${queryEmbedding.join(',')}]`,
                status,
                threshold
            ];

            if (projectId) {
                params.push(projectId);
            }
            params.push(limit);

            const result = await this.db.query(query, params);
            return result.rows;
        } else {
            // Fallback to full-text search using embedding_text
            const query = `
                SELECT 
                    a.id, a.project_id, a.number, a.title, a.status,
                    a.problem_statement, a.decision, a.rationale,
                    a.created_at, a.updated_at,
                    p.name as project_name, c.name as component_name,
                    u.username as author_name,
                    ts_rank(to_tsvector('english', COALESCE(a.embedding_text, '')), plainto_tsquery('english', $1)) as similarity
                FROM adrs a
                LEFT JOIN projects p ON a.project_id = p.id
                LEFT JOIN components c ON a.component_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE 
                    a.status = ANY($2)
                    ${projectId ? 'AND a.project_id = $4' : ''}
                    AND (
                        to_tsvector('english', COALESCE(a.embedding_text, '')) @@ plainto_tsquery('english', $1)
                        OR COALESCE(a.title, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(a.problem_statement, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(a.decision, '') ILIKE '%' || $1 || '%'
                    )
                ORDER BY ts_rank(to_tsvector('english', COALESCE(a.embedding_text, '')), plainto_tsquery('english', $1)) DESC
                LIMIT $${projectId ? '4' : '3'};
            `;

            const params = [
                queryText || 'architectural decisions',
                status
            ];

            if (projectId) {
                params.push(projectId);
            }
            params.push(limit);

            const result = await this.db.query(query, params);
            return result.rows;
        }
    }

    // ============= PATTERN OPERATIONS =============

    /**
     * Insert or update pattern with embedding
     * @param {Object} pattern - Pattern data
     * @param {number[]} embedding - Vector embedding
     * @returns {Promise<Object>} Created/updated pattern
     */
    async upsertPattern(pattern, embedding) {
        const {
            name,
            category,
            description,
            when_to_use,
            when_not_to_use,
            context_tags = [],
            implementation_examples,
            anti_patterns,
            metrics,
            security_considerations,
            author_id,
            version = 1,
            status = 'active'
        } = pattern;

        const query = `
            INSERT INTO patterns (
                name, category, description, when_to_use, when_not_to_use,
                context_tags, implementation_examples, anti_patterns, metrics,
                security_considerations, author_id, version, status, embedding
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            )
            ON CONFLICT (name) 
            DO UPDATE SET
                category = EXCLUDED.category,
                description = EXCLUDED.description,
                when_to_use = EXCLUDED.when_to_use,
                when_not_to_use = EXCLUDED.when_not_to_use,
                context_tags = EXCLUDED.context_tags,
                implementation_examples = EXCLUDED.implementation_examples,
                anti_patterns = EXCLUDED.anti_patterns,
                metrics = EXCLUDED.metrics,
                security_considerations = EXCLUDED.security_considerations,
                version = EXCLUDED.version,
                status = EXCLUDED.status,
                embedding = EXCLUDED.embedding,
                updated_at = NOW()
            RETURNING *;
        `;

        const params = [
            name, category, description, when_to_use, when_not_to_use,
            context_tags,
            implementation_examples ? JSON.stringify(implementation_examples) : null,
            anti_patterns ? JSON.stringify(anti_patterns) : null,
            metrics ? JSON.stringify(metrics) : null,
            security_considerations,
            author_id, version, status,
            `[${embedding.join(',')}]`
        ];

        const result = await this.db.query(query, params);
        return result.rows[0];
    }

    /**
     * Search similar patterns using vector similarity (or fallback to text search)
     * @param {number[]} queryEmbedding - Query vector
     * @param {Object} options - Search options
     * @returns {Promise<Object[]>} Similar patterns with similarity scores
     */
    async searchSimilarPatterns(queryEmbedding, options = {}) {
        const {
            contextTags = null,
            threshold = 0.7,
            limit = 10,
            category = null,
            queryText = null
        } = options;

        // Check if we have pgvector support
        if (this.db.hasVectorExtension) {
            // Use vector similarity search
            let query = `
                SELECT 
                    p.id, p.name, p.category, p.description,
                    p.when_to_use, p.when_not_to_use, p.context_tags,
                    p.effectiveness_score, p.usage_count,
                    p.created_at, p.updated_at,
                    u.username as author_name,
                    1 - (p.embedding <=> $1) as similarity
                FROM patterns p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE 
                    p.embedding IS NOT NULL
                    AND p.status = 'active'
            `;

            const params = [`[${queryEmbedding.join(',')}]`];
            let paramIndex = 2;

            if (contextTags && contextTags.length > 0) {
                query += ` AND p.context_tags && $${paramIndex}`;
                params.push(contextTags);
                paramIndex++;
            }

            if (category) {
                query += ` AND p.category = $${paramIndex}`;
                params.push(category);
                paramIndex++;
            }

            query += ` AND (1 - (p.embedding <=> $1)) >= $${paramIndex}`;
            params.push(threshold);
            paramIndex++;

            query += ` ORDER BY p.embedding <=> $1 LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await this.db.query(query, params);
            return result.rows;
        } else {
            // Fallback to full-text search using embedding_text
            let query = `
                SELECT 
                    p.id, p.name, p.category, p.description,
                    p.when_to_use, p.when_not_to_use, p.context_tags,
                    p.effectiveness_score, p.usage_count,
                    p.created_at, p.updated_at,
                    u.username as author_name,
                    ts_rank(to_tsvector('english', COALESCE(p.embedding_text, '')), plainto_tsquery('english', $1)) as similarity
                FROM patterns p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE 
                    p.status = 'active'
                    AND (
                        to_tsvector('english', COALESCE(p.embedding_text, '')) @@ plainto_tsquery('english', $1)
                        OR COALESCE(p.name, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(p.description, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(p.when_to_use, '') ILIKE '%' || $1 || '%'
                    )
            `;

            const params = [queryText || 'pattern'];
            let paramIndex = 2;

            if (contextTags && contextTags.length > 0) {
                query += ` AND p.context_tags && $${paramIndex}`;
                params.push(contextTags);
                paramIndex++;
            }

            if (category) {
                query += ` AND p.category = $${paramIndex}`;
                params.push(category);
                paramIndex++;
            }

            query += ` ORDER BY ts_rank(to_tsvector('english', COALESCE(p.embedding_text, '')), plainto_tsquery('english', $1)) DESC LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await this.db.query(query, params);
            return result.rows;
        }
    }

    // ============= SEARCH ANALYTICS =============

    /**
     * Log search query for analytics
     * @param {Object} searchLog - Search log data
     * @returns {Promise<Object>} Created log entry
     */
    async logSearch(searchLog) {
        const {
            user_id,
            project_id,
            query_text,
            query_embedding,
            results_found,
            clicked_result_id = null,
            satisfaction_rating = null
        } = searchLog;

        const query = `
            INSERT INTO search_queries (
                user_id, project_id, query_text, query_embedding,
                results_found, clicked_result_id, satisfaction_rating
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const params = [
            user_id, project_id, query_text,
            query_embedding ? `[${query_embedding.join(',')}]` : null,
            results_found, clicked_result_id, satisfaction_rating
        ];

        const result = await this.db.query(query, params);
        return result.rows[0];
    }

    // ============= PROJECT & USER OPERATIONS =============

    /**
     * Get or create project
     * @param {Object} projectData - Project data
     * @returns {Promise<Object>} Project record
     */
    async getOrCreateProject(projectData) {
        const { name, description, repository_url, owner_id } = projectData;

        // First try to find existing project
        const existingQuery = `
            SELECT * FROM projects WHERE name = $1;
        `;
        const existing = await this.db.query(existingQuery, [name]);

        if (existing.rows.length > 0) {
            return existing.rows[0];
        }

        // Create new project
        const insertQuery = `
            INSERT INTO projects (name, description, repository_url, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const result = await this.db.query(insertQuery, [name, description, repository_url, owner_id]);
        return result.rows[0];
    }

    /**
     * Get or create user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} User record
     */
    async getOrCreateUser(userData) {
        const { username, email, password_hash = null } = userData;

        // First try to find existing user
        const existingQuery = `
            SELECT * FROM users WHERE username = $1 OR email = $2;
        `;
        const existing = await this.db.query(existingQuery, [username, email]);

        if (existing.rows.length > 0) {
            return existing.rows[0];
        }

        // Create new user
        const insertQuery = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const result = await this.db.query(insertQuery, [username, email, password_hash]);
        return result.rows[0];
    }
}

module.exports = DatabaseQueries;