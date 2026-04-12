"""SQLAlchemy models for analytics queries, dashboards, and widgets."""

from typing import Optional
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, ForeignKey, Text, DateTime, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class AnalyticsQuery(Base):
    """Stores every NL analytics query and its generated SQL."""
    __tablename__ = "analytics_queries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    natural_language_question: Mapped[str] = mapped_column(Text, nullable=False)
    generated_sql: Mapped[str] = mapped_column(Text, nullable=False)
    sql_was_modified: Mapped[bool] = mapped_column(Boolean, default=False)
    modified_sql: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    row_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    chart_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    chart_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    result_cache_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False)
    saved_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    saved_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    schedule: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Dashboard(Base):
    """User-created analytical dashboards."""
    __tablename__ = "dashboards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    layout: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    filters: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    refresh_interval: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    widgets: Mapped[list["DashboardWidget"]] = relationship(back_populates="dashboard", cascade="all, delete-orphan")


class DashboardWidget(Base):
    """Individual widgets within a dashboard."""
    __tablename__ = "dashboard_widgets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dashboard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("dashboards.id"))
    query_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("analytics_queries.id"), nullable=True)
    widget_type: Mapped[str] = mapped_column(String(50), nullable=False)  # chart, metric_card, table, text, filter
    position: Mapped[dict] = mapped_column(JSON, nullable=False)  # {x, y, w, h}
    config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    dashboard: Mapped["Dashboard"] = relationship(back_populates="widgets")
