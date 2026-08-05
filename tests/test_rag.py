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
    assert "You are the official CSJMU" in strict_p
    assert question in strict_p

    flexible_p = PromptBuilder.build_flexible_prompt(context, question)
    assert "official CSJMU" in flexible_p
    assert question in flexible_p


def test_document_loader():
    loader = DocumentLoader()
    documents = loader.load_all_documents()
    assert len(documents) > 0
    assert any(doc.metadata.get("type") == "child" for doc in documents)
    assert any(doc.metadata.get("type") == "parent" for doc in documents)


def test_sanitize_response_outer_code_block_stripping():
    from app.rag.rag import RAGPipeline

    # Case 1: Outer ```markdown wrapper enclosing complete response
    wrapped_md = "```markdown\n## Overview\nCSJMU is located in Kanpur.\n```"
    unwrapped = RAGPipeline.sanitize_response(wrapped_md)
    assert unwrapped == "## Overview\nCSJMU is located in Kanpur."

    # Case 2: Outer ``` wrapper with inner code block
    wrapped_with_code = "```markdown\n## Code Example\nHere is python code:\n```python\nprint('hello')\n```\nDone.\n```"
    unwrapped_with_code = RAGPipeline.sanitize_response(wrapped_with_code)
    assert unwrapped_with_code == "## Code Example\nHere is python code:\n```python\nprint('hello')\n```\nDone."
    assert "```python\nprint('hello')\n```" in unwrapped_with_code

    # Case 3: Legitimate python code block without outer markdown wrapper
    raw_code = "## Code Example\n```python\nprint('hello')\n```"
    sanitized_raw = RAGPipeline.sanitize_response(raw_code)
    assert sanitized_raw == "## Code Example\n```python\nprint('hello')\n```"
