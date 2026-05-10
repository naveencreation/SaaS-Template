from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from business.examples import models, schemas

router = APIRouter(prefix="/business/examples", tags=["Examples"])


@router.get("", response_model=schemas.ExampleListResponse)
async def list_examples(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """List all example items."""
    result = await db.execute(select(models.ExampleItem))
    items = result.scalars().all()

    total_result = await db.execute(select(func.count()).select_from(models.ExampleItem))
    total = total_result.scalar() or 0

    return schemas.ExampleListResponse(
        items=[schemas.ExampleItemResponse.model_validate(i) for i in items],
        total=total,
    )


@router.post("", response_model=schemas.ExampleDetailResponse)
async def create_example(
    data: schemas.ExampleCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create a new example item."""
    item = models.ExampleItem(
        name=data.name,
        description=data.description,
        quantity=data.quantity,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return schemas.ExampleDetailResponse(
        item=schemas.ExampleItemResponse.model_validate(item),
    )


@router.get("/{item_id}", response_model=schemas.ExampleDetailResponse)
async def get_example(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get a single example item."""
    result = await db.execute(
        select(models.ExampleItem).where(models.ExampleItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Example item not found.",
                    "status": 404,
                },
            },
        )
    return schemas.ExampleDetailResponse(
        item=schemas.ExampleItemResponse.model_validate(item),
    )


@router.put("/{item_id}", response_model=schemas.ExampleDetailResponse)
async def update_example(
    item_id: str,
    data: schemas.ExampleUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Update an example item."""
    result = await db.execute(
        select(models.ExampleItem).where(models.ExampleItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Example item not found.",
                    "status": 404,
                },
            },
        )

    if data.name is not None:
        item.name = data.name
    if data.description is not None:
        item.description = data.description
    if data.quantity is not None:
        item.quantity = data.quantity

    await db.commit()
    await db.refresh(item)
    return schemas.ExampleDetailResponse(
        item=schemas.ExampleItemResponse.model_validate(item),
    )


@router.delete("/{item_id}", response_model=dict)
async def delete_example(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """Delete an example item."""
    result = await db.execute(
        select(models.ExampleItem).where(models.ExampleItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Example item not found.",
                    "status": 404,
                },
            },
        )

    await db.delete(item)
    await db.commit()
    return {"success": True, "item": {"id": str(item.id)}}
