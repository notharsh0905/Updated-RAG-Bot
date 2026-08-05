"""
Unit and integration tests for LLM Provider Abstraction & OpenRouter integration.
Verifies provider switching, interface compliance, streaming chunks, and health reporting.
"""

import pytest
from app.core.config import config
from app.rag.providers import (
    BaseLLMProvider,
    OllamaProvider,
    OpenRouterProvider,
    LLMResponse,
    LLMChunk
)
from app.rag.llm import LLMManager
from app.utils.utils import check_llm_health


def test_llm_response_and_chunk_interface():
    """Verifies that LLMResponse and LLMChunk expose a .content string property."""
    res = LLMResponse("Test content")
    assert res.content == "Test content"
    assert str(res) == "Test content"

    chunk = LLMChunk("Test token")
    assert chunk.content == "Test token"
    assert str(chunk) == "Test token"


def test_provider_instantiation_and_switching():
    """Verifies dynamic provider switching between OpenRouter and Ollama."""
    # Test OpenRouter Provider
    openrouter_mgr = LLMManager(provider_type="openrouter")
    assert openrouter_mgr.provider_type == "openrouter"
    assert isinstance(openrouter_mgr.get_llm(), OpenRouterProvider)
    assert openrouter_mgr.model_name == config.OPENROUTER_MODEL

    # Test Ollama Provider
    ollama_mgr = LLMManager(provider_type="ollama")
    assert ollama_mgr.provider_type == "ollama"
    assert isinstance(ollama_mgr.get_llm(), OllamaProvider)
    assert ollama_mgr.model_name == config.LLM_MODEL


def test_openrouter_missing_key_graceful_fallback(monkeypatch):
    """Verifies that OpenRouterProvider gracefully handles a missing API key without throwing raw exceptions."""
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    monkeypatch.setattr(config, "OPENROUTER_API_KEY", "")
    provider = OpenRouterProvider(api_key="")
    
    # Invoke test
    res = provider.invoke("What is UIET Kanpur?")
    assert isinstance(res, LLMResponse)
    assert "OpenRouter authentication failed" in res.content

    # Stream test
    chunks = list(provider.stream("What is UIET Kanpur?"))
    assert len(chunks) > 0
    assert "OpenRouter authentication failed" in chunks[0].content

    # Health check test
    health = provider.check_health()
    assert health["provider"] == "OpenRouter"
    assert health["connected"] is False
    assert "api key" in health["error"].lower()


def test_check_llm_health_utility():
    """Verifies that check_llm_health returns formatted provider diagnostics."""
    health = check_llm_health()
    assert "provider" in health
    assert "model" in health
    assert "connected" in health
