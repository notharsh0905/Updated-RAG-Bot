"""
SQLite Database Manager for Analytics, Feedback, and Conversation Session History.
"""

import sqlite3
import json
import time
import uuid
import hashlib
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

            # 1. student_queries (Primary Trace Table)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_queries (
                query_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                conversation_id TEXT,
                anonymous_student_id TEXT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                prompt_version TEXT DEFAULT '2.0',
                model_used TEXT,
                embedding_model TEXT,
                retrieval_method TEXT DEFAULT 'hybrid_bm25_vector',
                total_retrieved_chunks INTEGER DEFAULT 0,
                confidence_score REAL DEFAULT 0.0,
                total_tokens INTEGER DEFAULT 0,
                prompt_tokens INTEGER DEFAULT 0,
                completion_tokens INTEGER DEFAULT 0,
                response_time_sec REAL DEFAULT 0.0,
                streaming_time_sec REAL DEFAULT 0.0,
                cached INTEGER DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_sq_session_id ON student_queries (session_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_sq_timestamp ON student_queries (timestamp DESC)")

            # 2. query_trace (Chunk Traces)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_trace (
                trace_id TEXT PRIMARY KEY,
                query_id TEXT NOT NULL,
                document_id TEXT,
                chunk_id TEXT,
                similarity_score REAL DEFAULT 0.0,
                chunk_rank INTEGER,
                source_page INTEGER DEFAULT 1,
                collection_name TEXT DEFAULT 'collection50',
                metadata_json TEXT,
                FOREIGN KEY (query_id) REFERENCES student_queries (query_id) ON DELETE CASCADE
            )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_qt_query_id ON query_trace (query_id)")

            # 3. query_documents (Question-Document Relationship)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_documents (
                rel_id TEXT PRIMARY KEY,
                query_id TEXT NOT NULL,
                document_id TEXT,
                filename TEXT NOT NULL,
                category TEXT,
                version TEXT DEFAULT '1.0',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (query_id) REFERENCES student_queries (query_id) ON DELETE CASCADE
            )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_qd_query_id ON query_documents (query_id)")

            # 4. query_feedback (Student Ratings)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_feedback (
                feedback_id TEXT PRIMARY KEY,
                query_id TEXT,
                session_id TEXT NOT NULL,
                rating INTEGER NOT NULL,
                reason TEXT,
                comments TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_qf_query_id ON query_feedback (query_id)")

            # 5. review_tickets (Admin Review Workflow)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_tickets (
                ticket_id TEXT PRIMARY KEY,
                query_id TEXT UNIQUE NOT NULL,
                status TEXT DEFAULT 'Pending',
                assigned_reviewer TEXT DEFAULT 'Unassigned',
                priority TEXT DEFAULT 'Medium',
                root_cause TEXT DEFAULT 'Unknown',
                resolution TEXT,
                admin_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (query_id) REFERENCES student_queries (query_id)
            )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rt_status ON review_tickets (status)")

            # 6. kb_tasks (Knowledge Improvement Tasks)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS kb_tasks (
                task_id TEXT PRIMARY KEY,
                linked_query_id TEXT,
                linked_document_id TEXT,
                task_summary TEXT NOT NULL,
                suggested_fix TEXT NOT NULL,
                priority TEXT DEFAULT 'High',
                department TEXT DEFAULT 'Knowledge Base Team',
                assigned_reviewer TEXT DEFAULT 'Unassigned',
                status TEXT DEFAULT 'Open',
                deadline TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_kbt_status ON kb_tasks (status)")

            # 8. student_inquiries (Production Student Inquiry System)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                category TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_si_reference_id ON student_inquiries (reference_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_si_status ON student_inquiries (status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_si_created_at ON student_inquiries (created_at DESC)")

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

    def log_ai_operations_trace(self, payload: Dict[str, Any]) -> str:
        """
        Logs complete AI operation trace across student_queries, query_trace, and query_documents tables.
        Returns generated query_id.
        """
        try:
            query_id = payload.get("query_id") or f"query_{uuid.uuid4()}"
            session_id = payload.get("session_id") or "anonymous"
            conversation_id = payload.get("conversation_id") or session_id
            anonymous_student_id = payload.get("anonymous_student_id") or f"student_{hashlib.md5(session_id.encode()).hexdigest()[:8]}"
            question = payload.get("question", "")
            answer = payload.get("answer", "")
            prompt_version = payload.get("prompt_version", "2.0")
            model_used = payload.get("model_used") or config.get_active_model_name()
            embedding_model = payload.get("embedding_model") or config.get_active_embedding_model_name()
            retrieval_method = payload.get("retrieval_method", "hybrid_bm25_vector")
            total_retrieved_chunks = payload.get("total_retrieved_chunks", 0)
            confidence_score = payload.get("confidence_score", 0.0)
            total_tokens = payload.get("total_tokens", 0)
            prompt_tokens = payload.get("prompt_tokens", 0)
            completion_tokens = payload.get("completion_tokens", 0)
            response_time_sec = payload.get("response_time_sec", 0.0)
            streaming_time_sec = payload.get("streaming_time_sec", 0.0)
            cached = 1 if payload.get("cached") else 0

            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # 1. Insert into student_queries
                cursor.execute("""
                INSERT OR REPLACE INTO student_queries (
                    query_id, session_id, conversation_id, anonymous_student_id,
                    question, answer, prompt_version, model_used, embedding_model,
                    retrieval_method, total_retrieved_chunks, confidence_score,
                    total_tokens, prompt_tokens, completion_tokens, response_time_sec,
                    streaming_time_sec, cached
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    query_id, session_id, conversation_id, anonymous_student_id,
                    question, answer, prompt_version, model_used, embedding_model,
                    retrieval_method, total_retrieved_chunks, confidence_score,
                    total_tokens, prompt_tokens, completion_tokens, response_time_sec,
                    streaming_time_sec, cached
                ))

                # 2. Insert retrieved chunks into query_trace
                chunks_trace = payload.get("retrieved_chunks", [])
                for rank, chunk in enumerate(chunks_trace, start=1):
                    trace_id = f"trace_{uuid.uuid4()}"
                    doc_id = chunk.get("document_id") or f"doc_{hashlib.md5(chunk.get('source', '').encode()).hexdigest()[:8]}"
                    chunk_id = chunk.get("chunk_id") or f"chunk_{rank}"
                    similarity_score = chunk.get("similarity_score") or chunk.get("vector_cosine_score") or 0.0
                    source_page = chunk.get("page") or 1
                    collection_name = chunk.get("collection") or "collection50"
                    metadata_json = json.dumps(chunk.get("metadata", {}))

                    cursor.execute("""
                    INSERT INTO query_trace (
                        trace_id, query_id, document_id, chunk_id, similarity_score,
                        chunk_rank, source_page, collection_name, metadata_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        trace_id, query_id, doc_id, chunk_id, similarity_score,
                        rank, source_page, collection_name, metadata_json
                    ))

                # 3. Insert question -> document relationships into query_documents
                documents = payload.get("documents", [])
                seen_docs = set()
                for doc_info in documents:
                    fname = doc_info.get("filename") or doc_info.get("source") or "Unknown"
                    if fname in seen_docs:
                        continue
                    seen_docs.add(fname)
                    
                    rel_id = f"qdoc_{uuid.uuid4()}"
                    doc_id = doc_info.get("document_id") or f"doc_{hashlib.md5(fname.encode()).hexdigest()[:8]}"
                    cat = doc_info.get("category") or doc_info.get("doc_type") or "General"
                    ver = doc_info.get("version", "1.0")

                    cursor.execute("""
                    INSERT INTO query_documents (
                        rel_id, query_id, document_id, filename, category, version
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """, (rel_id, query_id, doc_id, fname, cat, ver))

                conn.commit()
                return query_id
        except Exception as e:
            logger.error(f"Failed to log AI operations trace to DB: {e}")
            return ""

    def log_query_feedback_trace(
        self,
        query_id: Optional[str],
        session_id: str,
        rating: int,
        reason: Optional[str] = None,
        comments: Optional[str] = None
    ) -> str:
        """Logs student feedback and auto-creates review ticket if rating is negative (-1)."""
        try:
            feedback_id = f"fb_{uuid.uuid4()}"
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO query_feedback (feedback_id, query_id, session_id, rating, reason, comments)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (feedback_id, query_id, session_id, rating, reason or "", comments or ""))

                # Auto-generate review ticket if rating is -1 (Thumbs Down) and query_id exists
                if rating == -1 and query_id:
                    ticket_id = f"tkt_{str(uuid.uuid4())[:8]}"
                    cursor.execute("""
                    INSERT OR IGNORE INTO review_tickets (
                        ticket_id, query_id, status, assigned_reviewer, priority, root_cause, admin_notes
                    ) VALUES (?, ?, 'Pending', 'Unassigned', 'High', 'Negative Feedback', ?)
                    """, (ticket_id, query_id, f"Student negative rating: {comments or 'No comment'}"))

                conn.commit()
                return feedback_id
        except Exception as e:
            logger.error(f"Failed to log query feedback trace: {e}")
            return ""

    def log_admin_activity(
        self,
        actor: str,
        action: str,
        affected_record_id: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> bool:
        """Logs an administrative action for security and audit trail."""
        try:
            log_id = f"log_{uuid.uuid4()}"
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO admin_activity_logs (log_id, actor, action, affected_record_id, ip_address)
                VALUES (?, ?, ?, ?, ?)
                """, (log_id, actor, action, affected_record_id or "", ip_address or "127.0.0.1"))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to log admin activity: {e}")
            return False

    def get_queries_feed(
        self,
        limit: int = 50,
        offset: int = 0,
        rating: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves paginated AI operations query feed for Student Query Center."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                sql = """
                SELECT q.query_id, q.session_id, q.question, q.answer, q.confidence_score,
                       q.response_time_sec, q.total_retrieved_chunks, q.cached, q.timestamp,
                       f.rating as user_rating, f.comments as user_comments,
                       t.ticket_id, t.status as review_status, t.priority, t.assigned_reviewer, t.root_cause
                FROM student_queries q
                LEFT JOIN query_feedback f ON q.query_id = f.query_id
                LEFT JOIN review_tickets t ON q.query_id = t.query_id
                WHERE 1=1
                """
                params = []
                if rating is not None:
                    sql += " AND f.rating = ?"
                    params.append(rating)
                if status is not None:
                    sql += " AND t.status = ?"
                    params.append(status)

                sql += " ORDER BY q.timestamp DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])

        except Exception as e:
            logger.error(f"Failed to fetch queries feed: {e}")
            return []

    def create_student_inquiry(
        self,
        name: str,
        email: str,
        category: str,
        message: str
    ) -> Dict[str, Any]:
        """Creates a new student inquiry record and returns reference ID and details."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM student_inquiries")
                next_id = cursor.fetchone()[0]
                ref_id = f"CSJMU-2026-{next_id:04d}"

                cursor.execute("""
                INSERT INTO student_inquiries (reference_id, name, email, category, message, status)
                VALUES (?, ?, ?, ?, ?, 'Pending')
                """, (ref_id, name, email, category, message))
                
                inquiry_id = cursor.lastrowid
                conn.commit()

                cursor.execute("SELECT * FROM student_inquiries WHERE id = ?", (inquiry_id,))
                row = cursor.fetchone()
                return dict(row) if row else {"id": inquiry_id, "reference_id": ref_id, "status": "Pending"}
        except Exception as e:
            logger.error(f"Failed to create student inquiry in DB: {e}")
            raise e

    def get_student_inquiries(
        self,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        sort_order: str = "newest"
    ) -> List[Dict[str, Any]]:
        """Retrieves student inquiries matching optional search, status, and category filters."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                sql = "SELECT * FROM student_inquiries WHERE 1=1"
                params = []

                if search:
                    term = f"%{search.strip()}%"
                    sql += " AND (reference_id LIKE ? OR name LIKE ? OR email LIKE ? OR category LIKE ? OR message LIKE ?)"
                    params.extend([term, term, term, term, term])

                if status_filter and status_filter.lower() != "all":
                    sql += " AND status = ?"
                    params.append(status_filter)

                if category_filter and category_filter.lower() != "all":
                    sql += " AND category = ?"
                    params.append(category_filter)

                if sort_order.lower() == "oldest":
                    sql += " ORDER BY created_at ASC, id ASC"
                else:
                    sql += " ORDER BY created_at DESC, id DESC"

                cursor.execute(sql, params)
                rows = cursor.fetchall()
                return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Failed to fetch student inquiries: {e}")
            return []

    def update_student_inquiry_status(
        self,
        inquiry_id: int,
        status: str
    ) -> Optional[Dict[str, Any]]:
        """Updates inquiry status and updated_at timestamp."""
        valid_statuses = {"Pending", "In Progress", "Resolved", "Closed"}
        if status not in valid_statuses:
            raise ValueError(f"Invalid status '{status}'. Must be one of {valid_statuses}")

        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                UPDATE student_inquiries
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """, (status, inquiry_id))
                
                if cursor.rowcount == 0:
                    return None
                
                conn.commit()
                cursor.execute("SELECT * FROM student_inquiries WHERE id = ?", (inquiry_id,))
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Failed to update student inquiry status: {e}")
            raise e

    def delete_student_inquiry(self, inquiry_id: int) -> bool:
        """Deletes a student inquiry by ID."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM student_inquiries WHERE id = ?", (inquiry_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to delete student inquiry: {e}")
            return False

    def get_student_inquiry_counts(self) -> Dict[str, int]:
        """Returns inquiry count breakdown by status."""
        counts = {"Pending": 0, "In Progress": 0, "Resolved": 0, "Closed": 0, "total": 0}
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT status, COUNT(*) as count FROM student_inquiries GROUP BY status")
                rows = cursor.fetchall()
                total = 0
                for r in rows:
                    st = r["status"]
                    cnt = r["count"]
                    if st in counts:
                        counts[st] = cnt
                    total += cnt
                counts["total"] = total
                return counts
        except Exception as e:
            logger.error(f"Failed to get inquiry counts: {e}")
            return counts


db_manager = DatabaseManager()
