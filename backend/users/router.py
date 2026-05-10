from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.session import get_db
from db.models.role import Role
from core.dependencies import get_current_user
from rbac.decorators import require_roles
from users import schemas, service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/roles", response_model=schemas.RoleListResponse)
async def list_roles(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all available roles (for dropdowns)."""
    result = await db.execute(select(Role).order_by(Role.name))
    roles = result.scalars().all()
    return {
        "success": True,
        "items": [{"id": str(r.id), "name": r.name, "display_name": r.display_name} for r in roles],
    }


@router.get("", response_model=schemas.UserListResponse)
@require_roles(["admin", "super_admin"])
async def list_users(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    users = await service.list_users(db)
    return {
        "success": True,
        "items": [{
            "id":        str(u.id),
            "email":     u.email,
            "full_name": u.full_name,
            "role":      u.role.name if u.role else "",
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "avatar_url": u.avatar_url,
            "created_at": u.created_at,
        } for u in users],
        "total": len(users),
    }


@router.get("/me", response_model=schemas.UserItemResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await service.get_user(current_user["user_id"], db)
    return {
        "success": True,
        "item": {
            "id":          str(user.id),
            "email":       user.email,
            "full_name":   user.full_name,
            "role":        user.role.name if user.role else "",
            "is_active":   user.is_active,
            "is_verified": user.is_verified,
            "avatar_url":  user.avatar_url,
            "created_at":  user.created_at,
        },
    }


@router.put("/me", response_model=schemas.UserItemResponse)
async def update_me(
    payload: schemas.UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await service.update_self(
        current_user["user_id"], payload.full_name, payload.avatar_url, db
    )
    return {
        "success": True,
        "item": {
            "id":          str(user.id),
            "email":       user.email,
            "full_name":   user.full_name,
            "role":        user.role.name if user.role else "",
            "is_active":   user.is_active,
            "is_verified": user.is_verified,
            "avatar_url":  user.avatar_url,
            "created_at":  user.created_at,
        },
    }


@router.put("/me/password", response_model=schemas.MessageResponse)
async def change_own_password(
    payload: schemas.ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await service.change_password(
        current_user["user_id"],
        payload.current_password,
        payload.new_password,
        db,
    )
    return {"success": True, "message": "Password updated. Please log in again."}


@router.get("/{user_id}", response_model=schemas.UserItemResponse)
@require_roles(["admin", "super_admin"])
async def get_user(
    user_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await service.get_user(str(user_id), db)
    return {
        "success": True,
        "item": {
            "id":          str(user.id),
            "email":       user.email,
            "full_name":   user.full_name,
            "role":        user.role.name if user.role else "",
            "is_active":   user.is_active,
            "is_verified": user.is_verified,
            "avatar_url":  user.avatar_url,
            "created_at":  user.created_at,
        },
    }


@router.put("/{user_id}/role", response_model=schemas.UserItemResponse)
@require_roles(["super_admin"])
async def update_user_role(
    user_id: UUID,
    payload: schemas.UpdateRoleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await service.update_role(str(user_id), payload.role_id, db)
    return {
        "success": True,
        "item": {
            "id":          str(user.id),
            "email":       user.email,
            "full_name":   user.full_name,
            "role":        user.role.name if user.role else "",
            "is_active":   user.is_active,
            "is_verified": user.is_verified,
            "avatar_url":  user.avatar_url,
            "created_at":  user.created_at,
        },
    }


@router.put("/{user_id}/active", response_model=schemas.UserItemResponse)
@require_roles(["admin", "super_admin"])
async def toggle_user_active(
    user_id: UUID,
    payload: schemas.UpdateActiveRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await service.toggle_active(str(user_id), payload.is_active, db)
    return {
        "success": True,
        "item": {
            "id":          str(user.id),
            "email":       user.email,
            "full_name":   user.full_name,
            "role":        user.role.name if user.role else "",
            "is_active":   user.is_active,
            "is_verified": user.is_verified,
            "avatar_url":  user.avatar_url,
            "created_at":  user.created_at,
        },
    }


@router.delete("/{user_id}", response_model=schemas.MessageResponse)
@require_roles(["super_admin"])
async def delete_user(
    user_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await service.delete_user(str(user_id), db)
    return {"success": True, "message": "User deleted successfully."}
