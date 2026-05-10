import httpx
from core.config import settings

AUTH_URL     = "https://github.com/login/oauth/authorize"
TOKEN_URL    = "https://github.com/login/oauth/access_token"
USERINFO_URL = "https://api.github.com/user"
EMAIL_URL    = "https://api.github.com/user/emails"


def get_auth_url(redirect_uri: str) -> str:
    params = {
        "client_id":    settings.GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope":        "user:email",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{AUTH_URL}?{query}"


async def exchange_code(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            TOKEN_URL,
            data={
                "client_id":     settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code":          code,
                "redirect_uri":  redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        r.raise_for_status()
        access_token = r.json()["access_token"]

        profile = await client.get(
            USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        profile.raise_for_status()
        data = profile.json()

        # GitHub may not return email in profile — fetch separately
        email = data.get("email")
        if not email:
            emails_r = await client.get(
                EMAIL_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            emails_r.raise_for_status()
            primary = next(
                (e for e in emails_r.json() if e.get("primary") and e.get("verified")),
                None,
            )
            email = primary["email"] if primary else ""

    return {
        "provider_user_id": str(data["id"]),
        "email":            email.lower(),
        "full_name":        data.get("name") or data.get("login", ""),
        "avatar_url":       data.get("avatar_url"),
        "access_token":     access_token,
    }
