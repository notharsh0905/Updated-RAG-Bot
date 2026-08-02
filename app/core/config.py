"""
Configuration settings for the CSJMU RAG Application.
Supports environment variables with sensible defaults.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    """Application configuration settings loaded from environment or defaults."""

    # Project Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data" / "raw_documents" / "CSJM_DOCUMENTS"
    FALLBACK_DATA_DIR: Path = BASE_DIR / "data" / "CSJM_DOCUMENTS"
    CHROMA_DB_DIR: Path = BASE_DIR / "data" / "vector_db" / "CHECK_DB"
    REPORTS_DIR: Path = BASE_DIR / "data" / "reports"
    DATASETS_DIR: Path = BASE_DIR / "data" / "datasets"
    EVALUATION_DIR: Path = BASE_DIR / "data" / "evaluation"

    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    EMBEDDING_MODEL: str = "nomic-embed-text"
    LLM_MODEL: str = "llama3.2:3b"

    # Vector DB Configuration
    COLLECTION_NAME: str = "collection50"
    DEFAULT_K: int = 7

    # FastAPI & Web Server Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    STREAMLIT_PORT: int = 8501
    ENVIRONMENT: str = "production"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:3001,http://10.63.135.235:3000,http://10.63.135.235:3001"
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    RATE_LIMIT_PER_MINUTE: int = 120

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_resolved_data_dir(self) -> Path:
        """Returns the existing data directory path."""
        if self.DATA_DIR.exists():
            return self.DATA_DIR
        elif self.FALLBACK_DATA_DIR.exists():
            return self.FALLBACK_DATA_DIR
        else:
            return self.BASE_DIR / "data"


config = AppConfig()
