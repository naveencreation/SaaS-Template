from core.config import settings


class EmailService:
    def __init__(self):
        provider = settings.EMAIL_PROVIDER.lower()
        if provider == "resend":
            from mailer.adapters.resend import send
        elif provider == "sendgrid":
            from mailer.adapters.sendgrid import send
        elif provider == "smtp":
            from mailer.adapters.smtp import send
        else:
            from mailer.adapters.mailhog import send
        self._send = send

    async def send(self, to: str, subject: str, html: str) -> None:
        await self._send(
            to=to,
            subject=subject,
            html=html,
            from_email=settings.EMAIL_FROM,
            from_name=settings.EMAIL_FROM_NAME,
        )


email_service = EmailService()
