"""DataFlow AI — FastAPI Application Entry Point."""

import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone

# Add workspace root to PYTHONPATH so we can import `packages`
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
if workspace_root not in sys.path:
    sys.path.append(workspace_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from middleware.error_handler import custom_http_exception_handler, validation_exception_handler, global_exception_handler
from middleware.rate_limiter import RateLimitMiddleware
from middleware.logger import logger

from config import get_settings
from database import init_db
from routers import (
    auth, connections, connectors, pipelines, models,
    observability, analytics, monitoring,
    dashboards, catalog, contracts, approvals, notifications, reverse_etl, cost, commits, ingestion, quality, streams, reports, glossary, workspaces, memory, sdk, collaborate, performance, security
)

settings = get_settings()


from services.pipeline_scheduler import PipelineScheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    await init_db()
    if settings.run_scheduler:
        PipelineScheduler.start()
    logger.info(f"🚀 {settings.app_name} API started")
    yield
    # Shutdown
    if settings.run_scheduler:
        PipelineScheduler.stop()
    logger.info(f"👋 {settings.app_name} API shutting down")


app = FastAPI(
    title=settings.app_name,
    description="The AI-Native Autonomous Data Engineering Platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

# Exception Handlers
app.add_exception_handler(StarletteHTTPException, custom_http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Register routers
app.include_router(auth.router)
app.include_router(connections.router)
app.include_router(connectors.router)
app.include_router(pipelines.router)
app.include_router(models.router)
app.include_router(observability.router)
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["monitoring"])
app.include_router(dashboards.router, tags=["dashboards"])
app.include_router(catalog.router, tags=["catalog"])
app.include_router(contracts.router, tags=["contracts"])
app.include_router(approvals.router, tags=["approvals"])
app.include_router(notifications.router, tags=["notifications"])
app.include_router(reverse_etl.router, tags=["reverse-etl"])
app.include_router(cost.router, tags=["cost-optimization"])
app.include_router(commits.router, tags=["version-control"])
app.include_router(ingestion.router, tags=["ingestion"])
app.include_router(quality.router, tags=["quality"])
app.include_router(streams.router, tags=["streams"])
app.include_router(reports.router, tags=["reports"])
app.include_router(glossary.router, tags=["glossary"])
app.include_router(workspaces.router, tags=["workspaces"])
app.include_router(memory.router, tags=["memory"])
app.include_router(sdk.router, tags=["sdk"])
app.include_router(collaborate.router, tags=["collaborate"])
app.include_router(performance.router, tags=["performance"])
app.include_router(security.router, tags=["security"])


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

from database import async_session
from sqlalchemy import select, func
from models.pipeline import Pipeline, PipelineRun

@app.get("/api/v1/system/public/stats")
async def public_stats():
    async with async_session() as db:
        res = await db.execute(select(func.count(Pipeline.id)))
        pipelines_deployed = res.scalar() or 0
        
        res_runs = await db.execute(select(func.count(PipelineRun.id)))
        total_runs = res_runs.scalar() or 0
        
        res_failed = await db.execute(select(func.count(PipelineRun.id)).where(PipelineRun.status == 'failed'))
        failed_runs = res_failed.scalar() or 0
        
        uptime = 99.9
        if total_runs > 0:
            uptime = max(round(((total_runs - failed_runs) / total_runs) * 100, 1), 0.0)
            
    return {
        "pipeline_uptime": uptime,
        "pipelines_deployed": pipelines_deployed,
        "faster_development": 10,
        "cost_reduction": 50
    }


# --- WebSocket Endpoints ---
from fastapi import WebSocket

@app.websocket("/ws/pipeline-status/{pipeline_id}")
async def ws_pipeline_status(websocket: WebSocket, pipeline_id: str = "global"):
    from websockets.pipeline_status import pipeline_status_endpoint
    await pipeline_status_endpoint(websocket, pipeline_id)

@app.websocket("/ws/notifications/{user_id}")
async def ws_notifications(websocket: WebSocket, user_id: str = "anonymous"):
    from websockets.notifications import notifications_endpoint
    await notifications_endpoint(websocket, user_id)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs",
    }
