from sqlalchemy import Column, String, Boolean
from app.db.base import BaseModel


class Role(BaseModel):
    __tablename__ = "roles"

    name         = Column(String(50),  unique=True, nullable=False)  # super_admin | admin | user | guest
    display_name = Column(String(100), nullable=False)
    is_system    = Column(Boolean, default=True, nullable=False)      # system roles cannot be deleted
