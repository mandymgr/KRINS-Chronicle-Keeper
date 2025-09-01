"""
Configuration settings for Dev Memory OS FastAPI backend
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application settings
    PROJECT_NAME: str = "Dev Memory OS FastAPI"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # Frontend dev
        "http://localhost:8080",  # Alternative frontend
    ]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database settings (Railway PostgreSQL)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "devmemory"
    DB_PASSWORD: str = "devmemory_secure_password_2024"
    DB_NAME: str = "dev_memory_os"
    
    # Railway database URL (will override individual settings if provided)
    DATABASE_URL: Optional[PostgresDsn] = None
    
    @field_validator("DATABASE_URL", mode='before')
    @classmethod 
    def assemble_db_connection(cls, v: Optional[str], info) -> Any:
        if isinstance(v, str):
            return v
        values = info.data if hasattr(info, 'data') else {}
        return f"postgresql+asyncpg://{values.get('DB_USER', 'devmemory')}:{values.get('DB_PASSWORD', 'devmemory_secure_password_2024')}@{values.get('DB_HOST', 'localhost')}:{values.get('DB_PORT', 5432)}/{values.get('DB_NAME', 'dev_memory_os')}"
    
    # Database pool settings
    DB_POOL_SIZE: int = 25
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    
    # OpenAI settings
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536
    
    # Redis settings (for caching and job queues)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # API Key for authentication
    API_KEY: Optional[str] = None
    SECRET_KEY: str = "dev-memory-os-secret-key-change-in-production"
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Performance settings
    MAX_BATCH_SIZE: int = 50
    REQUEST_TIMEOUT: int = 30
    EMBEDDING_BATCH_SIZE: int = 25
    
    # Search settings
    DEFAULT_SIMILARITY_THRESHOLD: float = 0.7
    MAX_SEARCH_RESULTS: int = 50
    
    # Monitoring settings
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings