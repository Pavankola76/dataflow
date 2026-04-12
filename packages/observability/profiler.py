"""Data profiling engine."""

class DataProfiler:
    def profile_schema(self, table_id: str, sample_data: list) -> dict:
        return {"table": table_id, "columns": {}, "row_count": len(sample_data)}
