"""
Seed script — inserts system roles and super admin user.
Safe to run multiple times (idempotent).
"""
import logging

from app.db.session import get_db_context
from app.db.models.role import Role
from app.db.models.user import User
from app.db.models.oauth_account import OAuthAccount  # noqa: F401  (needed for SQLAlchemy mapper resolution)
from app.db.models.audit_log import AuditLog          # noqa: F401  (needed for SQLAlchemy mapper resolution)
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SYSTEM_ROLES = [
    {"name": "super_admin", "display_name": "Super Admin"},
    {"name": "admin",       "display_name": "Admin"},
    {"name": "user",        "display_name": "User"},
    {"name": "guest",       "display_name": "Guest"},
]


def hash_password(password: str) -> str:
    """Temporary hash function for seed. Phase 3 will centralise this in auth/service.py."""
    import bcrypt
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def seed():
    logger.info("Running seed script...")

    with get_db_context() as db:
        # --- Seed roles ---
        for role_data in SYSTEM_ROLES:
            existing = db.query(Role).filter_by(name=role_data["name"]).first()
            if not existing:
                db.add(Role(**role_data, is_system=True))
                logger.info(f"  ✅ Created role: {role_data['name']}")
            else:
                logger.info(f"  ⏭  Role already exists: {role_data['name']}")

        db.commit()

        # --- Seed super admin ---
        super_admin_role = db.query(Role).filter_by(name="super_admin").first()

        existing_admin = db.query(User).filter_by(
            email=settings.SUPER_ADMIN_EMAIL.lower()
        ).first()

        if not existing_admin:
            admin_user = User(
                email=settings.SUPER_ADMIN_EMAIL.lower(),
                password_hash=hash_password(settings.SUPER_ADMIN_PASSWORD),
                full_name="Super Admin",
                is_active=True,
                is_verified=True,
                role_id=super_admin_role.id,
            )
            db.add(admin_user)
            db.commit()
            logger.info(f"  ✅ Created super admin: {settings.SUPER_ADMIN_EMAIL}")
        else:
            logger.info(f"  ⏭  Super admin already exists: {settings.SUPER_ADMIN_EMAIL}")

    logger.info("Seed complete.")


if __name__ == "__main__":
    seed()
