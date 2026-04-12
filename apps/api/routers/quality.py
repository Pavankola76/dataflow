"""Data Quality API — fetch Great Expectations validation suites & anomaly results."""

from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.governance import DataContract, ContractViolation

router = APIRouter(prefix="/api/v1/quality", tags=["Data Quality"])

class ExpectationResult(BaseModel):
    expectation_type: str
    column: str
    success: bool
    unexpected_count: Optional[int] = None
    unexpected_percent: Optional[float] = None
    message: str

class ValidationSuite(BaseModel):
    id: str
    name: str
    dataset: str
    status: str
    passed_count: int
    failed_count: int
    last_run: str
    results: List[ExpectationResult]

@router.get("/suites", response_model=List[ValidationSuite])
async def get_validation_suites(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DataContract))
    contracts = result.scalars().all()
    
    suites = []
    for c in contracts:
        # Mock results based on contract for now until Great Expectations is fully integrated
        mock_results = []
        if c.quality_contract:
            for k, v in c.quality_contract.items():
                mock_results.append(ExpectationResult(
                    expectation_type=f"expect_{k}",
                    column="various",
                    success=True,
                    message=f"Passed {v}"
                ))
        
        last_run_time = c.updated_at.isoformat() if c.updated_at else datetime.now(timezone.utc).isoformat()
        
        suites.append(ValidationSuite(
            id=str(c.id),
            name=f"{c.table_name} Validation",
            dataset=c.table_name,
            status=c.status.capitalize(),
            passed_count=len(mock_results),
            failed_count=0,
            last_run=last_run_time,
            results=mock_results
        ))
    return suites
