from cache.client import redis_client


async def blacklist_token(jti: str, ttl_seconds: int) -> None:
    """Add a token's jti to the blacklist. Auto-expires when the token would have expired."""
    await redis_client.setex(f"blacklist:{jti}", ttl_seconds, "1")


async def is_blacklisted(jti: str) -> bool:
    return await redis_client.exists(f"blacklist:{jti}") == 1
