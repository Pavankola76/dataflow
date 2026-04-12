class DataFlowException(Exception):
    """Base exception for all DataFlow errors."""
    pass

class ConnectionError(DataFlowException):
    """Raised when a connector fails to reach the data source."""
    pass

class SchemaDiscoveryError(DataFlowException):
    """Raised when schema discovery fails."""
    pass

class ConfigurationError(DataFlowException):
    """Raised when connection configuration is invalid."""
    pass

class ExtractionError(DataFlowException):
    """Raised when extracting data from a source fails."""
    pass


# ---- Schema Errors ----

class SchemaDriftError(SchemaDiscoveryError):
    """Source schema has changed since the last snapshot."""
    pass

class SchemaValidationError(SchemaDiscoveryError):
    """Schema does not match the expected data contract."""
    pass


# ---- Pipeline Errors ----

class PipelineError(DataFlowException):
    """Pipeline execution failure."""
    pass

class PipelineTimeoutError(PipelineError):
    """Pipeline exceeded its maximum allowed run duration."""
    pass

class DependencyError(PipelineError):
    """An upstream pipeline or resource is not available."""
    pass

class ResourceExhaustionError(PipelineError):
    """Out of memory, disk, or compute resources."""
    pass


# ---- Data Quality Errors ----

class DataQualityError(DataFlowException):
    """Data failed quality validation checks."""
    pass

class ContractViolationError(DataQualityError):
    """Data violates an active data contract."""
    pass

class AnomalyDetectedError(DataQualityError):
    """Statistical anomaly detected in incoming data."""
    pass


# ---- AI Agent Errors ----

class AgentError(DataFlowException):
    """AI agent execution failure."""
    pass

class LLMRateLimitError(AgentError):
    """LLM API rate limit exceeded."""
    pass

class LowConfidenceError(AgentError):
    """Agent confidence below acceptable threshold."""
    pass

class AgentTimeoutError(AgentError):
    """Agent did not respond within the allowed time."""
    pass


# ---- Governance Errors ----

class GovernanceError(DataFlowException):
    """Governance policy violation."""
    pass

class PIIAccessDeniedError(GovernanceError):
    """User lacks permission to access PII/PHI columns."""
    pass

class MaskingPolicyError(GovernanceError):
    """Data masking policy could not be applied."""
    pass


# ---- Auth Errors ----

class AuthError(DataFlowException):
    """Authentication or authorization failure."""
    pass

class TokenExpiredError(AuthError):
    """JWT token has expired."""
    pass

class InsufficientPermissionsError(AuthError):
    """User lacks the required role or permission."""
    pass
