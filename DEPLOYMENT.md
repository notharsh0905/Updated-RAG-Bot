# 🚀 CSJMU RAG System — Production Deployment Guide

This document provides step-by-step instructions for deploying the **CSJMU & UIET Kanpur AI Assistant** in production.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Environment Configuration](#-environment-configuration)
3. [Deployment Options](#-deployment-options)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
   - [Option B: Bare Metal / Linux Systemd](#option-b-bare-metal--linux-systemd)
4. [Nginx Reverse Proxy & SSL Setup](#-nginx-reverse-proxy--ssl-setup)
5. [Automated Evaluation & Health Monitoring](#-automated-evaluation--health-monitoring)
6. [Troubleshooting & Maintenance](#-troubleshooting--maintenance)

---

## ⚙️ Prerequisites

- **OS:** Ubuntu 22.04 LTS / Debian 11 / macOS / RHEL 9
- **RAM:** Minimum 8GB (16GB recommended for Ollama LLM inference)
- **CPU:** 4+ Cores (or NVIDIA GPU with CUDA drivers)
- **Disk:** 20GB free storage
- **Dependencies:** Docker 24+, Docker Compose v2+, Python 3.10+

---

## 🔑 Environment Configuration

Create a `.env` file in the root directory:

```ini
# Project Environment Settings
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
LLM_MODEL=llama3.2:3b
COLLECTION_NAME=collection50
DEFAULT_K=5

# API & Web Server
API_HOST=0.0.0.0
API_PORT=8000
STREAMLIT_PORT=8501
```

---

## 🐳 Option A: Docker Compose Deployment (Recommended)

### 1. Build and Launch Containers

```bash
# Clone repository
git clone https://github.com/csjmu/rag-assistant.git
cd rag-assistant

# Start containers in detached mode
docker-compose up --build -d
```

### 2. Verify Container Health

```bash
docker-compose ps
```

Check logs:
```bash
docker-compose logs -f backend
```

---

## 🖥️ Option B: Bare Metal / Systemd Service

### 1. Create System User and Virtual Environment

```bash
sudo useradd -m -s /bin/bash raguser
sudo su - raguser

cd ~
git clone https://github.com/csjmu/rag-assistant.git
cd rag-assistant

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Systemd Services

#### FastAPI Backend Service (`/etc/systemd/system/csjmu-api.service`):

```ini
[Unit]
Description=CSJMU RAG FastAPI Service
After=network.target

[Service]
User=raguser
WorkingDirectory=/home/raguser/rag-assistant
ExecStart=/home/raguser/rag-assistant/venv/bin/uvicorn api.api:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Streamlit Frontend Service (`/etc/systemd/system/csjmu-ui.service`):

```ini
[Unit]
Description=CSJMU RAG Streamlit Web UI
After=network.target csjmu-api.service

[Service]
User=raguser
WorkingDirectory=/home/raguser/rag-assistant
ExecStart=/home/raguser/rag-assistant/venv/bin/streamlit run frontend/streamlit_app.py --server.port=8501 --server.address=0.0.0.0
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Start Services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now csjmu-api csjmu-ui
```

---

## 🌐 Nginx Reverse Proxy & SSL Setup

### 1. Install Nginx and Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx Site Block (`/etc/nginx/sites-available/csjmu-rag`)

```nginx
server {
    server_name assistant.csjmu.ac.in;

    # Streamlit Web UI
    location / {
        proxy_pass http://127.0.0.1:8501;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # FastAPI REST API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. Enable SSL Certificate

```bash
sudo ln -s /etc/nginx/sites-available/csjmu-rag /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d assistant.csjmu.ac.in
```

---

## 📊 Automated Evaluation & Health Monitoring

### Run Batch QA Evaluation Report:

```bash
python3 evaluate.py
```
Open `eval_report.html` in your browser to inspect evaluation accuracy and flagged questions.

### Check API Health Endpoint:

```bash
curl -s http://localhost:8000/health | jq
```

---

## 🛠️ Troubleshooting & Maintenance

| Symptom | Cause | Solution |
|---|---|---|
| `Ollama Connection Failed` | Ollama service not running | Run `ollama serve` or check `systemctl status ollama` |
| `HTTP 503 Pipeline Not Initialized` | Chroma DB loading issue | Run `python3 -m src.rag` or check logs |
| Slow Response Latency | CPU bottleneck | Ensure Ollama has GPU access or increase worker threads |

---

## 🛡️ Production Security Hardening

This deployment incorporates enterprise-grade security controls tailored for institutional and campus web applications:

### 1. HTTP Security Headers
Every HTTP response from both the Next.js frontend and FastAPI backend contains mandatory security headers:

- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing attacks.
- `X-Frame-Options: DENY` — Protects against clickjacking by preventing iframe embedding.
- `Referrer-Policy: strict-origin-when-cross-origin` — Restricts sensitive referrer leakage across origins.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()` — Disables unneeded browser capabilities.
- `Content-Security-Policy`:
  ```
  default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:* http://127.0.0.1:* http://10.63.135.235:8000 ws://localhost:* ws://127.0.0.1:*; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
  ```

### 2. Cookie Security Policy
Administrative sessions are issued exclusively as server-side cookies:
- **`HttpOnly`**: Prevents client-side JavaScript (`document.cookie`) from accessing session tokens, mitigating XSS risks.
- **`SameSite=Lax`**: Protects against Cross-Site Request Forgery (CSRF).
- **`Path=/`**: Restricted cookie scope.
- **`Secure`**: Automatically enforced in HTTPS / production environments.

### 3. Backend Authentication & Session Architecture
- **Zero Frontend Passcode Storage**: Administrator credentials (`ADMIN_PASSCODE`) are owned exclusively by backend environment variables and `app/core/config.py`.
- **HMAC Session Signing**: Session tokens (`admin:<timestamp>:<signature>`) are signed with HMAC-SHA256 using `ADMIN_SESSION_SECRET` with a 24-hour expiration TTL.
- **Backend Route Guards**: Every administrative endpoint (`/admin/*`, `/rebuild`) requires a valid session token via the `require_admin_auth` dependency.

### 4. HTTPS & HSTS Requirements
In production deployments (`ENVIRONMENT=production` with HTTPS active):
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS) is dynamically attached to enforce HTTPS connections across all subdomains.
- CSP appends `upgrade-insecure-requests;`.

