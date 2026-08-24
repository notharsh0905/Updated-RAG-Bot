# 🚀 CSJMU & UIET AI Smart Student Help Desk — Production Deployment Guide

Comprehensive end-to-end production deployment guide, infrastructure topology, security setup, and maintenance procedures for the **CSJMU & UIET Kanpur AI Smart Student Help Desk**.

---

## 🏛️ Production Deployment Architecture

```
                                 ┌───────────────────────────────┐
                                 │     🌐 Internet / Clients      │
                                 └───────────────┬───────────────┘
                                                 │ HTTPS (Port 443) / HTTP (Port 80)
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
│  React 19 • App Router • TypeScript       │   │  Python 3.10 • Route Guards • CORS        │
└───────────────────────────────────────────┘   └─────────┬───────────────┬─────────────────┘
                                                          │               │
                                   http://172.20.8.10:31435│               │ Local Storage
                                                          ▼               ▼
                                                ┌──────────────────┐ ┌─────────────────────────┐
                                                │  🤖 DGX Ollama   │ │ 🗄️ ChromaDB Vector DB  │
                                                │   llama3.1:8b    │ │  1001 Chunks (CHECK_DB) │
                                                │ nomic-embed-text │ └─────────────────────────┘
                                                └──────────────────┘
```

---

## 📋 Step-by-Step Production Deployment Procedure

### 1. Repository Cloning
Clone the official repository to your target deployment server:
```bash
git clone https://github.com/csjmu/rag-assistant.git
cd rag-assistant
```

### 2. Python Environment Setup
Ensure Python 3.10+ is installed:
```bash
python3 --version
```
Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Node.js & npm Setup
Verify Node.js (v18.x or v20.x LTS) and npm are available:
```bash
node -v
npm -v
```

### 4. Dependency Installation
Install backend Python requirements and frontend Node packages:
```bash
# Backend Dependencies
pip install -r requirements.txt

# Frontend Dependencies
cd frontend
npm install
cd ..
```

### 5. Environment Variable Configuration
Create a production `.env` file in the repository root:
```env
# Server & Environment
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000

# Security Settings
ADMIN_PASSCODE=CSJMU_UIET_2026
ADMIN_SESSION_SECRET=<generate-a-random-32-char-secret>
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://assistant.csjmu.ac.in

# Remote DGX Ollama Cluster Configuration
LLM_PROVIDER=ollama
EMBEDDING_PROVIDER=ollama
OLLAMA_BASE_URL=http://172.20.8.10:31435
OLLAMA_LLM_MODEL=llama3.1:8b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest
LLM_MODEL=llama3.1:8b
EMBEDDING_MODEL=nomic-embed-text:latest

# Vector Database
COLLECTION_NAME=collection50
DEFAULT_K=7
```

Create `.env.local` inside `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 6. ChromaDB Vector Store Verification
Verify the indexed vector store exists with 1001 document chunks:
```bash
python3 -c "
from app.embeddings.vector_store import VectorStoreManager
vsm = VectorStoreManager()
print('Vector store status: HEALTHY | Document count:', vsm.get_count())
"
```

### 7. Launch Option A: Docker Compose Deployment (Recommended)
Build and run both the Next.js frontend (Port 3000) and FastAPI backend (Port 8000) using Docker Compose:
```bash
docker compose up --build -d
```

Verify running containers:
```bash
docker compose ps
```

### 8. Launch Option B: Systemd Native Production Services

#### Backend Service (`/etc/systemd/system/csjmu-backend.service`):
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

#### Frontend Service (`/etc/systemd/system/csjmu-frontend.service`):
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

Enable and start services:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now csjmu-backend csjmu-frontend
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

    # Next.js 15 Production Frontend
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

    # FastAPI REST Endpoints (/api/ prefix)
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

    # FastAPI Direct Query & Streaming Endpoints
    location ~ ^/(query|feedback|health|rebuild|admin)/ {
        proxy_pass http://127.0.0.1:8000;
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
sudo ln -sf /etc/nginx/sites-available/csjmu-rag /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🧪 Post-Deployment Health Verification

Query the health diagnostic endpoint:
```bash
curl -s http://localhost:8000/health | jq
```

Test Next.js frontend response:
```bash
curl -I http://localhost:3000
```
