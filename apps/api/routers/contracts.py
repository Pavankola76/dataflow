"""Data Contracts API — CRUD and violation tracking."""

from typing import Optional
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.governance import DataContract, ContractViolation

router = APIRouter()


class ContractCreate(BaseModel):
    table_name: str
    schema_contract: dict
    quality_contract: Optional[dict] = None
    freshness_contract: Optional[dict] = None
    enforcement_mode: str = "warn"


class ContractUpdate(BaseModel):
    schema_contract: Optional[dict] = None
    quality_contract: Optional[dict] = None
    freshness_contract: Optional[dict] = None
    enforcement_mode: Optional[str] = None
    status: Optional[str] = None


@router.get("/api/v1/contracts")
async def list_contracts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DataContract).order_by(DataContract.created_at.desc()))
    return [
        {
            "id": str(c.id), "table_name": c.table_name,
            "contract_version": c.contract_version, "status": c.status,
            "enforcement_mode": c.enforcement_mode,
            "violation_count": len(c.violations) if c.violations else 0,
        }
        for c in result.scalars().all()
    ]


@router.post("/api/v1/contracts", status_code=201)
async def create_contract(body: ContractCreate, db: AsyncSession = Depends(get_db)):
    contract = DataContract(
        table_name=body.table_name, schema_contract=body.schema_contract,
        quality_contract=body.quality_contract, freshness_contract=body.freshness_contract,
        enforcement_mode=body.enforcement_mode,
    )
    db.add(contract)
    await db.flush()
    return {"id": str(contract.id), "table_name": contract.table_name}


@router.get("/api/v1/contracts/{contract_id}")
async def get_contract(contract_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DataContract).where(DataContract.id == uuid.UUID(contract_id)))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {
        "id": str(c.id), "table_name": c.table_name, "contract_version": c.contract_version,
        "schema_contract": c.schema_contract, "quality_contract": c.quality_contract,
        "freshness_contract": c.freshness_contract, "status": c.status,
        "enforcement_mode": c.enforcement_mode,
    }


@router.patch("/api/v1/contracts/{contract_id}")
async def update_contract(contract_id: str, body: ContractUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DataContract).where(DataContract.id == uuid.UUID(contract_id)))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    for field, value in body.dict(exclude_unset=True).items():
        setattr(c, field, value)
    return {"status": "updated"}


@router.delete("/api/v1/contracts/{contract_id}")
async def delete_contract(contract_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DataContract).where(DataContract.id == uuid.UUID(contract_id)))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    await db.delete(c)
    return {"status": "deleted"}


@router.get("/api/v1/contracts/{contract_id}/violations")
async def get_violations(contract_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ContractViolation).where(ContractViolation.contract_id == uuid.UUID(contract_id))
        .order_by(ContractViolation.created_at.desc())
    )
    return [
        {
            "id": str(v.id), "violation_type": v.violation_type, "severity": v.severity,
            "details": v.details, "resolved": v.resolved,
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in result.scalars().all()
    ]


@router.post("/api/v1/contracts/generate")
async def ai_generate_contract(table_name: str, db: AsyncSession = Depends(get_db)):
    """AI generates a data contract from the schema profile."""
    # Placeholder — in production this calls the Governance Agent
    contract = DataContract(
        table_name=table_name,
        schema_contract={"columns": [], "note": "AI-generated placeholder"},
        quality_contract={"max_null_rate": 0.05},
        freshness_contract={"max_staleness_hours": 24},
        enforcement_mode="warn",
    )
    db.add(contract)
    await db.flush()
    return {"id": str(contract.id), "table_name": table_name, "status": "generated"}
