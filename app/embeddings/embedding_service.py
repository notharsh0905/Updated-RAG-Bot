"""
Embedding Service Module for CSJMU AI Knowledge Assistant.
Provides a unified LangChain-compatible embedding interface supporting both Ollama and OpenRouter.
"""

from typing import List, Optional
import requests
from langchain_core.embeddings import Embeddings
from langchain_ollama import OllamaEmbeddings
from openai import OpenAI

from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("embedding_service")


class EmbeddingService(Embeddings):
    """
    Unified Embedding Service abstracting Ollama and OpenRouter providers.
    Direct drop-in replacement for standard LangChain embeddings.
    """

    def __init__(
        self,
        provider: Optional[str] = None,
        model_name: Optional[str] = None,
        ollama_url: Optional[str] = None,
        openrouter_api_key: Optional[str] = None,
        openrouter_base_url: Optional[str] = None,
        skip_health_check: bool = False
    ):
        """
        Initializes EmbeddingService with selected provider configuration.

        Args:
            provider (Optional[str]): Provider type ("ollama" or "openrouter"). Defaults to config.
            model_name (Optional[str]): Model name override.
            ollama_url (Optional[str]): Ollama base URL override.
            openrouter_api_key (Optional[str]): OpenRouter API key override.
            openrouter_base_url (Optional[str]): OpenRouter base URL override.
            skip_health_check (bool): If True, bypass startup connectivity validation.
        """
        self.provider = (provider or config.get_active_embedding_provider()).lower().strip()
        self.ollama_url = ollama_url if ollama_url is not None else config.OLLAMA_BASE_URL
        self.openrouter_api_key = openrouter_api_key if openrouter_api_key is not None else config.OPENROUTER_API_KEY
        self.openrouter_base_url = openrouter_base_url if openrouter_base_url is not None else config.OPENROUTER_BASE_URL


        if self.provider == "openrouter":
            self.model_name = model_name or config.OPENROUTER_EMBEDDING_MODEL
            self._init_openrouter(skip_health_check=skip_health_check)
        elif self.provider == "ollama":
            self.model_name = model_name or config.OLLAMA_EMBEDDING_MODEL or config.EMBEDDING_MODEL
            self._init_ollama(skip_health_check=skip_health_check)
        else:
            raise ValueError(f"Unsupported EMBEDDING_PROVIDER '{self.provider}'. Supported providers: 'ollama', 'openrouter'.")

        logger.info(
            f"EmbeddingService initialized successfully: provider='{self.provider}', "
            f"model='{self.model_name}'"
        )

    def _init_openrouter(self, skip_health_check: bool = False) -> None:
        """Configures OpenRouter OpenAI-compatible embedding client."""
        clean_key = (self.openrouter_api_key or "").strip()
        if not clean_key:
            raise ValueError(
                "EMBEDDING_PROVIDER is set to 'openrouter', but OPENROUTER_API_KEY is missing or empty in environment configuration."
            )

        logger.info(f"Initializing OpenRouter Embeddings: model='{self.model_name}', url='{self.openrouter_base_url}'")
        self.client = OpenAI(
            base_url=self.openrouter_base_url,
            api_key=clean_key,
            default_headers={
                "HTTP-Referer": "https://csjmu.ac.in",
                "X-Title": "CSJMU AI Campus Assistant"
            }
        )

        if not skip_health_check:
            try:
                # Test connectivity with a single test input
                self.client.embeddings.create(
                    model=self.model_name,
                    input=["ping"],
                    extra_body={"encoding_format": "float"}
                )
                logger.info(f"OpenRouter embedding service connectivity verified successfully for model '{self.model_name}'.")
            except Exception as e:
                logger.warning(
                    f"OpenRouter test call for model '{self.model_name}' failed ({e}). "
                    "Proceeding with client instance; runtime errors will be logged if requests fail."
                )

    def _init_ollama(self, skip_health_check: bool = False) -> None:
        """Configures local Ollama embedding client."""
        if not skip_health_check:
            try:
                r = requests.get(f"{self.ollama_url.rstrip('/')}/api/tags", timeout=5)
                if r.status_code != 200:
                    logger.warning(
                        f"EMBEDDING_PROVIDER is set to 'ollama', but Ollama server at '{self.ollama_url}' returned status code {r.status_code}."
                    )
                else:
                    logger.info(f"Ollama embedding service connectivity verified successfully for model '{self.model_name}'.")
            except Exception as e:
                logger.warning(
                    f"EMBEDDING_PROVIDER is set to 'ollama', but Ollama server at '{self.ollama_url}' is offline or unreachable ({e}). "
                    "Proceeding with client instance; runtime errors will be logged if requests fail."
                )

        logger.info(f"Initializing Ollama Embeddings: model='{self.model_name}', url='{self.ollama_url}'")
        self._provider_impl = OllamaEmbeddings(
            model=self.model_name,
            base_url=self.ollama_url
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embeds a list of document strings."""
        if not texts:
            return []

        # Safe truncation for high context length documents (e.g. parent docs)
        safe_texts = [t[:12000] if isinstance(t, str) and len(t) > 12000 else t for t in texts]

        if self.provider == "ollama":
            return self._provider_impl.embed_documents(safe_texts)

        # OpenRouter batch embedding
        embeddings: List[List[float]] = []
        batch_size = 50
        for i in range(0, len(safe_texts), batch_size):
            batch = safe_texts[i:i + batch_size]
            try:
                res = self.client.embeddings.create(
                    model=self.model_name,
                    input=batch,
                    extra_body={"encoding_format": "float"}
                )
                sorted_data = sorted(res.data, key=lambda x: x.index)
                for item in sorted_data:
                    embeddings.append(item.embedding)
            except Exception as e:
                logger.error(f"Error generating OpenRouter embeddings for batch {i // batch_size + 1}: {e}", exc_info=True)
                raise RuntimeError(f"OpenRouter embedding generation failed: {e}")

        return embeddings

    def embed_query(self, text: str) -> List[float]:
        """Embeds a single query string."""
        if not text:
            return []

        safe_text = text[:12000] if isinstance(text, str) and len(text) > 12000 else text

        if self.provider == "ollama":
            return self._provider_impl.embed_query(safe_text)

        try:
            res = self.client.embeddings.create(
                model=self.model_name,
                input=[safe_text],
                extra_body={"encoding_format": "float"}
            )
            return res.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating OpenRouter query embedding: {e}", exc_info=True)
            raise RuntimeError(f"OpenRouter query embedding generation failed: {e}")



    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        """Asynchronous document embedding fallback to synchronous implementation."""
        return self.embed_documents(texts)

    async def aembed_query(self, text: str) -> List[float]:
        """Asynchronous query embedding fallback to synchronous implementation."""
        return self.embed_query(text)
