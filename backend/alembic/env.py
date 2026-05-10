import os
import sys
import importlib.util
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Add backend to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.base import Base

# Import ALL template models so Alembic can see them for autogenerate
from app.db.models.role import Role
from app.db.models.user import User
from app.db.models.oauth_account import OAuthAccount
from app.db.models.audit_log import AuditLog

# ── Auto-discover business/*/models.py ──────────────────────────────────
# Any model imported here will be included in alembic autogenerate.
def _import_business_models():
    backend_dir = Path(__file__).parent.parent
    business_dir = backend_dir / "business"
    if not business_dir.exists():
        return
    for models_file in business_dir.glob("*/models.py"):
        # Skip underscore-prefixed documentation folders
        if models_file.parent.name.startswith("_"):
            continue
        module_name = f"business.{models_file.parent.name}.models"
        spec = importlib.util.spec_from_file_location(module_name, models_file)
        if spec is None or spec.loader is None:
            continue
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        print(f"  → Alembic discovered business model: {models_file.parent.name}")


_import_business_models()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Build sync URL from settings (Alembic uses psycopg2, not asyncpg)
SYNC_URL = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")


def run_migrations_offline() -> None:
    context.configure(
        url=SYNC_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = SYNC_URL

    connectable = engine_from_config(
        cfg,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
