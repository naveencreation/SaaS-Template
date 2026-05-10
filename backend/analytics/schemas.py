from datetime import date
from pydantic import BaseModel


class SignupTrend(BaseModel):
    date: date
    count: int


class RoleDistribution(BaseModel):
    role: str
    count: int


class LoginActivity(BaseModel):
    date: date
    count: int


class AnalyticsItem(BaseModel):
    signup_trends: list[dict]   # serialized dicts, not SignupTrend objects
    role_distribution: list[dict]
    login_activity: list[dict]


class AnalyticsResponse(BaseModel):
    success: bool
    item: AnalyticsItem
