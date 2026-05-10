"""
Production only — blocks deployment if unapplied migrations exist.
Exits with code 1 (stops the migrate service, which stops backend from starting).
"""
import subprocess
import sys
import os

if os.getenv("ENVIRONMENT") != "production":
    sys.exit(0)

result = subprocess.run(
    ["alembic", "check"],
    capture_output=True,
    text=True,
    cwd=os.path.dirname(os.path.dirname(__file__)),
)

if result.returncode != 0 or "New upgrade operations detected" in result.stdout:
    print("⛔ ERROR: Unapplied migrations detected in production.")
    print("   Run 'alembic revision --autogenerate' locally,")
    print("   commit the migration file, then redeploy.")
    sys.exit(1)

print("✅ Production migrations are up to date.")
