"""WebSocket endpoint for real-time pipeline status updates."""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json


class PipelineStatusManager:
    """Manages WebSocket connections for live pipeline run tracking."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}  # pipeline_id -> set of websockets

    async def connect(self, websocket: WebSocket, pipeline_id: str = "global"):
        await websocket.accept()
        if pipeline_id not in self.active_connections:
            self.active_connections[pipeline_id] = set()
        self.active_connections[pipeline_id].add(websocket)

    def disconnect(self, websocket: WebSocket, pipeline_id: str = "global"):
        if pipeline_id in self.active_connections:
            self.active_connections[pipeline_id].discard(websocket)
            if not self.active_connections[pipeline_id]:
                del self.active_connections[pipeline_id]

    async def broadcast(self, pipeline_id: str, message: dict):
        """Broadcast a status update to all connections watching a pipeline."""
        targets = set()
        if pipeline_id in self.active_connections:
            targets.update(self.active_connections[pipeline_id])
        if "global" in self.active_connections:
            targets.update(self.active_connections["global"])

        dead = set()
        for connection in targets:
            try:
                await connection.send_json(message)
            except Exception:
                dead.add(connection)

        # Cleanup dead connections
        for conn in dead:
            for pid_connections in self.active_connections.values():
                pid_connections.discard(conn)


# Singleton
pipeline_status_manager = PipelineStatusManager()


async def pipeline_status_endpoint(websocket: WebSocket, pipeline_id: str = "global"):
    """WebSocket endpoint: /ws/pipeline-status/{pipeline_id}"""
    await pipeline_status_manager.connect(websocket, pipeline_id)
    try:
        while True:
            # Keep connection alive, listen for client messages (ping, subscribe)
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "subscribe":
                pid = msg.get("pipeline_id", "global")
                if pid not in pipeline_status_manager.active_connections:
                    pipeline_status_manager.active_connections[pid] = set()
                pipeline_status_manager.active_connections[pid].add(websocket)
    except WebSocketDisconnect:
        pipeline_status_manager.disconnect(websocket, pipeline_id)
