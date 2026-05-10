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


class AnalyticsResponse(BaseModel):
    success: bool
    signup_trends: list[SignupTrend]
    role_distribution: list[RoleDistribution]
    login_activity: list[LoginActivity]
