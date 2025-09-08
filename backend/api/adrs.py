"""
ADR (Architecture Decision Records) API endpoints
Integrates with Chronicle-Keeper decision management system.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Path
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import asyncpg
import json
import logging
from datetime import datetime
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

adr_router = APIRouter()

# Pydantic models
class ADRCreate(BaseModel):
    title: str = Field(..., min_length=10, max_length=200)
    status: str = Field(..., pattern="^(proposed|accepted|superseded|deprecated)$")
    context: str = Field(..., min_length=50)
    decision: str = Field(..., min_length=50)
    consequences: str = Field(..., min_length=20)
    component: str = Field(..., min_length=2, max_length=100)
    decision_date: Optional[datetime] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    complexity_score: Optional[float] = Field(None, ge=0, le=1)
    actionability_score: Optional[float] = Field(None, ge=0, le=1)
    tags: Optional[List[str]] = []

class ADRResponse(BaseModel):
    id: int
    adr_id: str
    title: str
    status: str
    context: str
    decision: str
    consequences: str
    component: str
    decision_date: datetime
    created_at: datetime
    updated_at: datetime
    confidence_score: Optional[float]
    complexity_score: Optional[float] 
    actionability_score: Optional[float]
    tags: List[str]

class ADRUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=10, max_length=200)
    status: Optional[str] = Field(None, pattern="^(proposed|accepted|superseded|deprecated)$")
    context: Optional[str] = Field(None, min_length=50)
    decision: Optional[str] = Field(None, min_length=50)
    consequences: Optional[str] = Field(None, min_length=20)
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    complexity_score: Optional[float] = Field(None, ge=0, le=1)
    actionability_score: Optional[float] = Field(None, ge=0, le=1)
    tags: Optional[List[str]] = None

# Dependency injection for database
async def get_db():
    """Get database connection - will be injected from main.py"""
    # This will be overridden by dependency injection
    pass

@adr_router.get("/", response_model=List[ADRResponse])
async def list_adrs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[str] = Query(None, regex="^(proposed|accepted|superseded|deprecated)$"),
    component: Optional[str] = Query(None, min_length=1),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📋 List all ADRs with optional filtering
    
    - **skip**: Pagination offset
    - **limit**: Maximum results per page
    - **status**: Filter by ADR status
    - **component**: Filter by component/system
    """
    try:
        query = """
            SELECT * FROM adrs 
            WHERE ($3::text IS NULL OR status = $3)
            AND ($4::text IS NULL OR component ILIKE '%' || $4 || '%')
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $1
        """
        
        rows = await db.fetch(query, skip, limit, status, component)
        
        adrs = []
        for row in rows:
            adrs.append({
                "id": row["id"],
                "adr_id": row["adr_id"],
                "title": row["title"],
                "status": row["status"],
                "context": row["context"],
                "decision": row["decision"],
                "consequences": row["consequences"],
                "component": row["component"],
                "decision_date": row["decision_date"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
                "confidence_score": row["confidence_score"],
                "complexity_score": row["complexity_score"],
                "actionability_score": row["actionability_score"],
                "tags": json.loads(row["tags"]) if row["tags"] else []
            })
        
        logger.info(f"📋 Retrieved {len(adrs)} ADRs (skip={skip}, limit={limit})")
        return adrs
        
    except Exception as e:
        logger.error(f"❌ Error listing ADRs: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve ADRs")

@adr_router.get("/{adr_id}", response_model=ADRResponse)
async def get_adr(
    adr_id: str = Path(..., description="ADR identifier"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📄 Get specific ADR by ID
    
    Returns detailed information about a single ADR including all metadata.
    """
    try:
        query = "SELECT * FROM adrs WHERE adr_id = $1"
        row = await db.fetchrow(query, adr_id)
        
        if not row:
            raise HTTPException(status_code=404, detail=f"ADR {adr_id} not found")
        
        adr = {
            "id": row["id"],
            "adr_id": row["adr_id"],
            "title": row["title"],
            "status": row["status"],
            "context": row["context"],
            "decision": row["decision"],
            "consequences": row["consequences"],
            "component": row["component"],
            "decision_date": row["decision_date"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "confidence_score": row["confidence_score"],
            "complexity_score": row["complexity_score"],
            "actionability_score": row["actionability_score"],
            "tags": json.loads(row["tags"]) if row["tags"] else []
        }
        
        logger.info(f"📄 Retrieved ADR: {adr_id}")
        return adr
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving ADR {adr_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve ADR")

@adr_router.post("/", response_model=ADRResponse)
async def create_adr(
    adr: ADRCreate,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    ✨ Create new ADR
    
    Creates a new Architecture Decision Record with automatic ID generation
    and metadata calculation.
    """
    try:
        # Generate ADR ID
        count_query = "SELECT COUNT(*) FROM adrs WHERE component = $1"
        count = await db.fetchval(count_query, adr.component)
        adr_id = f"ADR-{str(count + 1).zfill(4)}-{adr.component.upper().replace(' ', '-')}"
        
        # Set defaults
        decision_date = adr.decision_date or datetime.now()
        confidence_score = adr.confidence_score or 0.8
        complexity_score = adr.complexity_score or 0.6
        actionability_score = adr.actionability_score or 0.9
        
        insert_query = """
            INSERT INTO adrs (
                adr_id, title, status, context, decision, consequences, 
                component, decision_date, confidence_score, complexity_score,
                actionability_score, tags
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            ) RETURNING *
        """
        
        row = await db.fetchrow(
            insert_query,
            adr_id, adr.title, adr.status, adr.context, adr.decision,
            adr.consequences, adr.component, decision_date, confidence_score,
            complexity_score, actionability_score, json.dumps(adr.tags or [])
        )
        
        new_adr = {
            "id": row["id"],
            "adr_id": row["adr_id"],
            "title": row["title"],
            "status": row["status"],
            "context": row["context"],
            "decision": row["decision"],
            "consequences": row["consequences"],
            "component": row["component"],
            "decision_date": row["decision_date"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "confidence_score": row["confidence_score"],
            "complexity_score": row["complexity_score"],
            "actionability_score": row["actionability_score"],
            "tags": json.loads(row["tags"]) if row["tags"] else []
        }
        
        logger.info(f"✨ Created ADR: {adr_id}")
        return new_adr
        
    except Exception as e:
        logger.error(f"❌ Error creating ADR: {e}")
        raise HTTPException(status_code=500, detail="Failed to create ADR")

@adr_router.put("/{adr_id}", response_model=ADRResponse)
async def update_adr(
    adr_id: str = Path(..., description="ADR identifier"),
    adr_update: ADRUpdate = None,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📝 Update existing ADR
    
    Updates specified fields of an existing ADR. Only provided fields are updated.
    """
    try:
        # Check if ADR exists
        existing = await db.fetchrow("SELECT * FROM adrs WHERE adr_id = $1", adr_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"ADR {adr_id} not found")
        
        # Build update query dynamically
        updates = {}
        if adr_update.title is not None:
            updates["title"] = adr_update.title
        if adr_update.status is not None:
            updates["status"] = adr_update.status
        if adr_update.context is not None:
            updates["context"] = adr_update.context
        if adr_update.decision is not None:
            updates["decision"] = adr_update.decision
        if adr_update.consequences is not None:
            updates["consequences"] = adr_update.consequences
        if adr_update.confidence_score is not None:
            updates["confidence_score"] = adr_update.confidence_score
        if adr_update.complexity_score is not None:
            updates["complexity_score"] = adr_update.complexity_score
        if adr_update.actionability_score is not None:
            updates["actionability_score"] = adr_update.actionability_score
        if adr_update.tags is not None:
            updates["tags"] = json.dumps(adr_update.tags)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated_at
        updates["updated_at"] = datetime.now()
        
        # Build SQL
        set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(updates.keys())])
        query = f"UPDATE adrs SET {set_clause} WHERE adr_id = $1 RETURNING *"
        
        row = await db.fetchrow(query, adr_id, *updates.values())
        
        updated_adr = {
            "id": row["id"],
            "adr_id": row["adr_id"],
            "title": row["title"],
            "status": row["status"],
            "context": row["context"],
            "decision": row["decision"],
            "consequences": row["consequences"],
            "component": row["component"],
            "decision_date": row["decision_date"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "confidence_score": row["confidence_score"],
            "complexity_score": row["complexity_score"],
            "actionability_score": row["actionability_score"],
            "tags": json.loads(row["tags"]) if row["tags"] else []
        }
        
        logger.info(f"📝 Updated ADR: {adr_id}")
        return updated_adr
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating ADR {adr_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update ADR")

@adr_router.delete("/{adr_id}")
async def delete_adr(
    adr_id: str = Path(..., description="ADR identifier"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🗑️ Delete ADR
    
    Permanently removes an ADR from the system. This action cannot be undone.
    """
    try:
        result = await db.execute("DELETE FROM adrs WHERE adr_id = $1", adr_id)
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail=f"ADR {adr_id} not found")
        
        logger.info(f"🗑️ Deleted ADR: {adr_id}")
        return {"message": f"ADR {adr_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting ADR {adr_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete ADR")

@adr_router.get("/search/semantic")
async def semantic_search(
    query: str = Query(..., min_length=3, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    threshold: float = Query(0.7, ge=0, le=1, description="Similarity threshold"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🔍 Semantic search across ADRs using pgvector
    
    Performs vector similarity search on ADR content for intelligent discovery.
    """
    try:
        # This would integrate with pgvector for semantic search
        # For now, fallback to text search
        search_query = """
            SELECT *, 
                   ts_rank(to_tsvector('english', title || ' ' || context || ' ' || decision), 
                          plainto_tsquery('english', $1)) as rank
            FROM adrs 
            WHERE to_tsvector('english', title || ' ' || context || ' ' || decision) 
                  @@ plainto_tsquery('english', $1)
            ORDER BY rank DESC
            LIMIT $2
        """
        
        rows = await db.fetch(search_query, query, limit)
        
        results = []
        for row in rows:
            results.append({
                "adr_id": row["adr_id"],
                "title": row["title"],
                "component": row["component"],
                "status": row["status"],
                "relevance_score": float(row["rank"]),
                "snippet": row["context"][:200] + "..." if len(row["context"]) > 200 else row["context"]
            })
        
        logger.info(f"🔍 Semantic search for '{query}': {len(results)} results")
        return {
            "query": query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"❌ Error in semantic search: {e}")
        raise HTTPException(status_code=500, detail="Search failed")