"""
Vector Store management module. Handles Chroma DB initialization, document embedding
via Ollama, index persistence, and database rebuild operations.
"""

from typing import List, Optional
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma

from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("vector_store")


class VectorStoreManager:
    """Manages the Chroma vector database and Ollama embedding integration."""

    def __init__(
        self,
        embedding_model: Optional[str] = None,
        ollama_url: Optional[str] = None,
        persist_dir: Optional[str] = None,
        collection_name: Optional[str] = None,
    ):
        """
        Initializes VectorStoreManager.

        Args:
            embedding_model (Optional[str]): Embedding model name.
            ollama_url (Optional[str]): Ollama base URL.
            persist_dir (Optional[str]): Chroma database persistence path.
            collection_name (Optional[str]): Chroma collection name.
        """
        self.embedding_model_name = embedding_model or config.EMBEDDING_MODEL
        self.ollama_url = ollama_url or config.OLLAMA_BASE_URL
        self.persist_dir = str(persist_dir or config.CHROMA_DB_DIR)
        self.collection_name = collection_name or config.COLLECTION_NAME

        logger.info(
            f"Initializing OllamaEmbeddings: model='{self.embedding_model_name}', "
            f"base_url='{self.ollama_url}'"
        )
        self.embeddings = OllamaEmbeddings(
            model=self.embedding_model_name,
            base_url=self.ollama_url
        )

        logger.info(
            f"Initializing Chroma Vector Store: dir='{self.persist_dir}', "
            f"collection='{self.collection_name}'"
        )
        self.vector_store = Chroma(
            embedding_function=self.embeddings,
            persist_directory=self.persist_dir,
            collection_name=self.collection_name
        )

    def get_or_create_vector_store(
        self,
        documents: Optional[List[Document]] = None,
        force_rebuild: bool = False
    ) -> Chroma:
        """
        Retrieves existing Chroma vector store or populates it if empty / forced.

        Args:
            documents (Optional[List[Document]]): Documents to index if empty or rebuilding.
            force_rebuild (bool): If True, clear existing items and re-index.

        Returns:
            Chroma: Ready-to-use Chroma vector store instance.
        """
        existing_ids = self.vector_store.get().get("ids", [])

        if force_rebuild:
            logger.info("Force rebuild requested. Clearing existing vector store...")
            if existing_ids:
                self.vector_store.delete(ids=existing_ids)
                existing_ids = []

        if not existing_ids:
            if documents:
                logger.info(f"Adding {len(documents)} documents to Chroma collection '{self.collection_name}' in batches of 50...")
                batch_size = 50
                total_batches = (len(documents) + batch_size - 1) // batch_size
                for i in range(0, len(documents), batch_size):
                    batch = documents[i:i + batch_size]
                    self.vector_store.add_documents(batch)
                    logger.info(f"Indexed batch {i // batch_size + 1}/{total_batches} ({len(batch)} docs)")
                logger.info("Document indexing completed successfully.")
            else:
                logger.warning("Vector store is empty, but no documents were provided to ingest.")
        else:
            logger.info(f"Reusing existing vector store with {len(existing_ids)} indexed documents.")

        return self.vector_store

    def get_count(self) -> int:
        """Returns the number of indexed documents in the collection."""
        return len(self.vector_store.get().get("ids", []))
