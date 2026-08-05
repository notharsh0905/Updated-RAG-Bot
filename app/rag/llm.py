"""
LLM Management module. Instantiates active LLM Provider (OpenRouter or Ollama).
"""

from typing import Optional, Dict, Any
from app.core.config import config
from app.core.logging_config import setup_logger
from app.rag.providers import BaseLLMProvider, OllamaProvider, OpenRouterProvider

logger = setup_logger("llm")


class LLMManager:
    """Manages LLM provider lifecycle and dynamic provider switching."""

    def __init__(
        self,
        provider_type: Optional[str] = None,
        model_name: Optional[str] = None,
        temperature: float = 0.0,
    ):
        self.provider_type = (provider_type or config.LLM_PROVIDER).lower().strip()
        self.temperature = temperature

        if self.provider_type == "openrouter":
            self.provider: BaseLLMProvider = OpenRouterProvider(
                model_name=model_name or config.OPENROUTER_MODEL,
                temperature=self.temperature
            )
        elif self.provider_type == "ollama":
            self.provider: BaseLLMProvider = OllamaProvider(
                model_name=model_name or config.LLM_MODEL,
                temperature=self.temperature
            )
        else:
            logger.warning(f"Unknown LLM_PROVIDER '{self.provider_type}'. Defaulting to OpenRouter.")
            self.provider_type = "openrouter"
            self.provider = OpenRouterProvider(
                model_name=model_name or config.OPENROUTER_MODEL,
                temperature=self.temperature
            )

        self.model_name = self.provider.get_model_name()

    def get_llm(self) -> BaseLLMProvider:
        """Returns the configured active LLM Provider instance."""
        return self.provider

    def check_health(self) -> Dict[str, Any]:
        """Returns the connectivity status of the active LLM Provider."""
        return self.provider.check_health()
