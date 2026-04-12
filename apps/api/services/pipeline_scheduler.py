"""Automatic pipeline execution via cron scheduling."""

import asyncio
import uuid
from datetime import datetime, timezone
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from croniter import croniter
from sqlalchemy.future import select

from database import async_session
from models.pipeline import Pipeline, PipelineRun
from models.connection import Connection
from services.ingestion_service import IngestionService

logger = logging.getLogger(__name__)

# Global APScheduler instance
_scheduler = AsyncIOScheduler()

async def poll_scheduled_pipelines():
    """Timer job that checks all active pipelines against their cron string."""
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    
    async with async_session() as session:
        try:
            # Query pipelines with active schedules (non draft/deleted)
            stmt = select(Pipeline).where(
                Pipeline.schedule.isnot(None),
                Pipeline.status == "active"
            )
            result = await session.execute(stmt)
            pipelines = result.scalars().all()
            
            for pipeline in pipelines:
                try:
                    # Does the cron string match this current minute?
                    if not croniter.match(pipeline.schedule, now):
                        continue
                        
                    logger.info(f"⏰ CRON Triggered: Pipeline '{pipeline.name}' (ID: {pipeline.id})")
                    
                    # Fetch connection
                    conn = await session.get(Connection, pipeline.connection_id)
                    if not conn:
                        logger.warning(f"Pipeline {pipeline.id} has invalid connection. Skipping schedule.")
                        continue
                    
                    # Ensure not already running a duplicate this minute
                    # Simple guard: if a run started in last 60 seconds for this pipeline via cron
                    stmt_run = select(PipelineRun).where(
                        PipelineRun.pipeline_id == pipeline.id,
                        PipelineRun.trigger_type == "schedule",
                        PipelineRun.status == "running"
                    )
                    run_result = await session.execute(stmt_run)
                    if len(run_result.scalars().all()) > 0:
                        logger.warning(f"Pipeline {pipeline.id} is already running a scheduled job.")
                        continue
                    
                    run_id = str(uuid.uuid4())
                    
                    # First create the PipelineRun database record (like routers/pipelines.py does)
                    # For simplicity, we create it here, or we can just let run_ingestion do its thing.
                    # Wait, our `IngestionService.run_ingestion` assumes the PipelineRun already exists in DB!
                    
                    # Find highest run_number
                    stmt_max = select(PipelineRun.run_number).where(PipelineRun.pipeline_id == pipeline.id).order_by(PipelineRun.run_number.desc()).limit(1)
                    max_run = await session.execute(stmt_max)
                    max_run_val = max_run.scalar_one_or_none() or 0
                    
                    run_model = PipelineRun(
                        id=uuid.UUID(run_id),
                        pipeline_id=pipeline.id,
                        run_number=max_run_val + 1,
                        status="running",
                        trigger_type="schedule",
                        started_at=datetime.utcnow()
                    )
                    session.add(run_model)
                    await session.commit()
                    
                    # Dispatch background ingestion task
                    asyncio.create_task(
                        IngestionService.run_ingestion(
                            run_id=run_id,
                            pipeline_id=str(pipeline.id),
                            connector_type=conn.connector_type,
                            connection_config=conn.config,
                            pipeline_config=pipeline.config,
                        )
                    )
                    
                except Exception as e:
                    logger.error(f"Failed to evaluate/trigger scheduled pipeline {pipeline.id}: {str(e)}")
                    
        except Exception as db_e:
            logger.error(f"Database error during schedule polling: {str(db_e)}")


class PipelineScheduler:
    """Interface to manage the global APScheduler lifecycle."""
    
    @classmethod
    def start(cls):
        """Start the async scheduler with a minute-by-minute heartbeat."""
        _scheduler.add_job(poll_scheduled_pipelines, 'cron', minute='*')
        _scheduler.start()
        logger.info("⏰ Pipeline Scheduler started (polling active schedules every minute)")
        
    @classmethod
    def stop(cls):
        """Shutdown the scheduler gracefully."""
        _scheduler.shutdown()
        logger.info("⏰ Pipeline Scheduler stopped")
