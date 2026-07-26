"""
Production Intelligence Layer (PIL) for CSJMU & UIET AI Assistant.
Orchestrates:
1. Language Detection (English, Hindi, Hinglish)
2. Domain Classification (21 supported domains + Out-of-Domain guard)
3. Intent Classification
4. Query Normalization (Short query expansion without hallucination)
5. Query Decomposition (Multi-intent splitting while preserving Hindi/Hinglish)
6. Query Expansion (Acronym expansion & synonym mapping)
7. Recommendation Engine (Grounded CSJMU programme matching)
8. Answer Validation Engine (Post-generation grounding & entity safety check)
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from app.core.logging_config import setup_logger

logger = setup_logger("production_intelligence")

# Out-of-Domain Keywords & Entities to intercept BEFORE retrieval
OUT_OF_DOMAIN_PATTERNS = [
    r"\bnasa\b", r"\bipl\b", r"\bcricket\b", r"\bweather\b", r"\bmeditation\b",
    r"\bmovie\b", r"\bsong\b", r"\brecipe\b", r"\brama university\b", r"\blucknow university\b",
    r"\baktu\b", r"\biit kanpur\b", r"\bamity\b", r"\blpu\b", r"\bchitkara\b", r"\bvit\b",
    r"\bsrm\b", r"\bbitcoin\b", r"\bcrypto\b", r"\bapple\b", r"\bmacbook\b", r"\biphone\b",
    r"\bford\b", r"\btesla\b", r"\bbmw\b", r"\btyre\b", r"\btyres\b", r"\bcar brand\b",
    r"\bpresident of usa\b", r"\bcapital of france\b"
]

# Domain List
SUPPORTED_DOMAINS = [
    "admissions", "scholarships", "placements", "departments", "faculty",
    "courses", "hostels", "innovation", "research", "facilities", "library",
    "sports", "fees", "results", "exams", "syllabus", "gate", "alumni",
    "general", "greetings", "out_of_domain", "other_university"
]

# Short Query Normalization Dictionary
NORMALIZATION_MAP = {
    "hostel": "Hostel facilities",
    "hostels": "Hostel facilities",
    "hostel facility": "Hostel facilities",
    "hostel facilities": "Hostel facilities",
    "hostel rules": "Hostel rules and curfew timings",
    "hostel mess": "Hostel mess facilities",
    "hostel fee": "Hostel fee structure",
    "hostel curfew": "Hostel curfew timings",
    "hostel timings": "Hostel curfew timings",
    "placement": "Placements and top recruiters at UIET",
    "placements": "Placements and top recruiters at UIET",
    "fee": "Fee structure of UIET programs",
    "fees": "Fee structure of UIET programs",
    "scholarship": "Scholarships and UP fee reimbursement rules",
    "scholarships": "Scholarships and UP fee reimbursement rules",
    "director": "Director of UIET",
    "faculty": "Faculty members of UIET",
    "alumni": "Alumni of UIET CSJMU",
    "gate": "GATE achievements of UIET students",
    "laboratories": "Research laboratories at UIET",
    "innovation center": "Innovation Center at UIET",
    "innovation": "Innovation Center at UIET",
    "pez": "PEZ Printing Service",
    "pez printing": "PEZ Printing Service",
    "supercomputer": "Supercomputing Hub NVIDIA DGX H100 at UIET",
}

# Acronym Expansion Map
ACRONYM_MAP = {
    r"\bcse\b": "Computer Science and Engineering (CSE)",
    r"\bece\b": "Electronics and Communication Engineering (ECE)",
    r"\bmee\b": "Mechanical Engineering (MEE)",
    r"\bche\b": "Chemical Engineering (CHE)",
    r"\bmsme\b": "Materials Science and Metallurgical Engineering (MSME)",
    r"\bai\b": "Artificial Intelligence (AI)",
    r"\buiet\b": "University Institute of Engineering and Technology (UIET)",
    r"\bcsjmu\b": "Chhatrapati Shahu Ji Maharaj University (CSJMU)",
    r"\bnsp\b": "National Scholarship Portal (NSP)",
}

# Hostel Synonym Expansion Rules (Part 9 Query Robustness)
HOSTEL_VARIANTS = [
    "hostel", "hostel facility", "hostel facilities", "hostel rules",
    "hostel fee", "hostel mess", "girls hostel", "boys hostel",
    "hostel timings", "hostel curfew", "hostel documents", "hostel room"
]


class LanguageDetector:
    """Detects query language (English, Hindi, Hinglish)."""

    @staticmethod
    def detect_language(text: str) -> str:
        # Check Devanagari script for pure Hindi
        if re.search(r"[\u0900-\u097F]", text):
            return "hi"

        # Check Hinglish keywords
        hinglish_words = ["hai", "kya", "kab", "kaise", "kitni", "milega", "batao", "chahiye", "ko", "ki", "me", "pe"]
        words = text.lower().split()
        if any(w in hinglish_words for w in words):
            return "hinglish"

        return "en"


class DomainClassifier:
    """Classifies query domain into 21 categories + Out-of-Domain / Other-University guards."""

    @staticmethod
    def classify_domain(text: str) -> Tuple[str, bool]:
        t_lower = text.lower()

        # 1. Other Universities Guard
        other_unis = [
            "lucknow university", "rama university", "aktu", "iit kanpur",
            "delhi university", "bhu", "amity", "lpu", "chitkara", "vit", "srm"
        ]
        for ou in other_unis:
            if re.search(r"\b" + re.escape(ou) + r"\b", t_lower):
                return "other_university", True

        # 2. Specific Out-of-Domain Patterns
        for pat in OUT_OF_DOMAIN_PATTERNS:
            if re.search(pat, t_lower):
                return "out_of_domain", True

        # 3. Pure Greetings
        if t_lower in ["hi", "hello", "hey", "namaste", "good morning", "good evening"]:
            return "greetings", False

        # 4. Domain Keyword Matching (In-Domain)
        in_domain_keywords = [
            "admiss", "apply", "counsel", "seat", "cut-off", "cutoff", "intake",
            "scholar", "stipend", "reimbursement", "nsp", "waiver", "chhatravitti",
            "place", "package", "recruiter", "salary", "lpa", "tcs", "infosys",
            "hostel", "mess", "curfew", "room", "stay", "accommodation",
            "fee", "cost", "charge", "tuition", "amount",
            "faculty", "teacher", "director", "professor", "hod", "dean",
            "gate", "rank", "air",
            "innovat", "incubat", "pez", "startup", "idea lab",
            "dept", "department", "cse", "ece", "che", "mee", "msme", "bca", "mca", "btech", "mtech",
            "supercomput", "nvidia", "research", "lab", "patent",
            "library", "sport", "pool", "bank", "atm", "gym", "canteen", "cafeteria",
            "kanpur", "csjmu", "uiet", "university", "college", "campus"
        ]

        if any(re.search(r"\b" + re.escape(k), t_lower) for k in in_domain_keywords):
            if any(k in t_lower for k in ["admiss", "apply", "counsel", "seat", "cutoff", "intake"]):
                return "admissions", False
            elif any(k in t_lower for k in ["scholar", "stipend", "reimbursement", "nsp"]):
                return "scholarships", False
            elif any(k in t_lower for k in ["place", "package", "recruiter", "salary", "lpa"]):
                return "placements", False
            elif any(k in t_lower for k in ["hostel", "mess", "curfew", "room"]):
                return "hostels", False
            elif any(k in t_lower for k in ["fee", "cost", "charge", "tuition"]):
                return "fees", False
            elif any(k in t_lower for k in ["faculty", "teacher", "director", "professor"]):
                return "faculty", False
            elif any(k in t_lower for k in ["gate", "rank"]):
                return "gate", False
            elif any(k in t_lower for k in ["innovat", "incubat", "pez", "startup"]):
                return "innovation", False
            return "general", False

        # 5. Non-University General Knowledge Fallback Guard
        non_uni_patterns = [
            r"\bbiryani\b", r"\bmovie\b", r"\bmovies\b", r"\bpython\b", r"\bscript\b",
            r"\bhello world\b", r"\bearth\b", r"\bmoon\b", r"\bdistance\b", r"\bmusic\b",
            r"\bworkout\b", r"\bsong\b", r"\bsongs\b"
        ]
        if any(re.search(p, t_lower) for p in non_uni_patterns):
            return "out_of_domain", True

        return "general", False


class QueryNormalizer:
    """Converts incomplete queries into explicit search representations."""

    @staticmethod
    def normalize(text: str) -> str:
        clean = text.strip().lower()

        # Direct normalization map lookup
        if clean in NORMALIZATION_MAP:
            return NORMALIZATION_MAP[clean]

        # Hostel query expansion (Part 9 Robustness)
        if any(hv in clean for hv in HOSTEL_VARIANTS):
            if "fee" in clean or "charge" in clean:
                return "Hostel fee structure"
            elif "rule" in clean or "curfew" in clean or "timing" in clean:
                return "Hostel rules and curfew timings"
            elif "mess" in clean:
                return "Hostel mess facilities"
            else:
                return "Hostel facilities"

        return text


class QueryExpander:
    """Expands acronyms and domain terms strictly within domain scope."""

    @staticmethod
    def expand(text: str) -> str:
        expanded = text
        for pat, replacement in ACRONYM_MAP.items():
            expanded = re.sub(pat, replacement, expanded, flags=re.IGNORECASE)
        return expanded


class QueryDecomposer:
    """Decomposes multi-sentence user queries while preserving language & symbols."""

    @staticmethod
    def decompose(text: str) -> List[str]:
        sentences = [s.strip() for s in re.split(r"[.!?\n]+", text) if s.strip()]
        if not sentences:
            return [text]
        return sentences


class RecommendationEngine:
    """Handles percentage & course recommendation queries grounded in CSJMU programs."""

    @staticmethod
    def process_recommendation(text: str) -> Optional[str]:
        t_lower = text.lower()
        if any(p in t_lower for p in ["percent", "score", "marks", "%", "12th", "class 12"]):
            return (
                "According to official CSJMU guidelines, admission eligibility depends on your academic stream:\n\n"
                "• **For B.Tech Engineering Programs (CSE, ECE, CHE, MEE, MSME):** Admission is based on **JEE Mains Rank** with a minimum requirement of 45% (40% for reserved category) in 10+2 with Physics, Mathematics, and Chemistry/CS.\n"
                "• **For BCA & MCA Programs:** Minimum 45-50% in 10+2 with Mathematics or Computer Science.\n\n"
                "To suggest the most accurate options, please let us know: Did you appear for JEE Mains, and what was your subject stream (PCM / PCB / Commerce)?"
            )
        return None


class AnswerValidator:
    """Validates LLM generated output post-generation."""

    @staticmethod
    def validate(query: str, answer_text: str) -> Tuple[bool, str]:
        if not answer_text or len(answer_text.strip()) < 10:
            return False, "The currently indexed official university documents do not specify this information."

        a_lower = answer_text.lower()
        q_lower = query.lower()

        # Topic relevance verification (Step 8 Semantic Answer Validator)
        if "hostel" in q_lower and "hostel" not in a_lower and "room" not in a_lower and "mess" not in a_lower:
            logger.warning(f"Answer Validator REJECTED off-topic response for hostel query.")
            return False, "According to official CSJMU records, the currently indexed official university documents do not contain enough information to answer this hostel question."

        if "innovation" in q_lower and "innovation" not in a_lower and "incubation" not in a_lower and "pez" not in a_lower and "startup" not in a_lower:
            logger.warning(f"Answer Validator REJECTED off-topic response for innovation query.")
            return False, "According to official CSJMU records, the currently indexed official university documents do not specify information for this innovation query."

        # Check for ungrounded outside entity hallucinations
        forbidden_entities = ["rama university", "lpu", "chitkara", "vit vellore", "srm university", "amity university", "lucknow university"]
        for fe in forbidden_entities:
            if fe in a_lower:
                logger.warning(f"Answer Validator REJECTED response due to hallucinated entity: '{fe}'")
                return False, "I currently support official information only for CSJMU & UIET Kanpur."

        return True, answer_text


class ProductionIntelligenceLayer:
    """Master PIL Orchestrator."""

    def __init__(self):
        self.lang_detector = LanguageDetector()
        self.domain_classifier = DomainClassifier()
        self.query_normalizer = QueryNormalizer()
        self.query_expander = QueryExpander()
        self.query_decomposer = QueryDecomposer()
        self.recommendation_engine = RecommendationEngine()
        self.answer_validator = AnswerValidator()

    def process_query(self, query: str) -> Dict[str, Any]:
        lang = self.lang_detector.detect_language(query)
        domain, is_out_of_domain = self.domain_classifier.classify_domain(query)
        normalized = self.query_normalizer.normalize(query)
        expanded = self.query_expander.expand(normalized)
        sub_queries = self.query_decomposer.decompose(expanded)
        rec_response = self.recommendation_engine.process_recommendation(query)

        # Out of Domain Response logic
        out_of_domain_response = None
        if is_out_of_domain:
            if domain == "other_university":
                out_of_domain_response = "I currently support official information only for CSJMU & UIET Kanpur."
            else:
                out_of_domain_response = "I am the official CSJMU & UIET AI Assistant and can answer questions related only to official university information."

        return {
            "original_query": query,
            "language": lang,
            "domain": domain,
            "is_out_of_domain": is_out_of_domain,
            "out_of_domain_response": out_of_domain_response,
            "normalized_query": normalized,
            "expanded_query": expanded,
            "sub_queries": sub_queries,
            "recommendation_response": rec_response
        }

    def validate_answer(self, query: str, answer_text: str) -> Tuple[bool, str]:
        return self.answer_validator.validate(query, answer_text)


# Global singleton instance
pil_engine = ProductionIntelligenceLayer()
