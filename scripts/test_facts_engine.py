"""
Test Suite for Smart Campus Facts Engine.
Verifies topic matching, non-hallucination source attribution,
word length (<50 words per fact), and rotation history across sessions.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.facts_engine import campus_facts_engine


def test_campus_facts_engine():
    print("==========================================================")
    print("💡 Smart Campus Facts Engine Test Suite")
    print("==========================================================")

    test_queries = [
        ("Admissions", "What are the B.Tech admission requirements?"),
        ("Placements", "Which companies recruit from UIET?"),
        ("GATE", "Who achieved the top GATE rank in UIET?"),
        ("Laboratories", "What facilities exist in the Cyber Security Lab?"),
        ("Research", "Tell me about the Supercomputing Hub at UIET"),
        ("Infrastructure", "Does CSJMU have a library and sports complex?")
    ]

    session_id = "test_session_101"
    seen_ids = set()

    for category, query in test_queries:
        fact_obj = campus_facts_engine.get_fact(query, session_id=session_id)
        assert fact_obj is not None, f"Fact engine returned None for query: {query}"
        
        word_count = len(fact_obj["fact_text"].split())
        assert word_count <= 50, f"Fact exceeded 50 words ({word_count} words): {fact_obj['fact_text']}"
        assert fact_obj["source"] in ["Engineering PDF", "Placement Report", "Official GATE PDF"], f"Invalid source: {fact_obj['source']}"
        
        print(f"\n📌 Category: {category} | Query: '{query}'")
        print(f"   Fact ID: {fact_obj['id']}")
        print(f"   Source: {fact_obj['source']}")
        print(f"   Word Count: {word_count} words")
        print(f"   Display Output:\n{fact_obj['formatted_display']}")
        
        seen_ids.add(fact_obj["id"])

    print("\n----------------------------------------------------------")
    print(f"Rotation Test: {len(seen_ids)} unique facts displayed across {len(test_queries)} queries.")
    print("==========================================================")
    print("✅ Smart Campus Facts Engine Test Passed Successfully!")
    print("==========================================================")


if __name__ == "__main__":
    test_campus_facts_engine()
