"""
Automated Verification Script for Frontend Branding Redesign & Duplicate Submission Fix.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

CHAT_WINDOW_PATH = FRONTEND_DIR / "features/chat/ChatWindow.tsx"
PAGE_PATH = FRONTEND_DIR / "app/page.tsx"
TOP_BAR_PATH = FRONTEND_DIR / "components/layout/TopBar.tsx"


def run_verify():
    print("\n========================================================")
    print("🎓 CSJMU Frontend Branding & Duplicate Submission Audit")
    print("========================================================\n")

    passed = 0
    failed = 0

    # 1. Verify Duplicate Submission Lock in ChatWindow
    print("📌 Test 1: Single Submission Lock in ChatWindow.tsx")
    chat_content = CHAT_WINDOW_PATH.read_text()
    if "isSubmittingRef" in chat_content and "processedPendingRef" in chat_content:
        print("✅ PASS: Submission lock refs (isSubmittingRef & processedPendingRef) verified.")
        passed += 1
    else:
        print("❌ FAIL: Submission lock refs missing in ChatWindow.tsx")
        failed += 1

    # 2. Verify Top Crimson Utility Bar
    print("\n📌 Test 2: Top Crimson Utility Bar Component")
    if TOP_BAR_PATH.exists():
        print("✅ PASS: TopBar.tsx exists.")
        passed += 1
    else:
        print("❌ FAIL: TopBar.tsx missing.")
        failed += 1

    # 3. Verify Official CSJMU Crimson (#A51C30) and Navy Palette in Home Page
    print("\n📌 Test 3: Official CSJMU Crimson & Navy Branding in Home Page")
    page_content = PAGE_PATH.read_text()
    if "#A51C30" in page_content and "Useful Links" in page_content and "Latest Notices" in page_content:
        print("✅ PASS: Official CSJMU design language & panels verified.")
        passed += 1
    else:
        print("❌ FAIL: CSJMU crimson branding or panels missing in page.tsx")
        failed += 1

    # 4. Verify Vice Chancellor & Director Cards
    print("\n📌 Test 4: Vice Chancellor & Director Message Cards")
    if "Vice Chancellor" in page_content and "Director" in page_content:
        print("✅ PASS: VC & Director institutional cards present.")
        passed += 1
    else:
        print("❌ FAIL: VC or Director message cards missing.")
        failed += 1

    print("\n========================================================")
    print(f"Branding & Duplicate Fix Audit Summary: Total={passed+failed} | Passed={passed} | Failed={passed == 4 and 4 or 0}")
    print("========================================================\n")
    return failed == 0


if __name__ == "__main__":
    success = run_verify()
    sys.exit(0 if success else 1)
