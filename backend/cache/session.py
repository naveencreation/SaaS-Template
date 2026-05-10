from datetime import timedelta
from cache.client import redis_client
from core.config import settings

SESSION_PREFIX   = "session:"
SESSION_TTL_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS


async def create_session(
    user_id: str,
    access_token: str,
    refresh_token: str,
    role: str,
    email: str,
    full_name: str,
) -> None:
    """Store session as a Redis hash. TTL = refresh token lifetime."""
    key  = f"{SESSION_PREFIX}{user_id}"
    data = {
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "role":          role,
        "email":         email,
        "full_name":     full_name,
    }
    await redis_client.hset(key, mapping=data)
    await redis_client.expire(key, int(timedelta(days=SESSION_TTL_DAYS).total_seconds()))


async def get_session(user_id: str) -> dict | None:
    key  = f"{SESSION_PREFIX}{user_id}"
    data = await redis_client.hgetall(key)
    return data if data else None


async def delete_session(user_id: str) -> None:
    await redis_client.delete(f"{SESSION_PREFIX}{user_id}")


async def update_access_token(user_id: str, new_access_token: str) -> None:
    key = f"{SESSION_PREFIX}{user_id}"
    await redis_client.hset(key, "access_token", new_access_token)
