# CSJMU & UIET RAG System - Project File Inventory Audit

This document details every major module in the refactored workspace, specifying its purpose, module consumer, dependencies, and deployment categorization.

---

## 1. Core Application Modules (`app/`)

| File Path | Type | Purpose | Consumers | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| `app/api/api.py` | Production | FastAPI Web Service Endpoints & Security | Web Clients | `fastapi`, `pydantic`, `app.rag` |
| `app/core/config.py` | Production | Centralized System Path & Env Config | All Modules | `pydantic_settings`, `pathlib` |
| `app/core/logging_config.py` | Production | Standardized Logging Handler | All Modules | `logging` |
| `app/rag/rag.py` | Production | LangChain RAG Execution Pipeline | `app.api` | `langchain`, `ollama` |
| `app/rag/prompt.py` | Production | System Prompts & Strict Fact Guardrails | `app.rag` | None |
| `app/retrieval/retriever.py` | Production | Hybrid Search (Dense Chroma + BM25 Sparse) | `app.rag`, `scripts` | `langchain_chroma`, `rank_bm25` |
| `app/retrieval/query_router.py` | Production | Dynamic Pre-Retrieval Intent Collection Router | `app.rag` | None |
| `app/retrieval/retrieval_optimizer.py` | Production | RRF Reranking & Candidate Deduplication | `app.retrieval` | None |
| `app/embeddings/vector_store.py` | Production | Chroma DB Vector Store Manager | `app.retrieval` | `langchain_ollama`, `chromadb` |
| `app/loaders/loader.py` | Production | Raw Document Parsing & LangChain Structuring | `app.embeddings` | `langchain_core` |
| `app/loaders/formatter.py` | Production | Custom Dataset Formatting Templates | `app.loaders` | None |
| `app/memory/memory.py` | Production | Session Conversation History & Memory | `app.rag` | `langchain` |
| `app/cache/cache.py` | Production | Query Response Cache (sources-aware) | `app.rag` | `hashlib` |
| `app/query/query_processor.py` | Production | Query Preprocessor & Keyword Normalizer | `app.rag` | `re` |
| `app/analytics/database.py` | Production | SQLite Analytics DB Manager | `app.api` | `sqlite3` |
| `app/ingestion/knowledge_ingestion_pipeline.py` | Production | Incremental Knowledge Uploader | Admin API | `pathlib`, `json` |
| `app/utils/utils.py` | Production | Diagnostic Health Check Helpers | `app.api` | `requests` |

---

## 2. Frontend User Interface (`frontend/`)

| File Path | Type | Purpose | Dependencies |
| :--- | :--- | :--- | :--- |
| `frontend/app/page.tsx` | Production | Public Landing Page & Category Quick Cards | Next.js, React, Tailwind |
| `frontend/app/chat/page.tsx` | Production | Public Interactive Chat Canvas | React, Zustand, Axios |
| `frontend/app/about/page.tsx` | Production | Institutional & Supercomputing Hub Page | React, Lucide Icons |
| `frontend/app/help/page.tsx` | Production | Frequently Asked Questions (FAQ) | React |
| `frontend/app/contact/page.tsx` | Production | Contact & Helpline Information | React |
| `frontend/app/admin/login/page.tsx` | Production | Passcode Admin Authentication View | React, Axios (`POST /api/v1/admin/login`) |
| `frontend/app/admin/dashboard/page.tsx` | Production | Administrative Dashboard & Vector Rebuild | React, Axios |
| `frontend/components/layout/Navbar.tsx` | Production | Header with Direct Horizontal Navigation Bar | Next.js Link, Theme Provider |
| `frontend/components/layout/Footer.tsx` | Production | Official University Footer | React |
| `frontend/services/api.ts` | Production | Axios API Client with HttpOnly Cookie credentials | Axios |
| `frontend/store/useChatStore.ts` | Production | Zustand Store for Session & Admin Auth State | Zustand |

---

## 3. Production Datasets & Storage (`data/`)

| Subdirectory / File | Purpose | Category |
| :--- | :--- | :--- |
| `data/raw_documents/` | 17 Filtered CSJMU/UIET institutional JSON & TXT documents | Production Raw Data |
| `data/cleaned_documents/` | Clean plain text syllabus (`clean_syllabus.txt`) | Production Data |
| `data/structured_data/` | Concept chunks, collection mappings, and knowledge objects | Production Structured Data |
| `data/vector_db/` | Persistent Chroma DB multi-collection index (1001 document chunks) | Production Database |
| `data/analytics.db` | SQLite database logging queries, session traces, and feedback | Production Database |
| `data/datasets/` | Golden QA dataset files (`golden_dataset.json`, `.csv`, `.xlsx`) | Production Dataset |
| `data/evaluation/` | 305 Evaluation questions and coverage statistics | Testing & Evaluation |
| `data/review/` | Stage 2 Human Validation review sheets (`human_review.xlsx`) | Review & Audit |
| `data/aliases/` | Student search query aliases and semantic expansions | Production Knowledge |
