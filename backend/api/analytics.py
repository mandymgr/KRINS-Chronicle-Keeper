"""
Analytics API endpoints
Advanced decision analytics and visualization data for dashboards.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import asyncpg
import json
import logging
from datetime import datetime, timedelta
from pydantic import BaseModel

logger = logging.getLogger(__name__)

analytics_router = APIRouter()

# Dependency injection for database
async def get_db():
    """Get database connection - will be injected from main.py"""
    pass

@analytics_router.get("/dashboard/overview")
async def get_dashboard_overview(
    days: int = Query(30, ge=1, le=365, description="Analysis period in days"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📊 Dashboard overview with key metrics
    
    Returns high-level metrics for the main organizational intelligence dashboard.
    """
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        # Key metrics
        metrics = {}
        
        # Total and recent ADRs
        metrics["total_adrs"] = await db.fetchval("SELECT COUNT(*) FROM adrs")
        metrics["recent_adrs"] = await db.fetchval(
            "SELECT COUNT(*) FROM adrs WHERE created_at >= $1", since_date
        )
        
        # Status distribution
        status_data = await db.fetch("""
            SELECT status, COUNT(*) as count 
            FROM adrs 
            WHERE created_at >= $1
            GROUP BY status
        """, since_date)
        metrics["status_distribution"] = {row["status"]: row["count"] for row in status_data}
        
        # Average scores
        avg_scores = await db.fetchrow("""
            SELECT 
                AVG(confidence_score) as confidence,
                AVG(complexity_score) as complexity,
                AVG(actionability_score) as actionability
            FROM adrs 
            WHERE created_at >= $1 AND confidence_score IS NOT NULL
        """, since_date)
        
        metrics["average_scores"] = {
            "confidence": round(float(avg_scores["confidence"] or 0), 2),
            "complexity": round(float(avg_scores["complexity"] or 0), 2),
            "actionability": round(float(avg_scores["actionability"] or 0), 2)
        }
        
        # Component activity
        component_activity = await db.fetch("""
            SELECT component, COUNT(*) as count 
            FROM adrs 
            WHERE created_at >= $1
            GROUP BY component 
            ORDER BY count DESC 
            LIMIT 8
        """, since_date)
        
        metrics["component_activity"] = [
            {"component": row["component"], "count": row["count"]}
            for row in component_activity
        ]
        
        # Decision velocity (decisions per week)
        weeks = max(days / 7, 1)
        metrics["decision_velocity"] = round(metrics["recent_adrs"] / weeks, 1)
        
        # Evidence coverage
        evidence_coverage = await db.fetchval("""
            SELECT COUNT(DISTINCT de.adr_id) * 100.0 / NULLIF(COUNT(DISTINCT a.adr_id), 0)
            FROM adrs a
            LEFT JOIN decision_evidence de ON a.adr_id = de.adr_id
            WHERE a.status = 'accepted' AND a.created_at >= $1
        """, since_date)
        
        metrics["evidence_coverage"] = round(float(evidence_coverage or 0), 1)
        
        # Health score calculation
        activity_score = min(metrics["decision_velocity"] / 5, 1.0) * 0.25  # Up to 5 per week is healthy
        confidence_score = metrics["average_scores"]["confidence"] * 0.35
        evidence_score = (metrics["evidence_coverage"] / 100) * 0.25
        diversity_score = min(len(component_activity) / 5, 1.0) * 0.15  # Good to have 5+ active components
        
        health_score = activity_score + confidence_score + evidence_score + diversity_score
        metrics["health_score"] = round(health_score, 2)
        
        logger.info(f"📊 Generated dashboard overview for {days} days")
        return {
            "period_days": days,
            "generated_at": datetime.now().isoformat(),
            "metrics": metrics,
            "health_status": {
                "score": metrics["health_score"],
                "level": "excellent" if health_score > 0.8 else 
                        "good" if health_score > 0.6 else 
                        "moderate" if health_score > 0.4 else "needs_attention",
                "components": {
                    "activity": round(activity_score, 2),
                    "confidence": round(confidence_score, 2),
                    "evidence": round(evidence_score, 2),
                    "diversity": round(diversity_score, 2)
                }
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating dashboard overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate dashboard overview")

@analytics_router.get("/charts/decision-trends")
async def get_decision_trends(
    days: int = Query(90, ge=7, le=365, description="Analysis period in days"),
    granularity: str = Query("week", regex="^(day|week|month)$", description="Time granularity"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📈 Decision trends over time
    
    Returns time-series data for decision creation trends.
    """
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        # Map granularity to PostgreSQL date_trunc
        trunc_mapping = {"day": "day", "week": "week", "month": "month"}
        trunc_unit = trunc_mapping[granularity]
        
        trends_query = f"""
            SELECT 
                DATE_TRUNC('{trunc_unit}', created_at) as period,
                COUNT(*) as decision_count,
                AVG(confidence_score) as avg_confidence,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
                COUNT(CASE WHEN status = 'proposed' THEN 1 END) as proposed_count
            FROM adrs 
            WHERE created_at >= $1
            GROUP BY period 
            ORDER BY period
        """
        
        rows = await db.fetch(trends_query, since_date)
        
        trend_data = []
        for row in rows:
            trend_data.append({
                "period": row["period"].isoformat(),
                "decision_count": row["decision_count"],
                "avg_confidence": round(float(row["avg_confidence"] or 0), 2),
                "accepted_count": row["accepted_count"],
                "proposed_count": row["proposed_count"],
                "acceptance_rate": round((row["accepted_count"] / max(row["decision_count"], 1)) * 100, 1)
            })
        
        # Calculate trend direction
        if len(trend_data) >= 2:
            recent_avg = sum(d["decision_count"] for d in trend_data[-3:]) / min(3, len(trend_data))
            earlier_avg = sum(d["decision_count"] for d in trend_data[:-3]) / max(len(trend_data) - 3, 1)
            
            trend_direction = "increasing" if recent_avg > earlier_avg * 1.1 else \
                             "decreasing" if recent_avg < earlier_avg * 0.9 else "stable"
        else:
            trend_direction = "insufficient_data"
        
        logger.info(f"📈 Generated decision trends for {days} days ({granularity})")
        return {
            "period_days": days,
            "granularity": granularity,
            "trend_direction": trend_direction,
            "data": trend_data,
            "summary": {
                "total_periods": len(trend_data),
                "total_decisions": sum(d["decision_count"] for d in trend_data),
                "avg_decisions_per_period": round(sum(d["decision_count"] for d in trend_data) / max(len(trend_data), 1), 1),
                "overall_acceptance_rate": round(
                    sum(d["accepted_count"] for d in trend_data) * 100 / 
                    max(sum(d["decision_count"] for d in trend_data), 1), 1
                )
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating decision trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate decision trends")

@analytics_router.get("/charts/component-distribution")
async def get_component_distribution(
    days: int = Query(30, ge=1, le=365),
    top_n: int = Query(15, ge=5, le=50, description="Number of top components to return"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    🥧 Component distribution analysis
    
    Returns distribution of decisions across components/systems.
    """
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        distribution_query = """
            SELECT 
                component,
                COUNT(*) as decision_count,
                AVG(confidence_score) as avg_confidence,
                AVG(complexity_score) as avg_complexity,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
                COUNT(DISTINCT CASE WHEN de.adr_id IS NOT NULL THEN a.adr_id END) as with_evidence
            FROM adrs a
            LEFT JOIN decision_evidence de ON a.adr_id = de.adr_id
            WHERE a.created_at >= $1
            GROUP BY component
            ORDER BY decision_count DESC
            LIMIT $2
        """
        
        rows = await db.fetch(distribution_query, since_date, top_n)
        
        total_decisions = await db.fetchval(
            "SELECT COUNT(*) FROM adrs WHERE created_at >= $1", since_date
        )
        
        distribution_data = []
        for row in rows:
            percentage = (row["decision_count"] / max(total_decisions, 1)) * 100
            
            distribution_data.append({
                "component": row["component"],
                "decision_count": row["decision_count"],
                "percentage": round(percentage, 1),
                "avg_confidence": round(float(row["avg_confidence"] or 0), 2),
                "avg_complexity": round(float(row["avg_complexity"] or 0), 2),
                "accepted_count": row["accepted_count"],
                "acceptance_rate": round((row["accepted_count"] / max(row["decision_count"], 1)) * 100, 1),
                "evidence_coverage": round((row["with_evidence"] / max(row["decision_count"], 1)) * 100, 1)
            })
        
        logger.info(f"🥧 Generated component distribution for {days} days (top {top_n})")
        return {
            "period_days": days,
            "total_decisions": total_decisions,
            "components_shown": len(distribution_data),
            "data": distribution_data,
            "insights": {
                "most_active_component": distribution_data[0]["component"] if distribution_data else None,
                "highest_confidence_component": max(distribution_data, key=lambda x: x["avg_confidence"])["component"] if distribution_data else None,
                "best_evidence_coverage": max(distribution_data, key=lambda x: x["evidence_coverage"])["component"] if distribution_data else None,
                "concentration_index": round(sum(d["percentage"]**2 for d in distribution_data) / 100, 2)  # Herfindahl index
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating component distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate component distribution")

@analytics_router.get("/charts/effectiveness-matrix")
async def get_effectiveness_matrix(
    days: int = Query(90, ge=30, le=365),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📊 Decision effectiveness matrix
    
    Returns scatter plot data showing confidence vs complexity vs effectiveness.
    """
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        matrix_query = """
            SELECT 
                a.adr_id,
                a.title,
                a.component,
                a.status,
                a.confidence_score,
                a.complexity_score,
                a.actionability_score,
                a.created_at,
                COUNT(de.id) as evidence_count,
                AVG(CASE 
                    WHEN de.value_before IS NOT NULL AND de.value_after IS NOT NULL 
                    THEN CASE WHEN de.value_after > de.value_before THEN 1.0 ELSE 0.0 END 
                END) as success_rate,
                COUNT(dl.id) as link_count
            FROM adrs a
            LEFT JOIN decision_evidence de ON a.adr_id = de.adr_id
            LEFT JOIN decision_links dl ON (a.adr_id = dl.from_adr OR a.adr_id = dl.to_adr)
            WHERE a.created_at >= $1 
            AND a.confidence_score IS NOT NULL
            AND a.complexity_score IS NOT NULL
            GROUP BY a.adr_id, a.title, a.component, a.status, a.confidence_score, 
                     a.complexity_score, a.actionability_score, a.created_at
            ORDER BY a.created_at DESC
        """
        
        rows = await db.fetch(matrix_query, since_date)
        
        matrix_data = []
        for row in rows:
            # Calculate effectiveness score
            base_score = float(row["confidence_score"] or 0.5) * 0.3
            evidence_score = min(row["evidence_count"] / 3.0, 1.0) * 0.2
            success_score = (float(row["success_rate"] or 0.5)) * 0.3
            influence_score = min(row["link_count"] / 2.0, 1.0) * 0.2
            
            effectiveness_score = base_score + evidence_score + success_score + influence_score
            
            # Determine quadrant
            conf_threshold = 0.7
            complexity_threshold = 0.7
            
            if row["confidence_score"] >= conf_threshold and row["complexity_score"] <= complexity_threshold:
                quadrant = "high_confidence_low_complexity"
            elif row["confidence_score"] >= conf_threshold and row["complexity_score"] > complexity_threshold:
                quadrant = "high_confidence_high_complexity"
            elif row["confidence_score"] < conf_threshold and row["complexity_score"] <= complexity_threshold:
                quadrant = "low_confidence_low_complexity"
            else:
                quadrant = "low_confidence_high_complexity"
            
            matrix_data.append({
                "adr_id": row["adr_id"],
                "title": row["title"][:50] + "..." if len(row["title"]) > 50 else row["title"],
                "component": row["component"],
                "status": row["status"],
                "confidence_score": float(row["confidence_score"]),
                "complexity_score": float(row["complexity_score"]),
                "actionability_score": float(row["actionability_score"] or 0),
                "effectiveness_score": round(effectiveness_score, 2),
                "evidence_count": row["evidence_count"],
                "success_rate": float(row["success_rate"] or 0),
                "link_count": row["link_count"],
                "quadrant": quadrant,
                "age_days": (datetime.now().date() - row["created_at"].date()).days
            })
        
        # Quadrant analysis
        quadrant_counts = {}
        for item in matrix_data:
            quadrant = item["quadrant"]
            quadrant_counts[quadrant] = quadrant_counts.get(quadrant, 0) + 1
        
        logger.info(f"📊 Generated effectiveness matrix for {days} days ({len(matrix_data)} decisions)")
        return {
            "period_days": days,
            "total_decisions": len(matrix_data),
            "data": matrix_data,
            "quadrants": {
                "high_confidence_low_complexity": quadrant_counts.get("high_confidence_low_complexity", 0),
                "high_confidence_high_complexity": quadrant_counts.get("high_confidence_high_complexity", 0),
                "low_confidence_low_complexity": quadrant_counts.get("low_confidence_low_complexity", 0),
                "low_confidence_high_complexity": quadrant_counts.get("low_confidence_high_complexity", 0)
            },
            "insights": {
                "avg_effectiveness": round(sum(d["effectiveness_score"] for d in matrix_data) / max(len(matrix_data), 1), 2),
                "high_effectiveness_count": len([d for d in matrix_data if d["effectiveness_score"] > 0.8]),
                "needs_attention_count": len([d for d in matrix_data if d["quadrant"] == "low_confidence_high_complexity"]),
                "ideal_decisions_count": len([d for d in matrix_data if d["quadrant"] == "high_confidence_low_complexity"])
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating effectiveness matrix: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate effectiveness matrix")

@analytics_router.get("/reports/comprehensive")
async def generate_comprehensive_report(
    days: int = Query(30, ge=7, le=365),
    include_recommendations: bool = Query(True),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    📋 Comprehensive analytics report
    
    Generates a complete organizational intelligence report with insights and recommendations.
    """
    try:
        since_date = datetime.now() - timedelta(days=days)
        report_id = f"report-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        # Executive summary metrics
        exec_summary = await db.fetchrow("""
            SELECT 
                COUNT(*) as total_decisions,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_decisions,
                COUNT(CASE WHEN status = 'proposed' THEN 1 END) as proposed_decisions,
                AVG(confidence_score) as avg_confidence,
                AVG(complexity_score) as avg_complexity,
                COUNT(DISTINCT component) as components_involved
            FROM adrs 
            WHERE created_at >= $1
        """, since_date)
        
        # Evidence and effectiveness
        evidence_stats = await db.fetchrow("""
            SELECT 
                COUNT(DISTINCT de.adr_id) as decisions_with_evidence,
                COUNT(de.id) as total_evidence_entries,
                AVG(de.confidence_level) as avg_evidence_confidence
            FROM decision_evidence de
            JOIN adrs a ON de.adr_id = a.adr_id
            WHERE a.created_at >= $1
        """, since_date)
        
        # Component performance
        top_components = await db.fetch("""
            SELECT 
                component,
                COUNT(*) as count,
                AVG(confidence_score) as avg_confidence,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count
            FROM adrs 
            WHERE created_at >= $1
            GROUP BY component
            ORDER BY count DESC
            LIMIT 5
        """, since_date)
        
        # Decision quality trends
        quality_trends = await db.fetch("""
            SELECT 
                DATE_TRUNC('week', created_at) as week,
                AVG(confidence_score) as avg_confidence,
                AVG(complexity_score) as avg_complexity,
                COUNT(*) as decision_count
            FROM adrs 
            WHERE created_at >= $1 AND confidence_score IS NOT NULL
            GROUP BY week
            ORDER BY week
        """, since_date)
        
        # Build comprehensive report
        report = {
            "report_id": report_id,
            "generated_at": datetime.now().isoformat(),
            "period_days": days,
            "period_start": since_date.isoformat(),
            "period_end": datetime.now().isoformat(),
            
            "executive_summary": {
                "total_decisions": exec_summary["total_decisions"],
                "accepted_decisions": exec_summary["accepted_decisions"],
                "proposed_decisions": exec_summary["proposed_decisions"],
                "acceptance_rate": round((exec_summary["accepted_decisions"] / max(exec_summary["total_decisions"], 1)) * 100, 1),
                "avg_confidence": round(float(exec_summary["avg_confidence"] or 0), 2),
                "avg_complexity": round(float(exec_summary["avg_complexity"] or 0), 2),
                "components_involved": exec_summary["components_involved"],
                "decision_velocity": round(exec_summary["total_decisions"] / (days / 7), 1)  # per week
            },
            
            "evidence_analysis": {
                "decisions_with_evidence": evidence_stats["decisions_with_evidence"] or 0,
                "total_evidence_entries": evidence_stats["total_evidence_entries"] or 0,
                "evidence_coverage": round(
                    (evidence_stats["decisions_with_evidence"] or 0) * 100 / 
                    max(exec_summary["accepted_decisions"], 1), 1
                ),
                "avg_evidence_confidence": round(float(evidence_stats["avg_evidence_confidence"] or 0), 2)
            },
            
            "component_performance": [
                {
                    "component": row["component"],
                    "decision_count": row["count"],
                    "avg_confidence": round(float(row["avg_confidence"] or 0), 2),
                    "acceptance_rate": round((row["accepted_count"] / max(row["count"], 1)) * 100, 1)
                }
                for row in top_components
            ],
            
            "quality_trends": [
                {
                    "week": row["week"].isoformat(),
                    "avg_confidence": round(float(row["avg_confidence"] or 0), 2),
                    "avg_complexity": round(float(row["avg_complexity"] or 0), 2),
                    "decision_count": row["decision_count"]
                }
                for row in quality_trends
            ]
        }
        
        # Add recommendations if requested
        if include_recommendations:
            recommendations = []
            
            # Decision velocity recommendation
            velocity = report["executive_summary"]["decision_velocity"]
            if velocity < 1:
                recommendations.append({
                    "category": "velocity",
                    "priority": "medium",
                    "title": "Low Decision Velocity",
                    "description": f"Decision velocity is {velocity} per week. Consider if decision processes can be streamlined.",
                    "actions": ["Review decision approval workflow", "Identify bottlenecks", "Consider delegation opportunities"]
                })
            elif velocity > 10:
                recommendations.append({
                    "category": "velocity", 
                    "priority": "medium",
                    "title": "High Decision Velocity",
                    "description": f"Decision velocity is {velocity} per week. Ensure quality is maintained during rapid decision-making.",
                    "actions": ["Monitor decision quality metrics", "Ensure adequate review time", "Consider decision fatigue"]
                })
            
            # Evidence collection recommendation
            evidence_coverage = report["evidence_analysis"]["evidence_coverage"]
            if evidence_coverage < 50:
                recommendations.append({
                    "category": "evidence",
                    "priority": "high",
                    "title": "Low Evidence Collection",
                    "description": f"Only {evidence_coverage}% of decisions have follow-up evidence. Implement systematic evidence collection.",
                    "actions": ["Create evidence collection templates", "Set post-decision review reminders", "Train team on impact measurement"]
                })
            
            # Confidence recommendation
            avg_confidence = report["executive_summary"]["avg_confidence"]
            if avg_confidence < 0.6:
                recommendations.append({
                    "category": "quality",
                    "priority": "high",
                    "title": "Low Decision Confidence",
                    "description": f"Average decision confidence is {avg_confidence}. Improve decision analysis quality.",
                    "actions": ["Enhance decision documentation templates", "Require stakeholder input", "Conduct decision retrospectives"]
                })
            
            report["recommendations"] = recommendations
        
        logger.info(f"📋 Generated comprehensive report {report_id} for {days} days")
        return report
        
    except Exception as e:
        logger.error(f"❌ Error generating comprehensive report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate comprehensive report")