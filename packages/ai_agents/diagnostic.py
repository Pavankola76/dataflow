import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

async def analyze_error(pipeline_id: str, error_log: str, stack_trace: str = "") -> Dict[str, Any]:
    """
    AI Diagnostic Agent that classifies pipeline errors into actionable categories
    and discovers the root cause.
    """
    logger.info(f"Diagnostic Agent analyzing error on pipeline {pipeline_id}")
    
    # Heuristic parsing (Mocking LLM processing)
    error_lower = error_log.lower()
    
    if "column" in error_lower and "does not exist" in error_lower:
        # e.g., "psycopg2.errors.UndefinedColumn: column shipping_method does not exist"
        return {
            "error_type": "schema_drift",
            "root_cause": "A new column 'shipping_method' was added to the source orders table but is missing in the warehouse targets.",
            "confidence": 0.95,
            "affected_models": ["stg_orders", "int_orders_enriched", "fact_orders"],
            "suggested_action": "regenerate_models",
            "severity": "critical"
        }
        
    elif "connection refused" in error_lower or "timeout" in error_lower:
        return {
            "error_type": "connection_failure",
            "root_cause": "The source database host is unreachable. Credentials may have expired or network is down.",
            "confidence": 0.88,
            "affected_models": [],
            "suggested_action": "retry_with_backoff",
            "severity": "warning"
        }
        
    elif "memory" in error_lower or "oom" in error_lower:
        return {
            "error_type": "resource_exhaustion",
            "root_cause": "The worker node exhausted available memory during the transformation join phase.",
            "confidence": 0.75,
            "affected_models": ["int_orders_enriched"],
            "suggested_action": "scale_cluster",
            "severity": "critical"
        }

    # Default fallback
    return {
        "error_type": "unknown",
        "root_cause": error_log,
        "confidence": 0.30,
        "affected_models": [],
        "suggested_action": "escalate_to_human",
        "severity": "critical"
    }
