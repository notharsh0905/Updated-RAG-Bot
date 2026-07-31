"""
SQLite Database Manager for Analytics, Feedback, and Conversation Session History.
"""

import sqlite3
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("database_manager")

DB_PATH = config.BASE_DIR / "data" / "analytics.db"


class DatabaseManager:
    """Manages SQLite tables for queries, feedback, and session memory."""

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_tables()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        """Initializes database schema."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Query log table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                question TEXT,
                normalized_question TEXT,
                answer TEXT,
                response_time_sec REAL,
                sources_count INTEGER,
                cached INTEGER DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # Feedback table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                question TEXT,
                answer TEXT,
                rating INTEGER, -- 1 for 👍 (positive), -1 for 👎 (negative)
                comments TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # Session memory table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS session_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                role TEXT, -- 'user' or 'assistant'
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # Uploaded documents metadata table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS uploaded_documents (
                document_id TEXT PRIMARY KEY,
                original_filename TEXT NOT NULL,
                stored_filename TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size_bytes INTEGER NOT NULL,
                checksum TEXT UNIQUE NOT NULL,
                category TEXT,
                page_count INTEGER DEFAULT 1,
                chunk_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'completed',
                upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)
            conn.commit()

    def log_query(
        self,
        session_id: str,
        question: str,
        normalized_question: str,
        answer: str,
        response_time_sec: float,
        sources_count: int,
        cached: bool = False
    ) -> int:
        """Logs a query execution record."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO query_logs (session_id, question, normalized_question, answer, response_time_sec, sources_count, cached)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (session_id, question, normalized_question, answer, response_time_sec, sources_count, 1 if cached else 0))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            logger.error(f"Failed to log query to DB: {e}")
            return -1

    def log_feedback(
        self,
        session_id: str,
        question: str,
        answer: str,
        rating: int,
        comments: Optional[str] = None
    ) -> bool:
        """Logs user feedback (👍 = 1, 👎 = -1)."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO feedback_logs (session_id, question, answer, rating, comments)
                VALUES (?, ?, ?, ?, ?)
                """, (session_id, question, answer, rating, comments or ""))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to log feedback: {e}")
            return False

    def add_session_message(self, session_id: str, role: str, content: str):
        """Adds a message to persistent session history."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO session_memory (session_id, role, content)
                VALUES (?, ?, ?)
                """, (session_id, role, content))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to save session message: {e}")

    def get_session_history(self, session_id: str, limit: int = 10) -> List[Dict[str, str]]:
        """Retrieves recent session conversation history."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                SELECT role, content FROM session_memory
                WHERE session_id = ?
                ORDER BY id ASC
                LIMIT ?
                """, (session_id, limit))
                rows = cursor.fetchall()
                return [{"role": r["role"], "content": r["content"]} for r in rows]
        except Exception as e:
            logger.error(f"Failed to fetch session history: {e}")
            return []

    def get_analytics_summary(self) -> Dict[str, Any]:
        """Returns analytics summary for admin dashboard."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) as total_queries, AVG(response_time_sec) as avg_time, SUM(cached) as cache_hits FROM query_logs")
                q_row = cursor.fetchone()
                
                cursor.execute("SELECT SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as positive, SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END) as negative FROM feedback_logs")
                f_row = cursor.fetchone()

                total_queries = q_row["total_queries"] if q_row else 0
                avg_time = round(q_row["avg_time"], 3) if q_row and q_row["avg_time"] else 0.0
                cache_hits = q_row["cache_hits"] if q_row and q_row["cache_hits"] else 0
                positive_fb = f_row["positive"] if f_row and f_row["positive"] else 0
                negative_fb = f_row["negative"] if f_row and f_row["negative"] else 0

                return {
                    "total_queries": total_queries,
                    "avg_response_time_sec": avg_time,
                    "cache_hits": cache_hits,
                    "thumbs_up": positive_fb,
                    "thumbs_down": negative_fb,
                    "satisfaction_pct": round((positive_fb / max(1, positive_fb + negative_fb)) * 100, 1)
                }
        except Exception as e:
            logger.error(f"Failed to fetch analytics summary: {e}")
            return {"total_queries": 0, "avg_response_time_sec": 0.0, "cache_hits": 0, "thumbs_up": 0, "thumbs_down": 0, "satisfaction_pct": 0.0}

    def log_uploaded_document(
        self,
        document_id: str,
        original_filename: str,
        stored_filename: str,
        file_type: str,
        file_size_bytes: int,
        checksum: str,
        category: str = "uploaded_document",
        page_count: int = 1,
        chunk_count: int = 0,
        status: str = "completed"
    ) -> bool:
        """Logs an uploaded document's metadata to SQLite database."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT OR REPLACE INTO uploaded_documents (
                    document_id, original_filename, stored_filename, file_type,
                    file_size_bytes, checksum, category, page_count, chunk_count, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    document_id, original_filename, stored_filename, file_type,
                    file_size_bytes, checksum, category, page_count, chunk_count, status
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to log uploaded document: {e}")
            return False

    def get_uploaded_documents(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieves list of all uploaded documents with metadata."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                SELECT document_id, original_filename, stored_filename, file_type,
                       file_size_bytes, checksum, category, page_count, chunk_count,
                       status, upload_timestamp
                FROM uploaded_documents
                ORDER BY upload_timestamp DESC
                LIMIT ?
                """, (limit,))
                rows = cursor.fetchall()
                return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Failed to fetch uploaded documents: {e}")
            return []

    def get_document_by_checksum(self, checksum: str) -> Optional[Dict[str, Any]]:
        """Checks if a document with identical SHA-256 checksum exists."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                SELECT document_id, original_filename, stored_filename, file_type,
                       file_size_bytes, checksum, category, page_count, chunk_count,
                       status, upload_timestamp
                FROM uploaded_documents
                WHERE checksum = ?
                """, (checksum,))
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Failed to fetch document by checksum: {e}")
            return None


db_manager = DatabaseManager()
