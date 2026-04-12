"""Reverse ETL API — Push gold-layer data back to operational systems."""

from typing import Optional
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user
from models.user import User

router = APIRouter()

# In-memory state for now — will be backed by a DB model in the next sprint
_syncs = {}


class SyncCreate(BaseModel):
    name: str
    source_table: str
    destination_type: str  # salesforce, hubspot, slack, postgresql, webhook
    destination_config: dict = {}
    column_mapping: dict = {}
    sync_mode: str = "incremental"  # full, incremental, upsert
    schedule: Optional[str] = None  # cron expression


@router.get("/api/v1/reverse-etl/syncs")
async def list_syncs(current_user: User = Depends(get_current_user)):
    return list(_syncs.values())


@router.post("/api/v1/reverse-etl/syncs", status_code=201)
async def create_sync(body: SyncCreate, current_user: User = Depends(get_current_user)):
    sync_id = str(uuid.uuid4())
    sync = {
        "id": sync_id,
        "name": body.name,
        "source_table": body.source_table,
        "destination_type": body.destination_type,
        "destination_config": body.destination_config,
        "column_mapping": body.column_mapping,
        "sync_mode": body.sync_mode,
        "schedule": body.schedule,
        "status": "active",
        "last_run": None,
        "runs": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _syncs[sync_id] = sync
    return {"id": sync_id, "name": body.name}


@router.post("/api/v1/reverse-etl/syncs/{sync_id}/run")
async def trigger_sync(sync_id: str, current_user: User = Depends(get_current_user)):
    if sync_id not in _syncs:
        raise HTTPException(status_code=404, detail="Sync not found")
    run = {
        "run_id": str(uuid.uuid4()),
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "rows_synced": 0,
    }
    _syncs[sync_id]["runs"].append(run)
    _syncs[sync_id]["last_run"] = run["started_at"]
    # In production this would trigger a background worker
    run["status"] = "succeeded"
    run["rows_synced"] = 150  # placeholder
    return run


@router.get("/api/v1/reverse-etl/syncs/{sync_id}/runs")
async def get_sync_runs(sync_id: str, current_user: User = Depends(get_current_user)):
    if sync_id not in _syncs:
        raise HTTPException(status_code=404, detail="Sync not found")
    return _syncs[sync_id]["runs"]
