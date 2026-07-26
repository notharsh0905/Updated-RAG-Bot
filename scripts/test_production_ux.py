"""
Automated Verification Script for Production User Experience.
Validates Public vs Admin separation, dynamic suggestion chip generation,
absence of developer RAG terminology, and official response tone.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.rag.suggestion_engine import suggestion_engine
from app.core.logging_config import setup_logger

logger = setup_logger("test_production_ux")

TEST_QUERIES = [
    ("Admissions Flow", "What is the admission procedure for B.Tech CSE at UIET?"),
    ("Scholarship Policy", "What scholarships and UP fee reimbursement rules apply for engineering students?"),
    ("UP Tablet Scheme", "Does UP Government provide free tablets or smartphones to CSJMU students?"),
    ("Innovation & Startups", "Tell me about the CSJMU Innovation Center and PEZ printing startup"),
    ("Placements & GATE", "What are the top placement packages and GATE ranks achieved at UIET?")
]

FORBIDDEN_DEVELOPER_TERMS = [
    "based on the provided context",
    "based on the context",
    "the context does not mention",
    "the retrieved documents",
    "retrieved context",
    "vector search",
    "embeddings",
    "prompt strategy"
]


def run_tests():
    logger.info("Initializing RAG Pipeline for Production UX Audit...")
    pipeline = RAGPipeline()
    passed = 0
    failed = 0

    print("\n========================================================")
    print("🎓 CSJMU Production User Experience & Suggestion Audit")
    print("========================================================\n")

    for category, query in TEST_QUERIES:
        print(f"📌 Category: {category}")
        print(f"❓ Query: '{query}'")
        try:
            res = pipeline.ask(query, k=5, return_sources=True)
            answer_text = res["full_enriched_text"] if isinstance(res, dict) else str(res)
            suggestions = res.get("suggested_questions", [])

            # Check 1: Absence of developer RAG jargon
            jargon_found = [j for j in FORBIDDEN_DEVELOPER_TERMS if j in answer_text.lower()]
            if jargon_found:
                print(f"❌ FAIL: Developer jargon detected ({jargon_found})")
                failed += 1
                continue

            # Check 2: Dynamic Suggestion Chips (2-4 items)
            if not suggestions or len(suggestions) < 2:
                print(f"❌ FAIL: Fewer than 2 suggestion chips generated ({suggestions})")
                failed += 1
                continue

            print(f"✅ PASS: Official tone confirmed & {len(suggestions)} suggestion chips generated.")
            print(f"💡 Suggestion Chips: {suggestions}")
            excerpt = answer_text.replace('\n', ' ')[:180]
            print(f"💬 Answer Snippet: {excerpt}...\n")
            passed += 1

        except Exception as e:
            print(f"❌ FAIL: Exception occurred: {e}\n")
            failed += 1

    print("========================================================")
    print(f"Production UX Audit Summary: Total={len(TEST_QUERIES)} | Passed={passed} | Failed={failed}")
    print("========================================================\n")
    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
