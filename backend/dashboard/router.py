from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from db.session import get_db
from db.models.user import User
from db.models.audit_log import AuditLog
from db.models.role import Role
from core.dependencies import get_current_user
from rbac.decorators import require_roles
from . import schemas
from cache.client import redis_client

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStatsResponse)
@require_roles(["admin", "super_admin"])
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return high-level stats for the admin dashboard home page."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    # Total users
    total_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_result.scalar_one()

    # Active users
    active_result = await db.execute(
        select(func.count()).select_from(User).where(User.is_active == True)
    )
    active_users = active_result.scalar_one()

    # New this week
    new_result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(User.created_at >= week_ago)
    )
    new_this_week = new_result.scalar_one()

    # Recent activity (last 10 audit logs)
    audit_result = await db.execute(
        select(AuditLog, User.email)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .limit(10)
    )
    recent_activity = [
        schemas.RecentActivity(
            action=row.AuditLog.action,
            user_email=row.email,
            created_at=row.AuditLog.created_at,
        )
        for row in audit_result.all()
    ]

    # System status
    db_status = "ok"
    redis_status = "ok"
    try:
        await db.execute(select(func.count()).select_from(User))
    except Exception:
        db_status = "error"
    try:
        await redis_client.ping()
    except Exception:
        redis_status = "error"

    return {
        "success": True,
        "item": {
            "total_users": total_users,
            "active_users": active_users,
            "new_this_week": new_this_week,
            "recent_activity": [
                {"action": a.action, "user_email": a.user_email, "created_at": a.created_at.isoformat()}
                for a in recent_activity
            ],
            "system_status": {"db": db_status, "redis": redis_status},
        },
    }
