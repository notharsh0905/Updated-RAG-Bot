"""
Production Backend v2 Regression & Benchmark Test Suite (150+ Test Queries).
Evaluates CSJMU & UIET AI Assistant across 15 metric dimensions:
1. Admissions & Cutoffs
2. Scholarships & UP Reimbursement
3. Faculty & Leadership
4. Innovation & PEZ Printing
5. Hostels (11 Variants)
6. Placements & Recruiters
7. Hindi (Devanagari) Queries
8. Hinglish Queries
9. Short Queries (1-word)
10. Long Queries
11. Out-of-Domain Interception (Apple, Ford, NASA, IPL, Songs, Cars)
12. Other Universities Interception (Lucknow University, Rama University, AKTU)
13. GATE Achievements
14. Supercomputing & Research
15. Campus Facilities
"""

import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.pil import pil_engine
from app.rag.rag import RAGPipeline
from app.core.logging_config import setup_logger

logger = setup_logger("test_production_backend_v2")

TEST_SUITE = [
    # --- Category 1: Admissions (10 queries) ---
    ("What is the admission procedure for B.Tech CSE at UIET?", "admissions", "in_domain"),
    ("How to apply for B.Tech Lateral Entry at CSJMU?", "admissions", "in_domain"),
    ("What is the eligibility criteria for MCA admission?", "admissions", "in_domain"),
    ("What is the JEE Mains cutoff for B.Tech CSE?", "admissions", "in_domain"),
    ("What is the admission procedure for BCA program?", "admissions", "in_domain"),
    ("Is spot counselling available for B.Tech at UIET?", "admissions", "in_domain"),
    ("What documents are required for engineering admission?", "admissions", "in_domain"),
    ("What is the total intake capacity for B.Tech CSE?", "admissions", "in_domain"),
    ("How can I take admission in Kanpur University?", "admissions", "in_domain"),
    ("What is the admission process for M.Tech programs?", "admissions", "in_domain"),

    # --- Category 2: Scholarships (10 queries) ---
    ("What scholarship schemes are available for CSJMU students?", "scholarships", "in_domain"),
    ("How much fee reimbursement do SC/ST students get?", "scholarships", "in_domain"),
    ("What is the UP Post-Matric Scholarship policy?", "scholarships", "in_domain"),
    ("What are the eligibility criteria for NSP scholarship?", "scholarships", "in_domain"),
    ("What scholarship amount is given to OBC students?", "scholarships", "in_domain"),
    ("Is there any fee waiver scheme for female students?", "scholarships", "in_domain"),
    ("How to submit income certificate for scholarship?", "scholarships", "in_domain"),
    ("What is the deadline for UP scholarship application?", "scholarships", "in_domain"),
    ("Do hostel students get higher scholarship amount?", "scholarships", "in_domain"),
    ("What is the fee reimbursement amount for General category students?", "scholarships", "in_domain"),

    # --- Category 3: Faculty & Leadership (10 queries) ---
    ("Who is the Director of UIET CSJMU?", "faculty", "in_domain"),
    ("Tell me about the faculty members in CSE department.", "faculty", "in_domain"),
    ("Who is the Vice Chancellor of CSJMU?", "faculty", "in_domain"),
    ("What is the qualification of CSE department professors?", "faculty", "in_domain"),
    ("Who is the HOD of Mechanical Engineering department?", "faculty", "in_domain"),
    ("Who is the HOD of Electronics department?", "faculty", "in_domain"),
    ("Tell me about Chemical Engineering department faculty.", "faculty", "in_domain"),
    ("Who is the Director of School of Engineering and Technology?", "faculty", "in_domain"),
    ("What research guidance is offered by UIET faculty?", "faculty", "in_domain"),
    ("faculty", "faculty", "in_domain"),

    # --- Category 4: Innovation & PEZ Printing (10 queries) ---
    ("Tell me about the CSJMU Innovation Center and PEZ Printing Startup.", "innovation", "in_domain"),
    ("What startup incubation facilities exist at CSJMU?", "innovation", "in_domain"),
    ("What is PEZ printing service at UIET?", "innovation", "in_domain"),
    ("How can students access 3D printers at PEZ printing?", "innovation", "in_domain"),
    ("What funding is available for student startups at CSJMU?", "innovation", "in_domain"),
    ("Where is the CSJMU Innovation Center located?", "innovation", "in_domain"),
    ("PEZ", "innovation", "in_domain"),
    ("innovation center", "innovation", "in_domain"),
    ("Tell me about AICTE IDEA Lab at UIET.", "innovation", "in_domain"),
    ("What prototype building equipment is available at UIET?", "innovation", "in_domain"),

    # --- Category 5: Hostels & Mess (15 queries) ---
    ("hostel", "hostels", "in_domain"),
    ("hostel facility", "hostels", "in_domain"),
    ("hostel rules", "hostels", "in_domain"),
    ("hostel mess", "hostels", "in_domain"),
    ("hostel fee", "hostels", "in_domain"),
    ("hostel curfew", "hostels", "in_domain"),
    ("hostel timings", "hostels", "in_domain"),
    ("What are the hostel facilities at CSJMU?", "hostels", "in_domain"),
    ("What is the annual hostel fee for boys?", "hostels", "in_domain"),
    ("What is the hostel mess menu and food quality?", "hostels", "in_domain"),
    ("What is the night curfew timing for girls hostel?", "hostels", "in_domain"),
    ("Are single seater hostel rooms available for B.Tech final year?", "hostels", "in_domain"),
    ("What documents are needed for hostel allotment?", "hostels", "in_domain"),
    ("Is Wi-Fi available in CSJMU student hostels?", "hostels", "in_domain"),
    ("What is the caution money deposit for hostel admission?", "hostels", "in_domain"),

    # --- Category 6: Placements & Recruiters (10 queries) ---
    ("What is the highest placement package at UIET CSJMU?", "placements", "in_domain"),
    ("What is the average package for CSE department?", "placements", "in_domain"),
    ("Which top companies visit UIET for campus placement?", "placements", "in_domain"),
    ("What is the placement percentage of B.Tech CSE?", "placements", "in_domain"),
    ("Does TCS hire students from UIET Kanpur?", "placements", "in_domain"),
    ("placement", "placements", "in_domain"),
    ("What was the highest package achieved in 2023-24?", "placements", "in_domain"),
    ("What placement training and mock interviews are conducted?", "placements", "in_domain"),
    ("Tell me about campus placements for ECE branch.", "placements", "in_domain"),
    ("What placement support exists for BCA and MCA students?", "placements", "in_domain"),

    # --- Category 7: Devanagari Hindi Queries (10 queries) ---
    ("मुझे छात्रवृत्ति के बारे में बताओ", "scholarships", "in_domain"),
    ("हॉस्टल की फीस कितनी है?", "hostels", "in_domain"),
    ("बीटेक सीएसई में एडमिशन कैसे होगा?", "admissions", "in_domain"),
    ("यूआईईटी कानपुर में सबसे बड़ा प्लेसमेंट पैकेज क्या है?", "placements", "in_domain"),
    ("हॉस्टल के नियम और समय क्या हैं?", "hostels", "in_domain"),
    ("सीएसजेएमयू के निदेशक कौन हैं?", "faculty", "in_domain"),
    ("क्या हॉस्टल में वाई-फाई उपलब्ध है?", "hostels", "in_domain"),
    ("गेट परीक्षा में यूआईईटी के नतीजे कैसे रहे?", "gate", "in_domain"),
    ("फीस की जानकारी दो", "fees", "in_domain"),
    ("सीएसजेएमयू इनोवेशन सेंटर क्या है?", "innovation", "in_domain"),

    # --- Category 8: Hinglish Queries (15 queries) ---
    ("Hostel ki fees kitni hai?", "hostels", "in_domain"),
    ("Scholarship kab milti hai?", "scholarships", "in_domain"),
    ("BTech admission ka process kya hai?", "admissions", "in_domain"),
    ("Hostel hai kya csjmu me?", "hostels", "in_domain"),
    ("Highest placement package kitna gaya hai?", "placements", "in_domain"),
    ("Placement me konsi companies aati hai?", "placements", "in_domain"),
    ("CSE me kitni seats hai?", "admissions", "in_domain"),
    ("Hostel mess ka khana kaisa hai?", "hostels", "in_domain"),
    ("75 percent hai kya admission milega?", "admissions", "in_domain"),
    ("Hostel ke curfew timings kya hai?", "hostels", "in_domain"),
    ("Director sir ka naam kya hai?", "faculty", "in_domain"),
    ("PEZ printing facility kaha hai?", "innovation", "in_domain"),
    ("Supercomputer center me kya hota hai?", "research", "in_domain"),
    ("CSE ki annual fee kitni hai?", "fees", "in_domain"),
    ("Hostel rules me kya strict hai?", "hostels", "in_domain"),

    # --- Category 9: Out-of-Domain Generic Queries (15 queries) ---
    ("apple company ke laptop ko kya kehte hai", "out_of_domain", "out_of_domain"),
    ("ek car mai kitne tyres hote hai", "out_of_domain", "out_of_domain"),
    ("is ford a car brand", "out_of_domain", "out_of_domain"),
    ("suggest meditation songs", "out_of_domain", "out_of_domain"),
    ("What is NASA?", "out_of_domain", "out_of_domain"),
    ("IPL 2026 schedule", "out_of_domain", "out_of_domain"),
    ("Who won the cricket world cup?", "out_of_domain", "out_of_domain"),
    ("What is the capital of France?", "out_of_domain", "out_of_domain"),
    ("How to make chicken biryani?", "out_of_domain", "out_of_domain"),
    ("Recommend good Bollywood movies", "out_of_domain", "out_of_domain"),
    ("What is Bitcoin price today?", "out_of_domain", "out_of_domain"),
    ("How to write a Python hello world script?", "out_of_domain", "out_of_domain"),
    ("Who is the President of USA?", "out_of_domain", "out_of_domain"),
    ("What is the distance from Earth to Moon?", "out_of_domain", "out_of_domain"),
    ("Suggest workout music", "out_of_domain", "out_of_domain"),

    # --- Category 10: Other Universities Interception (10 queries) ---
    ("how to take admission in Lucknow University", "other_university", "other_university"),
    ("Tell me about Rama University", "other_university", "other_university"),
    ("What is the fee structure at IIT Kanpur?", "other_university", "other_university"),
    ("How to apply for AKTU counselling?", "other_university", "other_university"),
    ("What courses are offered at Amity University?", "other_university", "other_university"),
    ("What is LPU placement record?", "other_university", "other_university"),
    ("Tell me about VIT Vellore cutoffs", "other_university", "other_university"),
    ("Is SRM University good for engineering?", "other_university", "other_university"),
    ("What is Chitkara University fee?", "other_university", "other_university"),
    ("How to get admission in Delhi University?", "other_university", "other_university"),

    # --- Category 11: GATE Achievements (10 queries) ---
    ("What are the recent GATE achievements of UIET students?", "gate", "in_domain"),
    ("How many students qualified GATE 2024 from UIET?", "gate", "in_domain"),
    ("What was the top All India Rank (AIR) in GATE from UIET?", "gate", "in_domain"),
    ("GATE", "gate", "in_domain"),
    ("Tell me about GATE 2023 ranks of CSE department.", "gate", "in_domain"),
    ("Which branches produced best GATE ranks at UIET?", "gate", "in_domain"),
    ("Does UIET provide GATE coaching or mentorship?", "gate", "in_domain"),
    ("Who was AIR 120 in GATE from UIET Kanpur?", "gate", "in_domain"),
    ("What GATE rank did ECE students achieve?", "gate", "in_domain"),
    ("GATE qualified students 2024 list", "gate", "in_domain"),

    # --- Category 12: Supercomputing & Research (10 queries) ---
    ("Tell me about the NVIDIA DGX H100 Supercomputer at UIET.", "research", "in_domain"),
    ("What supercomputing hub facilities exist at CSJMU?", "research", "in_domain"),
    ("How can students access AI supercomputer for research?", "research", "in_domain"),
    ("supercomputer", "research", "in_domain"),
    ("What research projects are ongoing at UIET Kanpur?", "research", "in_domain"),
    ("What research labs are available for CSE students?", "research", "in_domain"),
    ("Tell me about Materials Science research facilities.", "research", "in_domain"),
    ("What AI research projects use the NVIDIA DGX H100?", "research", "in_domain"),
    ("Are undergraduate students allowed to conduct research?", "research", "in_domain"),
    ("What patents or research papers were published by UIET?", "research", "in_domain"),

    # --- Category 13: Campus Facilities (10 queries) ---
    ("Tell me about the Central Library at CSJMU.", "facilities", "in_domain"),
    ("What sports complex facilities are available on campus?", "facilities", "in_domain"),
    ("Does CSJMU have an Olympic size swimming pool?", "facilities", "in_domain"),
    ("What medical and health center facilities exist on campus?", "facilities", "in_domain"),
    ("Is there a bank and ATM inside CSJMU campus?", "facilities", "in_domain"),
    ("What dining and cafeteria options exist on campus?", "facilities", "in_domain"),
    ("What auditorium and seminar hall facilities exist at UIET?", "facilities", "in_domain"),
    ("What is the central library timing and book capacity?", "facilities", "in_domain"),
    ("Are sports tournaments organized at CSJMU stadium?", "facilities", "in_domain"),
    ("Tell me about campus security and CCTV coverage.", "facilities", "in_domain"),

    # --- Category 14: Fees & Department Specifics (10 queries) ---
    ("fee", "fees", "in_domain"),
    ("fees", "fees", "in_domain"),
    ("What is the annual tuition fee for B.Tech CSE?", "fees", "in_domain"),
    ("What is the fee structure for MCA program?", "fees", "in_domain"),
    ("What is the total fee for 4 years B.Tech engineering?", "fees", "in_domain"),
    ("What engineering departments exist under UIET Kanpur?", "departments", "in_domain"),
    ("Tell me about Materials Science and Metallurgical Engineering department.", "departments", "in_domain"),
    ("Tell me about Chemical Engineering department.", "departments", "in_domain"),
    ("What vocational and diploma courses are offered?", "departments", "in_domain"),
    ("What is the curriculum for Computer Science and Engineering?", "departments", "in_domain"),

    # --- Category 15: Recommendations & Ambiguity (5 queries) ---
    ("I scored 75% in Class 12, what courses can I get?", "admissions", "in_domain"),
    ("I scored 85% in 12th PCM, can I get B.Tech CSE?", "admissions", "in_domain"),
    ("What course should I join after 12th Commerce?", "admissions", "in_domain"),
    ("Which branch is best in UIET Kanpur?", "admissions", "in_domain"),
    ("Can I get admission without JEE Mains rank?", "admissions", "in_domain"),
]


def run_benchmark():
    print("\n========================================================")
    print("🎓 CSJMU Production Backend v2 Regression Benchmark (150+ Queries)")
    print("========================================================\n")

    passed = 0
    failed = 0
    total = len(TEST_SUITE)
    latencies = []

    print(f"Total Test Queries Loaded: {total}\n")

    pipeline = RAGPipeline()

    for idx, (query, expected_domain, expected_type) in enumerate(TEST_SUITE, start=1):
        t0 = time.time()
        
        # 1. PIL Pre-processing check
        pil_res = pil_engine.process_query(query)
        detected_lang = pil_res["language"]
        detected_domain = pil_res["domain"]
        is_ood = pil_res["is_out_of_domain"]

        # Evaluate Domain Interception
        if expected_type == "out_of_domain":
            if is_ood and pil_res["out_of_domain_response"] == "I am the official CSJMU & UIET AI Assistant and can answer questions related only to official university information.":
                passed += 1
                status = "✅ PASS (OOD Intercepted)"
            else:
                failed += 1
                status = f"❌ FAIL (OOD Leak: domain={detected_domain})"

        elif expected_type == "other_university":
            if is_ood and pil_res["out_of_domain_response"] == "I currently support official information only for CSJMU & UIET Kanpur.":
                passed += 1
                status = "✅ PASS (Other Uni Intercepted)"
            else:
                failed += 1
                status = f"❌ FAIL (Other Uni Leak: domain={detected_domain})"

        else:
            # In-Domain Query
            if not is_ood:
                passed += 1
                status = "✅ PASS (In-Domain Processed)"
            else:
                failed += 1
                status = f"❌ FAIL (False Positive OOD Interception: domain={detected_domain})"

        elapsed = round(time.time() - t0, 3)
        latencies.append(elapsed)

        if idx % 15 == 0 or idx == total or "FAIL" in status:
            print(f"Query [{idx}/{total}]: '{query[:50]}...' -> {status} ({elapsed}s)")

    avg_latency = round(sum(latencies) / len(latencies), 3) if latencies else 0.0
    accuracy = round((passed / total) * 100, 2)

    print("\n========================================================")
    print("📊 CSJMU PRODUCTION BACKEND V2 BENCHMARK RESULTS")
    print("========================================================")
    print(f"Total Test Queries               : {total}")
    print(f"Passed Test Cases                : {passed}")
    print(f"Failed Test Cases                : {failed}")
    print(f"Overall Accuracy Rate            : {accuracy}%")
    print(f"Average Pre-Retrieval Latency    : {avg_latency}s")
    print("========================================================\n")

    return failed == 0


if __name__ == "__main__":
    success = run_benchmark()
    sys.exit(0 if success else 1)
