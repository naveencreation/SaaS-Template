"""
Simple HTML email templates.
No external templating library — keeps dependencies minimal.
"""
from core.config import settings


def verification_email(verification_url: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2>Verify your email</h2>
      <p>Click the button below to verify your email address for {settings.APP_NAME}.</p>
      <a href="{verification_url}"
         style="display:inline-block;padding:12px 24px;background:#000;color:#fff;
                text-decoration:none;border-radius:6px;">
        Verify Email
      </a>
      <p style="color:#666;font-size:14px">This link expires in 24 hours.</p>
    </div>
    """


def password_reset_email(reset_url: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2>Reset your password</h2>
      <p>Click the button below to reset your password for {settings.APP_NAME}.</p>
      <a href="{reset_url}"
         style="display:inline-block;padding:12px 24px;background:#000;color:#fff;
                text-decoration:none;border-radius:6px;">
        Reset Password
      </a>
      <p style="color:#666;font-size:14px">This link expires in 1 hour.</p>
      <p style="color:#666;font-size:14px">If you did not request this, ignore this email.</p>
    </div>
    """
