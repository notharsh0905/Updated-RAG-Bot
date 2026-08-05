"""
LLM Provider Abstraction Layer for CSJMU & UIET AI Assistant.
Supports OpenRouter (NVIDIA Nemotron Nano 9B V2 free model) and local Ollama.
Preserves existing interface for seamless RAG pipeline integration.
"""

from abc import ABC, abstractmethod
from typing import Generator, Any, Dict, Optional
import requests

from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("llm_providers")


class LLMResponse:
    """Standardized response container matching LangChain / RAG expectations."""

    def __init__(self, content: str):
        self.content = content

    def __str__(self):
        return self.content


class LLMChunk:
    """Standardized stream chunk container matching streaming expectations."""

    def __init__(self, content: str):
        self.content = content

    def __str__(self):
        return self.content


class BaseLLMProvider(ABC):
    """Abstract Base Class defining the unified LLM Provider interface."""

    @abstractmethod
    def invoke(self, prompt: str) -> LLMResponse:
        """Generates a complete text response for a given prompt string."""
        pass

    @abstractmethod
    def stream(self, prompt: str) -> Generator[LLMChunk, None, None]:
        """Yields streaming response chunks for a given prompt string."""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Returns the active model name identifier."""
        pass

    @abstractmethod
    def check_health(self) -> Dict[str, Any]:
        """Evaluates provider connectivity and health metrics."""
        pass


class OllamaProvider(BaseLLMProvider):
    """Local Ollama LLM Provider using ChatOllama."""

    def __init__(
        self,
        model_name: Optional[str] = None,
        base_url: Optional[str] = None,
        temperature: float = 0.0,
    ):
        self.model_name = model_name or config.LLM_MODEL
        self.base_url = base_url or config.OLLAMA_BASE_URL
        self.temperature = temperature

        from langchain_ollama import ChatOllama
        logger.info(f"Initializing OllamaProvider: model='{self.model_name}', base_url='{self.base_url}'")
        self.llm = ChatOllama(
            model=self.model_name,
            base_url=self.base_url,
            temperature=self.temperature
        )

    def invoke(self, prompt: str) -> LLMResponse:
        try:
            res = self.llm.invoke(prompt)
            content = res.content if hasattr(res, "content") else str(res)
            return LLMResponse(content)
        except Exception as e:
            logger.error(f"Ollama invoke error: {e}", exc_info=True)
            return LLMResponse(
                "I am currently unable to generate a response from the local Ollama LLM service. "
                "Please verify that the Ollama service is running and accessible."
            )

    def stream(self, prompt: str) -> Generator[LLMChunk, None, None]:
        try:
            for chunk in self.llm.stream(prompt):
                token = chunk.content if hasattr(chunk, "content") else str(chunk)
                yield LLMChunk(token)
        except Exception as e:
            logger.error(f"Ollama stream error: {e}", exc_info=True)
            yield LLMChunk(
                "An error occurred while streaming from the local Ollama LLM service. "
                "Please verify that Ollama is running properly."
            )

    def get_model_name(self) -> str:
        return self.model_name

    def check_health(self) -> Dict[str, Any]:
        try:
            r = requests.get(f"{self.base_url.rstrip('/')}/api/tags", timeout=5)
            if r.status_code == 200:
                models = [m.get("name") for m in r.json().get("models", [])]
                return {
                    "provider": "Ollama",
                    "status": "healthy",
                    "connected": True,
                    "model": self.model_name,
                    "url": self.base_url,
                    "models": models
                }
            return {
                "provider": "Ollama",
                "status": "unhealthy",
                "connected": False,
                "model": self.model_name,
                "url": self.base_url,
                "error": f"Ollama HTTP {r.status_code}"
            }
        except Exception as e:
            return {
                "provider": "Ollama",
                "status": "unhealthy",
                "connected": False,
                "model": self.model_name,
                "url": self.base_url,
                "error": str(e)
            }


class OpenRouterProvider(BaseLLMProvider):
    """OpenRouter LLM Provider using official OpenAI Python SDK (NVIDIA Nemotron Nano 9B V2 Free)."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model_name: Optional[str] = None,
        temperature: float = 0.0,
    ):
        self._custom_api_key = api_key
        self.base_url = (base_url or config.OPENROUTER_BASE_URL or "https://openrouter.ai/api/v1").rstrip("/")
        self.model_name = model_name or config.OPENROUTER_MODEL or "nvidia/nemotron-nano-9b-v2:free"
        self.temperature = temperature

        current_key = self.get_api_key()
        api_key_exists = bool(current_key)
        logger.info(
            f"[OpenRouterProvider Init] Provider: openrouter | API Key Exists: {api_key_exists} | "
            f"Model: {self.model_name} | Base URL: {self.base_url}"
        )

        import openai
        self.client = openai.OpenAI(
            api_key=current_key if current_key else "missing_key",
            base_url=self.base_url,
            default_headers={
                "HTTP-Referer": "https://csjmu.ac.in",
                "X-Title": "CSJMU AI Campus Assistant"
            }
        )

    def get_api_key(self) -> str:
        """Returns active OpenRouter API key from shared config instance or custom override."""
        key = self._custom_api_key or config.OPENROUTER_API_KEY or ""
        return key.strip()

    def invoke(self, prompt: str) -> LLMResponse:
        current_key = self.get_api_key()
        api_key_exists = bool(current_key)
        logger.info(
            f"[OpenRouter Invoke] Provider: openrouter | API Key Exists: {api_key_exists} | "
            f"Model: {self.model_name} | Base URL: {self.base_url}"
        )

        if current_key:
            self.client.api_key = current_key

        try:
            import openai
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
            )
            content = response.choices[0].message.content or ""
            return LLMResponse(content)
        except openai.AuthenticationError as ae:
            logger.error(f"OpenRouter AuthenticationError: {ae}", exc_info=True)
            return LLMResponse("OpenRouter authentication failed. Please verify your OPENROUTER_API_KEY environment variable.")
        except openai.RateLimitError as rle:
            logger.error(f"OpenRouter RateLimitError: {rle}", exc_info=True)
            return LLMResponse("OpenRouter rate limit reached. Please wait a moment and try your question again.")
        except openai.APIConnectionError as ace:
            logger.error(f"OpenRouter APIConnectionError: {ace}", exc_info=True)
            return LLMResponse("Could not connect to OpenRouter servers. Please check your network connection.")
        except openai.APITimeoutError as ate:
            logger.error(f"OpenRouter APITimeoutError: {ate}", exc_info=True)
            return LLMResponse("OpenRouter request timed out. Please retry your question.")
        except Exception as e:
            logger.error(f"OpenRouter generation error: {e}", exc_info=True)
            return LLMResponse(f"An unexpected error occurred while communicating with OpenRouter: {str(e)}")

    def stream(self, prompt: str) -> Generator[LLMChunk, None, None]:
        current_key = self.get_api_key()
        api_key_exists = bool(current_key)
        logger.info(
            f"[OpenRouter Stream] Provider: openrouter | API Key Exists: {api_key_exists} | "
            f"Model: {self.model_name} | Base URL: {self.base_url}"
        )

        if current_key:
            self.client.api_key = current_key

        try:
            import openai
            stream_res = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                stream=True,
            )
            for chunk in stream_res:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        yield LLMChunk(delta)
        except openai.AuthenticationError as ae:
            logger.error(f"OpenRouter AuthenticationError during stream: {ae}", exc_info=True)
            yield LLMChunk("OpenRouter authentication failed. Please verify your OPENROUTER_API_KEY environment variable.")
        except openai.RateLimitError as rle:
            logger.error(f"OpenRouter RateLimitError during stream: {rle}", exc_info=True)
            yield LLMChunk("OpenRouter rate limit reached. Please wait a moment and try again.")
        except Exception as e:
            logger.error(f"OpenRouter stream error: {e}", exc_info=True)
            yield LLMChunk(f"An unexpected error occurred during streaming from OpenRouter: {str(e)}")

    def get_model_name(self) -> str:
        return self.model_name

    def check_health(self) -> Dict[str, Any]:
        clean_key = self.get_api_key()
        if not clean_key:
            logger.warning("OpenRouter health check failed: OPENROUTER_API_KEY is missing or empty.")
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": self.model_name,
                "url": self.base_url,
                "error": "OpenRouter API Key is missing or empty"
            }

        models_url = f"{self.base_url}/models"
        headers = {
            "Authorization": f"Bearer {clean_key}",
            "HTTP-Referer": "https://csjmu.ac.in",
            "X-Title": "CSJMU AI Campus Assistant"
        }
        try:
            logger.info(f"Performing OpenRouter health check via GET {models_url}")
            r = requests.get(models_url, headers=headers, timeout=10)
            logger.info(f"OpenRouter health check returned HTTP status code: {r.status_code}")
            if r.status_code == 200:
                return {
                    "provider": "OpenRouter",
                    "status": "healthy",
                    "connected": True,
                    "model": self.model_name,
                    "url": self.base_url
                }
            logger.error(f"OpenRouter health check failed with HTTP {r.status_code}: {r.text[:200]}")
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": self.model_name,
                "url": self.base_url,
                "error": f"OpenRouter HTTP status {r.status_code}"
            }
        except Exception as e:
            logger.error(f"OpenRouter health check exception caught: {e}", exc_info=True)
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": self.model_name,
                "url": self.base_url,
                "error": str(e)
            }
