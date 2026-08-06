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
                "provider": "Ollama",
                "status": "healthy",
                "connected": True,
                "url": ollama_url,
                "models": models
            }
        return {
            "provider": "Ollama",
            "status": "unhealthy",
            "connected": False,
            "url": ollama_url,
            "error": f"Ollama HTTP {response.status_code}"
        }
    except Exception as e:
        logger.error(f"Failed to connect to Ollama server at {ollama_url}: {e}", exc_info=True)
        return {
            "provider": "Ollama",
            "status": "unhealthy",
            "connected": False,
            "url": ollama_url,
            "error": str(e)
        }


def check_llm_health() -> Dict[str, Any]:
    """
    Checks connectivity and status of active LLM Provider (OpenRouter or Ollama).

    Returns:
        Dict[str, Any]: Status payload indicating provider, model, connectivity, and health.
    """
    provider_type = config.LLM_PROVIDER.lower().strip()
    if provider_type == "openrouter":
        clean_key = (config.OPENROUTER_API_KEY or "").strip()
        base_url = (config.OPENROUTER_BASE_URL or "https://openrouter.ai/api/v1").rstrip("/")
        model_name = config.OPENROUTER_MODEL or "nvidia/nemotron-nano-9b-v2:free"

        if not clean_key:
            logger.warning("OpenRouter health check failed: OPENROUTER_API_KEY is missing or empty.")
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": model_name,
                "url": base_url,
                "error": "OpenRouter API Key is missing or empty"
            }

        models_url = f"{base_url}/models"
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
                    "model": model_name,
                    "url": base_url
                }
            logger.error(f"OpenRouter health check failed with HTTP {r.status_code}: {r.text[:200]}")
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": model_name,
                "url": base_url,
                "error": f"OpenRouter HTTP status {r.status_code}"
            }
        except Exception as e:
            logger.error(f"OpenRouter health check exception caught: {e}", exc_info=True)
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": model_name,
                "url": base_url,
                "error": str(e)
            }
    else:
        res = check_ollama_health()
        res["model"] = config.LLM_MODEL
        return res


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


def check_embedding_health() -> Dict[str, Any]:
    """
    Checks connectivity and status of active Embedding Provider (OpenRouter or Ollama).

    Returns:
        Dict[str, Any]: Status payload indicating embedding provider, model, collection, and health.
    """
    provider = config.get_active_embedding_provider()
    model_name = config.get_active_embedding_model_name()
    collection_name = config.get_effective_collection_name()

    if provider == "openrouter":
        clean_key = (config.OPENROUTER_API_KEY or "").strip()
        base_url = (config.OPENROUTER_BASE_URL or "https://openrouter.ai/api/v1").rstrip("/")

        if not clean_key:
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": model_name,
                "collection": collection_name,
                "error": "OpenRouter API Key is missing or empty"
            }

        models_url = f"{base_url}/models"
        headers = {
            "Authorization": f"Bearer {clean_key}",
            "HTTP-Referer": "https://csjmu.ac.in",
            "X-Title": "CSJMU AI Campus Assistant"
        }
        try:
            r = requests.get(models_url, headers=headers, timeout=10)
            if r.status_code == 200:
                return {
                    "provider": "OpenRouter",
                    "status": "healthy",
                    "connected": True,
                    "model": model_name,
                    "collection": collection_name,
                    "url": base_url
                }
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": model_name,
                "collection": collection_name,
                "error": f"OpenRouter HTTP status {r.status_code}"
            }
        except Exception as e:
            return {
                "provider": "OpenRouter",
                "status": "unhealthy",
                "connected": False,
                "model": model_name,
                "collection": collection_name,
                "error": str(e)
            }
    else:
        res = check_ollama_health()
        res["provider"] = "Ollama"
        res["model"] = model_name
        res["collection"] = collection_name
        return res

