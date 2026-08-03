# CSJMU & UIET AI Campus Assistant - Production Deployment Guide

**Version:** 3.0.0 (Production Hardened)  
**Architecture:** Next.js 15 App Router Frontend + FastAPI REST Backend + ChromaDB Vector Store + Ollama LLM (`llama3.2:3b`)

---

## 1. System Components & Port Assignments

1. **FastAPI Backend Server**: Runs on `http://localhost:8000` (`app/api/api.py`).
2. **Next.js Production Frontend**: Runs on `http://localhost:3000` (or `http://localhost:3001` in dev mode).
3. **Ollama LLM Engine**: Runs on `http://localhost:11434` (`llama3.2:3b` and `nomic-embed-text`).
4. **ChromaDB Vector Store**: Persistent storage at `data/vector_db/CHECK_DB` (1001 document chunks).
5. **SQLite Analytics DB**: Persistent database at `data/analytics.db`.

---

## 2. Production Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/csjmu/rag-assistant.git
cd rag-assistant

# 2. Virtual Environment & Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Install Node.js dependencies
cd frontend
npm install
cd ..

# 4. Pull Ollama models
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# 5. Environment configuration (.env in root directory)
cat << 'EOF' > .env
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000
ADMIN_PASSCODE=<your-secure-admin-passcode>
ADMIN_SESSION_SECRET=<generate-a-random-secret>
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://assistant.csjmu.ac.in
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=llama3.2:3b
EMBEDDING_MODEL=nomic-embed-text
COLLECTION_NAME=collection50
DEFAULT_K=7
EOF

# 6. Build Next.js Production App
cd frontend
npm run build
cd ..

# 7. Start FastAPI Backend Service
uvicorn app.api.api:app --host 0.0.0.0 --port 8000 &

# 8. Start Next.js Frontend Service
cd frontend
npm run start -- -p 3000 &
```

---

## 3. Verification & Diagnostics

- **Health Endpoint**: `curl -s http://localhost:8000/health | jq`
- **Admin Authentication**: `curl -X POST http://localhost:8000/api/v1/admin/login -H "Content-Type: application/json" -d '{"passcode": "<your-secure-admin-passcode>"}' -i`
- **RAG Query Execution**: `curl -X POST http://localhost:8000/query -H "Content-Type: application/json" -d '{"question": "What is hostel fee?"}'`

---

## 4. Security Enforcement Matrix

- **Zero Passcode Leakage**: `ADMIN_PASSCODE` stored exclusively in backend configuration.
- **HttpOnly Cookies**: Session tokens issued as `HttpOnly`, `SameSite=Lax` cookies with 24h expiration TTL.
- **HTTP Security Headers**: Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy`.
- **HSTS Enforcement**: Dynamically attached in production HTTPS environments (`Strict-Transport-Security`).
