from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from app.db.base import BaseModel


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action     = Column(String(100), nullable=False, index=True)  # login|logout|signup|role_change|password_reset
    ip_address = Column(INET,  nullable=True)
    user_agent = Column(Text,  nullable=True)
    meta       = Column(JSONB, nullable=True)  # flexible extra context
