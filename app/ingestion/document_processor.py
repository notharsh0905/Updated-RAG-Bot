"""
Document Processor Module for CSJMU RAG System.
Handles file validation, SHA-256 checksum computation, multi-format text extraction (PDF, TXT, DOCX, JSON),
and semantic text chunking with metadata tagging for incremental vector store ingestion.
"""

import io
import json
import hashlib
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Dict, Any, Tuple
from langchain_core.documents import Document

import pypdf

from app.core.logging_config import setup_logger

logger = setup_logger("document_processor")

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".json"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


class DocumentProcessor:
    """Handles parsing, text extraction, checksumming, and chunking for uploaded documents."""

    @staticmethod
    def compute_sha256(file_bytes: bytes) -> str:
        """Computes SHA-256 hex digest of file contents for deduplication."""
        return hashlib.sha256(file_bytes).hexdigest()

    @staticmethod
    def validate_file(filename: str, file_bytes: bytes) -> Tuple[bool, str]:
        """
        Validates file extension and size constraints.

        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Unsupported file format '{ext}'. Allowed formats: PDF, TXT, DOCX, JSON."

        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            size_mb = round(len(file_bytes) / (1024 * 1024), 2)
            return False, f"File size ({size_mb} MB) exceeds maximum limit of 50 MB."

        if len(file_bytes) == 0:
            return False, "Uploaded file is empty (0 bytes)."

        return True, ""

    @classmethod
    def extract_text_and_pages(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Extracts raw text and page count from file bytes according to format.

        Returns:
            Dict containing 'text', 'pages', and 'page_records'
        """
        ext = Path(filename).suffix.lower()
        logger.info(f"Extracting text from file '{filename}' (format: {ext}, size: {len(file_bytes)} bytes)")

        if ext == ".pdf":
            return cls._extract_pdf(file_bytes)
        elif ext == ".txt":
            return cls._extract_txt(file_bytes)
        elif ext == ".docx":
            return cls._extract_docx(file_bytes)
        elif ext == ".json":
            return cls._extract_json(file_bytes)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    @staticmethod
    def _extract_pdf(file_bytes: bytes) -> Dict[str, Any]:
        """Extracts text page-by-page from PDF bytes using pypdf."""
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages_count = len(reader.pages)
        page_texts = []
        full_text_blocks = []

        for idx, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                page_texts.append({"page": idx, "text": text})
                full_text_blocks.append(f"--- Page {idx} ---\n{text}")

        full_text = "\n\n".join(full_text_blocks)
        if not full_text.strip():
            raise ValueError("Failed to extract readable text from PDF. File may be image-only or scanned.")

        return {
            "text": full_text,
            "pages": pages_count,
            "page_records": page_texts
        }

    @staticmethod
    def _extract_txt(file_bytes: bytes) -> Dict[str, Any]:
        """Extracts text from TXT bytes using UTF-8 decoding."""
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1", errors="ignore")

        text = text.strip()
        if not text:
            raise ValueError("TXT file contains no text content.")

        return {
            "text": text,
            "pages": 1,
            "page_records": [{"page": 1, "text": text}]
        }

    @staticmethod
    def _extract_docx(file_bytes: bytes) -> Dict[str, Any]:
        """Extracts text from DOCX file by parsing word/document.xml within zip container."""
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                xml_content = z.read("word/document.xml")
                root = ET.fromstring(xml_content)
                paragraphs = []
                for p in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
                    texts = [t.text for t in p.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t") if t.text]
                    if texts:
                        paragraphs.append("".join(texts))
                
                full_text = "\n\n".join(paragraphs).strip()
                if not full_text:
                    raise ValueError("DOCX file contains no text content.")

                est_pages = max(1, (len(full_text) // 1500) + 1)
                return {
                    "text": full_text,
                    "pages": est_pages,
                    "page_records": [{"page": 1, "text": full_text}]
                }
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX file: {str(e)}")

    @staticmethod
    def _extract_json(file_bytes: bytes) -> Dict[str, Any]:
        """Extracts and formats text from JSON data structures."""
        try:
            raw = file_bytes.decode("utf-8")
            data = json.loads(raw)
        except Exception as e:
            raise ValueError(f"Invalid JSON format: {str(e)}")

        formatted_blocks = []
        if isinstance(data, list):
            for i, item in enumerate(data, start=1):
                if isinstance(item, dict):
                    lines = [f"{k}: {v}" for k, v in item.items() if v]
                    formatted_blocks.append(f"Record {i}:\n" + "\n".join(lines))
                else:
                    formatted_blocks.append(f"Item {i}: {str(item)}")
        elif isinstance(data, dict):
            for k, v in data.items():
                formatted_blocks.append(f"### {k}\n{json.dumps(v, indent=2) if isinstance(v, (dict, list)) else str(v)}")
        else:
            formatted_blocks.append(str(data))

        full_text = "\n\n".join(formatted_blocks).strip()
        if not full_text:
            raise ValueError("JSON file contains no text data.")

        return {
            "text": full_text,
            "pages": 1,
            "page_records": [{"page": 1, "text": full_text}]
        }

    @classmethod
    def chunk_text(
        cls,
        text: str,
        filename: str,
        document_id: str,
        checksum: str,
        category: str = "uploaded_document",
        chunk_size: int = 600,
        chunk_overlap: int = 80
    ) -> List[Document]:
        """
        Splits extracted text into semantic chunk Documents with metadata tagging.

        Returns:
            List[Document]: Chunked documents ready for vector embedding.
        """
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            raw_chunks = splitter.split_text(text)
        except ImportError:
            # Fallback text chunker if langchain_text_splitters is missing
            raw_chunks = cls._fallback_chunk_text(text, chunk_size, chunk_overlap)

        documents: List[Document] = []
        doc_type_clean = category.lower().replace(" ", "_") if category else "uploaded_document"

        for idx, chunk_str in enumerate(raw_chunks, start=1):
            clean_chunk = chunk_str.strip()
            if not clean_chunk:
                continue

            metadata = {
                "source": filename,
                "doc_type": doc_type_clean,
                "category": category,
                "document_id": document_id,
                "checksum": checksum,
                "chunk_id": f"{document_id}_chunk_{idx}",
                "chunk_index": idx,
                "total_chunks": len(raw_chunks),
                "type": "child"
            }
            documents.append(Document(page_content=clean_chunk, metadata=metadata))

        logger.info(f"Generated {len(documents)} text chunks for document '{filename}' (id={document_id}).")
        return documents

    @staticmethod
    def _fallback_chunk_text(text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """Fallback character sliding-window chunker."""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for p in paragraphs:
            if len(current_chunk) + len(p) <= chunk_size:
                current_chunk += (p + "\n\n")
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = p + "\n\n"

        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks
