"""
LRU Response Cache for CSJMU RAG System.
Provides fast 0ms cached responses for identical or high-frequency questions.
"""

import time
from typing import Dict, Any, Optional
from app.core.logging_config import setup_logger

logger = setup_logger("cache_manager")


class ResponseCache:
    """In-memory LRU response cache with expiration time-to-live (TTL)."""

    def __init__(self, max_size: int = 250, ttl_seconds: int = 3600):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache: Dict[str, Dict[str, Any]] = {}

    def _make_key(self, question: str, k: int, strict: bool) -> str:
        clean = question.strip().lower()
        return f"{clean}::k={k}::strict={strict}"

    def get(self, question: str, k: int, strict: bool) -> Optional[Any]:
        key = self._make_key(question, k, strict)
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry["timestamp"] < self.ttl_seconds:
                logger.info(f"Cache HIT for query: '{question}'")
                return entry["data"]
            else:
                # Expired
                del self.cache[key]
        return None

    def put(self, question: str, k: int, strict: bool, data: Any):
        key = self._make_key(question, k, strict)
        if len(self.cache) >= self.max_size:
            # Evict oldest key
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]["timestamp"])
            del self.cache[oldest_key]

        self.cache[key] = {
            "timestamp": time.time(),
            "data": data
        }
        logger.info(f"Cached response for query: '{question}'")

    def clear(self):
        """Clears all cached entries."""
        self.cache.clear()
        logger.info("Response cache cleared.")


response_cache = ResponseCache()
