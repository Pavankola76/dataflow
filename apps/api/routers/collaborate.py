"""Multiplayer Collaborative Editing API."""

from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/collaborate", tags=["Collaborate"])

class ActiveUser(BaseModel):
    id: str
    name: str
    color: str
    status: str
    cursor_line: int
    cursor_char: int

@router.get("/session", response_model=List[ActiveUser])
async def get_active_session(current_user: User = Depends(get_current_user)):
    return [
       {
           "id": "usr_jane_doe",
           "name": "Jane Doe",
           "color": "var(--c-purple)",
           "status": "Editing",
           "cursor_line": 3,
           "cursor_char": 14
       },
       {
           "id": "usr_alex_smith",
           "name": "Alex Smith",
           "color": "var(--c-amber)",
           "status": "Reviewing",
           "cursor_line": 8,
           "cursor_char": 42
       }
    ]
