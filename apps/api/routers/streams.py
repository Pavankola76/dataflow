"""Real-time Streaming API — fetch active Kafka & Flink topologies."""

from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/streams", tags=["Streaming DAG"])

@router.get("/topology")
async def get_stream_topology(current_user: User = Depends(get_current_user)):
    return {
        "nodes": [
            {
                "id": "kafka_clicks",
                "type": "kafka",
                "position": {"x": 100, "y": 200},
                "data": {
                    "topic": "events.clickstream",
                    "throughput": 4200,
                    "partitions": 12,
                    "status": "healthy"
                }
            },
            {
                "id": "flink_sessionizer",
                "type": "flink",
                "position": {"x": 450, "y": 200},
                "data": {
                    "job_name": "Clickstream Sessionizer",
                    "lag": 45,
                    "watermark": "2026-03-21T16:24:00Z",
                    "status": "warning"
                }
            },
            {
                "id": "iceberg_silver",
                "type": "sink",
                "position": {"x": 800, "y": 200},
                "data": {
                    "table": "silver.fct_sessions",
                    "write_rate": 840,
                    "status": "healthy"
                }
            }
        ],
        "edges": [
            {
                "id": "e1",
                "source": "kafka_clicks",
                "target": "flink_sessionizer",
                "animated": True
            },
            {
                "id": "e2",
                "source": "flink_sessionizer",
                "target": "iceberg_silver",
                "animated": True
            }
        ],
        "metrics": {
            "total_throughput_msg_sec": 4200,
            "max_consumer_lag_ms": 45,
            "running_jobs": 1
        }
    }
