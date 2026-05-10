from pydantic import BaseModel, field_validator
from datetime import datetime


class MessageResponse(BaseModel):
    success: bool = True
    message: str


class UserResponse(BaseModel):
    id:            str
    email:         str
    full_name:     str
    role:          str
    is_active:     bool
    is_verified:   bool
    avatar_url:    str | None = None
    created_at:    datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    success: bool = True
    items:   list[UserResponse]
    total:   int


class UpdateRoleRequest(BaseModel):
    role_id: str


class UpdateActiveRequest(BaseModel):
    is_active: bool


class RoleListItem(BaseModel):
    id: str
    name: str
    display_name: str


class RoleListResponse(BaseModel):
    success: bool
    items: list[RoleListItem]


class UpdateProfileRequest(BaseModel):
    full_name: str
    avatar_url: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password:     str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number.")
        return v
