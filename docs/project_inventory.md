# CSJMU & UIET RAG System - Project File Inventory Audit

This document details every file in the refactored workspace, specifying its purpose, module consumer, dependencies, and deployment categorization.

---

## 1. Core Application Modules (`app/`)

| File Path | Type | Purpose | Consumers | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| `app/api/api.py` | Production | FastAPI Web Service Endpoints | Web Clients, `run.sh` | `fastapi`, `pydantic`, `app.rag` |
| `app/core/config.py` | Production | Centralized System Path & Env Config | All Modules | `pydantic_settings`, `pathlib` |
| `app/core/logging_config.py` | Production | Standardized Logging Handler | All Modules | `logging` |
| `app/rag/rag.py` | Production | LangChain RAG Execution Pipeline | `app.api`, `frontend` | `langchain`, `ollama` |
| `app/rag/prompt.py` | Production | System Prompts & Strict Fact Guardrails | `app.rag` | None |
| `app/retrieval/retriever.py` | Production | Hybrid Search (Dense Chroma + BM25 Sparse) | `app.rag`, `scripts` | `langchain_chroma`, `rank_bm25` |
| `app/retrieval/query_router.py` | Production | Dynamic Pre-Retrieval Intent Collection Router | `app.rag` | None |
| `app/retrieval/retrieval_optimizer.py` | Production | RRF Reranking & Candidate Deduplication | `app.retrieval` | None |
| `app/embeddings/vector_store.py` | Production | Chroma DB Vector Store Manager | `app.retrieval` | `langchain_ollama`, `chromadb` |
| `app/loaders/loader.py` | Production | Raw Document Parsing & LangChain Structuring | `app.embeddings` | `langchain_core` |
| `app/loaders/formatter.py` | Production | Custom Dataset Formatting Templates | `app.loaders` | None |
| `app/chunking/build_clean_syllabus_kb.py` | Production | 95-Page Syllabus OCR Cleaner & Chunker | `scripts` | `json`, `re` |
| `app/memory/memory.py` | Production | Session Conversation History & Memory | `app.rag` | `langchain` |
| `app/cache/cache.py` | Production | Semantic Query Response Cache | `app.rag` | `hashlib` |
| `app/query/query_processor.py` | Production | Query Preprocessor & Keyword Normalizer | `app.rag` | `re` |
| `app/evaluation/evaluate.py` | Testing | 305-Question Automatic Evaluation Suite | `scripts` | `pandas`, `json` |
| `app/analytics/database.py` | Production | SQLite Analytics DB Manager | `app.api` | `sqlite3` |
| `app/ingestion/knowledge_ingestion_pipeline.py` | Production | Autonomous Watcher for `/data/new_documents/` | Admin CLI | `pathlib`, `json` |
| `app/utils/utils.py` | Production | General Utility Helpers | All Modules | None |

---

## 2. Production Datasets & Storage (`data/`)

| Subdirectory | Contained Files | Purpose | Category |
| :--- | :--- | :--- | :--- |
| `data/raw_documents/` | `CSJM_DOCUMENTS/*` (17 files) | 17 Filtered CSJMU/UIET institutional JSON & TXT documents | Production Raw Data |
| `data/cleaned_documents/` | `clean_syllabus.txt` | Clean plain text syllabus without headers/footers/OCR noise | Production Data |
| `data/structured_data/` | `clean_syllabus.json`, `chunks.json`, `optimized_chunks.json`, `knowledge_objects.json`, `collection_mapping.json`, `conflicts.json` | Single-concept chunks, collection mappings, and knowledge objects | Production Structured Data |
| `data/vector_db/` | `CHECK_DB/` | Persistent Chroma DB multi-collection index | Production Database |
| `data/reports/` | `*.html`, `eval_results.csv`, `eval_results.xlsx` | Rendered dashboard HTML reports and test run spreadsheets | Generated Artifacts |
| `data/datasets/` | `golden_dataset.json`, `.csv`, `.xlsx` | Production Golden QA Dataset with traceable source chunks | Production Dataset |
| `data/evaluation/` | `eval_questions.json`, `coverage_statistics.json`, `missing_knowledge.json`, `wrong_answers.json`, `curator_diagnosis.json` | 305 Evaluation questions and failure taxonomy JSONs | Testing & Evaluation |
| `data/review/` | `human_review.xlsx`, `human_review.csv` | Stage 2 Human Validation review sheets with Excel dropdowns | Review & Audit |
| `data/knowledge_graph/` | `knowledge_graph.json` | Node and edge entity-relationship graph JSON | Production Knowledge |
| `data/aliases/` | `query_aliases.json` | Student search query aliases and semantic expansions | Production Knowledge |
| `data/archive/` | Preserved legacy copies | Preserved legacy notebooks and initial test outputs | Archive |

---

## 3. Workflow Scripts (`scripts/`)

| Script Name | Purpose | Category |
| :--- | :--- | :--- |
| `scripts/knowledge_coverage.py` | Evaluates coverage across 305 questions and generates 9 deliverables | Production Script |
| `scripts/knowledge_pipeline.py` | Executes 12-Phase production system optimization pipeline | Production Script |
| `scripts/knowledge_fix_planner.py` | Compiles impact-ranked engineering fix plan in `docs/knowledge_fix_plan.md` | Production Script |
| `scripts/human_validation_builder.py` | Generates `human_review.xlsx` with native Excel DataValidation dropdowns | Production Script |
| `scripts/update_knowledge.py` | Parses human feedback annotations and updates diagnostic JSONs | Production Script |
| `scripts/knowledge_curator.py` | AI Curator module for root-cause diagnosis & automated re-indexing | Production Script |
| `scripts/process_user_questions.py` | CLI tester for custom user question lists | Testing Script |
