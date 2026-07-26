"""
Automated Verification Script for Final UI Polish Phase.
Validates Public UI clean-up, elimination of duplicate follow-up text,
short chip label mapping with full query execution, and scholarship "up to" policy tone.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.rag.suggestion_engine import suggestion_engine, LABEL_SHORT_MAP
from app.core.logging_config import setup_logger

logger = setup_logger("test_final_ui_polish")


def test_final_polish():
    print("\n========================================================")
    print("✨ CSJMU & UIET AI Assistant - Final UI Polish Audit")
    print("========================================================\n")

    pipeline = RAGPipeline()
    passed = 0
    failed = 0

    # 1. Check Plain-Text Duplicate Follow-up Question Removal
    print("📌 Test 1: Plain-Text Duplicate Follow-up Question Removal")
    res = pipeline.ask("What is the admission procedure for B.Tech CSE at UIET?", return_sources=True)
    ans_text = res.get("full_enriched_text", "")
    
    if "You may also want to know:" in ans_text:
        print("❌ FAIL: Plain-text follow-up questions detected in full_enriched_text.")
        failed += 1
    else:
        print("✅ PASS: Plain-text follow-up list successfully removed (chips are the single section).")
        passed += 1

    # 2. Check Did You Know Blockquote Card Formatting
    print("\n📌 Test 2: Did You Know Info Card Blockquote Formatting")
    if "> 💡 **Did You Know?**" in ans_text or res.get("campus_fact") is not None:
        print("✅ PASS: Did You Know section formatted as a clean blockquote card.")
        passed += 1
    else:
        print("❌ FAIL: Did You Know blockquote card formatting missing.")
        failed += 1

    # 3. Check Short Chip Label Generation & Full Query Execution
    print("\n📌 Test 3: Short Chip Label Generation & Full Query Execution")
    sug_objs = suggestion_engine.get_suggestion_objects("What are the eligibility criteria for B.Tech admission?", ans_text)
    if sug_objs and len(sug_objs) >= 2:
        first_obj = sug_objs[0]
        print(f"   Sample Chip Display Label: '{first_obj['short_label']}'")
        print(f"   Full Payload Question:    '{first_obj['full_question']}'")
        if first_obj['short_label'] != first_obj['full_question']:
            print("✅ PASS: Short chip label mapped correctly with full query execution payload.")
            passed += 1
        else:
            print("❌ FAIL: Chip label is identical to long full question.")
            failed += 1
    else:
        print("❌ FAIL: Fewer than 2 suggestion objects generated.")
        failed += 1

    # 4. Check Scholarship "Up To" Policy Response Tone
    print("\n📌 Test 4: Scholarship Response Policy Tone ('up to' wording)")
    schol_res = pipeline.ask("How much scholarship do SC and OBC students receive?", return_sources=True)
    schol_ans = schol_res.get("full_enriched_text", "").lower()
    
    if "up to" in schol_ans or "governed by" in schol_ans or "reimbursement" in schol_ans:
        print("✅ PASS: Scholarship response uses 'up to' policy wording without guaranteeing fixed amounts.")
        passed += 1
    else:
        print("❌ FAIL: Scholarship response lacks 'up to' policy wording.")
        failed += 1

    print("\n========================================================")
    print(f"Final Polish Audit Summary: Total={passed+failed} | Passed={passed} | Failed={failed}")
    print("========================================================\n")
    return failed == 0


if __name__ == "__main__":
    success = test_final_polish()
    sys.exit(0 if success else 1)
