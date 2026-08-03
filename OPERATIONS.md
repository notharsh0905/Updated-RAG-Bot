# 🛠️ CSJMU & UIET AI Smart Student Help Desk — Operations & Maintenance Manual

This manual provides day-to-day operational procedures, monitoring guides, maintenance schedules, backup/restore workflows, and emergency troubleshooting for system administrators managing the **CSJMU & UIET Kanpur AI Smart Student Help Desk**.

---

## 📋 Table of Contents
1. [System Startup & Shutdown Procedures](#1-system-startup--shutdown-procedures)
2. [Health Monitoring & Log Inspection](#2-health-monitoring--log-inspection)
3. [Knowledge Base Management & Document Uploads](#3-knowledge-base-management--document-uploads)
4. [Vector Database Rebuilding](#4-vector-database-rebuilding)
5. [Database Backup & Restore Workflows](#5-database-backup--restore-workflows)
6. [Ollama Model Upgrades & Maintenance](#6-ollama-model-upgrades--maintenance)
7. [Disaster Recovery Procedure](#7-disaster-recovery-procedure)
8. [Preventative Maintenance Schedule](#8-preventative-maintenance-schedule)

---

## 1. System Startup & Shutdown Procedures

### System Startup

#### Option A: Systemd Services (Linux Production Deployment)
```bash
# Start backend service
sudo systemctl start csjmu-backend

# Start frontend service
sudo systemctl start csjmu-frontend

# Verify status
sudo systemctl status csjmu-backend csjmu-frontend
```

#### Option B: Manual CLI Execution (Development / Staging)
```bash
# 1. Start Ollama Engine
ollama serve &

# 2. Start FastAPI Backend (Terminal 1)
source venv/bin/activate
uvicorn app.api.api:app --host 0.0.0.0 --port 8000 &

# 3. Start Next.js Frontend (Terminal 2)
cd frontend
npm run start -- -p 3000 &
```

---

### System Shutdown

```bash
# Stop Systemd services
sudo systemctl stop csjmu-frontend csjmu-backend

# Manual process termination (if running via CLI)
pkill -f uvicorn
pkill -f "next"
```

---

### System Restart Procedure

```bash
# Restart Systemd services
sudo systemctl restart csjmu-backend csjmu-frontend
```

---

## 2. Health Monitoring & Log Inspection

### 1. HTTP Health Diagnostics Endpoint
Query the FastAPI health endpoint to verify the operational state of the backend, Ollama connection, ChromaDB collection, and SQLite database:
```bash
curl -s http://localhost:8000/health | jq
```

**Expected Healthy Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-03T14:00:00Z",
  "environment": "production",
  "backend": {
    "status": "online",
    "version": "3.0.0",
    "rag_pipeline": "initialized"
  },
  "ollama": {
    "connected": true,
    "base_url": "http://localhost:11434",
    "llm_model": "llama3.2:3b",
    "embedding_model": "nomic-embed-text"
  },
  "vector_db": {
    "type": "ChromaDB",
    "collection": "collection50",
    "document_count": 1001
  },
  "sqlite_db": {
    "status": "healthy"
  }
}
```

### 2. Log File Inspection

#### Backend Logs:
```bash
# Tail live systemd service logs
sudo journalctl -u csjmu-backend -f -n 100

# Inspect application log output (if logged to file)
tail -f logs/app.log
```

#### Frontend Logs:
```bash
sudo journalctl -u csjmu-frontend -f -n 100
```

---

## 3. Knowledge Base Management & Document Uploads

### Uploading New Institutional Documents

#### Method A: Administrative Web Portal (`/admin/knowledge`)
1. Log into the Admin Portal at `http://localhost:3000/admin/login` using your configured `ADMIN_PASSCODE`.
2. Navigate to **Knowledge Management** (`/admin/knowledge`).
3. Drag & drop or select PDF, TXT, DOCX, or JSON files.
4. Click **Upload & Process Document**. The document will be sanitized and saved under `data/raw_documents/CSJM_DOCUMENTS/`.

#### Method B: Command Line Ingestion
Place new raw files into `data/raw_documents/CSJM_DOCUMENTS/` and execute:
```bash
source venv/bin/activate
python3 app/ingestion/knowledge_ingestion_pipeline.py
```

---

## 4. Vector Database Rebuilding

When major dataset updates or schema reorganizations occur, rebuild the ChromaDB index:

#### Method A: Admin Web Portal
1. Navigate to `/admin/dashboard`.
2. Click **Trigger Vector DB Rebuild**.

#### Method B: REST API Endpoint
```bash
curl -X POST http://localhost:8000/rebuild \
  -H "Cookie: admin_session=<valid-session-cookie>"
```

#### Method C: Python CLI Rebuild
```bash
source venv/bin/activate
python3 -c "
from app.rag.rag import RAGPipeline
pipeline = RAGPipeline(force_rebuild=True)
print('Vector database successfully rebuilt!')
"
```

---

## 5. Database Backup & Restore Workflows

### SQLite Analytics Database Backup

#### 1. Automated Snapshot
```bash
mkdir -p data/backups
sqlite3 data/analytics.db ".backup 'data/backups/analytics_backup_$(date +%Y%m%d_%H%M%S).db'"
```

#### 2. Database Restore
```bash
sudo systemctl stop csjmu-backend
cp data/backups/analytics_backup_20260803_120000.db data/analytics.db
sudo systemctl start csjmu-backend
```

---

### Chroma Vector DB Snapshot & Restore

#### 1. Backup Vector DB Directory
```bash
mkdir -p data/backups
tar -czvf data/backups/chroma_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/vector_db/CHECK_DB/
```

#### 2. Restore Vector DB Directory
```bash
sudo systemctl stop csjmu-backend
rm -rf data/vector_db/CHECK_DB/
tar -xzvf data/backups/chroma_backup_20260803_120000.tar.gz -C ./
sudo systemctl start csjmu-backend
```

---

## 6. Ollama Model Upgrades & Maintenance

### Pulling Updated Weights for Existing Models
```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

### Upgrading to Higher Parameter LLMs (e.g. Llama 3.1 8B)
On servers with 16GB+ VRAM:
1. Download 8B model:
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

---

## 7. Disaster Recovery Procedure

In the event of complete server failure or operating system crash:

1. **Provision New Host Server**: Install Ubuntu 22.04 LTS, Python 3.9+, Node.js 18+/20+, and Ollama.
2. **Clone Codebase**:
   ```bash
   git clone https://github.com/csjmu/rag-assistant.git
   cd rag-assistant
   ```
3. **Restore Environment Variables**: Restore production `.env` file containing `ADMIN_PASSCODE` and `ADMIN_SESSION_SECRET`.
4. **Restore Database Backups**: Copy backed-up `analytics.db` to `data/` and extract `chroma_backup.tar.gz` to `data/vector_db/CHECK_DB/`.
5. **Start Services**: Launch backend (`uvicorn app.api.api:app`) and frontend (`npm run start`).
6. **Verify Health**: Confirm `curl http://localhost:8000/health` returns `healthy`.

---

## 8. Preventative Maintenance Schedule

| Frequency | Task | Procedure |
| :--- | :--- | :--- |
| **Daily** | Automated DB Snapshot | Run SQLite backup cron script (`sqlite3 data/analytics.db ...`). |
| **Weekly** | Log Rotation & Cleanup | Truncate application log files older than 30 days. |
| **Bi-Weekly** | Vector DB Backup | Create compressed archive of `data/vector_db/CHECK_DB/`. |
| **Monthly** | Health Check & Audit | Review negative student feedback (👎) on `/admin/feedback` and update knowledge base. |
| **Quarterly** | Security Review | Rotate `ADMIN_SESSION_SECRET` and update SSL certificates. |
