"""
Advanced semantic search endpoints with pgvector integration
"""

from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, text, and_
from pydantic import BaseModel, Field
import logging

from app.database.connection import get_db
from app.models.database import ADR, Pattern, User
from app.services.embeddings import EmbeddingsService
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize embeddings service
embeddings_service = EmbeddingsService()


class SemanticSearchRequest(BaseModel):
    """Request model for semantic search"""
    query: str = Field(..., min_length=3, max_length=500, description="Search query")
    content_types: List[str] = Field(default=["adrs", "patterns"], description="Content types to search")
    similarity_threshold: float = Field(default=0.7, ge=0.1, le=1.0, description="Minimum similarity score")
    max_results: int = Field(default=20, ge=1, le=100, description="Maximum number of results")
    search_mode: str = Field(default="hybrid", description="Search mode: semantic, keyword, or hybrid")
    project_id: Optional[str] = Field(default=None, description="Filter by project ID")


class SearchResult(BaseModel):
    """Search result model"""
    id: str
    type: str
    title: str
    content: str
    similarity: float
    metadata: Dict[str, Any]
    created_at: str


class SemanticSearchResponse(BaseModel):
    """Response model for semantic search"""
    query: str
    search_mode: str
    total_results: int
    processing_time_ms: float
    results_by_type: Dict[str, List[SearchResult]]
    suggestions: List[str] = []


@router.post("/semantic", response_model=SemanticSearchResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db)
) -> SemanticSearchResponse:
    """
    Advanced semantic search with hybrid capabilities
    
    Supports three modes:
    - semantic: Pure vector similarity search
    - keyword: Traditional full-text search
    - hybrid: Combines both approaches with intelligent ranking
    """
    import time
    start_time = time.time()
    
    logger.info(f"Semantic search: '{request.query}' (mode: {request.search_mode})")
    
    results = {
        "query": request.query,
        "search_mode": request.search_mode,
        "total_results": 0,
        "processing_time_ms": 0.0,
        "results_by_type": {},
        "suggestions": []
    }
    
    try:
        # Generate query embedding for semantic search
        query_embedding = None
        if request.search_mode in ["semantic", "hybrid"] and embeddings_service.is_available():
            query_embedding = await embeddings_service.generate_embedding(request.query)
            if not query_embedding:
                logger.warning("Failed to generate query embedding, falling back to keyword search")
                request.search_mode = "keyword"
        
        # Search ADRs
        if "adrs" in request.content_types:
            adr_results = await _search_adrs(
                db, request, query_embedding, request.max_results // len(request.content_types)
            )
            results["results_by_type"]["adrs"] = adr_results
            results["total_results"] += len(adr_results)
        
        # Search Patterns
        if "patterns" in request.content_types:
            pattern_results = await _search_patterns(
                db, request, query_embedding, request.max_results // len(request.content_types)
            )
            results["results_by_type"]["patterns"] = pattern_results
            results["total_results"] += len(pattern_results)
        
        # Generate search suggestions
        if results["total_results"] < 5:
            results["suggestions"] = await _generate_search_suggestions(db, request.query)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        results["processing_time_ms"] = round(processing_time, 2)
        
        logger.info(f"Search completed in {processing_time:.2f}ms, found {results['total_results']} results")
        return SemanticSearchResponse(**results)
        
    except Exception as error:
        logger.error(f"Semantic search failed: {error}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(error)}")


async def _search_adrs(
    db: AsyncSession,
    request: SemanticSearchRequest,
    query_embedding: Optional[List[float]],
    limit: int
) -> List[SearchResult]:
    """Search ADRs using semantic or keyword search"""
    
    if request.search_mode == "semantic" and query_embedding:
        # Pure semantic search
        return await _semantic_search_adrs(db, query_embedding, request, limit)
    elif request.search_mode == "keyword":
        # Pure keyword search
        return await _keyword_search_adrs(db, request, limit)
    elif request.search_mode == "hybrid" and query_embedding:
        # Hybrid search - combine semantic and keyword results
        semantic_results = await _semantic_search_adrs(db, query_embedding, request, limit // 2)
        keyword_results = await _keyword_search_adrs(db, request, limit // 2)
        
        # Combine and deduplicate results
        combined = _combine_and_rank_results(semantic_results, keyword_results, limit)
        return combined
    else:
        # Fallback to keyword search
        return await _keyword_search_adrs(db, request, limit)


async def _semantic_search_adrs(
    db: AsyncSession,
    query_embedding: List[float],
    request: SemanticSearchRequest,
    limit: int
) -> List[SearchResult]:
    """Semantic search using vector similarity"""
    
    try:
        similar_vectors = await embeddings_service.search_similar_vectors(
            db=db,
            query_embedding=query_embedding,
            table_name="adrs",
            embedding_column="embedding",
            similarity_threshold=request.similarity_threshold,
            limit=limit
        )
        
        results = []
        for row in similar_vectors:
            results.append(SearchResult(
                id=str(row["id"]),
                type="adr",
                title=row["title"],
                content=row["problem_statement"] or "",
                similarity=row["similarity"],
                metadata={
                    "project_id": str(row["project_id"]),
                    "status": row["status"],
                    "number": row["number"]
                },
                created_at=row["created_at"].isoformat() if row["created_at"] else ""
            ))
        
        return results
        
    except Exception as error:
        logger.error(f"Semantic ADR search failed: {error}")
        return []


async def _keyword_search_adrs(
    db: AsyncSession,
    request: SemanticSearchRequest,
    limit: int
) -> List[SearchResult]:
    """Keyword search using full-text search"""
    
    try:
        search_term = request.query.strip().lower()
        
        query = select(ADR).where(
            or_(
                ADR.title.ilike(f"%{search_term}%"),
                ADR.problem_statement.ilike(f"%{search_term}%"),
                ADR.decision.ilike(f"%{search_term}%"),
                ADR.embedding_text.ilike(f"%{search_term}%")
            )
        )
        
        # Add project filter if specified
        if request.project_id:
            query = query.where(ADR.project_id == request.project_id)
        
        query = query.limit(limit)
        result = await db.execute(query)
        adrs = result.scalars().all()
        
        results = []
        for adr in adrs:
            # Simple relevance scoring based on term frequency
            relevance = _calculate_keyword_relevance(request.query, adr.title, adr.problem_statement)
            
            results.append(SearchResult(
                id=str(adr.id),
                type="adr",
                title=adr.title,
                content=adr.problem_statement or "",
                similarity=relevance,
                metadata={
                    "project_id": str(adr.project_id),
                    "status": adr.status,
                    "number": adr.number
                },
                created_at=adr.created_at.isoformat() if adr.created_at else ""
            ))
        
        # Sort by relevance
        results.sort(key=lambda x: x.similarity, reverse=True)
        return results
        
    except Exception as error:
        logger.error(f"Keyword ADR search failed: {error}")
        return []


async def _search_patterns(
    db: AsyncSession,
    request: SemanticSearchRequest,
    query_embedding: Optional[List[float]],
    limit: int
) -> List[SearchResult]:
    """Search patterns using semantic or keyword search"""
    
    if request.search_mode == "semantic" and query_embedding:
        return await _semantic_search_patterns(db, query_embedding, request, limit)
    elif request.search_mode == "keyword":
        return await _keyword_search_patterns(db, request, limit)
    elif request.search_mode == "hybrid" and query_embedding:
        semantic_results = await _semantic_search_patterns(db, query_embedding, request, limit // 2)
        keyword_results = await _keyword_search_patterns(db, request, limit // 2)
        return _combine_and_rank_results(semantic_results, keyword_results, limit)
    else:
        return await _keyword_search_patterns(db, request, limit)


async def _semantic_search_patterns(
    db: AsyncSession,
    query_embedding: List[float],
    request: SemanticSearchRequest,
    limit: int
) -> List[SearchResult]:
    """Semantic search for patterns"""
    
    try:
        similar_vectors = await embeddings_service.search_similar_vectors(
            db=db,
            query_embedding=query_embedding,
            table_name="patterns",
            embedding_column="embedding",
            similarity_threshold=request.similarity_threshold,
            limit=limit
        )
        
        results = []
        for row in similar_vectors:
            results.append(SearchResult(
                id=str(row["id"]),
                type="pattern",
                title=row["name"],
                content=row["description"] or "",
                similarity=row["similarity"],
                metadata={
                    "category": row["category"],
                    "effectiveness_score": row["effectiveness_score"],
                    "usage_count": row["usage_count"]
                },
                created_at=row["created_at"].isoformat() if row["created_at"] else ""
            ))
        
        return results
        
    except Exception as error:
        logger.error(f"Semantic pattern search failed: {error}")
        return []


async def _keyword_search_patterns(
    db: AsyncSession,
    request: SemanticSearchRequest,
    limit: int
) -> List[SearchResult]:
    """Keyword search for patterns"""
    
    try:
        search_term = request.query.strip().lower()
        
        query = select(Pattern).where(
            and_(
                or_(
                    Pattern.name.ilike(f"%{search_term}%"),
                    Pattern.description.ilike(f"%{search_term}%"),
                    Pattern.when_to_use.ilike(f"%{search_term}%"),
                    Pattern.embedding_text.ilike(f"%{search_term}%")
                ),
                Pattern.status == "active"
            )
        ).limit(limit)
        
        result = await db.execute(query)
        patterns = result.scalars().all()
        
        results = []
        for pattern in patterns:
            relevance = _calculate_keyword_relevance(request.query, pattern.name, pattern.description)
            
            results.append(SearchResult(
                id=str(pattern.id),
                type="pattern",
                title=pattern.name,
                content=pattern.description or "",
                similarity=relevance,
                metadata={
                    "category": pattern.category,
                    "effectiveness_score": pattern.effectiveness_score,
                    "usage_count": pattern.usage_count
                },
                created_at=pattern.created_at.isoformat() if pattern.created_at else ""
            ))
        
        results.sort(key=lambda x: x.similarity, reverse=True)
        return results
        
    except Exception as error:
        logger.error(f"Keyword pattern search failed: {error}")
        return []


def _combine_and_rank_results(
    semantic_results: List[SearchResult],
    keyword_results: List[SearchResult],
    limit: int
) -> List[SearchResult]:
    """Combine semantic and keyword results with intelligent ranking"""
    
    # Create a map to avoid duplicates
    results_map = {}
    
    # Add semantic results with boosted scores
    for result in semantic_results:
        result.similarity *= 1.2  # Boost semantic results
        results_map[result.id] = result
    
    # Add keyword results, avoiding duplicates
    for result in keyword_results:
        if result.id not in results_map:
            results_map[result.id] = result
        else:
            # Combine scores for duplicates
            existing = results_map[result.id]
            existing.similarity = max(existing.similarity, result.similarity * 0.8)
    
    # Sort by combined similarity score
    combined_results = list(results_map.values())
    combined_results.sort(key=lambda x: x.similarity, reverse=True)
    
    return combined_results[:limit]


def _calculate_keyword_relevance(query: str, title: str, content: str) -> float:
    """Calculate simple keyword relevance score"""
    
    if not title and not content:
        return 0.0
    
    query_words = set(query.lower().split())
    if not query_words:
        return 0.0
    
    # Combine title and content
    text = f"{title or ''} {content or ''}".lower()
    text_words = set(text.split())
    
    if not text_words:
        return 0.0
    
    # Calculate word overlap
    matches = len(query_words.intersection(text_words))
    relevance = matches / len(query_words)
    
    # Boost if query appears as phrase in title
    if title and query.lower() in title.lower():
        relevance *= 1.5
    
    return min(relevance, 1.0)


async def _generate_search_suggestions(db: AsyncSession, query: str) -> List[str]:
    """Generate search suggestions based on existing content"""
    
    try:
        suggestions = []
        
        # Get popular ADR titles
        adr_query = select(ADR.title).limit(5)
        result = await db.execute(adr_query)
        adr_titles = [row[0] for row in result.fetchall()]
        suggestions.extend([title.lower() for title in adr_titles[:3]])
        
        # Get popular pattern names
        pattern_query = select(Pattern.name).where(Pattern.status == "active").limit(5)
        result = await db.execute(pattern_query)
        pattern_names = [row[0] for row in result.fetchall()]
        suggestions.extend([name.lower() for name in pattern_names[:2]])
        
        return suggestions[:5]
        
    except Exception as error:
        logger.error(f"Failed to generate suggestions: {error}")
        return []


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=2, description="Partial query for suggestions"),
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, str]]:
    """Get search suggestions based on partial query"""
    
    try:
        search_term = q.strip().lower()
        suggestions = []
        
        # Get matching ADR titles
        adr_query = select(ADR.title, ADR.id).where(
            ADR.title.ilike(f"%{search_term}%")
        ).limit(limit // 2)
        
        result = await db.execute(adr_query)
        for title, adr_id in result.fetchall():
            suggestions.append({
                "text": title,
                "type": "adr",
                "id": str(adr_id)
            })
        
        # Get matching pattern names
        pattern_query = select(Pattern.name, Pattern.id).where(
            and_(
                Pattern.name.ilike(f"%{search_term}%"),
                Pattern.status == "active"
            )
        ).limit(limit // 2)
        
        result = await db.execute(pattern_query)
        for name, pattern_id in result.fetchall():
            suggestions.append({
                "text": name,
                "type": "pattern",
                "id": str(pattern_id)
            })
        
        return suggestions[:limit]
        
    except Exception as error:
        logger.error(f"Failed to get suggestions: {error}")
        return []