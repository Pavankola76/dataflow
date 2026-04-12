"""Models package — registers all SQLAlchemy ORM models."""

from models.user import Organization, User, Workspace
from models.connection import Connection, SchemaSnapshot
from models.pipeline import Pipeline, PipelineRun
from models.system import Alert, AuditLog
from models.data_model import DataModel, ModelVersion
from models.analytics import AnalyticsQuery, Dashboard, DashboardWidget
from models.governance import DataCatalog, DataLineage, DataContract, ContractViolation, BusinessGlossary
from models.ai_and_ops import AIAgentLog, AIPatternLibrary, ApprovalRequest, Notification, CostRecord

__all__ = [
    # Users & Org
    "Organization", "User", "Workspace",
    # Connections
    "Connection", "SchemaSnapshot",
    # Pipelines
    "Pipeline", "PipelineRun",
    # System
    "Alert", "AuditLog",
    # Data Models
    "DataModel", "ModelVersion",
    # Analytics
    "AnalyticsQuery", "Dashboard", "DashboardWidget",
    # Governance
    "DataCatalog", "DataLineage", "DataContract", "ContractViolation", "BusinessGlossary",
    # AI & Ops
    "AIAgentLog", "AIPatternLibrary", "ApprovalRequest", "Notification", "CostRecord",
]
