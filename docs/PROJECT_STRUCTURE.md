# CSJMU & UIET RAG System - Project Directory Structure Guide

Welcome to the CSJMU & UIET Production RAG Repository. This guide explains the purpose, expected files, module consumers, and usage patterns for every folder.

---

## 📁 Folder-by-Folder Guide

### 1. `app/` (Core Application Package)
- **Purpose**: Contains all production backend logic, RAG pipelines, retrieval engines, API routes, and database loaders.
- **Subdirectories**:
  - `app/api/`: FastAPI web server endpoints (`api.py`).
  - `app/core/`: Central configuration (`config.py`) and logging setup (`logging_config.py`).
  - `app/rag/`: RAG execution engine (`rag.py`) and system prompts (`prompt.py`).
  - `app/retrieval/`: Hybrid search (`retriever.py`), intent query router (`query_router.py`), and RRF reranker (`retrieval_optimizer.py`).
  - `app/embeddings/`: Chroma DB vector store manager (`vector_store.py`).
  - `app/loaders/`: Raw document loader (`loader.py`) and text formatters (`formatter.py`).
  - `app/chunking/`: 95-page syllabus parser and single-concept chunker (`build_clean_syllabus_kb.py`).
  - `app/memory/`: Session conversation memory (`memory.py`).
  - `app/cache/`: Query response cache (`cache.py`).
  - `app/query/`: Query preprocessor (`query_processor.py`).
  - `app/evaluation/`: 305-Question automated evaluation framework (`evaluate.py`).
  - `app/analytics/`: SQLite user interaction database (`database.py`).
  - `app/ingestion/`: Autonomous document watcher pipeline (`knowledge_ingestion_pipeline.py`).
  - `app/utils/`: Shared utilities (`utils.py`).

---

### 2. `frontend/` (User Interface)
- **Purpose**: Streamlit web chat user interface for interactive pair testing.
- **Primary Files**: `ui.py`, `app.py`.

---

### 3. `data/` (Data & Artifact Layer)
- **Purpose**: Production datasets, raw documents, Chroma DB index, review sheets, and HTML dashboards.
- **Subdirectories**:
  - `data/raw_documents/`: Filtered institutional files (`CSJM_DOCUMENTS/*`).
  - `data/cleaned_documents/`: Clean plain text syllabus (`clean_syllabus.txt`).
  - `data/structured_data/`: Concept chunks (`chunks.json`, `optimized_chunks.json`), collection mappings (`collection_mapping.json`), and knowledge objects (`knowledge_objects.json`).
  - `data/vector_db/`: Persistent Chroma DB collections (`CHECK_DB/`).
  - `data/reports/`: Rendered dashboard HTML reports (`knowledge_report.html`, `review_report.html`, `knowledge_dashboard.html`, etc.).
  - `data/datasets/`: Golden QA dataset files (`golden_dataset.json`, `.csv`, `.xlsx`).
  - `data/evaluation/`: 305 Evaluation questions (`eval_questions.json`) and coverage statistics.
  - `data/review/`: Stage 2 Human validation review sheets with Excel dropdowns (`human_review.xlsx`, `.csv`).
  - `data/knowledge_graph/`: Entity-relationship graph (`knowledge_graph.json`).
  - `data/aliases/`: Student search query aliases (`query_aliases.json`).
  - `data/archive/`: Preserved legacy copies and intermediate notebooks.

---

### 4. `scripts/` (Workflow CLI Tools)
- **Purpose**: Runnable Python CLI tools for batch coverage analysis, Stage 2 human review updates, AI Curator diagnosis, and fix planning.
- **Primary Scripts**:
  - `scripts/knowledge_coverage.py`: Analyzes coverage across 305 questions and generates 9 deliverables.
  - `scripts/knowledge_pipeline.py`: Executes 12-Phase production optimization system.
  - `scripts/knowledge_fix_planner.py`: Compiles single engineering fix plan in `docs/knowledge_fix_plan.md`.
  - `scripts/human_validation_builder.py`: Builds Excel review sheet with dropdowns.
  - `scripts/update_knowledge.py`: Processes human review feedback.
  - `scripts/knowledge_curator.py`: AI Curator root-cause diagnosis engine & auto re-indexer.

---

### 5. `docs/` (Documentation)
- **Purpose**: Project specifications, architecture diagrams, inventories, and roadmaps.
- **Key Files**: `PROJECT_STRUCTURE.md`, `project_inventory.md`, `knowledge_inventory.md`, `knowledge_fix_plan.md`, `knowledge_improvement_plan.md`, `cleanup_report.md`, `dependency_report.md`.

---

### 6. `configs/` & `notebooks/`
- **`configs/`**: Dockerfile, docker-compose.yml, environment templates.
- **`notebooks/`**: Exploratory Jupyter notebooks.
