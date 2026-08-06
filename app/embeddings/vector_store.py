"""
Vector Store management module. Handles Chroma DB initialization, document embedding
via EmbeddingService (Ollama & OpenRouter), index persistence, and database rebuild operations.
"""

from typing import List, Optional
from langchain_core.documents import Document
from langchain_chroma import Chroma

from app.core.config import config
from app.embeddings.embedding_service import EmbeddingService
from app.core.logging_config import setup_logger

logger = setup_logger("vector_store")


class VectorStoreManager:
    """Manages the Chroma vector database and EmbeddingService integration."""

    def __init__(
        self,
        embedding_service: Optional[EmbeddingService] = None,
        persist_dir: Optional[str] = None,
        collection_name: Optional[str] = None,
    ):
        """
        Initializes VectorStoreManager.

        Args:
            embedding_service (Optional[EmbeddingService]): Embedding service instance.
            persist_dir (Optional[str]): Chroma database persistence path.
            collection_name (Optional[str]): Chroma collection name.
        """
        self.embeddings = embedding_service or EmbeddingService()
        self.embedding_model_name = self.embeddings.model_name
        self.persist_dir = str(persist_dir or config.CHROMA_DB_DIR)
        self.collection_name = collection_name or config.get_effective_collection_name()

        logger.info(
            f"Initializing Chroma Vector Store: dir='{self.persist_dir}', "
            f"collection='{self.collection_name}', provider='{self.embeddings.provider}', "
            f"model='{self.embedding_model_name}'"
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
        Automatically rebuilds collection using stored documents if collection does not exist.

        Args:
            documents (Optional[List[Document]]): Documents to index if empty or rebuilding.
            force_rebuild (bool): If True, clear existing items and re-index.

        Returns:
            Chroma: Ready-to-use Chroma vector store instance.
        """
        try:
            existing_ids = self.vector_store.get().get("ids", [])
        except Exception as e:
            logger.warning(f"Failed to query existing Chroma collection '{self.collection_name}' ({e}). Assuming empty.")
            existing_ids = []

        if force_rebuild:
            logger.info("Force rebuild requested. Clearing existing vector store...")
            if existing_ids:
                self.vector_store.delete(ids=existing_ids)
                existing_ids = []

        if not existing_ids:
            # Check for legacy 'collection50' collection created before provider separation
            if self.embeddings.provider == "ollama" and self.collection_name != "collection50":
                try:
                    legacy_store = Chroma(
                        embedding_function=self.embeddings,
                        persist_directory=self.persist_dir,
                        collection_name="collection50"
                    )
                    legacy_ids = legacy_store.get().get("ids", [])
                    if legacy_ids:
                        logger.info(f"Found {len(legacy_ids)} existing documents in legacy Chroma collection 'collection50'. Reusing 'collection50'.")
                        self.collection_name = "collection50"
                        self.vector_store = legacy_store
                        existing_ids = legacy_ids
                except Exception as e:
                    logger.debug(f"Legacy collection check passed: {e}")

        if not existing_ids:
            if not documents:
                logger.info(
                    f"Collection '{self.collection_name}' does not exist or is empty. "
                    "Automatically loading all repository and uploaded documents for embedding build..."
                )
                from app.loaders.loader import DocumentLoader
                documents = DocumentLoader().load_all_documents()


            if documents:
                logger.info(f"Adding {len(documents)} documents to Chroma collection '{self.collection_name}' in batches of 50...")
                batch_size = 50
                total_batches = (len(documents) + batch_size - 1) // batch_size
                for i in range(0, len(documents), batch_size):
                    batch = documents[i:i + batch_size]
                    try:
                        self.vector_store.add_documents(batch)
                    except Exception as e:
                        if "dimension" in str(e).lower():
                            logger.warning(f"Vector dimension mismatch detected in Chroma collection '{self.collection_name}' ({e}). Recreating collection...")
                            try:
                                self.vector_store._client.delete_collection(self.collection_name)
                            except Exception:
                                pass
                            self.vector_store = Chroma(
                                embedding_function=self.embeddings,
                                persist_directory=self.persist_dir,
                                collection_name=self.collection_name
                            )
                            self.vector_store.add_documents(batch)
                        else:
                            raise
                    logger.info(f"Indexed batch {i // batch_size + 1}/{total_batches} ({len(batch)} docs)")
                logger.info(f"Document indexing completed successfully for collection '{self.collection_name}'.")

            else:
                logger.warning("Vector store is empty, but no documents were found to ingest.")
        else:
            logger.info(f"Reusing existing vector store collection '{self.collection_name}' with {len(existing_ids)} indexed documents.")

        return self.vector_store

    def get_count(self) -> int:
        """Returns the number of indexed documents in the collection."""
        try:
            return len(self.vector_store.get().get("ids", []))
        except Exception:
            return 0

