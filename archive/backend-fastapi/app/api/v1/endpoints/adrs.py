"""
ADR (Architecture Decision Records) endpoints
"""

from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import uuid

from app.database.connection import get_db
from app.models.database import ADR, Project, User

router = APIRouter()


@router.get("/", response_model=List[Dict[str, Any]])
async def get_adrs(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, le=100, description="Number of ADRs to return"),
    offset: int = Query(0, ge=0, description="Number of ADRs to skip"),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get list of ADRs with optional filtering
    """
    query = select(ADR)
    
    # Apply filters
    if project_id:
        try:
            project_uuid = uuid.UUID(project_id)
            query = query.where(ADR.project_id == project_uuid)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    if status:
        query = query.where(ADR.status == status)
    
    # Apply ordering, limit and offset
    query = query.order_by(desc(ADR.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    adrs = result.scalars().all()
    
    # Convert to dict format
    return [
        {
            "id": str(adr.id),
            "project_id": str(adr.project_id),
            "number": adr.number,
            "title": adr.title,
            "status": adr.status,
            "problem_statement": adr.problem_statement,
            "decision": adr.decision,
            "created_at": adr.created_at.isoformat() if adr.created_at else None,
            "updated_at": adr.updated_at.isoformat() if adr.updated_at else None
        }
        for adr in adrs
    ]


@router.get("/{adr_id}", response_model=Dict[str, Any])
async def get_adr(
    adr_id: str,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get a specific ADR by ID
    """
    try:
        adr_uuid = uuid.UUID(adr_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ADR ID format")
    
    query = select(ADR).where(ADR.id == adr_uuid)
    result = await db.execute(query)
    adr = result.scalar_one_or_none()
    
    if not adr:
        raise HTTPException(status_code=404, detail="ADR not found")
    
    return {
        "id": str(adr.id),
        "project_id": str(adr.project_id),
        "number": adr.number,
        "title": adr.title,
        "status": adr.status,
        "problem_statement": adr.problem_statement,
        "alternatives": adr.alternatives,
        "decision": adr.decision,
        "rationale": adr.rationale,
        "evidence": adr.evidence,
        "author_id": str(adr.author_id),
        "created_at": adr.created_at.isoformat() if adr.created_at else None,
        "updated_at": adr.updated_at.isoformat() if adr.updated_at else None
    }