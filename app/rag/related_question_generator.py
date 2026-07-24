"""
Related Question Generator for Smart Response Enrichment Engine.
Provides domain-specific pools of follow-up questions based on intent,
knowledge graph entities, and academic topics.
"""

from typing import Dict, List, Any


DOMAIN_QUESTION_MAP: Dict[str, List[str]] = {
    "admissions": [
        "What are the eligibility criteria for B.Tech admission?",
        "What is the annual fee structure for engineering courses?",
        "Which B.Tech engineering branches are available at UIET?",
        "What scholarships and UP fee waivers are offered?"
    ],
    "eligibility": [
        "What is the admission procedure for B.Tech programs?",
        "What is the eligibility for BCA and MCA courses?",
        "Is there any relaxation for reserved category candidates?",
        "What are the required documents for admission counseling?"
    ],
    "fees": [
        "What scholarships and financial concessions are available?",
        "What is the hostel fee and caution deposit structure?",
        "What is the fee payment deadline and mode of payment?",
        "What is the fee for M.Tech and MCA programmes?"
    ],
    "placements": [
        "Which top companies visit UIET for campus recruitment?",
        "What is the highest domestic and international package?",
        "What is the branch-wise placement percentage for CSE and IT?",
        "What training and mock interview support does the T&P Cell offer?"
    ],
    "gate": [
        "Who achieved the highest GATE rank in UIET?",
        "Which departments have the most GATE qualifiers?",
        "Is GATE score mandatory for M.Tech admissions?",
        "What support does UIET provide for competitive exam preparation?"
    ],
    "departments": [
        "What laboratories and research facilities exist in the department?",
        "Who is the Head of Department and Dean of UIET?",
        "What are the placement statistics for CSE and ECE?",
        "Where can I find the complete course syllabus and curriculum?"
    ],
    "syllabus": [
        "What subjects and credits are offered in Semester 1 & 2?",
        "What laboratories are attached to this engineering course?",
        "How are mid-semester and end-semester exams evaluated?",
        "Who are the faculty members teaching this department?"
    ],
    "laboratories": [
        "Tell me about the Supercomputing Hub (NVIDIA DGX H100).",
        "What research activities take place in the Cyber Security Lab?",
        "What prototyping equipment is available in the AICTE IDEA Lab?",
        "What projects are conducted in the Advanced Drone Lab?"
    ],
    "research": [
        "What is the Supercomputing Hub for Artificial Intelligence?",
        "Do UIET faculty members hold Ph.D. degrees from IITs/NITs?",
        "What industry collaborations and MoUs exist at UIET?",
        "Are undergraduate students allowed to publish research papers?"
    ],
    "hostel": [
        "What facilities exist in the campus sports complex and gymnasium?",
        "What is the curfew timing and security rules for hostels?",
        "Is there a medical health center on campus?",
        "What is the annual fee for hostel accommodation and mess?"
    ],
    "faculty": [
        "Who are the Professors of Practice and industry experts?",
        "Who is the Director of UIET CSJM University?",
        "How can students schedule academic counseling with faculty?",
        "Which department faculty specialize in AI and Cyber Security?"
    ],
    "scholarships": [
        "How can students apply for National Scholarship Portal (NSP) schemes?",
        "What documents are required for UP scholarship fee waiver?",
        "Are merit scholarships awarded to top performing students?",
        "What financial aid is available for economically weaker sections?"
    ],
    "general": [
        "What is the admission procedure for UIET programs?",
        "What is the highest package in UIET placements?",
        "What engineering branches are offered at UIET Kanpur?",
        "What facilities exist on the CSJMU campus?"
    ]
}


def detect_domain_category(query: str, answer_text: str = "") -> str:
    q_lower = query.lower()
    
    if any(k in q_lower for k in ["admiss", "apply", "counsel", "seat", "intake"]):
        return "admissions"
    elif any(k in q_lower for k in ["eligib", "percent", "criteria", "requirement"]):
        return "eligibility"
    elif any(k in q_lower for k in ["fee", "cost", "charge", "tuition", "annual fee"]):
        return "fees"
    elif any(k in q_lower for k in ["place", "salary", "package", "recruiter", "job", "company", "lpa", "tcs"]):
        return "placements"
    elif any(k in q_lower for k in ["gate", "rank", "air", "score", "qualifi"]):
        return "gate"
    elif any(k in q_lower for k in ["dept", "department", "cse", "ece", "che", "mee", "msme", "bca", "mca"]):
        return "departments"
    elif any(k in q_lower for k in ["syllab", "curricul", "subject", "course", "semester", "credit"]):
        return "syllabus"
    elif any(k in q_lower for k in ["lab", "laboratory", "idea lab", "drone", "cyber security"]):
        return "laboratories"
    elif any(k in q_lower for k in ["supercomput", "nvidia", "research", "ai hub", "gpu"]):
        return "research"
    elif any(k in q_lower for k in ["hostel", "room", "mess", "curfew", "sports", "gym"]):
        return "hostel"
    elif any(k in q_lower for k in ["faculty", "teacher", "director", "professor", "hod", "dean"]):
        return "faculty"
    elif any(k in q_lower for k in ["scholar", "stipend", "financial aid", "waiver", "nsp"]):
        return "scholarships"
    
    return "general"


def get_candidate_questions(domain: str) -> List[str]:
    return DOMAIN_QUESTION_MAP.get(domain, DOMAIN_QUESTION_MAP["general"])
