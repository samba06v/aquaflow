import os
from functools import lru_cache
from dotenv import load_dotenv


load_dotenv()


class Settings:
    openweather_api_key: str = os.getenv("OPENWEATHER_API_KEY", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "").rstrip("/")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_storage_bucket: str = os.getenv("SUPABASE_STORAGE_BUCKET", "flood-reports")
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "APP_CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
