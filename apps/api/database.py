"""DataFlow AI — Database Setup."""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=settings.app_debug,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """Dependency that yields a database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

import duckdb

def get_warehouse_conn():
    """Returns a DuckDB connection to the local data warehouse with MinIO connectivity."""
    conn = duckdb.connect(settings.warehouse_db_path)
    # Enable MinIO / S3 connectivity natively
    conn.execute("INSTALL httpfs;")
    conn.execute("LOAD httpfs;")
    
    # Configure MinIO credentials securely for this connection using new Secret Manager
    use_ssl_str = "true" if settings.minio_use_ssl else "false"
    secret_sql = f"""
    CREATE SECRET IF NOT EXISTS minio_secret (
        TYPE S3,
        KEY_ID '{settings.minio_access_key}',
        SECRET '{settings.minio_secret_key}',
        REGION 'us-east-1',
        ENDPOINT '{settings.minio_endpoint}',
        URL_STYLE 'path',
        USE_SSL {use_ssl_str}
    );
    """
    conn.execute(secret_sql)
    return conn


async def init_db():
    """Create all tables on startup."""
    async with engine.begin() as conn:
        from models import connection, pipeline, user  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
