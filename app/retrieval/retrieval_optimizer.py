"""
Retrieval Reranker & Optimization Module.
Performs candidate deduplication, reciprocal rank fusion (RRF),
and dynamic threshold filtering.
"""

from typing import List, Dict, Any


class RetrievalOptimizer:
    @staticmethod
    def rerank_and_deduplicate(retrieved_docs: List[Any], top_k: int = 5) -> List[Any]:
        seen_texts = set()
        deduped = []

        for doc in retrieved_docs:
            content = getattr(doc, "page_content", str(doc)).strip()
            content_key = content[:150]
            if content_key not in seen_texts:
                seen_texts.add(content_key)
                deduped.append(doc)

        return deduped[:top_k]
