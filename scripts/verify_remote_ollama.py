"""
Deployment & Remote Ollama Verification Script.
Validates remote DGX Ollama connectivity, model execution, ChromaDB retrieval,
RAG question answering, document upload / knowledge injection, and health endpoint status.
"""

import sys
import time
import requests
from pathlib import Path

from app.core.config import config
from app.rag.providers import OllamaProvider
from app.embeddings.embedding_service import EmbeddingService
from app.embeddings.vector_store import VectorStoreManager
from app.rag.rag import RAGPipeline
from app.utils.utils import check_ollama_health, check_llm_health, check_embedding_health


def main():
    print("=" * 60)
    print("🚀 PRODUCTION DEPLOYMENT & REMOTE OLLAMA VERIFICATION")
    print("=" * 60)

    # 1. Config Verification
    print(f"\n1. Target Configuration:")
    print(f"   - LLM_PROVIDER       : {config.LLM_PROVIDER}")
    print(f"   - EMBEDDING_PROVIDER : {config.EMBEDDING_PROVIDER}")
    print(f"   - OLLAMA_BASE_URL    : {config.OLLAMA_BASE_URL}")
    print(f"   - LLM_MODEL          : {config.get_active_model_name()}")
    print(f"   - EMBEDDING_MODEL    : {config.get_active_embedding_model_name()}")
    print(f"   - COLLECTION_NAME    : {config.get_effective_collection_name()}")

    # 2. Remote Ollama Network & API Check
    print("\n2. Checking Remote Ollama Endpoint...")
    ollama_health = check_ollama_health()
    if not ollama_health.get("connected"):
        print(f"❌ FAIL: Cannot connect to Ollama at {config.OLLAMA_BASE_URL}: {ollama_health.get('error')}")
        sys.exit(1)
    print(f"✅ PASS: Remote Ollama reachable. Available models: {ollama_health.get('models')}")

    # 3. LLM Response Generation (llama3.1:8b)
    print("\n3. Testing LLM Response Generation (llama3.1:8b)...")
    try:
        ollama_llm = OllamaProvider(model_name=config.get_active_model_name(), base_url=config.OLLAMA_BASE_URL)
        res = ollama_llm.invoke("Answer in 5 words: What is UIET Kanpur?")
        llm_text = str(res).strip()
        print(f"   Response Preview: '{llm_text}'")
        if not llm_text or "unable to generate" in llm_text.lower():
            print("❌ FAIL: LLM response generation failed.")
            sys.exit(1)
        print("✅ PASS: llama3.1:8b successfully generated response.")
    except Exception as e:
        print(f"❌ FAIL: LLM generation error: {e}")
        sys.exit(1)

    # 4. Embedding Generation (nomic-embed-text:latest)
    print("\n4. Testing Embedding Generation (nomic-embed-text:latest)...")
    try:
        emb_service = EmbeddingService(provider="ollama", model_name=config.get_active_embedding_model_name(), ollama_url=config.OLLAMA_BASE_URL)
        vec = emb_service.embed_query("CSJMU UIET Kanpur Admission Guidelines")
        print(f"   Vector Dimension: {len(vec)}")
        if not vec or len(vec) != 768:
            print(f"❌ FAIL: Unexpected vector dimension {len(vec)} (expected 768).")
            sys.exit(1)
        print("✅ PASS: nomic-embed-text:latest successfully generated 768-dim embeddings.")
    except Exception as e:
        print(f"❌ FAIL: Embedding generation error: {e}")
        sys.exit(1)

    # 5. ChromaDB Initialization & Retrieval
    print("\n5. Checking ChromaDB Vector Store Initialization...")
    try:
        vsm = VectorStoreManager(embedding_service=emb_service)
        doc_count = vsm.get_count()
        print(f"   ChromaDB Collection: '{vsm.collection_name}' | Document Chunks: {doc_count}")
        if doc_count == 0:
            print("❌ FAIL: ChromaDB collection is empty.")
            sys.exit(1)
        print(f"✅ PASS: ChromaDB successfully initialized with {doc_count} documents.")
    except Exception as e:
        print(f"❌ FAIL: ChromaDB initialization error: {e}")
        sys.exit(1)

    # 6. RAG End-to-End Query Verification
    print("\n6. Testing End-to-End Student RAG Question...")
    test_question = "who is director of uiet"
    print(f"   Question: '{test_question}'")
    try:
        pipeline = RAGPipeline()
        rag_res = pipeline.ask(test_question, return_sources=True)
        ans_text = rag_res.get("answer", "")
        sources = rag_res.get("sources", [])
        print(f"   RAG Answer: {ans_text[:250]}...")
        print(f"   Retrieved Chunks: {len(sources)}")
        if not ans_text or len(ans_text) < 10:
            print("❌ FAIL: RAG query returned an empty or invalid answer.")
            sys.exit(1)
        print("✅ PASS: End-to-end RAG query executed successfully.")
    except Exception as e:
        print(f"❌ FAIL: RAG query execution error: {e}")
        sys.exit(1)

    # 7. Knowledge Injection / Document Upload Verification
    print("\n7. Testing Knowledge Injection (Document Upload & Ingestion)...")
    sample_filename = f"test_doc_injection_{int(time.time())}.txt"
    sample_content = (
        f"OFFICIAL ANNOUNCEMENT FOR UIET CSJMU PRODUCTION TEST {int(time.time())}.\n"
        f"Special Chancellor award recipient for excellence in AI research is Dr. Autonomous Test Bot."
    ).encode("utf-8")
    try:
        ingest_res = pipeline.ingest_uploaded_document(
            file_bytes=sample_content,
            filename=sample_filename,
            category="test_uploads"
        )
        print(f"   Ingested Doc ID : {ingest_res.get('document_id')}")
        print(f"   Chunks Embedded : {ingest_res.get('chunks')}")
        print(f"   Processing Time : {ingest_res.get('processing_time')}s")
        if not ingest_res.get("success"):
            print("❌ FAIL: Knowledge injection failed.")
            sys.exit(1)
        print("✅ PASS: Knowledge injection / document upload succeeded.")
    except Exception as e:
        print(f"❌ FAIL: Knowledge injection error: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("🎉 ALL PRODUCTION VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    main()
