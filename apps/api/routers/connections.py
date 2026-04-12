"""Connections API — CRUD, test, discover, health."""

import time
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.connection import Connection, SchemaSnapshot
from schemas import (
    ConnectionCreate,
    ConnectionUpdate,
    ConnectionResponse,
    ConnectionTestResult,
)
from services.connection_service import ConnectionService

router = APIRouter(prefix="/api/v1/connections", tags=["Connections"])


@router.get("", response_model=list[ConnectionResponse])
async def list_connections(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Connection).order_by(Connection.created_at.desc())
    )
    connections = result.scalars().all()
    return connections


@router.post("", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    data: ConnectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = Connection(
        name=data.name,
        connector_type=data.connector_type,
        config=data.config,
        status="pending",
        created_by=current_user.id,
    )
    db.add(conn)
    await db.flush()
    await db.refresh(conn)
    return conn


@router.get("/{connection_id}", response_model=ConnectionResponse)
async def get_connection(
    connection_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Connection).where(Connection.id == connection_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return conn


@router.patch("/{connection_id}", response_model=ConnectionResponse)
async def update_connection(
    connection_id: UUID,
    data: ConnectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Connection).where(Connection.id == connection_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(conn, key, value)

    conn.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(conn)
    return conn


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    connection_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Connection).where(Connection.id == connection_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    await db.delete(conn)


@router.post("/{connection_id}/test", response_model=ConnectionTestResult)
async def test_connection(
    connection_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Connection).where(Connection.id == connection_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    svc = ConnectionService()
    test_result = await svc.test_connection(conn.connector_type, conn.config)

    if test_result.success:
        conn.status = "active"
        conn.last_heartbeat_at = datetime.now(timezone.utc)
    else:
        conn.status = "failed"
    await db.flush()

    return test_result


@router.post("/{connection_id}/discover")
async def discover_schema(
    connection_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Connection).where(Connection.id == connection_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    svc = ConnectionService()
    discovery_result = await svc.discover_schema(conn.connector_type, conn.config)

    # Store snapshot
    snapshot = SchemaSnapshot(
        connection_id=conn.id,
        snapshot=discovery_result,
    )
    db.add(snapshot)

    conn.schema_snapshot = discovery_result
    conn.last_schema_sync_at = datetime.now(timezone.utc)
    await db.flush()

    return discovery_result


@router.get("/{connection_id}/schema")
async def get_schema(
    connection_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Connection).where(Connection.id == connection_id))
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    if not conn.schema_snapshot:
        raise HTTPException(status_code=404, detail="Schema not yet discovered. Run discovery first.")

    return conn.schema_snapshot
