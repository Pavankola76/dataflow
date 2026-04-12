"""
dbt Code Generation AI Agent
Translates a visual graph model (nodes/edges) into a structured dbt project
with SQL models and YAML schema files.
"""

import json
import os
from typing import Dict, Any

class CodeGenerationAgent:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY")

    async def generate_dbt_project(self, visual_model: Dict[str, Any]) -> Dict[str, str]:
        """
        Takes the UI model state and generates standard dbt files.
        Returns a dictionary mapping file paths to their content.
        """
        if self.api_key:
            return await self._call_llm(visual_model)
        else:
            return self._generate_mock_code(visual_model)

    async def _call_llm(self, visual_model: Dict[str, Any]) -> Dict[str, str]:
        # Placeholder for actual LLM call.
        return self._generate_mock_code(visual_model)

    def _generate_mock_code(self, visual_model: Dict[str, Any]) -> Dict[str, str]:
        """
        Generates deterministic dbt code based on the mock schema mapping.
        """
        # A real implementation would dynamically loop over nodes/edges in visual_model.
        
        return {
            "models/marts/fact_orders.sql": "-- AI Generated dbt Model: fact_orders\n\n"
                                            "{{ config(materialized='incremental', unique_key='order_item_id') }}\n\n"
                                            "WITH staging AS (\n"
                                            "    SELECT * FROM {{ ref('stg_orders') }}\n"
                                            "    JOIN {{ ref('stg_order_items') }} USING (order_id)\n"
                                            ")\n\n"
                                            "SELECT\n"
                                            "    order_item_id,\n"
                                            "    order_id,\n"
                                            "    customer_id,\n"
                                            "    product_id,\n"
                                            "    order_date,\n"
                                            "    quantity,\n"
                                            "    quantity * price AS amount,\n"
                                            "    status\n"
                                            "FROM staging\n"
                                            "{% if is_incremental() %}\n"
                                            "WHERE order_date >= (SELECT max(order_date) FROM {{ this }})\n"
                                            "{% endif %}",

            "models/marts/dim_customers.sql": "-- AI Generated dbt Model: dim_customers\n\n"
                                              "{{ config(\n"
                                              "    materialized='table',\n"
                                              "    tags=['dimension', 'scd2']\n"
                                              ") }}\n\n"
                                              "WITH source AS (\n"
                                              "    SELECT * FROM {{ ref('stg_customers') }}\n"
                                              ")\n\n"
                                              "SELECT\n"
                                              "    {{ dbt_utils.generate_surrogate_key(['customer_id']) }} AS customer_sk,\n"
                                              "    customer_id,\n"
                                              "    first_name,\n"
                                              "    last_name,\n"
                                              "    email,\n"
                                              "    city,\n"
                                              "    state\n"
                                              "FROM source",
            
            "models/marts/_marts__models.yml": "version: 2\n\n"
                                               "models:\n"
                                               "  - name: fact_orders\n"
                                               "    description: 'Grain: One row per order line item. Contains measures like total_amount and quantity.'\n"
                                               "    columns:\n"
                                               "      - name: order_item_id\n"
                                               "        tests:\n"
                                               "          - unique\n"
                                               "          - not_null\n"
                                               "      - name: customer_id\n"
                                               "        tests:\n"
                                               "          - relationships:\n"
                                               "              to: ref('dim_customers')\n"
                                               "              field: customer_id\n\n"
                                               "  - name: dim_customers\n"
                                               "    description: 'Customer attributes. SCD Type 2 tracking for address changes.'\n"
                                               "    columns:\n"
                                               "      - name: customer_id\n"
                                               "        tests:\n"
                                               "          - unique\n"
                                               "          - not_null\n"
        }

