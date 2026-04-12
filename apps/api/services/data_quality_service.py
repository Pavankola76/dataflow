"""Data Quality Evaluation Service."""

import os
import uuid
import json
import logging
import duckdb

from database import async_session
from models.governance import DataContract, ContractViolation
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

class DataQualityService:
    @staticmethod
    async def evaluate(pipeline_id: str, run_id: str, local_path: str, extracted_tables: list[str]) -> bool:
        """Evaluates extracted tables locally via DuckDB before uploading to MinIO."""
        all_passed = True
        
        async with async_session() as session:
            for table in extracted_tables:
                table_path = os.path.join(local_path, table, "part-00000.parquet")
                if not os.path.exists(table_path):
                    continue
                
                # Retrieve active contract
                stmt = select(DataContract).where(
                    DataContract.table_name == table,
                    DataContract.status == "active"
                )
                result = await session.execute(stmt)
                contract = result.scalars().first()
                
                if not contract:
                    continue  # No contract to enforce
                    
                logger.info(f"Evaluating Data Contract for table '{table}'")
                
                violations = []
                
                # Execute Checks via DuckDB
                conn = duckdb.connect()
                row_count = conn.execute(f"SELECT COUNT(*) FROM '{table_path}'").fetchone()[0]
                
                if row_count == 0:
                    continue # Skip empty tables
                
                # Check Quality Rules
                quality_rules = contract.quality_contract or {}
                max_null_rate = quality_rules.get("max_null_rate", 0.05)
                # Ensure it's evaluated for critical columns or entirely? The AI generator mock sets a global one.
                # If specific columns aren't defined, test it against primary PII/keys or just check for missing columns.
                
                # Schema Checks
                schema_rules = contract.schema_contract or {}
                required_columns = schema_rules.get("columns", [])
                
                columns_meta = conn.execute(f"DESCRIBE SELECT * FROM '{table_path}'").fetchall()
                actual_columns = {row[0] for row in columns_meta}
                
                for col in required_columns:
                    col_name = col.get("name")
                    if col_name and col_name not in actual_columns:
                        violations.append({
                            "type": "schema_mismatch",
                            "severity": "critical",
                            "message": f"Column '{col_name}' is missing from extracted data."
                        })
                
                # Record violations
                for viol in violations:
                    v_record = ContractViolation(
                        id=uuid.uuid4(),
                        contract_id=contract.id,
                        pipeline_run_id=uuid.UUID(run_id),
                        violation_type=viol["type"],
                        details=viol,
                        severity=viol["severity"]
                    )
                    session.add(v_record)
                    
                    if contract.enforcement_mode == "block" and viol["severity"] == "critical":
                        all_passed = False
                    
            await session.commit()
            
        return all_passed
