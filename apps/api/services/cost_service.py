"""Cost Tracking Service — Track and aggregate costs per resource."""

from typing import Optional
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models.ai_and_ops import CostRecord


class CostService:
    """Tracks costs across compute, storage, queries, and API calls."""

    @staticmethod
    async def record_cost(
        db: AsyncSession,
        cost_type: str,
        amount: float,
        pipeline_id: Optional[uuid.UUID] = None,
        pipeline_run_id: Optional[uuid.UUID] = None,
        workspace_id: Optional[uuid.UUID] = None,
        resource_details: Optional[dict] = None,
    ) -> CostRecord:
        """Record a cost event."""
        record = CostRecord(
            cost_type=cost_type,
            amount=amount,
            pipeline_id=pipeline_id,
            pipeline_run_id=pipeline_run_id,
            workspace_id=workspace_id,
            resource_details=resource_details,
        )
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def get_total_cost(db: AsyncSession, days: int = 30) -> dict:
        """Get total costs aggregated by type for the last N days."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        result = await db.execute(
            select(
                CostRecord.cost_type,
                func.sum(CostRecord.amount).label("total"),
                func.count(CostRecord.id).label("count"),
            )
            .where(CostRecord.created_at >= cutoff)
            .group_by(CostRecord.cost_type)
        )
        breakdown = {}
        for row in result.all():
            breakdown[row.cost_type or "unknown"] = {
                "total": float(row.total),
                "count": row.count,
            }
        return breakdown

    @staticmethod
    async def get_pipeline_cost(db: AsyncSession, pipeline_id: uuid.UUID, days: int = 30) -> float:
        """Get total cost for a specific pipeline run."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        result = await db.execute(
            select(func.sum(CostRecord.amount))
            .where(CostRecord.pipeline_id == pipeline_id, CostRecord.created_at >= cutoff)
        )
        total = result.scalar_one_or_none()
        return float(total) if total else 0.0
