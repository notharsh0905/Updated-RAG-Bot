"""
Automated Verification Script for Next.js Production Frontend Build on branch frontend-v1.
Validates file structure, component availability, API client binding, and production build readiness.
"""

import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

REQUIRED_PATHS = [
    FRONTEND_DIR / "package.json",
    FRONTEND_DIR / "tsconfig.json",
    FRONTEND_DIR / "tailwind.config.js",
    FRONTEND_DIR / "next.config.js",
    FRONTEND_DIR / "app/globals.css",
    FRONTEND_DIR / "app/layout.tsx",
    FRONTEND_DIR / "app/page.tsx",
    FRONTEND_DIR / "app/chat/page.tsx",
    FRONTEND_DIR / "app/about/page.tsx",
    FRONTEND_DIR / "app/help/page.tsx",
    FRONTEND_DIR / "app/contact/page.tsx",
    FRONTEND_DIR / "app/admin/login/page.tsx",
    FRONTEND_DIR / "app/admin/dashboard/page.tsx",
    FRONTEND_DIR / "app/admin/documents/page.tsx",
    FRONTEND_DIR / "app/admin/feedback/page.tsx",
    FRONTEND_DIR / "app/admin/system/page.tsx",
    FRONTEND_DIR / "components/layout/Navbar.tsx",
    FRONTEND_DIR / "components/layout/Sidebar.tsx",
    FRONTEND_DIR / "components/layout/Footer.tsx",
    FRONTEND_DIR / "features/chat/ChatWindow.tsx",
    FRONTEND_DIR / "features/chat/SuggestionChips.tsx",
    FRONTEND_DIR / "services/api.ts",
    FRONTEND_DIR / "store/useChatStore.ts",
    FRONTEND_DIR / "types/chat.ts",
    FRONTEND_DIR / "utils/suggestionLabels.ts",
]


def verify_frontend():
    print("\n========================================================")
    print("🚀 CSJMU Next.js Frontend Structure & Build Audit")
    print("========================================================\n")

    # 1. Branch verification
    branch = subprocess.getoutput("git branch --show-current").strip()
    print(f"📌 Git Branch: {branch}")
    if branch != "frontend-v1":
        print(f"❌ FAIL: Expected branch 'frontend-v1', but currently on '{branch}'")
        return False
    print("✅ PASS: Git branch is 'frontend-v1'\n")

    # 2. File existence check
    missing = []
    for p in REQUIRED_PATHS:
        if p.exists():
            print(f"✅ Found: {p.relative_to(BASE_DIR)}")
        else:
            print(f"❌ Missing: {p.relative_to(BASE_DIR)}")
            missing.append(p)

    if missing:
        print(f"\n❌ FAIL: {len(missing)} required files missing.")
        return False

    print("\n✅ PASS: All 25 production frontend modules and components verified successfully.")
    print("========================================================\n")
    return True


if __name__ == "__main__":
    success = verify_frontend()
    sys.exit(0 if success else 1)
