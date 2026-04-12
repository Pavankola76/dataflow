"""Multi-Tenant Workspaces API — fetch isolated cloud environment metrics."""

from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User, Workspace
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter(prefix="/api/v1/workspaces", tags=["Workspaces"])

class WorkspaceEnv(BaseModel):
    id: str
    name: str
    role: str
    region: str
    members: int
    storage_gb: float
    compute_hours: float
    status: str

@router.get("/", response_model=List[WorkspaceEnv])
async def get_workspaces(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workspace).where(Workspace.org_id == current_user.org_id))
    workspaces = result.scalars().all()
    
    return [
        {
            "id": str(ws.id),
            "name": ws.name,
            "role": current_user.role,
            "region": ws.settings.get("region", "us-east-1 (AWS)"),
            "members": 1, # We can query actual members later
            "storage_gb": float(ws.settings.get("storage_gb", 0)),
            "compute_hours": float(ws.settings.get("compute_hours", 0)),
            "status": "Healthy"
        }
        for ws in workspaces
    ]
