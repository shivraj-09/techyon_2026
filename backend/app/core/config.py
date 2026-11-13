from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "EduSync API"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    SUPABASE_URL: str
    SUPABASE_PUBLISHABLE_KEY: str
    # Server-only key. Never expose this through NEXT_PUBLIC_* or commit it.
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_INVITE_REDIRECT_URL: str = "http://localhost:3000/auth/accept-invite"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
