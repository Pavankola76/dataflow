"""Enterprise Security Audit API."""

from pydantic import BaseModel
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

from middleware.auth import get_current_user
from models.user import User
from models.system import AuditLog
from database import get_db

router = APIRouter(prefix="/api/v1/security", tags=["Security"])

class SecurityLog(BaseModel):
    id: str
    event_type: str
    severity: str
    description: str
    actor: str
    ip_address: str
    timestamp: str

async def log_security_event(
    db: AsyncSession,
    action: str,
    resource_type: str,
    description: str,
    severity: str = "Info",
    user_id: Optional[uuid.UUID] = None,
    workspace_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None
):
    """Utility to safely write to the audit log asynchronously within a route."""
    log = AuditLog(
        action=action,
        resource_type=resource_type,
        details={"description": description, "severity": severity},
        user_id=user_id,
        workspace_id=workspace_id,
        ip_address=ip_address or "0.0.0.0"
    )
    db.add(log)
    await db.commit()

@router.get("/logs", response_model=List[SecurityLog])
async def get_security_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100)
    )
    logs = result.scalars().all()
    
    formatted_logs = []
    for log in logs:
        details = log.details or {}
        actor_name = str(log.user_id) if log.user_id else "System / API"
        
        formatted_logs.append(
            SecurityLog(
                id=str(log.id),
                event_type=log.action,
                severity=details.get("severity", "Info"),
                description=details.get("description", f"Action performed on {log.resource_type}"),
                actor=actor_name,
                ip_address=log.ip_address or "Unknown",
                timestamp=log.created_at.isoformat()
            )
        )
        
    return formatted_logs
