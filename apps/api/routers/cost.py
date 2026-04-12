"""Cost Optimization API — fetch metrics, query usage, and optimization recommendations."""

from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/cost", tags=["Cost Optimization"])

class CostMetric(BaseModel):
    date: str
    warehouse_compute: float
    storage: float
    data_transfer: float
    total: float

class OptimizationRecommendation(BaseModel):
    id: str
    type: str
    impact: str
    resource: str
    description: str
    sql_suggestion: Optional[str] = None

from database import async_session
from sqlalchemy import select, func, text, cast, Date
from datetime import datetime, timedelta, timezone
from models.ai_and_ops import CostRecord

@router.get("/metrics", response_model=List[CostMetric])
async def get_cost_metrics(current_user: User = Depends(get_current_user)):
    metrics = []
    
    async with async_session() as db:
        # Generate the trailing 7 days
        today = datetime.now(timezone.utc).date()
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            # Query sum grouped by cost_type on target date
            stmt = select(
                CostRecord.cost_type,
                func.sum(CostRecord.amount).label("total")
            ).where(
                cast(CostRecord.created_at, Date) == target_date
            ).group_by(CostRecord.cost_type)
            
            res = await db.execute(stmt)
            rows = res.all()
            
            day_cost = {"compute": 0.0, "storage": 0.0, "data_transfer": 0.0}
            for row in rows:
                if row.cost_type in day_cost:
                    day_cost[row.cost_type] = float(row.total or 0.0)
                    
            total_sum = day_cost["compute"] + day_cost["storage"] + day_cost["data_transfer"]
            
            # Use concise string formatting (e.g. "Mar 29")
            date_str = target_date.strftime("%b %d")
            
            metrics.append({
                "date": date_str,
                "warehouse_compute": round(day_cost["compute"], 2),
                "storage": round(day_cost["storage"], 2),
                "data_transfer": round(day_cost["data_transfer"], 2),
                "total": round(total_sum, 2)
            })
            
    return metrics

@router.get("/recommendations", response_model=List[OptimizationRecommendation])
async def get_optimizations(current_user: User = Depends(get_current_user)):
    metrics = []
    
    async with async_session() as db:
        # Generate the trailing 7 days
        today = datetime.now(timezone.utc).date()
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            # Query sum grouped by cost_type on target date
            stmt = select(
                CostRecord.cost_type,
                func.sum(CostRecord.amount).label("total")
            ).where(
                cast(CostRecord.created_at, Date) == target_date
            ).group_by(CostRecord.cost_type)
            
            res = await db.execute(stmt)
            rows = res.all()
            
            day_cost = {"compute": 0.0, "storage": 0.0, "data_transfer": 0.0}
            for row in rows:
                if row.cost_type in day_cost:
                    day_cost[row.cost_type] = float(row.total or 0.0)
                    
            total_sum = day_cost["compute"] + day_cost["storage"] + day_cost["data_transfer"]
            date_str = target_date.strftime("%b %d")
            
            metrics.append({
                "date": date_str,
                "warehouse_compute": round(day_cost["compute"], 2),
                "storage": round(day_cost["storage"], 2),
                "data_transfer": round(day_cost["data_transfer"], 2),
                "total": round(total_sum, 2)
            })
            
    import sys
    import os
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    if workspace_root not in sys.path:
        sys.path.append(workspace_root)
        
    from packages.ai_agents.optimization import OptimizationAgent
    recommendations = await OptimizationAgent.generate_dynamic_recommendations(metrics)
    
    return recommendations
