from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date

from db.session import get_db
from db.models.user import User
from db.models.role import Role
from db.models.audit_log import AuditLog
from core.dependencies import get_current_user
from rbac.decorators import require_roles
from . import schemas

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=schemas.AnalyticsResponse)
@require_roles(["admin", "super_admin"])
async def get_analytics(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return signup trends, role distribution, and login activity for the analytics page."""
    now = datetime.now(timezone.utc)
    days_30 = now - timedelta(days=30)

    # Signup trends: count of users created per day for last 30 days
    signup_result = await db.execute(
        select(
            cast(User.created_at, Date).label("date"),
            func.count().label("count"),
        )
        .where(User.created_at >= days_30)
        .group_by(cast(User.created_at, Date))
        .order_by("date")
    )
    signup_trends = [
        schemas.SignupTrend(date=row.date, count=row.count)
        for row in signup_result.all()
    ]

    # Role distribution
    role_result = await db.execute(
        select(Role.name, func.count(User.id).label("count"))
        .outerjoin(User, Role.id == User.role_id)
        .group_by(Role.name)
        .order_by(func.count(User.id).desc())
    )
    role_distribution = [
        schemas.RoleDistribution(role=row.name, count=row.count)
        for row in role_result.all()
    ]

    # Login activity: audit_log entries with action='login' per day
    login_result = await db.execute(
        select(
            cast(AuditLog.created_at, Date).label("date"),
            func.count().label("count"),
        )
        .where(AuditLog.action == "login")
        .where(AuditLog.created_at >= days_30)
        .group_by(cast(AuditLog.created_at, Date))
        .order_by("date")
    )
    login_activity = [
        schemas.LoginActivity(date=row.date, count=row.count)
        for row in login_result.all()
    ]

    return {
        "success": True,
        "item": {
            "signup_trends": [{"date": str(t.date), "count": t.count} for t in signup_trends],
            "role_distribution": [{"role": r.role, "count": r.count} for r in role_distribution],
            "login_activity": [{"date": str(a.date), "count": a.count} for a in login_activity],
        },
    }
