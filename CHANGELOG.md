# Changelog

All notable changes to the CSJMU RAG System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-23

This is the official Version 1.0 Release of the CSJMU RAG System. The backend, evaluation framework, frontend interface, and knowledge base structures are complete and ready for production deployment.

### Added
- **Core RAG Engine**: Implemented hybrid search combining Chroma dense vector embeddings (`nomic-embed-text`) and BM25 sparse keyword ranking with reciprocal rank fusion (RRF).
- **FastAPI Backend Server**: Fully featured REST API with streaming query endpoints (SSE), admin history, user feedback capture, and database rebuilding routes.
- **Streamlit Frontend Chat UI**: Developed an interactive web UI for pair testing, featuring rich markdown display, dynamic history, and source document traceability.
- **Automated Evaluation Framework**: Integrated a 305-question automated evaluation runner that parses answer latency, retrieval scores, and accuracy percentages.
- **Knowledge Ingestion Pipeline**: Added an autonomous directory watcher to monitor and ingest new PDF/TXT documents into Chroma DB.
- **Engineering Quality Reports**: Consolidated diagnostic reports for project inventory, knowledge coverage, stage 2 human reviews, and performance benchmarking.
- **Dockerization**: Integrated a production Dockerfile and multi-container Docker Compose file to orchestrate both RAG services and the local Ollama LLM server.
