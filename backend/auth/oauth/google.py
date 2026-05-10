import httpx
from core.config import settings

AUTH_URL     = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL    = "https://oauth2.googleapis.com/token"
USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_auth_url(redirect_uri: str) -> str:
    params = {
        "client_id":     settings.GOOGLE_CLIENT_ID,
        "redirect_uri":  redirect_uri,
        "response_type": "code",
        "scope":         "openid email profile",
        "access_type":   "offline",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{AUTH_URL}?{query}"


async def exchange_code(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(TOKEN_URL, data={
            "code":          code,
            "client_id":     settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri":  redirect_uri,
            "grant_type":    "authorization_code",
        })
        r.raise_for_status()
        tokens = r.json()

        profile = await client.get(
            USERINFO_URL,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        profile.raise_for_status()
        data = profile.json()

    return {
        "provider_user_id": data["sub"],
        "email":            data.get("email", "").lower(),
        "full_name":        data.get("name", ""),
        "avatar_url":       data.get("picture"),
        "access_token":     tokens["access_token"],
    }
