"""
Automated Verification Script for Scholarship Knowledge & Institutional Expansion.
Validates non-fixed scholarship wording, required document checklist, UP Free Tablet Scheme,
Innovation Center, and PEZ Smart Printing Startup queries.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.core.logging_config import setup_logger

logger = setup_logger("test_scholarship_knowledge")

TEST_CASES = [
    {
        "topic": "Scholarship Guidance (SC/ST)",
        "query": "How much scholarship do SC students receive?",
        "expected_keywords": ["sc", "st"],
        "non_fixed_check": True
    },
    {
        "topic": "Scholarship Guidance (OBC/Gen)",
        "query": "How much scholarship do OBC students receive?",
        "expected_keywords": ["obc"],
        "non_fixed_check": True
    },
    {
        "topic": "Required Scholarship Documents",
        "query": "What documents are required for scholarship and fee reimbursement?",
        "expected_keywords": ["documents", "passbook", "shapath patra", "income certificate", "domicile"]
    },
    {
        "topic": "UP Free Tablet Scheme",
        "query": "Does CSJMU provide free tablets or smartphones under UP Government scheme?",
        "expected_keywords": ["tablet", "smartphone"]
    },
    {
        "topic": "Innovation Center",
        "query": "What facilities and mentorship are available at CSJMU Innovation Center?",
        "expected_keywords": ["innovation", "mentorship"]
    },
    {
        "topic": "PEZ Printing Startup",
        "query": "What is PEZ smart campus printing service and how does it work?",
        "expected_keywords": ["pez", "print", "qr"]
    }
]


def run_tests():
    logger.info("Initializing RAG Pipeline for Scholarship & Institutional Expansion Audit...")
    pipeline = RAGPipeline()
    passed = 0
    failed = 0

    print("\n========================================================")
    print("🎓 CSJMU Scholarship & Institutional Expansion Audit")
    print("========================================================\n")

    for test in TEST_CASES:
        print(f"📌 Topic: {test['topic']}")
        print(f"❓ Query: '{test['query']}'")
        try:
            res = pipeline.ask(test['query'], k=7, return_sources=True)
            answer_text = res["full_enriched_text"] if isinstance(res, dict) else str(res)
            lower_ans = answer_text.lower()

            missing = [kw for kw in test['expected_keywords'] if kw.lower() not in lower_ans]
            if missing:
                print(f"❌ FAIL: Missing expected keywords ({missing})")
                failed += 1
            else:
                if test.get("non_fixed_check"):
                    # Verify non-fixed qualifiers exist in response
                    qualifiers = ["around", "approx", "varies", "subject", "guideline", "notification", "rule"]
                    has_qualifier = any(q in lower_ans for q in qualifiers)
                    if has_qualifier:
                        print(f"✅ PASS: Grounded non-fixed scholarship wording verified.")
                        passed += 1
                    else:
                        print(f"⚠️ WARN: Fixed value presented without non-fixed qualifier wording.")
                        failed += 1
                else:
                    print(f"✅ PASS: Grounded facts verified.")
                    passed += 1

            excerpt = answer_text.replace('\n', ' ')[:220]
            print(f"💬 Answer Snippet: {excerpt}...\n")
        except Exception as e:
            print(f"❌ FAIL: Exception occurred: {e}\n")
            failed += 1

    print("========================================================")
    print(f"Scholarship Audit Summary: Total={len(TEST_CASES)} | Passed={passed} | Failed={failed}")
    print("========================================================\n")
    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
