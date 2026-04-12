from typing import Optional
"""Connectors catalog API — lists available connector types."""

from fastapi import APIRouter
from schemas import ConnectorInfo

router = APIRouter(prefix="/api/v1/connectors", tags=["Connectors"])

# Static connector registry for Phase 1
CONNECTOR_CATALOG: list[ConnectorInfo] = [
    ConnectorInfo(
        type="postgresql",
        name="PostgreSQL",
        description="Open-source relational database. Supports full load, incremental, and CDC.",
        category="Databases",
        logo_url="/connectors/postgresql.svg",
        supported_modes=["full", "incremental", "cdc"],
        setup_complexity="Easy",
        is_available=True,
    ),
    ConnectorInfo(
        type="mysql",
        name="MySQL",
        description="Popular open-source relational database with CDC support.",
        category="Databases",
        logo_url="/connectors/mysql.svg",
        supported_modes=["full", "incremental", "cdc"],
        setup_complexity="Easy",
        is_available=False,  # Phase 2
    ),
    ConnectorInfo(
        type="snowflake",
        name="Snowflake",
        description="Cloud-native data warehouse with elastic scaling.",
        category="Warehouses",
        logo_url="/connectors/snowflake.svg",
        supported_modes=["full", "incremental"],
        setup_complexity="Medium",
        is_available=False,  # Phase 2
    ),
    ConnectorInfo(
        type="csv_upload",
        name="CSV / JSON / Parquet",
        description="Upload files directly. Drag-and-drop support.",
        category="Files",
        logo_url="/connectors/file.svg",
        supported_modes=["full"],
        setup_complexity="Easy",
        is_available=False,  # Phase 2
    ),
    ConnectorInfo(
        type="rest_api",
        name="REST API",
        description="Connect to any REST API with configurable authentication.",
        category="APIs",
        logo_url="/connectors/api.svg",
        supported_modes=["full", "incremental"],
        setup_complexity="Advanced",
        is_available=False,  # Phase 2
    ),
    ConnectorInfo(
        type="mongodb",
        name="MongoDB",
        description="Document-oriented NoSQL database.",
        category="Databases",
        logo_url="/connectors/mongodb.svg",
        supported_modes=["full", "incremental"],
        setup_complexity="Medium",
        is_available=False,
    ),
    ConnectorInfo(
        type="bigquery",
        name="Google BigQuery",
        description="Serverless, highly-scalable data warehouse by Google.",
        category="Warehouses",
        logo_url="/connectors/bigquery.svg",
        supported_modes=["full", "incremental"],
        setup_complexity="Medium",
        is_available=False,
    ),
    ConnectorInfo(
        type="s3",
        name="Amazon S3",
        description="Scalable cloud object storage from AWS.",
        category="Cloud Storage",
        logo_url="/connectors/s3.svg",
        supported_modes=["full", "incremental"],
        setup_complexity="Easy",
        is_available=False,
    ),
    ConnectorInfo(
        type="kafka",
        name="Apache Kafka",
        description="Distributed event streaming platform for real-time pipelines.",
        category="Streaming",
        logo_url="/connectors/kafka.svg",
        supported_modes=["streaming"],
        setup_complexity="Advanced",
        is_available=False,
    ),
    ConnectorInfo(
        type="salesforce",
        name="Salesforce",
        description="Leading CRM platform with comprehensive API access.",
        category="SaaS",
        logo_url="/connectors/salesforce.svg",
        supported_modes=["full", "incremental"],
        setup_complexity="Medium",
        is_available=False,
    ),
    ConnectorInfo(
        type="google_sheets",
        name="Google Sheets",
        description="Cloud-based spreadsheet application by Google.",
        category="Files",
        logo_url="/connectors/google-sheets.svg",
        supported_modes=["full"],
        setup_complexity="Easy",
        is_available=False,
    ),
    ConnectorInfo(
        type="redshift",
        name="Amazon Redshift",
        description="Fast, fully-managed data warehouse by AWS.",
        category="Warehouses",
        logo_url="/connectors/redshift.svg",
        supported_modes=["full", "incremental"],
        setup_complexity="Medium",
        is_available=False,
    ),
]


@router.get("", response_model=list[ConnectorInfo])
async def list_connectors(category: Optional[str] = None):
    """List all available connector types, optionally filtered by category."""
    if category:
        return [c for c in CONNECTOR_CATALOG if c.category.lower() == category.lower()]
    return CONNECTOR_CATALOG


@router.get("/{connector_type}", response_model=ConnectorInfo)
async def get_connector(connector_type: str):
    """Get details for a specific connector type."""
    for c in CONNECTOR_CATALOG:
        if c.type == connector_type:
            return c
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail=f"Connector type '{connector_type}' not found")
