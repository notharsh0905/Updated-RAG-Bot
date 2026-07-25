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

    def get_suggestion_objects(
        self,
        query: str,
        answer_text: str = "",
        session_id: Optional[str] = None,
        max_suggestions: int = 4
    ) -> List[Dict[str, str]]:
        """Returns structured list of suggestion dicts containing short_label and full_question."""
        full_questions = self.generate_suggestions(query, answer_text, session_id, max_suggestions)
        result = []
        for fq in full_questions:
            label = LABEL_SHORT_MAP.get(fq, f"❓ {fq[:22]}...")
            result.append({
                "short_label": label,
                "full_question": fq
            })
        return result


LABEL_SHORT_MAP: Dict[str, str] = {
    "What prototype development and incubation facilities exist at the Innovation Center?": "🚀 Innovation Center",
    "What is PEZ smart campus printing startup and how does it work?": "🖨️ PEZ Printing",
    "What startup support and mentorship does CSJMU offer?": "🤝 Startup Support",
    "What research projects are supported in campus laboratories?": "🔬 Research Labs",
    "What are the eligibility criteria for B.Tech admission?": "📝 B.Tech Eligibility",
    "What is the annual fee structure for engineering courses?": "💰 Fee Structure",
    "Which B.Tech engineering branches are available at UIET?": "🏫 UIET Branches",
    "What scholarships and UP fee waivers are offered?": "🎓 Scholarships",
    "What documents are required for UP scholarship fee waiver?": "📄 Required Documents",
    "How much scholarship do SC/ST and OBC students receive?": "💵 Scholarship Amounts",
    "How can students apply for National Scholarship Portal (NSP) schemes?": "🏛️ NSP Schemes",
    "Does CSJMU provide free tablets under the UP Government scheme?": "📱 Free Tablet Scheme",
    "Who is eligible for the Swami Vivekananda Youth Empowerment Scheme?": "📱 Free Tablet Scheme",
    "What digital devices are distributed under UP Free Tablet Scheme?": "📱 Free Tablet Scheme",
    "What other government scholarships and schemes are available?": "🎓 Government Schemes",
    "Who are notable UIET alumni working in ISRO, Apple, and Microsoft?": "🌟 Notable Alumni",
    "What career paths and achievements do UIET graduates hold?": "💼 Alumni Careers",
    "How do alumni contribute to student mentorship at UIET?": "🤝 Alumni Mentorship",
    "Which top companies visit UIET for campus recruitment?": "💼 Top Recruiters",
    "What is the highest domestic and international package?": "🏆 Placement Packages",
    "What is the branch-wise placement percentage for CSE and IT?": "📊 Placement Stats",
    "What training and mock interview support does the T&P Cell offer?": "🎯 T&P Training",
    "What facilities exist in the campus sports complex and gymnasium?": "🏋️ Sports & Gym",
    "What is the curfew timing and security rules for hostels?": "🏠 Hostel Rules",
    "Is there a medical health center on campus?": "🏥 Health Center",
    "What is the annual fee for hostel accommodation and mess?": "🏠 Hostel Fee & Mess",
    "What facilities exist in the campus hostels?": "🏠 Hostel Facilities",
    "Who are the Professors of Practice and industry experts?": "👨‍🏫 Faculty Experts",
    "Who is the Director of UIET CSJM University?": "👨‍🏫 UIET Director",
    "How can students schedule academic counseling with faculty?": "💬 Faculty Counseling",
    "Which department faculty specialize in AI and Cyber Security?": "🤖 AI & Cyber Faculty",
    "What is the admission procedure for B.Tech CSE at UIET?": "📝 B.Tech Admission",
    "What is the eligibility for BCA and MCA courses?": "🎓 BCA & MCA Eligibility",
    "Is there any relaxation for reserved category candidates?": "⚖️ Reserved Relaxation",
    "What are the required documents for admission counseling?": "📄 Counseling Documents",
    "What scholarships and financial concessions are available?": "💰 Financial Aid",
    "What is the hostel fee and caution deposit structure?": "🏠 Hostel Deposit",
    "What is the fee payment deadline and mode of payment?": "💳 Fee Payment",
    "What is the fee for M.Tech and MCA programmes?": "💰 M.Tech & MCA Fees",
    "Who achieved the highest GATE rank in UIET?": "🎯 GATE Toppers",
    "Which departments have the most GATE qualifiers?": "📊 GATE Qualifiers",
    "Is GATE score mandatory for M.Tech admissions?": "🎓 GATE for M.Tech",
    "What support does UIET provide for competitive exam preparation?": "📚 GATE Coaching",
    "What laboratories and research facilities exist in the department?": "🔬 Department Labs",
    "Who is the Head of Department and Dean of UIET?": "👨‍🏫 HOD & Dean",
    "What are the placement statistics for CSE and ECE?": "📊 CSE/ECE Placements",
    "Where can I find the complete course syllabus and curriculum?": "📚 Syllabus & Courses",
    "What subjects and credits are offered in Semester 1 & 2?": "📖 Semester 1 & 2",
    "What laboratories are attached to this engineering course?": "🔬 Course Labs",
    "How are mid-semester and end-semester exams evaluated?": "📝 Exam Evaluation",
    "Who are the faculty members teaching this department?": "👨‍🏫 Department Faculty",
    "Tell me about the Supercomputing Hub (NVIDIA DGX H100).": "⚡ Supercomputer DGX",
    "What research activities take place in the Cyber Security Lab?": "🛡️ Cyber Security Lab",
    "What prototyping equipment is available in the AICTE IDEA Lab?": "🛠️ AICTE IDEA Lab",
    "What projects are conducted in the Advanced Drone Lab?": "🛸 Drone Lab",
    "What is the Supercomputing Hub for Artificial Intelligence?": "⚡ AI Supercomputer",
    "Do UIET faculty members hold Ph.D. degrees from IITs/NITs?": "🎓 Faculty PhDs",
    "What industry collaborations and MoUs exist at UIET?": "🤝 Industry MoUs",
    "Are undergraduate students allowed to publish research papers?": "📄 Student Research",
    "What is the admission procedure for UIET programs?": "📝 Admission Process",
    "What is the highest package in UIET placements?": "🏆 Highest Package",
    "What engineering branches are offered at UIET Kanpur?": "🏫 Engineering Branches",
    "What facilities exist on the CSJMU campus?": "🏊 Campus Facilities"
}


# Global singleton instance
suggestion_engine = SuggestionEngine()
