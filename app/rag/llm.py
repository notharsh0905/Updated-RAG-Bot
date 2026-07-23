"""
LLM Management module. Initializes and configures local ChatOllama model instance.
"""

from typing import Optional
from langchain_ollama import ChatOllama

from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("llm")


class LLMManager:
    """Manages ChatOllama LLM lifecycle and configuration."""

    def __init__(
        self,
        model_name: Optional[str] = None,
        ollama_url: Optional[str] = None,
        temperature: float = 0.0,
    ):
        """
        Initializes ChatOllama instance.

        Args:
            model_name (Optional[str]): LLM model identifier.
            ollama_url (Optional[str]): Ollama base service URL.
            temperature (float): Generation temperature.
        """
        self.model_name = model_name or config.LLM_MODEL
        self.ollama_url = ollama_url or config.OLLAMA_BASE_URL
        self.temperature = temperature

        logger.info(
            f"Initializing ChatOllama: model='{self.model_name}', "
            f"base_url='{self.ollama_url}', temp={self.temperature}"
        )
        self.llm = ChatOllama(
            model=self.model_name,
            base_url=self.ollama_url,
            temperature=self.temperature
        )

    def get_llm(self) -> ChatOllama:
        """Returns the configured ChatOllama instance."""
        return self.llm
