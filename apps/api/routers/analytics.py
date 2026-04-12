from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from packages.ai_agents.text_to_sql import TextToSqlAgent
from database import get_warehouse_conn
from middleware.auth import get_current_user
from models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

class AnalyticsQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class AnalyticsQueryResponse(BaseModel):
    generated_sql: str
    chart_type: str
    chart_config: Dict[str, Any]
    explanation: str
    results: List[Dict[str, Any]]

@router.post("/query", response_model=AnalyticsQueryResponse)
async def execute_nl_query(
    request: AnalyticsQueryRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Submits a natural language question. The AI generates the SQL, executes it against the DW,
    and returns the chart-ready result arrays perfectly formatted for the frontend widget.
    """
    try:
        sql, chart_type, chart_config, explanation = await TextToSqlAgent.generate_sql_and_chart(request.query)
        
        # ACTUALLY EXECUTE THE GENERATED SQL AGAINST THE WAREHOUSE
        conn = get_warehouse_conn()
        results = []
        try:
            res = conn.execute(sql)
            columns = [desc[0] for desc in res.description]
            rows = res.fetchall()
            results = [dict(zip(columns, row)) for row in rows]
        except Exception as query_err:
            logger.error(f"Failed to execute generated SQL: {query_err}")
            # Fallback to an empty set if it's an invalid schema
            results = [{"error": str(query_err)}]
        finally:
            conn.close()
            
        return AnalyticsQueryResponse(
            generated_sql=sql,
            chart_type=chart_type,
            chart_config=chart_config,
            explanation=explanation,
            results=results
        )
    except Exception as e:
        logger.error(f"Error executing natural language query: {e}")
        raise HTTPException(status_code=500, detail=str(e))
