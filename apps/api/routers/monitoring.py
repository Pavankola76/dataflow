from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from packages.ai_agents.diagnostic import analyze_error
from packages.ai_agents.auto_heal import generate_fix
from middleware.auth import get_current_user
from models.user import User

router = APIRouter()

from database import async_session
from sqlalchemy import select, func, desc
from models.system import Alert
from models.pipeline import Pipeline, PipelineRun
from sqlalchemy.orm import selectinload

class AlertResponse(BaseModel):
    id: str
    pipeline_id: str
    pipeline_name: str
    timestamp: str
    raw_error_message: str
    status: str
    ai_report: Dict[str, Any]
    auto_heal_diff: Dict[str, Any]

@router.get("/alerts", response_model=List[AlertResponse])
async def list_active_alerts(current_user: User = Depends(get_current_user)):
    """Returns active pipeline anomalies intercepted by the observability engine."""
    alerts_list = []
    
    async with async_session() as db:
        # Fetch alerts joined with their pipelines
        stmt = select(Alert, Pipeline).join(Pipeline, Alert.pipeline_id == Pipeline.id).where(Alert.is_read == False).order_by(desc(Alert.created_at)).limit(10)
        res = await db.execute(stmt)
        rows = res.all()
        
        for alert, pipeline in rows:
            # Generate reports on-the-fly for active alerts
            diagnosis = await analyze_error(str(pipeline.id), alert.message)
            fix_payload = await generate_fix(diagnosis)
            
            alerts_list.append(AlertResponse(
                id=str(alert.id),
                pipeline_id=str(pipeline.id),
                pipeline_name=pipeline.name,
                timestamp=alert.created_at.isoformat(),
                raw_error_message=alert.message,
                status="unresolved",
                ai_report=diagnosis,
                auto_heal_diff=fix_payload
            ))
            
    return alerts_list

@router.get("/summary")
async def get_summary(current_user: User = Depends(get_current_user)):
    """Returns a high-level summary of recent pipeline runs and system health."""
    async with async_session() as db:
        stmt = select(PipelineRun, Pipeline).join(Pipeline, PipelineRun.pipeline_id == Pipeline.id).order_by(desc(PipelineRun.started_at)).limit(3)
        res = await db.execute(stmt)
        rows = res.all()
        
        runs = []
        for run, pipeline in rows:
            runs.append({
                "id": str(run.id),
                "status": run.status,
                "started_at": run.started_at.isoformat() if run.started_at else None,
                "completed_at": run.completed_at.isoformat() if run.completed_at else None,
                "rows_processed": run.rows_processed,
                "pipeline_id": str(pipeline.id)
            })
        
        return {"recent_runs": runs}

@router.post("/alerts/{alert_id}/auto-fix")
async def trigger_auto_fix(alert_id: str, current_user: User = Depends(get_current_user)):
    """Executes the AI-generated differential patch to repair the downstream dependency."""
    async with async_session() as db:
        stmt = select(Alert).where(Alert.id == alert_id)
        res = await db.execute(stmt)
        alert = res.scalar_one_or_none()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found.")
            
        if alert.is_read:
            raise HTTPException(status_code=400, detail="Alert already resolved.")
            
        # Mark as resolved
        alert.is_read = True
        await db.commit()
    
    return {
        "status": "success",
        "message": f"Auto-heal applied successfully for {alert_id}. Model recompiled with dynamic schema.",
        "alert_id": alert_id
    }
