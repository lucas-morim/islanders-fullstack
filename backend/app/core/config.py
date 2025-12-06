from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV: str = "dev" 

    # API
    API_PREFIX: str = "/api/v1"
    FRONTEND_ORIGIN: str = "http://localhost:4200"
    DATABASE_URL: str 

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7


    MEDIA_ROOT: str = "media"
    MEDIA_URL: str = "/media"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra = "allow"
    )

settings = Settings()
