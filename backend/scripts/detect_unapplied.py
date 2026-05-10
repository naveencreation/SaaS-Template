"""
Dev only — detects model changes that have no migration yet.
Auto-generates and applies them with a loud warning.
Never runs in production (check_prod_migrations.py handles that).
"""
import subprocess
import sys
import os

if os.getenv("ENVIRONMENT") == "production":
    sys.exit(0)

result = subprocess.run(
    ["alembic", "check"],
    capture_output=True,
    text=True,
    cwd=os.path.dirname(os.path.dirname(__file__)),
)

if result.returncode != 0 or "New upgrade operations detected" in result.stdout:
    print("⚠️  WARNING: Unapplied model changes detected.")
    print("   Auto-generating migration for development...")

    subprocess.run(
        ["alembic", "revision", "--autogenerate", "-m", "auto_migration"],
        cwd=os.path.dirname(os.path.dirname(__file__)),
    )
    subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd=os.path.dirname(os.path.dirname(__file__)),
    )

    print("✅ Migration auto-applied.")
    print("   ⚠️  REVIEW the generated migration file before deploying to production.")
else:
    print("✅ All migrations up to date.")
