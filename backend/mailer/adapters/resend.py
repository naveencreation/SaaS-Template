import httpx
from core.config import settings


async def send(to: str, subject: str, html: str, from_email: str, from_name: str) -> None:
    async with httpx.AsyncClient() as client:
        client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from":    f"{from_name} <{from_email}>",
                "to":      [to],
                "subject": subject,
                "html":    html,
            },
        )
