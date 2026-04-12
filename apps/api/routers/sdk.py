"""Embeddable Analytics SDK API — fetch active embeds."""

from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/sdk", tags=["SDK"])

class EmbedConnection(BaseModel):
    id: str
    target_dashboard: str
    token_prefix: str
    allowed_domains: List[str]
    monthly_requests: int
    status: str
    created_at: str

@router.get("/embeds", response_model=List[EmbedConnection])
async def get_active_embeds(current_user: User = Depends(get_current_user)):
    return [
       {
           "id": "emb_salesforce_hq",
           "target_dashboard": "Global Revenue KPIs",
           "token_prefix": "df_live_8f92...",
           "allowed_domains": ["https://acme.salesforce.com", "https://internal.acme.corp"],
           "monthly_requests": 142050,
           "status": "Active",
           "created_at": "2026-01-15T08:30:00Z"
       },
       {
           "id": "emb_notion_wiki",
           "target_dashboard": "Engineering Velocity",
           "token_prefix": "df_live_3c4a...",
           "allowed_domains": ["https://notion.so/acmecorp"],
           "monthly_requests": 8420,
           "status": "Active",
           "created_at": "2026-02-28T14:15:00Z"
       }
    ]
