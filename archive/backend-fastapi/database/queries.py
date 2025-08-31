"""
Database Query Functions for pgvector Semantic Search
FastAPI async implementation for ADR and Pattern storage with embeddings
"""

from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import logging

from .connection import DatabaseManager

logger = logging.getLogger(__name__)

class DatabaseQueries:
    """
    Database query manager with async operations for semantic search
    Handles ADRs, patterns, and search analytics with pgvector support
    """
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    # ============= ADR OPERATIONS =============
    
    async def upsert_adr(self, adr: Dict[str, Any], embedding: Optional[List[float]] = None) -> Dict[str, Any]:
        """Insert or update ADR with embedding"""
        project_id = adr.get("project_id")
        component_id = adr.get("component_id") 
        number = adr.get("number")
        title = adr.get("title")
        status = adr.get("status", "draft")
        problem_statement = adr.get("problem_statement")
        alternatives = adr.get("alternatives", [])
        decision = adr.get("decision")
        rationale = adr.get("rationale")
        evidence = adr.get("evidence")
        author_id = adr.get("author_id")
        
        # Generate embedding text for full-text search fallback
        embedding_text = " ".join([
            str(title or ""),
            str(problem_statement or ""),
            str(decision or ""),
            str(rationale or ""),
            " ".join(alternatives) if isinstance(alternatives, list) else str(alternatives or "")
        ]).strip()
        
        query = """
            INSERT INTO adrs (
                project_id, component_id, number, title, status,
                problem_statement, alternatives, decision, rationale, 
                evidence, author_id, embedding_text
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
                embedding_text = EXCLUDED.embedding_text,
                updated_at = NOW()
            RETURNING *
        """
        
        alternatives_json = json.dumps(alternatives) if alternatives else None
        evidence_json = json.dumps(evidence) if evidence else None
        
        result = await self.db.execute_query_one(
            query,
            project_id, component_id, number, title, status,
            problem_statement, alternatives_json, decision, rationale,
            evidence_json, author_id, embedding_text
        )
        
        return result
    
    async def get_adr_by_id(self, adr_id: str) -> Optional[Dict[str, Any]]:
        """Get ADR by ID with related information"""
        query = """
            SELECT a.*, p.name as project_name, c.name as component_name,
                   u.username as author_name
            FROM adrs a
            LEFT JOIN projects p ON a.project_id = p.id
            LEFT JOIN components c ON a.component_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.id = $1
        """
        
        return await self.db.execute_query_one(query, adr_id)
    
    async def get_adrs_by_project(self, project_id: str, options: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all ADRs for a project with filtering options"""
        if options is None:
            options = {}
            
        status = options.get("status")
        limit = options.get("limit", 100)
        offset = options.get("offset", 0)
        include_embedding = options.get("include_embedding", False)
        
        embedding_field = "a.embedding," if include_embedding else ""
        
        query = f"""
            SELECT a.id, a.number, a.title, a.status, a.problem_statement,
                   a.decision, a.rationale, a.created_at, a.updated_at,
                   {embedding_field}
                   p.name as project_name, c.name as component_name,
                   u.username as author_name
            FROM adrs a
            LEFT JOIN projects p ON a.project_id = p.id
            LEFT JOIN components c ON a.component_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.project_id = $1
            {f"AND a.status = $2" if status else ""}
            ORDER BY a.number DESC 
            LIMIT ${3 if status else 2} OFFSET ${4 if status else 3}
        """
        
        params = [project_id]
        if status:
            params.append(status)
        params.extend([limit, offset])
        
        return await self.db.execute_query(query, *params)
    
    async def search_similar_adrs(self, query_embedding: List[float], options: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search similar ADRs using vector similarity or fallback to text search"""
        if options is None:
            options = {}
            
        project_id = options.get("project_id")
        threshold = options.get("threshold", 0.7)
        limit = options.get("limit", 10)
        status = options.get("status", ["accepted", "proposed"])
        query_text = options.get("query_text")
        
        # Check if we have pgvector support
        if self.db.has_vector_extension:
            # Use vector similarity search
            embedding_str = f"[{','.join(map(str, query_embedding))}]"
            
            query = """
                SELECT 
                    a.id, a.project_id, a.number, a.title, a.status,
                    a.problem_statement, a.decision, a.rationale,
                    a.created_at, a.updated_at,
                    p.name as project_name, c.name as component_name,
                    u.username as author_name,
                    1 - (a.embedding <=> $1::vector) as similarity
                FROM adrs a
                LEFT JOIN projects p ON a.project_id = p.id
                LEFT JOIN components c ON a.component_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE 
                    a.embedding IS NOT NULL
                    AND a.status = ANY($2)
                    {f"AND a.project_id = $4" if project_id else ""}
                    AND (1 - (a.embedding <=> $1::vector)) >= $3
                ORDER BY a.embedding <=> $1::vector
                LIMIT ${5 if project_id else 4}
            """
            
            params = [embedding_str, status, threshold]
            if project_id:
                params.append(project_id)
            params.append(limit)
            
            return await self.db.execute_query(query, *params)
        else:
            # Fallback to full-text search using embedding_text
            search_text = query_text or "architectural decisions"
            
            query = """
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
                    {f"AND a.project_id = $4" if project_id else ""}
                    AND (
                        to_tsvector('english', COALESCE(a.embedding_text, '')) @@ plainto_tsquery('english', $1)
                        OR COALESCE(a.title, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(a.problem_statement, '') ILIKE '%' || $1 || '%'
                        OR COALESCE(a.decision, '') ILIKE '%' || $1 || '%'
                    )
                ORDER BY ts_rank(to_tsvector('english', COALESCE(a.embedding_text, '')), plainto_tsquery('english', $1)) DESC
                LIMIT ${4 if project_id else 3}
            """
            
            params = [search_text, status]
            if project_id:
                params.append(project_id)
            params.append(limit)
            
            return await self.db.execute_query(query, *params)
    
    # ============= PATTERN OPERATIONS =============
    
    async def upsert_pattern(self, pattern: Dict[str, Any], embedding: Optional[List[float]] = None) -> Dict[str, Any]:
        """Insert or update pattern with embedding"""
        name = pattern.get("name")
        category = pattern.get("category")
        description = pattern.get("description")
        when_to_use = pattern.get("when_to_use")
        when_not_to_use = pattern.get("when_not_to_use")
        context_tags = pattern.get("context_tags", [])
        implementation_examples = pattern.get("implementation_examples")
        anti_patterns = pattern.get("anti_patterns")
        metrics = pattern.get("metrics")
        security_considerations = pattern.get("security_considerations")
        author_id = pattern.get("author_id")
        version = pattern.get("version", 1)
        status = pattern.get("status", "active")
        
        # Generate embedding text for full-text search fallback
        embedding_text = " ".join([
            str(name or ""),
            str(category or ""),
            str(description or ""),
            str(when_to_use or ""),
            str(when_not_to_use or ""),
            " ".join(context_tags) if isinstance(context_tags, list) else str(context_tags or ""),
            str(security_considerations or "")
        ]).strip()
        
        query = """
            INSERT INTO patterns (
                name, category, description, when_to_use, when_not_to_use,
                context_tags, implementation_examples, anti_patterns, metrics,
                security_considerations, author_id, version, status, embedding_text
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
                embedding_text = EXCLUDED.embedding_text,
                updated_at = NOW()
            RETURNING *
        """
        
        implementation_json = json.dumps(implementation_examples) if implementation_examples else None
        anti_patterns_json = json.dumps(anti_patterns) if anti_patterns else None
        metrics_json = json.dumps(metrics) if metrics else None
        
        return await self.db.execute_query_one(
            query,
            name, category, description, when_to_use, when_not_to_use,
            context_tags, implementation_json, anti_patterns_json, metrics_json,
            security_considerations, author_id, version, status, embedding_text
        )
    
    async def search_similar_patterns(self, query_embedding: List[float], options: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search similar patterns using vector similarity or fallback to text search"""
        if options is None:
            options = {}
            
        context_tags = options.get("context_tags")
        threshold = options.get("threshold", 0.7)
        limit = options.get("limit", 10)
        category = options.get("category")
        query_text = options.get("query_text")
        
        # Check if we have pgvector support
        if self.db.has_vector_extension:
            # Use vector similarity search
            embedding_str = f"[{','.join(map(str, query_embedding))}]"
            
            conditions = ["p.embedding IS NOT NULL", "p.status = 'active'"]
            params = [embedding_str]
            param_index = 2
            
            if context_tags and len(context_tags) > 0:
                conditions.append(f"p.context_tags && ${param_index}")
                params.append(context_tags)
                param_index += 1
            
            if category:
                conditions.append(f"p.category = ${param_index}")
                params.append(category)
                param_index += 1
            
            conditions.append(f"(1 - (p.embedding <=> $1::vector)) >= ${param_index}")
            params.append(threshold)
            param_index += 1
            
            query = f"""
                SELECT 
                    p.id, p.name, p.category, p.description,
                    p.when_to_use, p.when_not_to_use, p.context_tags,
                    p.effectiveness_score, p.usage_count,
                    p.created_at, p.updated_at,
                    u.username as author_name,
                    1 - (p.embedding <=> $1::vector) as similarity
                FROM patterns p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE {' AND '.join(conditions)}
                ORDER BY p.embedding <=> $1::vector
                LIMIT ${param_index}
            """
            
            params.append(limit)
            return await self.db.execute_query(query, *params)
        else:
            # Fallback to full-text search using embedding_text
            search_text = query_text or "pattern"
            
            conditions = ["p.status = 'active'"]
            params = [search_text]
            param_index = 2
            
            if context_tags and len(context_tags) > 0:
                conditions.append(f"p.context_tags && ${param_index}")
                params.append(context_tags)
                param_index += 1
            
            if category:
                conditions.append(f"p.category = ${param_index}")
                params.append(category)
                param_index += 1
            
            text_search_condition = f"""(
                to_tsvector('english', COALESCE(p.embedding_text, '')) @@ plainto_tsquery('english', $1)
                OR COALESCE(p.name, '') ILIKE '%' || $1 || '%'
                OR COALESCE(p.description, '') ILIKE '%' || $1 || '%'
                OR COALESCE(p.when_to_use, '') ILIKE '%' || $1 || '%'
            )"""
            conditions.append(text_search_condition)
            
            query = f"""
                SELECT 
                    p.id, p.name, p.category, p.description,
                    p.when_to_use, p.when_not_to_use, p.context_tags,
                    p.effectiveness_score, p.usage_count,
                    p.created_at, p.updated_at,
                    u.username as author_name,
                    ts_rank(to_tsvector('english', COALESCE(p.embedding_text, '')), plainto_tsquery('english', $1)) as similarity
                FROM patterns p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE {' AND '.join(conditions)}
                ORDER BY ts_rank(to_tsvector('english', COALESCE(p.embedding_text, '')), plainto_tsquery('english', $1)) DESC
                LIMIT ${param_index}
            """
            
            params.append(limit)
            return await self.db.execute_query(query, *params)
    
    # ============= SEARCH ANALYTICS =============
    
    async def log_search(self, search_log: Dict[str, Any]) -> Dict[str, Any]:
        """Log search query for analytics"""
        user_id = search_log.get("user_id")
        project_id = search_log.get("project_id")
        query_text = search_log.get("query_text")
        query_embedding = search_log.get("query_embedding")
        results_found = search_log.get("results_found")
        clicked_result_id = search_log.get("clicked_result_id")
        satisfaction_rating = search_log.get("satisfaction_rating")
        
        query_embedding_str = None
        if query_embedding:
            query_embedding_str = f"[{','.join(map(str, query_embedding))}]"
        
        query = """
            INSERT INTO search_queries (
                user_id, project_id, query_text, query_embedding,
                results_found, clicked_result_id, satisfaction_rating
            ) VALUES ($1, $2, $3, $4::vector, $5, $6, $7)
            RETURNING *
        """
        
        return await self.db.execute_query_one(
            query,
            user_id, project_id, query_text, query_embedding_str,
            results_found, clicked_result_id, satisfaction_rating
        )
    
    # ============= PROJECT & USER OPERATIONS =============
    
    async def get_or_create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get or create project"""
        name = project_data.get("name")
        description = project_data.get("description")
        repository_url = project_data.get("repository_url")
        owner_id = project_data.get("owner_id")
        
        # First try to find existing project
        existing = await self.db.execute_query_one(
            "SELECT * FROM projects WHERE name = $1",
            name
        )
        
        if existing:
            return existing
        
        # Create new project
        return await self.db.execute_query_one(
            """
            INSERT INTO projects (name, description, repository_url, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            name, description, repository_url, owner_id
        )
    
    async def get_or_create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get or create user"""
        username = user_data.get("username")
        email = user_data.get("email")
        password_hash = user_data.get("password_hash", "$2b$12$dummy_hash_for_system_users")
        
        # First try to find existing user
        existing = await self.db.execute_query_one(
            "SELECT * FROM users WHERE username = $1 OR email = $2",
            username, email
        )
        
        if existing:
            return existing
        
        # Create new user
        return await self.db.execute_query_one(
            """
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING *
            """,
            username, email, password_hash
        )