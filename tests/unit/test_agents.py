"""Unit tests for AI agents."""

import pytest
import sys
import os

# Add the packages directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../packages"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../apps/api"))


class TestSchemaDiscoveryAgent:
    def test_classify_column_email(self):
        from ai_agents.schema_discovery import SchemaDiscoveryAgent
        result = SchemaDiscoveryAgent.classify_column("user_email", ["test@example.com", "foo@bar.com"])
        assert result["classification"] == "PII"

    def test_classify_column_ssn_by_name(self):
        from ai_agents.schema_discovery import SchemaDiscoveryAgent
        result = SchemaDiscoveryAgent.classify_column("social_security_number", [])
        assert result["classification"] == "PII"
        assert result["confidence"] >= 0.8

    def test_classify_column_no_pii(self):
        from ai_agents.schema_discovery import SchemaDiscoveryAgent
        result = SchemaDiscoveryAgent.classify_column("product_name", ["Widget A", "Gadget B"])
        assert result["classification"] == "none"

    def test_profile_column_numeric(self):
        from ai_agents.schema_discovery import SchemaDiscoveryAgent
        result = SchemaDiscoveryAgent.profile_column("price", [10.0, 20.0, None, 30.0, 40.0])
        assert result["null_rate"] == 0.2
        assert result["distinct_count"] == 4
        assert result["min"] == 10.0
        assert result["max"] == 40.0

    def test_infer_relationships(self):
        from ai_agents.schema_discovery import SchemaDiscoveryAgent
        schema = {
            "orders": [{"name": "id"}, {"name": "customer_id"}, {"name": "product_id"}],
            "customers": [{"name": "id"}, {"name": "name"}],
            "products": [{"name": "id"}, {"name": "title"}],
        }
        rels = SchemaDiscoveryAgent.infer_relationships(schema)
        assert len(rels) >= 2
        tables_referenced = {r["target_table"] for r in rels}
        assert "customers" in tables_referenced
        assert "products" in tables_referenced


class TestVisualizationAgent:
    def test_single_metric(self):
        from ai_agents.visualization import VisualizationAgent
        result = VisualizationAgent.select_chart(["total_revenue"], [[1250000]], 1)
        assert result["chart_type"] == "metric_card"

    def test_date_numeric_gives_line(self):
        from ai_agents.visualization import VisualizationAgent
        data = [["2024-01", 100], ["2024-02", 200], ["2024-03", 300]]
        result = VisualizationAgent.select_chart(["month", "revenue"], data, 3)
        assert result["chart_type"] == "line"

    def test_categorical_numeric_gives_bar(self):
        from ai_agents.visualization import VisualizationAgent
        data = [["US", 500], ["UK", 300], ["DE", 200], ["FR", 150], ["JP", 100], ["BR", 80], ["CN", 70], ["IN", 60]]
        result = VisualizationAgent.select_chart(["country", "sales"], data, 8)
        assert result["chart_type"] == "bar"

    def test_low_cardinality_gives_pie(self):
        from ai_agents.visualization import VisualizationAgent
        data = [["Free", 500], ["Pro", 300], ["Enterprise", 100]]
        result = VisualizationAgent.select_chart(["plan", "users"], data, 3)
        assert result["chart_type"] == "pie"

    def test_empty_data(self):
        from ai_agents.visualization import VisualizationAgent
        result = VisualizationAgent.select_chart([], [], 0)
        assert result["chart_type"] == "empty"


class TestOptimizationAgent:
    def test_suggest_incremental(self):
        from ai_agents.optimization import OptimizationAgent
        suggestions = OptimizationAgent.analyze_pipeline_efficiency({
            "total_rows": 1_000_000,
            "changed_rows": 5_000,
            "materialization": "full",
            "refresh_interval_hours": 1,
            "monthly_cost": 100,
        })
        types = [s["type"] for s in suggestions]
        assert "switch_to_incremental" in types

    def test_no_suggestions_for_efficient_pipeline(self):
        from ai_agents.optimization import OptimizationAgent
        suggestions = OptimizationAgent.analyze_pipeline_efficiency({
            "total_rows": 1000,
            "changed_rows": 900,
            "materialization": "incremental",
            "refresh_interval_hours": 24,
            "monthly_cost": 5,
        })
        assert len(suggestions) == 0

    def test_query_cost_full_scan(self):
        from ai_agents.optimization import OptimizationAgent
        suggestions = OptimizationAgent.analyze_query_cost({
            "bytes_scanned": 500_000_000,
            "execution_time_ms": 3000,
            "has_partition_filter": False,
        })
        types = [s["type"] for s in suggestions]
        assert "add_partition_filter" in types


class TestDocumentationAgent:
    def test_column_description_id(self):
        from ai_agents.documentation import DocumentationAgent
        desc = DocumentationAgent.generate_column_description("id", "uuid", [])
        assert "identifier" in desc.lower()

    def test_column_description_fk(self):
        from ai_agents.documentation import DocumentationAgent
        desc = DocumentationAgent.generate_column_description("customer_id", "uuid", [])
        assert "reference" in desc.lower() or "foreign" in desc.lower()

    def test_table_readme(self):
        from ai_agents.documentation import DocumentationAgent
        readme = DocumentationAgent.generate_table_readme(
            "fact_orders",
            [{"name": "id", "type": "uuid"}, {"name": "amount", "type": "float"}],
        )
        assert "# fact_orders" in readme
        assert "| `id`" in readme
        assert "| `amount`" in readme

    def test_pipeline_summary(self):
        from ai_agents.documentation import DocumentationAgent
        summary = DocumentationAgent.generate_pipeline_summary({
            "name": "orders_etl",
            "pipeline_type": "ingestion",
            "strategy": "elt",
            "config": {"tables": ["orders", "order_items"]},
            "schedule": "0 */6 * * *",
        })
        assert "orders_etl" in summary
        assert "ELT" in summary
