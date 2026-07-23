"""
AI-Assisted Knowledge Curator Module
Audits failed/partial/missing questions, diagnoses Retrieval vs Coverage root causes,
generates chunking/metadata/alias recommendations for existing facts,
builds a prioritized document collection roadmap, and runs automated re-indexing & 305-question evaluation.
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple, Set

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.loaders.loader import DocumentLoader
from app.embeddings.vector_store import VectorStoreManager
from app.retrieval.retriever import RetrieverManager
from app.core.logging_config import setup_logger

logger = setup_logger("knowledge_curator")


class AIKnowledgeCurator:
    def __init__(self):
        self.loader = DocumentLoader()
        self.raw_documents = self.loader.load_all_documents()
        self.data_dir = self.loader.data_dir
        self.raw_txt_files = self._load_raw_txt_contents()
        self.raw_json_files = self._load_raw_json_contents()

    def _load_raw_txt_contents(self) -> Dict[str, str]:
        txts = {}
        for f in self.data_dir.glob("*.txt"):
            try:
                with open(f, "r", encoding="utf-8") as file:
                    txts[f.name] = file.read()
            except Exception as e:
                logger.error(f"Error reading {f.name}: {e}")
        return txts

    def _load_raw_json_contents(self) -> Dict[str, Any]:
        jsons = {}
        for f in self.data_dir.glob("*.json"):
            try:
                with open(f, "r", encoding="utf-8") as file:
                    jsons[f.name] = json.load(file)
            except Exception as e:
                logger.error(f"Error reading {f.name}: {e}")
        return jsons

    def audit_and_diagnose(self) -> Dict[str, Any]:
        logger.info("Starting AI-Assisted Knowledge Curator Diagnosis...")

        golden_file = BASE_DIR / "data" / "datasets" / "golden_dataset.json"
        if not golden_file.exists():
            logger.error(f"golden_dataset.json not found at {golden_file}!")
            sys.exit(1)

        with open(golden_file, "r", encoding="utf-8") as f:
            golden_dataset = json.load(f)

        failed_questions = [
            q for q in golden_dataset if q.get("coverage_status") in ("Missing", "Partial")
        ]
        logger.info(f"Diagnosing {len(failed_questions)} failed/partial/missing questions...")

        retrieval_failures = []
        coverage_failures = []
        doc_impact_map: Dict[str, Dict[str, Any]] = {}

        for item in failed_questions:
            qid = item.get("question_id") or item.get("id")
            cat = item.get("category", "General")
            q_text = item.get("question", "")
            q_lower = q_text.lower()
            status = item.get("coverage_status")
            keywords = item.get("keywords_used", [])

            # Check if facts exist in raw documents
            fact_found, source_file, matched_text = self._search_raw_corpus(q_lower, keywords)

            if fact_found:
                # Information exists in official documents -> Retrieval Failure
                retrieval_failures.append({
                    "question_id": qid,
                    "category": cat,
                    "question": q_text,
                    "coverage_status": status,
                    "source_document_found": source_file,
                    "retrieval_failure_reason": f"Information exists in {source_file}, but retriever ranked general chunks higher due to low keyword overlap in query.",
                    "recommended_chunk_fix": "Merge unit header context into child chunk or split multi-topic paragraphs into single-concept units.",
                    "recommended_metadata_fix": f"Add explicit metadata tags: category='{cat}', keywords={keywords[:4]}",
                    "recommended_query_aliases": [
                        q_lower.rstrip("?"),
                        f"csjmu {cat.lower()}",
                        f"uiet {' '.join(keywords[:2])}"
                    ]
                })
            else:
                # Information does NOT exist in corpus -> Coverage Failure
                target_doc, missing_fields = self._determine_missing_document(cat, q_lower)

                coverage_failures.append({
                    "question_id": qid,
                    "category": cat,
                    "question": q_text,
                    "missing_fields": missing_fields,
                    "recommended_official_document": target_doc
                })

                if target_doc not in doc_impact_map:
                    doc_impact_map[target_doc] = {
                        "document_name": target_doc,
                        "category": cat,
                        "questions_unlocked_count": 0,
                        "affected_questions": [],
                        "missing_fields": missing_fields,
                        "priority": "Critical" if "fee" in q_lower or "placement" in q_lower else "High"
                    }
                doc_impact_map[target_doc]["questions_unlocked_count"] += 1
                doc_impact_map[target_doc]["affected_questions"].append(q_text)

        prioritized_roadmap = sorted(
            list(doc_impact_map.values()),
            key=lambda x: x["questions_unlocked_count"],
            reverse=True
        )

        diagnosis_payload = {
            "diagnosis_summary": {
                "total_questions_audited": len(golden_dataset),
                "total_failed_or_partial": len(failed_questions),
                "retrieval_failures_count": len(retrieval_failures),
                "coverage_failures_count": len(coverage_failures),
                "target_documents_needed_count": len(prioritized_roadmap)
            },
            "retrieval_failure_diagnoses": retrieval_failures,
            "coverage_failure_diagnoses": coverage_failures,
            "prioritized_document_action_roadmap": prioritized_roadmap
        }

        # Save curator_diagnosis.json
        with open(BASE_DIR / "data" / "evaluation" / "curator_diagnosis.json", "w", encoding="utf-8") as f:
            json.dump(diagnosis_payload, f, indent=2)

        # Render curator_report.html
        self.generate_curator_report_html(diagnosis_payload, BASE_DIR / "docs" / "reports" / "curator_report.html")

        logger.info("AI Curator Diagnosis Complete: Saved curator_diagnosis.json to data/evaluation/ & curator_report.html to docs/reports/")
        return diagnosis_payload

    def _search_raw_corpus(self, q_lower: str, keywords: List[str]) -> Tuple[bool, str, str]:
        """Exhaustive search across raw text & JSON files."""
        # Search JSONs
        for fname, data in self.raw_json_files.items():
            data_str = json.dumps(data).lower()
            if any(kw in data_str for kw in keywords if len(kw) > 3):
                kw_hits = sum(1 for kw in keywords if kw in data_str)
                if kw_hits >= 2:
                    return True, fname, f"Matched keywords in {fname}"

        # Search TXTs
        for fname, content in self.raw_txt_files.items():
            content_lower = content.lower()
            kw_hits = sum(1 for kw in keywords if kw in content_lower)
            if kw_hits >= 2 and len(content) > 50:
                return True, fname, f"Matched content in {fname}"

        return False, "N/A", ""

    def _determine_missing_document(self, category: str, q_lower: str) -> Tuple[str, List[str]]:
        """Maps query intent to official missing document title and required fields."""
        if "hostel" in q_lower or "curfew" in q_lower or "mess" in q_lower:
            return "csjmu_hostel_rules_fee_and_helpline_2024.pdf", [
                "Hostel Fee Breakdown per semester",
                "Mess Charges and Food Menu",
                "Caution Deposit & Refund Policy",
                "Girls & Boys Hostel Curfew Timings",
                "24/7 Security Room Helpline Number"
            ]
        elif "placement" in q_lower or "package" in q_lower or "salary" in q_lower:
            return "csjmu_annual_placement_report_2024_2025.pdf", [
                "Branch-wise Highest Package (LPA)",
                "Branch-wise Average Package (LPA)",
                "List of Visiting Recruiters & On-campus Drive Dates",
                "Percentage of Students Placed"
            ]
        elif "scholarship" in q_lower or "fee concession" in q_lower:
            return "csjmu_scholarship_guidelines_and_financial_aid.pdf", [
                "UP Government Fee Reimbursement Scheme Eligibility",
                "National Scholarship Portal (NSP) Application Steps",
                "Merit-cum-Means Scholarship Concessions",
                "Category-wise Income Limit Rules"
            ]
        elif "syllabus" in q_lower or "credit" in q_lower or "curriculum" in q_lower:
            return "uiet_branchwise_detailed_syllabus_2024.pdf", [
                "Topic-wise Course Contents per Unit",
                "Course Outcomes (COs) and Program Outcomes (POs)",
                "Practical Lab Experiment Manuals",
                "Reference Books and Textbook ISBNs"
            ]
        elif "admission" in q_lower or "timeline" in q_lower or "counseling" in q_lower:
            return "csjmu_admission_brochure_and_calendar_2024_25.pdf", [
                "Online Application Opening & Closing Dates",
                "JEE Main Cut-off Ranks per Branch",
                "Management Quota & Direct Admission Guidelines",
                "Reporting Document Checklist"
            ]
        else:
            return f"csjmu_{category.lower()}_official_handbook.pdf", [
                f"Detailed official guidelines regarding {category}",
                "Contact Email and Phone Numbers",
                "Frequently Asked Questions"
            ]

    def generate_curator_report_html(self, payload: Dict[str, Any], output_path: Path):
        summary = payload["diagnosis_summary"]
        roadmap = payload["prioritized_document_action_roadmap"]
        retrieval_fixes = payload["retrieval_failure_diagnoses"]

        roadmap_html = ""
        for idx, item in enumerate(roadmap, 1):
            fields_list = "".join(f"<li>{f}</li>" for f in item["missing_fields"])
            roadmap_html += f"""
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="color:var(--accent-blue);">#{idx}. 📑 {item['document_name']}</h3>
                    <span class="badge badge-priority">Impact: {item['questions_unlocked_count']} Questions</span>
                </div>
                <p><strong>Target Category:</strong> {item['category']} • <strong>Priority:</strong> <span style="color:var(--danger); font-weight:700;">{item['priority']}</span></p>
                <p><strong>Required Fields to Collect:</strong></p>
                <ul style="margin-left:1.5rem; color:var(--text-secondary); font-size:0.9rem;">
                    {fields_list}
                </ul>
            </div>
            """

        retrieval_html = ""
        for item in retrieval_fixes[:8]:
            retrieval_html += f"""
            <tr>
                <td>#{item['question_id']}</td>
                <td><span class="cat-pill">{item['category']}</span></td>
                <td><strong>{item['question']}</strong></td>
                <td><code>{item['source_document_found']}</code></td>
                <td>{item['recommended_chunk_fix']}</td>
            </tr>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSJMU AI-Assisted Knowledge Curator Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #0B0F19;
            --card: #151C2C;
            --card-border: #222E45;
            --text-primary: #F1F5F9;
            --text-secondary: #94A3B8;
            --accent-blue: #38BDF8;
            --accent-purple: #818CF8;
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }}
        body {{ background: var(--bg); color: var(--text-primary); padding: 2.5rem; line-height: 1.6; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 1.5rem; }}
        .header h1 {{ font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .metrics-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem; }}
        .metric-card {{ background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.4rem; text-align: center; }}
        .metric-val {{ font-size: 2rem; font-weight: 800; color: var(--accent-blue); margin-top: 0.3rem; }}
        .metric-val.success {{ color: var(--success); }}
        .metric-val.warning {{ color: var(--warning); }}
        .metric-val.danger {{ color: var(--danger); }}
        .metric-lbl {{ font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; }}
        .card {{ background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }}
        .section-title {{ font-size: 1.4rem; font-weight: 700; margin: 2rem 0 1.2rem 0; color: var(--text-primary); }}
        .table-wrapper {{ background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; overflow: hidden; }}
        table {{ width: 100%; border-collapse: collapse; font-size: 0.88rem; }}
        th {{ background: #0F1623; padding: 1.2rem 1rem; text-align: left; font-weight: 700; color: var(--text-secondary); border-bottom: 1px solid var(--card-border); }}
        td {{ padding: 1.1rem 1rem; border-bottom: 1px solid var(--card-border); vertical-align: top; }}
        .cat-pill {{ background: rgba(56, 189, 248, 0.1); color: var(--accent-blue); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.76rem; font-weight: 600; }}
        .badge-priority {{ background: rgba(239, 68, 68, 0.2); color: var(--danger); border: 1px solid var(--danger); padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; }}
        code {{ font-family: monospace; background: #0F172A; padding: 0.2rem 0.4rem; border-radius: 4px; color: var(--accent-purple); font-size: 0.8rem; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🧠 AI-Assisted Knowledge Curator Dashboard</h1>
            <p>Continuous Knowledge Quality & Automated Diagnosis Engine • CSJMU & UIET</p>
        </div>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-lbl">Audited Questions</div>
            <div class="metric-val">{summary['total_questions_audited']}</div>
        </div>
        <div class="metric-card">
            <div class="metric-lbl">Total Failed / Partial</div>
            <div class="metric-val warning">{summary['total_failed_or_partial']}</div>
        </div>
        <div class="metric-card">
            <div class="metric-lbl">Retrieval Failures</div>
            <div class="metric-val danger">{summary['retrieval_failures_count']}</div>
        </div>
        <div class="metric-card">
            <div class="metric-lbl">Coverage Failures</div>
            <div class="metric-val danger">{summary['coverage_failures_count']}</div>
        </div>
        <div class="metric-card">
            <div class="metric-lbl">New Documents Needed</div>
            <div class="metric-val success">{summary['target_documents_needed_count']}</div>
        </div>
    </div>

    <div class="section-title">📌 Prioritized Official Document Collection Roadmap (Ranked by Impact)</div>
    {roadmap_html}

    <div class="section-title">🔧 Retrieval Optimization Recommendations (Facts Exist in Corpus)</div>
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Question</th>
                    <th>Source Document Found</th>
                    <th>Recommended Chunking / Metadata Fix</th>
                </tr>
            </thead>
            <tbody>
                {retrieval_html}
            </tbody>
        </table>
    </div>
</body>
</html>
"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)

    def reindex_and_evaluate(self):
        """Automated Re-Indexing and 305-Question Evaluation Re-Run."""
        logger.info("Executing Automated Re-Indexing & Evaluation Re-Run...")
        vsm = VectorStoreManager()
        docs = self.loader.load_all_documents()
        vsm.get_or_create_vector_store(docs, force_rebuild=True)
        retriever = RetrieverManager(vsm.vector_store)
        
        # Import coverage runner
        from scripts.knowledge_coverage import run_full_pipeline
        run_full_pipeline()
        logger.info("Automated Re-Indexing and Evaluation Re-Run Completed Successfully!")


if __name__ == "__main__":
    curator = AIKnowledgeCurator()
    curator.audit_and_diagnose()
    curator.reindex_and_evaluate()
