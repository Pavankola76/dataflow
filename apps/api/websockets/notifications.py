"""WebSocket endpoint for real-time notifications."""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json


class NotificationManager:
    """Manages WebSocket connections for live notification delivery."""

    def __init__(self):
        self.user_connections: Dict[str, Set[WebSocket]] = {}  # user_id -> set of websockets

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)

    async def send_notification(self, user_id: str, notification: dict):
        """Push a notification to a specific user."""
        if user_id not in self.user_connections:
            return
        dead = set()
        for conn in self.user_connections[user_id]:
            try:
                await conn.send_json(notification)
            except Exception:
                dead.add(conn)
        for conn in dead:
            self.user_connections[user_id].discard(conn)

    async def broadcast_all(self, notification: dict):
        """Broadcast to all connected users."""
        for user_id in list(self.user_connections.keys()):
            await self.send_notification(user_id, notification)


notification_manager = NotificationManager()


async def notifications_endpoint(websocket: WebSocket, user_id: str = "anonymous"):
    """WebSocket endpoint: /ws/notifications/{user_id}"""
    await notification_manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()  # Keep-alive
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket, user_id)
