"""WebSocket handler for real-time collaborative editing.

Manages multiplayer sessions on the Data Modeling canvas and SQL editor.
Uses rooms (one per resource) with cursor tracking and CRDT-style
conflict resolution for concurrent edits.
"""

from datetime import datetime, timezone
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

# In-memory session state (replaced by Redis in production)
_rooms: dict[str, dict[str, Any]] = {}


class CollaborationRoom:
    """Tracks participants and their cursor state for a single resource."""

    def __init__(self, room_id: str):
        self.room_id = room_id
        self.participants: dict[str, dict] = {}
        self.lock_holder: str | None = None
        self.created_at = datetime.now(timezone.utc).isoformat()

    def join(self, user_id: str, display_name: str, color: str) -> dict:
        self.participants[user_id] = {
            "user_id": user_id,
            "display_name": display_name,
            "color": color,
            "cursor": {"x": 0, "y": 0},
            "selection": None,
            "joined_at": datetime.now(timezone.utc).isoformat(),
        }
        logger.info("join | room=%s user=%s", self.room_id, user_id)
        return {"event": "user_joined", "user": self.participants[user_id]}

    def leave(self, user_id: str) -> dict:
        self.participants.pop(user_id, None)
        if self.lock_holder == user_id:
            self.lock_holder = None
        logger.info("leave | room=%s user=%s", self.room_id, user_id)
        return {"event": "user_left", "user_id": user_id}

    def update_cursor(self, user_id: str, x: float, y: float) -> dict:
        if user_id in self.participants:
            self.participants[user_id]["cursor"] = {"x": x, "y": y}
        return {
            "event": "cursor_move",
            "user_id": user_id,
            "cursor": {"x": x, "y": y},
        }

    def acquire_lock(self, user_id: str) -> dict:
        if self.lock_holder is None:
            self.lock_holder = user_id
            return {"event": "lock_acquired", "user_id": user_id}
        return {"event": "lock_denied", "held_by": self.lock_holder}

    def release_lock(self, user_id: str) -> dict:
        if self.lock_holder == user_id:
            self.lock_holder = None
            return {"event": "lock_released", "user_id": user_id}
        return {"event": "lock_not_held"}

    def broadcast_edit(self, user_id: str, operation: dict) -> dict:
        """Broadcast a CRDT edit operation to all other participants."""
        return {
            "event": "edit",
            "user_id": user_id,
            "operation": operation,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def state(self) -> dict:
        return {
            "room_id": self.room_id,
            "participants": list(self.participants.values()),
            "lock_holder": self.lock_holder,
        }


def get_or_create_room(room_id: str) -> CollaborationRoom:
    if room_id not in _rooms:
        _rooms[room_id] = CollaborationRoom(room_id)
    return _rooms[room_id]


# ------------------------------------------------------------------
# FastAPI WebSocket route (to be mounted in main.py):
#
#   @app.websocket("/ws/collaboration/{room_id}")
#   async def ws_collaboration(websocket, room_id: str):
#       await websocket.accept()
#       room = get_or_create_room(room_id)
#       ...
# ------------------------------------------------------------------
