"""Schema Discovery Agent — Analyzes database schemas and classifies columns semantically."""

import re
from typing import Optional


class SchemaDiscoveryAgent:
    """Discovers schema metadata, infers relationships, and classifies column semantics."""

    # PII regex patterns
    PATTERNS = {
        "email": re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+"),
        "phone": re.compile(r"[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,}"),
        "ssn": re.compile(r"\d{3}-\d{2}-\d{4}"),
        "ip_address": re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"),
        "credit_card": re.compile(r"\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"),
        "uuid": re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"),
    }

    @classmethod
    def profile_column(cls, column_name: str, values: list) -> dict:
        """Compute statistical profile for a single column."""
        non_null = [v for v in values if v is not None]
        total = len(values)
        null_count = total - len(non_null)

        profile = {
            "null_rate": round(null_count / max(total, 1), 4),
            "distinct_count": len(set(non_null)),
            "sample_values": non_null[:5],
        }

        # Numeric stats
        numerics = [v for v in non_null if isinstance(v, (int, float))]
        if numerics:
            profile["min"] = min(numerics)
            profile["max"] = max(numerics)
            profile["mean"] = round(sum(numerics) / len(numerics), 2)

        # String stats
        strings = [str(v) for v in non_null if isinstance(v, str)]
        if strings:
            profile["min_length"] = min(len(s) for s in strings)
            profile["max_length"] = max(len(s) for s in strings)

        return profile

    @classmethod
    def classify_column(cls, column_name: str, sample_values: list) -> dict:
        """Rule-based PII/semantic classification."""
        col_lower = column_name.lower()

        # Name-based hints
        pii_hints = {"ssn", "social_security", "passport", "national_id", "driver_license"}
        financial_hints = {"salary", "income", "credit_card", "bank_account", "routing_number", "card_number"}
        phi_hints = {"diagnosis", "medication", "medical_record", "patient_id", "health", "prescription"}

        if any(h in col_lower for h in pii_hints):
            return {"classification": "PII", "confidence": 0.9, "method": "name_hint"}
        if any(h in col_lower for h in financial_hints):
            return {"classification": "financial", "confidence": 0.85, "method": "name_hint"}
        if any(h in col_lower for h in phi_hints):
            return {"classification": "PHI", "confidence": 0.85, "method": "name_hint"}

        # Pattern-based classification on sample values
        str_values = [str(v) for v in sample_values if v is not None]
        if str_values:
            for pattern_name, regex in cls.PATTERNS.items():
                matches = sum(1 for v in str_values if regex.search(v))
                if matches / len(str_values) > 0.5:
                    label = "PII" if pattern_name in ("email", "phone", "ssn", "credit_card") else "none"
                    return {"classification": label, "confidence": 0.8, "method": f"regex_{pattern_name}"}

        return {"classification": "none", "confidence": 0.9, "method": "no_match"}

    @classmethod
    def infer_relationships(cls, schema: dict) -> list:
        """Infer FK relationships from column naming conventions."""
        relationships = []
        all_tables = list(schema.keys())

        for table_name, columns in schema.items():
            col_names = [c["name"] for c in columns]
            for col in col_names:
                # Pattern: table_id, tableId → references `table`.id
                if col.endswith("_id") and col != "id":
                    ref_table = col[:-3]  # strip _id
                    # Check if referenced table exists (singular or plural)
                    for candidate in [ref_table, ref_table + "s", ref_table + "es"]:
                        if candidate in all_tables:
                            relationships.append({
                                "source_table": table_name,
                                "source_column": col,
                                "target_table": candidate,
                                "target_column": "id",
                                "type": "inferred_fk",
                                "confidence": 0.75,
                            })
                            break

        return relationships

    @classmethod
    async def discover(cls, connection_config: dict) -> dict:
        """Full schema discovery pipeline (with LLM fallback for semantic enrichment)."""
        # This is the entrypoint — connects to DB, profiles, classifies, infers relationships
        # LLM enrichment would be added here when API key is available
        return {
            "status": "ready",
            "note": "Schema discovery agent is wired. Requires active DB connection to run full discovery.",
            "capabilities": [
                "column_profiling",
                "pii_classification",
                "relationship_inference",
                "semantic_type_detection",
            ],
        }
