import uuid
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from core.config import settings

ALGORITHM = "HS256"


def create_access_token(user_id: str, email: str, role: str) -> tuple[str, str]:
    """
    Returns (token_string, jti).
    jti is the unique token ID — used for blacklisting on logout.
    """
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub":   user_id,
        "email": email,
        "role":  role,
        "jti":   jti,
        "exp":   expire,
        "type":  "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM), jti


def create_refresh_token(user_id: str) -> tuple[str, str]:
    """Returns (token_string, jti)."""
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {
        "sub":  user_id,
        "jti":  jti,
        "exp":  expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM), jti


def decode_token(token: str) -> dict:
    """
    Decodes and validates a JWT.
    Raises JWTError if invalid or expired.
    """
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
