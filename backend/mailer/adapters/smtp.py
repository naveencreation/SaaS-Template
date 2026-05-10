import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from core.config import settings


async def send(to: str, subject: str, html: str, from_email: str, from_name: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{from_name} <{from_email}>"
    msg["To"]      = to
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=settings.SMTP_TLS,
    )
