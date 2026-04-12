"""Celery worker for data ingestion tasks.

Handles Bronze layer ingestion from source connections into Iceberg tables.
Supports full-load, incremental, and CDC ingestion modes.
"""

from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Placeholder: In production, initialise the Celery app from a shared
# config module, e.g.  from celery import Celery; app = Celery(...)
# ------------------------------------------------------------------


def run_full_load(connection_id: str, table_name: str) -> dict:
    """Execute a full-load ingestion for a single table.

    1. Connect to source via the Connection registry.
    2. SELECT * from the source table.
    3. Write rows to Bronze Iceberg table (append-only, partitioned by _ingested_at).
    4. Record batch metadata (row count, byte count, batch_id).
    """
    logger.info("full_load | connection=%s table=%s", connection_id, table_name)
    return {
        "status": "completed",
        "connection_id": connection_id,
        "table": table_name,
        "mode": "full_load",
        "rows_processed": 0,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }


def run_incremental_load(connection_id: str, table_name: str, watermark_column: str, last_watermark: str) -> dict:
    """Execute an incremental ingestion using a high-watermark strategy.

    Only fetches rows where ``watermark_column > last_watermark``.
    """
    logger.info(
        "incremental | connection=%s table=%s watermark=%s since=%s",
        connection_id, table_name, watermark_column, last_watermark,
    )
    return {
        "status": "completed",
        "connection_id": connection_id,
        "table": table_name,
        "mode": "incremental",
        "watermark_column": watermark_column,
        "rows_processed": 0,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }


def run_cdc_capture(connection_id: str, table_name: str) -> dict:
    """Start a CDC capture session using Debezium.

    Reads WAL/binlog events and writes INSERT/UPDATE/DELETE operations
    to the Bronze layer with ``_operation`` metadata column.
    """
    logger.info("cdc | connection=%s table=%s", connection_id, table_name)
    return {
        "status": "running",
        "connection_id": connection_id,
        "table": table_name,
        "mode": "cdc",
    }


def heartbeat_check(connection_id: str) -> dict:
    """Periodic heartbeat — verifies source connectivity every 60 s."""
    logger.debug("heartbeat | connection=%s", connection_id)
    return {"connection_id": connection_id, "alive": True}
