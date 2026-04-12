"""CSV/File Upload Connector — Handles local file uploads."""

import os
import time
from typing import Any, Dict

from packages.connectors.base import BaseConnector


class FileUploadConnector(BaseConnector):
    """Handles CSV, JSON, and Parquet file uploads."""

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.file_path = config.get("file_path", "")
        self.file_type = config.get("file_type", "csv")  # csv, json, parquet

    async def test_connection(self) -> Dict[str, Any]:
        if not os.path.exists(self.file_path):
            return {"success": False, "message": f"File not found: {self.file_path}"}
        size = os.path.getsize(self.file_path)
        return {"success": True, "message": f"File exists ({size:,} bytes)", "latency_ms": 0}

    async def discover_schema(self) -> Dict[str, Any]:
        if self.file_type == "csv":
            import csv
            with open(self.file_path, "r") as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames or []
                sample = []
                for i, row in enumerate(reader):
                    if i >= 5:
                        break
                    sample.append(row)
            return {
                "file": os.path.basename(self.file_path),
                "type": "csv",
                "columns": [{"name": h, "type": "string"} for h in headers],
                "sample_rows": sample,
            }

        elif self.file_type == "parquet":
            import pyarrow.parquet as pq
            schema = pq.read_schema(self.file_path)
            return {
                "file": os.path.basename(self.file_path),
                "type": "parquet",
                "columns": [{"name": f.name, "type": str(f.type)} for f in schema],
                "row_count": pq.ParquetFile(self.file_path).metadata.num_rows,
            }

        elif self.file_type == "json":
            import json
            with open(self.file_path, "r") as f:
                data = json.load(f)
            if isinstance(data, list) and data:
                columns = list(data[0].keys())
                return {
                    "file": os.path.basename(self.file_path),
                    "type": "json",
                    "columns": [{"name": c, "type": "any"} for c in columns],
                    "row_count": len(data),
                }
            return {"file": os.path.basename(self.file_path), "type": "json", "columns": [], "note": "Non-array JSON"}

        return {"error": f"Unsupported file type: {self.file_type}"}

    async def extract_data(self, table_name: str, batch_size: int = 1000):
        if self.file_type == "csv":
            import csv
            with open(self.file_path, "r") as f:
                reader = csv.DictReader(f)
                batch = []
                for row in reader:
                    batch.append(row)
                    if len(batch) >= batch_size:
                        yield batch
                        batch = []
                if batch:
                    yield batch

        elif self.file_type == "parquet":
            import pyarrow.parquet as pq
            table = pq.read_table(self.file_path)
            for rb in table.to_batches(max_chunksize=batch_size):
                yield rb.to_pydict()

        elif self.file_type == "json":
            import json
            with open(self.file_path, "r") as f:
                data = json.load(f)
            if isinstance(data, list):
                for i in range(0, len(data), batch_size):
                    yield data[i:i + batch_size]

    async def health_check(self) -> bool:
        return os.path.exists(self.file_path)
