import asyncio
import uuid
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, async_session, Base

# Import all models to ensure they are registered with Base metadata
from models.user import Workspace, User, Organization
from models.pipeline import Pipeline, PipelineRun
from models.ai_and_ops import CostRecord, ApprovalRequest
from models.system import Alert
from models.governance import DataContract

async def seed():
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Check if we already have a workspace seeded to avoid duplication
        from sqlalchemy import select, func
        res = await session.execute(select(func.count(Workspace.id)))
        workspace_count = res.scalar()
        
        if workspace_count > 0:
            print("Database already seeded with Workspace data. Fetching existing...")
            workspace = (await session.execute(select(Workspace))).scalars().first()
        else:
            print("Seeding new database data...")

            # 1. Base Setup (Org, User, Workspace)
            org = Organization(name="Acme Corp", slug="acme-corp", plan="enterprise")
            session.add(org)
            await session.flush()

            admin = User(org_id=org.id, email="admin@acme.com", name="Admin User", hashed_password="hashed_placeholder")
            session.add(admin)
            await session.flush()

            workspace = Workspace(org_id=org.id, name="Default Workspace")
            session.add(workspace)
            await session.flush()

        # 2. Pipelines & Runs
        pip1 = Pipeline(workspace_id=workspace.id, name="E-Commerce Silver Layer", pipeline_type="transformation", config={})
        pip2 = Pipeline(workspace_id=workspace.id, name="Orders Ingestion", pipeline_type="ingestion", config={})
        session.add_all([pip1, pip2])
        await session.flush()

        run1 = PipelineRun(
            pipeline_id=pip2.id,
            run_number=101,
            status="succeeded",
            started_at=datetime.now(timezone.utc) - timedelta(hours=3),
            completed_at=datetime.now(timezone.utc) - timedelta(hours=2, minutes=50),
            duration_seconds=600,
            rows_processed=1450000
        )
        
        run2 = PipelineRun(
            pipeline_id=pip1.id,
            run_number=102,
            status="failed",
            started_at=datetime.now(timezone.utc) - timedelta(hours=2),
            completed_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=58),
            duration_seconds=120,
            rows_processed=50000,
            error_log="psycopg2.errors.UndefinedColumn: column shipping_method does not exist in table orders",
            error_classification="schema_drift"
        )
        session.add_all([run1, run2])
        await session.flush()

        # 3. Alerts (Linked to the failed run)
        alert = Alert(
            workspace_id=workspace.id,
            pipeline_id=pip1.id,
            level="critical",
            title="E-Commerce Silver Layer - Schema Drift",
            message=run2.error_log,
            is_read=False
        )
        session.add(alert)

        # 4. Data Contracts
        contract1 = DataContract(
            workspace_id=workspace.id,
            table_name="core.fct_daily_sales",
            schema_contract={"columns": [{"name": "transaction_date", "type": "DATE"}, {"name": "revenue", "type": "DECIMAL"}]},
            quality_contract={"max_null_rate": 0.05},
            freshness_contract={"max_delay_hours": 24},
            status="active"
        )
        
        contract2 = DataContract(
            workspace_id=workspace.id,
            table_name="raw.transactions",
            schema_contract={"columns": [{"name": "transaction_date", "type": "DATE"}, {"name": "user_id", "type": "VARCHAR"}]},
            quality_contract={"max_null_rate": 0.01},
            status="active"
        )
        session.add_all([contract1, contract2])

        # 5. Cost Records (Trailing 7 Days)
        now = datetime.now(timezone.utc)
        for i in range(7):
            date_shift = now - timedelta(days=6-i)
            # Add warehouse compute cost
            session.add(CostRecord(
                workspace_id=workspace.id,
                cost_type="compute",
                amount=100.0 + random.uniform(10, 50),
                created_at=date_shift
            ))
            # Add storage cost
            session.add(CostRecord(
                workspace_id=workspace.id,
                cost_type="storage",
                amount=45.0,
                created_at=date_shift
            ))
            # Add data transfer
            session.add(CostRecord(
                workspace_id=workspace.id,
                cost_type="data_transfer",
                amount=10.0 + random.uniform(1, 15),
                created_at=date_shift
            ))

        await session.commit()
        print("Database seeded successfully with real data!")

if __name__ == "__main__":
    asyncio.run(seed())
