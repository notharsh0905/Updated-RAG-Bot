"""
FastAPI REST API server for CSJMU RAG Application.
Exposes endpoints for health checks, question answering, SSE streaming,
feedback collection, and admin analytics.
"""

from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.rag.rag import RAGPipeline
from app.utils.utils import check_ollama_health, check_dataset_status
from app.analytics.database import db_manager
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
    session_id: Optional[str] = None
    question: str
    answer: str
    rating: int = Field(..., example=1, description="1 for 👍, -1 for 👎")
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
    Server-Sent Events (SSE) streaming query endpoint.
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
    if success:
        return {"status": "success", "message": "Feedback recorded. Thank you!"}
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to record feedback.")


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
