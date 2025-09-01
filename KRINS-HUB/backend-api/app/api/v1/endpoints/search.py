"""
Search endpoints
"""

from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, text
from pydantic import BaseModel

from app.database.connection import get_db
from app.models.database import ADR, Pattern
from app.core.config import settings

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    content_types: Optional[List[str]] = ["adrs", "patterns"]
    similarity_threshold: Optional[float] = 0.7
    max_results: Optional[int] = 20


@router.post("/semantic", response_model=Dict[str, Any])
async def semantic_search(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Semantic search across ADRs and patterns using text similarity
    """
    if not request.query or len(request.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query must be at least 3 characters long")
    
    search_term = request.query.strip().lower()
    results = {
        "query": request.query,
        "total_results": 0,
        "results_by_type": {}
    }
    
    # Search ADRs if requested
    if "adrs" in request.content_types:
        adr_query = select(ADR).where(
            or_(
                ADR.title.ilike(f"%{search_term}%"),
                ADR.problem_statement.ilike(f"%{search_term}%"),
                ADR.decision.ilike(f"%{search_term}%"),
                ADR.embedding_text.ilike(f"%{search_term}%")
            )
        ).limit(request.max_results // len(request.content_types))
        
        adr_result = await db.execute(adr_query)
        adrs = adr_result.scalars().all()
        
        results["results_by_type"]["adrs"] = [
            {
                "id": str(adr.id),
                "type": "adr",
                "title": adr.title,
                "similarity": 1.0,  # Placeholder similarity score
                "project_id": str(adr.project_id),
                "status": adr.status,
                "problem_statement": (adr.problem_statement or "")[:200] + "..." if adr.problem_statement and len(adr.problem_statement) > 200 else adr.problem_statement,
                "created_at": adr.created_at.isoformat() if adr.created_at else None
            }
            for adr in adrs
        ]
        results["total_results"] += len(adrs)
    
    # Search Patterns if requested
    if "patterns" in request.content_types:
        pattern_query = select(Pattern).where(
            or_(
                Pattern.name.ilike(f"%{search_term}%"),
                Pattern.description.ilike(f"%{search_term}%"),
                Pattern.when_to_use.ilike(f"%{search_term}%"),
                Pattern.embedding_text.ilike(f"%{search_term}%")
            ),
            Pattern.status == "active"
        ).limit(request.max_results // len(request.content_types))
        
        pattern_result = await db.execute(pattern_query)
        patterns = pattern_result.scalars().all()
        
        results["results_by_type"]["patterns"] = [
            {
                "id": str(pattern.id),
                "type": "pattern",
                "name": pattern.name,
                "similarity": 1.0,  # Placeholder similarity score
                "category": pattern.category,
                "description": (pattern.description or "")[:200] + "..." if pattern.description and len(pattern.description) > 200 else pattern.description,
                "usage_count": pattern.usage_count,
                "effectiveness_score": pattern.effectiveness_score,
                "created_at": pattern.created_at.isoformat() if pattern.created_at else None
            }
            for pattern in patterns
        ]
        results["total_results"] += len(patterns)
    
    return results


@router.get("/autocomplete", response_model=List[Dict[str, Any]])
async def search_autocomplete(
    q: str = Query(..., min_length=2, description="Search query for autocomplete"),
    limit: int = Query(10, le=20, description="Number of suggestions to return"),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Autocomplete suggestions for search queries
    """
    search_term = q.strip().lower()
    suggestions = []
    
    # Get ADR titles that match
    adr_query = select(ADR.title, ADR.id).where(
        ADR.title.ilike(f"%{search_term}%")
    ).limit(limit // 2)
    
    adr_result = await db.execute(adr_query)
    adr_suggestions = adr_result.all()
    
    for title, adr_id in adr_suggestions:
        suggestions.append({
            "text": title,
            "type": "adr",
            "id": str(adr_id)
        })
    
    # Get pattern names that match
    pattern_query = select(Pattern.name, Pattern.id).where(
        Pattern.name.ilike(f"%{search_term}%"),
        Pattern.status == "active"
    ).limit(limit // 2)
    
    pattern_result = await db.execute(pattern_query)
    pattern_suggestions = pattern_result.all()
    
    for name, pattern_id in pattern_suggestions:
        suggestions.append({
            "text": name,
            "type": "pattern", 
            "id": str(pattern_id)
        })
    
    return suggestions[:limit]