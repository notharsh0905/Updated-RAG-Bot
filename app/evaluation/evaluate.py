"""
CSJMU RAG System - Automatic Evaluation Framework.
Phase 1: Batch evaluates university questions against the RAG system,
flags response issues, calculates statistics, and exports CSV, Excel, and HTML reports.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.rag.rag import RAGPipeline
from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("evaluation_framework")

FALLBACK_PHRASES = [
    "i don't know",
    "i do not know",
    "not mentioned in the context",
    "no context provided",
    "insufficient information",
    "i am unable to answer",
    "not specified in the provided documents",
    "context does not contain"
]


def evaluate_question(pipeline: RAGPipeline, item: Dict[str, Any], k: int = 5) -> Dict[str, Any]:
    """
    Evaluates a single question against the RAG Pipeline.

    Args:
        pipeline (RAGPipeline): Initialized RAG pipeline.
        item (Dict[str, Any]): Question item with 'id', 'category', 'question'.
        k (int): Top K chunks to retrieve.

    Returns:
        Dict[str, Any]: Evaluation record.
    """
    qid = item.get("id")
    category = item.get("category", "General")
    question = item.get("question", "").strip()

    start_time = time.time()
    http_status = 200
    answer = ""
    sources = []
    error_msg = None

    try:
        res = pipeline.ask(question=question, k=k, strict_prompt=True, return_sources=True)
        answer = res.get("answer", "")
        sources = res.get("sources", [])
    except Exception as e:
        http_status = 500
        error_msg = str(e)
        answer = f"ERROR: {str(e)}"
        logger.error(f"Error evaluating question {qid}: {e}")

    elapsed_time = round(time.time() - start_time, 3)
    word_count = len(answer.split()) if answer else 0
    answer_lower = answer.lower()

    # Flagging rules
    flag_reasons = []
    if http_status != 200 or error_msg:
        flag_reasons.append("API/Execution Error")
    if not answer or answer.strip() == "":
        flag_reasons.append("Empty Answer")
    if any(phrase in answer_lower for phrase in FALLBACK_PHRASES):
        flag_reasons.append("Fallback ('I don't know')")
    if word_count < 20 and "ERROR" not in answer:
        flag_reasons.append("Short Answer (<20 words)")
    if answer.endswith("...") or answer.endswith("…") or answer.endswith("and"):
        flag_reasons.append("Incomplete Answer")

    passed = len(flag_reasons) == 0
    retrieval_count = len(sources)
    retrieval_score = round(min(1.0, retrieval_count / max(1, k)), 2)

    return {
        "id": qid,
        "category": category,
        "question": question,
        "answer": answer,
        "response_time_sec": elapsed_time,
        "word_count": word_count,
        "http_status": http_status,
        "retrieval_count": retrieval_count,
        "retrieval_score": retrieval_score,
        "passed": passed,
        "status": "PASS" if passed else "FAIL",
        "flags": ", ".join(flag_reasons) if flag_reasons else "None",
        "flag_count": len(flag_reasons)
    }


def generate_html_report(results: List[Dict[str, Any]], stats: Dict[str, Any], output_path: Path):
    """Generates an interactive HTML Dashboard report."""
    rows_html = ""
    for r in results:
        status_class = "pass" if r["passed"] else "fail"
        flag_badge = f'<span class="badge {status_class}">{r["status"]}</span>'
        flags_text = f'<span class="flags">{r["flags"]}</span>' if r["flags"] != "None" else '<span class="text-muted">None</span>'
        
        rows_html += f"""
        <tr class="{status_class}">
            <td>{r["id"]}</td>
            <td><span class="category-pill">{r["category"]}</span></td>
            <td><strong>{r["question"]}</strong></td>
            <td><div class="answer-cell">{r["answer"]}</div></td>
            <td>{r["response_time_sec"]}s</td>
            <td>{r["word_count"]}</td>
            <td>{flag_badge}</td>
            <td>{flags_text}</td>
        </tr>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSJMU RAG System — Evaluation Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #0F172A;
            --card: #1E293B;
            --text: #F8FAFC;
            --muted: #94A3B8;
            --primary: #38BDF8;
            --success: #22C55E;
            --danger: #EF4444;
            --border: #334155;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }}
        body {{ background: var(--bg); color: var(--text); padding: 2rem; line-height: 1.5; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }}
        .header h1 {{ font-size: 1.8rem; font-weight: 700; color: var(--primary); }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }}
        .stat-card {{ background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.2rem; text-align: center; }}
        .stat-val {{ font-size: 1.8rem; font-weight: 700; color: var(--primary); margin-top: 0.2rem; }}
        .stat-val.success {{ color: var(--success); }}
        .stat-val.danger {{ color: var(--danger); }}
        .stat-lbl {{ font-size: 0.85rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }}
        .table-container {{ background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }}
        table {{ width: 100%; border-collapse: collapse; font-size: 0.9rem; }}
        th {{ background: #0F172A; padding: 1rem; text-align: left; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border); }}
        td {{ padding: 1rem; border-bottom: 1px solid var(--border); vertical-align: top; }}
        tr.fail {{ background: rgba(239, 68, 68, 0.05); }}
        .answer-cell {{ max-height: 120px; overflow-y: auto; color: #E2E8F0; font-size: 0.85rem; white-space: pre-wrap; }}
        .badge {{ padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; display: inline-block; }}
        .badge.pass {{ background: rgba(34, 197, 94, 0.2); color: var(--success); }}
        .badge.fail {{ background: rgba(239, 68, 68, 0.2); color: var(--danger); }}
        .category-pill {{ background: #334155; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color: var(--primary); }}
        .flags {{ color: #FCA5A5; font-size: 0.8rem; font-weight: 500; }}
        .search-bar {{ width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: var(--text); margin-bottom: 1rem; font-size: 0.9rem; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🎓 CSJMU RAG System Evaluation Dashboard</h1>
            <p style="color: var(--muted); font-size: 0.9rem;">Automated Test Suite Execution Report • Phase 1 Framework</p>
        </div>
        <div>
            <span class="badge pass" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Accuracy: {stats["accuracy_pct"]}%</span>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-lbl">Total Questions</div>
            <div class="stat-val">{stats["total"]}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">Successful</div>
            <div class="stat-val success">{stats["passed"]}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">Failed / Flagged</div>
            <div class="stat-val danger">{stats["failed"]}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">Empty Answers</div>
            <div class="stat-val danger">{stats["empty"]}</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">Avg Response Time</div>
            <div class="stat-val">{stats["avg_time_sec"]}s</div>
        </div>
        <div class="stat-card">
            <div class="stat-lbl">Avg Retrieval Score</div>
            <div class="stat-val">{stats["avg_retrieval_score"]}</div>
        </div>
    </div>

    <input type="text" id="searchInput" class="search-bar" placeholder="Search questions, answers, category, or flags..." onkeyup="filterTable()">

    <div class="table-container">
        <table id="evalTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Question</th>
                    <th style="width: 35%;">Chatbot Answer</th>
                    <th>Latency</th>
                    <th>Words</th>
                    <th>Status</th>
                    <th>Flags</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>
    </div>

    <script>
        function filterTable() {{
            const input = document.getElementById('searchInput').value.toLowerCase();
            const rows = document.querySelectorAll('#evalTable tbody tr');
            rows.forEach(row => {{
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(input) ? '' : 'none';
            }});
        }}
    </script>
</body>
</html>
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)


def main():
    parser = argparse.ArgumentParser(description="CSJMU RAG Automated Evaluation Framework")
    parser.add_argument("--file", type=str, default=str(BASE_DIR / "data" / "evaluation" / "eval_questions.json"), help="Path to question JSON file")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of questions to evaluate (0 for all)")
    parser.add_argument("--k", type=int, default=config.DEFAULT_K, help="Top K context chunks")
    args = parser.parse_args()

    questions_file = Path(args.file)
    if not questions_file.exists():
        print(f"❌ Error: Question file '{questions_file}' not found.")
        sys.exit(1)

    print(f"================================================================")
    print(f"🚀 Launching CSJMU RAG Automated Evaluation Suite")
    print(f"📄 Question File: {questions_file}")
    print(f"================================================================")

    with open(questions_file, "r", encoding="utf-8") as f:
        questions_data = json.load(f)

    if args.limit > 0:
        questions_data = questions_data[:args.limit]

    print(f"⏳ Initializing RAG Pipeline...")
    pipeline = RAGPipeline()

    print(f"🚀 Evaluating {len(questions_data)} questions...\n")
    results = []

    for i, item in enumerate(questions_data, 1):
        res = evaluate_question(pipeline, item, k=args.k)
        results.append(res)
        status_icon = "✅" if res["passed"] else "⚠️"
        print(f"[{i}/{len(questions_data)}] {status_icon} Q#{res['id']} [{res['category']}] ({res['response_time_sec']}s) - {res['question'][:50]}...")
        if not res["passed"]:
            print(f"    ↳ Flags: {res['flags']}")

    # Statistics Calculation
    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed
    empty = sum(1 for r in results if "Empty Answer" in r["flags"])
    avg_time = round(sum(r["response_time_sec"] for r in results) / max(1, total), 3)
    avg_retrieval = round(sum(r["retrieval_score"] for r in results) / max(1, total), 2)
    accuracy_pct = round((passed / max(1, total)) * 100, 2)

    stats = {
        "total": total,
        "passed": passed,
        "failed": failed,
        "empty": empty,
        "avg_time_sec": avg_time,
        "avg_retrieval_score": avg_retrieval,
        "accuracy_pct": accuracy_pct
    }

    # Data Exports
    df = pd.DataFrame(results)
    csv_path = BASE_DIR / "docs" / "reports" / "eval_results.csv"
    excel_path = BASE_DIR / "docs" / "reports" / "eval_results.xlsx"
    html_path = BASE_DIR / "docs" / "reports" / "eval_report.html"

    # Ensure output directory exists
    csv_path.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(csv_path, index=False)
    try:
        df.to_excel(excel_path, index=False)
    except Exception as e:
        logger.warning(f"Could not export Excel: {e}")

    generate_html_report(results, stats, html_path)

    # Print Summary Terminal Table
    summary_banner = f"""
    ================================================================
    📊 CSJMU RAG AUTOMATED EVALUATION SUMMARY
    ================================================================
    Total Questions Evaluated : {total}
    Successful Answers (PASS) : {passed}
    Failed / Flagged (FAIL)   : {failed}
    Empty Answers             : {empty}
    Average Latency           : {avg_time} sec
    Average Retrieval Score   : {avg_retrieval}
    Overall Accuracy Rate     : {accuracy_pct}%
    ================================================================
    📁 Reports Exported:
      - CSV Report      : {csv_path}
      - Excel Report    : {excel_path}
      - HTML Dashboard  : {html_path}
    ================================================================
    """
    print(summary_banner)


if __name__ == "__main__":
    main()
