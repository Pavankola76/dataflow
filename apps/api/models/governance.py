"""SQLAlchemy models for data governance — catalog, lineage, contracts."""

from typing import Optional
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, ForeignKey, Text, DateTime, Integer, BigInteger, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class DataCatalog(Base):
    """Auto-registered catalog entry for every table in Bronze/Silver/Gold."""
    __tablename__ = "data_catalog"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True)
    table_name: Mapped[str] = mapped_column(String(255), nullable=False)
    schema_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    layer: Mapped[str] = mapped_column(String(20), nullable=False)  # bronze, silver, gold
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    classification: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # public, internal, confidential, restricted
    tags: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    column_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    quality_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    freshness_sla_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    last_refreshed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    row_count: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class DataLineage(Base):
    """Column-level lineage tracking across all pipeline transformations."""
    __tablename__ = "data_lineage"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_table: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    source_column: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_table: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    target_column: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    transformation_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # direct, derived, aggregated, filtered
    transformation_sql: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pipeline_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("pipelines.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class DataContract(Base):
    """Data contracts defining schema, quality, and freshness expectations."""
    __tablename__ = "data_contracts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True)
    table_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contract_version: Mapped[int] = mapped_column(Integer, default=1)
    schema_contract: Mapped[dict] = mapped_column(JSON, nullable=False)
    quality_contract: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    freshness_contract: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")  # draft, active, deprecated
    enforcement_mode: Mapped[str] = mapped_column(String(20), default="warn")  # warn, block, log
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    violations: Mapped[list["ContractViolation"]] = relationship(back_populates="contract")


class ContractViolation(Base):
    """Records of data contract violations."""
    __tablename__ = "contract_violations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_contracts.id"))
    pipeline_run_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("pipeline_runs.id"), nullable=True)
    violation_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # schema_mismatch, quality_failure, freshness_breach
    details: Mapped[dict] = mapped_column(JSON, nullable=False)
    severity: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # critical, warning, info
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    contract: Mapped["DataContract"] = relationship(back_populates="violations")


class BusinessGlossary(Base):
    """Business terms mapped to SQL expressions for analytics."""
    __tablename__ = "business_glossary"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True)
    term: Mapped[str] = mapped_column(String(255), nullable=False)
    definition: Mapped[str] = mapped_column(Text, nullable=False)
    sql_expression: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    related_tables: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft, approved, deprecated
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
