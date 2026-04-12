"""Data Ingestion API — fetch active Extract & Load jobs mapping Postgres to MinIO (Iceberg)."""

from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/ingestion", tags=["Bronze Ingestion"])

class SyncTask(BaseModel):
    id: str
    source: str
    destination: str
    table_name: str
    status: str
    rows_processed: int
    bytes_transferred: int
    started_at: str
    duration_sec: int

@router.get("/syncs", response_model=List[SyncTask])
async def get_active_syncs(current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    return [
       {
           "id": "sync_88fa1",
           "source": "PostgreSQL (Prod)",
           "destination": "MinIO (Iceberg Bronze)",
           "table_name": "stripe_payments",
           "status": "Running",
           "rows_processed": 1450200,
           "bytes_transferred": 256000000,
           "started_at": (now - timedelta(minutes=4)).isoformat(),
           "duration_sec": 240
       },
       {
           "id": "sync_92be3",
           "source": "MySQL (Legacy)",
           "destination": "MinIO (Iceberg Bronze)",
           "table_name": "users_archive",
           "status": "Running",
           "rows_processed": 84000,
           "bytes_transferred": 10485760,
           "started_at": (now - timedelta(minutes=1)).isoformat(),
           "duration_sec": 60
       },
       {
           "id": "sync_10ca8",
           "source": "MongoDB (Events)",
           "destination": "MinIO (Iceberg Bronze)",
           "table_name": "clickstream_raw",
           "status": "Completed",
           "rows_processed": 18500200,
           "bytes_transferred": 8589934592,
           "started_at": (now - timedelta(hours=2)).isoformat(),
           "duration_sec": 3600
       }
    ]
