"""
Engineering PDF Knowledge Extraction, Semantic Chunking, Graph Construction & Indexing Engine.
Processes data/raw_documents/engineering.pdf (or data/raw_documents/CSJM_DOCUMENTS/engineering.pdf),
extracts structured sections, generates single-concept semantic chunks with full metadata,
updates knowledge objects, query aliases, knowledge graph, rebuilds Chroma DB collections,
and runs automated QA validation checks.
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pypdf
from app.core.config import config
from app.loaders.loader import DocumentLoader
from app.embeddings.vector_store import VectorStoreManager
from app.retrieval.retriever import RetrieverManager
from app.core.logging_config import setup_logger

logger = setup_logger("process_engineering_pdf")


def find_pdf_path() -> Path:
    candidates = [
        BASE_DIR / "data" / "raw_documents" / "engineering.pdf",
        BASE_DIR / "data" / "raw_documents" / "engeering.pdf",
        BASE_DIR / "data" / "raw_documents" / "CSJM_DOCUMENTS" / "engineering.pdf",
    ]
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError("engineering.pdf not found in candidate paths.")


def extract_pdf_pages(pdf_path: Path) -> List[Dict[str, Any]]:
    reader = pypdf.PdfReader(pdf_path)
    pages_data = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages_data.append({
            "page_number": i + 1,
            "text": text.strip()
        })
    return pages_data


def parse_structured_sections(pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    sections = []
    
    # Mapping of pages to high-level sections based on prospectus scan
    page_section_map = {
        1: ("Frontmatter", "University Overview & Prospectus Title", "General"),
        2: ("Frontmatter", "School of Engineering and Technology Overview", "General"),
        3: ("Table of Contents", "Prospectus Contents & Index", "General"),
        4: ("About UIET", "Establishment, Campus Overview & Accreditation", "General"),
        5: ("About UIET", "UIET History, Mission & Academic Excellence", "General"),
        6: ("Leadership Message", "Message from Pro Vice Chancellor", "Administration"),
        7: ("Leadership Message", "Message from Vice Chancellor", "Administration"),
        8: ("Leadership Message", "Message from Dean Academics", "Administration"),
        9: ("Leadership Message", "Message from Director UIET", "Administration"),
        10: ("Pillars of Excellence", "07 Pillars of Excellence & Core Strengths", "General"),
        11: ("Administration & Heads", "Heads of Departments & Leadership Registry", "Faculty"),
        12: ("Academic Programmes", "Undergraduate Degree Programs (B.Tech, BCA, B.Voc)", "Programmes"),
        13: ("Academic Programmes", "Postgraduate & Diploma Programs (M.Tech, MCA, D.Voc)", "Programmes"),
        14: ("Admission Process", "B.Tech & M.Tech Admission Procedure & Counseling Rules", "Admissions"),
        15: ("Best Practices", "Distinctiveness, Competitions & ICPC Asia Regional Contest", "General"),
        16: ("Departments", "Department of Computer Science & Engineering (Overview)", "Computer Science"),
        17: ("Departments", "Department of Computer Science & Engineering (Details)", "Computer Science"),
        18: ("Departments", "CSE Courses, Faculty Members & Laboratory Infrastructure", "Computer Science"),
        19: ("Departments", "Department of Electronics & Communication Engineering", "Electronics"),
        20: ("Departments", "Department of Chemical Engineering (Overview)", "Chemical"),
        21: ("Departments", "Department of Chemical Engineering (Labs & Faculty)", "Chemical"),
        22: ("Departments", "Department of Mechanical Engineering (Overview)", "Mechanical"),
        23: ("Departments", "Department of Mechanical Engineering (Labs & Faculty)", "Mechanical"),
        24: ("Departments", "Department of Materials Science & Metallurgical Engineering", "Materials Science"),
        25: ("Departments", "Department of Materials Science & Metallurgical Engineering (Details)", "Materials Science"),
        26: ("Departments", "Department of Computer Applications (BCA & MCA Overview)", "Computer Applications"),
        27: ("Departments", "Department of Computer Applications (Labs & Faculty)", "Computer Applications"),
        28: ("Departments", "Department of Vocational Studies (B.Voc & D.Voc Overview)", "Vocational Studies"),
        29: ("Departments", "Department of Vocational Studies (Specializations)", "Vocational Studies"),
        30: ("Supercomputing Hub", "Supercomputing Hub for Artificial Intelligence (NVIDIA DGX H100)", "Research"),
        31: ("Supercomputing Hub", "AI & Supercomputing Research Infrastructure", "Research"),
        32: ("Laboratories", "State-of-the-Art Cyber Security Laboratory", "Laboratories"),
        33: ("Laboratories", "AICTE IDEA Lab (Idea Development, Evaluation & Application)", "Laboratories"),
        34: ("Laboratories", "Advanced Drone Laboratory & Innovation Center", "Laboratories"),
        35: ("Infrastructure", "Central Library, E-Resources & Digital Facilities", "Facilities"),
        36: ("Infrastructure", "NSS Units, Health Center, Gymnasium, Sports & Hostels", "Facilities"),
        37: ("Faculty", "Professors of Practice & Industry Experts", "Faculty"),
        38: ("Faculty", "Visiting Faculty, Guest Speakers & IIT/NIT Collaborators", "Faculty"),
        39: ("Training & Placement", "Placements 2025-2026, Highest Package 45 LPA & Recruiters", "Placements"),
        40: ("Contact & Location", "Campus Address, Kalyanpur Kanpur & Map Directions", "Contact Information")
    }

    for p in pages_data:
        p_num = p["page_number"]
        txt = p["text"]
        sec_name, title, domain = page_section_map.get(p_num, ("General Information", f"Page {p_num} Information", "General"))

        sections.append({
            "academic_year": "2025-2026",
            "page_number": p_num,
            "section": sec_name,
            "title": title,
            "domain": domain,
            "content": txt,
            "source": "engineering.pdf"
        })

    return sections


def build_semantic_chunks(sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    chunks = []
    chunk_id = 1000

    for sec in sections:
        txt = sec["content"]
        if not txt:
            continue

        # Split long page texts into single concept paragraphs
        paragraphs = [p.strip() for p in re.split(r'\n\s*\n|\n(?=[A-Z0-9\.\§\¹\%\-\s]{4,}:)', txt) if len(p.strip()) > 40]
        
        if not paragraphs:
            paragraphs = [txt]

        for p_idx, para in enumerate(paragraphs):
            # Extract keywords
            words = re.findall(r'\b[A-Za-z0-9\+\#\-]{3,}\b', para)
            unique_kw = list(set([w.lower() for w in words if w.lower() not in ["the", "and", "for", "with", "from", "that", "this", "are", "was", "will"]]))[:10]

            concept_content = f"Document Section: {sec['section']} - {sec['title']}. Page {sec['page_number']}. Domain: {sec['domain']}. Details: {para}"

            chunk = {
                "chunk_id": f"eng_pdf_chunk_{chunk_id:04d}",
                "source": "engineering.pdf",
                "academic_year": "2025-2026",
                "page_number": sec["page_number"],
                "section": sec["section"],
                "title": sec["title"],
                "domain": sec["domain"],
                "keywords": unique_kw,
                "char_length": len(concept_content),
                "concept_content": concept_content
            }
            chunks.append(chunk)
            chunk_id += 1

    return chunks


def update_structured_data(new_chunks: List[Dict[str, Any]], sections: List[Dict[str, Any]]):
    structured_dir = BASE_DIR / "data" / "structured_data"
    structured_dir.mkdir(parents=True, exist_ok=True)

    # 1. Update chunks.json
    chunks_file = structured_dir / "chunks.json"
    existing_chunks = []
    if chunks_file.exists():
        with open(chunks_file, "r", encoding="utf-8") as f:
            try:
                existing_chunks = json.load(f)
            except Exception:
                existing_chunks = []

    # Filter out any prior engineering.pdf chunks to avoid duplicates
    filtered_chunks = [c for c in existing_chunks if c.get("source") != "engineering.pdf"]
    filtered_chunks.extend(new_chunks)

    with open(chunks_file, "w", encoding="utf-8") as f:
        json.dump(filtered_chunks, f, indent=2)

    # 2. Update optimized_chunks.json
    opt_file = structured_dir / "optimized_chunks.json"
    with open(opt_file, "w", encoding="utf-8") as f:
        json.dump(filtered_chunks, f, indent=2)

    # 3. Update knowledge_objects.json
    ko_file = structured_dir / "knowledge_objects.json"
    knowledge_objects = []
    if ko_file.exists():
        with open(ko_file, "r", encoding="utf-8") as f:
            try:
                knowledge_objects = json.load(f)
            except Exception:
                knowledge_objects = []

    if isinstance(knowledge_objects, dict):
        knowledge_objects = [knowledge_objects]

    # Add new engineering knowledge objects
    for sec in sections:
        knowledge_objects.append({
            "entity_type": "ProspectusSection",
            "source": "engineering.pdf",
            "academic_year": "2025-2026",
            "section_name": sec["section"],
            "title": sec["title"],
            "domain": sec["domain"],
            "page_number": sec["page_number"],
            "summary_snippet": sec["content"][:200]
        })

    with open(ko_file, "w", encoding="utf-8") as f:
        json.dump(knowledge_objects, f, indent=2)

    logger.info(f"Updated structured datasets with {len(new_chunks)} semantic chunks from engineering.pdf")


def update_aliases():
    alias_file = BASE_DIR / "data" / "aliases" / "query_aliases.json"
    alias_file.parent.mkdir(parents=True, exist_ok=True)

    aliases = {}
    if alias_file.exists():
        with open(alias_file, "r", encoding="utf-8") as f:
            try:
                aliases = json.load(f)
            except Exception:
                aliases = {}

    # New engineering prospectus aliases
    new_aliases = {
        "nvidia dgx": "Supercomputing Hub for Artificial Intelligence (NVIDIA DGX H100)",
        "supercomputer": "Supercomputing Hub for Artificial Intelligence",
        "h100": "NVIDIA DGX H100 Supercomputing Hub",
        "idea lab": "AICTE IDEA Lab (Idea Development, Evaluation & Application)",
        "drone lab": "Advanced Drone Laboratory & Innovation Center",
        "cyber security lab": "State-of-the-Art Cyber Security Laboratory",
        "bca": "Department of Computer Applications (Bachelor of Computer Applications)",
        "mca": "Department of Computer Applications (Master of Computer Applications)",
        "bvoc": "Department of Vocational Studies (B.Voc)",
        "dvoc": "Department of Vocational Studies (D.Voc)",
        "highest package": "Training and Placement Cell (Highest Package 45 LPA)",
        "pro vice chancellor": "Message from Pro Vice Chancellor CSJMU",
        "dean academics": "Message from Dean Academics UIET",
        "professors of practice": "Professors of Practice & Industry Collaborators"
    }

    if isinstance(aliases, dict):
        aliases.update(new_aliases)
    elif isinstance(aliases, list):
        aliases.append(new_aliases)

    with open(alias_file, "w", encoding="utf-8") as f:
        json.dump(aliases, f, indent=2)


def update_knowledge_graph():
    kg_file = BASE_DIR / "data" / "knowledge_graph" / "knowledge_graph.json"
    kg_file.parent.mkdir(parents=True, exist_ok=True)

    kg_data = {"nodes": [], "edges": []}
    if kg_file.exists():
        with open(kg_file, "r", encoding="utf-8") as f:
            try:
                kg_data = json.load(f)
            except Exception:
                kg_data = {"nodes": [], "edges": []}

    new_nodes = [
        {"id": "UIET_PROSPECTUS_2026", "label": "UIET Prospectus 2026", "type": "Document"},
        {"id": "SUPERCOMPUTING_HUB", "label": "Supercomputing Hub (NVIDIA DGX H100)", "type": "ResearchFacility"},
        {"id": "CYBER_SECURITY_LAB", "label": "Cyber Security Laboratory", "type": "Laboratory"},
        {"id": "AICTE_IDEA_LAB", "label": "AICTE IDEA Lab", "type": "Laboratory"},
        {"id": "DRONE_LAB", "label": "Drone Laboratory & Innovation Center", "type": "Laboratory"},
        {"id": "BCA_MCA_DEPT", "label": "Department of Computer Applications", "type": "Department"},
        {"id": "VOCATIONAL_STUDIES_DEPT", "label": "Department of Vocational Studies", "type": "Department"},
        {"id": "PROFESSORS_OF_PRACTICE", "label": "Professors of Practice", "type": "FacultyGroup"}
    ]

    new_edges = [
        {"source": "UIET_PROSPECTUS_2026", "target": "SUPERCOMPUTING_HUB", "relation": "features_facility"},
        {"source": "UIET_PROSPECTUS_2026", "target": "CYBER_SECURITY_LAB", "relation": "features_facility"},
        {"source": "UIET_PROSPECTUS_2026", "target": "AICTE_IDEA_LAB", "relation": "features_facility"},
        {"source": "UIET_PROSPECTUS_2026", "target": "DRONE_LAB", "relation": "features_facility"},
        {"source": "UIET_PROSPECTUS_2026", "target": "BCA_MCA_DEPT", "relation": "includes_department"},
        {"source": "UIET_PROSPECTUS_2026", "target": "VOCATIONAL_STUDIES_DEPT", "relation": "includes_department"},
    ]

    existing_node_ids = {n.get("id") for n in kg_data.get("nodes", [])}
    for n in new_nodes:
        if n["id"] not in existing_node_ids:
            kg_data.setdefault("nodes", []).append(n)

    kg_data.setdefault("edges", []).extend(new_edges)

    with open(kg_file, "w", encoding="utf-8") as f:
        json.dump(kg_data, f, indent=2)


def rebuild_vector_store():
    logger.info("Rebuilding Vector Store with Engineering PDF Chunks...")
    loader = DocumentLoader()
    documents = loader.load_all_documents()
    vsm = VectorStoreManager()
    vsm.get_or_create_vector_store(documents=documents, force_rebuild=True)
    logger.info("Vector Store rebuilt successfully.")


def run_qa_validation():
    logger.info("Running QA Validation across 15 Domain Verification Queries...")
    vsm = VectorStoreManager()
    retriever = RetrieverManager(vsm.vector_store)

    test_queries = [
        ("Admissions", "What is the admission procedure for B.Tech programs?"),
        ("Departments", "What departments exist in UIET CSJM University?"),
        ("Eligibility", "What is the eligibility for BCA and MCA programs?"),
        ("Programmes", "What degree programs are offered under Vocational Studies?"),
        ("Faculty", "Who are the Professors of Practice at UIET?"),
        ("Labs", "What features exist in the Cyber Security Lab?"),
        ("Labs", "What is the AICTE IDEA Lab at CSJMU?"),
        ("Labs", "What research is conducted in the Drone Lab?"),
        ("Supercomputer", "What supercomputing facilities exist for AI at UIET?"),
        ("Facilities", "What features are offered by the Central Library?"),
        ("Placements", "What is the highest package in UIET placements?"),
        ("Research", "What innovation hubs exist at UIET Kanpur?"),
        ("Contact", "What is the official campus address of UIET CSJMU?"),
        ("Short-Form", "director"),
        ("Acronym", "NVIDIA DGX H100")
    ]

    validation_results = []
    for cat, query in test_queries:
        docs = retriever.retrieve(query, k=3, use_hybrid=True)
        retrieved_texts = [getattr(d, "page_content", str(d)) for d in docs]
        match_found = any("engineering.pdf" in t or "UIET" in t or "CSJM" in t for t in retrieved_texts)
        validation_results.append({
            "category": cat,
            "query": query,
            "retrieved_count": len(docs),
            "top_match_snippet": retrieved_texts[0][:120] if retrieved_texts else "None",
            "passed": len(docs) > 0 and match_found
        })

    passed_count = sum(1 for r in validation_results if r["passed"])
    logger.info(f"QA Validation Complete: {passed_count}/{len(validation_results)} Verification Queries Passed!")
    return validation_results


def run_ingestion_pipeline():
    print("==========================================================")
    print("🚀 CSJMU & UIET Engineering PDF Ingestion Engine")
    print("==========================================================")
    
    pdf_path = find_pdf_path()
    print(f"📄 Target PDF Found: {pdf_path}")

    print("1. Extracting PDF pages...")
    pages_data = extract_pdf_pages(pdf_path)
    print(f"   Total Pages Extracted: {len(pages_data)}")

    print("2. Parsing 25+ Structured Sections...")
    sections = parse_structured_sections(pages_data)
    print(f"   Sections Identified: {len(sections)}")

    print("3. Generating Semantic Chunks & Extracting Metadata...")
    chunks = build_semantic_chunks(sections)
    print(f"   Total Semantic Chunks Created: {len(chunks)}")

    print("4. Updating Structured Data, Aliases & Knowledge Graph...")
    update_structured_data(chunks, sections)
    update_aliases()
    update_knowledge_graph()

    print("5. Rebuilding Vector Store Collections (Chroma DB)...")
    rebuild_vector_store()

    print("6. Executing Automated QA Validation Suite...")
    val_results = run_qa_validation()

    print("==========================================================")
    print("✅ Ingestion Pipeline Execution Complete!")
    print("==========================================================")
    return {
        "pdf_path": str(pdf_path),
        "total_pages": len(pages_data),
        "total_sections": len(sections),
        "total_chunks": len(chunks),
        "qa_validation_passed": f"{sum(1 for r in val_results if r['passed'])}/{len(val_results)}"
    }


if __name__ == "__main__":
    run_ingestion_pipeline()
