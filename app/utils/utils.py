"""
Utility functions for health checks, environment validation, and system diagnostics.
"""

import requests
from typing import Dict, Any

from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("utils")


def check_ollama_health(ollama_url: str = config.OLLAMA_BASE_URL) -> Dict[str, Any]:
    """
    Checks connection to local/remote Ollama instance.

    Args:
        ollama_url (str): Ollama base URL.

    Returns:
        Dict[str, Any]: Status payload indicating connectivity and available models.
    """
    try:
        response = requests.get(f"{ollama_url.rstrip('/')}/api/tags", timeout=5)
        if response.status_code == 200:
            models = [m.get("name") for m in response.json().get("models", [])]
            return {
                "status": "healthy",
                "connected": True,
                "url": ollama_url,
                "models": models
            }
        return {
            "status": "unhealthy",
            "connected": False,
            "url": ollama_url,
            "error": f"Ollama HTTP {response.status_code}"
        }
    except Exception as e:
        logger.error(f"Failed to connect to Ollama server at {ollama_url}: {e}", exc_info=True)
        return {
            "status": "unhealthy",
            "connected": False,
            "url": ollama_url,
            "error": str(e)
        }


def check_dataset_status() -> Dict[str, Any]:
    """
    Validates presence of required CSJM_DOCUMENTS dataset directory.

    Returns:
        Dict[str, Any]: Dataset path status and file count.
    """
    try:
        resolved_path = config.get_resolved_data_dir()
        files = list(resolved_path.glob("*"))
        return {
            "exists": True,
            "path": str(resolved_path),
            "file_count": len(files)
        }
    except Exception as e:
        return {
            "exists": False,
            "error": str(e)
        }
