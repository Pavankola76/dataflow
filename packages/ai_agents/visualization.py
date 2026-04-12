"""Visualization Agent — Auto-selects chart type and config from query results."""

import json


class VisualizationAgent:
    """Determines the best chart type and configuration for query results."""

    CHART_RULES = [
        # (condition_fn, chart_type, description)
    ]

    @classmethod
    def select_chart(cls, columns: list, data: list, row_count: int) -> dict:
        """Analyze query results and pick the optimal visualization.

        Args:
            columns: List of column metadata dicts with 'name' and 'type'.
            data: First 100 rows of result data.
            row_count: Total row count.

        Returns:
            Chart config dict with type, axes, colors.
        """
        col_names = [c["name"] if isinstance(c, dict) else c for c in columns]
        num_cols = len(col_names)

        if row_count == 0:
            return {"chart_type": "empty", "message": "No data to visualize"}

        # Single value → big number card
        if row_count == 1 and num_cols == 1:
            return {
                "chart_type": "metric_card",
                "config": {"value_key": col_names[0], "title": col_names[0].replace("_", " ").title()},
            }

        # Detect column types heuristically
        date_cols = [c for c in col_names if any(kw in c.lower() for kw in ["date", "time", "month", "year", "quarter", "week", "day"])]
        numeric_cols = []
        categorical_cols = []

        if data:
            for col in col_names:
                sample = [row[col_names.index(col)] if isinstance(row, (list, tuple)) else row.get(col) for row in data[:10]]
                sample = [v for v in sample if v is not None]
                if sample and all(isinstance(v, (int, float)) for v in sample):
                    numeric_cols.append(col)
                else:
                    if col not in date_cols:
                        categorical_cols.append(col)

        # 1 date + 1 numeric → line chart
        if date_cols and numeric_cols:
            return {
                "chart_type": "line",
                "config": {
                    "xAxisKey": date_cols[0],
                    "yAxisKey": numeric_cols[0],
                    "color": "#6366f1",
                    "title": f"{numeric_cols[0].replace('_', ' ').title()} over Time",
                },
            }

        # 1 categorical + 1 numeric → bar chart
        if categorical_cols and numeric_cols:
            distinct_values = len(set(
                row[col_names.index(categorical_cols[0])] if isinstance(row, (list, tuple))
                else row.get(categorical_cols[0])
                for row in data[:100]
            ))

            # Pie chart for low cardinality
            if distinct_values <= 6 and len(numeric_cols) == 1:
                return {
                    "chart_type": "pie",
                    "config": {
                        "nameKey": categorical_cols[0],
                        "valueKey": numeric_cols[0],
                        "title": f"{numeric_cols[0].replace('_', ' ').title()} by {categorical_cols[0].replace('_', ' ').title()}",
                    },
                }

            return {
                "chart_type": "bar",
                "config": {
                    "xAxisKey": categorical_cols[0],
                    "yAxisKey": numeric_cols[0],
                    "color": "#10b981",
                    "title": f"{numeric_cols[0].replace('_', ' ').title()} by {categorical_cols[0].replace('_', ' ').title()}",
                },
            }

        # 2 numerics → scatter
        if len(numeric_cols) >= 2:
            return {
                "chart_type": "scatter",
                "config": {
                    "xAxisKey": numeric_cols[0],
                    "yAxisKey": numeric_cols[1],
                    "color": "#f59e0b",
                    "title": f"{numeric_cols[0].replace('_', ' ').title()} vs {numeric_cols[1].replace('_', ' ').title()}",
                },
            }

        # Fallback → table
        return {
            "chart_type": "table",
            "config": {"columns": col_names, "title": "Query Results"},
        }
