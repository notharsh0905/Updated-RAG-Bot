"""
Dataset loader module. Reads raw JSON and TXT files from the data directory,
applies dataset-specific formatting, and constructs LangChain Document collections
with parent/child metadata tagging.
"""

import json
from pathlib import Path
from typing import List, Optional
from langchain_core.documents import Document

from app.core.config import config
from app.loaders.formatter import (
    uiet_designation_format_doc,
    uiet_teachers_format_doc,
    allumini_format_doc,
    format_admission_coordinator_doc,
    approved_boards_format_doc,
    course_eligibility_format_doc,
    department_format_doc,
    scholarship_format_doc,
    innovation_startup_format_doc,
)
from app.core.logging_config import setup_logger

logger = setup_logger("loader")


class DocumentLoader:
    """Loads and processes institutional documents into LangChain Document format."""

    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initializes DocumentLoader.

        Args:
            data_dir (Optional[Path]): Directory containing CSJM_DOCUMENTS files.
        """
        self.data_dir = data_dir or config.get_resolved_data_dir()

    def load_all_documents(self) -> List[Document]:
        """
        Loads and parses all JSON and TXT datasets into LangChain Documents.

        Returns:
            List[Document]: Comprehensive list of chunked child and parent documents.
        """
        document_collection: List[Document] = []
        logger.info(f"Loading document collection from: {self.data_dir}")

        # 1. uiet_designation.json
        self._load_uiet_designation(document_collection)

        # 2. uiet_teachers.json
        self._load_uiet_teachers(document_collection)

        # 3. allumini.json
        self._load_allumini(document_collection)

        # 4. syllabus_and_lab_of_uiet.txt
        self._load_syllabus_and_labs(document_collection)

        # 5. admission_coordinators.json
        self._load_admission_coordinators(document_collection)

        # 6. approved_boards.json
        self._load_approved_boards(document_collection)

        # 7. course_eligibility.json
        self._load_course_eligibility(document_collection)

        # 8. departments_of_uiet.json
        self._load_departments(document_collection)

        # 9. dignities_message.txt
        self._load_dignities_messages(document_collection)

        # 10. facilities_at_csjm.txt
        self._load_facilities(document_collection)

        # 11. guidelines_for_admission.txt
        self._load_admission_guidelines(document_collection)

        # 12. hostel.txt
        self._load_hostel(document_collection)

        # 13. innovation_foundation.txt
        self._load_innovation_foundation(document_collection)

        # 14. placements.txt
        self._load_placements(document_collection)

        # 15. about_csjm.txt
        self._load_about_csjm(document_collection)

        # 16. scholarship_and_schemes.json
        self._load_scholarship_and_schemes(document_collection)

        # 17. campus_innovation_and_startups.json
        self._load_campus_innovation_and_startups(document_collection)

        # 18. optimized_chunks.json (Cleaned single-concept syllabus & entity chunks)
        self._load_optimized_syllabus_chunks(document_collection)

        # 19. User-Uploaded Documents (data/uploads)
        self._load_uploaded_documents(document_collection)

        logger.info(f"Successfully loaded and formatted {len(document_collection)} total documents.")
        return document_collection

    def _load_uploaded_documents(self, collection: List[Document]) -> None:
        """Loads and chunks all user-uploaded files from data/uploads directory."""
        uploads_dir = config.BASE_DIR / "data" / "uploads"
        meta_json_path = uploads_dir / "metadata.json"
        if not meta_json_path.exists():
            return

        try:
            with open(meta_json_path, "r", encoding="utf-8") as f:
                records = json.load(f)

            from app.ingestion.document_processor import DocumentProcessor

            loaded_count = 0
            for item in records:
                stored_name = item.get("stored_filename")
                orig_name = item.get("original_filename", "uploaded_doc")
                doc_id = item.get("document_id", "doc_uploaded")
                checksum = item.get("checksum", "")
                category = item.get("category", "admissions")

                if not stored_name:
                    continue

                file_path = uploads_dir / stored_name
                if not file_path.exists():
                    continue

                try:
                    with open(file_path, "rb") as bf:
                        content_bytes = bf.read()

                    extracted = DocumentProcessor.extract_text_and_pages(content_bytes, orig_name)
                    chunks = DocumentProcessor.chunk_text(
                        text=extracted["text"],
                        filename=orig_name,
                        document_id=doc_id,
                        checksum=checksum,
                        category=category
                    )
                    collection.extend(chunks)
                    loaded_count += len(chunks)
                except Exception as e:
                    logger.error(f"Failed to process uploaded file '{stored_name}' during loader initialization: {e}")

            logger.info(f"Loaded {loaded_count} total chunks from {len(records)} user-uploaded documents in data/uploads.")
        except Exception as e:
            logger.error(f"Error loading uploaded documents catalog: {e}")

    def _load_scholarship_and_schemes(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "scholarship_and_schemes.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "scholarship_and_schemes.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "scholarship_and_schemes"}
        )
        for i, item in enumerate(data, start=1):
            text = scholarship_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "scholarship_and_schemes",
                        "category": item.get("category")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_campus_innovation_and_startups(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "campus_innovation_and_startups.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "campus_innovation_and_startups.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "campus_innovation_and_startups"}
        )
        for i, item in enumerate(data, start=1):
            text = innovation_startup_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "campus_innovation_and_startups",
                        "name": item.get("facility_name") or item.get("startup_name")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_uiet_designation(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "uiet_designation.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "uiet_designation.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "designation"}
        )
        for i, item in enumerate(data, start=1):
            text = uiet_designation_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "designation",
                        "name": item.get("name"),
                        "administrative_role": item.get("designation")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_uiet_teachers(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "uiet_teachers.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "uiet_teachers.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "professors"}
        )
        for i, item in enumerate(data, start=1):
            text = uiet_teachers_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "professors",
                        "name": item.get("name"),
                        "department": item.get("department")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_allumini(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "allumini.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "allumini.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "allumini"}
        )
        for i, item in enumerate(data, start=1):
            text = allumini_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "allumini",
                        "name": item.get("name"),
                        "designation": item.get("designation"),
                        "organization": item.get("organization")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_syllabus_and_labs(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "syllabus_and_lab_of_uiet.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("\n\n\n")
        doc_name = "syllabus_and_lab_of_uiet.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "syllabus and lab of uiet"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            dept = block.split("\n")[0]
            collection.append(
                Document(
                    page_content=block,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "syllabus and lab of uiet",
                        "department": dept
                    }
                )
            )
            parent_doc.page_content += block + "\n\n\n"
        collection.append(parent_doc)

    def _load_admission_coordinators(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "admission_coordinators.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "admission_coordinators.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "coordinators"}
        )
        for i, item in enumerate(data, start=1):
            text = format_admission_coordinator_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "coordinators",
                        "name": item.get("Name"),
                        "programme": item.get("Programme"),
                        "Departments": item.get("Departments")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_approved_boards(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "approved_boards.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "approved_boards.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "approved_board"}
        )
        for i, item in enumerate(data, start=1):
            text = approved_boards_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "approved_board",
                        "board_name": item.get("name")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_course_eligibility(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "course_eligibility.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        doc_name = "course_eligibility.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "course_eligibility"}
        )
        for i, item in enumerate(data, start=1):
            text = course_eligibility_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "course_eligibility",
                        "course_name": item.get("Name of the Programme")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_departments(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "departments_of_uiet.json"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file).get("departments", [])

        doc_name = "departments_of_uiet.json"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "department"}
        )
        for i, item in enumerate(data, start=1):
            text = department_format_doc(item)
            collection.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "department",
                        "department_name": item.get("name")
                    }
                )
            )
            parent_doc.page_content += text + "\n"
        collection.append(parent_doc)

    def _load_dignities_messages(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "dignities_message.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("MESSAGE FROM ")
        doc_name = "dignities_messages.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "messages"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            formatted_text = "MESSAGE FROM " + block
            sender = formatted_text.split("\n")[0]
            collection.append(
                Document(
                    page_content=formatted_text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "messages",
                        "message_from": sender
                    }
                )
            )
            parent_doc.page_content += formatted_text + "\n\n"
        collection.append(parent_doc)

    def _load_facilities(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "facilities_at_csjm.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("\n\n\n")
        doc_name = "facilities_at_csjm.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "facilities"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            section_title = block.split("\n")[0]
            collection.append(
                Document(
                    page_content=block,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "facilities",
                        "section": section_title
                    }
                )
            )
            parent_doc.page_content += block + "\n\n"
        collection.append(parent_doc)

    def _load_admission_guidelines(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "guidelines_for_admission.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("\n\n\n")
        doc_name = "guidelines_for_admission.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "admission_guidelines"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            section_title = block.split("\n")[0]
            collection.append(
                Document(
                    page_content=block,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "admission_guidelines",
                        "section": section_title
                    }
                )
            )
            parent_doc.page_content += block + "\n\n"
        collection.append(parent_doc)

    def _load_hostel(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "hostel.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("\n\n\n")
        doc_name = "hostel.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "hostel"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            section_title = block.split("\n")[0]
            collection.append(
                Document(
                    page_content=block,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "hostel",
                        "section": section_title
                    }
                )
            )
            parent_doc.page_content += block + "\n\n"
        collection.append(parent_doc)

    def _load_innovation_foundation(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "innovation_foundation.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("\n\n\n")
        doc_name = "innovation_foundation.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "innovation_foundation"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            section_title = block.split("\n")[0]
            collection.append(
                Document(
                    page_content=block,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "csjmif",
                        "section": section_title
                    }
                )
            )
            parent_doc.page_content += block + "\n\n"
        collection.append(parent_doc)

    def _load_placements(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "placements.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("\n\n\n")
        doc_name = "placements.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "placements"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            section_title = block.split("\n")[0]
            collection.append(
                Document(
                    page_content=block,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "placements",
                        "section": section_title
                    }
                )
            )
            parent_doc.page_content += block + "\n\n"
        collection.append(parent_doc)

    def _load_about_csjm(self, collection: List[Document]) -> None:
        file_path = self.data_dir / "about_csjm.txt"
        if not file_path.exists():
            logger.warning(f"File not found: {file_path}")
            return
        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        blocks = raw_text.split("ABOUT ")
        doc_name = "about_csjm.txt"
        parent_doc = Document(
            page_content="",
            metadata={"source": doc_name, "type": "parent", "id": 0, "doc_type": "about"}
        )
        for i, block in enumerate(blocks, start=1):
            if not block.strip():
                continue
            formatted_text = "ABOUT " + block
            section_title = formatted_text.split(":-")[0].strip()
            collection.append(
                Document(
                    page_content=formatted_text,
                    metadata={
                        "source": doc_name,
                        "type": "child",
                        "id": i,
                        "doc_type": "about",
                        "section": section_title
                    }
                )
            )
            parent_doc.page_content += formatted_text + "\n\n"
        collection.append(parent_doc)

    def _load_optimized_syllabus_chunks(self, collection: List[Document]) -> None:
        opt_file = config.BASE_DIR / "data" / "structured_data" / "optimized_chunks.json"
        if not opt_file.exists():
            opt_file = config.BASE_DIR / "data" / "structured_data" / "chunks.json"
        if not opt_file.exists():
            logger.warning(f"Syllabus chunks file not found: {opt_file}")
            return

        with open(opt_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        for item in data:
            txt = item.get("concept_content", "").strip()
            if not txt:
                continue
            meta = {
                "source": "clean_syllabus.json",
                "doc_type": "syllabus",
                "category": item.get("category", "Syllabus"),
                "subject_code": item.get("subject_code", ""),
                "subject_name": item.get("subject_name", ""),
                "semester": str(item.get("semester", "")),
                "unit_name": item.get("unit_name", ""),
                "topic_name": item.get("topic_name", ""),
                "chunk_id": item.get("chunk_id", ""),
                "type": "child"
            }
            collection.append(Document(page_content=txt, metadata=meta))
        logger.info(f"Loaded {len(data)} structured concept chunks from {opt_file.name}.")
