import httpx
from core.config import settings


async def send(to: str, subject: str, html: str, from_email: str, from_name: str) -> None:
    async with httpx.AsyncClient() as client:
        client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {settings.SENDGRID_API_KEY}"},
            json={
                "personalizations": [{"to": [{"email": to}]}],
                "from":    {"email": from_email, "name": from_name},
                "subject": subject,
                "content": [{"type": "text/html", "value": html}],
            },
        )
