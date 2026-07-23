"""
Dynamic Intent-Based Query Router for CSJMU & UIET Multi-Collection Chroma DB.
Pre-classifies user questions to target specific collections.
"""

from typing import List, Dict, Any

COLLECTION_INTENT_MAP = {
    "hostel": ["Hostel", "Facilities"],
    "curfew": ["Hostel"],
    "mess": ["Hostel"],
    "director": ["Faculty"],
    "hod": ["Faculty"],
    "teacher": ["Faculty"],
    "professor": ["Faculty"],
    "faculty": ["Faculty"],
    "placement": ["Placements"],
    "package": ["Placements"],
    "recruiter": ["Placements"],
    "salary": ["Placements"],
    "scholarship": ["Scholarships"],
    "fee concession": ["Scholarships"],
    "admission": ["Admissions"],
    "eligibility": ["Admissions"],
    "coordinator": ["Admissions"],
    "syllabus": ["Syllabus"],
    "unit": ["Syllabus"],
    "course": ["Syllabus"],
    "lab": ["Syllabus", "Facilities"],
    "stadium": ["Facilities"],
    "auditorium": ["Facilities"]
}


class DynamicQueryRouter:
    @staticmethod
    def route_query(query: str) -> List[str]:
        q_lower = query.lower()
        matched_collections = set()

        for keyword, collections in COLLECTION_INTENT_MAP.items():
            if keyword in q_lower:
                matched_collections.update(collections)

        if not matched_collections:
            return ["Admissions", "Faculty", "Syllabus", "FAQs"]

        return list(matched_collections)


if __name__ == "__main__":
    router = DynamicQueryRouter()
    print("Test Route 'Who is Director?':", router.route_query("Who is the Director of UIET?"))
    print("Test Route 'Hostel fee':", router.route_query("What is the hostel fee?"))
