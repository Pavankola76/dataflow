"""Pipelines API — CRUD, run, pause, resume, history."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
import asyncio
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.pipeline import Pipeline, PipelineRun
from models.connection import Connection
from schemas import (
    PipelineCreate,
    PipelineUpdate,
    PipelineResponse,
    PipelineRunResponse,
)
from services.ingestion_service import IngestionService

router = APIRouter(prefix="/api/v1/pipelines", tags=["Pipelines"])


@router.get("", response_model=list[PipelineResponse])
async def list_pipelines(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Pipeline).order_by(Pipeline.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
async def create_pipeline(
    data: PipelineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify connection exists
    result = await db.execute(select(Connection).where(Connection.id == data.connection_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Connection not found")

    pipeline = Pipeline(
        name=data.name,
        connection_id=data.connection_id,
        pipeline_type=data.pipeline_type,
        strategy=data.strategy,
        config=data.config,
        schedule=data.schedule,
        status="draft",
        created_by=current_user.id,
    )
    db.add(pipeline)
    await db.flush()
    await db.refresh(pipeline)
    return pipeline


@router.get("/{pipeline_id}", response_model=PipelineResponse)
async def get_pipeline(
    pipeline_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


@router.patch("/{pipeline_id}", response_model=PipelineResponse)
async def update_pipeline(
    pipeline_id: UUID,
    data: PipelineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pipeline, key, value)
    pipeline.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(pipeline)
    return pipeline


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pipeline(
    pipeline_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    await db.delete(pipeline)


@router.post("/{pipeline_id}/run", response_model=PipelineRunResponse)
async def run_pipeline(
    pipeline_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    # Get connection
    conn_result = await db.execute(select(Connection).where(Connection.id == pipeline.connection_id))
    connection = conn_result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Pipeline connection not found")

    # Trigger run via service
    from services.pipeline_service import PipelineService
    run = await PipelineService.trigger_run(
        db=db,
        pipeline=pipeline,
        connection=connection,
        background_tasks=background_tasks,
        trigger_type="manual"
    )

    return run


@router.get("/{pipeline_id}/runs", response_model=list[PipelineRunResponse])
async def list_pipeline_runs(
    pipeline_id: UUID,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PipelineRun)
        .where(PipelineRun.pipeline_id == pipeline_id)
        .order_by(PipelineRun.started_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/{pipeline_id}/pause", response_model=PipelineResponse)
async def pause_pipeline(
    pipeline_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    pipeline.status = "paused"
    pipeline.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(pipeline)
    return pipeline


@router.post("/{pipeline_id}/run/stream")
async def stream_pipeline_run(
    pipeline_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    async def log_generator():
        """Stream real pipeline status by polling the database."""
        from sqlalchemy import select
        from models.pipeline import PipelineRun
        
        yield "Initializing extraction engine...\n"
        await asyncio.sleep(0.5)
        
        # Find the latest run for this pipeline
        result = await db.execute(
            select(PipelineRun)
            .where(PipelineRun.pipeline_id == pipeline_id)
            .order_by(PipelineRun.started_at.desc())
            .limit(1)
        )
        run = result.scalar_one_or_none()
        
        if not run:
            yield "No active runs found for this pipeline.\n"
            return
        
        yield f"Run #{run.run_number} started at {run.started_at}\n"
        yield f"Status: {run.status}\n"
        yield "\n"
        
        # Poll for status changes
        max_polls = 60  # 30 seconds max
        for i in range(max_polls):
            await asyncio.sleep(0.5)
            await db.refresh(run)
            
            if run.status == "succeeded":
                yield f"\nExtraction completed successfully!\n"
                yield f"Rows processed: {run.rows_processed or 0}\n"
                yield f"Bytes processed: {run.bytes_processed or 0}\n"
                yield f"Duration: {run.duration_seconds or 0}s\n"
                yield "\nDone. PASS=1 WARN=0 ERROR=0\n"
                return
            elif run.status == "failed":
                yield f"\nExtraction failed!\n"
                if run.error_log:
                    yield f"Error: {run.error_log[:500]}\n"
                yield "\nDone. PASS=0 WARN=0 ERROR=1\n"
                return
            
            if i % 4 == 0:
                yield f"  ... pipeline still running ({i * 0.5:.0f}s elapsed)\n"
        
        yield "\nStream timeout — pipeline may still be running in background.\n"

    return StreamingResponse(log_generator(), media_type="text/plain")
