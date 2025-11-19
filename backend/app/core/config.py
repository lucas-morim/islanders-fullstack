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
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

# Outros arquivos podem importar assim:
# from app.core.config import settings
settings = Settings()
