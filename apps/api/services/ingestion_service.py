"""Ingestion service — AI-Native ETL execution and auto-healing loop."""

import os
import uuid
import asyncio
import subprocess
from datetime import datetime, timezone
import json

from config import get_settings
from services.agents.core_agents import PySparkGeneratorAgent, HealingAgent

class IngestionService:
    """Orchestrates data extraction, execution, and auto-healing."""

    @staticmethod
    async def run_ingestion(
        run_id: str,
        pipeline_id: str,
        connector_type: str,
        connection_config: dict,
        pipeline_config: dict,
    ):
        settings = get_settings()
        import sqlalchemy
        
        # Determine Target Path — organized by pipeline and run
        target_dir = f"/tmp/dataflow/lake/{pipeline_id}/{run_id}"
        os.makedirs(target_dir, exist_ok=True)
        target_path = target_dir
        
        script_dir = "/tmp/dataflow/scripts"
        os.makedirs(script_dir, exist_ok=True)
        script_path = f"{script_dir}/run_{run_id}.py"

        # Build real schema info from the pipeline config
        tables = pipeline_config.get("tables", pipeline_config.get("selected_tables", ["public.users"]))
        schema_info = f"Tables to extract: {', '.join(tables)}."

        print(f"[{run_id}] 🤖 Calling PySparkGeneratorAgent (real extraction mode)...")
        try:
            extraction_code = await PySparkGeneratorAgent.generate_script(
                connection_type=connector_type,
                source_schema=schema_info,
                target_path=target_path,
                requirements="Extract all data from source tables.",
                connection_config=connection_config,
            )
        except Exception as e:
            await IngestionService._update_run_status(run_id, "failed", f"Agent Generation Failed: {str(e)}")
            return

        with open(script_path, "w") as f:
            f.write(extraction_code)
            
        # The Execution + Auto-Healing Loop
        max_retries = 2
        success = False
        final_error = ""

        for attempt in range(max_retries + 1):
            print(f"[{run_id}] 🚀 Executing extraction script (Attempt {attempt + 1}/{max_retries + 1})...")
            
            process = await asyncio.create_subprocess_shell(
                f"python {script_path}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=dict(os.environ)
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                print(f"[{run_id}] ✨ Extraction Succeeded!")
                print(stdout.decode())
                success = True
                break
            else:
                err_text = stderr.decode()
                print(f"[{run_id}] ❌ Extraction Failed:\n{err_text}")
                
                if attempt < max_retries:
                    print(f"[{run_id}] 🚑 Calling HealingAgent for auto-correction...")
                    with open(script_path, "r") as f:
                        current_code = f.read()
                        
                    try:
                        healed_code = await HealingAgent.fix_code(current_code, err_text)
                    except Exception as healing_err:
                        final_error = f"Healing Agent failed: {str(healing_err)}\n\nOriginal Error:\n{err_text}"
                        break
                        
                    script_path = f"{script_dir}/run_{run_id}_attempt_{attempt+1}.py"
                    with open(script_path, "w") as f:
                        f.write(healed_code)
                else:
                    final_error = f"Max retries exceeded. Last error:\n{err_text}"

        # Read real extraction metadata if available
        metadata_path = os.path.join(target_path, "_metadata.json")
        real_rows = 0
        real_duration = 15
        tables_extracted = 0
        if success and os.path.exists(metadata_path):
            try:
                with open(metadata_path, "r") as mf:
                    meta = json.load(mf)
                    real_rows = meta.get("total_rows", 0)
                    real_duration = meta.get("duration_seconds", 15)
                    tables_extracted = meta.get("tables_extracted", 0)
            except Exception:
                pass

        # Compute real byte size from parquet files
        real_bytes = 0
        extracted_tables_list = []
        if success:
            for root, dirs, files in os.walk(target_path):
                for file in files:
                    if file.endswith(".parquet"):
                        real_bytes += os.path.getsize(os.path.join(root, file))
            # Build list of successfully extracted tables for quality check
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, "r") as mf:
                        meta = json.load(mf)
                        all_attempted = [t.strip().split(".")[-1] for t in tables]
                        failed_tb = meta.get("failed_tables", [])
                        extracted_tables_list = [t for t in all_attempted if t not in failed_tb]
                except Exception:
                    pass

        # Execute Data Quality Contracts
        if success and extracted_tables_list:
            from services.data_quality_service import DataQualityService
            passed_quality = await DataQualityService.evaluate(
                pipeline_id=pipeline_id,
                run_id=run_id,
                local_path=target_path,
                extracted_tables=extracted_tables_list
            )
            if not passed_quality:
                success = False
                final_error = "Data Quality Contract Violation (Severity: Critical, Mode: Block). Pipeline halted."

        # Execute Silver/Gold Transformations
        transform_meta = None
        if success and extracted_tables_list:
            try:
                from services.transformation_service import TransformationService
                transform_meta = await TransformationService.run_transformations(
                    pipeline_id=pipeline_id,
                    run_id=run_id,
                    bronze_path=target_path,
                    extracted_tables=extracted_tables_list
                )
                print(f"[{run_id}] 🏆 Transformations complete: {transform_meta.get('silver_tables', 0)} Silver, {transform_meta.get('gold_tables', 0)} Gold tables")
            except Exception as e:
                print(f"[{run_id}] ⚠️ Transformation warning (non-blocking): {str(e)}")

        # Update Database Record + Upload to MinIO
        if success:
            try:
                # Upload Bronze
                await asyncio.to_thread(IngestionService._upload_to_minio, target_path, pipeline_id, run_id)
                # Upload Silver and Gold if transformations succeeded
                if transform_meta:
                    silver_path = transform_meta.get("silver_path")
                    gold_path = transform_meta.get("gold_path")
                    if silver_path and os.path.exists(silver_path):
                        await asyncio.to_thread(IngestionService._upload_to_minio, silver_path, pipeline_id, f"{run_id}/silver")
                    if gold_path and os.path.exists(gold_path):
                        await asyncio.to_thread(IngestionService._upload_to_minio, gold_path, pipeline_id, f"{run_id}/gold")
                await IngestionService._update_run_status(
                    run_id, "succeeded", error_log=None,
                    rows=real_rows, bytes_size=real_bytes, duration=real_duration
                )
                # Auto-populate data catalog (Bronze)
                await IngestionService._auto_populate_catalog(
                    pipeline_id, target_path, tables_extracted
                )
                # Auto-populate catalog for Silver/Gold
                if transform_meta:
                    await IngestionService._auto_populate_catalog(
                        pipeline_id, transform_meta.get("silver_path", ""),
                        transform_meta.get("silver_tables", 0), layer="silver"
                    )
                    await IngestionService._auto_populate_catalog(
                        pipeline_id, transform_meta.get("gold_path", ""),
                        transform_meta.get("gold_tables", 0), layer="gold"
                    )
            except Exception as e:
                await IngestionService._update_run_status(run_id, "failed", error_log=f"MinIO Upload Failed: {str(e)}")
        else:
            await IngestionService._update_run_status(run_id, "failed", error_log=final_error)

    @staticmethod
    def _upload_to_minio(local_path: str, pipeline_id: str, run_id: str):
        import boto3
        import botocore.client
        from config import get_settings
        settings = get_settings()
        
        s3 = boto3.client(
            "s3",
            endpoint_url=f"http://{settings.minio_endpoint}",
            aws_access_key_id=settings.minio_access_key,
            aws_secret_access_key=settings.minio_secret_key,
            config=botocore.client.Config(signature_version="s3v4", s3={'addressing_style': 'path'}),
            region_name="us-east-1"
        )
        bucket = settings.minio_bucket
        
        try:
            s3.head_bucket(Bucket=bucket)
        except Exception:
            s3.create_bucket(Bucket=bucket)
            
        for root, dirs, files in os.walk(local_path):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_path)
                s3_key = f"pipelines/{pipeline_id}/{run_id}/{rel_path}"
                s3.upload_file(full_path, bucket, s3_key)

    @staticmethod
    async def _update_run_status(run_id: str, status: str, error_log: str = None, rows: int = 0, bytes_size: int = 0, duration: float = 0):
        from database import async_session
        from sqlalchemy import update
        from models.pipeline import PipelineRun
        
        try:
            async with async_session() as db:
                completed_at = datetime.now(timezone.utc)
                
                if status == "succeeded":
                    await db.execute(
                        update(PipelineRun)
                        .where(PipelineRun.id == run_id)
                        .values(
                            status=status,
                            completed_at=completed_at,
                            rows_processed=rows,
                            bytes_processed=bytes_size,
                            duration_seconds=int(duration)
                        )
                    )
                else:
                    await db.execute(
                        update(PipelineRun)
                        .where(PipelineRun.id == run_id)
                        .values(
                            status=status,
                            completed_at=completed_at,
                            error_log=error_log
                        )
                    )
                await db.commit()
        except Exception as e:
            print(f"Failed to update metadata db: {e}")

    @staticmethod
    async def _auto_populate_catalog(pipeline_id: str, target_path: str, tables_extracted: int, layer: str = "bronze"):
        """Auto-register extracted tables into the data catalog."""
        import duckdb
        from database import async_session
        from models.governance import DataCatalog
        
        if tables_extracted == 0:
            return
        
        try:
            async with async_session() as db:
                # Walk through the parquet output directories
                for table_dir in os.listdir(target_path):
                    table_path = os.path.join(target_path, table_dir)
                    if not os.path.isdir(table_path):
                        continue
                    
                    parquet_file = os.path.join(table_path, "part-00000.parquet")
                    if not os.path.exists(parquet_file):
                        continue
                    
                    # Introspect parquet schema using DuckDB
                    try:
                        conn = duckdb.connect()
                        schema_rows = conn.execute(f"DESCRIBE SELECT * FROM '{parquet_file}'").fetchall()
                        row_count = conn.execute(f"SELECT COUNT(*) FROM '{parquet_file}'").fetchone()[0]
                        conn.close()
                        
                        columns = [
                            {"name": r[0], "type": r[1], "nullable": True}
                            for r in schema_rows
                        ]
                        
                        # Use a unique catalog name that includes layer
                        catalog_name = f"{table_dir}" if layer == "bronze" else f"{table_dir}_{layer}"
                        
                        # Upsert into data catalog
                        from sqlalchemy import select
                        result = await db.execute(
                            select(DataCatalog).where(DataCatalog.table_name == catalog_name)
                        )
                        existing = result.scalar_one_or_none()
                        
                        if existing:
                            existing.column_count = len(columns)
                            existing.row_count = row_count
                            existing.last_updated = datetime.now(timezone.utc)
                        else:
                            catalog_entry = DataCatalog(
                                table_name=catalog_name,
                                layer=layer,
                                database_name="dataflow-lake",
                                schema_name=f"pipelines/{pipeline_id}",
                                column_count=len(columns),
                                row_count=row_count,
                                description=f"Auto-discovered {layer} table from pipeline {pipeline_id}.",
                            )
                            db.add(catalog_entry)
                    except Exception as inner_err:
                        print(f"Catalog introspection failed for {table_dir}: {inner_err}")
                        continue
                
                await db.commit()
                print(f"📚 Auto-populated {tables_extracted} table(s) into the Data Catalog.")
        except Exception as e:
            print(f"Data Catalog auto-population failed: {e}")

