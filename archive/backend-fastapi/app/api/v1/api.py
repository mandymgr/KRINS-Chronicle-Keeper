"""
API router that includes all endpoint routes
"""

from fastapi import APIRouter

from app.api.v1.endpoints import adrs, patterns, search, health, semantic_search

api_router = APIRouter()

# Include all route modules
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(adrs.router, prefix="/adrs", tags=["adrs"])
api_router.include_router(patterns.router, prefix="/patterns", tags=["patterns"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(semantic_search.router, prefix="/search", tags=["semantic-search"])