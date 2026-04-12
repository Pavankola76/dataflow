"""Performance Observability Hub API."""

from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User
import random

router = APIRouter(prefix="/api/v1/performance", tags=["Performance"])

class PerformanceSnapshot(BaseModel):
    timestamp: str
    llm_latency_ms: int
    iceberg_iops: int
    spark_ram_gb: float

@router.get("/metrics", response_model=List[PerformanceSnapshot])
async def get_performance_metrics(current_user: User = Depends(get_current_user)):
    # Generate 24 data points of simulated load testing (e.g. 24 hours)
    metrics = []
    for i in range(24):
        # Add some random spikes to simulate load testing bottlenecks
        spike = 1.3 if random.random() > 0.8 else 1.0
        large_spike = 1.9 if random.random() > 0.9 else 1.0
        
        hour_str = f"{i:02d}:00"
        
        metrics.append({
            "timestamp": hour_str,
            "llm_latency_ms": int(120 * spike * large_spike) + random.randint(-15, 30),
            "iceberg_iops": int(3200 * spike * large_spike) + random.randint(-400, 800),
            "spark_ram_gb": round(128.0 * spike + random.randint(-5, 10), 1)
        })
    return metrics
