"""Approval Workflow API — Human-in-the-Loop system."""

from typing import Optional
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.ai_and_ops import ApprovalRequest
from middleware.auth import get_current_user
from models.user import User

router = APIRouter()


@router.get("/api/v1/approvals")
async def list_approvals(status: Optional[str] = "pending", db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(ApprovalRequest).order_by(ApprovalRequest.created_at.desc())
    if status:
        query = query.where(ApprovalRequest.status == status)
    result = await db.execute(query)
    return [
        {
            "id": str(a.id), "request_type": a.request_type, "resource_type": a.resource_type,
            "resource_id": a.resource_id, "requested_by": a.requested_by,
            "change_description": a.change_description, "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in result.scalars().all()
    ]


@router.get("/api/v1/approvals/{approval_id}")
async def get_approval(approval_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == uuid.UUID(approval_id)))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return {
        "id": str(a.id), "request_type": a.request_type, "resource_type": a.resource_type,
        "resource_id": a.resource_id, "requested_by": a.requested_by,
        "change_description": a.change_description, "diff": a.diff, "status": a.status,
        "review_comment": a.review_comment,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


class ReviewBody(BaseModel):
    comment: Optional[str] = None


@router.post("/api/v1/approvals/{approval_id}/approve")
async def approve_request(approval_id: str, body: ReviewBody = ReviewBody(), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == uuid.UUID(approval_id)))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Approval request not found")
    a.status = "approved"
    a.review_comment = body.comment
    a.reviewed_at = datetime.now(timezone.utc)
    return {"status": "approved", "id": str(a.id)}


@router.post("/api/v1/approvals/{approval_id}/reject")
async def reject_request(approval_id: str, body: ReviewBody = ReviewBody(), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == uuid.UUID(approval_id)))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Approval request not found")
    a.status = "rejected"
    a.review_comment = body.comment
    a.reviewed_at = datetime.now(timezone.utc)
    return {"status": "rejected", "id": str(a.id)}
