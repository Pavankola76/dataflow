"""Version Control API — fetch git commits and AI patch diffs."""

from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/commits", tags=["Version Control"])

class DiffFile(BaseModel):
    filename: str
    status: str
    additions: int
    deletions: int
    patch: str

class CommitLog(BaseModel):
    id: str
    message: str
    author: str
    avatar: Optional[str] = None
    timestamp: str
    is_ai: bool
    branch: str
    files: List[DiffFile]

@router.get("/", response_model=List[CommitLog])
async def get_commits(current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "c9f2a1b",
            "message": "fix(pipeline): resolve target table schema drift during daily load",
            "author": "DataFlow Autopilot",
            "avatar": None,
            "timestamp": (now - timedelta(minutes=15)).isoformat(),
            "is_ai": True,
            "branch": "main",
            "files": [
                {
                    "filename": "models/staging/stg_payments.sql",
                    "status": "modified",
                    "additions": 3,
                    "deletions": 1,
                    "patch": "@@ -12,7 +12,9 @@\\n     payment_method,\\n     amount / 100 as amount_usd,\\n-    status\\n+    status,\\n+    -- AI Auto-Heal: Upstream added transaction_id\\n+    transaction_id\\n FROM {{ source('stripe', 'payment') }}"
                }
            ]
        },
        {
            "id": "8a3e72d",
            "message": "Merge pull request #142 from engineering/reporting-fix",
            "author": "Sarah Jenkins",
            "avatar": "SJ",
            "timestamp": (now - timedelta(hours=3)).isoformat(),
            "is_ai": False,
            "branch": "main",
            "files": [
                {
                    "filename": "models/marts/marketing/dim_campaigns.sql",
                    "status": "modified",
                    "additions": 12,
                    "deletions": 4,
                    "patch": "@@ -1,5 +1,13 @@\\n+-- Overhauled marketing logic\\n WITH source AS (\\n     SELECT * FROM {{ ref('stg_salesforce') }}\\n )\\n-SELECT id FROM source\\n+SELECT \\n+  id,\\n+  campaign_name,\\n+  budget_allocated\\n+FROM source\\n+WHERE status = 'Active'"
                }
            ]
        },
        {
            "id": "1d4b89f",
            "message": "feat(core): materialize user dimensional logic as incremental",
            "author": "DataFlow Autopilot",
            "avatar": None,
            "timestamp": (now - timedelta(days=1)).isoformat(),
            "is_ai": True,
            "branch": "main",
            "files": [
                {
                    "filename": "models/marts/core/dim_users.sql",
                    "status": "modified",
                    "additions": 4,
                    "deletions": 2,
                    "patch": "@@ -1,6 +1,8 @@\\n-{{ config(materialized='table') }}\\n+{{ config(\\n+    materialized='incremental',\\n+    unique_key='user_id'\\n+) }}\\n \\n SELECT\\n     user_id,"
                }
            ]
        }
    ]
