"""
Health check endpoint
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def health_check(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Health check endpoint with database connectivity test
    """
    health_data = {
        "status": "healthy",
        "application": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "development" if settings.DEBUG else "production",
        "database": {
            "status": "unknown"
        }
    }
    
    # Test database connection
    try:
        result = await db.execute("SELECT 1 as test")
        row = result.fetchone()
        if row and row[0] == 1:
            health_data["database"]["status"] = "connected"
        else:
            health_data["database"]["status"] = "error"
            health_data["status"] = "degraded"
    except Exception as e:
        health_data["database"]["status"] = "error"
        health_data["database"]["error"] = str(e)
        health_data["status"] = "degraded"
    
    return health_data