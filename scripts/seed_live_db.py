import asyncio
import uuid
import sys
import os

# Add apps/api to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))
from database import engine, async_session, Base
from models.user import Organization, Workspace, User
from models.connection import Connection
from models.pipeline import Pipeline
from sqlalchemy import text

async def seed():
    print("Seeding database...")
    async with async_session() as session:
        # Create Org
        org_id = uuid.uuid4()
        org = Organization(id=org_id, name="Acme Corp", slug="acme")
        
        # Create user
        user_id = uuid.uuid4()
        user = User(
            id=user_id, 
            org_id=org_id, 
            email="admin@acme.com", 
            name="Admin User", 
            hashed_password="foo", 
            role="admin"
        )

        # Create Workspace
        ws_id = uuid.uuid4()
        ws = Workspace(
            id=ws_id, 
            org_id=org_id, 
            name="Default Workspace", 
            description="Main data engineering workspace"
        )

        session.add_all([org, user, ws])
        await session.flush()

        # Connections
        conn1_id = uuid.uuid4()
        conn1 = Connection(
            id=conn1_id, 
            workspace_id=ws_id, 
            name="PostgreSQL (Prod)", 
            connector_type="postgres", 
            config={"host": "postgres", "port": 5432}, 
            status="active", 
            created_by=user_id
        )
        
        conn2_id = uuid.uuid4()
        conn2 = Connection(
            id=conn2_id, 
            workspace_id=ws_id, 
            name="MinIO (Datalake)", 
            connector_type="s3", 
            config={"bucket": "dataflow-lake"}, 
            status="active", 
            created_by=user_id
        )
        
        conn3_id = uuid.uuid4()
        conn3 = Connection(
            id=conn3_id, 
            workspace_id=ws_id, 
            name="Snowflake (Analytics)", 
            connector_type="snowflake", 
            config={"account": "xy1234"}, 
            status="failed", 
            created_by=user_id
        )

        # Pipelines
        pipe1_id = uuid.uuid4()
        pipe1 = Pipeline(
            id=pipe1_id, 
            workspace_id=ws_id, 
            name="Stripe Payments Sync", 
            connection_id=conn1_id, 
            pipeline_type="ingestion", 
            strategy="etl", 
            config={"table": "stripe_payments"}, 
            schedule="0 * * * *", 
            status="active", 
            created_by=user_id
        )
        
        pipe2_id = uuid.uuid4()
        pipe2 = Pipeline(
            id=pipe2_id, 
            workspace_id=ws_id, 
            name="CRM Users CDC", 
            connection_id=conn1_id, 
            pipeline_type="ingestion", 
            strategy="elt", 
            config={"table": "users"}, 
            schedule="continuous", 
            status="running", 
            created_by=user_id
        )

        session.add_all([org, user, ws, conn1, conn2, conn3, pipe1, pipe2])
        await session.commit()
    print("Database seeded successfully with functional test records!")

if __name__ == "__main__":
    asyncio.run(seed())
