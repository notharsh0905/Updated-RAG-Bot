"""
Conversation Memory Manager for multi-turn chat sessions.
Manages conversation buffer windows and session context.
"""

from typing import List, Dict, Any, Optional
from app.analytics.database import db_manager
from app.core.logging_config import setup_logger

logger = setup_logger("memory_manager")


class ConversationMemoryManager:
    """Manages chat session state and multi-turn message history."""

    def __init__(self, window_size: int = 6):
        self.window_size = window_size

    def get_history(self, session_id: str, limit: Optional[int] = None) -> List[Dict[str, str]]:
        """Retrieves recent message history for a given session."""
        if not session_id:
            return []
        fetch_limit = limit if limit is not None else self.window_size
        return db_manager.get_session_history(session_id, limit=fetch_limit)

    def add_user_message(self, session_id: str, message: str):
        """Saves user query to session memory."""
        if session_id and message:
            db_manager.add_session_message(session_id, "user", message)

    def add_assistant_message(self, session_id: str, message: str):
        """Saves assistant response to session memory."""
        if session_id and message:
            db_manager.add_session_message(session_id, "assistant", message)

    def format_history_as_context(self, history: List[Dict[str, str]]) -> str:
        """Formats conversation history into a structured prompt context block."""
        if not history:
            return ""
        
        formatted = []
        for msg in history:
            role = "User" if msg["role"] == "user" else "Assistant"
            formatted.append(f"{role}: {msg['content']}")
        
        return "\n".join(formatted)


memory_manager = ConversationMemoryManager()
