"""
RAG Pipeline Orchestrator. Integrates document loading, Chroma vector storage,
Hybrid BM25 + Vector retrieval, query normalization, conversation memory,
response caching, prompt formatting, and Ollama LLM generation.
"""

import time
import uuid
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
from app.analytics.database import db_manager
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

        # 1. Normalize Query & Spell Check
        norm_question = query_processor.normalize_query(question)

        # 2. Check Cache
        if use_cache:
            cached_res = response_cache.get(norm_question, k, strict_prompt)
            if cached_res:
                elapsed = round(time.time() - start_time, 3)
                db_manager.log_query(active_session, question, norm_question, cached_res if isinstance(cached_res, str) else cached_res.get("answer", ""), elapsed, k, cached=True)
                return cached_res

        # 3. Retrieve Memory History & Rewrite Query if needed
        history = memory_manager.get_history(active_session)
        rewritten_question = query_processor.rewrite_query_with_history(norm_question, history)

        logger.info(f"Processing query: '{question}' (norm: '{rewritten_question}', k={k}, hybrid={use_hybrid})")

        # 4. Retrieve matching documents (Hybrid Search)
        retrieved_docs: List[Document] = self.retriever.retrieve(rewritten_question, k=k, use_hybrid=use_hybrid)

        # 5. Concatenate retrieved context
        context = self.retriever.concatenate_context(retrieved_docs)

        # Append memory history context if multi-turn
        history_context = memory_manager.format_history_as_context(history)
        if history_context:
            context = f"=== CONVERSATION HISTORY ===\n{history_context}\n\n=== RETRIEVED KNOWLEDGE BASE ===\n{context}"

        # 6. Build prompt
        if strict_prompt:
            prompt = PromptBuilder.build_strict_prompt(context, rewritten_question)
        else:
            prompt = PromptBuilder.build_flexible_prompt(context, rewritten_question)

        # 7. Invoke LLM
        response = self.llm.invoke(prompt)
        raw_answer = response.content
        answer = self.sanitize_response(raw_answer)

        elapsed_time = round(time.time() - start_time, 3)
        logger.info(f"Successfully generated response from Ollama in {elapsed_time}s.")

        # 8. Enrich Response with Campus Fact & Clickable Suggested Questions
        enrichment = response_enrichment_engine.enrich_response(question, answer, active_session)
        full_enriched_text = enrichment["full_enriched_text"]

        # Save to memory & database
        memory_manager.add_user_message(active_session, question)
        memory_manager.add_assistant_message(active_session, full_enriched_text)

        sources = [
            {
                "source": doc.metadata.get("source", "Unknown"),
                "doc_type": doc.metadata.get("doc_type", "Document"),
                "content_snippet": doc.page_content[:200]
            }
            for doc in retrieved_docs
        ]

        db_manager.log_query(active_session, question, norm_question, full_enriched_text, elapsed_time, len(sources), cached=False)

        result_payload = {
            "session_id": active_session,
            "question": question,
            "answer": full_enriched_text,
            "direct_answer": answer,
            "full_enriched_text": full_enriched_text,
            "campus_fact": enrichment["campus_fact"],
            "suggested_questions": enrichment["suggested_questions"],
            "context": context,
            "sources": sources,
            "response_time_sec": elapsed_time
        }

        # Save to cache
        if use_cache:
            response_cache.put(norm_question, k, strict_prompt, result_payload if return_sources else full_enriched_text)

        if return_sources:
            return result_payload

        return full_enriched_text

    @staticmethod
    def sanitize_response(text: str) -> str:
        """Sanitizes any stray developer or RAG terminology into official university phrasing."""
        if not text:
            return text

        import re
        replacements = [
            (r"(?i)based on the provided context,?\s*", "According to official CSJMU records, "),
            (r"(?i)based on the context,?\s*", "According to official CSJMU records, "),
            (r"(?i)according to the provided context,?\s*", "According to official CSJMU records, "),
            (r"(?i)according to the context,?\s*", "According to official CSJMU records, "),
            (r"(?i)the provided context does not mention\b", "the currently indexed official university documents do not specify"),
            (r"(?i)the context does not mention\b", "the currently indexed official university documents do not specify"),
            (r"(?i)the retrieved documents do not mention\b", "the currently indexed official university documents do not specify"),
            (r"(?i)the retrieved context does not contain\b", "the currently indexed official university documents do not specify"),
            (r"(?i)in the provided documents,?\s*", "in official university records, "),
            (r"(?i)this information is not available in the provided documents\.?", "The currently indexed official university documents do not specify this information."),
            (r"(?i)there is no context provided\b", "The currently indexed official university documents do not specify this information."),
            (r"(?i)there is no information in the context\b", "The currently indexed official university documents do not specify this information."),
        ]

        sanitized = text
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
        norm_question = query_processor.normalize_query(question)
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


# Global pipeline helper function
_pipeline_instance: Optional[RAGPipeline] = None


def ask(question: str, k: int = config.DEFAULT_K, strict_prompt: bool = True) -> str:
    """Global ask(question) helper function."""
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = RAGPipeline()
    return _pipeline_instance.ask(question, k=k, strict_prompt=strict_prompt)
