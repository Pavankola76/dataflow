"""DataFlow AI — Application Config."""

from pydantic_settings import BaseSettings
from pydantic import model_validator
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_name: str = "DataFlow AI"
    app_env: str = "development"
    app_debug: bool = True
    run_scheduler: bool = True

    # Database
    database_url: str = "postgresql+asyncpg://dataflow:dataflow_pass@localhost:5432/dataflow"
    database_url_sync: str = "postgresql://dataflow:dataflow_pass@localhost:5432/dataflow"
    
    # Data Warehouse (DuckDB)
    warehouse_db_path: str = "./warehouse.duckdb"

    # LLM Settings
    openai_api_key: str = ""
    google_api_key: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "dataflow-lake"
    minio_use_ssl: bool = False

    # Auth
    jwt_secret: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 15
    jwt_refresh_expiration_days: int = 7

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # Encryption
    encryption_key: str = "01234567890123456789012345678901"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @model_validator(mode="after")
    def check_production_secrets(self) -> 'Settings':
        if self.app_env == "production":
            if self.jwt_secret == "dev-secret-key-change-in-production":
                raise ValueError("In production mode, JWT_SECRET MUST be set to a secure string.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
