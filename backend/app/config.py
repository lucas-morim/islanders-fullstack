from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV: str = "dev"
    API_PREFIX: str = "/api/v1"
    FRONTEND_ORIGIN: str = "http://localhost:4200"
    DATABASE_URL: str  

    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        case_sensitive = False,
    )

settings = Settings()
