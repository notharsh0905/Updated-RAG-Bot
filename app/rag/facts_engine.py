"""
Smart Campus Facts Engine for CSJMU & UIET RAG System.
Retrieves grounded, non-hallucinated official facts from indexed documents,
matches topic relevance, maintains session history to rotate facts,
and formats 'Did You Know?' callouts for user responses.
"""

import json
import random
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("campus_facts_engine")


class CampusFactsEngine:
    def __init__(self, facts_filepath: Optional[Path] = None):
        if facts_filepath is None:
            facts_filepath = config.BASE_DIR / "data" / "structured_data" / "campus_facts.json"
        
        self.facts_filepath = facts_filepath
        self.facts: List[Dict[str, Any]] = []
        self.session_history: Dict[str, List[str]] = {}
        self.load_facts()

    def load_facts(self):
        if self.facts_filepath.exists():
            try:
                with open(self.facts_filepath, "r", encoding="utf-8") as f:
                    self.facts = json.load(f)
                logger.info(f"Loaded {len(self.facts)} official campus facts from {self.facts_filepath}")
            except Exception as e:
                logger.error(f"Error loading campus facts: {e}")
                self.facts = []
        else:
            logger.warning(f"Campus facts file not found at {self.facts_filepath}")
            self.facts = []

    def get_fact(self, query: str, session_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.facts:
            return None

        query_lower = query.lower()
        query_words = set(query_lower.split())

        # Retrieve history for session_id
        session_key = session_id or "default_session"
        seen_fact_ids = set(self.session_history.get(session_key, []))

        # Score facts based on keyword overlap
        scored_facts = []
        for fact in self.facts:
            f_id = fact["id"]
            kw_matches = sum(1 for kw in fact.get("keywords", []) if kw in query_lower)
            cat_match = 2 if fact.get("category", "").lower() in query_lower else 0
            score = kw_matches + cat_match

            # Penalty for facts already shown in this session
            if f_id in seen_fact_ids:
                score -= 10

            scored_facts.append((score, fact))

        # Sort by relevance score descending
        scored_facts.sort(key=lambda x: x[0], reverse=True)

        best_score, selected_fact = scored_facts[0]

        # Record selected fact in session history (keep max 10 recent facts)
        history_list = self.session_history.setdefault(session_key, [])
        history_list.append(selected_fact["id"])
        if len(history_list) > 10:
            history_list.pop(0)

        formatted_text = (
            f"Did You Know?\n"
            f"{selected_fact['fact']}\n"
            f"(Source: {selected_fact['source']})"
        )

        return {
            "id": selected_fact["id"],
            "category": selected_fact["category"],
            "fact_text": selected_fact["fact"],
            "source": selected_fact["source"],
            "formatted_display": formatted_text
        }


# Global singleton instance
campus_facts_engine = CampusFactsEngine()
