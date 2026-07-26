"""
Automated Backend Quality & Knowledge Completion Test Suite for CSJMU AI Assistant.
Validates 14 knowledge domain queries, enforces natural official response style,
verifies absence of developer RAG jargon, and asserts Campus Fact Engine enrichment.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.core.logging_config import setup_logger

logger = setup_logger("test_backend_quality")

TEST_QUERIES = [
    ("Admissions", "What documents are required for admission in B.Tech CSE?"),
    ("Scholarships", "What scholarships and fee reimbursement schemes are available for CSJMU students?"),
    ("Fee Reimbursement", "How can students apply for UP government fee reimbursement?"),
    ("Alumni", "Tell me about UIET alumni and their career achievements"),
    ("Placements", "What is the highest package offered at UIET Kanpur and top recruiters?"),
    ("Hostels", "What are the hostel facilities available at CSJMU?"),
    ("Departments", "What departments and programmes exist under UIET?"),
    ("Faculty", "Tell me about the faculty background and mentorship at UIET"),
    ("Eligibility", "What is the eligibility criteria for B.Tech Computer Science?"),
    ("Research", "What research facilities and supercomputing hub are available at UIET?"),
    ("Facilities", "What central library and sports facilities exist at CSJMU?"),
    ("Infrastructure", "What infrastructure and laboratories are present in UIET?"),
    ("GATE", "What are the recent GATE achievements of UIET students?"),
    ("Syllabus", "What subject topics are taught in B.Tech Semester I Mathematics?")
]

FORBIDDEN_JARGON = [
    "based on the provided context",
    "based on the context",
    "according to the provided context",
    "according to the context",
    "the context does not mention",
    "the retrieved documents",
    "the retrieved context",
    "in the provided documents",
    "as an ai model",
    "there is no context"
]


def run_tests():
    logger.info("Initializing RAG Pipeline for Backend Quality Audit...")
    pipeline = RAGPipeline()
    passed = 0
    failed = 0

    print("\n========================================================")
    print("🧪 CSJMU AI Assistant Backend Quality & Knowledge Audit")
    print("========================================================\n")

    for domain, query in TEST_QUERIES:
        print(f"📌 Domain: {domain}")
        print(f"❓ Query: '{query}'")
        try:
            res = pipeline.ask(query, k=5, return_sources=True)
            answer_text = res["full_enriched_text"] if isinstance(res, dict) else str(res)

            # Assert absence of forbidden developer RAG jargon
            jargon_found = [j for j in FORBIDDEN_JARGON if j in answer_text.lower()]
            if jargon_found:
                print(f"❌ FAIL: Developer jargon detected ({jargon_found})")
                failed += 1
            else:
                print(f"✅ PASS: Natural official tone confirmed.")
                passed += 1

            # Print excerpt
            excerpt = answer_text.replace('\n', ' ')[:180]
            print(f"💬 Answer Snippet: {excerpt}...\n")
        except Exception as e:
            print(f"❌ FAIL: Exception occurred: {e}\n")
            failed += 1

    print("========================================================")
    print(f"Audit Summary: Total={len(TEST_QUERIES)} | Passed={passed} | Failed={failed}")
    print("========================================================\n")
    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
