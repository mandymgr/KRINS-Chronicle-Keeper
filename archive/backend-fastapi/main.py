"""
Dev Memory OS FastAPI Application
Production-ready semantic search API with PostgreSQL and async processing
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.connection import init_db, close_db

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting Dev Memory OS FastAPI backend...")
    
    try:
        # Initialize database
        await init_db()
        logger.info("✅ Database initialized")
        
        # Additional startup tasks can go here
        yield
        
    finally:
        # Shutdown
        logger.info("🛑 Shutting down Dev Memory OS FastAPI backend...")
        await close_db()
        logger.info("✅ Cleanup completed")

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-ready AI-powered semantic search with async PostgreSQL",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def process_time_header(request: Request, call_next):
    """Add processing time header"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(f"{process_time:.4f}")
    return response


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """Request logging middleware"""
    start_time = time.time()
    
    # Log request
    logger.info(f"🔄 {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"✅ {request.method} {request.url.path} - "
            f"{response.status_code} ({process_time:.3f}s)"
        )
        
        return response
        
    except Exception as error:
        process_time = time.time() - start_time
        logger.error(
            f"❌ {request.method} {request.url.path} - "
            f"ERROR ({process_time:.3f}s): {str(error)}"
        )
        raise


# Include API routes
from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Comprehensive health check"""
    health_data = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.VERSION,
        "services": {
            "api": True,
            "database": False,
            "openai": bool(settings.OPENAI_API_KEY)
        },
        "system": {
            "debug_mode": settings.DEBUG,
            "log_level": settings.LOG_LEVEL
        }
    }
    
    # Test database connection
    try:
        from app.database.connection import db_manager
        if db_manager.engine:
            async with db_manager.engine.begin() as conn:
                await conn.execute("SELECT 1")
            health_data["services"]["database"] = True
            health_data["database"] = {
                "connected": True,
                "pool_size": settings.DB_POOL_SIZE,
                "max_overflow": settings.DB_MAX_OVERFLOW
            }
        else:
            health_data["status"] = "degraded"
            health_data["database"] = {"connected": False, "error": "Database not initialized"}
            
    except Exception as error:
        health_data["status"] = "degraded"
        health_data["services"]["database"] = False
        health_data["database"] = {
            "connected": False,
            "error": str(error)
        }
    
    status_code = 200 if health_data["status"] == "healthy" else 503
    return JSONResponse(content=health_data, status_code=status_code)

# Root endpoint
@app.get("/")
async def root() -> Dict[str, Any]:
    """API root endpoint with comprehensive information"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "description": "Production-ready AI-powered semantic search with async PostgreSQL",
        "status": "operational",
        "features": {
            "semantic_search": "AI-powered natural language search",
            "async_processing": "High-performance async database operations",
            "auto_documentation": "Interactive API docs with OpenAPI",
            "analytics": "Search performance monitoring",
            "postgresql": "Advanced PostgreSQL with async support"
        },
        "endpoints": {
            "docs": f"{settings.API_V1_STR}/docs",
            "redoc": f"{settings.API_V1_STR}/redoc",
            "health": "/health",
            "api": settings.API_V1_STR
        },
        "database": {
            "type": "PostgreSQL",
            "async": True,
            "pool_size": settings.DB_POOL_SIZE
        },
        "environment": {
            "debug": settings.DEBUG,
            "log_level": settings.LOG_LEVEL
        }
    }


# API version info
@app.get(f"{settings.API_V1_STR}")
async def api_info() -> Dict[str, Any]:
    """API version information"""
    return {
        "api_version": "v1",
        "application": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "endpoints": {
            "health": "/health",
            "docs": f"{settings.API_V1_STR}/docs",
            "search": f"{settings.API_V1_STR}/search",
            "adrs": f"{settings.API_V1_STR}/adrs",
            "patterns": f"{settings.API_V1_STR}/patterns"
        },
        "documentation": f"{settings.API_V1_STR}/docs"
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path,
            "timestamp": time.time()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "Something went wrong",
            "path": request.url.path,
            "timestamp": time.time()
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    )