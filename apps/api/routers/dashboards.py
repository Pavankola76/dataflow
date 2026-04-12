"""Dashboards API — CRUD for dashboards and widgets."""

from typing import Optional, List
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from sqlalchemy.orm import selectinload

from database import get_db
from models.analytics import Dashboard, DashboardWidget

router = APIRouter()


# --- Pydantic Schemas ---
class WidgetCreate(BaseModel):
    query_id: Optional[str] = None
    widget_type: str = "chart"
    position: dict = {"x": 0, "y": 0, "w": 6, "h": 4}
    config: Optional[dict] = None


class DashboardCreate(BaseModel):
    name: str
    description: Optional[str] = None
    layout: dict = {}
    filters: Optional[dict] = None
    refresh_interval: Optional[int] = None


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[dict] = None
    filters: Optional[dict] = None
    refresh_interval: Optional[int] = None
    is_public: Optional[bool] = None


# --- Endpoints ---
@router.get("/api/v1/dashboards")
async def list_dashboards(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Dashboard).options(selectinload(Dashboard.widgets)).order_by(Dashboard.updated_at.desc())
    )
    dashboards = result.scalars().all()
    return [
        {
            "id": str(d.id), "name": d.name, "description": d.description,
            "is_public": d.is_public, "widget_count": len(d.widgets) if d.widgets else 0,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "updated_at": d.updated_at.isoformat() if d.updated_at else None,
        }
        for d in dashboards
    ]


@router.post("/api/v1/dashboards", status_code=201)
async def create_dashboard(body: DashboardCreate, db: AsyncSession = Depends(get_db)):
    dashboard = Dashboard(
        name=body.name, description=body.description,
        layout=body.layout, filters=body.filters,
        refresh_interval=body.refresh_interval,
    )
    db.add(dashboard)
    await db.flush()
    return {"id": str(dashboard.id), "name": dashboard.name}


@router.get("/api/v1/dashboards/{dashboard_id}")
async def get_dashboard(dashboard_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dashboard).where(Dashboard.id == uuid.UUID(dashboard_id)))
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    widgets = []
    if dashboard.widgets:
        widgets = [
            {"id": str(w.id), "widget_type": w.widget_type, "position": w.position, "config": w.config}
            for w in dashboard.widgets
        ]
    return {
        "id": str(dashboard.id), "name": dashboard.name, "description": dashboard.description,
        "layout": dashboard.layout, "filters": dashboard.filters,
        "refresh_interval": dashboard.refresh_interval, "is_public": dashboard.is_public,
        "widgets": widgets,
    }


@router.patch("/api/v1/dashboards/{dashboard_id}")
async def update_dashboard(dashboard_id: str, body: DashboardUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dashboard).where(Dashboard.id == uuid.UUID(dashboard_id)))
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    for field, value in body.dict(exclude_unset=True).items():
        setattr(dashboard, field, value)
    return {"status": "updated", "id": str(dashboard.id)}


@router.delete("/api/v1/dashboards/{dashboard_id}")
async def delete_dashboard(dashboard_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dashboard).where(Dashboard.id == uuid.UUID(dashboard_id)))
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    await db.delete(dashboard)
    return {"status": "deleted"}


@router.post("/api/v1/dashboards/{dashboard_id}/widgets", status_code=201)
async def add_widget(dashboard_id: str, body: WidgetCreate, db: AsyncSession = Depends(get_db)):
    widget = DashboardWidget(
        dashboard_id=uuid.UUID(dashboard_id),
        query_id=uuid.UUID(body.query_id) if body.query_id else None,
        widget_type=body.widget_type,
        position=body.position,
        config=body.config,
    )
    db.add(widget)
    await db.flush()
    return {"id": str(widget.id), "widget_type": widget.widget_type}


@router.delete("/api/v1/dashboards/{dashboard_id}/widgets/{widget_id}")
async def remove_widget(dashboard_id: str, widget_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DashboardWidget).where(DashboardWidget.id == uuid.UUID(widget_id))
    )
    widget = result.scalar_one_or_none()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    await db.delete(widget)
    return {"status": "deleted"}
