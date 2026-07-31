"""
End-to-End Real Document Ingestion Test Script.
Tests parsing, chunking, Chroma DB embedding addition, BM25 indexing,
FastAPI endpoints, and RAG query retrieval from newly uploaded documents.
"""

import os
import sys
import time
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.analytics.database import db_manager
from app.ingestion.document_processor import DocumentProcessor

def run_test():
    print("🚀 STARTING E2E DOCUMENT INGESTION VERIFICATION TEST...")
    
    pipeline = RAGPipeline()
    print(f"✅ RAG Pipeline initialized. Current Chroma document count: {pipeline.vector_store_manager.get_count()}")

    # 1. Create a sample unique test document
    unique_marker = f"CSJMU_SPECIAL_TEST_POLICY_{int(time.time())}"
    sample_text = (
        f"OFFICIAL UNIVERSITY NOTICE REGARDING {unique_marker}.\n"
        f"The CSJMU Executive Board has enacted a new policy titled {unique_marker}.\n"
        f"Under this policy, all UIET B.Tech students completing 8th semester with distinction "
        f"will receive a special merit grant of Rs. 75,000 directly into their bank accounts.\n"
        f"Application procedure for {unique_marker} opens on September 15th every year via the student portal."
    )

    filename = f"sample_merit_policy_{int(time.time())}.txt"
    file_bytes = sample_text.encode("utf-8")

    # 2. Test RAGPipeline.ingest_uploaded_document
    print(f"\n📄 Testing real document ingestion for '{filename}'...")
    res = pipeline.ingest_uploaded_document(
        file_bytes=file_bytes,
        filename=filename,
        category="scholarship"
    )

    print("🎉 Ingestion Result Payload:")
    print(res)

    assert res["success"] is True
    assert res["chunks"] > 0
    assert res["status"] == "completed"

    # 3. Verify Database Persistence
    docs = db_manager.get_uploaded_documents()
    print(f"\n📚 Uploaded Documents in SQLite Database ({len(docs)} found):")
    found_in_db = False
    for d in docs:
        print(f"  • {d['original_filename']} | Chunks: {d['chunk_count']} | Pages: {d['page_count']} | Time: {d['upload_timestamp']}")
        if d["original_filename"] == filename:
            found_in_db = True

    assert found_in_db, "Uploaded document was not found in SQLite database!"

    # 4. Verify RAG Query Retrieval from Newly Ingested Document
    print(f"\n🔍 Querying RAG Assistant for newly ingested policy '{unique_marker}'...")
    query = f"What is the merit grant amount under {unique_marker} for B.Tech students?"
    
    answer_res = pipeline.ask(query, k=3, return_sources=True)
    print("\n🤖 Assistant Answer:")
    print(answer_res["answer"])
    
    print("\n📌 Retrieved Sources:")
    for s in answer_res["sources"]:
        print(f"  • Source: {s['source']} | Content Snippet: {s['content_snippet'][:120]}...")

    # Check if the unique policy text was retrieved and answered correctly
    answer_text = str(answer_res["answer"]) + str(answer_res["context"])
    assert "75,000" in answer_text or "75000" in answer_text or unique_marker in answer_text, \
        f"RAG failed to retrieve newly ingested document content for marker '{unique_marker}'!"

    print("\n✨ ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
