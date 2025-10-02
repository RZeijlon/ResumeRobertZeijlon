"""
Context builder service for RAG system
Handles retrieving and formatting context for LLM queries
"""

from typing import List, Dict, Any

from app.core.logging import get_logger
from app.repositories.vector_repository import VectorRepository
from app.services.embedding_service import embedding_service

logger = get_logger(__name__)


class ContextBuilder:
    """Service for building context from retrieved content"""

    def __init__(self, vector_repo: VectorRepository):
        self.vector_repo = vector_repo

    async def retrieve_context(
        self,
        query: str,
        max_results: int = 5,
        threshold: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context for a query

        Args:
            query: User query
            max_results: Maximum number of results to return
            threshold: Minimum similarity threshold

        Returns:
            List of relevant content chunks with similarity scores
        """
        # Generate embedding for the query
        query_embedding = await embedding_service.generate_embedding(query)
        if not query_embedding:
            logger.warning("Could not generate embedding for query")
            return []

        # Search for similar content
        results = await self.vector_repo.similarity_search(
            query_embedding,
            limit=max_results,
            threshold=threshold
        )

        logger.info(f"Retrieved {len(results)} context results for query")
        return results

    def format_context(self, context_results: List[Dict[str, Any]]) -> str:
        """
        Format retrieved context for the LLM

        Args:
            context_results: List of retrieved content chunks

        Returns:
            Formatted context string
        """
        if not context_results:
            return "No specific context available."

        formatted_context = "Relevant information about Robert Zeijlon:\n\n"

        for i, result in enumerate(context_results, 1):
            metadata = result.get("metadata", {})
            content_type = metadata.get("type", "content")
            section = metadata.get("section", "")
            similarity = result.get("similarity", 0)

            formatted_context += f"{i}. [{content_type.title()}] "
            if section:
                formatted_context += f"({section}) "
            formatted_context += f"(relevance: {similarity:.2f})\n"
            formatted_context += f"{result['content']}\n\n"

        return formatted_context
