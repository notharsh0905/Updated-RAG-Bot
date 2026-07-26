"""
Unit and Integration Tests for CSJMU RAG System modules.
"""


import pytest
from pathlib import Path
from app.core.config import config
from app.loaders.formatter import (
    uiet_designation_format_doc,
    uiet_teachers_format_doc,
    allumini_format_doc,
    format_admission_coordinator_doc,
    approved_boards_format_doc,
    course_eligibility_format_doc,
    department_format_doc,
)
from app.loaders.loader import DocumentLoader
from app.rag.prompt import PromptBuilder


def test_uiet_designation_formatter():
    sample = {
        "name": "Dr. Test Name",
        "designation": "Director",
        "email": "test@csjmu.ac.in",
        "mobile_no": "9999999999",
        "profile_url": "http://csjmu.ac.in/test"
    }
    result = uiet_designation_format_doc(sample)
    assert "Dr. Test Name" in result
    assert "Director" in result
    assert "test@csjmu.ac.in" in result


def test_uiet_teachers_formatter():
    sample = {
        "name": "Dr. John Doe",
        "department": "Computer Science",
        "about": "Expert in Machine Learning."
    }
    result = uiet_teachers_format_doc(sample)
    assert "Dr. John Doe" in result
    assert "Computer Science" in result


def test_prompt_builder():
    context = "CSJMU was established in 1966 in Kanpur."
    question = "When was CSJMU established?"
    
    strict_p = PromptBuilder.build_strict_prompt(context, question)
    assert "You are a document assistant" in strict_p
    assert question in strict_p

    flexible_p = PromptBuilder.build_flexible_prompt(context, question)
    assert "based on the context" in flexible_p
    assert question in flexible_p


def test_document_loader():
    loader = DocumentLoader()
    documents = loader.load_all_documents()
    assert len(documents) > 0
    assert any(doc.metadata.get("type") == "child" for doc in documents)
    assert any(doc.metadata.get("type") == "parent" for doc in documents)
