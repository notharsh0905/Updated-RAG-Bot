"""
Smart Suggestion Engine for CSJMU & UIET AI Assistant.
Dynamically generates 2-4 contextual follow-up questions using intent detection,
domain mappings, and conversation history to avoid repeating answered queries.
"""

from typing import List, Dict, Any, Optional
from app.rag.related_question_generator import detect_domain_category, get_candidate_questions
from app.core.logging_config import setup_logger

logger = setup_logger("suggestion_engine")


class SuggestionEngine:
    def __init__(self):
        self.session_asked_queries: Dict[str, List[str]] = {}

    def generate_suggestions(
        self,
        query: str,
        answer_text: str = "",
        session_id: Optional[str] = None,
        max_suggestions: int = 4
    ) -> List[str]:
        session_key = session_id or "default_session"
        asked_queries = [q.lower() for q in self.session_asked_queries.get(session_key, [])]

        # Record current query in session asked queries
        self.session_asked_queries.setdefault(session_key, []).append(query)
        if len(self.session_asked_queries[session_key]) > 20:
            self.session_asked_queries[session_key].pop(0)

        # Detect domain category
        domain = detect_domain_category(query, answer_text)
        candidates = get_candidate_questions(domain)

        # Filter out candidate questions that have already been asked or are too similar to current query
        query_words = set(query.lower().split())
        suggestions = []

        for cand in candidates:
            cand_lower = cand.lower()
            
            # Check overlap with current query
            if cand_lower == query.lower():
                continue
                
            # Check overlap with previously asked queries in session
            already_asked = any(cand_lower in past or past in cand_lower for past in asked_queries)
            if not already_asked:
                suggestions.append(cand)
            
            if len(suggestions) >= max_suggestions:
                break

        # Fallback to general candidates if fewer than 2 suggestions passed filter
        if len(suggestions) < 2:
            general_cands = get_candidate_questions("general")
            for gc in general_cands:
                if gc.lower() not in asked_queries and gc not in suggestions and gc.lower() != query.lower():
                    suggestions.append(gc)
                if len(suggestions) >= max_suggestions:
                    break

        return suggestions[:max_suggestions]


# Global singleton instance
suggestion_engine = SuggestionEngine()
