"""Connection service — test connections, discover schemas, health checks."""

import asyncio
import re
import time
from typing import Optional, Any
from datetime import datetime, timezone

import asyncpg

from schemas import ConnectionTestResult


class ConnectionService:
    """Business logic for managing data source connections."""

    async def test_connection(self, connector_type: str, config: dict) -> ConnectionTestResult:
        """Test if a connection is reachable."""
        if connector_type == "postgresql":
            return await self._test_postgresql(config)
        return ConnectionTestResult(
            success=False,
            message=f"Connector type '{connector_type}' is not yet supported.",
        )

    async def discover_schema(self, connector_type: str, config: dict) -> dict:
        """Discover schema from a data source."""
        if connector_type == "postgresql":
            return await self._discover_postgresql(config)
        raise ValueError(f"Connector type '{connector_type}' is not yet supported.")

    # ── PostgreSQL ────────────────────────────────────────────────────

    async def _test_postgresql(self, config: dict) -> ConnectionTestResult:
        start = time.time()
        try:
            conn = await asyncpg.connect(
                host=config.get("host", "localhost"),
                port=int(config.get("port", 5432)),
                database=config.get("database", "postgres"),
                user=config.get("username", "postgres"),
                password=config.get("password", ""),
                timeout=10,
            )
            version = await conn.fetchval("SELECT version()")
            await conn.close()
            latency = round((time.time() - start) * 1000, 2)
            return ConnectionTestResult(
                success=True,
                message=f"Connected successfully. {version}",
                latency_ms=latency,
            )
        except Exception as e:
            return ConnectionTestResult(
                success=False,
                message=f"Connection failed: {str(e)}",
            )

    async def _discover_postgresql(self, config: dict) -> dict:
        """Full schema discovery with profiling for PostgreSQL."""
        conn = await asyncpg.connect(
            host=config.get("host", "localhost"),
            port=int(config.get("port", 5432)),
            database=config.get("database", "postgres"),
            user=config.get("username", "postgres"),
            password=config.get("password", ""),
        )

        schema_name = config.get("schema", "public")

        try:
            # 1. Get all tables with row counts
            tables_query = """
                SELECT 
                    t.table_name,
                    (SELECT reltuples::bigint FROM pg_class WHERE relname = t.table_name) as approx_row_count
                FROM information_schema.tables t
                WHERE t.table_schema = $1
                AND t.table_type = 'BASE TABLE'
                ORDER BY t.table_name
            """
            tables = await conn.fetch(tables_query, schema_name)

            # 2. Get all columns
            columns_query = """
                SELECT 
                    c.table_name,
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    c.column_default,
                    c.character_maximum_length,
                    c.numeric_precision,
                    c.numeric_scale,
                    c.ordinal_position
                FROM information_schema.columns c
                WHERE c.table_schema = $1
                ORDER BY c.table_name, c.ordinal_position
            """
            columns = await conn.fetch(columns_query, schema_name)

            # 3. Get primary keys
            pk_query = """
                SELECT 
                    kcu.table_name, 
                    kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_schema = $1
            """
            pks = await conn.fetch(pk_query, schema_name)
            pk_set = {(row["table_name"], row["column_name"]) for row in pks}

            # 4. Get foreign keys
            fk_query = """
                SELECT 
                    kcu.table_name as source_table,
                    kcu.column_name as source_column,
                    ccu.table_name as target_table,
                    ccu.column_name as target_column
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = $1
            """
            fks = await conn.fetch(fk_query, schema_name)
            fk_map: dict[tuple, str] = {}
            relationships = []
            for fk in fks:
                fk_map[(fk["source_table"], fk["source_column"])] = f"{fk['target_table']}.{fk['target_column']}"
                relationships.append({
                    "source_table": fk["source_table"],
                    "source_column": fk["source_column"],
                    "target_table": fk["target_table"],
                    "target_column": fk["target_column"],
                    "type": "explicit_fk",
                })

            # 5. Build result with profiling
            table_results = []
            columns_by_table: dict[str, list] = {}
            for col in columns:
                columns_by_table.setdefault(col["table_name"], []).append(col)

            for table_row in tables:
                table_name = table_row["table_name"]
                row_count = max(int(table_row["approx_row_count"] or 0), 0)
                table_cols = columns_by_table.get(table_name, [])

                col_results = []
                for col in table_cols:
                    col_name = col["column_name"]
                    is_pk = (table_name, col_name) in pk_set
                    is_fk = (table_name, col_name) in fk_map
                    fk_ref = fk_map.get((table_name, col_name))

                    # Basic profiling: sample values, null rate, distinct count
                    profile = await self._profile_column(
                        conn, schema_name, table_name, col_name, col["data_type"], row_count
                    )

                    # PII detection (rule-based)
                    pii_class = self._detect_pii(col_name, col["data_type"], profile.get("sample_values", []))

                    col_results.append({
                        "column_name": col_name,
                        "data_type": col["data_type"],
                        "is_nullable": col["is_nullable"] == "YES",
                        "is_primary_key": is_pk,
                        "is_foreign_key": is_fk,
                        "foreign_key_ref": fk_ref,
                        "default_value": col["column_default"],
                        "sample_values": profile.get("sample_values", []),
                        "null_rate": profile.get("null_rate"),
                        "distinct_count": profile.get("distinct_count"),
                        "description": None,
                        "pii_classification": pii_class,
                    })

                table_results.append({
                    "table_name": table_name,
                    "schema_name": schema_name,
                    "row_count": row_count,
                    "columns": col_results,
                })

            return {
                "tables": table_results,
                "relationships": relationships,
                "discovered_at": datetime.now(timezone.utc).isoformat(),
                "source_type": "postgresql",
            }
        finally:
            await conn.close()

    async def _profile_column(
        self, conn, schema: str, table: str, column: str, data_type: str, row_count: int
    ) -> dict:
        """Profile a single column — sample values, null rate, distinct count."""
        profile: dict[str, Any] = {}
        try:
            # Sample values (limit 5)
            sample_q = f'SELECT DISTINCT "{column}" FROM "{schema}"."{table}" WHERE "{column}" IS NOT NULL LIMIT 5'
            samples = await conn.fetch(sample_q)
            profile["sample_values"] = [str(row[column]) for row in samples]

            if row_count > 0:
                # Null rate
                null_q = f'SELECT COUNT(*) FILTER (WHERE "{column}" IS NULL) * 100.0 / COUNT(*) FROM "{schema}"."{table}"'
                null_rate = await conn.fetchval(null_q)
                profile["null_rate"] = round(float(null_rate or 0), 2)

                # Distinct count
                distinct_q = f'SELECT COUNT(DISTINCT "{column}") FROM "{schema}"."{table}"'
                distinct = await conn.fetchval(distinct_q)
                profile["distinct_count"] = int(distinct or 0)
        except Exception:
            pass  # Non-critical profiling errors
        return profile

    def _detect_pii(self, column_name: str, data_type: str, sample_values: list[str]) -> Optional[str]:
        """Rule-based PII detection."""
        name_lower = column_name.lower()

        # Name-based checks
        if any(pat in name_lower for pat in ["email", "e_mail"]):
            return "PII"
        if any(pat in name_lower for pat in ["ssn", "social_security"]):
            return "PII"
        if any(pat in name_lower for pat in ["phone", "mobile", "cell"]):
            return "PII"
        if any(pat in name_lower for pat in ["address", "street", "zip_code", "postal"]):
            return "PII"
        if any(pat in name_lower for pat in ["first_name", "last_name", "full_name"]):
            return "PII"
        if any(pat in name_lower for pat in ["credit_card", "card_number", "cvv"]):
            return "financial"
        if any(pat in name_lower for pat in ["password", "secret", "token", "api_key"]):
            return "credentials"

        # Pattern-based checks on samples
        email_pattern = re.compile(r'^[\w.+-]+@[\w-]+\.[\w.]+$')
        phone_pattern = re.compile(r'^[\+]?[\d\-\(\)\s]{7,15}$')

        for val in sample_values:
            if email_pattern.match(val):
                return "PII"
            if phone_pattern.match(val):
                return "PII"

        return None
