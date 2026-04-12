import pytest
import asyncio
from typing import List, Dict, Any
from packages.ai_agents.data_modeling import DataModelingAgent
from packages.ai_agents.code_generation import CodeGenerationAgent

@pytest.mark.asyncio
async def test_data_modeling_agent():
    agent = DataModelingAgent()
    schema_context = [{"table": "ecommerce_raw"}]
    
    # We expect a dictionary with 'facts' and 'dimensions'
    result = await agent.suggest_model(schema_context)
    assert "facts" in result
    assert "dimensions" in result
    assert len(result["facts"]) > 0

@pytest.mark.asyncio
async def test_code_generation_agent():
    agent = CodeGenerationAgent()
    visual_model = {
        "facts": [{"name": "fact_orders", "columns": []}],
        "dimensions": [{"name": "dim_customers", "columns": []}]
    }
    
    # We expect a dictionary of generated files
    result = await agent.generate_dbt_project(visual_model)
    assert "models/marts/fact_orders.sql" in result
    assert "models/marts/_marts__models.yml" in result
    assert "SELECT *" in result["models/marts/fact_orders.sql"] or "SELECT" in result["models/marts/fact_orders.sql"]
