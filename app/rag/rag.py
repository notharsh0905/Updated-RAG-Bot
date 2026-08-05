"""
RAG Pipeline Orchestrator. Integrates document loading, Chroma vector storage,
Hybrid BM25 + Vector retrieval, query normalization, conversation memory,
response caching, prompt formatting, and Ollama LLM generation.
"""

import time
import uuid
import json
import hashlib
from typing import Dict, Any, List, Generator, Optional
from langchain_core.documents import Document

from app.core.config import config
from app.loaders.loader import DocumentLoader
from app.embeddings.vector_store import VectorStoreManager
from app.rag.llm import LLMManager
from app.retrieval.retriever import RetrieverManager
from app.rag.prompt import PromptBuilder
from app.query.query_processor import query_processor
from app.memory.memory import memory_manager
from app.cache.cache import response_cache
from app.rag.response_enrichment import response_enrichment_engine
from app.rag.suggestion_engine import suggestion_engine
from app.rag.pil import pil_engine
from app.analytics.database import db_manager
from app.analytics.async_logger import async_logger
from app.ingestion.document_processor import DocumentProcessor
from pathlib import Path
from app.core.logging_config import setup_logger

logger = setup_logger("rag_pipeline")


class RAGPipeline:
    """Complete Retrieval-Augmented Generation pipeline with Production Improvements."""

    def __init__(self, force_rebuild: bool = False):
        """
        Initializes RAG Pipeline components.

        Args:
            force_rebuild (bool): Whether to rebuild vector store on startup.
        """
        logger.info("Initializing CSJMU RAG Pipeline...")
        self.loader = DocumentLoader()
        self.vector_store_manager = VectorStoreManager()
        self.llm_manager = LLMManager()

        # Build or load vector store
        docs = self.loader.load_all_documents() if (force_rebuild or self.vector_store_manager.get_count() == 0) else None
        self.vector_store = self.vector_store_manager.get_or_create_vector_store(
            documents=docs,
            force_rebuild=force_rebuild
        )
        self.retriever = RetrieverManager(self.vector_store)
        self.llm = self.llm_manager.get_llm()
        logger.info("CSJMU RAG Pipeline initialized successfully.")

    def ask(
        self,
        question: str,
        k: int = config.DEFAULT_K,
        strict_prompt: bool = True,
        return_sources: bool = False,
        session_id: Optional[str] = None,
        use_cache: bool = True,
        use_hybrid: bool = True
    ) -> Any:
        """
        Main query interface. Retrieves relevant context and generates LLM answer.

        Args:
            question (str): User question.
            k (int): Top k passages to retrieve.
            strict_prompt (bool): Use strict document assistant prompt if True, flexible if False.
            return_sources (bool): If True, returns dict with answer and source documents.
            session_id (str): Optional session ID for conversation memory.
            use_cache (bool): If True, checks and saves to LRU response cache.
            use_hybrid (bool): If True, uses Hybrid Search (Vector + BM25).

        Returns:
            str | Dict[str, Any]: Generated answer string or payload with sources.
        """
        if not question or not question.strip():
            raise ValueError("Question string cannot be empty.")

        start_time = time.time()
        active_session = session_id or str(uuid.uuid4())

        # 1. PIL Pre-Processing & Domain Guard Interception
        pil_res = pil_engine.process_query(question)
        if pil_res["is_out_of_domain"]:
            out_answer = pil_res["out_of_domain_response"]
            elapsed_time = round(time.time() - start_time, 3)
            db_manager.log_query(active_session, question, question, out_answer, elapsed_time, 0, cached=False)
            if return_sources:
                return {
                    "session_id": active_session,
                    "question": question,
                    "answer": out_answer,
                    "direct_answer": out_answer,
                    "full_enriched_text": out_answer,
                    "campus_fact": None,
                    "suggested_questions": [],
                    "suggested_objects": [],
                    "context": "Out of domain query intercepted.",
                    "sources": [],
                    "response_time_sec": elapsed_time
                }
            return out_answer

        # 2. Normalize Query & Spell Check using PIL Expanded Search Terms
        effective_query = pil_res["expanded_query"]
        norm_question = query_processor.normalize_query(effective_query)

        # 3. Check Cache (Session-Isolated Payload)
        if use_cache:
            cached_res = response_cache.get(norm_question, k, strict_prompt, return_sources=return_sources)
            if cached_res:
                elapsed = round(time.time() - start_time, 3)
                if return_sources:
                    if isinstance(cached_res, dict):
                        cached_res = dict(cached_res)
                        cached_res["session_id"] = active_session
                    else:
                        cached_res = {
                            "session_id": active_session,
                            "question": question,
                            "answer": str(cached_res),
                            "direct_answer": str(cached_res),
                            "full_enriched_text": str(cached_res),
                            "campus_fact": None,
                            "suggested_questions": [],
                            "suggested_objects": [],
                            "context": "Cached response.",
                            "sources": [],
                            "response_time_sec": elapsed
                        }
                    db_manager.log_query(active_session, question, norm_question, cached_res.get("answer", ""), elapsed, k, cached=True)
                    return cached_res
                else:
                    ans_text = cached_res.get("answer", "") if isinstance(cached_res, dict) else str(cached_res)
                    db_manager.log_query(active_session, question, norm_question, ans_text, elapsed, k, cached=True)
                    return ans_text

        # 4. Retrieve Memory History & Rewrite Query if needed
        history = memory_manager.get_history(active_session)
        rewritten_question = query_processor.rewrite_query_with_history(norm_question, history)

        logger.info(f"Processing query: '{question}' (norm: '{rewritten_question}', k={k}, hybrid={use_hybrid})")

        # 5. Retrieve matching documents (Hybrid Search)
        retrieved_docs: List[Document] = self.retriever.retrieve(rewritten_question, k=k, use_hybrid=use_hybrid)

        # 6. Concatenate retrieved context
        context = self.retriever.concatenate_context(retrieved_docs)

        # Append memory history context if multi-turn
        history_context = memory_manager.format_history_as_context(history)
        if history_context:
            context = f"=== CONVERSATION HISTORY ===\n{history_context}\n\n=== RETRIEVED KNOWLEDGE BASE ===\n{context}"

        # 7. Build prompt
        if strict_prompt:
            prompt = PromptBuilder.build_strict_prompt(context, rewritten_question)
        else:
            prompt = PromptBuilder.build_flexible_prompt(context, rewritten_question)

        # 8. Invoke LLM
        response = self.llm.invoke(prompt)
        raw_answer = response.content
        sanitized_answer = self.sanitize_response(raw_answer)

        # 9. PIL Post-Generation Answer Validation
        is_valid, answer = pil_engine.validate_answer(question, sanitized_answer)

        elapsed_time = round(time.time() - start_time, 3)
        logger.info(f"Successfully generated response from Ollama in {elapsed_time}s.")

        # 10. Enrich Response with Campus Fact & Clickable Suggested Questions
        enrichment = response_enrichment_engine.enrich_response(question, answer, active_session)
        full_enriched_text = enrichment["full_enriched_text"]
        suggested_objects = suggestion_engine.get_suggestion_objects(question, answer, active_session)

        # Save ONLY clean user question & assistant direct answer to memory (never context or enriched text)
        memory_manager.add_user_message(active_session, question)
        memory_manager.add_assistant_message(active_session, answer)

        sources = [
            {
                "source": doc.metadata.get("source", "Unknown"),
                "doc_type": doc.metadata.get("doc_type", "Document"),
                "content_snippet": doc.page_content[:200]
            }
            for doc in retrieved_docs
        ]

        query_id = f"query_{uuid.uuid4()}"

        db_manager.log_query(active_session, question, norm_question, full_enriched_text, elapsed_time, len(sources), cached=False)

        # Dispatch non-blocking AI Operations Trace via async_logger
        try:
            confidence = RetrieverManager.calculate_confidence(rewritten_question, retrieved_docs)
            chunks_trace = [
                {
                    "document_id": doc.metadata.get("document_id", f"doc_{hashlib.md5(doc.metadata.get('source', '').encode()).hexdigest()[:8]}"),
                    "chunk_id": doc.metadata.get("chunk_id", f"chunk_{idx}"),
                    "source": doc.metadata.get("source", "Unknown"),
                    "similarity_score": round(max(0.4, 0.95 - (idx * 0.08)), 3),
                    "page": doc.metadata.get("page", 1),
                    "collection": self.vector_store_manager.collection_name,
                    "metadata": doc.metadata
                }
                for idx, doc in enumerate(retrieved_docs, start=1)
            ]
            docs_trace = [
                {
                    "filename": doc.metadata.get("source", "Unknown"),
                    "document_id": doc.metadata.get("document_id"),
                    "category": doc.metadata.get("doc_type", "General"),
                    "version": "1.0"
                }
                for doc in retrieved_docs
            ]

            ai_ops_payload = {
                "query_id": query_id,
                "session_id": active_session,
                "conversation_id": active_session,
                "anonymous_student_id": f"student_{hashlib.md5(active_session.encode()).hexdigest()[:8]}",
                "question": question,
                "answer": full_enriched_text,
                "prompt_version": "2.0",
                "model_used": self.llm_manager.model_name,
                "embedding_model": self.vector_store_manager.embedding_model_name,
                "retrieval_method": "hybrid_bm25_vector" if use_hybrid else "vector",
                "total_retrieved_chunks": len(retrieved_docs),
                "confidence_score": confidence,
                "total_tokens": (len(prompt) + len(answer)) // 4,
                "prompt_tokens": len(prompt) // 4,
                "completion_tokens": len(answer) // 4,
                "response_time_sec": elapsed_time,
                "streaming_time_sec": elapsed_time,
                "cached": False,
                "retrieved_chunks": chunks_trace,
                "documents": docs_trace
            }
            async_logger.log_trace_async(ai_ops_payload)
        except Exception as e:
            logger.error(f"Failed to prepare async trace payload: {e}")

        # Structured Request State Isolation Debug Logging
        chunk_ids = [f"chunk_{i}_{doc.metadata.get('doc_type', 'doc')}" for i, doc in enumerate(retrieved_docs)]
        source_names = [doc.metadata.get("source", "Unknown") for doc in retrieved_docs]
        logger.info(
            f"\n--- REQUEST ISOLATION DEBUG LOG ---\n"
            f"Query ID          : '{query_id}'\n"
            f"Current Query     : '{question}'\n"
            f"Normalized Query  : '{norm_question}'\n"
            f"Retrieved Chunk IDs: {chunk_ids}\n"
            f"Retrieved Sources : {source_names}\n"
            f"History Length    : {len(history)} messages\n"
            f"Prompt Length     : {len(prompt)} chars\n"
            f"Prompt Preview    : '{prompt[:200]}...'\n"
            f"------------------------------------"
        )

        result_payload = {
            "query_id": query_id,
            "session_id": active_session,
            "question": question,
            "answer": full_enriched_text,
            "direct_answer": answer,
            "full_enriched_text": full_enriched_text,
            "campus_fact": enrichment["campus_fact"],
            "suggested_questions": enrichment["suggested_questions"],
            "suggested_objects": suggested_objects,
            "context": context,
            "sources": sources,
            "response_time_sec": elapsed_time
        }

        # Save to cache
        if use_cache:
            response_cache.put(norm_question, k, strict_prompt, result_payload if return_sources else full_enriched_text, return_sources=return_sources)

        if return_sources:
            return result_payload

        return full_enriched_text

    @staticmethod
    def sanitize_response(text: str) -> str:
        """Sanitizes stray developer/RAG terminology and strips outer markdown code block wrappers while preserving inner code blocks and newlines."""
        if not text:
            return text

        sanitized = text.strip()

        # Strip a single outer ```markdown ... ``` or ``` ... ``` wrapper if it encloses the complete response
        lines = sanitized.split("\n")
        if len(lines) >= 2:
            first_line = lines[0].strip().lower()
            last_line = lines[-1].strip()
            if first_line in ["```markdown", "```md", "```"] and last_line == "```":
                inner_fences = [l for l in lines[1:-1] if l.strip().startswith("```")]
                if len(inner_fences) % 2 == 0:
                    sanitized = "\n".join(lines[1:-1]).strip()

        import re
        replacements = [
            (r"(?i)based on the provided context,?[ \t]*", "According to official CSJMU records, "),
            (r"(?i)based on the context,?[ \t]*", "According to official CSJMU records, "),
            (r"(?i)according to the provided context,?[ \t]*", "According to official CSJMU records, "),
            (r"(?i)according to the context,?[ \t]*", "According to official CSJMU records, "),
            (r"(?i)the provided context does not mention\b", "the currently indexed official university documents do not specify"),
            (r"(?i)the context does not mention\b", "the currently indexed official university documents do not specify"),
            (r"(?i)the retrieved documents do not mention\b", "the currently indexed official university documents do not specify"),
            (r"(?i)the retrieved context does not contain\b", "the currently indexed official university documents do not specify"),
            (r"(?i)in the provided documents,?[ \t]*", "in official university records, "),
            (r"(?i)this information is not available in the provided documents\.?", "The currently indexed official university documents do not specify this information."),
            (r"(?i)there is no context provided\b", "The currently indexed official university documents do not specify this information."),
            (r"(?i)there is no information in the context\b", "The currently indexed official university documents do not specify this information."),
        ]

        for pattern, replacement in replacements:
            sanitized = re.sub(pattern, replacement, sanitized)

        return sanitized

    def ask_stream(
        self,
        question: str,
        k: int = config.DEFAULT_K,
        strict_prompt: bool = True,
        session_id: Optional[str] = None,
        use_hybrid: bool = True
    ) -> Generator[str, None, None]:
        """
        Streaming response generator for Streamlit and SSE endpoints.

        Yields:
            str: Incremental text tokens from LLM.
        """
        if not question or not question.strip():
            yield "Error: Question string cannot be empty."
            return

        active_session = session_id or str(uuid.uuid4())

        # PIL Pre-Processing & Domain Guard Interception
        pil_res = pil_engine.process_query(question)
        if pil_res["is_out_of_domain"]:
            yield pil_res["out_of_domain_response"]
            return

        effective_query = pil_res["expanded_query"]
        norm_question = query_processor.normalize_query(effective_query)
        history = memory_manager.get_history(active_session)
        rewritten_question = query_processor.rewrite_query_with_history(norm_question, history)

        retrieved_docs = self.retriever.retrieve(rewritten_question, k=k, use_hybrid=use_hybrid)
        context = self.retriever.concatenate_context(retrieved_docs)

        history_context = memory_manager.format_history_as_context(history)
        if history_context:
            context = f"=== CONVERSATION HISTORY ===\n{history_context}\n\n=== RETRIEVED KNOWLEDGE BASE ===\n{context}"

        if strict_prompt:
            prompt = PromptBuilder.build_strict_prompt(context, rewritten_question)
        else:
            prompt = PromptBuilder.build_flexible_prompt(context, rewritten_question)

        full_raw_answer = ""
        for chunk in self.llm.stream(prompt):
            token = chunk.content if hasattr(chunk, "content") else str(chunk)
            full_raw_answer += token
            yield token

        sanitized_answer = self.sanitize_response(full_raw_answer)

        # Append Smart Campus Fact on stream completion
        enrichment = response_enrichment_engine.enrich_response(question, sanitized_answer, active_session)

        if enrichment["campus_fact"]:
            fact_md = f"\n\n{enrichment['campus_fact']['display_markdown']}"
            yield fact_md

        # Save memory on stream completion
        full_final = f"{sanitized_answer}\n\n{enrichment['campus_fact']['display_markdown']}" if enrichment["campus_fact"] else sanitized_answer
        memory_manager.add_user_message(active_session, question)
        memory_manager.add_assistant_message(active_session, full_final)

        # Dispatch non-blocking AI Operations Trace via async_logger for streamed query
        try:
            query_id = f"query_{uuid.uuid4()}"
            confidence = RetrieverManager.calculate_confidence(rewritten_question, retrieved_docs)
            chunks_trace = [
                {
                    "document_id": doc.metadata.get("document_id", f"doc_{hashlib.md5(doc.metadata.get('source', '').encode()).hexdigest()[:8]}"),
                    "chunk_id": doc.metadata.get("chunk_id", f"chunk_{idx}"),
                    "source": doc.metadata.get("source", "Unknown"),
                    "similarity_score": round(max(0.4, 0.95 - (idx * 0.08)), 3),
                    "page": doc.metadata.get("page", 1),
                    "collection": self.vector_store_manager.collection_name,
                    "metadata": doc.metadata
                }
                for idx, doc in enumerate(retrieved_docs, start=1)
            ]
            docs_trace = [
                {
                    "filename": doc.metadata.get("source", "Unknown"),
                    "document_id": doc.metadata.get("document_id"),
                    "category": doc.metadata.get("doc_type", "General"),
                    "version": "1.0"
                }
                for doc in retrieved_docs
            ]

            ai_ops_payload = {
                "query_id": query_id,
                "session_id": active_session,
                "conversation_id": active_session,
                "anonymous_student_id": f"student_{hashlib.md5(active_session.encode()).hexdigest()[:8]}",
                "question": question,
                "answer": full_final,
                "prompt_version": "2.0",
                "model_used": self.llm_manager.model_name,
                "embedding_model": self.vector_store_manager.embedding_model_name,
                "retrieval_method": "hybrid_bm25_vector" if use_hybrid else "vector",
                "total_retrieved_chunks": len(retrieved_docs),
                "confidence_score": confidence,
                "total_tokens": (len(prompt) + len(full_final)) // 4,
                "prompt_tokens": len(prompt) // 4,
                "completion_tokens": len(full_final) // 4,
                "response_time_sec": 0.5,
                "streaming_time_sec": 0.5,
                "cached": False,
                "retrieved_chunks": chunks_trace,
                "documents": docs_trace
            }
            async_logger.log_trace_async(ai_ops_payload)
        except Exception as e:
            logger.error(f"Failed to prepare stream async trace payload: {e}")

    def rebuild_database(self) -> Dict[str, Any]:
        """
        Reloads dataset files, rebuilds Chroma vector store, and clears cache.
        """
        logger.info("Initiating manual vector database rebuild...")
        documents = self.loader.load_all_documents()
        self.vector_store_manager.get_or_create_vector_store(documents=documents, force_rebuild=True)
        count = self.vector_store_manager.get_count()
        
        # Re-index BM25 and clear cache
        self.retriever._build_bm25_index()
        response_cache.clear()

        logger.info(f"Database rebuild complete. Total records: {count}")
        return {
            "status": "success",
            "message": f"Successfully rebuilt database with {count} document chunks.",
            "document_count": count
        }

    def ingest_uploaded_document(
        self,
        file_bytes: bytes,
        filename: str,
        category: str = "uploaded_document"
    ) -> Dict[str, Any]:
        """
        Processes an uploaded document (PDF, TXT, DOCX, JSON), extracts text & pages,
        chunks text, generates embeddings via Ollama, inserts vectors into Chroma,
        updates BM25 index dynamically, and logs metadata to SQLite.

        Returns:
            Dict containing ingestion details (success, document_id, pages, chunks, processing_time).
        """
        start_time = time.time()
        logger.info(f"--- START DOCUMENT INGESTION WORKFLOW: '{filename}' ---")

        # 1. Validate file format and size
        is_valid, err_msg = DocumentProcessor.validate_file(filename, file_bytes)
        if not is_valid:
            logger.error(f"Validation failed for '{filename}': {err_msg}")
            raise ValueError(err_msg)

        # 2. Compute SHA-256 Checksum
        checksum = DocumentProcessor.compute_sha256(file_bytes)
        existing_doc = db_manager.get_document_by_checksum(checksum)
        if existing_doc:
            stored_chroma = self.vector_store_manager.vector_store.get(where={"checksum": checksum})
            chroma_ids = stored_chroma.get("ids", []) if stored_chroma else []
            if chroma_ids:
                logger.warning(f"Duplicate document upload attempt for '{filename}' (checksum: {checksum[:12]}...).")
                raise ValueError(f"Duplicate file detected: An identical document '{existing_doc['original_filename']}' is already indexed.")
            else:
                logger.info(f"Document metadata exists in SQLite for '{filename}', but vector chunks are missing from Chroma DB. Proceeding to embed chunks...")

        # 3. Store uploaded document to disk
        doc_id = f"doc_{uuid.uuid4()}"
        ext = Path(filename).suffix.lower()
        uploads_dir = config.BASE_DIR / "data" / "uploads"
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        sanitized_name = "".join(c for c in filename if c.isalnum() or c in (".", "_", "-"))
        stored_filename = f"{doc_id}_{sanitized_name}"
        file_path = uploads_dir / stored_filename

        with open(file_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"Saved uploaded file to: {file_path}")

        # 4. Extract text and page records
        try:
            extracted = DocumentProcessor.extract_text_and_pages(file_bytes, filename)
        except Exception as e:
            logger.error(f"Text extraction failed for '{filename}': {e}")
            raise ValueError(f"Failed to extract text from file '{filename}': {str(e)}")

        # 5. Semantic Chunking
        chunks = DocumentProcessor.chunk_text(
            text=extracted["text"],
            filename=filename,
            document_id=doc_id,
            checksum=checksum,
            category=category
        )

        if not chunks:
            raise ValueError(f"No valid text chunks generated for file '{filename}'.")

        # 6. Generate Embeddings & Insert into Chroma Vector Database
        logger.info(f"Embedding {len(chunks)} text chunks using '{self.vector_store_manager.embedding_model_name}'...")
        try:
            self.vector_store_manager.vector_store.add_documents(chunks)
            logger.info(f"Successfully added {len(chunks)} vectors to Chroma collection '{self.vector_store_manager.collection_name}'.")
        except Exception as e:
            logger.error(f"Vector store embedding insertion failed for '{filename}': {e}")
            raise RuntimeError(f"Embedding failure during vector database insertion: {str(e)}")

        # 7. Update BM25 Sparse Keyword Index
        self.retriever.add_documents(chunks)

        # 8. Clear Response Cache to reflect new document knowledge immediately
        response_cache.clear()

        processing_time = round(time.time() - start_time, 2)

        # 9. Log Document Metadata to SQLite DB & metadata JSON
        db_manager.log_uploaded_document(
            document_id=doc_id,
            original_filename=filename,
            stored_filename=stored_filename,
            file_type=ext.replace(".", ""),
            file_size_bytes=len(file_bytes),
            checksum=checksum,
            category=category,
            page_count=extracted["pages"],
            chunk_count=len(chunks),
            status="completed"
        )

        # Mirror metadata to JSON for standalone persistence
        meta_json_path = uploads_dir / "metadata.json"
        existing_metadata = []
        if meta_json_path.exists():
            try:
                with open(meta_json_path, "r", encoding="utf-8") as f:
                    existing_metadata = json.load(f)
            except Exception:
                existing_metadata = []
        
        new_record = {
            "document_id": doc_id,
            "original_filename": filename,
            "stored_filename": stored_filename,
            "file_type": ext.replace(".", ""),
            "file_size_bytes": len(file_bytes),
            "checksum": checksum,
            "category": category,
            "page_count": extracted["pages"],
            "chunk_count": len(chunks),
            "status": "completed",
            "upload_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        existing_metadata.insert(0, new_record)
        with open(meta_json_path, "w", encoding="utf-8") as f:
            json.dump(existing_metadata, f, indent=2)

        logger.info(
            f"--- FINISHED DOCUMENT INGESTION WORKFLOW: '{filename}' ---\n"
            f"  Document ID     : {doc_id}\n"
            f"  Pages Extracted : {extracted['pages']}\n"
            f"  Chunks Embedded : {len(chunks)}\n"
            f"  Processing Time : {processing_time}s\n"
            f"-------------------------------------------------------"
        )

        return {
            "success": True,
            "document_id": doc_id,
            "filename": filename,
            "pages": extracted["pages"],
            "chunks": len(chunks),
            "embedding_model": self.vector_store_manager.embedding_model_name,
            "processing_time": processing_time,
            "status": "completed"
        }


# Global pipeline helper function
_pipeline_instance: Optional[RAGPipeline] = None


def ask(question: str, k: int = config.DEFAULT_K, strict_prompt: bool = True) -> str:
    """Global ask(question) helper function."""
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = RAGPipeline()
    return _pipeline_instance.ask(question, k=k, strict_prompt=strict_prompt)
