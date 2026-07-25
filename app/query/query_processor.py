"""
Query Processor for CSJMU RAG System.
Handles text normalization, typo correction for domain terms, and follow-up query rewriting.
"""

import re
from typing import List, Dict, Any, Optional
from app.core.logging_config import setup_logger

logger = setup_logger("query_processor")

# Domain-specific typo mapping
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
    "fees": "fee structure",
    "feestructure": "fee structure",
    "placment": "placement",
    "placments": "placements",
    "corse": "course",
    "corses": "courses",
    "faculity": "faculty",
    "faculties": "faculty",
    "syllabus": "syllabus",
    "sylabus": "syllabus",
    "maths": "Mathematics-I MTH-S101",
    "math": "Mathematics-I MTH-S101",
    "mathematics": "Mathematics-I MTH-S101",
    "maths1": "Mathematics-I MTH-S101",
    "math1": "Mathematics-I MTH-S101",
    "maths-1": "Mathematics-I MTH-S101",
    "math-1": "Mathematics-I MTH-S101",
    "physics1": "Physics-I PHYS-S101",
    "physics-1": "Physics-I PHYS-S101",
    "chemistry1": "Chemistry-I CHM-S101",
    "chemistry-1": "Chemistry-I CHM-S101",
    "sem 1": "Semester I",
    "semester 1": "Semester I",
    "1st sem": "Semester I",
    "1st semester": "Semester I",
    "sem 2": "Semester II",
    "semester 2": "Semester II",
    "2nd sem": "Semester II",
    "sem 3": "Semester III",
    "semester 3": "Semester III",
    "3rd sem": "Semester III",
    "btech": "B.Tech",
    "b.tech": "B.Tech",
    "mtech": "M.Tech",
    "m.tech": "M.Tech",
    "mca": "MCA",
    "mba": "MBA",
    "bca": "BCA",
    "bpharm": "B.Pharm",
    "dpharm": "D.Pharm",
    "ballb": "BA LLB",
    "llb": "LLB",
    "llm": "LLM",
    "bpt": "BPT",
    "bmlt": "BMLT",
    "scholarship": "scholarship fee reimbursement UP Scholarship NSP financial assistance tuition fee waiver",
    "scholarships": "scholarships fee reimbursement UP Scholarship NSP financial assistance tuition fee waiver",
    "shcholarship": "scholarship fee reimbursement UP Scholarship NSP financial assistance",
    "scolarship": "scholarship fee reimbursement UP Scholarship NSP financial assistance",
    "reimbursement": "fee reimbursement UP Scholarship government scheme financial assistance",
    "tablet": "Swami Vivekananda Youth Empowerment Scheme UP Free Tablet Smartphone Scheme",
    "tablets": "Swami Vivekananda Youth Empowerment Scheme UP Free Tablet Smartphone Scheme",
    "smartphone": "Swami Vivekananda Youth Empowerment Scheme UP Free Tablet Smartphone Scheme",
    "laptop": "Swami Vivekananda Youth Empowerment Scheme UP Free Tablet Smartphone Scheme",
    "pez": "PEZ Smart Campus Printing Service QR code print automatic file deletion",
    "printer": "PEZ Smart Campus Printing Service QR code print photocopy",
    "printing": "PEZ Smart Campus Printing Service QR code print photocopy",
    "photocopy": "PEZ Smart Campus Printing Service QR code print photocopy",
    "innovation": "Innovation Center prototype development startup incubation mentorship",
    "alumni": "alumni notable graduates ISRO Apple Microsoft IIT achievements",
    "alumnus": "alumni notable graduates ISRO Apple Microsoft IIT achievements",
    "alumini": "alumni notable graduates ISRO Apple Microsoft IIT achievements",
    "allumini": "alumni notable graduates ISRO Apple Microsoft IIT achievements",
    "tcs": "TCS Tata Consultancy Services campus placements",
    "jio": "Jio Platforms campus placement",
    "cadence": "Cadence Design Systems placement package",
    "quizizz": "Quizizz campus placement package",
    "prospa": "Prospa Inc placement package"
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
        pronouns = ["its", "it", "this course", "this department", "this program", "this hostel", "their"]
        
        if any(p in lower_q for p in pronouns):
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
