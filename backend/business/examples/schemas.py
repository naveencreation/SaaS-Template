from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ExampleCreate(BaseModel):
    name: str
    description: str | None = None
    quantity: int = 0


class ExampleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    quantity: int | None = None


class ExampleItemResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    quantity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExampleListResponse(BaseModel):
    success: bool = True
    items: list[ExampleItemResponse]
    total: int


class ExampleDetailResponse(BaseModel):
    success: bool = True
    item: ExampleItemResponse
