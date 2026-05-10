from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # App
    APP_NAME:    str = "My SaaS"
    APP_URL:     str = "http://localhost:3000"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # Auth
    JWT_SECRET:                    str
    ACCESS_TOKEN_EXPIRE_MINUTES:   int = 15
    REFRESH_TOKEN_EXPIRE_DAYS:     int = 7

    # OAuth — disabled by default
    GOOGLE_AUTH_ENABLED:    bool = False
    GOOGLE_CLIENT_ID:       str  = ""
    GOOGLE_CLIENT_SECRET:   str  = ""

    GITHUB_AUTH_ENABLED:    bool = False
    GITHUB_CLIENT_ID:       str  = ""
    GITHUB_CLIENT_SECRET:   str  = ""

    MICROSOFT_AUTH_ENABLED: bool = False
    MICROSOFT_CLIENT_ID:    str  = ""
    MICROSOFT_CLIENT_SECRET: str = ""

    # Email
    EMAIL_PROVIDER:   str = "mailhog"
    EMAIL_FROM:       str = "noreply@myapp.com"
    EMAIL_FROM_NAME:  str = "My SaaS"
    RESEND_API_KEY:   str = ""
    SENDGRID_API_KEY: str = ""
    SMTP_HOST:        str = ""
    SMTP_PORT:        int = 587
    SMTP_TLS:         bool = True
    SMTP_USER:        str = ""
    SMTP_PASSWORD:    str = ""

    # MailHog (dev)
    MAILHOG_HOST: str = "mailhog"
    MAILHOG_PORT: int = 1025

    # Super Admin
    SUPER_ADMIN_EMAIL:    str
    SUPER_ADMIN_PASSWORD: str

    @field_validator("GOOGLE_CLIENT_ID")
    @classmethod
    def validate_google(cls, v, info):
        if info.data.get("GOOGLE_AUTH_ENABLED") and not v:
            raise ValueError("GOOGLE_AUTH_ENABLED is true but GOOGLE_CLIENT_ID is missing.")
        return v

    @field_validator("GITHUB_CLIENT_ID")
    @classmethod
    def validate_github(cls, v, info):
        if info.data.get("GITHUB_AUTH_ENABLED") and not v:
            raise ValueError("GITHUB_AUTH_ENABLED is true but GITHUB_CLIENT_ID is missing.")
        return v

    @field_validator("MICROSOFT_CLIENT_ID")
    @classmethod
    def validate_microsoft(cls, v, info):
        if info.data.get("MICROSOFT_AUTH_ENABLED") and not v:
            raise ValueError("MICROSOFT_AUTH_ENABLED is true but MICROSOFT_CLIENT_ID is missing.")
        return v

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
