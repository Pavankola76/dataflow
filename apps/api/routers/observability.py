"""Observability API — managing Data Contracts, Pipeline Health, and Lineage."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List

from middleware.auth import get_current_user
from models.user import User
import sys
import os

workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if workspace_root not in sys.path:
    sys.path.append(workspace_root)

from packages.observability.contracts import DataContract as PydanticDataContract, validate_contract, ColumnConstraint
from packages.observability.lineage import parse_lineage
from packages.observability.profiler import DataProfiler
from database import async_session
from sqlalchemy import select
from models.governance import DataContract as DBDataContract

router = APIRouter(prefix="/api/v1/observability", tags=["Observability"])

@router.get("/lineage/{table_id}")
async def get_table_lineage(
    table_id: str,
    current_user: User = Depends(get_current_user),
):
    """Returns the upstream and downstream data lineage graph for a given table."""
    try:
        lineage_graph = parse_lineage(table_id)
        return lineage_graph
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contracts")
async def get_all_contracts(
    current_user: User = Depends(get_current_user),
):
    """Fetches all active Data Contracts across the platform."""
    async with async_session() as db:
        stmt = select(DBDataContract).where(DBDataContract.status == 'active')
        res = await db.execute(stmt)
        db_contracts = res.scalars().all()
        
        results = []
        for c in db_contracts:
            columns = []
            schema_cols = c.schema_contract.get("columns", [])
            for col in schema_cols:
                columns.append(ColumnConstraint(
                    name=col.get("name"),
                    expected_type=col.get("type", "string"),
                    max_null_rate=c.quality_contract.get("max_null_rate", 0.0) if c.quality_contract else 0.0,
                    is_unique=False
                ))
            
            pydantic_contract = PydanticDataContract(
                table_name=c.table_name,
                owner="data_engineering_team",
                description="Database-backed contract",
                columns=columns
            )
            results.append(pydantic_contract.dict())
            
        return {"contracts": results}

@router.post("/contracts/validate")
async def validate_table_contract(
    table_id: str,
    sample_data: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user),
):
    """
    Simulates a Data Contract SLA validation using a sample profile payload.
    """
    async with async_session() as db:
        stmt = select(DBDataContract).where(DBDataContract.table_name == table_id, DBDataContract.status == "active")
        res = await db.execute(stmt)
        c = res.scalars().first()
        
        if not c:
            raise HTTPException(status_code=404, detail=f"No contract defined for {table_id}")
            
        columns = []
        schema_cols = c.schema_contract.get("columns", [])
        for col in schema_cols:
            columns.append(ColumnConstraint(
                name=col.get("name"),
                expected_type=col.get("type", "string"),
                max_null_rate=c.quality_contract.get("max_null_rate", 0.0) if c.quality_contract else 0.0,
                is_unique=False
            ))
            
        contract = PydanticDataContract(
            table_name=c.table_name,
            owner="data_engineering_team",
            description="Database-backed contract",
            columns=columns
        )
        
        # Profile the data first
        profiler = DataProfiler()
        profile_data = profiler.profile_schema(table_id, sample_data)
        
        # Run the contract assertion
        validation_result = validate_contract(contract, profile_data)
        
        return {
            "is_valid": validation_result.is_valid,
            "violations": validation_result.violations,
            "contract": contract.dict(),
            "observed_profile": profile_data
        }

@router.get("/health")
async def get_pipeline_health_metrics(
    current_user: User = Depends(get_current_user),
):
    """
    Returns aggregated health statistics from real pipeline run data.
    """
    from database import async_session
    from sqlalchemy import select, func, text
    from models.pipeline import Pipeline, PipelineRun
    
    try:
        async with async_session() as db:
            # Real rows processed in last 24h
            rows_q = select(func.sum(PipelineRun.rows_processed)).where(
                PipelineRun.started_at >= text("NOW() - INTERVAL '24 hours'")
            )
            rows_24h = (await db.execute(rows_q)).scalar() or 0
            
            # Active pipelines
            active_q = select(func.count()).select_from(Pipeline).where(Pipeline.status == "active")
            active_count = (await db.execute(active_q)).scalar() or 0
            
            # Failed in last 24h
            failed_q = select(func.count()).select_from(PipelineRun).where(
                PipelineRun.status == "failed",
                PipelineRun.started_at >= text("NOW() - INTERVAL '24 hours'")
            )
            failed_count = (await db.execute(failed_q)).scalar() or 0
            
            # Average duration
            dur_q = select(func.avg(PipelineRun.duration_seconds)).where(PipelineRun.status == "succeeded")
            avg_dur = (await db.execute(dur_q)).scalar() or 0
            
            return {
                "status": "Healthy" if failed_count == 0 else "Degraded",
                "rows_processed_24h": f"{int(rows_24h):,}",
                "active_pipelines": active_count,
                "failing_contracts": failed_count,
                "avg_latency_ms": int(float(avg_dur) * 1000) if avg_dur else 0,
                "incidents": []
            }
    except Exception as e:
        return {
            "status": "Unknown",
            "rows_processed_24h": "0",
            "active_pipelines": 0,
            "failing_contracts": 0,
            "avg_latency_ms": 0,
            "incidents": [str(e)]
        }

from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from models.ai_and_ops import ApprovalRequest
from packages.ai_agents.auto_heal import generate_fix

@router.post("/simulate-outage")
async def simulate_outage(db: AsyncSession = Depends(get_db)):
    """Simulates a pipeline failure to trigger the AutoHealAgent."""
    diagnostic_report = {
        "error_type": "schema_drift",
        "details": "Column 'shipping_method' abruptly pushed to source replica."
    }
    
    fix_plan = await generate_fix(diagnostic_report)
    
    request_record = ApprovalRequest(
        request_type=fix_plan["fix_action"],
        resource_type="dbt_model",
        resource_id="stg_orders",
        requested_by="AutoHealAgent",
        change_description=fix_plan["reasoning"],
        diff=fix_plan["fix_diff"],
        status="pending"
    )
    
    db.add(request_record)
    await db.commit()
    
    return {"status": "success", "ticket_id": str(request_record.id)}
