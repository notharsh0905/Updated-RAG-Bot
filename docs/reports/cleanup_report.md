# CSJMU & UIET RAG System - Clutter Archival & Cleanup Report

This report documents all files moved into `data/archive/` during project refactoring to keep the production root clean and maintainable.

---

## 1. Zero Data Loss Policy

No files or historical test outputs were deleted. All legacy scripts, backup copies, and raw intermediate outputs were preserved in `data/archive/`.

---

## 2. Inventory of Archived Items (`data/archive/`)

| File / Folder | Original Location | Reason for Archiving |
| :--- | :--- | :--- |
| `individual_chunking.ipynb` | `/` (root) | Legacy exploration notebook superseded by `app/chunking/build_clean_syllabus_kb.py` |
| `individual_chunking-Copy1.ipynb` | `/` (root) | Duplicate backup copy of chunking notebook |
| `individual_chunking.py` | `/` (root) | Intermediate script superseded by `app/chunking/build_clean_syllabus_kb.py` |
| `individual_chunking_extracted.py` | `/` (root) | Intermediate script superseded by `app/chunking/build_clean_syllabus_kb.py` |
| `notebook_pretty.json` | `/` (root) | Temporary notebook export JSON |
| `.ipynb_checkpoints/` | `/` & subfolders | Temporary Jupyter checkpoint folders |
