from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class OAuthAccount(BaseModel):
    __tablename__ = "oauth_accounts"

    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider         = Column(String(50),  nullable=False)   # google | github | microsoft
    provider_user_id = Column(String,      nullable=False)
    access_token     = Column(String(500), nullable=True)    # encrypted at rest (Phase 3)

    user = relationship("User", back_populates="oauth_accounts")

    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_oauth_provider_user"),
    )
