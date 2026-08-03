# CSJMU & UIET RAG System - Project Directory Structure Guide

Welcome to the CSJMU & UIET Production RAG Repository. This guide explains the purpose, expected files, module consumers, and usage patterns for every folder in the codebase.

---

## 📁 Folder-by-Folder Guide

### 1. `app/` (Core Application Backend Package)
- **Purpose**: Contains all production backend logic, RAG pipelines, hybrid retrieval engines, API routes, security guards, and database managers.
- **Subdirectories**:
  - `app/api/`: FastAPI web server endpoints (`api.py`), security middleware, and HttpOnly session handlers.
  - `app/analytics/`: SQLite user interaction database (`database.py`) and non-blocking async logger (`async_logger.py`).
  - `app/cache/`: Semantic query response cache manager (`cache.py`).
  - `app/chunking/`: 95-page syllabus parser and single-concept chunkers.
  - `app/core/`: Central configuration (`config.py`) and logging setup (`logging_config.py`).
  - `app/embeddings/`: Chroma DB vector store manager (`vector_store.py`).
  - `app/evaluation/`: Automated evaluation framework (`evaluate.py`).
  - `app/ingestion/`: Autonomous document processor and incremental uploader (`knowledge_ingestion_pipeline.py`).
  - `app/loaders/`: Raw document loader (`loader.py`) and custom text formatters (`formatter.py`).
  - `app/memory/`: Session conversation memory manager (`memory.py`).
  - `app/query/`: Query preprocessor and spell normalizer (`query_processor.py`).
  - `app/rag/`: RAG execution engine (`rag.py`), PIL domain guard (`pil.py`), system prompts (`prompt.py`), response enrichment (`response_enrichment.py`), and ChatOllama LLM manager (`llm.py`).
  - `app/retrieval/`: Hybrid search (`retriever.py`), intent query router (`query_router.py`), and RRF reranker (`retrieval_optimizer.py`).
  - `app/utils/`: Diagnostic health check helpers (`utils.py`).

---

### 2. `frontend/` (Next.js Web User Interface)
- **Purpose**: Next.js 15 (React 19 + TypeScript + Tailwind CSS) App Router web portal for public student chat and admin management.
- **Subdirectories**:
  - `frontend/app/`: App Router pages (`/`, `/chat`, `/about`, `/help`, `/contact`, `/admin/*`).
  - `frontend/components/`: Modular UI elements (`Navbar.tsx` with direct scrollable navigation bar, `Footer.tsx`, `Sidebar.tsx`, theme providers).
  - `frontend/features/`: Chat canvas components (`ChatWindow.tsx`, `SuggestionChips.tsx`).
  - `frontend/services/`: Axios API client connecting to FastAPI backend (`api.ts`).
  - `frontend/store/`: Zustand state management (`useChatStore.ts`).

---

### 3. `data/` (Data & Artifact Layer)
- **Purpose**: Production datasets, raw documents, Chroma DB index (1001 document chunks), review sheets, and SQLite database.
- **Subdirectories & Files**:
  - `data/raw_documents/`: Filtered institutional files (`CSJM_DOCUMENTS/*`).
  - `data/cleaned_documents/`: Clean plain text syllabus (`clean_syllabus.txt`).
  - `data/structured_data/`: Concept chunks (`chunks.json`, `optimized_chunks.json`), collection mappings (`collection_mapping.json`), and knowledge objects (`knowledge_objects.json`).
  - `data/vector_db/`: Persistent Chroma DB collections (`CHECK_DB/`).
  - `data/analytics.db`: SQLite database logging queries, session traces, and feedback.
  - `data/datasets/`: Golden QA dataset files (`golden_dataset.json`, `.csv`, `.xlsx`).
  - `data/evaluation/`: Evaluation questions (`eval_questions.json`) and coverage statistics.
  - `data/review/`: Stage 2 Human validation review sheets (`human_review.xlsx`).
  - `data/aliases/`: Student search query aliases (`query_aliases.json`).

---

### 4. `scripts/` (Workflow CLI Tools)
- **Purpose**: Runnable Python CLI utilities for batch coverage analysis, human review updates, AI Curator diagnosis, and system testing.
- **Key Utilities**:
  - `scripts/knowledge_coverage.py`: Analyzes coverage across questions and generates report deliverables.
  - `scripts/knowledge_pipeline.py`: Executes production optimization system.
  - `scripts/human_validation_builder.py`: Builds Excel review sheet with dropdowns.
  - `scripts/update_knowledge.py`: Processes human review feedback.
  - `scripts/knowledge_curator.py`: AI Curator root-cause diagnosis engine & auto re-indexer.

---

### 5. `docs/` (Architectural Documentation)
- **Purpose**: Detailed technical specifications, inventories, deployment guides, and reports.
- **Primary Documents**: `PROJECT_STRUCTURE.md`, `project_inventory.md`, `deployment_guide.md`, `knowledge_inventory.md`, `knowledge_fix_plan.md`, `knowledge_improvement_plan.md`.
