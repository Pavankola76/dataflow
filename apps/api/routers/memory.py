"""AI Learning & Memory System API — fetch stored semantic contexts."""

from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, Depends
from datetime import datetime
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/memory", tags=["Memory"])

class MemoryVector(BaseModel):
    id: str
    context: str
    source: str
    weight: float
    usage_count: int
    status: str
    last_applied: str

@router.get("/vectors", response_model=List[MemoryVector])
async def get_memory_vectors(current_user: User = Depends(get_current_user)):
    return [
       {
           "id": "mem_rev_col",
           "context": "The fct_revenue table uses the 'amount_usd' column, not 'revenue'.",
           "source": "Auto-learned from SQL Error",
           "weight": 0.95,
           "usage_count": 427,
           "status": "Active",
           "last_applied": "2026-03-21T10:15:00Z"
       },
       {
           "id": "mem_test_acc",
           "context": "Filter out test accounts where email LIKE '%@test.com' or id = 'TEST_01'.",
           "source": "Manually Injected by Admin",
           "weight": 1.0,
           "usage_count": 89,
           "status": "Active",
           "last_applied": "2026-03-21T14:22:00Z"
       },
       {
           "id": "mem_join_key",
           "context": "Always join dim_users to fct_events on user_uuid, not user_id.",
           "source": "Auto-learned from Analyst Correction",
           "weight": 0.88,
           "usage_count": 12,
           "status": "Learning",
           "last_applied": "2026-03-20T09:05:00Z"
       }
    ]
