"""
Non-Blocking Asynchronous Logging Service for AI Operations Traces.
Uses a background ThreadPoolExecutor to handle database persistence off the main thread,
ensuring 0ms added latency to student query responses and complete fault isolation.
"""

import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional

from app.analytics.database import db_manager
from app.core.logging_config import setup_logger

logger = setup_logger("async_logger")

# Background thread pool dedicated to non-blocking DB logging operations
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="ai_ops_logger")


class AsyncLoggerService:
    """Handles background, non-blocking trace and audit logging."""

    @staticmethod
    def _execute_log_trace(payload: Dict[str, Any]):
        """Worker function executed in background thread."""
        start = time.time()
        try:
            query_id = db_manager.log_ai_operations_trace(payload)
            elapsed = round((time.time() - start) * 1000, 2)
            logger.info(f"Async trace logged successfully for query_id='{query_id}' in {elapsed}ms.")
        except Exception as e:
            # Fault tolerance: logging errors never bubble up
            logger.error(f"Async DB logging worker failed silently: {e}")

    @staticmethod
    def _execute_log_feedback(
        query_id: Optional[str],
        session_id: str,
        rating: int,
        reason: Optional[str],
        comments: Optional[str]
    ):
        """Worker function for feedback persistence."""
        try:
            fb_id = db_manager.log_query_feedback_trace(query_id, session_id, rating, reason, comments)
            logger.info(f"Async feedback logged successfully (feedback_id='{fb_id}').")
        except Exception as e:
            logger.error(f"Async feedback logging failed: {e}")

    @staticmethod
    def _execute_log_admin_activity(
        actor: str,
        action: str,
        affected_record_id: Optional[str],
        ip_address: Optional[str]
    ):
        """Worker function for admin activity logging."""
        try:
            db_manager.log_admin_activity(actor, action, affected_record_id, ip_address)
        except Exception as e:
            logger.error(f"Async admin activity logging failed: {e}")

    def log_trace_async(self, payload: Dict[str, Any]):
        """
        Dispatches AI operation trace payload to background thread pool.
        Non-blocking execution returns immediately.
        """
        try:
            _executor.submit(self._execute_log_trace, payload)
        except Exception as e:
            logger.error(f"Failed to submit trace logging task to executor: {e}")

    def log_feedback_async(
        self,
        query_id: Optional[str],
        session_id: str,
        rating: int,
        reason: Optional[str] = None,
        comments: Optional[str] = None
    ):
        """Dispatches feedback logging task to background thread pool."""
        try:
            _executor.submit(self._execute_log_feedback, query_id, session_id, rating, reason, comments)
        except Exception as e:
            logger.error(f"Failed to submit feedback logging task to executor: {e}")

    def log_admin_activity_async(
        self,
        actor: str,
        action: str,
        affected_record_id: Optional[str] = None,
        ip_address: Optional[str] = None
    ):
        """Dispatches admin activity logging task to background thread pool."""
        try:
            _executor.submit(self._execute_log_admin_activity, actor, action, affected_record_id, ip_address)
        except Exception as e:
            logger.error(f"Failed to submit admin activity logging task to executor: {e}")


async_logger = AsyncLoggerService()
