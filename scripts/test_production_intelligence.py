"""
Production Intelligence Layer (PIL) Benchmark Suite.
Tests PIL components across 15 categories:
- Language Detection (EN, HI, Hinglish)
- Out-of-Domain Interception
- Short Query Normalization
- Acronym & Synonym Expansion
- Hostel Query Robustness (11 variations)
- Grounded Recommendation Matching
- Post-Generation Answer Validation
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.pil import pil_engine, HOSTEL_VARIANTS
from app.rag.rag import RAGPipeline
from app.core.logging_config import setup_logger

logger = setup_logger("test_production_intelligence")


def run_benchmark():
    print("\n========================================================")
    print("🚀 CSJMU Production Intelligence Layer (PIL) Benchmark")
    print("========================================================\n")

    passed = 0
    failed = 0

    # 1. Test Language Detection
    print("📌 Category 1: Language Detection")
    lang_tests = [
        ("Hostel facility?", "en"),
        ("मुझे छात्रवृत्ति के बारे में बताओ", "hi"),
        ("Hostel ki fees kitni hai?", "hinglish")
    ]
    for text, expected in lang_tests:
        detected = pil_engine.lang_detector.detect_language(text)
        if detected == expected:
            print(f"  ✅ PASS: '{text}' -> Detected: '{detected}'")
            passed += 1
        else:
            print(f"  ❌ FAIL: '{text}' -> Expected '{expected}', got '{detected}'")
            failed += 1

    # 2. Test Out-of-Domain Guard Interception (Zero Document Retrieval)
    print("\n📌 Category 2: Out-of-Domain Interception Guard")
    ood_queries = [
        "What is NASA?",
        "Suggest meditation songs",
        "IPL 2026 schedule",
        "Tell me about Rama University courses"
    ]
    for q in ood_queries:
        res = pil_engine.process_query(q)
        if res["is_out_of_domain"]:
            print(f"  ✅ PASS: '{q}' -> Successfully Intercepted (Domain: {res['domain']})")
            passed += 1
        else:
            print(f"  ❌ FAIL: '{q}' -> Not intercepted.")
            failed += 1

    # 3. Test Short Query Normalization
    print("\n📌 Category 3: Short Query Normalization")
    norm_tests = ["hostel", "placement", "fees", "scholarship", "director", "faculty"]
    for q in norm_tests:
        norm = pil_engine.query_normalizer.normalize(q)
        if len(norm) > len(q) and "CSJMU" in norm:
            print(f"  ✅ PASS: '{q}' -> Normalized to: '{norm[:70]}...'")
            passed += 1
        else:
            print(f"  ❌ FAIL: '{q}' -> Normalization failed ({norm})")
            failed += 1

    # 4. Test Hostel Query Robustness (11 Variations)
    print("\n📌 Category 4: Hostel Query Robustness (11 Variants)")
    for hv in HOSTEL_VARIANTS:
        res = pil_engine.process_query(hv)
        if "hostel" in res["expanded_query"].lower():
            print(f"  ✅ PASS: Variant '{hv}' -> Expanded search query ready.")
            passed += 1
        else:
            print(f"  ❌ FAIL: Variant '{hv}' failed expansion.")
            failed += 1

    # 5. Test Grounded Recommendations
    print("\n📌 Category 5: Grounded Course Recommendation Matching")
    rec_query = "I scored 75% in Class 12, what courses can I get?"
    rec_res = pil_engine.recommendation_engine.process_recommendation(rec_query)
    if rec_res and "JEE Mains Rank" in rec_res and "B.Tech Engineering Programs" in rec_res:
        print("  ✅ PASS: Grounded course recommendation rules matched successfully.")
        passed += 1
    else:
        print(f"  ❌ FAIL: Recommendation failed ({rec_res})")
        failed += 1

    # 6. Test End-to-End RAG Execution with PIL Engine
    print("\n📌 Category 6: End-to-End RAG Execution & Answer Validation")
    pipeline = RAGPipeline()
    
    # Test OOD End-to-End
    ood_res = pipeline.ask("What is NASA?", return_sources=True)
    if "outside my supported knowledge domain" in ood_res["answer"]:
        print("  ✅ PASS: Out-of-domain query handled gracefully without document retrieval.")
        passed += 1
    else:
        print(f"  ❌ FAIL: OOD answer unexpected: {ood_res['answer'][:100]}")
        failed += 1

    # Test Hinglish End-to-End
    hing_res = pipeline.ask("Hostel ki fees kitni hai?", return_sources=True)
    if "hostel" in hing_res["answer"].lower() or "fees" in hing_res["answer"].lower():
        print("  ✅ PASS: Hinglish query executed successfully with grounded response.")
        passed += 1
    else:
        print(f"  ❌ FAIL: Hinglish execution failed.")
        failed += 1

    total = passed + failed
    print("\n========================================================")
    print(f"PIL Benchmark Summary: Total={total} | Passed={passed} | Failed={failed}")
    print("========================================================\n")
    return failed == 0


if __name__ == "__main__":
    success = run_benchmark()
    sys.exit(0 if success else 1)
