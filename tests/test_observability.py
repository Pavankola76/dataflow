import pytest
from packages.observability.contracts import DataContract, validate_contract, ColumnConstraint

def test_data_contract_validation():
    # Define a test contract
    contract = DataContract(
        table_name="ecommerce_raw",
        columns=[
            ColumnConstraint(name="id", expected_type="integer", max_null_rate=0.0, is_unique=True),
            ColumnConstraint(name="email", expected_type="string", max_null_rate=0.05, is_unique=False)
        ]
    )
    
    # Valid mock profile from profiler.py
    valid_profile = {
        "table": "ecommerce_raw",
        "columns": {
            "id": {"inferred_type": "integer", "null_rate": 0.0, "is_unique": True},
            "email": {"inferred_type": "string", "null_rate": 0.02, "is_unique": False}
        }
    }
    
    # Test valid case
    res1 = validate_contract(contract, valid_profile)
    assert res1.is_valid is True
    assert len(res1.violations) == 0

    # Invalid mock profile
    invalid_profile = {
        "table": "ecommerce_raw",
        "columns": {
            "id": {"inferred_type": "integer", "null_rate": 0.0, "is_unique": False}, # Uniqueness violation
            "email": {"inferred_type": "string", "null_rate": 0.10, "is_unique": False} # Null rate violation
        }
    }
    
    # Test invalid case
    res2 = validate_contract(contract, invalid_profile)
    assert res2.is_valid is False
    assert len(res2.violations) == 2
    
    # Check violation messages contain the hints
    violation_text = str(res2.violations)
    assert "null rate" in violation_text
    assert "uniqueness" in violation_text
