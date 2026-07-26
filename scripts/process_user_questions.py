"""
Script to test the user's provided questions against the CSJMU & UIET RAG Knowledge Base.
Outputs comprehensive bot test results and a user-friendly answer entry template.
"""

import sys
import json
import re
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from scripts.knowledge_coverage import KnowledgeCoverageEngine
from app.core.logging_config import setup_logger

logger = setup_logger("user_question_tester")

# Questions provided by the user
USER_QUESTIONS_TEXT = """
General Admission Queries
1. What is the eligibility criteria for B.Tech admission?
2. Is JEE Main mandatory for admission?
3. What is the minimum percentage required in Class 12?
4. Can diploma holders apply for lateral entry?
5. What entrance exams are accepted?
6. Is there any age limit for admission?
7. Are private candidates eligible?
8. Can I apply with compartment results?
9. Is improvement exam score considered?
10. What subjects are required in 12th for B.Tech?
University / CSJMU Specific Queries
11. Does Chhatrapati Shahu Ji Maharaj University (CSJMU) offer B.Tech programs?
12. What branches are available in B.Tech at CSJMU?
13. What is the admission process at CSJMU?
14. Is admission through counseling or direct?
15. Does CSJMU accept JEE Main scores?
16. What is the cut-off for CSJMU B.Tech admission?
17. Are there management quota seats?
18. Does CSJMU offer hostel facilities?
19. What is the fee structure?
20. Is there any scholarship available?
Branch / Course Queries
21. Which B.Tech branch has the highest placement?
22. Is Computer Science available?
23. What is the intake capacity for CSE?
24. Can I change my branch later?
25. Which specialization is best in CSE?
26. Is Artificial Intelligence offered?
27. Is Data Science available?
28. Difference between CSE and IT?
29. What is the syllabus structure?
30. Does the course include internships?
Application Process Queries
31. How can I apply online?
32. What documents are required?
33. What is the application deadline?
34. Can I edit my application form?
35. Is offline application allowed?
36. How to upload certificates?
37. What if I enter wrong details?
38. How will I know my application status?
39. Is application fee refundable?
40. Can I apply for multiple branches?
Entrance Exam Queries
41. What rank is required for admission?
42. What is a safe score in JEE Main?
43. Does CSJMU conduct its own entrance exam?
44. How is merit calculated?
45. Are board marks considered?
46. What is counseling procedure?
47. Can I participate in spot counseling?
48. What if I miss counseling?
49. Can I apply without JEE?
50. Is there direct admission?
Fees & Financial Queries
51. What is tuition fee per year?
52. Are installment options available?
53. What is hostel fee?
54. Is fee refundable after withdrawal?
55. Are scholarships offered?
56. How to apply for scholarship?
57. Are government scholarships accepted?
58. Is there fee concession for reserved category?
59. What is exam fee?
60. Any hidden charges?
Hostel & Facilities Queries
61. Is hostel compulsory?
62. Separate hostel for girls?
63. What facilities are provided?
64. Is Wi-Fi available?
65. Are rooms AC/non-AC?
66. What is mess fee?
67. Can I stay outside campus?
68. Is transport available?
69. Are sports facilities provided?
70. Is there a library for engineering students?
Academics & Curriculum Queries
71. What is academic calendar?
72. How many semesters?
73. Is attendance compulsory?
74. Are there practical labs?
75. Is coding taught from first year?
76. Are industry projects included?
77. How are exams conducted?
78. Is grading system CGPA based?
79. Can I pursue minor specialization?
80. Are online classes available?
Placement & Career Queries
81. What is placement percentage?
82. Which companies visit?
83. Average package offered?
84. Highest package?
85. Is placement guaranteed?
86. Are internships provided?
87. Does CSJMU have training & placement cell?
88. Are coding competitions conducted?
89. Are there industry collaborations?
90. Can I pursue higher studies after B.Tech?
Miscellaneous Queries
91. Can I transfer from another college?
92. What is migration process?
93. Is ragging strictly prohibited?
94. Are extracurricular activities available?
95. Can foreign students apply?
96. Is there alumni network?
97. Are laptops mandatory?
98. Can I pursue part-time job?
99. What is dress code?
100. Who should I contact for admission help?
What is the admission timeline for B.Tech?
Can I get admission without counseling?
Is there spot admission available?
What happens after seat allotment?
How to confirm my admission?
Can I cancel admission after confirmation?
Is migration certificate required?
What if my documents are incomplete?
Can I apply after deadline?
Are provisional admissions allowed?
Is gap year allowed?
Can NIOS students apply?
Are international boards accepted?
Is domicile required?
Can I apply through management quota directly?
What is admission helpline number?
Is online counseling available?
What is reporting procedure after admission?
Can I upgrade my seat later?
What documents needed at reporting time?
🔹 CSJMU / College Specific (121–140)
Is CSJMU NAAC accredited?
What is NAAC grade of CSJMU?
Is CSJMU government or private?
Is degree from CSJMU valid worldwide?
What is campus size?
Is there Wi-Fi campus?
Are smart classrooms available?
Does CSJMU have research centers?
Are guest lectures conducted?
Is there industry tie-up?
Does CSJMU have incubation center?
Are hackathons conducted?
Does university provide certifications?
Is there innovation lab?
What extracurricular clubs exist?
Are fests organized annually?
What is student strength?
Are student elections held?
Is there anti-ragging committee?
What is grievance redressal system?
🔹 Course & Branch Deep Queries (141–170)
Which branch is best for future scope?
Is coding compulsory in all branches?
Can mechanical students learn programming?
What are electives in CSE?
Is AI better than Data Science?
What is scope of IT branch?
Are interdisciplinary courses offered?
Can I take extra certifications?
Are minor degrees available?
What programming languages are taught?
Is Python included in syllabus?
Are cloud computing courses included?
Is cybersecurity taught?
Does course include real projects?
What tools are used in labs?
Is software engineering part of syllabus?
Are open electives available?
Can I switch to AI specialization later?
What is difference between core and specialization?
How updated is syllabus?
Is syllabus industry oriented?
How many credits required?
What is credit system?
Are MOOCs allowed?
Does college support NPTEL courses?
Can I do dual specialization?
What is honors degree?
Can I do research during B.Tech?
Is project compulsory in final year?
How are internal marks calculated?
🔹 Application & Documentation (171–190)
What file format required for documents?
What is max file size for upload?
Can I upload scanned copy?
Is notarization required?
Do I need original documents?
What is self-attestation?
How to correct wrong uploaded document?
What if photo is unclear?
Can I update mobile number later?
Is email verification required?
Can I apply using phone?
What payment methods are accepted?
Is UPI accepted?
What if payment fails?
Can I reapply after rejection?
Is application ID important?
How to retrieve forgotten login?
Can I track application online?
Will I get SMS updates?
Is offline verification required?
🔹 Exams & Evaluation (191–210)
What is exam pattern?
Are exams online or offline?
What is passing marks?
What is back paper system?
How to apply for revaluation?
What is grace marks policy?
What is supplementary exam?
How many attempts allowed?
Can I carry backlog to next year?
How is CGPA calculated?
What is SGPA?
Difference between SGPA and CGPA?
How to improve grades?
Is attendance linked to exams?
What if attendance is low?
Can medical leave be considered?
What is internal assessment?
Are assignments compulsory?
Are viva exams conducted?
How practical exams are evaluated?
🔹 Placement Detailed (211–240)
When do placements start?
Are placements on-campus or off-campus?
What skills required for placement?
Is coding necessary for placement?
Are aptitude tests conducted?
Does college provide placement training?
What is role of TPO?
Are resume workshops conducted?
Are mock interviews conducted?
What is eligibility for placement?
Can backlog students sit in placement?
Are internships mandatory for placement?
What is PPO?
How many companies visit annually?
What are top recruiters?
What is average CSE package?
What is median salary?
Is startup placement available?
Are international placements offered?
What is placement success rate?
Do companies offer remote jobs?
Are students placed in government jobs?
Is GATE preparation supported?
Can I go for higher studies abroad?
Is GRE coaching available?
What is alumni placement support?
Are internships paid?
How to get off-campus placement?
Does college support freelancing?
Can I get placement in first attempt?
🔹 Hostel & Campus Life (241–260)
What is hostel timing?
Is night-out allowed?
Are visitors allowed in hostel?
Is security available?
Are CCTV cameras installed?
What is mess menu?
Is food hygienic?
Are laundry services available?
Is electricity backup available?
Are study rooms available?
Is gym available?
Are medical facilities available?
Is ambulance available?
Are festivals celebrated?
Is cultural society active?
Are tech clubs active?
What sports are available?
Are tournaments organized?
Can day scholars access facilities?
Is campus ragging-free?
🔹 Misc / Smart Chatbot Queries (261–300)
What should I bring on first day?
Is orientation program conducted?
What is dress code for classes?
Can I bring laptop to class?
What specs laptop recommended?
Is attendance online tracked?
Are notes provided digitally?
Can I record lectures?
Is there student portal?
How to access results online?
Is ID card compulsory?
What if I lose ID card?
How to contact faculty?
Are doubt sessions conducted?
Is mentoring system available?
How to join clubs?
Are competitions held?
Can I start my own club?
Are startup funds provided?
Is there entrepreneurship cell?
Can I publish research paper?
Are conferences held?
How to apply for leave?
What is disciplinary policy?
Are fines imposed?
What is anti-ragging helpline?
Can parents visit campus?
Is there parent-teacher meeting?
What is college timing?
Are holidays fixed?
What is semester break duration?
Can I change hostel room?
Is re-admission possible after drop?
What if I fail a year?
Can I restart course?
Is transfer certificate required?
How to get bonafide certificate?
Can I get duplicate marksheet?
How to contact administration?
Where to get official notices?
"""


def parse_raw_questions(raw_text: str) -> List[Dict[str, Any]]:
    lines = raw_text.strip().split("\n")
    parsed = []
    current_category = "General Admission Queries"
    q_id = 1

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
        
        # Category header detection
        if line_str.startswith("🔹") or ("Queries" in line_str and not re.match(r'^\d+\.', line_str)):
            current_category = line_str.replace("🔹", "").strip()
            continue
            
        # Question line matching
        m = re.match(r'^(\d+)\.\s*(.*)', line_str)
        if m:
            num = int(m.group(1))
            q_text = m.group(2).strip()
            parsed.append({"id": num, "category": current_category, "question": q_text})
            q_id = num + 1
        elif line_str.endswith("?"):
            parsed.append({"id": q_id, "category": current_category, "question": line_str})
            q_id += 1

    return parsed


def run_test():
    parsed_questions = parse_raw_questions(USER_QUESTIONS_TEXT)
    logger.info(f"Parsed {len(parsed_questions)} questions from user prompt.")

    engine = KnowledgeCoverageEngine()
    
    results = []
    for q in parsed_questions:
        res = engine.analyze_question(q)
        results.append(res)

    # Output JSON, CSV, XLSX
    df = pd.DataFrame(results)
    
    json_path = BASE_DIR / "docs" / "reports" / "bot_qa_test_results.json"
    csv_path = BASE_DIR / "docs" / "reports" / "bot_qa_test_results.csv"
    xlsx_path = BASE_DIR / "docs" / "reports" / "bot_qa_test_results.xlsx"

    # Ensure output directory exists
    json_path.parent.mkdir(parents=True, exist_ok=True)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    df.to_csv(csv_path, index=False, encoding="utf-8")
    df.to_excel(xlsx_path, index=False)

    # Output markdown review file where user can easily edit missing/partial answers
    md_review_path = BASE_DIR / "docs" / "reports" / "bot_answers_and_gaps_review.md"

    md_content = """# CSJMU & UIET Chatbot Answer Testing & Review Worksheet

Use this file to review the answers generated by the bot from the current knowledge base.
For questions marked as **`[MISSING]`** or **`[PARTIAL]`**, write the official answer under the **`Your Answer to Add`** section.

---

"""

    for r in results:
        status = r["coverage_status"]
        icon = "✅ COVERED" if status == "Covered" else ("⚠️ PARTIAL" if status == "Partial" else "❌ MISSING")
        
        md_content += f"""### Question #{r['question_id']}: {r['question']}
- **Category**: `{r['category']}`
- **Bot Status**: `{icon}`
- **Bot Answer (Current Knowledge Base)**:
> {r['golden_answer']}
- **Source Document**: `{r['source_document']}`
- **Confidence Score**: `{r['confidence_score']}`

**Your Answer to Add (fill below if Missing or Partial)**:
```text

```

---

"""

    with open(md_review_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    logger.info("Generated bot_qa_test_results.json, .csv, .xlsx, and bot_answers_and_gaps_review.md!")


if __name__ == "__main__":
    run_test()
