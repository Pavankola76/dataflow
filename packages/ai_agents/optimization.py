"""Optimization Agent — Cost optimization and performance recommendations."""


class OptimizationAgent:
    """Analyzes pipeline and query patterns to suggest cost/performance improvements."""

    @classmethod
    def analyze_pipeline_efficiency(cls, pipeline_stats: dict) -> list:
        """Generate optimization suggestions for a pipeline.

        Args:
            pipeline_stats: Dict with keys: total_rows, changed_rows, materialization, refresh_interval_hours,
                            avg_duration_seconds, monthly_cost.

        Returns:
            List of suggestion dicts.
        """
        suggestions = []
        total = pipeline_stats.get("total_rows", 0)
        changed = pipeline_stats.get("changed_rows", 0)
        materialization = pipeline_stats.get("materialization", "full")
        refresh_hours = pipeline_stats.get("refresh_interval_hours", 1)
        monthly_cost = pipeline_stats.get("monthly_cost", 0)

        # Full refresh with low change rate → switch to incremental
        if materialization == "full" and total > 0:
            change_rate = changed / max(total, 1)
            if change_rate < 0.1:
                savings = round(monthly_cost * 0.9, 2)
                suggestions.append({
                    "type": "switch_to_incremental",
                    "title": "Switch to incremental materialization",
                    "description": f"Only {change_rate:.1%} of rows change per run. Incremental would save ~{savings} USD/month.",
                    "estimated_savings": savings,
                    "confidence": 0.85,
                    "priority": "high",
                })

        # Over-refreshed → reduce frequency
        if refresh_hours < 6 and total > 0:
            change_per_hour = changed / max(refresh_hours, 1)
            if change_per_hour < 100:
                suggestions.append({
                    "type": "reduce_refresh_frequency",
                    "title": "Reduce refresh frequency",
                    "description": f"Only ~{int(change_per_hour)} rows change per hour. Consider 12-hour or daily refresh.",
                    "estimated_savings": round(monthly_cost * 0.5, 2),
                    "confidence": 0.7,
                    "priority": "medium",
                })

        return suggestions

    @classmethod
    def analyze_query_cost(cls, query_stats: dict) -> list:
        """Generate optimization suggestions for analytical queries.

        Args:
            query_stats: Dict with keys: bytes_scanned, execution_time_ms, result_rows, table_names, has_partition_filter.
        """
        suggestions = []
        bytes_scanned = query_stats.get("bytes_scanned", 0)
        exec_time = query_stats.get("execution_time_ms", 0)
        has_filter = query_stats.get("has_partition_filter", True)

        # Full table scan warning
        if not has_filter and bytes_scanned > 100_000_000:  # 100MB
            suggestions.append({
                "type": "add_partition_filter",
                "title": "Add partition filter to reduce scan",
                "description": f"Query scanned {bytes_scanned / 1e9:.1f}GB without a partition filter. Add a date filter to reduce cost.",
                "confidence": 0.9,
                "priority": "high",
            })

        # Slow queries that could use DuckDB
        if exec_time > 5000 and bytes_scanned < 100_000_000:
            suggestions.append({
                "type": "use_duckdb",
                "title": "Route to DuckDB for faster execution",
                "description": "This query scans < 100MB and could run in-process via DuckDB in < 100ms.",
                "confidence": 0.8,
                "priority": "medium",
            })

        # Suggest materializing common aggregates
        if query_stats.get("execution_count", 0) > 10:
            suggestions.append({
                "type": "create_aggregate_table",
                "title": "Create pre-computed aggregate table",
                "description": f"This query has been run {query_stats['execution_count']} times. Pre-computing would save repeated warehouse costs.",
                "confidence": 0.75,
                "priority": "medium",
            })

        return suggestions

    @classmethod
    async def generate_dynamic_recommendations(cls, cost_metrics: list) -> list:
        """Generate optimization suggestions dynamically using an LLM."""
        fallback = [
            {
                "id": "opt_001",
                "type": "Query Optimization",
                "impact": "$442/mo savings",
                "resource": "core.fct_daily_sales",
                "description": "Detected daily full table scan on `transactions` table containing 4.2B rows. Suggest adding incremental clustering keys.",
                "sql_suggestion": "ALTER TABLE raw.transactions CLUSTER BY (transaction_date);"
            },
            {
                "id": "opt_002",
                "type": "Idle Warehouse",
                "impact": "$180/mo savings",
                "resource": "reporting_xs_wh",
                "description": "Warehouse is currently configured with 10 minute auto-suspend. 98% of queries complete in <2s.",
                "sql_suggestion": "ALTER WAREHOUSE reporting_xs_wh SET AUTO_SUSPEND = 60;"
            },
            {
                "id": "opt_003",
                "type": "Materialized View",
                "impact": "$125/mo savings",
                "resource": "marketing.campaign_roi",
                "description": "Exploding JOINs calculating distinct users 45 times per day. Pre-aggregating into a Materialized View will reduce compute.",
                "sql_suggestion": "CREATE MATERIALIZED VIEW marketing.campaign_roi_mv AS\\nSELECT campaign_id, COUNT(DISTINCT user_id) as unique_clicks\\nFROM raw.clicks GROUP BY 1;"
            }
        ]
        
        try:
            from packages.ai_agents.text_to_sql import get_llm
            from langchain_core.prompts import PromptTemplate
            import json
            import re
            
            llm = get_llm()
            metrics_str = json.dumps(cost_metrics, indent=2)
            
            prompt = PromptTemplate.from_template('''
            You are an expert Data Engineer and FinOps Analyst.
            Here are the daily pipeline execution costs for the last 7 days in USD:
            {metrics_str}

            Analyze these costs and generate EXACTLY 3 realistic actionable cost optimization recommendations.
            Format your output strictly as a valid JSON array of objects with these exact keys:
            - id (string, e.g. "opt_001")
            - type (string, e.g. "Query Optimization", "Idle Warehouse", "Materialized View", "Incremental Strategy")
            - impact (string, e.g. "$442/mo savings")
            - resource (string, e.g. "core.fct_daily_sales" or "reporting_wh")
            - description (string, clearly explaining the logic and how much it would save)
            - sql_suggestion (string, a valid SQL, DuckDB, or Snowflake command to apply the fix)

            OUTPUT FORMAT:
            ```json
            [
              {{ ... }}
            ]
            ```
            ''')
            
            chain = prompt | llm
            response = await chain.ainvoke({"metrics_str": metrics_str})
            
            content = response.content
            # Extract JSON array
            match = re.search(r'\[\s*\{.*?\}\s*\]', content, re.DOTALL)
            if match:
                json_str = match.group(0)
                return json.loads(json_str)
            else:
                return fallback
                
        except Exception as e:
            print(f"Failed to generate dynamic optimizations: {e}")
            return fallback
