from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
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


# ─────────────────────────────────────────────────────────────────────────
# Global exception handlers — enforce §10 standard error shape:
#   { "success": false, "error": { "code", "message", "status" } }
# Never return FastAPI's default { "detail": "..." } format.
# ─────────────────────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Unwrap HTTPException(detail={...}) so the standard shape is returned at the top level."""
    detail = exc.detail
    if isinstance(detail, dict) and "success" in detail and "error" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)
    # Generic HTTPException (e.g. raised by FastAPI internals) — wrap it.
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": str(detail) if detail else "An error occurred.",
                "status": exc.status_code,
            },
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Convert Pydantic validation errors to the standard error shape."""
    errors = exc.errors()
    first = errors[0] if errors else {"msg": "Invalid request payload."}
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": first.get("msg", "Invalid request payload."),
                "status": 422,
            },
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions — never leak stack traces to the browser."""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
                "status": 500,
            },
        },
    )


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")
