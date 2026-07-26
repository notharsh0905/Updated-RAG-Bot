"""
Unit tests for new RAG Pipeline components (QueryProcessor, Cache, Memory, DB Manager, Retriever).
"""

import pytest
from app.query.query_processor import query_processor
from app.cache.cache import response_cache
from app.memory.memory import memory_manager
from app.analytics.database import db_manager


def test_query_processor_normalization():
    raw_query = "what is  the admisson eligibility for uiet btech csjmu?"
    normalized = query_processor.normalize_query(raw_query)
    assert "admission" in normalized
    assert "UIET" in normalized
    assert "B.Tech" in normalized
    assert "CSJMU" in normalized


def test_query_processor_rewriting():
    history = [{"role": "user", "content": "Tell me about B.Tech Computer Science."}]
    query = "What is its eligibility criteria?"
    rewritten = query_processor.rewrite_query_with_history(query, history)
    assert "Tell me about B.Tech Computer Science." in rewritten


def test_response_cache():
    response_cache.clear()
    question = "What is CSJMU?"
    response_cache.put(question, k=5, strict=True, data="CSJMU is a public state university in Kanpur.")
    
    cached = response_cache.get(question, k=5, strict=True)
    assert cached == "CSJMU is a public state university in Kanpur."
    
    miss = response_cache.get("Different Question", k=5, strict=True)
    assert miss is None


def test_database_manager_and_memory(tmp_path):
    import uuid
    session_id = f"test_session_{uuid.uuid4().hex}"
    db_manager.add_session_message(session_id, "user", "Hello")
    db_manager.add_session_message(session_id, "assistant", "Hi there!")
    
    history = db_manager.get_session_history(session_id)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"

    memory_history = memory_manager.get_history(session_id, limit=50)
    assert len(memory_history) == 2


def test_database_feedback_logging():
    success = db_manager.log_feedback(
        session_id="test_sess",
        question="Where is CSJMU?",
        answer="Kanpur",
        rating=1,
        comments="Great answer!"
    )
    assert success is True
    
    summary = db_manager.get_analytics_summary()
    assert "total_queries" in summary
    assert "satisfaction_pct" in summary
