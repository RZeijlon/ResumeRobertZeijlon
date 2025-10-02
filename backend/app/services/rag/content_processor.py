"""
Content processor service for RAG system
Handles content ingestion and embedding generation
"""

from pathlib import Path
from typing import Dict, Any

from app.core.config import settings
from app.core.logging import get_logger
from app.repositories.vector_repository import VectorRepository
from app.services.embedding_service import embedding_service

logger = get_logger(__name__)


class ContentProcessor:
    """Service for processing content and generating embeddings"""

    def __init__(self, vector_repo: VectorRepository):
        self.vector_repo = vector_repo

    async def process_content_directory(
        self,
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Process all content files and generate embeddings

        Args:
            force_refresh: If True, reprocess all content

        Returns:
            Processing statistics
        """
        logger.info("Processing content directory for embeddings...")

        content_path = Path(settings.CONTENT_PATH)
        if not content_path.exists():
            logger.error(f"Content directory not found: {content_path}")
            return {"error": "Content directory not found"}

        stats = {
            "processed_files": 0,
            "generated_embeddings": 0,
            "errors": 0,
            "skipped": 0
        }

        # Process all markdown files
        markdown_files = list(content_path.rglob("*.md"))
        logger.info(f"Found {len(markdown_files)} markdown files to process")

        for file_path in markdown_files:
            try:
                relative_path = file_path.relative_to(content_path)

                # Read file content
                content = file_path.read_text(encoding='utf-8')

                # Extract metadata
                metadata = embedding_service.extract_metadata_from_content(
                    content,
                    str(relative_path)
                )
                metadata['id'] = str(relative_path).replace('/', '_').replace('.md', '')

                # Chunk content
                chunks = embedding_service.chunk_content(
                    content,
                    str(relative_path),
                    metadata
                )

                # Generate embeddings for each chunk
                for chunk in chunks:
                    embedding = await embedding_service.generate_embedding(chunk.content)
                    if embedding:
                        success = await self.vector_repo.store_embedding(chunk, embedding)
                        if success:
                            stats["generated_embeddings"] += 1
                        else:
                            stats["errors"] += 1
                    else:
                        stats["skipped"] += 1
                        logger.warning(f"Skipped embedding for chunk in {relative_path}")

                stats["processed_files"] += 1
                logger.info(f"Processed {relative_path} ({len(chunks)} chunks)")

            except Exception as e:
                logger.error(f"Error processing {file_path}: {e}")
                stats["errors"] += 1

        logger.info(f"Content processing complete: {stats}")
        return stats
