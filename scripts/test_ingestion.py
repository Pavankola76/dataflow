import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))
from database import engine, async_session, Base
from sqlalchemy import select
from models.pipeline import Pipeline, PipelineRun
from models.connection import Connection
from services.ingestion_service import IngestionService

async def test():
    async with async_session() as session:
        # Get first pipeline
        result = await session.execute(select(Pipeline).limit(1))
        pipeline = result.scalar_one_or_none()
        
        if not pipeline:
            print("No pipelines found.")
            return

        conn_res = await session.execute(select(Connection).where(Connection.id == pipeline.connection_id))
        connection = conn_res.scalar_one_or_none()

        run = PipelineRun(
            pipeline_id=pipeline.id,
            run_number=1,
            status="running",
            trigger_type="manual",
        )
        session.add(run)
        await session.commit()
        await session.refresh(run)

        print(f"Triggering ingestion for {pipeline.name} (Run ID: {run.id})")
        await IngestionService.run_ingestion(
            str(run.id),
            str(pipeline.id),
            connection.connector_type,
            connection.config,
            pipeline.config,
        )

        
        run_status = await session.execute(select(PipelineRun).where(PipelineRun.id == run.id))
        check_run = run_status.scalar_one()
        print(f"Run finished with status: {check_run.status}")
        if check_run.error_log:
            print(f"Error Log:\\n{check_run.error_log}")

if __name__ == "__main__":
    asyncio.run(test())
