"""
Pattern endpoints
"""

from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import uuid

from app.database.connection import get_db
from app.models.database import Pattern

router = APIRouter()


@router.get("/", response_model=List[Dict[str, Any]])
async def get_patterns(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query("active", description="Filter by status"),
    limit: int = Query(20, le=100, description="Number of patterns to return"),
    offset: int = Query(0, ge=0, description="Number of patterns to skip"),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get list of patterns with optional filtering
    """
    query = select(Pattern)
    
    # Apply filters
    if category:
        query = query.where(Pattern.category == category)
    
    if status:
        query = query.where(Pattern.status == status)
    
    # Apply ordering, limit and offset
    query = query.order_by(desc(Pattern.usage_count), desc(Pattern.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    patterns = result.scalars().all()
    
    # Convert to dict format
    return [
        {
            "id": str(pattern.id),
            "name": pattern.name,
            "category": pattern.category,
            "description": pattern.description,
            "when_to_use": pattern.when_to_use,
            "context_tags": pattern.context_tags,
            "effectiveness_score": pattern.effectiveness_score,
            "usage_count": pattern.usage_count,
            "status": pattern.status,
            "created_at": pattern.created_at.isoformat() if pattern.created_at else None
        }
        for pattern in patterns
    ]


@router.get("/{pattern_id}", response_model=Dict[str, Any])
async def get_pattern(
    pattern_id: str,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get a specific pattern by ID
    """
    try:
        pattern_uuid = uuid.UUID(pattern_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pattern ID format")
    
    query = select(Pattern).where(Pattern.id == pattern_uuid)
    result = await db.execute(query)
    pattern = result.scalar_one_or_none()
    
    if not pattern:
        raise HTTPException(status_code=404, detail="Pattern not found")
    
    return {
        "id": str(pattern.id),
        "name": pattern.name,
        "category": pattern.category,
        "description": pattern.description,
        "when_to_use": pattern.when_to_use,
        "when_not_to_use": pattern.when_not_to_use,
        "context_tags": pattern.context_tags,
        "implementation_examples": pattern.implementation_examples,
        "anti_patterns": pattern.anti_patterns,
        "metrics": pattern.metrics,
        "security_considerations": pattern.security_considerations,
        "effectiveness_score": pattern.effectiveness_score,
        "usage_count": pattern.usage_count,
        "version": pattern.version,
        "status": pattern.status,
        "created_at": pattern.created_at.isoformat() if pattern.created_at else None,
        "updated_at": pattern.updated_at.isoformat() if pattern.updated_at else None
    }