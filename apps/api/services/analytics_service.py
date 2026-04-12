"""Analytics Service — Query execution, caching, and conversation context."""

from typing import Optional
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.analytics import AnalyticsQuery


class AnalyticsService:
    """Manages analytics query lifecycle: storage, caching, and session context."""

    @staticmethod
    async def store_query(
        db: AsyncSession,
        question: str,
        generated_sql: str,
        session_id: Optional[uuid.UUID] = None,
        execution_time_ms: Optional[int] = None,
        row_count: Optional[int] = None,
        chart_type: Optional[str] = None,
        chart_config: Optional[dict] = None,
    ) -> AnalyticsQuery:
        """Persist an analytics query for history and learning."""
        query = AnalyticsQuery(
            natural_language_question=question,
            generated_sql=generated_sql,
            session_id=session_id,
            execution_time_ms=execution_time_ms,
            row_count=row_count,
            chart_type=chart_type,
            chart_config=chart_config,
        )
        db.add(query)
        await db.flush()
        return query

    @staticmethod
    async def get_session_history(db: AsyncSession, session_id: uuid.UUID, limit: int = 20):
        """Get conversation context for a chat session."""
        result = await db.execute(
            select(AnalyticsQuery)
            .where(AnalyticsQuery.session_id == session_id)
            .order_by(AnalyticsQuery.created_at)
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def get_recent_queries(db: AsyncSession, limit: int = 50):
        """Get most recent analytics queries."""
        result = await db.execute(
            select(AnalyticsQuery)
            .order_by(AnalyticsQuery.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def save_query(db: AsyncSession, query_id: uuid.UUID, name: str, description: Optional[str] = None):
        """Mark a query as saved for reuse."""
        result = await db.execute(select(AnalyticsQuery).where(AnalyticsQuery.id == query_id))
        query = result.scalar_one_or_none()
        if query:
            query.is_saved = True
            query.saved_name = name
            query.saved_description = description
        return query

    @staticmethod
    async def record_user_correction(db: AsyncSession, query_id: uuid.UUID, modified_sql: str):
        """Record when a user modifies the AI-generated SQL (for learning)."""
        result = await db.execute(select(AnalyticsQuery).where(AnalyticsQuery.id == query_id))
        query = result.scalar_one_or_none()
        if query:
            query.sql_was_modified = True
            query.modified_sql = modified_sql
        return query
