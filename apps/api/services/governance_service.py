"""Governance Service — Data catalog, lineage, and PII classification logic."""

from typing import Optional
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.governance import DataCatalog, DataLineage


class GovernanceService:
    """Manages the data catalog, lineage graph, and PII classification."""

    @staticmethod
    async def register_table(
        db: AsyncSession,
        table_name: str,
        layer: str,
        schema_name: Optional[str] = None,
        column_metadata: Optional[dict] = None,
        row_count: Optional[int] = None,
        size_bytes: Optional[int] = None,
    ) -> DataCatalog:
        """Auto-register a table in the data catalog."""
        result = await db.execute(
            select(DataCatalog).where(
                DataCatalog.table_name == table_name,
                DataCatalog.layer == layer,
            )
        )
        entry = result.scalar_one_or_none()
        if entry:
            entry.column_metadata = column_metadata
            entry.row_count = row_count
            entry.size_bytes = size_bytes
            entry.last_refreshed_at = datetime.now(timezone.utc)
        else:
            entry = DataCatalog(
                table_name=table_name,
                layer=layer,
                schema_name=schema_name,
                column_metadata=column_metadata,
                row_count=row_count,
                size_bytes=size_bytes,
                last_refreshed_at=datetime.now(timezone.utc),
            )
            db.add(entry)
        await db.flush()
        return entry

    @staticmethod
    async def record_lineage(
        db: AsyncSession,
        source_table: str,
        target_table: str,
        source_column: Optional[str] = None,
        target_column: Optional[str] = None,
        transformation_type: str = "direct",
        transformation_sql: Optional[str] = None,
        pipeline_id: Optional[uuid.UUID] = None,
    ) -> DataLineage:
        """Record a lineage edge between source and target."""
        lineage = DataLineage(
            source_table=source_table,
            target_table=target_table,
            source_column=source_column,
            target_column=target_column,
            transformation_type=transformation_type,
            transformation_sql=transformation_sql,
            pipeline_id=pipeline_id,
        )
        db.add(lineage)
        await db.flush()
        return lineage

    @staticmethod
    def classify_pii(column_name: str, sample_values: list) -> dict:
        """Rule-based PII classification (regex patterns)."""
        import re

        classifications = {
            "email": re.compile(r"[^@]+@[^@]+\.[^@]+"),
            "phone": re.compile(r"[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,}"),
            "ssn": re.compile(r"\d{3}-\d{2}-\d{4}"),
            "ip_address": re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"),
        }

        name_hints = {
            "pii": ["ssn", "social_security", "passport", "national_id", "driver_license"],
            "financial": ["salary", "income", "credit_card", "bank_account", "routing_number"],
            "phi": ["diagnosis", "medication", "medical_record", "patient_id", "health"],
        }

        detected = "none"
        confidence = 0.9

        # Check column name hints
        col_lower = column_name.lower()
        for category, keywords in name_hints.items():
            if any(kw in col_lower for kw in keywords):
                detected = category
                confidence = 0.85
                break

        # Check sample values with regex
        if detected == "none" and sample_values:
            for label, pattern in classifications.items():
                matches = sum(1 for v in sample_values if v and pattern.match(str(v)))
                if matches / max(len(sample_values), 1) > 0.5:
                    detected = "PII"
                    confidence = 0.8
                    break

        return {
            "classification": detected,
            "confidence": confidence,
            "detection_method": "rule_based",
            "recommended_masking": "hash" if detected != "none" else None,
        }
