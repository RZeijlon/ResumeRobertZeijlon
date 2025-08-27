"""
Configuration settings for the Portfolio Backend
"""

import os
from pathlib import Path
from datetime import datetime
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Portfolio CMS & RAG API"
    VERSION: str = "2.0.0"
    
    # CORS Configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ]
    
    # Content Management
    CONTENT_PATH: str = os.getenv("CONTENT_PATH", "../page_content")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://portfolio:portfolio@localhost:5432/portfolio")
    
    # Vector Database (for RAG)
    VECTOR_DB_URL: str = os.getenv("VECTOR_DB_URL", "postgresql://portfolio:portfolio@localhost:5432/portfolio")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
    
    # LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # RAG Configuration
    RAG_ENABLED: bool = os.getenv("RAG_ENABLED", "false").lower() == "true"
    MAX_CONTEXT_LENGTH: int = int(os.getenv("MAX_CONTEXT_LENGTH", "8000"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    
    # Development
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Runtime
    startup_time: datetime = datetime.now()
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()