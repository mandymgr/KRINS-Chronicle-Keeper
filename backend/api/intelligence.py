"""
AI Intelligence API endpoints
Integrates with Chronicle-Keeper AI context generation and semantic analysis.
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

intelligence_router = APIRouter()

# Pydantic models
class ContextRequest(BaseModel):
    ai_system: str = Field(..., min_length=1, max_length=100)
    context_type: str = Field(..., pattern="^(code-generation|architecture-review|troubleshooting|optimization)$")
    query: str = Field(..., min_length=10, max_length=1000)
    include_patterns: bool = Field(True, description="Include code patterns in context")
    include_decisions: bool = Field(True, description="Include relevant ADRs")
    include_runbooks: bool = Field(False, description="Include operational runbooks")
    relevance_threshold: float = Field(0.7, ge=0, le=1)

class ContextResponse(BaseModel):
    context_id: str
    ai_system: str
    context_type: str
    query: str
    generated_context: str
    relevance_score: float
    sources: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    created_at: datetime

class IntelligenceInsight(BaseModel):
    insight_type: str = Field(..., pattern="^(pattern|anomaly|trend|recommendation)$")
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    confidence: float = Field(..., ge=0, le=1)
    impact_level: str = Field(..., pattern="^(low|medium|high|critical)$")
    data_sources: List[str]
    suggested_actions: Optional[List[str]] = []

# Dependency injection for database
async def get_db():
    """Get database connection - will be injected from main.py"""
    pass

@intelligence_router.post("/context", response_model=ContextResponse)
async def generate_ai_context(
    request: ContextRequest,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🧠 Generate AI context from organizational intelligence
    
    Creates rich context for AI systems by combining ADRs, patterns, and organizational knowledge.
    """
    try:
        # Generate unique context ID
        context_id = f"ctx-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{request.ai_system}"
        
        sources = []
        context_parts = []
        
        # Include relevant ADRs if requested
        if request.include_decisions:
            adr_query = """
                SELECT adr_id, title, context, decision, consequences, component, confidence_score
                FROM adrs 
                WHERE status = 'accepted'
                AND (
                    to_tsvector('english', title || ' ' || context || ' ' || decision) 
                    @@ plainto_tsquery('english', $1)
                )
                ORDER BY confidence_score DESC NULLS LAST
                LIMIT 5
            """
            
            adr_rows = await db.fetch(adr_query, request.query)
            
            if adr_rows:
                context_parts.append("## Relevant Architecture Decisions:\n")
                for adr in adr_rows:
                    context_parts.append(f"### {adr['title']} ({adr['adr_id']})")
                    context_parts.append(f"**Component:** {adr['component']}")
                    context_parts.append(f"**Context:** {adr['context'][:300]}...")
                    context_parts.append(f"**Decision:** {adr['decision'][:300]}...")
                    context_parts.append(f"**Confidence:** {adr['confidence_score'] or 'N/A'}\n")
                    
                    sources.append({
                        "type": "adr",
                        "id": adr['adr_id'],
                        "title": adr['title'],
                        "relevance": float(adr['confidence_score'] or 0.5)
                    })
        
        # Include patterns if requested
        if request.include_patterns:
            # This would integrate with pattern library
            # For now, add placeholder context
            context_parts.append("## Organizational Code Patterns:\n")
            context_parts.append("- Follow TypeScript strict mode for all new code")
            context_parts.append("- Use Bun runtime for server applications") 
            context_parts.append("- Implement comprehensive error handling with logging")
            context_parts.append("- Document all public APIs with OpenAPI/JSDoc\n")
            
            sources.append({
                "type": "patterns",
                "id": "general-patterns",
                "title": "Organizational Code Patterns",
                "relevance": 0.8
            })
        
        # Include runbooks if requested
        if request.include_runbooks:
            context_parts.append("## Operational Guidelines:\n")
            context_parts.append("- All changes require TypeScript compilation without errors")
            context_parts.append("- Run comprehensive tests before deployment")
            context_parts.append("- Follow existing logging and monitoring patterns")
            context_parts.append("- Document architectural decisions in ADR format\n")
            
            sources.append({
                "type": "runbooks",
                "id": "operational-runbooks",
                "title": "Operational Guidelines", 
                "relevance": 0.7
            })
        
        # Add context-specific guidance
        if request.context_type == "code-generation":
            context_parts.append("## Code Generation Guidelines:\n")
            context_parts.append("- Maintain consistency with existing codebase style")
            context_parts.append("- Use established patterns and interfaces")
            context_parts.append("- Include comprehensive error handling")
            context_parts.append("- Add appropriate logging for debugging\n")
        elif request.context_type == "architecture-review":
            context_parts.append("## Architecture Review Focus:\n")
            context_parts.append("- Evaluate decision against existing ADRs")
            context_parts.append("- Consider long-term maintenance implications")
            context_parts.append("- Assess integration complexity and risks")
            context_parts.append("- Document new patterns for reuse\n")
        
        # Combine all context
        generated_context = "\n".join(context_parts)
        
        # Calculate relevance score based on sources and content match
        relevance_score = min(len(sources) / 5.0, 1.0) * 0.6 + 0.4  # Base relevance + source bonus
        
        # Store context generation in database
        insert_query = """
            INSERT INTO ai_context_logs (
                context_id, ai_system, context_type, query, generated_context, 
                relevance_score, sources_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING created_at
        """
        
        created_at = await db.fetchval(
            insert_query,
            context_id, request.ai_system, request.context_type, request.query,
            generated_context, relevance_score, len(sources)
        )
        
        response = {
            "context_id": context_id,
            "ai_system": request.ai_system,
            "context_type": request.context_type,
            "query": request.query,
            "generated_context": generated_context,
            "relevance_score": round(relevance_score, 2),
            "sources": sources,
            "metadata": {
                "total_sources": len(sources),
                "context_length": len(generated_context),
                "generation_timestamp": datetime.now().isoformat(),
                "filters": {
                    "include_patterns": request.include_patterns,
                    "include_decisions": request.include_decisions,
                    "include_runbooks": request.include_runbooks
                }
            },
            "created_at": created_at
        }
        
        logger.info(f"🧠 Generated AI context {context_id} for {request.ai_system}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error generating AI context: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI context")

@intelligence_router.get("/context/{context_id}")
async def get_context(
    context_id: str = Path(..., description="Context identifier"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📄 Retrieve previously generated context
    
    Gets a specific AI context generation result by ID.
    """
    try:
        query = "SELECT * FROM ai_context_logs WHERE context_id = $1"
        row = await db.fetchrow(query, context_id)
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Context {context_id} not found")
        
        context = {
            "context_id": row["context_id"],
            "ai_system": row["ai_system"],
            "context_type": row["context_type"],
            "query": row["query"],
            "generated_context": row["generated_context"],
            "relevance_score": float(row["relevance_score"]),
            "sources_count": row["sources_count"],
            "created_at": row["created_at"]
        }
        
        logger.info(f"📄 Retrieved context: {context_id}")
        return context
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving context {context_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve context")

@intelligence_router.get("/insights")
async def get_intelligence_insights(
    insight_type: Optional[str] = Query(None, regex="^(pattern|anomaly|trend|recommendation)$"),
    impact_level: Optional[str] = Query(None, regex="^(low|medium|high|critical)$"),
    limit: int = Query(20, ge=1, le=100),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🔍 Get organizational intelligence insights
    
    Returns AI-generated insights about patterns, anomalies, and trends in decision-making.
    """
    try:
        # Generate insights based on current data
        insights = []
        
        # Pattern insight: Most active components
        active_components = await db.fetch("""
            SELECT component, COUNT(*) as count, AVG(confidence_score) as avg_confidence
            FROM adrs 
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY component
            HAVING COUNT(*) >= 2
            ORDER BY count DESC
            LIMIT 5
        """)
        
        if active_components:
            top_component = active_components[0]
            insights.append({
                "insight_type": "pattern",
                "title": f"High Activity in {top_component['component']} Component",
                "description": f"The {top_component['component']} component has {top_component['count']} decisions in the last 30 days with average confidence of {float(top_component['avg_confidence'] or 0):.2f}",
                "confidence": 0.85,
                "impact_level": "medium" if top_component['count'] > 3 else "low",
                "data_sources": ["adrs"],
                "suggested_actions": [
                    f"Review {top_component['component']} component architecture",
                    "Consider if decisions can be consolidated",
                    "Document emerging patterns in this component"
                ]
            })
        
        # Anomaly insight: Low confidence decisions
        low_confidence = await db.fetchval("""
            SELECT COUNT(*) FROM adrs 
            WHERE confidence_score < 0.5 
            AND created_at >= NOW() - INTERVAL '30 days'
        """)
        
        if low_confidence and low_confidence > 0:
            insights.append({
                "insight_type": "anomaly",
                "title": f"Low Confidence Decisions Detected",
                "description": f"Found {low_confidence} decisions with confidence below 50% in the last 30 days. This may indicate insufficient information or analysis.",
                "confidence": 0.9,
                "impact_level": "high" if low_confidence > 3 else "medium",
                "data_sources": ["adrs"],
                "suggested_actions": [
                    "Review low-confidence decisions for missing information",
                    "Establish minimum confidence thresholds",
                    "Improve decision documentation process"
                ]
            })
        
        # Trend insight: Decision velocity
        recent_count = await db.fetchval("""
            SELECT COUNT(*) FROM adrs 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        """)
        
        previous_count = await db.fetchval("""
            SELECT COUNT(*) FROM adrs 
            WHERE created_at >= NOW() - INTERVAL '14 days'
            AND created_at < NOW() - INTERVAL '7 days'
        """)
        
        if recent_count is not None and previous_count is not None:
            if recent_count > previous_count * 1.5:
                insights.append({
                    "insight_type": "trend",
                    "title": "Accelerating Decision Pace",
                    "description": f"Decision velocity has increased significantly: {recent_count} decisions this week vs {previous_count} last week (+{((recent_count - previous_count) / max(previous_count, 1)) * 100:.0f}%)",
                    "confidence": 0.8,
                    "impact_level": "medium",
                    "data_sources": ["adrs"],
                    "suggested_actions": [
                        "Monitor decision quality during rapid pace",
                        "Ensure adequate review time for decisions",
                        "Consider if pace is sustainable"
                    ]
                })
        
        # Recommendation insight: Missing evidence
        decisions_without_evidence = await db.fetchval("""
            SELECT COUNT(*) FROM adrs a
            LEFT JOIN decision_evidence de ON a.adr_id = de.adr_id
            WHERE a.status = 'accepted' 
            AND a.created_at <= NOW() - INTERVAL '30 days'
            AND de.id IS NULL
        """)
        
        if decisions_without_evidence and decisions_without_evidence > 0:
            insights.append({
                "insight_type": "recommendation", 
                "title": "Evidence Collection Opportunity",
                "description": f"{decisions_without_evidence} accepted decisions lack follow-up evidence. Collecting impact data could improve future decision-making.",
                "confidence": 0.75,
                "impact_level": "medium",
                "data_sources": ["adrs", "decision_evidence"],
                "suggested_actions": [
                    "Implement evidence collection process",
                    "Set reminders for post-decision impact measurement",
                    "Create templates for common evidence types"
                ]
            })
        
        # Filter insights based on query parameters
        if insight_type:
            insights = [i for i in insights if i["insight_type"] == insight_type]
        if impact_level:
            insights = [i for i in insights if i["impact_level"] == impact_level]
        
        # Limit results
        insights = insights[:limit]
        
        logger.info(f"🔍 Generated {len(insights)} intelligence insights")
        return {
            "insights": insights,
            "total": len(insights),
            "generated_at": datetime.now().isoformat(),
            "filters": {
                "insight_type": insight_type,
                "impact_level": impact_level,
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")

@intelligence_router.post("/analyze")
async def analyze_organizational_intelligence(
    analysis_type: str = Query(..., regex="^(health|trends|effectiveness|gaps)$"),
    period_days: int = Query(30, ge=7, le=365),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📊 Comprehensive organizational intelligence analysis
    
    Performs deep analysis of organizational decision patterns and health.
    """
    try:
        since_date = datetime.now() - timedelta(days=period_days)
        analysis_id = f"analysis-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{analysis_type}"
        
        if analysis_type == "health":
            # Organizational health analysis
            total_adrs = await db.fetchval("SELECT COUNT(*) FROM adrs")
            recent_adrs = await db.fetchval(
                "SELECT COUNT(*) FROM adrs WHERE created_at >= $1", since_date
            )
            
            avg_confidence = await db.fetchval("""
                SELECT AVG(confidence_score) FROM adrs 
                WHERE confidence_score IS NOT NULL AND created_at >= $1
            """, since_date)
            
            evidence_coverage = await db.fetchval("""
                SELECT COUNT(DISTINCT a.adr_id) * 100.0 / COUNT(*)
                FROM adrs a
                LEFT JOIN decision_evidence de ON a.adr_id = de.adr_id
                WHERE a.status = 'accepted' AND a.created_at >= $1
            """, since_date)
            
            health_score = (
                min(recent_adrs / 10, 1.0) * 0.3 +  # Activity level
                float(avg_confidence or 0.5) * 0.4 +  # Decision quality
                (float(evidence_coverage or 0) / 100) * 0.3  # Evidence collection
            )
            
            analysis = {
                "analysis_id": analysis_id,
                "analysis_type": "health",
                "period_days": period_days,
                "health_score": round(health_score, 2),
                "metrics": {
                    "total_decisions": total_adrs,
                    "recent_decisions": recent_adrs,
                    "average_confidence": round(float(avg_confidence or 0), 2),
                    "evidence_coverage_percent": round(float(evidence_coverage or 0), 1),
                    "decision_velocity": round(recent_adrs / (period_days / 7), 1)  # per week
                },
                "recommendations": [
                    "Maintain decision documentation quality" if health_score > 0.7 else
                    "Improve decision confidence through better analysis" if avg_confidence and avg_confidence < 0.6 else
                    "Implement systematic evidence collection"
                ]
            }
            
        elif analysis_type == "trends":
            # Trend analysis
            weekly_trends = await db.fetch("""
                SELECT 
                    DATE_TRUNC('week', created_at) as week,
                    COUNT(*) as decision_count,
                    AVG(confidence_score) as avg_confidence
                FROM adrs 
                WHERE created_at >= $1
                GROUP BY week 
                ORDER BY week
            """, since_date)
            
            component_trends = await db.fetch("""
                SELECT 
                    component,
                    COUNT(*) as count,
                    AVG(confidence_score) as avg_confidence
                FROM adrs 
                WHERE created_at >= $1
                GROUP BY component
                ORDER BY count DESC
                LIMIT 10
            """, since_date)
            
            analysis = {
                "analysis_id": analysis_id,
                "analysis_type": "trends",
                "period_days": period_days,
                "weekly_trends": [
                    {
                        "week": row["week"].isoformat(),
                        "decision_count": row["decision_count"],
                        "avg_confidence": round(float(row["avg_confidence"] or 0), 2)
                    }
                    for row in weekly_trends
                ],
                "component_trends": [
                    {
                        "component": row["component"],
                        "count": row["count"],
                        "avg_confidence": round(float(row["avg_confidence"] or 0), 2)
                    }
                    for row in component_trends
                ],
                "insights": [
                    f"Most active component: {component_trends[0]['component']}" if component_trends else "No activity detected",
                    f"Decision velocity: {sum(t['decision_count'] for t in weekly_trends) / len(weekly_trends):.1f} per week" if weekly_trends else "Insufficient data"
                ]
            }
        
        # Store analysis results
        await db.execute("""
            INSERT INTO ai_context_logs (
                context_id, ai_system, context_type, query, generated_context, relevance_score, sources_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, analysis_id, "intelligence-api", analysis_type, f"Analysis for {period_days} days", 
            json.dumps(analysis), 1.0, 1)
        
        logger.info(f"📊 Completed {analysis_type} analysis: {analysis_id}")
        return analysis
        
    except Exception as e:
        logger.error(f"❌ Error performing intelligence analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform analysis")