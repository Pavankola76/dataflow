"""Models API — suggesting dimensional models and generating dbt."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List

from middleware.auth import get_current_user
from models.user import User
from services.modeling_service import ModelingService
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/models", tags=["Models"])

class SchemaContextPayload(BaseModel):
    schema_context: List[Dict[str, Any]]

class VisualModelPayload(BaseModel):
    visual_model: Dict[str, Any]

@router.post("/suggest")
async def suggest_model(
    payload: SchemaContextPayload,
    current_user: User = Depends(get_current_user),
):
    """Suggests a star schema based on an array of source table schemas."""
    svc = ModelingService()
    try:
        suggestion = await svc.suggest_model(payload.schema_context)
        return suggestion
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-dbt")
async def generate_dbt(
    payload: VisualModelPayload,
    current_user: User = Depends(get_current_user),
):
    """Generates a dbt project (SQL + YAML) from a visual model."""
    svc = ModelingService()
    try:
        project = await svc.generate_dbt_project(payload.visual_model)
        return project
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
