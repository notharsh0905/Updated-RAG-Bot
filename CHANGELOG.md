# Changelog

All notable changes to the CSJMU & UIET AI Smart Student Help Desk will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-08-03 — Production Security Hardening & Next.js 15 Release

### Added
- **Next.js 15 Web Frontend**: Modern React 19 + TypeScript + Tailwind CSS web application with App Router, responsive across 320px–2560px screen sizes.
- **Direct Horizontal Navigation Bar**: Replaced modal drawer popups with a clean, direct horizontally scrollable navigation bar on mobile viewports.
- **HttpOnly Cookie Authentication**: Redesigned administrative authentication to issue `HttpOnly`, `SameSite=Lax` signed cookies (`admin_session`) via `POST /api/v1/admin/login`.
- **HMAC-SHA256 Session Signing**: Added 24-hour expiration TTL session verification.
- **Production Intelligence Layer (PIL)**: Intercepts out-of-domain queries, sanitizes LLM developer jargon into official CSJMU phrasing, and enforces strict boundary guards.
- **HTTP Security Headers Matrix**: Enforced `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy`, and conditional `Strict-Transport-Security` (HSTS).
- **Sources-Aware Cache Manager**: Refactored `ResponseCache` to isolate dictionary payloads (`return_sources=True`) and string responses (`return_sources=False`), eliminating cache type collisions and HTTP 500 errors.

### Changed
- **Admin Password**: Configured via backend environment variable (`ADMIN_PASSCODE=<your-secure-admin-passcode>`).
- **Frontend Security**: Removed all instances of `NEXT_PUBLIC_ADMIN_PASSCODE` from client bundles.
- **Scholarship Responses**: Standardized fee waiver responses to present approximate guidelines based on official UP government eligibility criteria rather than fixed numbers.

---

## [2.0.0] - 2026-08-01 — Hybrid Search & System Hardening

### Added
- **Hybrid Retrieval Engine**: Integrated BM25 sparse keyword ranking with Chroma dense vector embeddings (`nomic-embed-text`) over 1001 document chunks.
- **SQLite Analytics DB**: Integrated async non-blocking logging for queries, session traces, and student feedback (👍 / 👎).
- **Admin Management Console**: Developed views for system monitoring, query exploration, document inspection, and knowledge base rebuilding.

---

## [1.0.0] - 2026-07-23 — Initial Release

### Added
- Initial core RAG engine, document loaders, and Ollama LLM integration (`llama3.2:3b`).
