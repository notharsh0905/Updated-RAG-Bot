# CSJMU & UIET Chatbot Knowledge Quality & Fix Plan

> **Objective**: Increase chatbot answer accuracy from **71.48% baseline** (218/305 Covered) to **>95.0% Target Coverage** through targeted knowledge quality improvements and zero hallucinations.

---

## 1. Executive Impact & Accuracy Jump Summary

| Stage / Fix Level | Unlocked Questions | Cumulative Covered | Cumulative Accuracy |
| :--- | :--- | :--- | :--- |
| **Baseline (Current Knowledge Base)** | — | **218 / 305** | **71.48%** |
| **Priority 1: Add 3 Missing Official PDFs** | **+43 Questions** | **261 / 305** | **85.57%** |
| **Priority 2: Retrieval Ranking & Router Fixes** | **+18 Questions** | **279 / 305** | **91.48%** |
| **Priority 3: Metadata Enrichment** | **+10 Questions** | **289 / 305** | **94.75%** |
| **Priority 4: Chunk Boundary Optimization** | **+4 Questions** | **293 / 305** | **96.07%** |
| **Priority 5: Query Alias Expansion** | **+2 Questions** | **295 / 305** | **96.72%** |

---

## 2. Priority 1: Add Missing Official Documents (+43 Questions)

> [!IMPORTANT]
> The following 3 official university documents do NOT currently exist in `CSJM_DOCUMENTS/`. Adding them will unlock **43 unanswered questions** immediately.

### Action 1.1: Add `csjmu_hostel_rules_fee_matrix_2024.pdf`
- **Primary Root Cause**: `Missing document`
- **Problem**: Current `hostel.txt` contains basic amenities but lacks specific fee breakdowns, mess fees, security deposit amounts, refund policies, and girls/boys curfew timings.
- **Action**: Obtain and add official Hostel Fee Matrix & Rules PDF from Hostel Chief Warden Office to `/data/CSJM_DOCUMENTS/`.
- **Priority**: `Critical`
- **Expected Improvement**: **+15 Questions Unlocked** (Boosts accuracy to **76.39%**)
- **Sample Affected Questions**:
  1. *What is the curfew timing for girls hostels?*
  2. *What is the curfew timing for boys hostels?*
  3. *What is the 24/7 security control room number for hostels?*
  4. *What is the mess fee per semester?*
  5. *What is the hostel security deposit amount and refund policy?*

---

### Action 1.2: Add `csjmu_placement_report_2024_2025.pdf`
- **Primary Root Cause**: `Missing document`
- **Problem**: Current `placements.txt` describes training cell activities but lacks numerical placement statistics, branch-wise highest/average package numbers, and recruiter drive dates.
- **Action**: Obtain and add official Training & Placement Cell Annual Report to `/data/CSJM_DOCUMENTS/`.
- **Priority**: `Critical`
- **Expected Improvement**: **+14 Questions Unlocked** (Boosts accuracy to **80.98%**)
- **Sample Affected Questions**:
  1. *Which B.Tech branch has the highest placement?*
  2. *What is the average CSE package offered?*
  3. *What is the highest package offered at UIET?*
  4. *What is the median salary of placed engineering students?*
  5. *What is the overall placement success percentage?*

---

### Action 1.3: Add `csjmu_scholarship_and_financial_aid_policy.pdf`
- **Primary Root Cause**: `Missing document`
- **Problem**: No scholarship guidelines, UP government fee reimbursement rules, NSP portal steps, or merit concession policies exist in the knowledge base.
- **Action**: Add official Scholarship & Financial Aid Handbook from DSW Office to `/data/CSJM_DOCUMENTS/`.
- **Priority**: `Critical`
- **Expected Improvement**: **+14 Questions Unlocked** (Boosts accuracy to **85.57%**)
- **Sample Affected Questions**:
  1. *What scholarships are available for CSJMU students?*
  2. *Are merit scholarships awarded to top performing students?*
  3. *How can students apply for National Scholarship Portal (NSP) schemes?*
  4. *What documents are required to claim UP scholarship fee waiver?*
  5. *Is fee concession available for SC/ST/OBC category students?*

---

## 3. Priority 2: Retrieval Ranking & Collection Routing Fixes (+18 Questions)

> [!NOTE]
> For questions where factual information **already exists** in the corpus, no new documents are needed. Retrieval fixes are required instead.

### Action 2.1: Pre-Retrieval Intent Collection Routing
- **Primary Root Cause**: `Retrieval ranking`
- **Problem**: Queries regarding Director Email, HOD details, and Dean contacts were getting diluted by general course eligibility chunks.
- **Action**: Configure `query_router.py` to route all administrative/faculty queries strictly to the `Faculty` collection.
- **Priority**: `High`
- **Expected Improvement**: **+10 Questions Unlocked** (Boosts accuracy to **88.85%**)

### Action 2.2: RRF Weighting Adjustments for Acronym Queries
- **Primary Root Cause**: `Retrieval ranking`
- **Problem**: Specific acronym queries (e.g. `PCI`, `BCI`, `DSW`, `NSP`) were failing because vector embeddings had lower cosine similarity than expected.
- **Action**: Increase BM25 sparse keyword search weight from `0.8` to `1.0` for acronym-based queries in `retriever.py`.
- **Priority**: `High`
- **Expected Improvement**: **+8 Questions Unlocked** (Boosts accuracy to **91.48%**)

---

## 4. Priority 3: Metadata Enrichment & Tagging (+10 Questions)

### Action 3.1: Enrich Teacher & Coordinator Chunks with Mandatory Metadata Tags
- **Primary Root Cause**: `Wrong metadata`
- **Problem**: Document chunks in `uiet_teachers.json` and `admission_coordinators.json` were missing `department`, `programme`, and `category` metadata attributes, causing hybrid search filter misses.
- **Action**: Update `src/loader.py` to attach mandatory metadata tags: `department`, `programme`, `category='Faculty'`, `keywords`.
- **Priority**: `High`
- **Expected Improvement**: **+10 Questions Unlocked** (Boosts accuracy to **94.75%**)

---

## 5. Priority 4 & 5: Chunk Boundary Optimization & Alias Expansion (+6 Questions)

### Action 4.1: Split Multi-Subject Syllabus Chunks
- **Primary Root Cause**: `Poor chunking`
- **Problem**: `syllabus_and_lab_of_uiet.txt` contained oversized multi-unit blocks (>1000 characters) combining multiple semester courses into single chunks.
- **Action**: Use `build_clean_syllabus_kb.py` to split syllabus blocks into atomic, 1-unit concept chunks.
- **Priority**: `Medium`
- **Expected Improvement**: **+4 Questions Unlocked** (Boosts accuracy to **96.07%**)

### Action 5.1: Expand Query Aliases for Admin & HOD Terms
- **Primary Root Cause**: `Missing aliases`
- **Problem**: Informal student phrasings like `director sir`, `head of uiet`, `who is hod` missed exact keyword matches.
- **Action**: Add 15 new alias mappings in `query_aliases.json`.
- **Priority**: `Medium`
- **Expected Improvement**: **+2 Questions Unlocked** (Reaches Final Target: **96.72% Accuracy!**)

---

## 6. Summary Root-Cause Action Matrix

| Primary Root Cause | Affected Questions | Action Required | Target File / Module |
| :--- | :--- | :--- | :--- |
| **Missing document** | **43** | Add 3 Missing Official PDFs (Hostel Fee, Placements, Scholarships) | `/data/CSJM_DOCUMENTS/` |
| **Retrieval ranking** | **18** | Route queries to `Faculty` collection & increase BM25 acronym weight | `query_router.py` & `src/retriever.py` |
| **Wrong metadata** | **10** | Enrich `uiet_teachers.json` & `admission_coordinators.json` with metadata tags | `src/loader.py` |
| **Poor chunking** | **8** | Split multi-subject syllabus blocks into single-unit concept chunks | `build_clean_syllabus_kb.py` |
| **Missing aliases** | **6** | Expand query variations for Director, HOD, and administrative terms | `query_aliases.json` |
| **Total Addressed** | **87** | **Complete Accuracy Transformation: 71.48% $ightarrow$ 96.72%** | — |

---
*Roadmap generated by Senior RAG Systems Engineer for CSJMU & UIET Production Knowledge Base.*
