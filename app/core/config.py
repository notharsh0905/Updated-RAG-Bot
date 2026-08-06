"""
Configuration settings for the CSJMU RAG Application.
Supports environment variables with sensible defaults.
"""

import os
from pathlib import Path
from typing import Optional
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

    # LLM Provider Configuration ("openrouter" or "ollama")
    LLM_PROVIDER: str = "openrouter"

    # Embedding Provider Configuration ("ollama" or "openrouter")
    EMBEDDING_PROVIDER: str = "ollama"


    # OpenRouter Configuration
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "nvidia/nemotron-nano-9b-v2:free"
    OPENROUTER_EMBEDDING_MODEL: str = "nvidia/nemotron-3-embed-1b:free"


    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_EMBEDDING_MODEL: Optional[str] = None
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
    ADMIN_PASSCODE: str = "CSJMU_UIET_2026"
    ADMIN_SESSION_SECRET: str = "csjmu_uiet_secret_admin_session_key_2026_prod"
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

    def get_active_model_name(self) -> str:
        """Returns the active LLM model identifier according to LLM_PROVIDER."""
        if self.LLM_PROVIDER.lower().strip() == "ollama":
            return self.LLM_MODEL
        return self.OPENROUTER_MODEL

    def get_active_embedding_provider(self) -> str:
        """Returns the normalized active embedding provider ('ollama' or 'openrouter')."""
        return self.EMBEDDING_PROVIDER.lower().strip()

    def get_active_embedding_model_name(self) -> str:
        """Returns the active embedding model identifier according to EMBEDDING_PROVIDER."""
        if self.get_active_embedding_provider() == "openrouter":
            return self.OPENROUTER_EMBEDDING_MODEL
        return self.OLLAMA_EMBEDDING_MODEL or self.EMBEDDING_MODEL

    def get_effective_collection_name(self) -> str:
        """Returns provider-specific Chroma collection name to avoid mixing embeddings."""
        provider = self.get_active_embedding_provider()
        base_name = self.COLLECTION_NAME
        if base_name.endswith(f"_{provider}"):
            return base_name
        for p in ["_ollama", "_openrouter"]:
            if base_name.endswith(p):
                base_name = base_name[:-len(p)]
                break
        return f"{base_name}_{provider}"


config = AppConfig()

