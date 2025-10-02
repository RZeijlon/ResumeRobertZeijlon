"""
Vector database repository for embeddings storage and retrieval
"""

import asyncpg
from typing import List, Dict, Any, Optional
import json

from app.core.config import settings
from app.core.logging import get_logger
from app.services.embedding_service import ContentChunk

logger = get_logger(__name__)


class VectorRepository:
    """Repository for vector database operations"""

    def __init__(self):
        self.connection_pool: Optional[asyncpg.Pool] = None

    async def initialize(self) -> None:
        """Initialize database connection pool"""
        try:
            self.connection_pool = await asyncpg.create_pool(
                settings.VECTOR_DB_URL,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            logger.info("Vector repository initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize vector repository: {e}")
            raise

    async def close(self) -> None:
        """Close database connections"""
        if self.connection_pool:
            await self.connection_pool.close()
            logger.info("Vector repository connections closed")

    async def store_embedding(
        self,
        chunk: ContentChunk,
        embedding: List[float]
    ) -> bool:
        """
        Store content chunk and its embedding in the database

        Args:
            chunk: Content chunk with metadata
            embedding: Vector embedding

        Returns:
            bool: True if successful, False otherwise
        """
        if not self.connection_pool:
            await self.initialize()

        try:
            async with self.connection_pool.acquire() as conn:
                # Convert embedding list to pgvector format
                embedding_str = f"[{','.join(map(str, embedding))}]"

                await conn.execute("""
                    INSERT INTO content_embeddings
                    (content_id, file_path, content, metadata, embedding)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (content_id) DO UPDATE SET
                        content = EXCLUDED.content,
                        metadata = EXCLUDED.metadata,
                        embedding = EXCLUDED.embedding,
                        updated_at = NOW()
                """, chunk.content_id, chunk.file_path, chunk.content,
                    json.dumps(chunk.metadata), embedding_str)

            logger.debug(f"Stored embedding for {chunk.content_id}")
            return True
        except Exception as e:
            logger.error(f"Error storing embedding for {chunk.content_id}: {e}")
            return False

    async def similarity_search(
        self,
        query_embedding: List[float],
        limit: int = 5,
        threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Perform similarity search for relevant content

        Args:
            query_embedding: Query vector
            limit: Maximum number of results
            threshold: Minimum similarity score

        Returns:
            List of matching content with similarity scores
        """
        if not self.connection_pool:
            await self.initialize()

        try:
            async with self.connection_pool.acquire() as conn:
                # Convert query embedding to pgvector format
                query_embedding_str = f"[{','.join(map(str, query_embedding))}]"

                results = await conn.fetch("""
                    SELECT content_id, file_path, content, metadata,
                           1 - (embedding <=> $1::vector) as similarity
                    FROM content_embeddings
                    WHERE 1 - (embedding <=> $1::vector) > $3
                    ORDER BY embedding <=> $1::vector
                    LIMIT $2
                """, query_embedding_str, limit, threshold)

                return [
                    {
                        "content_id": row["content_id"],
                        "file_path": row["file_path"],
                        "content": row["content"],
                        "metadata": json.loads(row["metadata"]) if isinstance(row["metadata"], str) else row["metadata"],
                        "similarity": float(row["similarity"])
                    }
                    for row in results
                ]
        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []

    async def get_content_by_type(self, content_type: str) -> List[Dict[str, Any]]:
        """
        Get content by type (section, skill, project, etc.)

        Args:
            content_type: Type of content to retrieve

        Returns:
            List of matching content items
        """
        if not self.connection_pool:
            await self.initialize()

        try:
            async with self.connection_pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT content_id, file_path, content, metadata
                    FROM content_embeddings
                    WHERE metadata->>'type' = $1
                    ORDER BY content_id
                """, content_type)

                return [
                    {
                        "content_id": row["content_id"],
                        "file_path": row["file_path"],
                        "content": row["content"],
                        "metadata": row["metadata"]
                    }
                    for row in results
                ]
        except Exception as e:
            logger.error(f"Error fetching content by type {content_type}: {e}")
            return []


# Global instance
vector_repository = VectorRepository()
