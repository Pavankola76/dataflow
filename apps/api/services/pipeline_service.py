"""Pipeline service — orchestration, status tracking, logging."""

from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks

from models.pipeline import Pipeline, PipelineRun
from models.connection import Connection
from services.ingestion_service import IngestionService

class PipelineService:
    @staticmethod
    async def trigger_run(
        db: AsyncSession,
        pipeline: Pipeline,
        connection: Connection,
        background_tasks: BackgroundTasks,
        trigger_type: str = "manual"
    ) -> PipelineRun:
        """Trigger a new run for a pipeline."""
        
        # Get next run number
        count_result = await db.execute(
            select(func.count()).select_from(PipelineRun).where(PipelineRun.pipeline_id == pipeline.id)
        )
        run_number = (count_result.scalar() or 0) + 1

        # Create run record
        run = PipelineRun(
            pipeline_id=pipeline.id,
            run_number=run_number,
            status="running",
            trigger_type=trigger_type,
            started_at=datetime.now(timezone.utc),
        )
        db.add(run)
        pipeline.status = "active"
        await db.flush()
        await db.refresh(run)

        # Queue background task
        background_tasks.add_task(
            IngestionService.run_ingestion,
            str(run.id),
            str(pipeline.id),
            connection.connector_type,
            connection.config,
            pipeline.config,
        )

        return run
