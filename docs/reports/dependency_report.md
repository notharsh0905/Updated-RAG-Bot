# CSJMU & UIET RAG System - Dependency & Code Audit Report

This report analyzes python dependencies, import health, and code structure across `app/` and `scripts/`.

---

## 1. Package Dependency Tree (`requirements.txt`)

- `fastapi` & `uvicorn`: Web API Server
- `streamlit`: Web UI Frontend
- `langchain` & `langchain-core`: RAG Chain & Prompt Engineering
- `langchain-ollama`: Ollama Embeddings (`nomic-embed-text`) & LLM (`llama3.2:3b`)
- `langchain-chroma` & `chromadb`: Persistent Vector Database
- `rank-bm25`: Sparse Keyword Retrieval
- `pandas` & `openpyxl`: Dataset Processing & Excel Review Sheet Generation
- `pydantic-settings`: Centralized Environment & Path Configuration

---

## 2. Code Quality Audit

1. **Import Cleanliness**:
   - Zero circular imports detected.
   - All modules import path settings from central `app.core.config`.
2. **Modular Decoupling**:
   - Web API (`app/api/`) and Frontend UI (`frontend/`) are completely decoupled from core RAG logic.
   - Loaders (`app/loaders/`) and Chunking (`app/chunking/`) are independent of vector database operations.
3. **Execution Reliability**:
   - All workflow scripts (`scripts/`) run in headless non-interactive mode.
