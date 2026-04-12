"""Data Catalog & Lineage & Glossary API."""

from typing import Optional, List
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from database import get_db
from models.governance import DataCatalog, DataLineage, BusinessGlossary
from middleware.auth import get_current_user
from models.user import User

router = APIRouter()


# --- Catalog ---
@router.get("/api/v1/catalog")
async def list_catalog(
    layer: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(DataCatalog)
    if layer:
        query = query.where(DataCatalog.layer == layer)
    if search:
        query = query.where(
            or_(
                DataCatalog.table_name.ilike(f"%{search}%"),
                DataCatalog.description.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(DataCatalog.updated_at.desc())
    result = await db.execute(query)
    entries = result.scalars().all()
    return [
        {
            "id": str(e.id), "table_name": e.table_name, "schema_name": e.schema_name,
            "layer": e.layer, "description": e.description, "classification": e.classification,
            "tags": e.tags, "quality_score": e.quality_score, "row_count": e.row_count,
            "size_bytes": e.size_bytes,
            "last_refreshed_at": e.last_refreshed_at.isoformat() if e.last_refreshed_at else None,
        }
        for e in entries
    ]


@router.get("/api/v1/catalog/{table_name}")
async def get_catalog_entry(table_name: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(DataCatalog).where(DataCatalog.table_name == table_name))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Catalog entry not found")
    return {
        "id": str(entry.id), "table_name": entry.table_name, "schema_name": entry.schema_name,
        "layer": entry.layer, "description": entry.description, "classification": entry.classification,
        "tags": entry.tags, "column_metadata": entry.column_metadata,
        "quality_score": entry.quality_score, "freshness_sla_hours": entry.freshness_sla_hours,
        "row_count": entry.row_count, "size_bytes": entry.size_bytes,
    }


class CatalogUpdate(BaseModel):
    description: Optional[str] = None
    classification: Optional[str] = None
    tags: Optional[list] = None
    owner_id: Optional[str] = None


@router.patch("/api/v1/catalog/{table_name}")
async def update_catalog_entry(table_name: str, body: CatalogUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(DataCatalog).where(DataCatalog.table_name == table_name))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Catalog entry not found")
    for field, value in body.dict(exclude_unset=True).items():
        setattr(entry, field, value)
    return {"status": "updated"}


# --- Lineage ---
@router.get("/api/v1/lineage/{table_name}")
async def get_table_lineage(table_name: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    upstream = await db.execute(select(DataLineage).where(DataLineage.target_table == table_name))
    downstream = await db.execute(select(DataLineage).where(DataLineage.source_table == table_name))
    return {
        "table": table_name,
        "upstream": [
            {"source_table": l.source_table, "source_column": l.source_column,
             "target_column": l.target_column, "transformation_type": l.transformation_type}
            for l in upstream.scalars().all()
        ],
        "downstream": [
            {"target_table": l.target_table, "target_column": l.target_column,
             "source_column": l.source_column, "transformation_type": l.transformation_type}
            for l in downstream.scalars().all()
        ],
    }


@router.get("/api/v1/lineage/{table_name}/{column_name}")
async def get_column_lineage(table_name: str, column_name: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    upstream = await db.execute(
        select(DataLineage).where(DataLineage.target_table == table_name, DataLineage.target_column == column_name)
    )
    downstream = await db.execute(
        select(DataLineage).where(DataLineage.source_table == table_name, DataLineage.source_column == column_name)
    )
    return {
        "table": table_name, "column": column_name,
        "upstream": [{"source_table": l.source_table, "source_column": l.source_column, "transformation_sql": l.transformation_sql} for l in upstream.scalars().all()],
        "downstream": [{"target_table": l.target_table, "target_column": l.target_column, "transformation_sql": l.transformation_sql} for l in downstream.scalars().all()],
    }


# --- Glossary ---
class GlossaryCreate(BaseModel):
    term: str
    definition: str
    sql_expression: Optional[str] = None
    related_tables: Optional[dict] = None


@router.get("/api/v1/glossary")
async def list_glossary(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(BusinessGlossary).order_by(BusinessGlossary.term))
    return [
        {"id": str(g.id), "term": g.term, "definition": g.definition,
         "sql_expression": g.sql_expression, "status": g.status}
        for g in result.scalars().all()
    ]


@router.post("/api/v1/glossary", status_code=201)
async def create_glossary_term(body: GlossaryCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    term = BusinessGlossary(
        term=body.term, definition=body.definition,
        sql_expression=body.sql_expression, related_tables=body.related_tables,
    )
    db.add(term)
    await db.flush()
    return {"id": str(term.id), "term": term.term}


@router.patch("/api/v1/glossary/{term_id}")
async def update_glossary_term(term_id: str, body: GlossaryCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(BusinessGlossary).where(BusinessGlossary.id == uuid.UUID(term_id)))
    term = result.scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=404, detail="Glossary term not found")
    term.term = body.term
    term.definition = body.definition
    term.sql_expression = body.sql_expression
    return {"status": "updated"}


@router.delete("/api/v1/glossary/{term_id}")
async def delete_glossary_term(term_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(BusinessGlossary).where(BusinessGlossary.id == uuid.UUID(term_id)))
    term = result.scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=404, detail="Glossary term not found")
    await db.delete(term)
    return {"status": "deleted"}
