"""Comprehensive seed script: populate every table with realistic enterprise data."""

import asyncio
import uuid
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, async_session, Base
from sqlalchemy import select, func

# Import all models
from models.user import Workspace, User, Organization
from models.pipeline import Pipeline, PipelineRun
from models.ai_and_ops import CostRecord, ApprovalRequest
from models.system import Alert, AuditLog
from models.governance import DataContract, DataCatalog, BusinessGlossary
from models.analytics import Dashboard, DashboardWidget


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Get workspace
        ws_result = await session.execute(select(Workspace).limit(1))
        workspace = ws_result.scalar_one_or_none()
        if not workspace:
            print("No workspace found — creating one.")
            org = Organization(name="Acme Corp", slug="acme-corp", plan="enterprise")
            session.add(org)
            await session.flush()
            workspace = Workspace(org_id=org.id, name="Default Workspace")
            session.add(workspace)
            await session.flush()

        # Get a user for references
        user_result = await session.execute(select(User).limit(1))
        user = user_result.scalar_one_or_none()
        user_id = user.id if user else None

        now = datetime.now(timezone.utc)

        # =====================================================================
        # 1. SECURITY AUDIT LOGS (for /security)
        # =====================================================================
        existing_logs = await session.execute(select(func.count(AuditLog.id)))
        if existing_logs.scalar() < 5:
            security_events = [
                ("user.login", "auth", "User login from 74.125.24.100 (Mountain View, CA)", "Info", "74.125.24.100"),
                ("pipeline.create", "pipeline", "Pipeline 'E-Commerce Silver Layer' created with schedule '0 8 * * *'", "Info", "10.0.1.42"),
                ("connection.create", "connection", "PostgreSQL connection 'Prod DB' established to rds.amazonaws.com:5432", "Info", "10.0.1.42"),
                ("approval.auto_created", "approval", "AI Agent proposed schema migration for dim_customers — awaiting review", "Warning", "10.0.0.1"),
                ("security.rbac_update", "role", "User 'Sarah Jenkins' elevated from Viewer to Editor on workspace 'Production'", "Warning", "172.16.0.5"),
                ("data.export", "catalog", "Bulk export of 142K records from gold.fct_revenue by finance-team@acme.com", "Info", "192.168.1.20"),
                ("pipeline.failed", "pipeline", "Pipeline 'Orders Ingestion' failed — schema_drift detected on column shipping_method", "Critical", "10.0.1.42"),
                ("contract.violation", "governance", "Data contract 'core.fct_daily_sales' violated: null_rate exceeded 5% threshold", "Critical", "10.0.0.1"),
                ("user.api_key_created", "auth", "New API key generated for CI/CD integration (prefix: dfk_8a3e...)", "Warning", "10.0.1.42"),
                ("security.suspicious_login", "auth", "Multiple failed login attempts from 185.234.12.45 (blocked after 5 attempts)", "Critical", "185.234.12.45"),
                ("pipeline.succeeded", "pipeline", "Pipeline 'Silver Layer Transform' completed — 2.1M rows processed in 340s", "Info", "10.0.1.42"),
                ("connection.test", "connection", "Connection health check passed for Snowflake warehouse 'ANALYTICS_WH'", "Info", "10.0.1.42"),
            ]
            for i, (action, resource, desc, severity, ip) in enumerate(security_events):
                log = AuditLog(
                    action=action,
                    resource_type=resource,
                    details={"description": desc, "severity": severity},
                    user_id=user_id,
                    workspace_id=workspace.id,
                    ip_address=ip,
                    created_at=now - timedelta(hours=i * 2, minutes=random.randint(0, 59))
                )
                session.add(log)
            print("  ✅ Seeded 12 security audit logs")
        else:
            print("  ⏭ Security logs already exist")

        # =====================================================================
        # 2. APPROVAL REQUESTS (for /approvals)
        # =====================================================================
        existing_approvals = await session.execute(select(func.count(ApprovalRequest.id)))
        if existing_approvals.scalar() < 2:
            approvals_data = [
                {
                    "request_type": "schema_migration",
                    "resource_type": "pipeline",
                    "resource_id": "E-Commerce Silver Layer",
                    "requested_by": "DataFlow Autopilot",
                    "change_description": "AI detected upstream schema evolution: column 'shipping_method' added to raw.orders. Proposing ALTER TABLE migration to add column to silver.stg_orders with DEFAULT 'standard'.",
                    "diff": "@@ models/staging/stg_orders.sql @@\n- SELECT order_id, customer_id, amount\n+ SELECT order_id, customer_id, amount,\n+   COALESCE(shipping_method, 'standard') as shipping_method\n  FROM {{ source('raw', 'orders') }}",
                    "status": "pending",
                },
                {
                    "request_type": "auto_heal",
                    "resource_type": "pipeline",
                    "resource_id": "Customer Churn Model",
                    "requested_by": "DataFlow Autopilot",
                    "change_description": "Pipeline failed 3 consecutive runs due to NULL constraint violation on user_id. AI proposes adding COALESCE wrapper and incrementing run retry to 2.",
                    "diff": "@@ models/marts/fct_churn_signals.sql @@\n- WHERE u.user_id IS NOT NULL\n+ WHERE COALESCE(u.user_id, s.fallback_user_id) IS NOT NULL\n+ -- Auto-Heal: fallback to session-level user resolution",
                    "status": "pending",
                },
                {
                    "request_type": "materialization_change",
                    "resource_type": "model",
                    "resource_id": "dim_users",
                    "requested_by": "DataFlow Autopilot",
                    "change_description": "Usage pattern analysis shows dim_users is queried 847 times/day with full table scans. Recommending change from 'table' to 'incremental' materialization to reduce Snowflake compute by ~$180/month.",
                    "diff": "@@ models/marts/core/dim_users.sql @@\n- {{ config(materialized='table') }}\n+ {{ config(\n+     materialized='incremental',\n+     unique_key='user_id',\n+     on_schema_change='sync_all_columns'\n+ ) }}",
                    "status": "pending",
                }
            ]
            for i, a in enumerate(approvals_data):
                session.add(ApprovalRequest(
                    workspace_id=workspace.id,
                    request_type=a["request_type"],
                    resource_type=a["resource_type"],
                    resource_id=a["resource_id"],
                    requested_by=a["requested_by"],
                    change_description=a["change_description"],
                    diff=a["diff"],
                    status=a["status"],
                    created_at=now - timedelta(hours=i * 4 + 1)
                ))
            print("  ✅ Seeded 3 approval requests")
        else:
            print("  ⏭ Approval requests already exist")

        # =====================================================================
        # 3. DATA CATALOG ENTRIES (for /catalog)
        # =====================================================================
        existing_catalog = await session.execute(select(func.count(DataCatalog.id)))
        if existing_catalog.scalar() < 3:
            catalog_entries = [
                {"table_name": "raw.stripe_events", "schema_name": "raw", "layer": "bronze", "description": "Raw Stripe webhook events including payments, refunds, and subscription changes", "classification": "PII", "tags": ["finance", "stripe", "pii"], "quality_score": 72.5, "row_count": 8400000, "size_bytes": 2147483648},
                {"table_name": "raw.salesforce_accounts", "schema_name": "raw", "layer": "bronze", "description": "CRM account records synced from Salesforce every 6 hours", "classification": "PII", "tags": ["crm", "salesforce"], "quality_score": 88.0, "row_count": 1200000, "size_bytes": 524288000},
                {"table_name": "silver.stg_orders", "schema_name": "silver", "layer": "silver", "description": "Cleaned and deduplicated order records with standardized currencies and timestamps", "classification": "Internal", "tags": ["orders", "ecommerce"], "quality_score": 95.2, "row_count": 14200000, "size_bytes": 4294967296},
                {"table_name": "silver.stg_users", "schema_name": "silver", "layer": "silver", "description": "Unified user profiles merged from auth0 and CRM sources with PII masked", "classification": "Internal", "tags": ["users", "identity"], "quality_score": 97.1, "row_count": 3400000, "size_bytes": 1073741824},
                {"table_name": "gold.fct_revenue", "schema_name": "gold", "layer": "gold", "description": "Daily aggregated revenue metrics including MRR, ARR, and net new revenue", "classification": "Confidential", "tags": ["finance", "kpi", "executive"], "quality_score": 99.8, "row_count": 365000, "size_bytes": 134217728},
                {"table_name": "gold.fct_daily_sales", "schema_name": "gold", "layer": "gold", "description": "Transaction-level sales data aggregated by day, region, and product category", "classification": "Confidential", "tags": ["sales", "analytics"], "quality_score": 98.5, "row_count": 2190000, "size_bytes": 536870912},
                {"table_name": "gold.dim_customers", "schema_name": "gold", "layer": "gold", "description": "Type 2 slowly-changing dimension for customer attributes with full history", "classification": "Internal", "tags": ["customers", "scd2"], "quality_score": 96.3, "row_count": 4800000, "size_bytes": 2147483648},
                {"table_name": "gold.dim_products", "schema_name": "gold", "layer": "gold", "description": "Product catalog with pricing tiers, active flags, and category hierarchies", "classification": "Public", "tags": ["products", "catalog"], "quality_score": 99.0, "row_count": 450000, "size_bytes": 67108864},
            ]
            for entry in catalog_entries:
                session.add(DataCatalog(
                    workspace_id=workspace.id,
                    table_name=entry["table_name"],
                    schema_name=entry["schema_name"],
                    layer=entry["layer"],
                    description=entry["description"],
                    classification=entry["classification"],
                    tags=entry["tags"],
                    quality_score=entry["quality_score"],
                    row_count=entry["row_count"],
                    size_bytes=entry["size_bytes"],
                    last_refreshed_at=now - timedelta(minutes=random.randint(5, 120)),
                ))
            print("  ✅ Seeded 8 data catalog entries")
        else:
            print("  ⏭ Catalog entries already exist")

        # =====================================================================
        # 4. DASHBOARDS (for /dashboards)
        # =====================================================================
        existing_dashboards = await session.execute(select(func.count(Dashboard.id)))
        if existing_dashboards.scalar() < 2:
            dashboards_data = [
                {"name": "Executive Revenue Overview", "description": "Real-time MRR, ARR, and customer cohort trends for the C-suite", "is_public": False},
                {"name": "Data Pipeline Health", "description": "Operational dashboard tracking pipeline SLAs, failure rates, and data freshness", "is_public": True},
                {"name": "Marketing Attribution", "description": "Campaign performance metrics with multi-touch attribution modeling", "is_public": False},
                {"name": "Cost & Infrastructure", "description": "Snowflake compute credits, storage growth, and optimization opportunities", "is_public": True},
            ]
            for d in dashboards_data:
                dashboard = Dashboard(
                    name=d["name"],
                    description=d["description"],
                    is_public=d["is_public"],
                    layout={"gridCols": 12},
                    created_at=now - timedelta(days=random.randint(1, 30)),
                    updated_at=now - timedelta(hours=random.randint(1, 48)),
                )
                session.add(dashboard)
            print("  ✅ Seeded 4 dashboards")
        else:
            print("  ⏭ Dashboards already exist")

        await session.commit()
        print("\n🎉 Comprehensive seed completed!")


if __name__ == "__main__":
    asyncio.run(seed())
