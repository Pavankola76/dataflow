"""Pydantic schemas for API request/response models."""

from __future__ import annotations
from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    name: str = Field(..., min_length=1, max_length=255)
    org_name: Optional[str] = Field(None, max_length=255)


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: Optional[str]
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Connections ───────────────────────────────────────────────────────────

class ConnectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    connector_type: str = Field(..., min_length=1, max_length=50)
    config: dict = Field(...)  # host, port, database, username, password, etc.


class ConnectionUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[dict] = None
    status: Optional[str] = None


class ConnectionResponse(BaseModel):
    id: UUID
    name: str
    connector_type: str
    status: str
    last_heartbeat_at: Optional[datetime] = None
    last_schema_sync_at: Optional[datetime] = None
    schema_snapshot: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class ConnectionTestResult(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float] = None


class SchemaDiscoveryResult(BaseModel):
    tables: list[TableSchema]
    relationships: list[dict] = []
    discovered_at: datetime


class TableSchema(BaseModel):
    table_name: str
    schema_name: str = "public"
    row_count: int = 0
    columns: list[ColumnSchema] = []


class ColumnSchema(BaseModel):
    column_name: str
    data_type: str
    is_nullable: bool = True
    is_primary_key: bool = False
    is_foreign_key: bool = False
    foreign_key_ref: Optional[str] = None
    default_value: Optional[str] = None
    sample_values: list[Any] = []
    null_rate: Optional[float] = None
    distinct_count: Optional[int] = None
    description: Optional[str] = None
    pii_classification: Optional[str] = None


# Fix forward references
SchemaDiscoveryResult.model_rebuild()


# ── Pipelines ─────────────────────────────────────────────────────────────

class PipelineCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    connection_id: UUID
    pipeline_type: str = "ingestion"
    strategy: Optional[str] = "elt"
    config: dict = Field(default_factory=dict)
    schedule: Optional[str] = None


class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    config: Optional[dict] = None
    schedule: Optional[str] = None


class PipelineResponse(BaseModel):
    id: UUID
    name: str
    connection_id: Optional[UUID] = None
    pipeline_type: str
    strategy: Optional[str] = None
    status: str
    schedule: Optional[str] = None
    version: int
    config: dict = {}
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PipelineRunResponse(BaseModel):
    id: UUID
    pipeline_id: UUID
    run_number: int
    status: str
    trigger_type: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    rows_processed: int = 0
    bytes_processed: int = 0
    error_log: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Connectors (catalog) ─────────────────────────────────────────────────

class ConnectorInfo(BaseModel):
    type: str
    name: str
    description: str
    category: str
    logo_url: str
    supported_modes: list[str]
    setup_complexity: str
    is_available: bool


# ── Generic ───────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
