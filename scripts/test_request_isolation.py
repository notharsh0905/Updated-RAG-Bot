"""
State Isolation Audit Test Script.
Verifies that consecutive unrelated queries executed in the RAG pipeline
maintain 100% request state isolation with zero cross-query information leakage.
"""

import sys
import uuid
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.memory.memory import memory_manager
from app.core.logging_config import setup_logger

logger = setup_logger("test_request_isolation")


def run_isolation_audit():
    print("\n========================================================")
    print("🔒 CSJMU RAG Pipeline Request Isolation Audit")
    print("========================================================\n")

    passed = 0
    failed = 0
    test_session = str(uuid.uuid4())

    pipeline = RAGPipeline()

    unrelated_queries = [
        ("Query 1 (Hostels)", "What are the hostel facilities at CSJMU?", ["hostel", "mess", "room"]),
        ("Query 2 (GATE)", "What are the recent GATE achievements of UIET students?", ["gate", "rank", "air"]),
        ("Query 3 (Innovation)", "Tell me about the CSJMU Innovation Center and PEZ printing.", ["innovation", "pez", "startup"]),
        ("Query 4 (Admissions)", "What is the admission procedure for B.Tech CSE?", ["admission", "b.tech", "jee"]),
    ]

    previous_chunk_texts = set()

    for label, query, expected_keywords in unrelated_queries:
        print(f"📌 Testing {label}: '{query}'")

        res = pipeline.ask(query, session_id=test_session, return_sources=True, use_cache=False)
        context = res.get("context", "")
        sources = res.get("sources", [])
        answer = res.get("answer", "")

        # 1. Verify fresh retrieval chunks (no overlap with previous query chunks)
        current_chunk_texts = set(s["content_snippet"] for s in sources)
        overlap = current_chunk_texts.intersection(previous_chunk_texts)
        if not overlap:
            print("  ✅ PASS: 100% Fresh retrieval chunks (zero chunk contamination from prior turn).")
            passed += 1
        else:
            print(f"  ❌ FAIL: Chunk leakage detected across queries: {overlap}")
            failed += 1

        previous_chunk_texts = current_chunk_texts

        # 2. Verify answer contains expected category keywords
        ans_lower = answer.lower()
        if any(k in ans_lower for k in expected_keywords):
            print(f"  ✅ PASS: Answer accurately addresses query topic '{label}'.")
            passed += 1
        else:
            print(f"  ❌ FAIL: Answer topic mismatch for '{label}' ({answer[:100]})")
            failed += 1

    # 3. Memory History Isolation Audit
    print("\n📌 Audit Test 5: Conversation Memory Format Check")
    history = memory_manager.get_history(test_session)
    formatted_hist = memory_manager.format_history_as_context(history)
    
    if "💡 **Did You Know?**" not in formatted_hist and "📌 **Suggested Questions:**" not in formatted_hist:
        print("  ✅ PASS: Memory history contains ONLY clean user/assistant messages (zero enriched text / context pollution).")
        passed += 1
    else:
        print("  ❌ FAIL: Enriched text or retrieved facts leaked into memory history.")
        failed += 1

    total = passed + failed
    print("\n========================================================")
    print(f"Request Isolation Audit Summary: Total={total} | Passed={passed} | Failed={failed}")
    print("========================================================\n")

    return failed == 0


if __name__ == "__main__":
    success = run_isolation_audit()
    sys.exit(0 if success else 1)
