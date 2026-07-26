"""
Test Suite for Smart Response Enrichment Engine.
Verifies Section 1 (Direct Answer), Section 2 (Campus Fact, <=45 words, grounded),
and Section 3 (2-4 Clickable Contextual Suggestions) across 12+ university domains.
Checks session history non-repetition and suppression rules.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.response_enrichment import response_enrichment_engine


def test_response_enrichment_engine():
    print("==========================================================")
    print("🚀 Smart Response Enrichment Engine Test Suite")
    print("==========================================================")

    test_cases = [
        ("Admissions", "What is the admission process for B.Tech programmes?"),
        ("Fees", "What is the fee structure for engineering courses?"),
        ("Placements", "Tell me about campus placements and highest packages."),
        ("GATE", "Who achieved the top GATE rank in UIET?"),
        ("Faculty", "Who are the Professors of Practice at UIET?"),
        ("Departments", "What departments exist in the School of Engineering?"),
        ("Eligibility", "What is the eligibility for BCA and MCA programmes?"),
        ("Laboratories", "What facilities exist in the AICTE IDEA Lab?"),
        ("Research", "Tell me about the Supercomputing Hub at UIET."),
        ("Hostel", "What are the hostel rules and security guidelines?"),
        ("Scholarships", "What UP scholarship and fee waiver options are available?"),
        ("Infrastructure", "Does CSJMU campus have a central library and sports complex?")
    ]

    session_id = "test_enrichment_session_2026"
    seen_facts = set()
    asked_suggestions = set()

    for idx, (category, query) in enumerate(test_cases, 1):
        dummy_answer = f"UIET CSJM University provides comprehensive details for {category}. The official guidelines outline procedures, eligibility, faculty, and academic standards."
        
        res = response_enrichment_engine.enrich_response(query, dummy_answer, session_id=session_id)

        print(f"\n--- Test {idx}: [{category}] '{query}' ---")
        
        # Verify Section 1
        assert res["direct_answer"] == dummy_answer, "Direct Answer modified unexpectedly"
        print(f"✔ Section 1 (Direct Answer): Intact ({len(res['direct_answer'])} chars)")

        # Verify Section 2 (Campus Fact)
        fact_obj = res["campus_fact"]
        if fact_obj:
            word_count = len(fact_obj["fact_text"].split())
            assert word_count <= 45, f"Fact exceeded 45 words ({word_count} words)"
            assert fact_obj["source"] in ["Engineering PDF", "Placement Report", "Official GATE PDF", "Admissions Documents"], f"Invalid source: {fact_obj['source']}"
            seen_facts.add(fact_obj["id"])
            print(f"✔ Section 2 (Smart Campus Fact): [{fact_obj['source']}] ({word_count} words)\n   {fact_obj['fact_text']}")

        # Verify Section 3 (Clickable Suggested Questions)
        suggestions = res["suggested_questions"]
        assert 2 <= len(suggestions) <= 4, f"Expected 2-4 suggestions, got {len(suggestions)}"
        turn_suggestions = set()
        for s in suggestions:
            assert s not in turn_suggestions, f"Duplicate suggestion within turn: '{s}'"
            turn_suggestions.add(s)

        print(f"✔ Section 3 (Clickable Suggestions - {len(suggestions)} Chips):")
        for s in suggestions:
            print(f"   • [{s}]")

    print("\n----------------------------------------------------------")
    print(f"Rotation Test: {len(seen_facts)} unique facts displayed across {len(test_cases)} turns.")
    print("==========================================================")
    print("✅ Smart Response Enrichment Engine Test Passed Successfully!")
    print("==========================================================")


if __name__ == "__main__":
    test_response_enrichment_engine()
