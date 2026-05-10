from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel

from app.core.config import settings
from auth.router import router as auth_router
from users.router import router as users_router


class HealthResponse(BaseModel):
    status: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print(f"🚀 {settings.APP_NAME} starting in {settings.ENVIRONMENT} mode")
    yield
    # Shutdown
    print("👋 Shutting down")


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")
