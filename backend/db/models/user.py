from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email         = Column(String(255), unique=True, nullable=False, index=True)  # always lowercase
    password_hash = Column(String,      nullable=True)   # null for OAuth-only users
    full_name     = Column(String(100), nullable=False)
    avatar_url    = Column(String,      nullable=True)
    is_active     = Column(Boolean, default=True,  nullable=False)
    is_verified   = Column(Boolean, default=False, nullable=False)
    role_id       = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)

    role           = relationship("Role",         back_populates=None, lazy="selectin")
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
