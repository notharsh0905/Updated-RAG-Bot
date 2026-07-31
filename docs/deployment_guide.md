# CSJMU RAG AI Campus Assistant - Production Deployment Guide

**Branch:** `feature-admin-v3`  
**Version:** 2.0.0 (Production Hardened)

---

## 1. Executive Deployment Overview

The CSJMU AI Campus Assistant system is an enterprise Retrieval-Augmented Generation (RAG) platform composed of:
1. **FastAPI Backend Services** (`app/api/api.py`)
2. **Next.js App Router Admin Console** (`frontend/`)
3. **ChromaDB Vector Storage** (`data/vector_db/`)
4. **Ollama LLM Engine** (`llama3.2:3b` & `nomic-embed-text`)
5. **SQLite AI Operations Database** (`data/analytics.db`)

---

## 2. Environment Variables Reference (`.env`)

Create `.env` in the root directory:

```env
# General & Environment
ENVIRONMENT=production
BASE_DIR=/Users/harshupadhyay/Downloads/compressed_folder (2)

# Web Server & Network Config
API_HOST=0.0.0.0
API_PORT=8000
STREAMLIT_PORT=8501
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000

# Ollama LLM Services
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
LLM_MODEL=llama3.2:3b

# Security & Upload Constraints
MAX_FILE_SIZE_BYTES=52428800
RATE_LIMIT_PER_MINUTE=120

# Vector DB Settings
COLLECTION_NAME=collection50
DEFAULT_K=5
```

---

## 3. Production Deployment Hardening Checklist

- [x] **Dynamic CORS Origin Verification**: Explicit allowed origins configured in `.env`.
- [x] **Path Traversal Shielding**: Filenames sanitized with `DocumentProcessor.sanitize_filename` prior to storage under `data/uploads/`.
- [x] **Structured Health Check Endpoint**: `GET /health` returns comprehensive JSON diagnostic payload (Ollama, ChromaDB, SQLite, Disk/RAM).
- [x] **Global Exception Masking**: Unhandled server exceptions return sanitized JSON payloads (`500 Internal Server Error`) to avoid leaking stack traces.
- [x] **Async Non-Blocking Trace Logging**: Database operations run off-thread via `ThreadPoolExecutor` ensuring **0ms added latency** to student responses.
- [x] **Next.js Production Build**: Clean static page generation with 0 TypeScript or linting errors.

---

## 4. Subsystem Health Diagnostics & Monitoring

### Health Endpoint: `GET /health`

**Example JSON Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-31T23:25:00Z",
  "environment": "production",
  "backend": {
    "status": "online",
    "version": "2.0.0",
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
    "document_count": 996
  },
  "sqlite_db": {
    "status": "healthy"
  },
  "system": {
    "disk_free_gb": 42.8,
    "disk_usage_pct": 52.4
  }
}
```

---

## 5. Backup & Disaster Recovery Guide

### 1. SQLite Database Backup
Execute periodic automated snapshots of `data/analytics.db`:
```bash
sqlite3 data/analytics.db ".backup 'data/backups/analytics_backup_$(date +%F).db'"
```

### 2. Chroma Vector DB Snapshot
Backup the persistent collection directory `data/vector_db/CHECK_DB/`:
```bash
tar -czvf data/backups/chroma_vector_backup_$(date +%F).tar.gz data/vector_db/CHECK_DB/
```

### 3. Full System Recovery
In case of server failure:
1. Re-initialize Ollama models: `ollama pull llama3.2:3b` and `ollama pull nomic-embed-text`.
2. Restore vector store snapshot or trigger `/rebuild` endpoint to re-index documents.
