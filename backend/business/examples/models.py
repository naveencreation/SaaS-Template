from sqlalchemy import Column, String, Integer
from app.db.base import BaseModel


class ExampleItem(BaseModel):
    """
    Example business model.
    Demonstrates the BaseModel mixin (id, created_at, updated_at for free).
    """
    __tablename__ = "example_items"

    name        = Column(String(100), nullable=False)
    description = Column(String,      nullable=True)
    quantity    = Column(Integer,    default=0, nullable=False)
