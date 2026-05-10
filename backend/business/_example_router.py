"""
EXAMPLE ROUTER — Template for buyer feature modules.
Copy this file to: backend/business/<your_feature>/router.py
Then create models.py and schemas.py alongside it.

No edits to main.py needed — it auto-discovers business/*/router.py.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.db.base import BaseModel as DBBaseModel  # SQLAlchemy BaseModel

# ── Router ────────────────────────────────────────────────────────────────
router = APIRouter(
    prefix="/my-feature",   # becomes /api/my-feature in main.py
    tags=["My Feature"],
)


# ── Schemas (move to schemas.py in real feature) ──────────────────────────
class MyFeatureCreate(BaseModel):
    name: str
    description: str | None = None


class MyFeatureResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    created_at: str


# ── Model (move to models.py in real feature) ─────────────────────────────
# from sqlalchemy import Column, String
# from app.db.base import BaseModel
#
# class MyFeatureItem(BaseModel):
#     __tablename__ = "my_feature_items"
#     name        = Column(String(100), nullable=False)
#     description = Column(String, nullable=True)


# ── Endpoints ─────────────────────────────────────────────────────────────
@router.get("", response_model=dict)
async def list_items(user=Depends(get_current_user)):
    """List all items."""
    return {"success": True, "items": [], "total": 0}


@router.post("", response_model=dict)
async def create_item(data: MyFeatureCreate, user=Depends(get_current_user)):
    """Create a new item."""
    return {"success": True, "item": {"id": "...", **data.model_dump()}}


@router.get("/{item_id}", response_model=dict)
async def get_item(item_id: str, user=Depends(get_current_user)):
    """Get a single item."""
    return {"success": True, "item": {"id": item_id}}


@router.put("/{item_id}", response_model=dict)
async def update_item(item_id: str, data: MyFeatureCreate, user=Depends(get_current_user)):
    """Update an item."""
    return {"success": True, "item": {"id": item_id, **data.model_dump()}}


@router.delete("/{item_id}", response_model=dict)
async def delete_item(item_id: str, user=Depends(get_current_user)):
    """Delete an item."""
    return {"success": True, "item": {"id": item_id}}
