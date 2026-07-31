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

    def add_documents(self, new_docs: List[Document]):
        """Dynamically appends new document chunks to BM25 index corpus without full rebuild."""
        try:
            if not new_docs:
                return

            self.corpus_docs.extend(new_docs)
            tokenized_corpus = []
            for doc in self.corpus_docs:
                tokens = re.findall(r'\w+', doc.page_content.lower())
                tokenized_corpus.append(tokens)

            self.bm25 = BM25Okapi(tokenized_corpus)
            logger.info(f"Updated BM25 index with {len(new_docs)} new chunks. Total corpus size: {len(self.corpus_docs)}.")
        except Exception as e:
            logger.error(f"Failed to update BM25 index dynamically: {e}")

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
        Performs Hybrid Search using RRF, Intent Category Routing, and Semantic Reranking.
        """
        if not use_hybrid:
            return self.retrieve_vector(query, k=k)

        vector_docs = self.retrieve_vector(query, k=k*2)
        bm25_docs = self.retrieve_bm25(query, k=k*2)

        # Detect Target Intent Category for Metadata Routing
        q_lower = query.lower()
        target_category = None
        if "hostel" in q_lower or "mess" in q_lower or "curfew" in q_lower:
            target_category = "hostels"
        elif "scholar" in q_lower or "reimbursement" in q_lower or "fee waiver" in q_lower:
            target_category = "scholarships"
        elif "placement" in q_lower or "recruiter" in q_lower or "package" in q_lower:
            target_category = "placements"
        elif "gate" in q_lower or "rank" in q_lower:
            target_category = "gate"
        elif "innovat" in q_lower or "pez" in q_lower or "startup" in q_lower:
            target_category = "innovation"
        elif "faculty" in q_lower or "director" in q_lower or "professor" in q_lower:
            target_category = "faculty"

        # Reciprocal Rank Fusion (RRF) + Category Routing Reranker
        rrf_scores: Dict[str, float] = {}
        doc_map: Dict[str, Document] = {}

        def add_rrf(doc_list: List[Document], weight: float = 1.0):
            for rank, doc in enumerate(doc_list):
                doc_key = doc.page_content[:150]
                doc_map[doc_key] = doc
                
                # Base RRF score
                base_score = weight * (1.0 / (60 + rank))
                
                # Category match bonus (+0.4)
                cat_bonus = 0.0
                doc_type = str(doc.metadata.get("doc_type", "")).lower()
                doc_src = str(doc.metadata.get("source", "")).lower()
                if target_category and (target_category in doc_type or target_category in doc_src):
                    cat_bonus = 0.4

                # Keyword overlap bonus (+0.2)
                q_words = set(re.findall(r'\w+', q_lower))
                doc_words = set(re.findall(r'\w+', doc.page_content.lower()))
                overlap = len(q_words.intersection(doc_words)) / max(len(q_words), 1)
                
                final_score = base_score + cat_bonus + (0.2 * overlap)
                rrf_scores[doc_key] = rrf_scores.get(doc_key, 0.0) + final_score

        add_rrf(vector_docs, weight=1.0)
        add_rrf(bm25_docs, weight=0.8)

        # Sort docs by final rerank score
        sorted_keys = sorted(rrf_scores.keys(), key=lambda key: rrf_scores[key], reverse=True)
        final_docs = [doc_map[key] for key in sorted_keys[:k]]
        
        logger.info(f"Hybrid search with category routing retrieved {len(final_docs)} reranked documents (Target Cat={target_category}).")
        return final_docs

    @staticmethod
    def calculate_confidence(query: str, documents: List[Document]) -> float:
        """Calculates query retrieval confidence score (0.0 to 1.0)."""
        if not documents:
            return 0.0

        q_words = set(re.findall(r'\w+', query.lower()))
        if not q_words:
            return 0.5

        top_doc_words = set(re.findall(r'\w+', documents[0].page_content.lower()))
        overlap_ratio = len(q_words.intersection(top_doc_words)) / max(len(q_words), 1)

        # Confidence heuristic
        if overlap_ratio >= 0.3 or len(documents) >= 3:
            return min(0.5 + (overlap_ratio * 0.5), 1.0)
        return round(overlap_ratio, 2)

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

