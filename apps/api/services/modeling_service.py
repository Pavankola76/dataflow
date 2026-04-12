"""
Modeling Service
Orchestrates the AI agents for suggesting dimensional models and generating dbt code.
Handles persistence to the DataModel ORM if required.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
# Removed unused import of DataModel
import sys
import os

# Add workspace root to path for absolute imports like `packages.ai-agents...`
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if workspace_root not in sys.path:
    sys.path.append(workspace_root)

from packages.ai_agents.data_modeling import DataModelingAgent
from packages.ai_agents.code_generation import CodeGenerationAgent

class ModelingService:
    def __init__(self):
        self.modeling_agent = DataModelingAgent()
        self.code_gen_agent = CodeGenerationAgent()

    async def suggest_model(self, schema_context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calls the Data Modeling agent to suggest a star/snowflake schema.
        """
        proposed_model = await self.modeling_agent.suggest_model(schema_context)
        return proposed_model

    async def generate_dbt_project(self, visual_model: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calls the Code Generation agent to convert the graph model into dbt SQL/YAML.
        """
        dbt_files = await self.code_gen_agent.generate_dbt_project(visual_model)
        
        # In a full implementation, we would write these to a git repository
        # For the UI MVP, we just return the raw payload.
        return {
            "dbt_files": dbt_files,
            "status": "success",
            "message": "Project generated successfully."
        }
