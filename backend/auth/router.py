import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.session import get_db
from db.models.user import User
from db.models.oauth_account import OAuthAccount
from db.models.role import Role
from auth import schemas, service
from auth.jwt import decode_token
from cache.client import redis_client
from core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.MessageResponse, status_code=201)
async def signup(payload: schemas.SignupRequest, db: AsyncSession = Depends(get_db)):
    return await service.signup(payload.email, payload.password, payload.full_name, db)


@router.get("/verify-email", response_model=schemas.MessageResponse)
async def verify_email(token: str, response: Response, db: AsyncSession = Depends(get_db)):
    result = await service.verify_email(token, db)
    _set_auth_cookies(response, result["access_token"], result["refresh_token"])
    return {"success": True, "message": "Email verified. Redirecting to dashboard."}


@router.post("/login", response_model=schemas.AuthResponse)
async def login(payload: schemas.LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await service.login(payload.email, payload.password, db)
    _set_auth_cookies(response, result["access_token"], result["refresh_token"])
    return {"success": True, "user": result["user"]}


@router.post("/refresh", response_model=schemas.MessageResponse)
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail={
            "success": False, "error": {"code": "NO_REFRESH_TOKEN", "message": "No refresh token.", "status": 401},
        })
    try:
        payload = decode_token(refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail={
            "success": False, "error": {"code": "TOKEN_INVALID", "message": "Invalid or expired refresh token.", "status": 401},
        })

    result = await service.refresh_token(payload["sub"], payload["jti"], db)
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"success": True, "message": "Token refreshed."}


@router.post("/logout", response_model=schemas.MessageResponse)
async def logout(request: Request, response: Response):
    access_token = request.cookies.get("access_token")
    if access_token:
        try:
            payload = decode_token(access_token)
            exp = payload.get("exp", 0)
            remaining = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
            await service.logout(payload["sub"], payload["jti"], remaining)
        except Exception:
            pass   # expired token — still clear cookies

    _clear_auth_cookies(response)
    return {"success": True, "message": "Logged out successfully."}


@router.post("/forgot-password", response_model=schemas.MessageResponse)
async def forgot_password(payload: schemas.ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await service.forgot_password(payload.email, db)


@router.post("/reset-password", response_model=schemas.MessageResponse)
async def reset_password(payload: schemas.ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await service.reset_password(payload.token, payload.new_password, db)


# ─── Cookie helpers ───────────────────────────────────────────────────────────

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key="access_token", value=access_token,
        httponly=True, samesite="lax", secure=secure,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, samesite="lax", secure=secure,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")


# ─── OAuth helpers ───────────────────────────────────────────────────────────

def _get_oauth_adapter(provider: str):
    if provider == "google":
        if not settings.GOOGLE_AUTH_ENABLED:
            raise HTTPException(status_code=400, detail={
                "success": False, "error": {"code": "OAUTH_DISABLED", "message": "Google OAuth is not enabled.", "status": 400}
            })
        from auth.oauth.google import get_auth_url, exchange_code
        return get_auth_url, exchange_code

    if provider == "github":
        if not settings.GITHUB_AUTH_ENABLED:
            raise HTTPException(status_code=400, detail={
                "success": False, "error": {"code": "OAUTH_DISABLED", "message": "GitHub OAuth is not enabled.", "status": 400}
            })
        from auth.oauth.github import get_auth_url, exchange_code
        return get_auth_url, exchange_code

    if provider == "microsoft":
        if not settings.MICROSOFT_AUTH_ENABLED:
            raise HTTPException(status_code=400, detail={
                "success": False, "error": {"code": "OAUTH_DISABLED", "message": "Microsoft OAuth is not enabled.", "status": 400}
            })
        from auth.oauth.microsoft import get_auth_url, exchange_code
        return get_auth_url, exchange_code

    raise HTTPException(status_code=400, detail={
        "success": False, "error": {"code": "UNKNOWN_PROVIDER", "message": f"Unknown provider: {provider}", "status": 400}
    })


@router.get("/oauth/{provider}")
async def oauth_initiate(provider: str):
    get_auth_url, _ = _get_oauth_adapter(provider)
    redirect_uri = f"{settings.APP_URL}/api/auth/oauth/{provider}/callback"
    return RedirectResponse(url=get_auth_url(redirect_uri))


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    _, exchange_code_fn = _get_oauth_adapter(provider)
    redirect_uri = f"{settings.APP_URL}/api/auth/oauth/{provider}/callback"

    try:
        profile = await exchange_code_fn(code, redirect_uri)
    except Exception:
        raise HTTPException(status_code=400, detail={
            "success": False,
            "error": {"code": "OAUTH_EXCHANGE_FAILED", "message": "Failed to exchange OAuth code.", "status": 400},
        })

    provider_user_id = profile["provider_user_id"]
    email            = profile["email"]

    # Case A — existing OAuth account
    result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == provider_user_id,
        )
    )
    oauth_account = result.scalar_one_or_none()

    if oauth_account:
        user_result = await db.execute(select(User).where(User.id == oauth_account.user_id))
        user = user_result.scalar_one()
        auth = await service._create_auth_session(user, db)
        _set_auth_cookies(response, auth["access_token"], auth["refresh_token"])
        return RedirectResponse(url="/dashboard")

    # Case B — email exists but no OAuth account → ask to link
    existing_result = await db.execute(select(User).where(User.email == email))
    existing_user = existing_result.scalar_one_or_none()
    if existing_user:
        link_token = str(uuid.uuid4())
        await redis_client.setex(
            f"oauth_link:{link_token}",
            600,
            json.dumps({"provider": provider, "provider_user_id": provider_user_id,
                        "access_token": profile["access_token"], "user_id": str(existing_user.id)}),
        )
        return RedirectResponse(
            url=f"/link-account?token={link_token}&email={email}&provider={provider}"
        )

    # Case C — new user via OAuth
    role_result = await db.execute(select(Role).where(Role.name == "user"))
    role = role_result.scalar_one()

    new_user = User(
        email=email,
        password_hash=None,
        full_name=profile["full_name"],
        avatar_url=profile.get("avatar_url"),
        is_active=True,
        is_verified=True,
        role_id=role.id,
    )
    db.add(new_user)
    await db.flush()

    db.add(OAuthAccount(
        user_id=new_user.id,
        provider=provider,
        provider_user_id=provider_user_id,
        access_token=profile["access_token"],
    ))
    await db.commit()

    auth = await service._create_auth_session(new_user, db)
    _set_auth_cookies(response, auth["access_token"], auth["refresh_token"])
    return RedirectResponse(url="/dashboard")


@router.post("/oauth/link", response_model=schemas.MessageResponse)
async def oauth_link_confirm(
    link_token: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Called when user confirms linking an OAuth provider to their existing account."""
    raw = await redis_client.get(f"oauth_link:{link_token}")
    if not raw:
        raise HTTPException(status_code=400, detail={
            "success": False,
            "error": {"code": "LINK_TOKEN_EXPIRED", "message": "Link request expired. Try again.", "status": 400},
        })

    data = json.loads(raw)
    await redis_client.delete(f"oauth_link:{link_token}")

    user_result = await db.execute(select(User).where(User.id == data["user_id"]))
    user = user_result.scalar_one()

    db.add(OAuthAccount(
        user_id=user.id,
        provider=data["provider"],
        provider_user_id=data["provider_user_id"],
        access_token=data["access_token"],
    ))
    await db.commit()

    auth = await service._create_auth_session(user, db)
    _set_auth_cookies(response, auth["access_token"], auth["refresh_token"])
    return {"success": True, "message": "Account linked successfully."}
