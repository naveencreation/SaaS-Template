from datetime import datetime
from typing import Any
from pydantic import BaseModel


class SystemStatus(BaseModel):
    db: str  # "ok" | "error"
    redis: str  # "ok" | "error"


class RecentActivity(BaseModel):
    action: str
    user_email: str | None
    created_at: datetime


class DashboardStatsItem(BaseModel):
    total_users: int
    active_users: int
    new_this_week: int
    recent_activity: list[Any]  # serialized dicts, not RecentActivity objects
    system_status: SystemStatus


class DashboardStatsResponse(BaseModel):
    success: bool
    item: DashboardStatsItem
