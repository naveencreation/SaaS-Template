import httpx
from core.config import settings

AUTH_URL     = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
TOKEN_URL    = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
USERINFO_URL = "https://graph.microsoft.com/v1.0/me"


def get_auth_url(redirect_uri: str) -> str:
    params = {
        "client_id":     settings.MICROSOFT_CLIENT_ID,
        "redirect_uri":  redirect_uri,
        "response_type": "code",
        "scope":         "openid email profile User.Read",
        "response_mode": "query",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{AUTH_URL}?{query}"


async def exchange_code(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(TOKEN_URL, data={
            "client_id":     settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "code":          code,
            "redirect_uri":  redirect_uri,
            "grant_type":    "authorization_code",
        })
        r.raise_for_status()
        access_token = r.json()["access_token"]

        profile = await client.get(
            USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        profile.raise_for_status()
        data = profile.json()

    return {
        "provider_user_id": data["id"],
        "email":            data.get("mail", data.get("userPrincipalName", "")).lower(),
        "full_name":        data.get("displayName", ""),
        "avatar_url":       None,
        "access_token":     access_token,
    }
