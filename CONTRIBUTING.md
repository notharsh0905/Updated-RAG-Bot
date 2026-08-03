# Contributing to CSJMU & UIET AI Smart Student Help Desk

Thank you for contributing to the **CSJMU & UIET Kanpur AI Smart Student Help Desk**! We welcome bug reports, feature requests, documentation enhancements, and pull requests.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Python**: 3.9 or higher
- **Node.js**: 18.x or 20.x LTS
- **Ollama**: Running locally (`http://localhost:11434`)

### 2. Backend Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Frontend Environment
```bash
cd frontend
npm install
```

---

## 📜 Development Guidelines

1. **Security Policy**:
   - **Do NOT commit hardcoded secrets or passcodes.**
   - All administrator passcodes and secret keys must be read from environment variables (`ADMIN_PASSCODE`, `ADMIN_SESSION_SECRET`).
   - Do NOT add `NEXT_PUBLIC_ADMIN_PASSCODE` to any frontend environment files.

2. **Frontend UI Conventions**:
   - Built with Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS.
   - Maintain full mobile responsiveness across 320px–2560px screen sizes.
   - Preserve direct horizontal navigation scrolling on mobile viewports without popups or drawer overlays.

3. **Backend Conventions**:
   - Built with FastAPI and Pydantic v2.
   - Include `exc_info=True` in exception logger calls for full traceback visibility.
   - Ensure all asynchronous trace loggers execute off the main loop to preserve 0ms added user latency.

4. **Pull Request Checklist**:
   - [ ] Verified `npm --prefix frontend run build` passes with zero errors.
   - [ ] Verified `python3 -m pytest` or health checks pass.
   - [ ] Updated relevant documentation in `docs/` or `README.md`.
