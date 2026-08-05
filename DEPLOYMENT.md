# 🚀 CSJMU & UIET AI Smart Student Help Desk — Production Deployment Guide

Comprehensive end-to-end production deployment guide, infrastructure topology, security setup, and maintenance procedures for the **CSJMU & UIET Kanpur AI Smart Student Help Desk**.

---

## 🏛️ Production Deployment Architecture

```
                                 ┌───────────────────────────────┐
                                 │     🌐 Internet / Clients      │
                                 └───────────────┬───────────────┘
                                                 │ HTTPS (Port 443)
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │     🔒 Nginx Reverse Proxy    │
                                 │    SSL / Security Headers     │
                                 └───────┬───────────────┬───────┘
                                         │               │
                      http://127.0.0.1:3000 │               │ http://127.0.0.1:8000
                                         ▼               ▼
┌───────────────────────────────────────────┐   ┌───────────────────────────────────────────┐
│           📱 Next.js 15 Frontend          │   │         ⚡ FastAPI Backend Server         │
│  React 19 • App Router • TypeScript       │   │  Python 3.9+ • Route Guards • CORS        │
└───────────────────────────────────────────┘   └─────────┬───────────────┬─────────────────┘
                                                          │               │
                                                          ▼               ▼
                                                ┌──────────────────┐ ┌─────────────────────────┐
                                                │ 🤖 Ollama Engine │ │ 🗄️ ChromaDB Vector DB  │
                                                │  llama3.2:3b /   │ │ 1001 Chunks (CHECK_DB)  │
                                                │ nomic-embed-text │ └─────────────────────────┘
                                                └──────────────────┘
```

---

## 📋 20-Step Step-by-Step Deployment Procedure

### 1. Repository Cloning
Clone the official repository to your target deployment server:
```bash
git clone https://github.com/csjmu/rag-assistant.git
cd rag-assistant
```

### 2. Branch Selection
Checkout the production-stabilized deployment branch:
```bash
git checkout main
```

### 3. Python Environment Setup
Ensure Python 3.9+ is installed:
```bash
python3 --version
```
Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Node.js & npm Setup
Verify Node.js (v18.x or v20.x LTS) and npm are available:
```bash
node -v
npm -v
```

### 5. Dependency Installation
Install backend Python requirements and frontend Node packages:
```bash
# Backend Dependencies
pip install -r requirements.txt

# Frontend Dependencies
cd frontend
npm install
cd ..
```

### 6. Local Ollama Engine Installation
Install Ollama on Linux or macOS:
```bash
# Linux installation
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve &
```

### 7. Pull Required AI Models
Download the primary LLM generator and dense text embedder:
```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

### 8. Environment Variable Configuration
Create a production `.env` file in the repository root:
```env
# Server & Environment
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000

# Security Settings
ADMIN_PASSCODE=<your-secure-admin-passcode>
ADMIN_SESSION_SECRET=<generate-a-random-32-char-secret>
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://assistant.csjmu.ac.in

# LLM Provider Selection ("openrouter" or "ollama")
LLM_PROVIDER=openrouter

# OpenRouter Configuration (NVIDIA Nemotron Nano 9B V2 Free)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=nvidia/nemotron-nano-9b-v2:free

# Ollama Services (Local Fallback Option)
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=llama3.2:3b
EMBEDDING_MODEL=nomic-embed-text

# Vector Database
COLLECTION_NAME=collection50
DEFAULT_K=7
```

Create `.env.local` inside `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 9. ChromaDB Vector Store Verification
Verify the indexed vector store exists with 1001 document chunks:
```bash
python3 -c "
from app.embeddings.vector_store import VectorStoreManager
vsm = VectorStoreManager()
print('Vector store status: HEALTHY | Document count:', vsm.get_count())
"
```

### 10. Backend Server Startup
Launch the FastAPI REST application:
```bash
uvicorn app.api.api:app --host 0.0.0.0 --port 8000
```

### 11. Frontend Development/Staging Startup
Launch Next.js in development mode on port 3001:
```bash
cd frontend
npm run dev -- -p 3001
```

### 12. Frontend Production Build & Execution
Build and launch the optimized production Next.js application on port 3000:
```bash
cd frontend
npm run build
npm run start -- -p 3000
```

### 13. Health Endpoint Verification
Query the FastAPI health endpoint to ensure all subsystems report healthy:
```bash
curl -s http://localhost:8000/health | jq
```

### 14. Mobile Responsiveness Verification
Ensure all views render without horizontal overflow across 320px, 360px, 390px, and 768px viewports. Verify that the mobile navbar uses direct horizontal scrolling without obstructing modal overlays.

### 15. Admin Login Verification
Verify authentication using your configured `ADMIN_PASSCODE`:
```bash
curl -X POST http://localhost:8000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"passcode": "<your-secure-admin-passcode>"}' \
  -i
```
Expected response: `HTTP 200 OK` with a `Set-Cookie: admin_session=...; HttpOnly; SameSite=Lax`.

### 16. Chat Endpoint Verification
Submit test queries to verify end-to-end RAG response generation:
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is hostel fee?"}'
```

### 17. System Troubleshooting
- **Issue**: Ollama Connection Failed (`HTTP 503` or connection error).  
  **Solution**: Restart Ollama service using `ollama serve` and verify `http://localhost:11434/api/tags`.
- **Issue**: Admin Login returns `401 Unauthorized`.  
  **Solution**: Confirm `ADMIN_PASSCODE` is correctly set in the root `.env` file.
- **Issue**: CORS Origin Blocked in browser.  
  **Solution**: Add the frontend origin to `CORS_ORIGINS` in `.env`.

### 18. Rollback Procedure
If a deployment step fails:
1. Stop running processes: `pkill -f uvicorn` and `pkill -f "next"`
2. Revert git commit: `git reset --hard HEAD~1`
3. Restart stable systemd or Docker services: `sudo systemctl restart csjmu-backend csjmu-frontend`

### 19. Production Pre-Flight Checklist
- [x] Admin passcode configured via backend environment variable (`ADMIN_PASSCODE=<your-secure-admin-passcode>`).
- [x] Zero `NEXT_PUBLIC_ADMIN_PASSCODE` variables present in frontend.
- [x] `HttpOnly`, `SameSite=Lax` cookies issued for authenticated sessions.
- [x] HTTP Security Headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`) active.
- [x] SQLite database permissions restricted (`chmod 600 data/analytics.db`).
- [x] Vector DB indexed with 1001 document chunks.

### 20. Systemd Production Service Files

#### `/etc/systemd/system/csjmu-backend.service`:
```ini
[Unit]
Description=CSJMU RAG FastAPI Backend
After=network.target

[Service]
User=raguser
WorkingDirectory=/home/raguser/rag-assistant
ExecStart=/home/raguser/rag-assistant/venv/bin/uvicorn app.api.api:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
EnvironmentFile=/home/raguser/rag-assistant/.env

[Install]
WantedBy=multi-user.target
```

#### `/etc/systemd/system/csjmu-frontend.service`:
```ini
[Unit]
Description=CSJMU Next.js Production Frontend
After=network.target csjmu-backend.service

[Service]
User=raguser
WorkingDirectory=/home/raguser/rag-assistant/frontend
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

---

## 🌐 Nginx Reverse Proxy & SSL Configuration

Create `/etc/nginx/sites-available/csjmu-rag`:
```nginx
server {
    listen 80;
    server_name assistant.csjmu.ac.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name assistant.csjmu.ac.in;

    ssl_certificate /etc/letsencrypt/live/assistant.csjmu.ac.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/assistant.csjmu.ac.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # HTTP Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Next.js Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # FastAPI REST Endpoints & SSE Streaming
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 600s;
    }
}
```

Enable and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/csjmu-rag /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 💾 Backup & Recovery Strategy

### 1. SQLite Analytics DB Snapshot
```bash
sqlite3 data/analytics.db ".backup 'data/backups/analytics_$(date +%Y%m%d_%H%M%S).db'"
```

### 2. Chroma Vector DB Snapshot
```bash
tar -czvf data/backups/chromadb_$(date +%Y%m%d_%H%M%S).tar.gz data/vector_db/CHECK_DB/
```

---

## 🔮 Future LLM Upgrade Path (Llama 3.2 3B -> Llama 3.1/3.2 8B)

For higher inference quality on servers equipped with 16GB+ VRAM:
1. Pull the 8B parameter model:
   ```bash
   ollama pull llama3.1:8b
   ```
2. Update `.env`:
   ```env
   LLM_MODEL=llama3.1:8b
   ```
3. Restart backend service:
   ```bash
   sudo systemctl restart csjmu-backend
   ```
