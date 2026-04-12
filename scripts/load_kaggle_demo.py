import asyncio
import uuid
import sys
import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add apps/api to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))
from database import engine as backend_engine, async_session, Base
from models.user import Organization, Workspace, User
from models.connection import Connection
from models.pipeline import Pipeline

async def prepare_database():
    print("1. Downloading E-Commerce Dataset from online repository...")
    url = "https://raw.githubusercontent.com/databricks/Spark-The-Definitive-Guide/master/data/retail-data/all/online-retail-dataset.csv"
    
    try:
        df = pd.read_csv(url)
        # Clean column names for postgres (lowercase, underscore)
        df.columns = [c.lower().replace(" ", "_").replace(".", "_") for c in df.columns]
        # Clean data types
        df['invoicedate'] = pd.to_datetime(df['invoicedate'], format='mixed', dayfirst=False)
        print(f"Dataset downloaded! Shape: {df.shape}")
    except Exception as e:
        print(f"Failed to download dataset: {e}")
        return

    print("\n2. Creating target database in PostgreSQL...")
    # Connect to default postgres database to create the new one
    # Note: we must use autocommit to run CREATE DATABASE
    pg_url_default = "postgresql://postgres:postgres@localhost:5432/postgres"
    engine_default = create_engine(pg_url_default, isolation_level="AUTOCOMMIT")
    
    db_name = "kaggle_ecommerce"
    with engine_default.connect() as conn:
        # Drop if exists
        conn.execute(text(f"DROP DATABASE IF EXISTS {db_name}"))
        conn.execute(text(f"CREATE DATABASE {db_name}"))
    print(f"Database '{db_name}' created successfully.")

    print("\n3. Loading CSV data into PostgreSQL table 'online_retail'...")
    pg_url_target = f"postgresql://postgres:postgres@localhost:5432/{db_name}"
    engine_target = create_engine(pg_url_target)
    
    # Write to sql
    df.to_sql("online_retail", engine_target, if_exists="replace", index=False)
    print(f"Successfully loaded {len(df)} rows into postgresql://localhost:5432/{db_name}")

    print("\n4. Registering Connection and Pipeline in DataFlow API backend...")
    
    async with async_session() as session:
        # Get the first workspace and user to attach these to
        result = await session.execute(text("SELECT id, org_id FROM workspaces LIMIT 1"))
        ws_row = result.fetchone()
        if not ws_row:
            print("Error: No workspace found. Run seed_live_db.py first or register an account.")
            return
        ws_id = ws_row[0]

        result_user = await session.execute(text("SELECT id FROM users LIMIT 1"))
        user_row = result_user.fetchone()
        user_id = user_row[0] if user_row else None
        
        # Determine internal host for docker vs local
        # If API is running in docker, it needs 'host.docker.internal' or 'postgres'
        # If running locally, 'localhost' is fine. We will use 'localhost' since the postgres scanner runs locally.
        
        conn_id = uuid.uuid4()
        new_conn = Connection(
            id=conn_id,
            workspace_id=ws_id,
            name="Kaggle E-Commerce Source",
            connector_type="postgres",
            config={
                "host": "localhost",
                "port": 5432,
                "database": db_name,
                "username": "postgres",
                "password": "postgres"
            },
            status="active",
            created_by=user_id
        )
        
        pipe_id = uuid.uuid4()
        new_pipe = Pipeline(
            id=pipe_id,
            workspace_id=ws_id,
            name="Online Retail Analytics",
            connection_id=conn_id,
            pipeline_type="ingestion",
            strategy="etl",
            config={"table": "online_retail"},
            schedule="Manual",
            status="Draft",
            created_by=user_id
        )
        
        session.add(new_conn)
        session.add(new_pipe)
        await session.commit()
        
        print("\nSuccess! Connection and Pipeline generated.")
        print("-> Go to http://localhost:3000/pipelines to review and trigger the extraction.")

if __name__ == "__main__":
    asyncio.run(prepare_database())
