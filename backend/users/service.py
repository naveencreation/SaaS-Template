"""
User management business logic.
Role changes force immediate logout by deleting Redis session.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from db.models.user import User
from db.models.role import Role
from auth.password import hash_password, verify_password
from cache.session import delete_session


def _error(code: str, message: str, http_status: int) -> HTTPException:
    return HTTPException(
        status_code=http_status,
        detail={"success": False, "error": {"code": code, "message": message, "status": http_status}},
    )


async def list_users(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())


async def get_user(user_id: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise _error("USER_NOT_FOUND", "User not found.", 404)
    return user


async def update_role(
    user_id: str,
    new_role_id: str,
    db: AsyncSession,
) -> User:
    """Change a user's role. Immediately deletes their Redis session (force logout)."""
    user = await get_user(user_id, db)

    # Verify the new role exists
    role_result = await db.execute(select(Role).where(Role.id == new_role_id))
    new_role = role_result.scalar_one_or_none()
    if not new_role:
        raise _error("ROLE_NOT_FOUND", "Target role does not exist.", 404)

    user.role_id = new_role_id
    await db.commit()

    # Force logout — delete session so user re-authenticates with new role
    await delete_session(str(user.id))

    return user


async def toggle_active(
    user_id: str,
    is_active: bool,
    db: AsyncSession,
) -> User:
    """Activate or suspend a user. Suspended users are immediately logged out."""
    user = await get_user(user_id, db)
    user.is_active = is_active
    await db.commit()

    if not is_active:
        await delete_session(str(user.id))

    return user


async def delete_user(user_id: str, db: AsyncSession) -> None:
    user = await get_user(user_id, db)
    await db.delete(user)
    await db.commit()
    await delete_session(str(user.id))


async def update_self(
    user_id: str,
    full_name: str,
    avatar_url: str | None,
    db: AsyncSession,
) -> User:
    """User updates their own profile."""
    user = await get_user(user_id, db)
    user.full_name = full_name
    if avatar_url is not None:
        user.avatar_url = avatar_url
    await db.commit()
    return user


async def change_password(
    user_id: str,
    current_password: str,
    new_password: str,
    db: AsyncSession,
) -> None:
    """Change own password. Requires current password. Invalidates ALL sessions."""
    user = await get_user(user_id, db)

    if not user.password_hash:
        raise _error("NO_PASSWORD", "OAuth users cannot change password.", 400)

    if not verify_password(current_password, user.password_hash):
        raise _error("INVALID_CREDENTIALS", "Current password is incorrect.", 401)

    user.password_hash = hash_password(new_password)
    await db.commit()

    # Invalidate all sessions across all devices
    await delete_session(str(user.id))
