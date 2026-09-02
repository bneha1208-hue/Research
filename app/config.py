import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # MySQL Database Settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "legalprecedent_db"
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"

    # App Settings
    APP_NAME: str = "LegalPrecedent API"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = ""
    SECRET_KEY: str = "legalprecedent_super_secret_jwt_and_session_key_2025"

    # Testing / SQLite override (for automated unit testing without active MySQL instance)
    USE_SQLITE_FALLBACK: bool = False
    SQLITE_DB_URL: str = "sqlite:///./legalprecedent_fallback.db"

    @property
    def database_url(self) -> str:
        """Build MySQL database connection URL for SQLAlchemy with PyMySQL driver."""
        if self.USE_SQLITE_FALLBACK:
            return self.SQLITE_DB_URL
        # PyMySQL connection string
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Global settings instance
settings = Settings()
