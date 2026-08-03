# 🎓 CSJMU & UIET AI Smart Student Help Desk & RAG Platform

An enterprise-grade, zero-hallucination **Retrieval-Augmented Generation (RAG)** platform and **Student Knowledge Management System** designed for Chhatrapati Shahu Ji Maharaj University (CSJMU) and the University Institute of Engineering and Technology (UIET), Kanpur.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           🎓 Students / Users                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      📱 Next.js 15 Frontend                             │
│       React 19 • TypeScript • Tailwind CSS • App Router • 320px–2560px  │
│                   (Direct Scrollable Mobile Navbar)                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST / SSE Streaming
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       ⚡ FastAPI Backend Server                         │
│       Python 3.9+ • Security Headers • HttpOnly Cookie Auth Guard       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      🧠 RAG Pipeline Orchestrator                       │
│    PIL Domain Guard • Query Normalizer • Conversation Memory • Cache    │
└──────────┬─────────────────────────┬──────────────────────────┬─────────┘
           │                         │                          │
           ▼                         ▼                          ▼
┌──────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐
│  🔎 Hybrid Retriever │  │  🗄️ Vector Database  │  │  🤖 Local LLM Engine │
│    BM25 + Vector     │  │  ChromaDB (1001 docs│  │  Ollama llama3.2:3b  │
│  Category Reranking  │  │  nomic-embed-text)  │  │  Strict CSJMU Facts  │
└──────────────────────┘  └─────────────────────┘  └──────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     📊 SQLite Analytics & Audit Log                     │
│         Queries • Traces • Feedback (👍/👎) • Admin Operations          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- **Direct Responsive Navigation**: Custom responsive UI engineered for viewports from 320px (Android phones) to 2560px (4K monitors). Includes a clean, direct horizontally scrollable navigation bar on mobile devices without obstructive popups or hamburger drawers.
- **Hybrid Search Engine**: Combines **BM25 keyword search** and **ChromaDB dense vector embeddings** (`nomic-embed-text`) with category-aware reranking across 1001 indexed document chunks.
- **Production Intelligence Layer (PIL)**: Intercepts out-of-domain queries, sanitizes developer jargon into official university terminology, and enforces strict boundary guards (answers exclusively CSJMU and UIET Kanpur queries).
- **Backend-Only Security & Cookie Auth**: Administrator passcode is verified exclusively on the FastAPI backend. Employs HMAC-SHA256 signed `HttpOnly`, `SameSite=Lax` session cookies (`admin_session`) with 24-hour expiration TTL. Zero password leakage in frontend bundles.
- **Comprehensive Admin Suite**:
  - **Dashboard**: Real-time operational metrics and query volume statistics.
  - **Human Review Workspace**: Interface for evaluating student feedback (👍 / 👎) and reviewing flagged queries.
  - **Knowledge Management**: Incremental document uploader (PDF, TXT, DOCX, JSON) and real-time document inspector.
  - **Analytics & Monitoring**: System health diagnostics (Ollama, ChromaDB, SQLite, Disk/RAM utilization).
- **Accurate Fee & Scholarship Guidance**: Provides clear, official fee breakdowns for B.Tech, M.Tech, MCA, BCA, and Hostels. Formulates scholarship fee waiver responses using official eligibility criteria and approximate financial limits.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Zustand |
| **Backend** | FastAPI, Python 3.9+, Pydantic v2, Uvicorn, Asyncio |
| **AI & LLM** | Ollama (`llama3.2:3b`), `nomic-embed-text`, LangChain, LangChain-Ollama |
| **Vector DB** | ChromaDB (`data/vector_db/CHECK_DB`, collection `collection50`, 1001 chunks) |
| **Search Index** | Rank-BM25 (Hybrid retrieval with Reciprocal Rank Fusion) |
| **Analytics DB** | SQLite (`data/analytics.db`), Async ThreadPool Logging |
| **Security** | HTTP Security Headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy), HMAC-SHA256, HttpOnly Cookies |

---

## 📂 Folder Directory Structure

```
.
├── app/                             # Python Backend Package
│   ├── analytics/                   # SQLite database & non-blocking async logger
│   ├── api/                         # FastAPI REST endpoints & HTTP security middleware
│   ├── cache/                       # Response LRU Cache Manager
│   ├── chunking/                    # Single-concept semantic chunkers
│   ├── core/                        # Central config (`config.py`) & logging setup
│   ├── embeddings/                  # ChromaDB vector store manager
│   ├── evaluation/                  # Automated evaluation framework
│   ├── ingestion/                   # Document processor & incremental uploader
│   ├── loaders/                     # Raw document loaders & text formatters
│   ├── memory/                      # Session conversation memory
│   ├── query/                       # Query preprocessor & spell normalizer
│   ├── rag/                         # RAG pipeline, PIL guard, prompts, LLM manager
│   ├── retrieval/                   # Hybrid retriever (BM25 + Vector Search)
│   └── utils/                       # Health check helpers & diagnostics
│
├── frontend/                        # Next.js 15 Web Application
│   ├── app/                         # App Router pages (Home, Chat, About, Help, Contact, Admin)
│   ├── components/                  # UI layout (Navbar, Footer, TopBar, Sidebar, Admin panels)
│   ├── features/                    # Chat components & conversation interfaces
│   ├── services/                    # Axios API client & streaming fetch handlers
│   ├── store/                       # Zustand state management
│   └── package.json                 # Frontend dependencies & build scripts
│
├── data/                            # Production Data & Database Layer
│   ├── raw_documents/               # Official CSJM_DOCUMENTS files
│   ├── cleaned_documents/           # Cleaned plain text datasets
│   ├── structured_data/             # Concept chunks & collection mappings
│   ├── vector_db/                   # Persistent Chroma DB store (1001 document chunks)
│   └── analytics.db                 # SQLite query audit & feedback log
│
├── docs/                            # Architectural & Operational Documentation
│   ├── PROJECT_STRUCTURE.md         # Folder & module guide
│   ├── project_inventory.md         # Inventory of repository components
│   ├── deployment_guide.md          # Comprehensive deployment instructions
│   └── reports/                     # Coverage and evaluation reports
│
├── scripts/                         # Maintenance CLI utilities
├── DEPLOYMENT.md                    # Production deployment & security guide
├── SECURITY.md                      # Security policy & headers specification
├── CHANGELOG.md                     # Release history & version log
├── CONTRIBUTING.md                  # Development contribution guidelines
└── LICENSE                          # Project license
```

---

## ⚡ Quick Start & Local Development

### 1. Prerequisites
- **Python**: 3.9 or higher
- **Node.js**: 18.x or 20.x (with npm)
- **Ollama**: Installed and running locally (`http://localhost:11434`)

### 2. Ollama Model Setup
Pull the required LLM and embedding models:
```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

### 3. Backend Setup
Activate your Python virtual environment and install dependencies:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

Launch the FastAPI backend server (runs on `http://localhost:8000`):
```bash
uvicorn app.api.api:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup
In a new terminal window, navigate to the `frontend/` directory and install dependencies:
```bash
cd frontend
npm install
```

Launch the Next.js development server (runs on `http://localhost:3001`):
```bash
npm run dev
```

Open `http://localhost:3001` in your browser to interact with the platform.

---

## 🔑 Environment Variables Reference

| Variable | Required | Default Value | Purpose | Example Placeholder |
| :--- | :---: | :--- | :--- | :--- |
| `ENVIRONMENT` | Yes | `production` | Runtime mode (`production`, `development`) | `production` |
| `API_HOST` | Yes | `0.0.0.0` | IP bind address for FastAPI backend server | `0.0.0.0` |
| `API_PORT` | Yes | `8000` | Port number for FastAPI backend server | `8000` |
| `ADMIN_PASSCODE` | Yes | Custom string | Administrator login passcode for backend auth | `ADMIN_PASSCODE=<your-secure-password>` |
| `ADMIN_SESSION_SECRET` | Yes | Custom secret | HMAC-SHA256 secret key for signing session tokens | `ADMIN_SESSION_SECRET=<generate-a-random-secret>` |
| `CORS_ORIGINS` | Yes | `http://localhost:3000...` | Allowed origins for cross-origin browser requests | `http://localhost:3000,https://assistant.csjmu.ac.in` |
| `OLLAMA_BASE_URL` | Yes | `http://localhost:11434` | Service URL for Ollama LLM engine | `http://localhost:11434` |
| `LLM_MODEL` | Yes | `llama3.2:3b` | Target LLM model for answer generation | `llama3.2:3b` |
| `EMBEDDING_MODEL` | Yes | `nomic-embed-text` | Target embedding model for Chroma vector store | `nomic-embed-text` |
| `COLLECTION_NAME` | Yes | `collection50` | Active ChromaDB vector store collection name | `collection50` |
| `DEFAULT_K` | No | `7` | Number of context document chunks to retrieve | `7` |
| `MAX_FILE_SIZE_BYTES` | No | `52428800` | Max file upload size in bytes for document uploader | `52428800` |
| `RATE_LIMIT_PER_MINUTE` | No | `120` | Request rate limit per minute per IP | `120` |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Public API base URL for frontend SSR | `http://localhost:8000` |

---

## 🔒 Security Specifications

- **Admin Passcode**: Configured via backend environment variable `ADMIN_PASSCODE` (e.g. `ADMIN_PASSCODE=<your-secure-admin-passcode>`).
- **Session Authentication**: HMAC-SHA256 signed session tokens issued via `HttpOnly`, `SameSite=Lax` cookies.
- **HTTP Security Headers**: Enforced globally on all responses:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
  - `Content-Security-Policy`: Strictly scoped directive preventing unauthorized script/frame injection.
  - `Strict-Transport-Security` (HSTS): Enforced in HTTPS production environments.

---

## 🚀 Production Build & Deployment

To verify and compile the Next.js production bundle:
```bash
cd frontend
npm run build
npm run start
```

For complete multi-node production deployment procedures, Docker Compose instructions, reverse-proxy configurations, and backup strategies, consult [DEPLOYMENT.md](file:///Users/harshupadhyay/Downloads/compressed_folder%20%282%29/DEPLOYMENT.md).

---

## 📄 License & Attribution

Developed for **Chhatrapati Shahu Ji Maharaj University (CSJMU)** & **University Institute of Engineering and Technology (UIET), Kanpur**.  
See [LICENSE](file:///Users/harshupadhyay/Downloads/compressed_folder%20%282%29/LICENSE) for usage terms.
