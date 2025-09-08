"""
KRINS-Chronicle-Keeper FastAPI Backend
Main application entry point for organizational intelligence web API.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import logging
from typing import List, Dict, Any, Optional
import asyncpg
import json
from datetime import datetime
import uvicorn

from api.adrs import adr_router
from api.decisions import decision_router
from api.intelligence import intelligence_router
from api.analytics import analytics_router
from api.auth import auth_router
from auth.middleware import configure_middleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="KRINS Chronicle Keeper API",
    description="Organizational Intelligence and Decision Management System",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure authentication middleware
configure_middleware(app)

# Database connection pool
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://krins:krins_password@localhost:5433/krins_db")

# Fix DATABASE_URL for asyncpg (remove +asyncpg suffix)
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

db_pool = None

@app.on_event("startup")
async def startup_database():
    """Initialize database connection pool on startup"""
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        logger.info("🗄️  Database connection pool established")
        
        # Test connection
        async with db_pool.acquire() as conn:
            result = await conn.fetchval("SELECT 1")
            logger.info("✅ Database connectivity verified")
            
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_database():
    """Close database connection pool on shutdown"""
    global db_pool
    if db_pool:
        await db_pool.close()
        logger.info("🔌 Database connection pool closed")

async def get_db():
    """Dependency to get database connection"""
    async with db_pool.acquire() as connection:
        yield connection

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "3.0.0",
            "database": "connected",
            "services": {
                "adrs": "operational",
                "decisions": "operational", 
                "intelligence": "operational",
                "analytics": "operational"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

# API version info
@app.get("/api/v1/info")
async def api_info():
    """API information endpoint"""
    return {
        "name": "KRINS Chronicle Keeper API",
        "version": "3.0.0",
        "description": "Organizational Intelligence and Decision Management System",
        "endpoints": {
            "adrs": "/api/v1/adrs",
            "decisions": "/api/v1/decisions", 
            "intelligence": "/api/v1/intelligence",
            "analytics": "/api/v1/analytics"
        },
        "features": [
            "Architecture Decision Records (ADRs)",
            "Decision Analytics & Tracking",
            "AI-Powered Intelligence Context",
            "Evidence Collection & Validation",
            "Decision Relationship Mapping",
            "Semantic Search with pgvector",
            "Real-time Analytics Dashboard"
        ]
    }

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(adr_router, prefix="/api/v1/adrs", tags=["ADRs"])
app.include_router(decision_router, prefix="/api/v1/decisions", tags=["Decisions"])
app.include_router(intelligence_router, prefix="/api/v1/intelligence", tags=["Intelligence"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with system overview"""
    return {
        "message": "🧠 KRINS Chronicle Keeper - Organizational Intelligence System",
        "version": "3.0.0", 
        "api_docs": "/docs",
        "health": "/health",
        "capabilities": [
            "Decision Management",
            "AI Intelligence Integration", 
            "Analytics & Insights",
            "Evidence Collection",
            "Semantic Search"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )