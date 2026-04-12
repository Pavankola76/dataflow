"""SQLAlchemy models for data connections and schema snapshots."""

import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Text, DateTime, Integer, BigInteger, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
from sqlalchemy.types import TypeDecorator
import json
import base64
from cryptography.fernet import Fernet
from config import get_settings
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base

class EncryptedJSON(TypeDecorator):
    """Transparently encrypts JSON dictionaries written to the database."""
    impl = JSON
    cache_ok = True

    @property
    def fernet(self):
        settings = get_settings()
        raw_key = settings.encryption_key.encode('utf-8')
        if len(raw_key) < 32:
            raw_key = raw_key.ljust(32, b'0')
        elif len(raw_key) > 32:
            raw_key = raw_key[:32]
        return Fernet(base64.urlsafe_b64encode(raw_key))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        json_str = json.dumps(value)
        encrypted = self.fernet.encrypt(json_str.encode('utf-8')).decode('utf-8')
        return {"_encrypted": encrypted}

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, dict) and "_encrypted" in value:
            decrypted = self.fernet.decrypt(value["_encrypted"].encode('utf-8'))
            return json.loads(decrypted.decode('utf-8'))
        return value

class Connection(Base):
    __tablename__ = "connections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    connector_type: Mapped[str] = mapped_column(String(50), nullable=False)
    config: Mapped[dict] = mapped_column(EncryptedJSON, nullable=False)  # encrypted connection details
    status: Mapped[str] = mapped_column(String(20), default="pending")
    last_heartbeat_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    last_schema_sync_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    schema_snapshot: Mapped[dict] = mapped_column(JSON, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    schema_snapshots: Mapped[list["SchemaSnapshot"]] = relationship(back_populates="connection")
    pipelines: Mapped[list["Pipeline"]] = relationship(back_populates="connection")


class SchemaSnapshot(Base):
    __tablename__ = "schema_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connection_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connections.id"))
    snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    diff_from_previous: Mapped[dict] = mapped_column(JSON, nullable=True)
    discovered_by: Mapped[str] = mapped_column(String(50), default="ai")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    connection: Mapped["Connection"] = relationship(back_populates="schema_snapshots")


# Import Pipeline here to avoid circular imports at module level
from models.pipeline import Pipeline  # noqa: E402, F401
