"""Transformation Service — Silver/Gold layer builder using DuckDB.

Bronze → Silver: Deduplication, null handling, type normalization, trimming
Silver → Gold: Business aggregations, summary tables, KPI materialization
"""

import os
import json
import logging
import duckdb
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class TransformationService:
    """Builds Silver (cleaned) and Gold (aggregated) layers from Bronze parquet data."""

    @staticmethod
    async def run_transformations(
        pipeline_id: str,
        run_id: str,
        bronze_path: str,
        extracted_tables: list[str],
    ) -> dict:
        """Execute Silver then Gold transformations on all extracted tables.
        
        Returns metadata dict with counts for catalog population.
        """
        silver_path = bronze_path.replace("/lake/", "/lake_silver/")
        gold_path = bronze_path.replace("/lake/", "/lake_gold/")
        os.makedirs(silver_path, exist_ok=True)
        os.makedirs(gold_path, exist_ok=True)

        conn = duckdb.connect()
        silver_tables = 0
        gold_tables = 0
        total_silver_rows = 0
        total_gold_rows = 0

        for table in extracted_tables:
            bronze_file = os.path.join(bronze_path, table, "part-00000.parquet")
            if not os.path.exists(bronze_file):
                logger.warning(f"Skipping Silver for '{table}': no Bronze parquet found")
                continue

            # ── Silver Layer ─────────────────────────────────────────
            try:
                silver_table_dir = os.path.join(silver_path, table)
                os.makedirs(silver_table_dir, exist_ok=True)
                silver_file = os.path.join(silver_table_dir, "part-00000.parquet")

                # Read schema to build dynamic cleaning SQL
                columns_meta = conn.execute(
                    f"DESCRIBE SELECT * FROM '{bronze_file}'"
                ).fetchall()
                col_names = [row[0] for row in columns_meta]
                col_types = {row[0]: row[1] for row in columns_meta}

                # Build cleaning expressions per column
                clean_exprs = []
                for col in col_names:
                    dtype = col_types[col].upper()
                    if "VARCHAR" in dtype or "TEXT" in dtype:
                        # Trim whitespace and normalize empty strings to NULL
                        clean_exprs.append(
                            f"CASE WHEN TRIM({col}) = '' THEN NULL ELSE TRIM({col}) END AS {col}"
                        )
                    elif "TIMESTAMP" in dtype or "DATE" in dtype:
                        # Keep as-is but coalesce invalid dates
                        clean_exprs.append(f"{col}")
                    else:
                        clean_exprs.append(f"{col}")

                select_clause = ", ".join(clean_exprs)

                # Deduplicate by taking distinct rows
                silver_sql = f"""
                    COPY (
                        SELECT DISTINCT {select_clause}
                        FROM '{bronze_file}'
                    ) TO '{silver_file}' (FORMAT PARQUET, COMPRESSION ZSTD)
                """
                conn.execute(silver_sql)

                row_count = conn.execute(
                    f"SELECT COUNT(*) FROM '{silver_file}'"
                ).fetchone()[0]
                total_silver_rows += row_count
                silver_tables += 1
                logger.info(
                    f"✨ Silver: '{table}' — {row_count} clean rows written"
                )

            except Exception as e:
                logger.error(f"Silver transform failed for '{table}': {e}")

        # ── Gold Layer ───────────────────────────────────────────
        # Build smart aggregations based on what tables exist
        try:
            gold_aggregations = TransformationService._generate_gold_models(
                conn, silver_path, extracted_tables
            )
            for model_name, model_sql, source_file in gold_aggregations:
                gold_table_dir = os.path.join(gold_path, model_name)
                os.makedirs(gold_table_dir, exist_ok=True)
                gold_file = os.path.join(gold_table_dir, "part-00000.parquet")

                try:
                    full_sql = f"""
                        COPY (
                            {model_sql}
                        ) TO '{gold_file}' (FORMAT PARQUET, COMPRESSION ZSTD)
                    """
                    conn.execute(full_sql)
                    row_count = conn.execute(
                        f"SELECT COUNT(*) FROM '{gold_file}'"
                    ).fetchone()[0]
                    total_gold_rows += row_count
                    gold_tables += 1
                    logger.info(
                        f"🏆 Gold: '{model_name}' — {row_count} aggregated rows"
                    )
                except Exception as e:
                    logger.error(f"Gold model '{model_name}' failed: {e}")

        except Exception as e:
            logger.error(f"Gold model generation failed: {e}")

        conn.close()

        # Write transformation metadata
        meta = {
            "silver_tables": silver_tables,
            "gold_tables": gold_tables,
            "total_silver_rows": total_silver_rows,
            "total_gold_rows": total_gold_rows,
            "silver_path": silver_path,
            "gold_path": gold_path,
            "transformed_at": datetime.now(timezone.utc).isoformat(),
        }
        meta_file = os.path.join(silver_path, "_transform_metadata.json")
        with open(meta_file, "w") as f:
            json.dump(meta, f, indent=2)

        logger.info(
            f"Transformation complete: {silver_tables} Silver, {gold_tables} Gold tables"
        )
        return meta

    @staticmethod
    def _generate_gold_models(
        conn: duckdb.DuckDBPyConnection,
        silver_path: str,
        tables: list[str],
    ) -> list[tuple[str, str, str]]:
        """Auto-generate Gold aggregation SQL based on available Silver tables.
        
        Returns list of (model_name, sql_query, source_file) tuples.
        """
        models = []
        table_set = {t.lower() for t in tables}

        # Pattern: If 'orders' table exists, build revenue summary
        if "orders" in table_set:
            orders_file = os.path.join(silver_path, "orders", "part-00000.parquet")
            if os.path.exists(orders_file):
                models.append((
                    "revenue_summary",
                    f"""
                    SELECT 
                        COALESCE(status, 'unknown') AS order_status,
                        COUNT(*) AS order_count,
                        COALESCE(SUM(CAST(total_amount AS DOUBLE)), 0) AS total_revenue,
                        COALESCE(AVG(CAST(total_amount AS DOUBLE)), 0) AS avg_order_value,
                        MIN(created_at) AS first_order,
                        MAX(created_at) AS last_order
                    FROM '{orders_file}'
                    GROUP BY COALESCE(status, 'unknown')
                    """,
                    orders_file,
                ))

        # Pattern: If 'customers' table exists, build customer profile
        if "customers" in table_set:
            customers_file = os.path.join(
                silver_path, "customers", "part-00000.parquet"
            )
            if os.path.exists(customers_file):
                models.append((
                    "customer_profile_summary",
                    f"""
                    SELECT 
                        COUNT(*) AS total_customers,
                        COUNT(DISTINCT email) AS unique_emails,
                        MIN(created_at) AS earliest_customer,
                        MAX(created_at) AS latest_customer
                    FROM '{customers_file}'
                    """,
                    customers_file,
                ))

        # Pattern: If 'products' table exists, build product catalog summary
        if "products" in table_set:
            products_file = os.path.join(
                silver_path, "products", "part-00000.parquet"
            )
            if os.path.exists(products_file):
                models.append((
                    "product_catalog_summary",
                    f"""
                    SELECT 
                        COUNT(*) AS total_products,
                        COALESCE(AVG(CAST(price AS DOUBLE)), 0) AS avg_price,
                        COALESCE(MIN(CAST(price AS DOUBLE)), 0) AS min_price,
                        COALESCE(MAX(CAST(price AS DOUBLE)), 0) AS max_price
                    FROM '{products_file}'
                    """,
                    products_file,
                ))

        # Pattern: If both 'orders' and 'order_items' exist, build item-level analytics
        if "orders" in table_set and "order_items" in table_set:
            orders_file = os.path.join(silver_path, "orders", "part-00000.parquet")
            items_file = os.path.join(
                silver_path, "order_items", "part-00000.parquet"
            )
            if os.path.exists(orders_file) and os.path.exists(items_file):
                models.append((
                    "order_item_analytics",
                    f"""
                    SELECT 
                        o.status AS order_status,
                        COUNT(DISTINCT o.id) AS num_orders,
                        COUNT(oi.id) AS num_items,
                        COALESCE(SUM(CAST(oi.quantity AS DOUBLE) * CAST(oi.unit_price AS DOUBLE)), 0) AS total_item_revenue
                    FROM '{orders_file}' o
                    JOIN '{items_file}' oi ON o.id = oi.order_id
                    GROUP BY o.status
                    """,
                    items_file,
                ))

        # Generic fallback: for any table without a specific model, create a row-count summary
        for table in tables:
            if table.lower() not in {"orders", "customers", "products", "order_items"}:
                table_file = os.path.join(
                    silver_path, table, "part-00000.parquet"
                )
                if os.path.exists(table_file):
                    models.append((
                        f"{table}_summary",
                        f"""
                        SELECT 
                            '{table}' AS table_name,
                            COUNT(*) AS total_rows
                        FROM '{table_file}'
                        """,
                        table_file,
                    ))

        return models
