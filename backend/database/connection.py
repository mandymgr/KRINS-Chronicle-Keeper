"""
🔌 KRINS-Chronicle-Keeper Database Connection
SQLAlchemy async database connection and session management
"""

import os
import asyncio
from typing import AsyncGenerator
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://krins:krins_password@localhost:5433/krins_db"
)

# Ensure URL has asyncpg driver for SQLAlchemy
if not DATABASE_URL.startswith("postgresql+asyncpg://"):
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,  # Recycle connections every hour
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=True,
    autocommit=False,
)

# Import Base from base module
from .base import Base

class DatabaseManager:
    """Database connection and session management"""
    
    def __init__(self):
        self.engine = engine
        self.session_factory = AsyncSessionLocal
    
    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get a database session with automatic cleanup"""
        async with self.session_factory() as session:
            try:
                yield session
            except Exception as e:
                await session.rollback()
                logger.error(f"Database session error: {str(e)}")
                raise
            finally:
                await session.close()
    
    async def create_tables(self):
        """Create all database tables"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ Database tables created successfully")
    
    async def drop_tables(self):
        """Drop all database tables (use with caution!)"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            logger.info("🗑️ All database tables dropped")
    
    async def test_connection(self) -> bool:
        """Test database connectivity"""
        try:
            async with self.session_factory() as session:
                result = await session.execute("SELECT 1")
                await result.fetchone()
                logger.info("✅ Database connection test successful")
                return True
        except Exception as e:
            logger.error(f"❌ Database connection test failed: {str(e)}")
            return False
    
    async def close(self):
        """Close database engine"""
        await self.engine.dispose()
        logger.info("🔌 Database engine closed")

# Global database manager instance
db_manager = DatabaseManager()

# FastAPI dependency for getting database sessions
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency to get database session"""
    async with db_manager.get_session() as session:
        yield session

# Context manager for manual session management
@asynccontextmanager
async def get_db_session_context() -> AsyncGenerator[AsyncSession, None]:
    """Context manager for manual database session management"""
    async with db_manager.get_session() as session:
        yield session

# Database initialization functions
async def init_database():
    """Initialize database with tables and default data"""
    try:
        # Test connection first
        if not await db_manager.test_connection():
            raise Exception("Database connection failed")
        
        # Create tables
        await db_manager.create_tables()
        
        # Initialize default roles and permissions
        from auth.rbac import RBACService
        async with get_db_session_context() as db:
            rbac_service = RBACService(db)
            await rbac_service.initialize_default_roles_and_permissions()
            logger.info("✅ Default roles and permissions initialized")
        
        logger.info("🚀 Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        raise

async def cleanup_database():
    """Cleanup database connections on shutdown"""
    await db_manager.close()

# Health check function
async def check_database_health() -> dict:
    """Check database health for monitoring"""
    try:
        async with db_manager.get_session() as session:
            result = await session.execute("SELECT version()")
            version_info = (await result.fetchone())[0]
            
            # Get connection pool status
            pool_status = {
                "size": engine.pool.size(),
                "checked_in": engine.pool.checkedin(),
                "checked_out": engine.pool.checkedout(),
                "overflow": engine.pool.overflow(),
                "invalid": engine.pool.invalid()
            }
            
            return {
                "status": "healthy",
                "version": version_info,
                "pool": pool_status,
                "connection_url": DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else "unknown"
            }
    
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }