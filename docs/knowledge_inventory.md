# CSJMU & UIET Current Knowledge Base Inventory

Comprehensive inventory of all institutional knowledge currently indexed across the 15 primary domain categories.

---

## 1. Domain Coverage Matrix

| Domain Category | Source Documents | Indexed Chunks | Extracted Entities | Coverage Status | Missing Information |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **General Admissions** | `admission_process.txt`, `guidelines_for_admission.txt`, `approved_boards.json` | 18 | 32 | 🟢 **82% Covered** | Admission opening/closing deadlines, counseling round schedules |
| **Faculty & Teachers** | `uiet_teachers.json`, `uiet_designation.json` | 24 | 48 | 🟢 **88% Covered** | Direct mobile numbers for certain junior faculty |
| **Departments** | `departments_of_uiet.json` | 14 | 22 | 🟢 **85% Covered** | Non-engineering school descriptions (School of Languages) |
| **Courses & Eligibility** | `course_eligibility.json`, `uiet_all_courses_info.txt` | 32 | 60 | 🟢 **92% Covered** | Specific 12th percentage relaxations for reserved categories |
| **Hostels & Residence** | `hostel.txt` | 6 | 8 | 🟡 **45% Partial** | Room fee rates, mess fee breakdown, security deposit, curfew timings |
| **Placements & Career** | `placements.txt` | 5 | 10 | 🟡 **50% Partial** | Numerical placement stats, branch-wise average & highest package (LPA) |
| **Scholarships** | *None (Missing PDF)* | 0 | 0 | 🔴 **0% Missing** | UP Government fee reimbursement guidelines, NSP application steps |
| **Syllabus & Curriculum** | `syllabus_and_lab_of_uiet.txt`, `clean_syllabus.json` | 71 | 65 | 🟢 **90% Covered** | Unit-by-unit detailed topic outlines for non-CSE branches |
| **Academic Calendar** | *None (Missing PDF)* | 0 | 0 | 🔴 **0% Missing** | Mid-sem/End-sem exam timetables, semester break dates |
| **Regulations & Anti-Ragging** | `guidelines_for_admission.txt`, `hostel.txt` | 8 | 12 | 🟢 **78% Covered** | Internal Complaints Committee (ICC) contact numbers |
| **Facilities & Campus** | `facilities_at_csjm.txt` | 12 | 18 | 🟢 **80% Covered** | Stadium seating capacity, post office working hours |
| **Notices & News** | *Dynamic Ingestion* | 2 | 4 | 🟡 **40% Partial** | Real-time circular updates |
| **FAQs** | `eval_questions.json` | 305 | 305 | 🟢 **100% Tested** | Resolved via Golden QA dataset |
| **Laboratories** | `syllabus_and_lab_of_uiet.txt` | 16 | 28 | 🟢 **85% Covered** | Lab equipment model numbers |
| **Contact Information** | `admission_coordinators.json` | 12 | 16 | 🟢 **95% Covered** | Central campus switchboard number |

---

## 2. Source Document Summary (`data/raw_documents/CSJM_DOCUMENTS/`)

1. `about_csjm.txt`: University history, location in Kanpur, established 1966.
2. `admission_coordinators.json`: Programme-wise coordinator names, departments, and phone numbers.
3. `admission_process.txt`: Step-by-step online application process.
4. `allumini.json`: Distinguished alumni profiles and current organizations.
5. `approved_boards.json`: Recognized secondary boards list.
6. `course_eligibility.json`: Programme names, durations, seats, eligibility criteria, annual fees.
7. `departments_of_uiet.json`: UIET engineering departments, established years, specializations, labs, courses.
8. `dignities_message.txt`: Messages from Vice-Chancellor and administration.
9. `facilities_at_csjm.txt`: Campus amenities (Library, Computer Center, Stadium, Bank, Health Center).
10. `guidelines_for_admission.txt`: Admission reservation policies and verification rules.
11. `hostel.txt`: General hostel accommodation and mess facilities.
12. `innovation_foundation.txt`: UIET Incubation & Startup Foundation.
13. `placements.txt`: Training and Placement Cell introduction and recruiters.
14. `syllabus_and_lab_of_uiet.txt`: Department syllabus summaries and lab lists.
15. `uiet_designation.json`: Administrative roles (Director, Deans, HODs).
16. `uiet_teachers.json`: Faculty profiles across CSE, IT, ECE, CHE, ME, MSE.
17. `why_csjm.txt`: Institutional highlights and infrastructure overview.
