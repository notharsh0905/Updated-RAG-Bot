# 🛡️ CSJMU & UIET AI Smart Student Help Desk — Production Security Policy

This document details the security architecture, authentication flow, headers enforcement, and vulnerability reporting procedures for the **CSJMU & UIET Kanpur AI Smart Student Help Desk**.

---

## 🏛️ Security Architecture & Threat Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Next.js Web Client                              │
│         • Zero passcode storage in JS bundles, HTML, state, or storage      │
│         • Protected route checks via GET /api/v1/admin/verify               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ POST /api/v1/admin/login
                                       │ Body: { "passcode": "<your-secure-admin-passcode>" }
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             FastAPI REST Backend                            │
│         • Owns ADMIN_PASSCODE & ADMIN_SESSION_SECRET                        │
│         • Issues HttpOnly, SameSite=Lax admin_session cookie                │
│         • Enforces require_admin_auth on all /admin/* & /rebuild routes     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Specifications & Controls

### 1. Zero Frontend Passcode Leakage
- Administrator credentials are owned exclusively by the backend environment (`ADMIN_PASSCODE` in `.env` / `app/core/config.py`).
- **No environment variable starting with `NEXT_PUBLIC_ADMIN_PASSCODE` exists.**
- Passcode is never compiled into Next.js JavaScript bundles, client state (Zustand/Redux), `localStorage`, or `sessionStorage`.

### 2. HttpOnly Cookie Session Authentication
- Authenticated administrator sessions are issued via server-side HTTP cookies:
  - **`HttpOnly`**: Prevents client-side JavaScript (`document.cookie`) access, mitigating Cross-Site Scripting (XSS) risks.
  - **`SameSite=Lax`**: Protects against Cross-Site Request Forgery (CSRF).
  - **`Path=/`**: Scoped cookie path.
  - **`Secure`**: Enforced automatically in production HTTPS environments.
- **Cryptographic Token Verification**: Session tokens (`admin:<timestamp>:<signature>`) are signed with **HMAC-SHA256** using `ADMIN_SESSION_SECRET` with a 24-hour expiration TTL.

### 3. HTTP Security Headers
Every HTTP response from the FastAPI backend and Next.js frontend includes mandatory security headers:

| Header Name | Value | Purpose |
| :--- | :--- | :--- |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME-type sniffing attacks. |
| `X-Frame-Options` | `DENY` | Prevents iframe embedding and clickjacking. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Restricts referrer leakage across external domains. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Disables unneeded browser capabilities. |
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:* http://127.0.0.1:*; object-src 'none'; base-uri 'self'; frame-ancestors 'none';` | Restricts script sources, object embedding, and frame ancestors. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Dynamically attached in HTTPS production environments (HSTS). |

---

## 🛡️ Input Validation & Path Traversal Shielding

1. **File Upload Sanitization**:
   - All uploaded knowledge base files (`.pdf`, `.txt`, `.docx`, `.json`) are sanitized using `DocumentProcessor.sanitize_filename` before being written to `data/uploads/`.
   - Rejects illegal path parameters containing `../`, `..\\`, or null bytes to prevent Directory Traversal attacks.
2. **Strict Query Pydantic Models**:
   - Incoming JSON payloads are validated against Pydantic schemas (`QueryRequest`, `FeedbackRequest`, `AdminLoginRequest`).
3. **PIL Out-of-Domain Interception**:
   - The Production Intelligence Layer (PIL) evaluates incoming queries and intercepts out-of-domain prompt injection attempts before sending context to the LLM.

---

## 📬 Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly by emailing **security@csjmu.ac.in**.

Please include:
- Description of the vulnerability and potential impact.
- Step-by-step instructions or proof-of-concept script.
- Affected endpoints or components.

We will acknowledge receipt within **24 hours** and provide periodic updates until patched.
