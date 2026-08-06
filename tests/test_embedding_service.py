"""
Unit tests for EmbeddingService, provider selection, error handling, and collection naming.
"""

import pytest
from app.core.config import config
from app.embeddings.embedding_service import EmbeddingService
from app.embeddings.vector_store import VectorStoreManager


def test_effective_collection_name():
    """Tests dynamic collection name resolution for Ollama and OpenRouter."""
    orig = config.EMBEDDING_PROVIDER
    try:
        config.EMBEDDING_PROVIDER = "ollama"
        config.COLLECTION_NAME = "collection50"
        assert config.get_effective_collection_name() == "collection50_ollama"

        config.EMBEDDING_PROVIDER = "openrouter"
        assert config.get_effective_collection_name() == "collection50_openrouter"
    finally:
        config.EMBEDDING_PROVIDER = orig


def test_openrouter_missing_api_key_raises_error():
    """Tests that missing OPENROUTER_API_KEY raises a clear ValueError on startup."""
    with pytest.raises(ValueError, match="OPENROUTER_API_KEY is missing or empty"):
        EmbeddingService(
            provider="openrouter",
            openrouter_api_key="",
            skip_health_check=True
        )


def test_unsupported_provider_raises_error():
    """Tests that an invalid provider name raises a ValueError."""
    with pytest.raises(ValueError, match="Unsupported EMBEDDING_PROVIDER"):
        EmbeddingService(provider="invalid_provider")


def test_vector_store_manager_collection_name():
    """Tests VectorStoreManager initializes with the effective provider collection."""
    orig = config.EMBEDDING_PROVIDER
    try:
        config.EMBEDDING_PROVIDER = "ollama"
        # Skip health check for unit testing vector store instantiation
        emb_service = EmbeddingService(provider="ollama", skip_health_check=True)
        vsm = VectorStoreManager(embedding_service=emb_service)
        assert vsm.collection_name == "collection50_ollama"
        assert vsm.embeddings.provider == "ollama"
    finally:
        config.EMBEDDING_PROVIDER = orig

