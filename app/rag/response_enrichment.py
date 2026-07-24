"""
Smart Response Enrichment Engine for CSJMU & UIET AI Assistant.
Orchestrates:
- Section 1: Direct Grounded Answer
- Section 2: Smart Campus Fact (Optional, grounded, <=45 words, rotated)
- Section 3: Clickable Suggested Follow-up Questions (2-4 contextual chips)
"""

from typing import Dict, Any, List, Optional
from app.rag.campus_fact_service import campus_fact_service
from app.rag.suggestion_engine import suggestion_engine
from app.core.logging_config import setup_logger

logger = setup_logger("response_enrichment")


class ResponseEnrichmentEngine:
    def enrich_response(
        self,
        query: str,
        answer_text: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        session_key = session_id or "default_session"

        # Section 1: Direct Answer (unchanged)
        direct_answer = answer_text.strip()

        # Section 2: Smart Campus Fact (optional, grounded)
        campus_fact = campus_fact_service.get_relevant_fact(query, answer_text, session_key)

        # Section 3: Suggested Follow-up Questions (2-4 dynamic questions)
        suggested_questions = suggestion_engine.generate_suggestions(query, answer_text, session_key)

        # Build Enriched Markdown Display String
        enriched_parts = [direct_answer]

        if campus_fact:
            enriched_parts.append(campus_fact["display_markdown"])

        if suggested_questions:
            suggestions_md = "────────────────────────\n**You may also want to know:**\n"
            suggestions_md += "\n".join([f"• [{q}]" for q in suggested_questions])
            enriched_parts.append(suggestions_md)

        full_enriched_text = "\n\n".join(enriched_parts)

        return {
            "direct_answer": direct_answer,
            "campus_fact": campus_fact,
            "suggested_questions": suggested_questions,
            "full_enriched_text": full_enriched_text
        }


# Global singleton instance
response_enrichment_engine = ResponseEnrichmentEngine()
