"""
Query Processor for CSJMU RAG System.
Handles text normalization, typo correction for domain terms, and follow-up query rewriting.
"""

import re
from typing import List, Dict, Any, Optional
from app.core.logging_config import setup_logger

logger = setup_logger("query_processor")

# Domain-specific typo mapping (Strict typo correction only - no entity injection)
DOMAIN_SPELL_MAP = {
    "uiet": "UIET",
    "csjm": "CSJMU",
    "csjmu": "CSJMU",
    "admisson": "admission",
    "admissons": "admissions",
    "eligibility": "eligibility",
    "eligiblity": "eligibility",
    "elgibility": "eligibility",
    "hosel": "hostel",
    "hostle": "hostel",
    "hostels": "hostels",
    "fees": "fee",
    "feestructure": "fee structure",
    "placment": "placement",
    "placments": "placements",
    "corse": "course",
    "corses": "courses",
    "faculity": "faculty",
    "faculties": "faculty",
    "syllabus": "syllabus",
    "sylabus": "syllabus",
    "maths": "Mathematics",
    "math": "Mathematics",
    "physics1": "Physics-I",
    "chemistry1": "Chemistry-I",
    "sem 1": "Semester I",
    "btech": "B.Tech",
    "mtech": "M.Tech",
    "mca": "MCA",
    "bca": "BCA",
    "scholarship": "scholarship",
    "scholarships": "scholarships",
    "shcholarship": "scholarship",
    "scolarship": "scholarship",
    "reimbursement": "reimbursement",
    "tablet": "tablet",
    "tablets": "tablets",
    "pez": "PEZ",
    "innovation": "innovation",
    "alumni": "alumni",
    "alumnus": "alumni",
    "tcs": "TCS",
}


class QueryProcessor:
    """Pre-processes and normalizes user input queries."""

    @staticmethod
    def normalize_query(text: str) -> str:
        """
        Cleans extra whitespace, normalizes casing, and fixes common CSJMU domain typos.
        """
        if not text:
            return ""
        
        # 1. Clean whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # 2. Tokenize and replace known domain typos
        words = text.split()
        normalized_words = []
        for word in words:
            clean_word = re.sub(r'[^\w\.-]', '', word).lower()
            if clean_word in DOMAIN_SPELL_MAP:
                # Replace with standardized term
                replacement = DOMAIN_SPELL_MAP[clean_word]
                # Preserve surrounding punctuation if present
                normalized_words.append(word.replace(re.sub(r'[^\w\.-]', '', word), replacement))
            else:
                normalized_words.append(word)

        normalized_str = " ".join(normalized_words)
        return normalized_str

    @staticmethod
    def rewrite_query_with_history(current_query: str, history: List[Dict[str, str]]) -> str:
        """
        Rewrites ambiguous follow-up queries using conversation history.
        E.g., "What is its eligibility criteria?" -> "What is the eligibility criteria for B.Tech Computer Science?"
        """
        if not history:
            return current_query

        lower_q = current_query.lower()
        pronoun_patterns = [r"\bits\b", r"\bit\b", r"\bthis course\b", r"\bthis department\b", r"\bthis program\b", r"\bthis hostel\b", r"\btheir\b"]
        
        if any(re.search(p, lower_q) for p in pronoun_patterns):
            # Extract main entity topic from previous user question
            last_user_msg = ""
            for msg in reversed(history):
                if msg.get("role") == "user":
                    last_user_msg = msg.get("content", "")
                    break

            if last_user_msg:
                logger.info(f"Rewriting query '{current_query}' using previous context: '{last_user_msg}'")
                return f"{current_query} (Context: regarding '{last_user_msg}')"

        return current_query


query_processor = QueryProcessor()
