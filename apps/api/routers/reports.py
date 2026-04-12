"""Scheduled Reports API — fetch persisted automated SQL AI Queries."""

from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

class Report(BaseModel):
    id: str
    name: str
    description: str
    query: str
    schedule: str
    recipients: List[str]
    last_run: str
    next_run: str
    status: str

@router.get("/", response_model=List[Report])
async def get_scheduled_reports(current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    return [
       {
           "id": "rep_93f8a1",
           "name": "Daily Enterprise Revenue Extract",
           "description": "Aggregates global stripe and invoice payments. Generated autonomously by DataFlow AI.",
           "query": "SELECT DATE_TRUNC('day', transaction_date) as day, sum(amount_usd)\\nFROM gold.fct_revenue\\nWHERE status = 'cleared'\\nGROUP BY 1\\nORDER BY 1 DESC\\nLIMIT 30;",
           "schedule": "0 8 * * *",
           "recipients": ["ceo@dataflow.ai", "finance-team@dataflow.ai"],
           "last_run": (now - timedelta(hours=2)).isoformat(),
           "next_run": (now + timedelta(hours=22)).isoformat(),
           "status": "Healthy"
       },
       {
           "id": "rep_2ca10b",
           "name": "Weekly User Churn Signal",
           "description": "Tracks users who triggered an 'unsubscribe' event in the clickstream but have an active session in the dim_users table.",
           "query": "SELECT u.email, s.latest_event\\nFROM silver.dim_users u\\nJOIN bronze.sts_events s ON u.id = s.user_id\\nWHERE s.event_type = 'unsubscribe' AND u.status = 'active';",
           "schedule": "0 9 * * 1",
           "recipients": ["growth-marketing@dataflow.ai"],
           "last_run": (now - timedelta(days=4)).isoformat(),
           "next_run": (now + timedelta(days=3)).isoformat(),
           "status": "Healthy"
       }
    ]
