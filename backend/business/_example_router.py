"""
EXAMPLE ROUTER — Template for buyer feature modules.
─────────────────────────────────────────────────────────────────────────────
Follow the 4-file rule to add a new feature:

1. backend/business/<feature>/router.py   (Logic & Endpoints) - Copy this file
2. backend/business/<feature>/models.py   (SQLAlchemy Table)
3. backend/business/<feature>/schemas.py  (Pydantic Validation)
4. frontend/app/(dashboard)/business/<feature>/page.tsx (UI)

No edits to main.py needed — it auto-discovers business/*/router.py.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.dependencies import get_current_user
# from . import models, schemas  # Once you create them

# ── Router ────────────────────────────────────────────────────────────────
router = APIRouter(
    prefix="/business/my-feature",   # becomes /api/business/my-feature via auto-registration
    tags=["My Feature"],
)


# ── Schemas (Move these to schemas.py) ────────────────────────────────────
from pydantic import BaseModel

class MyFeatureCreate(BaseModel):
    name: str
    description: str | None = None


class MyFeatureResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    created_at: str


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.get("", response_model=dict)
async def list_items(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all items for this feature.
    Standard response shape: { "success": true, "items": [...], "total": N }
    """
    # Example query:
    # result = await db.execute(select(models.MyItem).filter_by(user_id=user["user_id"]))
    # items = result.scalars().all()
    
    return {
        "success": True,
        "items": [], 
        "total": 0
    }


@router.post("", response_model=dict)
async def create_item(
    data: MyFeatureCreate, 
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new item.
    Standard response shape: { "success": true, "item": {...} }
    """
    # Example create:
    # item = models.MyItem(**data.model_dump(), user_id=user["user_id"])
    # db.add(item)
    # await db.commit()
    
    return {
        "success": True, 
        "item": {"id": "generated-uuid", **data.model_dump()}
    }


@router.get("/{item_id}", response_model=dict)
async def get_item(
    item_id: str, 
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a single item by ID."""
    return {
        "success": True, 
        "item": {"id": item_id, "name": "Example Item"}
    }


@router.put("/{item_id}", response_model=dict)
async def update_item(
    item_id: str, 
    data: MyFeatureCreate, 
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing item."""
    return {
        "success": True, 
        "item": {"id": item_id, **data.model_dump()}
    }


@router.delete("/{item_id}", response_model=dict)
async def delete_item(
    item_id: str, 
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an item."""
    return {
        "success": True, 
        "message": "Item deleted successfully"
    }
