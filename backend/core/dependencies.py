from fastapi import HTTPException, Header, status
from jose import JWTError
from auth.jwt import decode_token
from cache.blacklist import is_blacklisted
from cache.session import get_session


async def get_current_user(authorization: str = Header(None)) -> dict:
    """
    FastAPI dependency. Validates the JWT from the Authorization header.
    Returns the session dict: { user_id, email, role, full_name }.
    The proxy in Next.js always forwards the Authorization header internally.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {"code": "NOT_AUTHENTICATED", "message": "Authentication required.", "status": 401},
            },
        )

    token = authorization.split(" ")[1]

    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {"code": "TOKEN_INVALID", "message": "Invalid or expired token.", "status": 401},
            },
        )

    # Check token not blacklisted
    jti = payload.get("jti")
    if jti and await is_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {"code": "TOKEN_BLACKLISTED", "message": "Token has been revoked.", "status": 401},
            },
        )

    user_id = payload.get("sub")
    session = await get_session(user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {"code": "SESSION_EXPIRED", "message": "Session expired. Please log in again.", "status": 401},
            },
        )

    return {
        "user_id":   user_id,
        "email":     payload.get("email"),
        "role":      payload.get("role"),
        "full_name": session.get("full_name"),
        "jti":       jti,
    }
