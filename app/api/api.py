"""
FastAPI REST API server for CSJMU RAG Application.
Exposes endpoints for health checks, question answering, SSE streaming,
feedback collection, and admin analytics.
"""

import html
import hmac
import hashlib
import json
import shutil
import time
from fastapi import FastAPI, HTTPException, status, Query, File, UploadFile, Form, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any

from app.rag.rag import RAGPipeline
from app.utils.utils import check_ollama_health, check_dataset_status, check_llm_health, check_embedding_health
from app.analytics.database import db_manager
from app.analytics.async_logger import async_logger
from app.ingestion.document_processor import DocumentProcessor
from app.memory.memory import memory_manager
from app.services.notification import notification_service
from app.core.config import config
from app.core.logging_config import setup_logger


logger = setup_logger("fastapi_backend")

app = FastAPI(
    title="CSJMU AI Campus Assistant API",
    description="Production RAG Backend for CSJMU & UIET Kanpur Information System using Ollama, Chroma, and LangChain.",
    version="2.0.0"
)

# Dynamic CORS origins from configuration & regex match for LAN IPs / domains
cors_origins = [o.strip() for o in config.CORS_ORIGINS.split(",") if o.strip() and o.strip() != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security Headers & HTTPS HSTS Middleware
@app.middleware("http")
async def add_security_headers_middleware(request: Request, call_next):
    """Enforces production HTTP security headers and conditional HSTS for HTTPS deployments."""
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()"
    
    csp = (
        "default-src 'self'; "
        "img-src 'self' data: blob: https:; "
        "style-src 'self' 'unsafe-inline'; "
        "font-src 'self' data:; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "connect-src 'self' http://localhost:* http://127.0.0.1:* http://10.63.135.235:8000 ws://localhost:* ws://127.0.0.1:*; "
        "object-src 'none'; "
        "base-uri 'self'; "
        "frame-ancestors 'none';"
    )
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    if config.ENVIRONMENT == "production" and is_https:
        csp += " upgrade-insecure-requests;"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    response.headers["Content-Security-Policy"] = csp
    return response



# Global Production Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Prevents raw internal stack traces from reaching clients in production."""
    logger.error(f"Unhandled Exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status": "error",
            "message": "An internal server error occurred while processing your request.",
            "timestamp": time.time()
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardized HTTP Exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status": "fail",
            "message": exc.detail,
            "timestamp": time.time()
        }
    )

# Global RAG Pipeline Instance
pipeline: Optional[RAGPipeline] = None


@app.on_event("startup")
def startup_event():
    """Initializes the RAG Pipeline on server startup."""
    global pipeline
    logger.info("Initializing RAG Pipeline for FastAPI service...")
    try:
        pipeline = RAGPipeline()
        logger.info("RAG Pipeline startup complete.")
    except Exception as e:
        logger.error(f"Failed to initialize RAG Pipeline on startup: {e}")


# Pydantic Schemas
class QueryRequest(BaseModel):
    """Query Request Payload."""
    question: str = Field(..., example="Who is the Director of UIET?", description="User query question.")
    k: Optional[int] = Field(default=config.DEFAULT_K, example=5, description="Number of context passages to retrieve.")
    strict: Optional[bool] = Field(default=True, description="Whether to use strict document assistant prompt.")
    session_id: Optional[str] = Field(default=None, description="Optional chat session ID for conversation memory.")
    use_hybrid: Optional[bool] = Field(default=True, description="Use Hybrid Search (Vector + BM25).")


class QueryResponse(BaseModel):
    """Query Response Payload."""
    session_id: Optional[str] = None
    question: str
    answer: str
    context: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None
    response_time_sec: Optional[float] = None


class FeedbackRequest(BaseModel):
    """User Feedback Payload."""
    query_id: Optional[str] = Field(default=None, description="Optional UUID of specific query trace.")
    session_id: Optional[str] = None
    question: str
    answer: str
    rating: int = Field(..., example=1, description="1 for 👍, -1 for 👎")
    reason: Optional[str] = None
    comments: Optional[str] = None


class RebuildResponse(BaseModel):
    """Rebuild Response Payload."""
    status: str
    message: str
    document_count: int


class AdminLoginRequest(BaseModel):
    """Admin Login Payload."""
    passcode: str = Field(..., description="Administrator passcode.")


import re


class InquiryCreateRequest(BaseModel):
    """Student Inquiry Creation Payload."""
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the student.")
    email: str = Field(..., min_length=3, max_length=100, description="Valid email address of the student.")
    category: str = Field(..., min_length=1, max_length=100, description="Category or department for the inquiry.")
    message: str = Field(..., min_length=20, max_length=2000, description="Detailed inquiry message (minimum 20 characters).")

    @validator('name', 'category', 'message', pre=True)
    def sanitize_and_trim(cls, v):
        if isinstance(v, str):
            v = v.strip()
            v = html.escape(v)
        return v

    @validator('email')
    def validate_email_format(cls, v):
        if not isinstance(v, str):
            raise ValueError("Email must be a string.")
        v = v.strip()
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, v):
            raise ValueError("Invalid email address format.")
        return v



class InquiryStatusUpdateRequest(BaseModel):
    """Admin Inquiry Status Update Payload."""
    status: str = Field(..., description="Status: Pending, In Progress, Resolved, Closed")

    @validator('status')
    def validate_status(cls, v):
        allowed = {"Pending", "In Progress", "Resolved", "Closed"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v



# Session Security Token Functions
def create_session_token() -> str:
    """Generates an HMAC-SHA256 signed session token valid for 24 hours."""
    timestamp = str(int(time.time()))
    payload = f"admin:{timestamp}"
    signature = hmac.new(
        config.ADMIN_SESSION_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return f"{payload}:{signature}"


def verify_session_token(token: Optional[str]) -> bool:
    """Verifies HMAC session token signature and 24-hour expiration."""
    if not token or ":" not in token:
        return False
    parts = token.split(":")
    if len(parts) != 3:
        return False
    user, ts_str, sig = parts
    if user != "admin":
        return False
    try:
        ts = int(ts_str)
        if time.time() - ts > 86400:  # 24 hours TTL
            return False
        payload = f"{user}:{ts_str}"
        expected_sig = hmac.new(
            config.ADMIN_SESSION_SECRET.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(sig, expected_sig)
    except Exception:
        return False


async def require_admin_auth(request: Request):
    """FastAPI dependency enforcing valid admin session via HttpOnly cookie or Bearer header."""
    token = request.cookies.get("admin_session")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not verify_session_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Valid admin session required."
        )
    return True


# Authentication API Endpoints
@app.post("/api/v1/admin/login", tags=["Admin Auth"])
@app.post("/admin/login", tags=["Admin Auth"])
def admin_login_endpoint(payload: AdminLoginRequest, response: Response, request: Request):
    """Authenticates admin passcode against backend environment & sets HttpOnly session cookie."""
    if payload.passcode.strip() != config.ADMIN_PASSCODE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator passcode."
        )
    token = create_session_token()
    is_secure = request.url.scheme == "https" or config.ENVIRONMENT == "production_https"
    response.set_cookie(
        key="admin_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        max_age=86400,
        path="/"
    )
    return {
        "status": "success",
        "authenticated": True,
        "message": "Admin session authenticated successfully."
    }


@app.post("/api/v1/admin/logout", tags=["Admin Auth"])
@app.post("/admin/logout", tags=["Admin Auth"])
def admin_logout_endpoint(response: Response):
    """Clears the HttpOnly admin session cookie."""
    response.delete_cookie(
        key="admin_session",
        path="/",
        httponly=True,
        samesite="lax"
    )
    return {
        "status": "success",
        "authenticated": False,
        "message": "Logged out successfully."
    }


@app.get("/api/v1/admin/verify", tags=["Admin Auth"])
@app.get("/admin/verify", tags=["Admin Auth"])
def admin_verify_endpoint(request: Request):
    """Verifies existing admin session cookie status."""
    token = request.cookies.get("admin_session")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if verify_session_token(token):
        return {"status": "success", "authenticated": True, "user": "admin"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: No active admin session."
    )


# API Endpoints
@app.get("/", tags=["General"])
def root_endpoint():
    """Root Endpoint providing service information."""
    return {
        "service": "CSJMU AI Campus Assistant API",
        "version": "2.0.0",
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "query": "POST /query",
            "query_stream": "POST /query/stream",
            "feedback": "POST /feedback",
            "rebuild": "POST /rebuild",
            "health": "GET /health",
            "analytics": "GET /admin/analytics"
        }
    }


@app.get("/health", tags=["Health"])
def health_endpoint():
    """Structured production health check endpoint evaluating all backend subsystems."""
    llm_health = check_llm_health()
    embedding_health = check_embedding_health()
    dataset_status = check_dataset_status()
    
    vector_count = pipeline.vector_store_manager.get_count() if pipeline else 0
    effective_collection = config.get_effective_collection_name()

    # SQLite DB health check
    sqlite_healthy = False
    try:
        db_manager.get_uploaded_documents(limit=1)
        sqlite_healthy = True
    except Exception:
        sqlite_healthy = False

    # System Disk metrics
    total_b, used_b, free_b = shutil.disk_usage(config.BASE_DIR)
    disk_free_gb = round(free_b / (1024 ** 3), 2)
    disk_usage_pct = round((used_b / total_b) * 100, 1)

    llm_connected = llm_health.get("connected", False)
    emb_connected = embedding_health.get("connected", False)
    is_healthy = sqlite_healthy and disk_free_gb > 1.0 and llm_connected and emb_connected and (pipeline is not None)

    return {
        "status": "healthy" if is_healthy else "degraded",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "environment": config.ENVIRONMENT,
        "backend": {
            "status": "online",
            "version": "2.0.0",
            "rag_pipeline": "initialized" if pipeline else "offline"
        },
        "llm": {
            "provider": llm_health.get("provider", config.LLM_PROVIDER),
            "model": llm_health.get("model", config.get_active_model_name()),
            "connection": "Healthy" if llm_connected else "Failed",
            "connected": llm_connected,
            "url": llm_health.get("url", "")
        },
        "embeddings": {
            "provider": embedding_health.get("provider", config.get_active_embedding_provider()),
            "model": embedding_health.get("model", config.get_active_embedding_model_name()),
            "collection": effective_collection,
            "status": embedding_health.get("status", "unknown"),
            "connected": emb_connected
        },
        "ollama": {
            "connected": llm_connected if config.LLM_PROVIDER == "ollama" else True,
            "base_url": config.OLLAMA_BASE_URL,
            "llm_model": config.get_active_model_name(),
            "embedding_model": config.get_active_embedding_model_name()
        },
        "vector_db": {
            "type": "ChromaDB",
            "collection": effective_collection,
            "document_count": vector_count,
            "persistence_dir": str(config.CHROMA_DB_DIR)
        },
        "sqlite_db": {
            "status": "healthy" if sqlite_healthy else "error",
            "db_path": str(db_manager.db_path)
        },
        "system": {
            "disk_free_gb": disk_free_gb,
            "disk_usage_pct": disk_usage_pct
        }
    }



@app.post("/query", response_model=QueryResponse, tags=["RAG Query"])
def query_endpoint(payload: QueryRequest):
    """
    Submits a query to the CSJMU RAG Pipeline and returns the generated answer.
    """
    global pipeline
    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG Pipeline is not initialized."
        )

    try:
        res = pipeline.ask(
            question=payload.question,
            k=payload.k,
            strict_prompt=payload.strict,
            return_sources=True,
            session_id=payload.session_id,
            use_hybrid=payload.use_hybrid
        )
        if isinstance(res, dict):
            return QueryResponse(
                session_id=res.get("session_id"),
                question=res.get("question", payload.question),
                answer=res.get("answer", ""),
                context=res.get("context"),
                sources=res.get("sources", []),
                response_time_sec=res.get("response_time_sec")
            )
        else:
            return QueryResponse(
                session_id=payload.session_id,
                question=payload.question,
                answer=str(res),
                context="",
                sources=[],
                response_time_sec=None
            )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Error handling query endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )


@app.post("/query/stream", tags=["RAG Query"])
def query_stream_endpoint(payload: QueryRequest):
    """
    Server-Sent Events (SSE) streaming query endpoint with explicit completion sentinel.
    """
    global pipeline
    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG Pipeline is not initialized."
        )

    def event_generator():
        try:
            stream_gen = pipeline.ask_stream(
                question=payload.question,
                k=payload.k,
                strict_prompt=payload.strict,
                session_id=payload.session_id,
                use_hybrid=payload.use_hybrid
            )
            for token in stream_gen:
                yield f"data: {json.dumps(token)}\n\n"
            yield f"data: {json.dumps('[DONE]')}\n\n"
        except Exception as e:
            yield f"data: {json.dumps(f'[ERROR]: {str(e)}')}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/feedback", tags=["Feedback"])
def feedback_endpoint(payload: FeedbackRequest):
    """
    Saves user feedback (👍 = 1, 👎 = -1) and comments.
    """
    success = db_manager.log_feedback(
        session_id=payload.session_id or "anonymous",
        question=payload.question,
        answer=payload.answer,
        rating=payload.rating,
        comments=payload.comments
    )
    
    # Asynchronously persist feedback and generate review tickets if rating is -1
    async_logger.log_feedback_async(
        query_id=payload.query_id,
        session_id=payload.session_id or "anonymous",
        rating=payload.rating,
        reason=payload.reason,
        comments=payload.comments
    )

    if success:
        return {"status": "success", "message": "Feedback recorded. Thank you!"}
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to record feedback.")


@app.get("/admin/queries/feed", tags=["Administration"], dependencies=[Depends(require_admin_auth)])
def admin_queries_feed_endpoint(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    rating: Optional[int] = Query(default=None),
    status: Optional[str] = Query(default=None)
):
    """
    Returns AI Operations Query Center feed combining queries, traces, feedback, and review tickets.
    """
    queries = db_manager.get_queries_feed(limit=limit, offset=offset, rating=rating, status=status)
    return {"queries": queries, "count": len(queries), "limit": limit, "offset": offset}


@app.get("/admin/analytics", tags=["Administration"], dependencies=[Depends(require_admin_auth)])
def admin_analytics_endpoint():
    """
    Returns query execution metrics, cache hit rate, and feedback analytics.
    """
    return db_manager.get_analytics_summary()


@app.get("/admin/history/{session_id}", tags=["Administration"], dependencies=[Depends(require_admin_auth)])
def admin_history_endpoint(session_id: str):
    """
    Retrieves past session messages for a given session_id.
    """
    history = memory_manager.get_history(session_id, limit=50)
    return {"session_id": session_id, "messages": history}


@app.post("/rebuild", response_model=RebuildResponse, tags=["Database Administration"], dependencies=[Depends(require_admin_auth)])
def rebuild_endpoint():
    """
    Reloads all datasets and rebuilds the Chroma vector store & BM25 index.
    """
    global pipeline
    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG Pipeline is not initialized."
        )

    try:
        result = pipeline.rebuild_database()
        return RebuildResponse(
            status=result["status"],
            message=result["message"],
            document_count=result["document_count"]
        )
    except Exception as e:
        logger.error(f"Error rebuilding database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rebuild database: {str(e)}"
        )


class DocumentUploadResponse(BaseModel):
    """Document Ingestion Response Payload."""
    success: bool
    document_id: str
    filename: str
    pages: int
    chunks: int
    embedding_model: str
    processing_time: float
    status: str


@app.post("/admin/upload", response_model=DocumentUploadResponse, tags=["Administration"], dependencies=[Depends(require_admin_auth)])
async def admin_upload_endpoint(
    file: UploadFile = File(...),
    category: str = Form("uploaded_document")
):
    """
    Ingests an uploaded document (PDF, TXT, DOCX, JSON) into Chroma DB & BM25 index incrementally.
    """
    global pipeline
    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG Pipeline is not initialized."
        )

    try:
        content = await file.read()
        safe_filename = DocumentProcessor.sanitize_filename(file.filename or "uploaded_file.pdf")
        res = pipeline.ingest_uploaded_document(
            file_bytes=content,
            filename=safe_filename,
            category=category
        )
        return DocumentUploadResponse(
            success=res["success"],
            document_id=res["document_id"],
            filename=res["filename"],
            pages=res["pages"],
            chunks=res["chunks"],
            embedding_model=res["embedding_model"],
            processing_time=res["processing_time"],
            status=res["status"]
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        logger.error(f"Error handling admin upload endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document ingestion failed: {str(e)}"
        )


@app.get("/admin/documents/uploaded", tags=["Administration"], dependencies=[Depends(require_admin_auth)])
def admin_uploaded_documents_endpoint():
    """
    Returns list of all uploaded documents indexed in the RAG knowledge base.
    """
    docs = db_manager.get_uploaded_documents()
    return {"documents": docs, "count": len(docs)}


# ==========================================
# Student Inquiry Management System Endpoints
# ==========================================

INQUIRY_IP_SUBMISSIONS: Dict[str, List[float]] = {}


def check_inquiry_rate_limit(request: Request, max_requests: int = 5, window_sec: int = 60):
    """Enforces server-side submission rate limiting per client IP."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    timestamps = [t for t in INQUIRY_IP_SUBMISSIONS.get(client_ip, []) if now - t < window_sec]
    if len(timestamps) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Submission rate limit exceeded. Please wait a minute before submitting another inquiry."
        )
    timestamps.append(now)
    INQUIRY_IP_SUBMISSIONS[client_ip] = timestamps


@app.post("/api/v1/inquiries", tags=["Student Inquiries"])
def create_inquiry_endpoint(payload: InquiryCreateRequest, request: Request):
    """
    Creates a new student inquiry record with server-side validation, rate limiting, and XSS sanitization.
    Returns reference_id formatted as CSJMU-2026-XXXX.
    """
    check_inquiry_rate_limit(request)
    try:
        inquiry = db_manager.create_student_inquiry(
            name=payload.name,
            email=payload.email,
            category=payload.category,
            message=payload.message
        )
        notification_service.send_inquiry_confirmation(inquiry)
        return {
            "success": True,
            "reference_id": inquiry.get("reference_id")
        }
    except Exception as e:
        logger.error(f"Error creating student inquiry: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit inquiry due to internal database error."
        )


@app.get("/api/v1/admin/inquiries", tags=["Student Inquiries Admin"], dependencies=[Depends(require_admin_auth)])
def get_admin_inquiries_endpoint(
    search: Optional[str] = Query(None, description="Search by Reference ID, Student Name, Email, Category, or Message"),
    status: Optional[str] = Query(None, description="Filter by status (Pending, In Progress, Resolved, Closed)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort: Optional[str] = Query("newest", description="Sort order: newest or oldest")
):
    """
    Protected admin endpoint retrieving student inquiries with search, filter, and count metrics.
    """
    try:
        inquiries = db_manager.get_student_inquiries(
            search=search,
            status_filter=status,
            category_filter=category,
            sort_order=sort or "newest"
        )
        counts = db_manager.get_student_inquiry_counts()
        return {
            "success": True,
            "inquiries": inquiries,
            "counts": counts
        }
    except Exception as e:
        logger.error(f"Error retrieving admin inquiries: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve student inquiries."
        )


@app.patch("/api/v1/admin/inquiries/{id}", tags=["Student Inquiries Admin"], dependencies=[Depends(require_admin_auth)])
def update_admin_inquiry_status_endpoint(id: int, payload: InquiryStatusUpdateRequest):
    """
    Protected admin endpoint allowing status updates (Pending, In Progress, Resolved, Closed).
    """
    try:
        updated = db_manager.update_student_inquiry_status(inquiry_id=id, status=payload.status)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inquiry with ID {id} not found."
            )
        notification_service.send_inquiry_status_update(updated, payload.status)
        return {
            "success": True,
            "inquiry": updated
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating inquiry status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update inquiry status."
        )


@app.delete("/api/v1/admin/inquiries/{id}", tags=["Student Inquiries Admin"], dependencies=[Depends(require_admin_auth)])
def delete_admin_inquiry_endpoint(id: int):
    """
    Protected admin endpoint allowing deletion of an inquiry record.
    """
    try:
        success = db_manager.delete_student_inquiry(inquiry_id=id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inquiry with ID {id} not found."
            )
        return {
            "success": True,
            "message": "Inquiry deleted successfully."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting inquiry: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete inquiry."
        )


