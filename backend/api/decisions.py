"""
Decision Management API endpoints
Integrates with Chronicle-Keeper decision tracking and analytics system.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Path
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import asyncpg
import json
import logging
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

decision_router = APIRouter()

# Pydantic models
class DecisionLink(BaseModel):
    from_adr: str
    to_adr: str
    relationship_type: str = Field(..., pattern="^(extends|supersedes|conflicts|depends|influences)$")
    strength: float = Field(..., ge=0, le=1)
    description: Optional[str] = None

class EvidenceCreate(BaseModel):
    adr_id: str
    evidence_type: str = Field(..., pattern="^(metric|feedback|outcome|observation)$")
    description: str = Field(..., min_length=10)
    value_before: Optional[float] = None
    value_after: Optional[float] = None
    metric_unit: Optional[str] = None
    collection_date: Optional[datetime] = None
    confidence_level: float = Field(0.8, ge=0, le=1)

class DecisionAnalytics(BaseModel):
    total_adrs: int
    status_distribution: Dict[str, int]
    average_confidence: float
    average_complexity: float
    average_actionability: float
    recent_activity: int
    top_components: List[Dict[str, Any]]
    trend_analysis: Dict[str, Any]

# Dependency injection for database
async def get_db():
    """Get database connection - will be injected from main.py"""
    pass

@decision_router.get("/analytics", response_model=DecisionAnalytics)
async def get_decision_analytics(
    days: int = Query(30, ge=1, le=365, description="Analysis period in days"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📊 Get comprehensive decision analytics
    
    Returns advanced analytics about decision patterns, trends, and effectiveness.
    """
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        # Total ADRs
        total_adrs = await db.fetchval("SELECT COUNT(*) FROM adrs")
        
        # Status distribution
        status_query = """
            SELECT status, COUNT(*) as count 
            FROM adrs 
            GROUP BY status
            ORDER BY count DESC
        """
        status_rows = await db.fetch(status_query)
        status_distribution = {row["status"]: row["count"] for row in status_rows}
        
        # Average scores
        avg_query = """
            SELECT 
                AVG(confidence_score) as avg_confidence,
                AVG(complexity_score) as avg_complexity,
                AVG(actionability_score) as avg_actionability
            FROM adrs 
            WHERE confidence_score IS NOT NULL
        """
        avg_row = await db.fetchrow(avg_query)
        
        # Recent activity
        recent_activity = await db.fetchval(
            "SELECT COUNT(*) FROM adrs WHERE created_at >= $1",
            since_date
        )
        
        # Top components
        components_query = """
            SELECT component, COUNT(*) as count, AVG(confidence_score) as avg_confidence
            FROM adrs 
            GROUP BY component 
            ORDER BY count DESC 
            LIMIT 10
        """
        components_rows = await db.fetch(components_query)
        top_components = [
            {
                "component": row["component"],
                "count": row["count"],
                "avg_confidence": round(float(row["avg_confidence"] or 0), 2)
            }
            for row in components_rows
        ]
        
        # Trend analysis - ADRs created per week
        trend_query = """
            SELECT 
                DATE_TRUNC('week', created_at) as week,
                COUNT(*) as count
            FROM adrs 
            WHERE created_at >= $1
            GROUP BY week 
            ORDER BY week
        """
        trend_rows = await db.fetch(trend_query, since_date)
        trend_analysis = {
            "weekly_creation": [
                {
                    "week": row["week"].isoformat(),
                    "count": row["count"]
                }
                for row in trend_rows
            ],
            "growth_rate": len(trend_rows)  # Simplified - could calculate actual growth rate
        }
        
        analytics = {
            "total_adrs": total_adrs,
            "status_distribution": status_distribution,
            "average_confidence": round(float(avg_row["avg_confidence"] or 0), 2),
            "average_complexity": round(float(avg_row["avg_complexity"] or 0), 2), 
            "average_actionability": round(float(avg_row["avg_actionability"] or 0), 2),
            "recent_activity": recent_activity,
            "top_components": top_components,
            "trend_analysis": trend_analysis
        }
        
        logger.info(f"📊 Generated analytics for {days} days")
        return analytics
        
    except Exception as e:
        logger.error(f"❌ Error generating analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics")

@decision_router.get("/links")
async def list_decision_links(
    adr_id: Optional[str] = Query(None, description="Filter by specific ADR"),
    relationship_type: Optional[str] = Query(None, regex="^(extends|supersedes|conflicts|depends|influences)$"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🔗 List decision links and relationships
    
    Shows how ADRs are connected and influence each other.
    """
    try:
        query = """
            SELECT dl.*, 
                   a1.title as from_title, a1.component as from_component,
                   a2.title as to_title, a2.component as to_component
            FROM decision_links dl
            JOIN adrs a1 ON dl.from_adr = a1.adr_id
            JOIN adrs a2 ON dl.to_adr = a2.adr_id
            WHERE ($1::text IS NULL OR dl.from_adr = $1 OR dl.to_adr = $1)
            AND ($2::text IS NULL OR dl.relationship_type = $2)
            ORDER BY dl.created_at DESC
        """
        
        rows = await db.fetch(query, adr_id, relationship_type)
        
        links = []
        for row in rows:
            links.append({
                "id": row["id"],
                "from_adr": row["from_adr"],
                "to_adr": row["to_adr"],
                "relationship_type": row["relationship_type"],
                "strength": float(row["strength"]),
                "description": row["description"],
                "created_at": row["created_at"],
                "from_details": {
                    "title": row["from_title"],
                    "component": row["from_component"]
                },
                "to_details": {
                    "title": row["to_title"],
                    "component": row["to_component"]
                }
            })
        
        logger.info(f"🔗 Retrieved {len(links)} decision links")
        return {
            "links": links,
            "total": len(links),
            "filters": {
                "adr_id": adr_id,
                "relationship_type": relationship_type
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error retrieving decision links: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve decision links")

@decision_router.post("/links")
async def create_decision_link(
    link: DecisionLink,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🔗 Create new decision link
    
    Establishes a relationship between two ADRs.
    """
    try:
        # Verify both ADRs exist
        from_exists = await db.fetchval("SELECT 1 FROM adrs WHERE adr_id = $1", link.from_adr)
        to_exists = await db.fetchval("SELECT 1 FROM adrs WHERE adr_id = $1", link.to_adr)
        
        if not from_exists:
            raise HTTPException(status_code=404, detail=f"ADR {link.from_adr} not found")
        if not to_exists:
            raise HTTPException(status_code=404, detail=f"ADR {link.to_adr} not found")
        
        # Check for existing link
        existing = await db.fetchval(
            "SELECT 1 FROM decision_links WHERE from_adr = $1 AND to_adr = $2",
            link.from_adr, link.to_adr
        )
        
        if existing:
            raise HTTPException(status_code=409, detail="Link already exists")
        
        insert_query = """
            INSERT INTO decision_links (from_adr, to_adr, relationship_type, strength, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        """
        
        row = await db.fetchrow(
            insert_query,
            link.from_adr, link.to_adr, link.relationship_type, 
            link.strength, link.description
        )
        
        new_link = {
            "id": row["id"],
            "from_adr": row["from_adr"],
            "to_adr": row["to_adr"],
            "relationship_type": row["relationship_type"],
            "strength": float(row["strength"]),
            "description": row["description"],
            "created_at": row["created_at"]
        }
        
        logger.info(f"🔗 Created decision link: {link.from_adr} -> {link.to_adr}")
        return new_link
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating decision link: {e}")
        raise HTTPException(status_code=500, detail="Failed to create decision link")

@decision_router.get("/evidence/{adr_id}")
async def get_decision_evidence(
    adr_id: str = Path(..., description="ADR identifier"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📈 Get evidence for a specific decision
    
    Returns all collected evidence and metrics for an ADR.
    """
    try:
        # Verify ADR exists
        adr_exists = await db.fetchval("SELECT 1 FROM adrs WHERE adr_id = $1", adr_id)
        if not adr_exists:
            raise HTTPException(status_code=404, detail=f"ADR {adr_id} not found")
        
        query = """
            SELECT * FROM decision_evidence 
            WHERE adr_id = $1 
            ORDER BY collection_date DESC
        """
        
        rows = await db.fetch(query, adr_id)
        
        evidence = []
        for row in rows:
            evidence.append({
                "id": row["id"],
                "evidence_type": row["evidence_type"],
                "description": row["description"],
                "value_before": float(row["value_before"]) if row["value_before"] else None,
                "value_after": float(row["value_after"]) if row["value_after"] else None,
                "metric_unit": row["metric_unit"],
                "collection_date": row["collection_date"],
                "confidence_level": float(row["confidence_level"]),
                "created_at": row["created_at"],
                "impact": None  # Calculate impact if both values exist
            })
            
            # Calculate impact if possible
            if evidence[-1]["value_before"] and evidence[-1]["value_after"]:
                before = evidence[-1]["value_before"]
                after = evidence[-1]["value_after"]
                evidence[-1]["impact"] = {
                    "absolute_change": after - before,
                    "percent_change": ((after - before) / before) * 100 if before != 0 else 0,
                    "improvement": after > before
                }
        
        logger.info(f"📈 Retrieved {len(evidence)} evidence entries for {adr_id}")
        return {
            "adr_id": adr_id,
            "evidence": evidence,
            "total": len(evidence),
            "summary": {
                "total_evidence": len(evidence),
                "evidence_types": list(set(e["evidence_type"] for e in evidence)),
                "avg_confidence": sum(e["confidence_level"] for e in evidence) / len(evidence) if evidence else 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving evidence for {adr_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve evidence")

@decision_router.post("/evidence")
async def create_evidence(
    evidence: EvidenceCreate,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📊 Add evidence for a decision
    
    Records evidence of a decision's impact and effectiveness.
    """
    try:
        # Verify ADR exists
        adr_exists = await db.fetchval("SELECT 1 FROM adrs WHERE adr_id = $1", evidence.adr_id)
        if not adr_exists:
            raise HTTPException(status_code=404, detail=f"ADR {evidence.adr_id} not found")
        
        collection_date = evidence.collection_date or datetime.now()
        
        insert_query = """
            INSERT INTO decision_evidence (
                adr_id, evidence_type, description, value_before, value_after,
                metric_unit, collection_date, confidence_level
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        """
        
        row = await db.fetchrow(
            insert_query,
            evidence.adr_id, evidence.evidence_type, evidence.description,
            evidence.value_before, evidence.value_after, evidence.metric_unit,
            collection_date, evidence.confidence_level
        )
        
        new_evidence = {
            "id": row["id"],
            "adr_id": row["adr_id"],
            "evidence_type": row["evidence_type"],
            "description": row["description"],
            "value_before": float(row["value_before"]) if row["value_before"] else None,
            "value_after": float(row["value_after"]) if row["value_after"] else None,
            "metric_unit": row["metric_unit"],
            "collection_date": row["collection_date"],
            "confidence_level": float(row["confidence_level"]),
            "created_at": row["created_at"]
        }
        
        logger.info(f"📊 Created evidence for {evidence.adr_id}: {evidence.evidence_type}")
        return new_evidence
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating evidence: {e}")
        raise HTTPException(status_code=500, detail="Failed to create evidence")

@decision_router.get("/effectiveness/{adr_id}")
async def analyze_decision_effectiveness(
    adr_id: str = Path(..., description="ADR identifier"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🎯 Analyze decision effectiveness
    
    Provides comprehensive effectiveness analysis based on evidence and metrics.
    """
    try:
        # Get ADR info
        adr = await db.fetchrow("SELECT * FROM adrs WHERE adr_id = $1", adr_id)
        if not adr:
            raise HTTPException(status_code=404, detail=f"ADR {adr_id} not found")
        
        # Get evidence
        evidence_query = """
            SELECT * FROM decision_evidence 
            WHERE adr_id = $1 
            ORDER BY collection_date ASC
        """
        evidence_rows = await db.fetch(evidence_query, adr_id)
        
        # Calculate effectiveness metrics
        evidence_count = len(evidence_rows)
        avg_confidence = sum(float(row["confidence_level"]) for row in evidence_rows) / evidence_count if evidence_count > 0 else 0
        
        # Calculate impact metrics
        positive_impacts = 0
        negative_impacts = 0
        total_impacts = 0
        
        for row in evidence_rows:
            if row["value_before"] and row["value_after"]:
                total_impacts += 1
                if row["value_after"] > row["value_before"]:
                    positive_impacts += 1
                else:
                    negative_impacts += 1
        
        success_rate = (positive_impacts / total_impacts) * 100 if total_impacts > 0 else 0
        
        # Get decision links (influence factor)
        links_count = await db.fetchval(
            "SELECT COUNT(*) FROM decision_links WHERE from_adr = $1 OR to_adr = $1",
            adr_id
        )
        
        # Calculate overall effectiveness score
        base_score = float(adr["confidence_score"] or 0.5) * 0.3
        evidence_score = min(evidence_count / 5.0, 1.0) * 0.2  # Up to 5 evidence entries for full score
        confidence_score = avg_confidence * 0.2
        success_score = (success_rate / 100) * 0.2
        influence_score = min(links_count / 3.0, 1.0) * 0.1  # Up to 3 links for full influence score
        
        effectiveness_score = base_score + evidence_score + confidence_score + success_score + influence_score
        
        analysis = {
            "adr_id": adr_id,
            "title": adr["title"],
            "status": adr["status"],
            "effectiveness_score": round(effectiveness_score, 2),
            "metrics": {
                "evidence_count": evidence_count,
                "average_confidence": round(avg_confidence, 2),
                "positive_impacts": positive_impacts,
                "negative_impacts": negative_impacts,
                "success_rate": round(success_rate, 1),
                "influence_factor": links_count
            },
            "scores": {
                "base_confidence": round(base_score, 2),
                "evidence_completeness": round(evidence_score, 2),
                "confidence_level": round(confidence_score, 2),
                "success_rate_score": round(success_score, 2),
                "influence_score": round(influence_score, 2)
            },
            "recommendation": "High effectiveness" if effectiveness_score > 0.7 else 
                           "Moderate effectiveness" if effectiveness_score > 0.4 else 
                           "Low effectiveness - consider review"
        }
        
        logger.info(f"🎯 Analyzed effectiveness for {adr_id}: {effectiveness_score:.2f}")
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error analyzing effectiveness for {adr_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze effectiveness")