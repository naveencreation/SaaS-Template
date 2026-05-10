import importlib.util
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel

from app.core.config import settings
from auth.router import router as auth_router
from users.router import router as users_router
from dashboard.router import router as dashboard_router
from analytics.router import router as analytics_router


class HealthResponse(BaseModel):
    success: bool = True
    item: dict = {"status": "ok"}


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
app.include_router(dashboard_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


# ─────────────────────────────────────────────────────────────────────────
# Auto-registration: discover business/*/router.py — buyer feature modules
# ─────────────────────────────────────────────────────────────────────────
def _register_business_routers(app: FastAPI) -> None:
    """
    Scan backend/business/*/router.py and auto-register each router.
    Buyer workflow: copy backend/business/_example_router.py →
                  backend/business/myfeature/router.py
    No edits to main.py needed.
    """
    business_dir = Path(__file__).parent / "business"
    if not business_dir.exists():
        return

    for router_file in business_dir.glob("*/router.py"):
        # Skip the underscore-prefixed example (it's documentation only)
        if router_file.parent.name.startswith("_"):
            continue

        module_name = f"business.{router_file.parent.name}.router"
        spec = importlib.util.spec_from_file_location(module_name, router_file)
        if spec is None or spec.loader is None:
            continue
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        router = getattr(module, "router", None)
        if router is not None:
            app.include_router(router, prefix="/api")
            print(f"  → Auto-registered business router: {router_file.parent.name}")


_register_business_routers(app)


# ─────────────────────────────────────────────────────────────────────────
# Global exception handlers — enforce §10 standard error shape:
#   { "success": false, "error": { "code", "message", "status" } }
# Never return FastAPI's default { "detail": "..." } format.
# ─────────────────────────────────────────────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Unwrap HTTPException(detail={...}) so the standard shape is returned at the top level.
    Also catches Starlette's built-in 404/405 to enforce the standard error shape."""
    detail = exc.detail
    if isinstance(detail, dict) and "success" in detail and "error" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)
    # Generic HTTPException (e.g. raised by FastAPI internals, 404 not found, 405) — wrap it.
    code_map = {404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED", 401: "NOT_AUTHENTICATED", 403: "FORBIDDEN"}
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": code_map.get(exc.status_code, "HTTP_ERROR"),
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
    return {"success": True, "item": {"status": "ok", "version": "v2"}}
