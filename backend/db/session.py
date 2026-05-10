from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from contextlib import contextmanager

from app.core.config import settings

# Async engine — used by FastAPI endpoints
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Sync engine — used ONLY by Alembic migrations and seed scripts
# Uses psycopg2 driver (not asyncpg)
SYNC_DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql+asyncpg", "postgresql"
)

sync_engine = create_engine(SYNC_DATABASE_URL, echo=False)
SyncSessionLocal = Session


@contextmanager
def get_db_context():
    """Sync context manager — used ONLY in seed.py and migration scripts."""
    session = SyncSessionLocal(bind=sync_engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
