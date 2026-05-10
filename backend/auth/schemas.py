from pydantic import BaseModel, EmailStr, field_validator
import re


class SignupRequest(BaseModel):
    email:     EmailStr
    password:  str
    full_name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token:        str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        return v


class UserResponse(BaseModel):
    id:        str
    email:     str
    full_name: str
    role:      str

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    success: bool = True
    user:    UserResponse


class MessageResponse(BaseModel):
    success: bool = True
    message: str


class ErrorDetail(BaseModel):
    code:    str
    message: str
    status:  int


class ErrorResponse(BaseModel):
    success: bool = False
    error:   ErrorDetail
