"""
Update Knowledge Script - Stage 2 Human Validation Feedback Processor
Reads human annotations from human_review.xlsx or human_review.csv, categorizes error taxonomy,
generates 4 diagnostic roadmap JSON files, and renders the interactive review_report.html dashboard.
Does NOT overwrite the original Golden Dataset.
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.core.logging_config import setup_logger

logger = setup_logger("update_knowledge")


def run_knowledge_update():
    xlsx_path = BASE_DIR / "data" / "review" / "human_review.xlsx"
    csv_path = BASE_DIR / "data" / "review" / "human_review.csv"

    if xlsx_path.exists():
        logger.info(f"Reading human review annotations from {xlsx_path}...")
        df = pd.read_excel(xlsx_path)
    elif csv_path.exists():
        logger.info(f"Reading human review annotations from {csv_path}...")
        df = pd.read_csv(csv_path)
    else:
        logger.error(f"No human_review.xlsx or human_review.csv file found at {xlsx_path} / {csv_path}!")
        sys.exit(1)

    records = df.to_dict(orient="records")
    logger.info(f"Processing {len(records)} human-reviewed questions...")

    wrong_answers = []
    retrieval_improvements = []
    missing_documents = []
    prompt_improvements = []

    correct_cnt = 0
    partial_cnt = 0
    wrong_cnt = 0
    hallucination_cnt = 0
    missing_cnt = 0
    retrieval_err_cnt = 0
    knowledge_err_cnt = 0
    prompt_err_cnt = 0

    for r in records:
        qid = r.get("Question ID")
        cat = r.get("Category", "General")
        q_text = r.get("Question", "")
        gen_ans = str(r.get("Generated Answer", ""))
        gold_ans = str(r.get("Golden Answer", ""))
        src_doc = str(r.get("Source Document", "N/A"))
        src_chunk = str(r.get("Source Chunk", "N/A"))
        conf_score = float(r.get("Confidence Score", 0.0))
        sim_score = float(r.get("Similarity Score", 0.0))
        cov_status = str(r.get("Coverage Status", ""))
        human_rev = str(r.get("Human Review", "")).strip()
        notes = str(r.get("Reviewer Notes", ""))

        if pd.isna(notes) or notes == "nan":
            notes = ""

        # Categorize Human Review
        if "Correct" in human_rev and "Partially" not in human_rev:
            correct_cnt += 1
        elif "Partially Correct" in human_rev or "Partial" in human_rev:
            partial_cnt += 1
            knowledge_err_cnt += 1
            prompt_err_cnt += 1
            missing_documents.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "status": "Partial",
                "missing_details": notes or "Answer incomplete or missing specific numerical metrics.",
                "suggested_document": f"csjmu_{cat.lower()}_detailed.pdf"
            })
            prompt_improvements.append({
                "question_id": qid,
                "question": q_text,
                "issue": "Partial Context Provided",
                "action": "Instruct prompt to explicitly list available subset and request missing fields cleanly."
            })
        elif "Wrong Answer" in human_rev:
            wrong_cnt += 1
            prompt_err_cnt += 1
            wrong_answers.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "generated_answer": gen_ans,
                "golden_answer": gold_ans,
                "reviewer_notes": notes,
                "error_type": "Wrong Answer"
            })
            prompt_improvements.append({
                "question_id": qid,
                "question": q_text,
                "issue": "Incorrect Fact Extraction",
                "action": "Refine system prompt constraints to enforce strict context-only extraction."
            })
        elif "Hallucination" in human_rev:
            hallucination_cnt += 1
            prompt_err_cnt += 1
            wrong_answers.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "generated_answer": gen_ans,
                "golden_answer": gold_ans,
                "reviewer_notes": notes,
                "error_type": "Hallucination"
            })
            prompt_improvements.append({
                "question_id": qid,
                "question": q_text,
                "issue": "Hallucination / Fabrication",
                "action": "Enforce zero-hallucination fallback logic and strict document quote verification."
            })
        elif "Wrong Source" in human_rev:
            wrong_cnt += 1
            retrieval_err_cnt += 1
            wrong_answers.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "generated_answer": gen_ans,
                "source_document": src_doc,
                "reviewer_notes": notes,
                "error_type": "Wrong Source"
            })
            retrieval_improvements.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "current_source": src_doc,
                "current_chunk": src_chunk,
                "issue": "Irrelevant Document Retrieved",
                "recommended_fix": "Boost BM25 keyword weighting or adjust chunk metadata tags."
            })
        elif "Needs Better Retrieval" in human_rev:
            retrieval_err_cnt += 1
            retrieval_improvements.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "current_source": src_doc,
                "current_chunk": src_chunk,
                "issue": "Suboptimal Chunk Ranking",
                "recommended_fix": "Increase hybrid retrieval top_k from 5 to 8 or enable parent-document retrieval."
            })
        elif "Missing Information" in human_rev or "Missing" in human_rev:
            missing_cnt += 1
            knowledge_err_cnt += 1
            missing_documents.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "status": "Missing",
                "reason": notes or f"No document in current knowledge base covers {cat} query.",
                "suggested_document": f"csjmu_{cat.lower()}_official_document.pdf"
            })
        else:
            correct_cnt += 1

    total_reviewed = len(records)
    
    # 1. Save wrong_answers.json
    with open(BASE_DIR / "data" / "evaluation" / "wrong_answers.json", "w", encoding="utf-8") as f:
        json.dump({
            "total_wrong_or_hallucinated": len(wrong_answers),
            "records": wrong_answers
        }, f, indent=2)

    # 2. Save retrieval_improvements.json
    with open(BASE_DIR / "data" / "evaluation" / "retrieval_improvements.json", "w", encoding="utf-8") as f:
        json.dump({
            "total_retrieval_issues": len(retrieval_improvements),
            "records": retrieval_improvements
        }, f, indent=2)

    # 3. Save missing_documents.json
    with open(BASE_DIR / "data" / "evaluation" / "missing_documents.json", "w", encoding="utf-8") as f:
        json.dump({
            "total_missing_or_partial": len(missing_documents),
            "records": missing_documents
        }, f, indent=2)

    # 4. Save prompt_improvements.json
    with open(BASE_DIR / "data" / "evaluation" / "prompt_improvements.json", "w", encoding="utf-8") as f:
        json.dump({
            "total_prompt_issues": len(prompt_improvements),
            "records": prompt_improvements
        }, f, indent=2)

    logger.info("Saved wrong_answers.json, retrieval_improvements.json, missing_documents.json, prompt_improvements.json to data/evaluation/")

    # Generate Statistical Breakdown
    stats = {
        "total_questions": total_reviewed,
        "correct_questions": correct_cnt,
        "partial_questions": partial_cnt,
        "wrong_questions": wrong_cnt,
        "hallucinated_questions": hallucination_cnt,
        "missing_questions": missing_cnt,
        "retrieval_errors": retrieval_err_cnt,
        "knowledge_errors": knowledge_err_cnt,
        "prompt_errors": prompt_err_cnt,
        "accuracy_rate": round((correct_cnt / max(1, total_reviewed)) * 100, 2)
    }

    # Render review_report.html
    render_review_report_html(records, stats, BASE_DIR / "docs" / "reports" / "review_report.html")
    logger.info(f"Generated Stage 2 Review Report at: {BASE_DIR / 'docs' / 'reports' / 'review_report.html'}")


def render_review_report_html(records: List[Dict[str, Any]], stats: Dict[str, Any], output_path: Path):
    rows_html = ""
    for r in records:
        rev = str(r.get("Human Review", "✅ Correct")).strip()
        
        if "Correct" in rev and "Partially" not in rev:
            badge_cls = "badge-correct"
        elif "Partially" in rev:
            badge_cls = "badge-partial"
        elif "Wrong" in rev or "Hallucination" in rev:
            badge_cls = "badge-wrong"
        elif "Retrieval" in rev:
            badge_cls = "badge-retrieval"
        else:
            badge_cls = "badge-missing"

        rows_html += f"""
        <tr>
            <td>#{r.get('Question ID')}</td>
            <td><span class="cat-pill">{r.get('Category')}</span></td>
            <td><strong>{r.get('Question')}</strong></td>
            <td><div class="ans-box">{r.get('Generated Answer')}</div></td>
            <td><code>{r.get('Source Document', 'N/A')}</code></td>
            <td><span class="badge {badge_cls}">{rev}</span></td>
            <td class="notes-cell">{r.get('Reviewer Notes', '') or 'N/A'}</td>
        </tr>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSJMU & UIET Stage 2 Human Validation Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #090D16;
            --card: #131A2A;
            --card-border: #1E293B;
            --text-primary: #F8FAFC;
            --text-secondary: #94A3B8;
            --accent-blue: #38BDF8;
            --accent-purple: #A855F7;
            --success: #22C55E;
            --warning: #F59E0B;
            --danger: #EF4444;
        }}

        * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }}
        body {{ background: var(--bg); color: var(--text-primary); padding: 2.5rem; line-height: 1.6; }}

        .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 1.5rem; }}
        .header h1 {{ font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .header p {{ color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.3rem; }}

        .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem; }}
        .stat-card {{ background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.4rem; text-align: center; }}
        .stat-val {{ font-size: 2rem; font-weight: 800; color: var(--accent-blue); margin-top: 0.3rem; }}
        .stat-val.success {{ color: var(--success); }}
        .stat-val.warning {{ color: var(--warning); }}
        .stat-val.danger {{ color: var(--danger); }}
        .stat-lbl {{ font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; }}

        .table-wrapper {{ background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
        table {{ width: 100%; border-collapse: collapse; font-size: 0.88rem; }}
        th {{ background: #0B1120; padding: 1.2rem 1rem; text-align: left; font-weight: 700; color: var(--text-secondary); border-bottom: 1px solid var(--card-border); }}
        td {{ padding: 1.1rem 1rem; border-bottom: 1px solid var(--card-border); vertical-align: top; }}

        .ans-box {{ max-height: 120px; overflow-y: auto; color: #CBD5E1; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; }}
        .cat-pill {{ background: rgba(56, 189, 248, 0.1); color: var(--accent-blue); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.76rem; font-weight: 600; }}
        .notes-cell {{ color: #94A3B8; font-size: 0.82rem; font-style: italic; }}

        .badge {{ padding: 0.3rem 0.7rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; display: inline-block; }}
        .badge-correct {{ background: rgba(34, 197, 94, 0.2); color: var(--success); border: 1px solid var(--success); }}
        .badge-partial {{ background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid var(--warning); }}
        .badge-wrong {{ background: rgba(239, 68, 68, 0.2); color: var(--danger); border: 1px solid var(--danger); }}
        .badge-retrieval {{ background: rgba(168, 85, 247, 0.2); color: var(--accent-purple); border: 1px solid var(--accent-purple); }}
        .badge-missing {{ background: rgba(148, 163, 184, 0.2); color: #94A3B8; border: 1px solid #94A3B8; }}

        code {{ font-family: monospace; background: #0F172A; padding: 0.2rem 0.4rem; border-radius: 4px; color: var(--accent-purple); font-size: 0.8rem; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🛡️ CSJMU & UIET Stage 2 Human Validation Report</h1>
            <p>Second-Stage Human Audit & Error Taxonomy Dashboard • {stats['total_questions']} Questions Reviewed</p>
        </div>
        <div>
            <span class="badge badge-correct" style="font-size: 1rem; padding: 0.6rem 1.2rem;">Accuracy: {stats['accuracy_rate']}%</span>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-lbl">Total Reviewed</div>
            <div class="stat-val">{stats['total_questions']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">✅ Correct</div>
            <div class="stat-val success">{stats['correct_questions']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">⚠ Partial</div>
            <div class="stat-val warning">{stats['partial_questions']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">❌ Wrong Answers</div>
            <div class="stat-val danger">{stats['wrong_questions']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">❌ Hallucinations</div>
            <div class="stat-val danger">{stats['hallucinated_questions']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">❌ Missing Info</div>
            <div class="stat-val">{stats['missing_questions']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">🔍 Retrieval Errors</div>
            <div class="stat-val warning">{stats['retrieval_errors']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">📚 Knowledge Errors</div>
            <div class="stat-val warning">{stats['knowledge_errors']}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">💬 Prompt Errors</div>
            <div class="stat-val danger">{stats['prompt_errors']}</div>
        </div>
    </div>

    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Question</th>
                    <th>Generated Answer</th>
                    <th>Source Document</th>
                    <th>Human Review Status</th>
                    <th>Reviewer Notes</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>
    </div>
</body>
</html>
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)


if __name__ == "__main__":
    run_knowledge_update()
