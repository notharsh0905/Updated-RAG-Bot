"""
Campus Fact Service for Smart Response Enrichment Engine.
Handles grounded fact retrieval, category relevance mapping, word length enforcement (<=45 words),
session history rotation, and suppression logic for long answers or conversational queries.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("campus_fact_service")


class CampusFactService:
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
                logger.info(f"Loaded {len(self.facts)} official campus facts into CampusFactService")
            except Exception as e:
                logger.error(f"Failed to load campus facts: {e}")
                self.facts = []
        else:
            logger.warning(f"Campus facts file not found at {self.facts_filepath}")

    def should_suppress_fact(self, query: str, answer_text: str) -> bool:
        """
        Suppression Rules:
        1. If answer is an error / fallback message
        2. If answer is already very long (> 1200 chars)
        3. If query is purely conversational (hello, hi, thanks)
        """
        q_lower = query.strip().lower()
        if q_lower in ["hi", "hello", "hey", "thanks", "thank you", "bye", "good morning", "good evening"]:
            return True

        if len(answer_text) > 1200:
            return True

        error_phrases = ["cannot answer", "error occurred", "unable to process", "service unavailable", "do not have enough context"]
        if any(ep in answer_text.lower() for ep in error_phrases):
            return True

        return False

    def get_relevant_fact(self, query: str, answer_text: str, session_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.facts or self.should_suppress_fact(query, answer_text):
            return None

        q_lower = query.lower()
        session_key = session_id or "default_session"
        seen_ids = set(self.session_history.get(session_key, []))

        # Score facts based on category & keyword relevance
        scored_facts = []
        for fact in self.facts:
            f_id = fact["id"]
            kw_matches = sum(1 for kw in fact.get("keywords", []) if kw in q_lower or kw in answer_text.lower())
            cat_matches = 2 if fact.get("category", "").lower() in q_lower else 0
            score = kw_matches + cat_matches

            # Apply rotation penalty if already shown in current session
            if f_id in seen_ids:
                score -= 10

            scored_facts.append((score, fact))

        scored_facts.sort(key=lambda x: x[0], reverse=True)
        best_score, selected_fact = scored_facts[0]

        # Enforce max length constraint (<= 45 words)
        words = selected_fact["fact"].split()
        if len(words) > 45:
            fact_text = " ".join(words[:45]) + "..."
        else:
            fact_text = selected_fact["fact"]

        # Track in session rotation history (keep last 10)
        history_list = self.session_history.setdefault(session_key, [])
        history_list.append(selected_fact["id"])
        if len(history_list) > 10:
            history_list.pop(0)

        display_markdown = (
            f"💡 **Did You Know?**\n"
            f"{fact_text}\n"
            f"*(Source: {selected_fact['source']})*"
        )

        return {
            "id": selected_fact["id"],
            "category": selected_fact["category"],
            "fact_text": fact_text,
            "source": selected_fact["source"],
            "display_markdown": display_markdown
        }


# Global singleton instance
campus_fact_service = CampusFactService()
