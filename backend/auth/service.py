"""
All auth business logic lives here.
Routers call these functions — they never contain raw DB queries.
"""
import uuid
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from db.models.user import User
from db.models.role import Role
from auth.password import hash_password, verify_password
from auth.jwt import create_access_token, create_refresh_token
from cache.session import create_session, delete_session, get_session, update_access_token
from cache.blacklist import blacklist_token, is_blacklisted
from cache.client import redis_client
from mailer.service import email_service
from mailer.templates import verification_email, password_reset_email
from core.config import settings


def _error(code: str, message: str, http_status: int) -> HTTPException:
    """Helper: build a consistent HTTPException with our error shape."""
    return HTTPException(
        status_code=http_status,
        detail={"success": False, "error": {"code": code, "message": message, "status": http_status}},
    )


async def signup(email: str, password: str, full_name: str, db: AsyncSession) -> dict:
    email = email.lower()

    # Check duplicate — do NOT reveal if email exists
    result = await db.execute(select(User).where(User.email == email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # Return same message as success to prevent email enumeration
        return {"success": True, "message": "Check your email to verify your account."}

    # Fetch default role
    result = await db.execute(select(Role).where(Role.name == "user"))
    role = result.scalar_one_or_none()
    if not role:
        raise _error("ROLE_NOT_FOUND", "Default role not found. Run seed script.", 500)

    # Create user
    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        is_active=True,
        is_verified=False,
        role_id=role.id,
    )
    db.add(user)
    await db.flush()

    # Create verification token (UUID stored in Redis)
    verification_token = str(uuid.uuid4())
    await redis_client.setex(
        f"verify:{verification_token}",
        int(timedelta(hours=24).total_seconds()),
        str(user.id),
    )

    # Send verification email
    verify_url = f"{settings.APP_URL}/verify-email?token={verification_token}"
    await email_service.send(
        to=email,
        subject=f"Verify your {settings.APP_NAME} account",
        html=verification_email(verify_url),
    )

    await db.commit()

    return {"success": True, "message": "Check your email to verify your account."}


async def verify_email(token: str, db: AsyncSession) -> dict:
    user_id = await redis_client.get(f"verify:{token}")
    if not user_id:
        raise _error("TOKEN_INVALID", "Verification link expired. Request a new one.", 400)

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise _error("USER_NOT_FOUND", "User not found.", 404)

    user.is_verified = True
    await db.commit()
    await redis_client.delete(f"verify:{token}")

    # Auto-login after verification
    return await _create_auth_session(user, db)


async def login(email: str, password: str, db: AsyncSession) -> dict:
    email = email.lower()

    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    # Generic error — never reveal if email exists
    if not user:
        raise _error("INVALID_CREDENTIALS", "Invalid credentials.", 401)

    if not user.is_verified:
        raise _error("EMAIL_NOT_VERIFIED", "Please verify your email first.", 403)

    if not user.is_active:
        raise _error("ACCOUNT_SUSPENDED", "Account suspended. Contact support.", 403)

    if not verify_password(password, user.password_hash):
        raise _error("INVALID_CREDENTIALS", "Invalid credentials.", 401)

    return await _create_auth_session(user, db)


async def refresh_token(user_id: str, refresh_jti: str, db: AsyncSession) -> dict:
    # Check refresh token not blacklisted
    if await is_blacklisted(refresh_jti):
        raise _error("TOKEN_BLACKLISTED", "Session expired. Please log in again.", 401)

    # Check session still exists in Redis
    session = await get_session(user_id)
    if not session:
        raise _error("SESSION_NOT_FOUND", "Session expired. Please log in again.", 401)

    # Fetch user to get current role
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise _error("USER_NOT_FOUND", "User not found.", 404)

    role_result = await db.execute(select(Role).where(Role.id == user.role_id))
    role = role_result.scalar_one_or_none()

    # Generate new access token
    new_access_token, _ = create_access_token(str(user.id), user.email, role.name)
    await update_access_token(user_id, new_access_token)

    return {"success": True, "access_token": new_access_token}


async def logout(user_id: str, access_jti: str, access_ttl_seconds: int) -> dict:
    await blacklist_token(access_jti, access_ttl_seconds)
    await delete_session(user_id)
    return {"success": True, "message": "Logged out successfully."}


async def forgot_password(email: str, db: AsyncSession) -> dict:
    email = email.lower()

    # ALWAYS return the same message — never reveal if email exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        reset_token = str(uuid.uuid4())
        await redis_client.setex(
            f"reset:{reset_token}",
            int(timedelta(hours=1).total_seconds()),
            str(user.id),
        )
        reset_url = f"{settings.APP_URL}/reset-password?token={reset_token}"
        await email_service.send(
            to=email,
            subject=f"Reset your {settings.APP_NAME} password",
            html=password_reset_email(reset_url),
        )

    return {
        "success": True,
        "message": "If an account exists with this email, you will receive a reset link.",
    }


async def reset_password(token: str, new_password: str, db: AsyncSession) -> dict:
    user_id = await redis_client.get(f"reset:{token}")
    if not user_id:
        raise _error("TOKEN_INVALID", "Reset link expired. Request a new one.", 400)

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise _error("USER_NOT_FOUND", "User not found.", 404)

    user.password_hash = hash_password(new_password)
    await db.commit()

    # Invalidate ALL sessions across all devices
    await delete_session(str(user.id))
    await redis_client.delete(f"reset:{token}")

    return {"success": True, "message": "Password updated. Please log in with your new password."}


# ─── Internal helpers ─────────────────────────────────────────────────────────

async def _create_auth_session(user: User, db: AsyncSession) -> dict:
    """Shared logic: generate tokens, store Redis session, return auth response."""
    role_result = await db.execute(select(Role).where(Role.id == user.role_id))
    role = role_result.scalar_one()

    access_token,  _ = create_access_token(str(user.id), user.email, role.name)
    refresh_token_str, _ = create_refresh_token(str(user.id))

    await create_session(
        user_id=str(user.id),
        access_token=access_token,
        refresh_token=refresh_token_str,
        role=role.name,
        email=user.email,
        full_name=user.full_name,
    )

    return {
        "success": True,
        "access_token":  access_token,
        "refresh_token": refresh_token_str,
        "user": {
            "id":        str(user.id),
            "email":     user.email,
            "full_name": user.full_name,
            "role":      role.name,
        },
    }
