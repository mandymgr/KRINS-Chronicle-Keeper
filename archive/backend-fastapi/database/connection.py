"""
Database Connection Manager for PostgreSQL with pgvector support
Async implementation using asyncpg for optimal performance with FastAPI
"""

import asyncio
import asyncpg
import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any, List
import json

logger = logging.getLogger(__name__)

class DatabaseManager:
    """
    Async PostgreSQL connection manager with pgvector support
    Production-ready with connection pooling and health monitoring
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = {
            "user": config.get("user") if config else os.getenv("DB_USER", "devmemory"),
            "host": config.get("host") if config else os.getenv("DB_HOST", "localhost"),
            "database": config.get("database") if config else os.getenv("DB_NAME", "dev_memory_os"),
            "password": config.get("password") if config else os.getenv("DB_PASSWORD", "devmemory_secure_password_2024"),
            "port": config.get("port") if config else int(os.getenv("DB_PORT", "5432")),
            
            # Production-optimized connection pool settings
            "min_size": config.get("min_size") if config else 5,
            "max_size": config.get("max_size") if config else 25,
            "command_timeout": config.get("command_timeout") if config else 30,
            "server_settings": {
                "application_name": "dev-memory-os-semantic-search-fastapi",
                "jit": "off"  # Disable JIT for vector operations
            }
        }
        
        self.pool: Optional[asyncpg.Pool] = None
        self.is_connected = False
        self.has_vector_extension = False
        self.vector_dimensions = 1536  # OpenAI text-embedding-3-small dimensions
        self.connection_attempts = 0
        self.max_connection_attempts = 5
        
        # Performance monitoring
        self.query_stats = {
            "total_queries": 0,
            "slow_queries": 0,
            "error_queries": 0,
            "vector_queries": 0,
            "average_query_time": 0.0
        }
    
    async def initialize(self) -> None:
        """Initialize database connection pool with advanced pgvector setup"""
        attempt = 1
        while attempt <= self.max_connection_attempts:
            try:
                logger.info(f"🔄 Database connection attempt {attempt}/{self.max_connection_attempts}...")
                
                # Create connection pool
                self.pool = await asyncpg.create_pool(
                    user=self.config["user"],
                    password=self.config["password"],
                    database=self.config["database"],
                    host=self.config["host"],
                    port=self.config["port"],
                    min_size=self.config["min_size"],
                    max_size=self.config["max_size"],
                    command_timeout=self.config["command_timeout"],
                    server_settings=self.config["server_settings"]
                )
                
                # Test connection and setup
                await self._setup_connection()
                
                logger.info("✅ Database connected successfully with enhanced pgvector support")
                self.is_connected = True
                self.connection_attempts = 0
                return
                
            except Exception as error:
                self.connection_attempts = attempt
                logger.error(f"❌ Database connection attempt {attempt}/{self.max_connection_attempts} failed: {error}")
                
                if attempt == self.max_connection_attempts:
                    logger.error("🔥 All database connection attempts failed. Running in degraded mode.")
                    self.has_vector_extension = False
                    self.is_connected = False
                    raise Exception(f"Database connection failed after {self.max_connection_attempts} attempts: {error}")
                
                # Exponential backoff
                delay = 2.0 * (2 ** (attempt - 1))
                logger.info(f"⏳ Waiting {delay}s before retry...")
                await asyncio.sleep(delay)
                attempt += 1
    
    async def _setup_connection(self) -> None:
        """Advanced connection setup with pgvector optimization"""
        async with self.pool.acquire() as conn:
            # Test basic connectivity
            await conn.fetchval("SELECT NOW()")
            
            # Check and setup pgvector extension
            await self._setup_vector_extension(conn)
            
            # Optimize connection for vector operations
            if self.has_vector_extension:
                await self._optimize_for_vector_operations(conn)
            
            # Verify database schema compatibility
            await self._verify_schema_compatibility(conn)
    
    async def _setup_vector_extension(self, conn: asyncpg.Connection) -> None:
        """Setup and verify pgvector extension"""
        try:
            # Check if pgvector extension is available
            extension_check = await conn.fetch("""
                SELECT extname, extversion 
                FROM pg_extension 
                WHERE extname = 'vector'
            """)
            
            if not extension_check:
                logger.warning("⚠️  pgvector extension not found - attempting to create...")
                try:
                    await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
                    logger.info("✅ pgvector extension created successfully")
                    self.has_vector_extension = True
                except Exception as create_error:
                    logger.warning("⚠️  Could not create pgvector extension - using fallback text search")
                    logger.warning("   For full vector search capabilities, install pgvector extension manually")
                    self.has_vector_extension = False
            else:
                version = extension_check[0]["extversion"]
                logger.info(f"✅ pgvector extension available (version {version})")
                self.has_vector_extension = True
                
                # Verify vector operations work
                await conn.fetchval("SELECT '[1,2,3]'::vector(3) <-> '[1,2,4]'::vector(3)")
                logger.info("✅ Vector operations verified")
                
        except Exception as error:
            logger.error(f"❌ pgvector setup failed: {error}")
            self.has_vector_extension = False
    
    async def _optimize_for_vector_operations(self, conn: asyncpg.Connection) -> None:
        """Optimize database connection for vector operations"""
        try:
            optimizations = [
                "SET work_mem = '256MB'",
                "SET maintenance_work_mem = '512MB'", 
                "SET max_parallel_workers_per_gather = 4",
                "SET effective_cache_size = '4GB'",
                "SET random_page_cost = 1.1"
            ]
            
            for optimization in optimizations:
                try:
                    await conn.execute(optimization)
                except Exception as opt_error:
                    logger.warning(f"Could not apply optimization: {optimization} - {opt_error}")
            
            logger.info("✅ Database optimized for vector operations")
        except Exception as error:
            logger.warning(f"⚠️  Could not apply vector optimizations: {error}")
    
    async def _verify_schema_compatibility(self, conn: asyncpg.Connection) -> None:
        """Verify database schema compatibility"""
        try:
            # Check for required tables
            tables = await conn.fetch("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('adrs', 'patterns', 'search_queries', 'users', 'projects')
            """)
            
            found_tables = [row["table_name"] for row in tables]
            required_tables = ["adrs", "patterns", "search_queries", "users", "projects"]
            missing_tables = [table for table in required_tables if table not in found_tables]
            
            if missing_tables:
                logger.warning(f"⚠️  Missing database tables: {', '.join(missing_tables)}")
                logger.warning("   Run database migrations to create required tables")
            else:
                logger.info("✅ All required database tables found")
            
            # Check for embedding columns if pgvector is available
            if self.has_vector_extension:
                embedding_columns = await conn.fetch("""
                    SELECT c.table_name, c.column_name, c.data_type
                    FROM information_schema.columns c
                    WHERE c.table_schema = 'public' 
                    AND c.column_name = 'embedding'
                    AND c.table_name IN ('adrs', 'patterns')
                """)
                
                if embedding_columns:
                    logger.info("✅ Embedding columns found and ready for vector operations")
                else:
                    logger.warning("⚠️  No embedding columns found - vector storage will be limited")
                    
        except Exception as error:
            logger.warning(f"⚠️  Schema compatibility check failed: {error}")
    
    async def execute_query(self, query: str, *args) -> List[Dict[str, Any]]:
        """Execute a query and return results as list of dictionaries"""
        if not self.pool:
            raise Exception("Database not connected. Call initialize() first.")
        
        start_time = datetime.now()
        is_vector_query = self._is_vector_query(query)
        
        try:
            async with self.pool.acquire() as conn:
                result = await conn.fetch(query, *args)
                
                # Convert to dict format
                rows = [dict(row) for row in result]
                
                duration = (datetime.now() - start_time).total_seconds() * 1000
                self._update_query_stats(duration, is_vector_query, False)
                
                # Log slow queries
                slow_threshold = 2000 if is_vector_query else 1000
                if duration > slow_threshold:
                    logger.warning(f"🐌 Slow {('vector ' if is_vector_query else '')}query ({duration:.2f}ms)")
                
                return rows
                
        except Exception as error:
            duration = (datetime.now() - start_time).total_seconds() * 1000
            self._update_query_stats(duration, is_vector_query, True)
            logger.error(f"❌ Database query error ({duration:.2f}ms): {error}")
            raise error
    
    async def execute_query_one(self, query: str, *args) -> Optional[Dict[str, Any]]:
        """Execute a query and return first result as dictionary or None"""
        if not self.pool:
            raise Exception("Database not connected. Call initialize() first.")
        
        start_time = datetime.now()
        is_vector_query = self._is_vector_query(query)
        
        try:
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow(query, *args)
                
                duration = (datetime.now() - start_time).total_seconds() * 1000
                self._update_query_stats(duration, is_vector_query, False)
                
                return dict(result) if result else None
                
        except Exception as error:
            duration = (datetime.now() - start_time).total_seconds() * 1000
            self._update_query_stats(duration, is_vector_query, True)
            logger.error(f"❌ Database query error ({duration:.2f}ms): {error}")
            raise error
    
    async def execute_transaction(self, queries: List[tuple]) -> List[Any]:
        """Execute multiple queries in a transaction"""
        if not self.pool:
            raise Exception("Database not connected. Call initialize() first.")
        
        results = []
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                for query, args in queries:
                    result = await conn.fetch(query, *args)
                    results.append([dict(row) for row in result])
        
        return results
    
    async def optimize_for_vector_search(self) -> None:
        """Create vector indexes for optimal similarity search performance"""
        if not self.has_vector_extension:
            logger.warning("Cannot optimize for vector search - pgvector extension not available")
            return
        
        logger.info("🔧 Optimizing database for vector search operations...")
        
        try:
            # Create vector indexes if they don't exist
            await self._create_vector_indexes()
            
            # Update table statistics
            async with self.pool.acquire() as conn:
                await conn.execute("ANALYZE adrs")
                await conn.execute("ANALYZE patterns")
            
            logger.info("✅ Database optimization for vector search completed")
            
        except Exception as error:
            logger.error(f"Failed to optimize database for vector search: {error}")
            raise error
    
    async def _create_vector_indexes(self) -> None:
        """Create vector indexes for optimal similarity search performance"""
        indexes = [
            {
                "table": "adrs",
                "name": "idx_adrs_embedding_cosine",
                "query": "CREATE INDEX IF NOT EXISTS idx_adrs_embedding_cosine ON adrs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
            },
            {
                "table": "adrs",
                "name": "idx_adrs_embedding_l2", 
                "query": "CREATE INDEX IF NOT EXISTS idx_adrs_embedding_l2 ON adrs USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)"
            },
            {
                "table": "patterns",
                "name": "idx_patterns_embedding_cosine",
                "query": "CREATE INDEX IF NOT EXISTS idx_patterns_embedding_cosine ON patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
            },
            {
                "table": "patterns",
                "name": "idx_patterns_embedding_l2",
                "query": "CREATE INDEX IF NOT EXISTS idx_patterns_embedding_l2 ON patterns USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)"
            }
        ]
        
        async with self.pool.acquire() as conn:
            for index in indexes:
                try:
                    logger.info(f"🔨 Creating vector index: {index['name']}")
                    await conn.execute(index["query"])
                    logger.info(f"✅ Vector index {index['name']} ready")
                except Exception as index_error:
                    logger.warning(f"⚠️  Could not create index {index['name']}: {index_error}")
    
    def _is_vector_query(self, query: str) -> bool:
        """Check if query involves vector operations"""
        vector_keywords = ["<=>", "<->", "vector", "embedding", "similarity"]
        lower_query = query.lower()
        return any(keyword in lower_query for keyword in vector_keywords)
    
    def _update_query_stats(self, duration: float, is_vector: bool, has_error: bool) -> None:
        """Update query performance statistics"""
        self.query_stats["total_queries"] += 1
        
        if has_error:
            self.query_stats["error_queries"] += 1
        
        if is_vector:
            self.query_stats["vector_queries"] += 1
        
        slow_threshold = 2000 if is_vector else 1000
        if duration > slow_threshold:
            self.query_stats["slow_queries"] += 1
        
        # Update average query time (simple moving average)
        total = self.query_stats["total_queries"]
        current_avg = self.query_stats["average_query_time"]
        self.query_stats["average_query_time"] = ((current_avg * (total - 1)) + duration) / total
    
    async def is_healthy(self) -> Dict[str, Any]:
        """Comprehensive database health check"""
        try:
            health_info = {
                "connected": self.is_connected,
                "vector_extension": self.has_vector_extension,
                "pool_status": None,
                "query_performance": None,
                "timestamp": datetime.now().isoformat()
            }
            
            if not self.pool:
                health_info["connected"] = False
                return health_info
            
            # Basic connectivity test
            async with self.pool.acquire() as conn:
                basic_test = await conn.fetchrow("SELECT NOW() as current_time, version() as db_version")
                health_info["database_version"] = basic_test["db_version"]
                health_info["server_time"] = basic_test["current_time"].isoformat()
            
            # Pool status
            health_info["pool_status"] = {
                "size": self.pool.get_size(),
                "max_size": self.config["max_size"],
                "min_size": self.config["min_size"]
            }
            
            # Query performance statistics
            health_info["query_performance"] = {
                **self.query_stats,
                "success_rate": f"{((self.query_stats['total_queries'] - self.query_stats['error_queries']) / max(self.query_stats['total_queries'], 1) * 100):.2f}%"
            }
            
            # Vector extension health
            if self.has_vector_extension:
                try:
                    async with self.pool.acquire() as conn:
                        vector_test = await conn.fetchval("SELECT '[1,2,3]'::vector(3) <-> '[1,2,4]'::vector(3)")
                        health_info["vector_operations"] = "healthy"
                        health_info["vector_test_similarity"] = float(vector_test)
                except Exception as vector_error:
                    health_info["vector_operations"] = "error"
                    health_info["vector_error"] = str(vector_error)
            
            return health_info
            
        except Exception as error:
            logger.error(f"Comprehensive health check failed: {error}")
            return {
                "connected": False,
                "vector_extension": False,
                "error": str(error),
                "timestamp": datetime.now().isoformat()
            }
    
    async def close(self) -> None:
        """Close all connections in the pool"""
        if self.pool:
            await self.pool.close()
            self.is_connected = False
            logger.info("Database connections closed")