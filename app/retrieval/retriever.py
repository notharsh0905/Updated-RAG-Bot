"""
Retriever module for CSJMU RAG Application.
Implements Hybrid Search (Dense Chroma Vector Similarity + Sparse BM25 Keyword Search)
with Reciprocal Rank Fusion (RRF) and Context Filtering.
"""

import re
from typing import List, Dict, Any, Set
from langchain_core.documents import Document
from langchain_chroma import Chroma
from rank_bm25 import BM25Okapi

from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("retriever")


class RetrieverManager:
    """Manages Hybrid Retrieval (Vector + BM25) and context concatenation."""

    def __init__(self, vector_store: Chroma):
        """
        Initializes RetrieverManager and indexes corpus for BM25 keyword search.

        Args:
            vector_store (Chroma): Active Chroma vector store instance.
        """
        self.vector_store = vector_store
        self.bm25: BM25Okapi = None
        self.corpus_docs: List[Document] = []
        self._build_bm25_index()

    def _build_bm25_index(self):
        """Fetches all stored document chunks from Chroma to construct BM25 index."""
        try:
            stored_data = self.vector_store.get()
            texts = stored_data.get("documents", [])
            metadatas = stored_data.get("metadatas", [])

            if not texts:
                logger.warning("Vector store is empty. BM25 index skipping.")
                return

            self.corpus_docs = []
            tokenized_corpus = []
            for i, text in enumerate(texts):
                meta = metadatas[i] if i < len(metadatas) else {}
                doc = Document(page_content=text, metadata=meta)
                self.corpus_docs.append(doc)
                
                # Tokenize for BM25
                tokens = re.findall(r'\w+', text.lower())
                tokenized_corpus.append(tokens)

            self.bm25 = BM25Okapi(tokenized_corpus)
            logger.info(f"Built BM25 index across {len(self.corpus_docs)} document chunks.")
        except Exception as e:
            logger.error(f"Failed to build BM25 index: {e}")

    def retrieve_vector(self, query: str, k: int = config.DEFAULT_K) -> List[Document]:
        """Performs dense vector similarity search."""
        return self.vector_store.similarity_search(query, k=k)

    def retrieve_bm25(self, query: str, k: int = config.DEFAULT_K) -> List[Document]:
        """Performs BM25 keyword search."""
        if not self.bm25 or not self.corpus_docs:
            return []
        
        query_tokens = re.findall(r'\w+', query.lower())
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
        return [self.corpus_docs[idx] for idx in top_indices if scores[idx] > 0]

    def retrieve(self, query: str, k: int = config.DEFAULT_K, use_hybrid: bool = True) -> List[Document]:
        """
        Performs Hybrid Search using Reciprocal Rank Fusion (RRF) combining Vector and BM25 search.

        Args:
            query (str): User query string.
            k (int): Number of top documents to return.
            use_hybrid (bool): If True, uses Hybrid Vector + BM25, else Vector only.

        Returns:
            List[Document]: Top relevant unique documents.
        """
        if not use_hybrid:
            return self.retrieve_vector(query, k=k)

        vector_docs = self.retrieve_vector(query, k=k)
        bm25_docs = self.retrieve_bm25(query, k=k)

        # Reciprocal Rank Fusion (RRF) algorithm
        rrf_scores: Dict[str, float] = {}
        doc_map: Dict[str, Document] = {}

        def add_rrf(doc_list: List[Document], weight: float = 1.0):
            for rank, doc in enumerate(doc_list):
                # Unique hash key per doc
                doc_key = doc.page_content[:150]
                doc_map[doc_key] = doc
                score = weight * (1.0 / (60 + rank))
                rrf_scores[doc_key] = rrf_scores.get(doc_key, 0.0) + score

        add_rrf(vector_docs, weight=1.0)
        add_rrf(bm25_docs, weight=0.8)

        # Sort docs by final RRF score
        sorted_keys = sorted(rrf_scores.keys(), key=lambda key: rrf_scores[key], reverse=True)
        final_docs = [doc_map[key] for key in sorted_keys[:k]]
        
        logger.info(f"Hybrid search retrieved {len(final_docs)} documents (Vector={len(vector_docs)}, BM25={len(bm25_docs)}).")
        return final_docs

    @staticmethod
    def concatenate_context(documents: List[Document]) -> str:
        """Concatenates document page contents into a clean prompt context block."""
        seen_texts: Set[str] = set()
        unique_contents: List[str] = []

        for doc in documents:
            text = doc.page_content.strip()
            if text and text not in seen_texts:
                seen_texts.add(text)
                unique_contents.append(text)

        return "\n\n".join(unique_contents)
