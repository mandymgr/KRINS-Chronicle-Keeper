"""
Async database connection and session management
"""

from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Database connection and session manager"""
    
    def __init__(self):
        self.engine: Optional[AsyncEngine] = None
        self.session_factory: Optional[sessionmaker] = None
    
    async def initialize(self) -> None:
        """Initialize database connection"""
        try:
            # Create async engine
            self.engine = create_async_engine(
                str(settings.DATABASE_URL),
                pool_size=settings.DB_POOL_SIZE,
                max_overflow=settings.DB_MAX_OVERFLOW,
                pool_timeout=settings.DB_POOL_TIMEOUT,
                pool_recycle=settings.DB_POOL_RECYCLE,
                echo=settings.DEBUG,
                future=True,
            )
            
            # Create session factory
            self.session_factory = sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=False,
                autocommit=False,
            )
            
            logger.info("Database connection initialized successfully")
            
        except Exception as error:
            logger.error(f"Database initialization failed: {error}")
            raise
    
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get database session"""
        if not self.session_factory:
            raise RuntimeError("Database not initialized")
        
        async with self.session_factory() as session:
            try:
                yield session
            except Exception as error:
                await session.rollback()
                logger.error(f"Database session error: {error}")
                raise
            finally:
                await session.close()
    
    async def close(self) -> None:
        """Close database connections"""
        if self.engine:
            await self.engine.dispose()
            logger.info("Database connections closed")


# Global database manager
db_manager = DatabaseManager()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting database session"""
    async for session in db_manager.get_session():
        yield session


async def init_db() -> None:
    """Initialize database"""
    await db_manager.initialize()


async def close_db() -> None:
    """Close database"""
    await db_manager.close()