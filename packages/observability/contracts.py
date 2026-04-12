"""
Data Contracts Engine
Provides Pydantic-based definitions for data SLA contracts and logic to validate incoming datasets against them.
"""

from pydantic import BaseModel, Field, ValidationError
from typing import List, Dict, Any, Optional
import json

class ColumnConstraint(BaseModel):
    name: str
    expected_type: str = Field(..., description="e.g., string, integer, timestamp")
    max_null_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    is_unique: bool = Field(default=False)

class DataContract(BaseModel):
    table_name: str
    owner: str = Field(default="data_engineering_team")
    description: Optional[str] = None
    columns: List[ColumnConstraint]

class ContractResult(BaseModel):
    is_valid: bool
    violations: List[str]

def validate_contract(contract: DataContract, profile_data: Dict[str, Any]) -> ContractResult:
    """
    Validates a table's profiler output against the defined Data Contract.
    `profile_data` is the dictionary output from `profiler.py -> profile_schema`.
    """
    violations = []
    
    if contract.table_name != profile_data.get("table"):
        violations.append(f"Table name mismatch. Expected {contract.table_name}, got {profile_data.get('table')}")
        return ContractResult(is_valid=False, violations=violations)

    profile_columns = profile_data.get("columns", {})

    for constraint in contract.columns:
        col_name = constraint.name
        
        if col_name not in profile_columns:
            violations.append(f"Missing required column: {col_name}")
            continue
            
        col_profile = profile_columns[col_name]
        
        # Check Null Rate
        if col_profile.get("null_rate", 0) > constraint.max_null_rate:
            violations.append(
                f"Column '{col_name}' null rate {col_profile.get('null_rate')} "
                f"exceeds max allowed {constraint.max_null_rate}"
            )
            
        # Check Uniqueness
        if constraint.is_unique and not col_profile.get("is_unique", False):
            violations.append(f"Column '{col_name}' violates uniqueness constraint")
            
        # Check Type (simple string match for MVP)
        if constraint.expected_type.lower() != col_profile.get("inferred_type", "").lower():
            # Soft check, types might be nuanced, but log it
            violations.append(
                f"Column '{col_name}' type mismatch. Expected {constraint.expected_type}, "
                f"inferred {col_profile.get('inferred_type')}"
            )

    return ContractResult(is_valid=len(violations) == 0, violations=violations)

# Mock Catalog helper for MVP
MOCK_CONTRACTS = {
    "dim_customers": DataContract(
        table_name="dim_customers",
        owner="marketing_analytics",
        description="Core customer dimension",
        columns=[
            ColumnConstraint(name="customer_id", expected_type="string", max_null_rate=0.0, is_unique=True),
            ColumnConstraint(name="email", expected_type="string", max_null_rate=0.05, is_unique=True),
        ]
    )
}
