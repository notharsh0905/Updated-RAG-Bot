"""
Verification Script for AI Operations Database & Async Logger Pipeline (Sprint 2 - Phase 1).
Tests schema migrations for all 7 tables, non-blocking async trace logging,
feedback & review ticket creation, fault isolation, and admin activity logging.
"""

import os
import sys
import time
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.analytics.database import db_manager, DB_PATH
from app.analytics.async_logger import async_logger

def run_verification():
    print("🚀 STARTING SPRINT 2 PHASE 1 VERIFICATION TEST...")

    # 1. Verify all 7 AI Operations tables exist in SQLite
    print("\n1. Verifying Database Schema Migrations...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()

    required_tables = [
        "student_queries",
        "query_trace",
        "query_documents",
        "query_feedback",
        "review_tickets",
        "kb_tasks",
        "admin_activity_logs"
    ]

    for t in required_tables:
        assert t in tables, f"Required table '{t}' missing from database!"
        print(f"  ✓ Table '{t}' exists.")

    print("✅ All 7 AI Operations tables verified successfully!")

    # 2. Test Real Query Execution & Non-Blocking Async Trace Logging
    print("\n2. Testing RAG Query Execution & Async Trace Dispatch...")
    pipeline = RAGPipeline()
    
    test_question = "What is the minimum eligibility percentage for B.Tech CSE at UIET Kanpur?"
    
    start_t = time.time()
    result = pipeline.ask(test_question, k=3, return_sources=True)
    query_exec_time = round(time.time() - start_t, 3)

    print(f"  ✓ Query executed in {query_exec_time}s.")
    print(f"  ✓ Query ID: {result.get('query_id')}")
    print(f"  ✓ Answer snippet: {result['answer'][:100]}...")

    # Allow 0.5s for background thread worker to write trace
    time.sleep(0.5)

    # 3. Verify Database Persistence across student_queries, query_trace, and query_documents
    print("\n3. Verifying Records in DB Traces...")
    query_id = result.get("query_id")
    assert query_id, "Query ID missing from result payload!"

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM student_queries WHERE query_id = ?", (query_id,))
    sq_row = cursor.fetchone()
    assert sq_row is not None, f"No student_queries record found for query_id={query_id}"
    print(f"  ✓ student_queries record found: Question='{sq_row['question'][:40]}...', Latency={sq_row['response_time_sec']}s, Confidence={sq_row['confidence_score']}")

    cursor.execute("SELECT * FROM query_trace WHERE query_id = ?", (query_id,))
    qt_rows = cursor.fetchall()
    assert len(qt_rows) > 0, f"No query_trace chunk records found for query_id={query_id}"
    print(f"  ✓ query_trace records found ({len(qt_rows)} chunks logged): Top chunk source='{qt_rows[0]['metadata_json'][:60]}...'")

    cursor.execute("SELECT * FROM query_documents WHERE query_id = ?", (query_id,))
    qd_rows = cursor.fetchall()
    assert len(qd_rows) > 0, f"No query_documents records found for query_id={query_id}"
    print(f"  ✓ query_documents records found ({len(qd_rows)} documents linked): '{qd_rows[0]['filename']}'")

    conn.close()

    # 4. Test Negative Feedback & Automatic Review Ticket Generation
    print("\n4. Testing Negative Feedback & Review Ticket Workflow...")
    fb_id = db_manager.log_query_feedback_trace(
        query_id=query_id,
        session_id=result["session_id"],
        rating=-1,
        reason="Incorrect Fee Detail",
        comments="Student reported fee figure discrepant with latest circular."
    )
    print(f"  ✓ Logged feedback ID: {fb_id}")

    time.sleep(0.3)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM review_tickets WHERE query_id = ?", (query_id,))
    tkt_row = cursor.fetchone()
    assert tkt_row is not None, "Review ticket was not auto-generated for negative feedback!"
    print(f"  ✓ Auto-generated review ticket found: Ticket ID={tkt_row['ticket_id']}, Status='{tkt_row['status']}', Priority='{tkt_row['priority']}'")
    conn.close()

    # 5. Test Admin Activity Logging
    print("\n5. Testing Admin Activity Log...")
    db_manager.log_admin_activity(
        actor="director.uiet@csjmu.ac.in",
        action="Reviewed Low Confidence Query",
        affected_record_id=query_id,
        ip_address="192.168.1.100"
    )

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_activity_logs WHERE affected_record_id = ?", (query_id,))
    aal_row = cursor.fetchone()
    assert aal_row is not None, "Admin activity log record missing!"
    print(f"  ✓ Admin activity log verified: Actor='{aal_row['actor']}', Action='{aal_row['action']}'")
    conn.close()

    # 6. Test Fault Tolerance (DB Log Error Isolation)
    print("\n6. Testing Fault Tolerance (Async Log Failure Isolation)...")
    # Malformed payload that fails DB insertion
    bad_payload = {"invalid_field": 12345}
    async_logger.log_trace_async(bad_payload)
    print("  ✓ Dispatched malformed payload to async_logger — application continued executing safely without exception.")

    print("\n✨ ALL SPRINT 2 PHASE 1 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_verification()
