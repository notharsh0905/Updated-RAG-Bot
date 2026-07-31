"""
FastAPI REST API server for CSJMU RAG Application.
Exposes endpoints for health checks, question answering, SSE streaming,
feedback collection, and admin analytics.
"""

from fastapi import FastAPI, HTTPException, status, Query, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.rag.rag import RAGPipeline
from app.utils.utils import check_ollama_health, check_dataset_status
from app.analytics.database import db_manager
from app.analytics.async_logger import async_logger
from app.memory.memory import memory_manager
from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("fastapi_backend")

app = FastAPI(
    title="CSJMU AI Campus Assistant API",
    description="Production RAG Backend for CSJMU & UIET Kanpur Information System using Ollama, Chroma, and LangChain.",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    """Health check endpoint evaluating Ollama connectivity and Vector DB status."""
    ollama_status = check_ollama_health(config.OLLAMA_BASE_URL)
    dataset_status = check_dataset_status()
    
    vector_count = pipeline.vector_store_manager.get_count() if pipeline else 0

    is_healthy = ollama_status.get("connected", False) and dataset_status.get("exists", False)

    return {
        "status": "healthy" if is_healthy else "degraded",
        "ollama": ollama_status,
        "dataset": dataset_status,
        "vector_db": {
            "collection": config.COLLECTION_NAME,
            "document_count": vector_count
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
        return QueryResponse(
            session_id=res.get("session_id"),
            question=res["question"],
            answer=res["answer"],
            context=res["context"],
            sources=res["sources"],
            response_time_sec=res.get("response_time_sec")
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Error handling query endpoint: {e}")
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
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR]: {str(e)}\n\n"

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


@app.get("/admin/queries/feed", tags=["Administration"])
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


@app.get("/admin/analytics", tags=["Administration"])
def admin_analytics_endpoint():
    """
    Returns query execution metrics, cache hit rate, and feedback analytics.
    """
    return db_manager.get_analytics_summary()


@app.get("/admin/history/{session_id}", tags=["Administration"])
def admin_history_endpoint(session_id: str):
    """
    Retrieves past session messages for a given session_id.
    """
    history = memory_manager.get_history(session_id, limit=50)
    return {"session_id": session_id, "messages": history}


@app.post("/rebuild", response_model=RebuildResponse, tags=["Database Administration"])
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


@app.post("/admin/upload", response_model=DocumentUploadResponse, tags=["Administration"])
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
        res = pipeline.ingest_uploaded_document(
            file_bytes=content,
            filename=file.filename or "uploaded_file.pdf",
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


@app.get("/admin/documents/uploaded", tags=["Administration"])
def admin_uploaded_documents_endpoint():
    """
    Returns list of all uploaded documents indexed in the RAG knowledge base.
    """
    docs = db_manager.get_uploaded_documents()
    return {"documents": docs, "count": len(docs)}
