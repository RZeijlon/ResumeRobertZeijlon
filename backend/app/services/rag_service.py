"""
RAG (Retrieval Augmented Generation) service for context-aware chat responses
Refactored to use modular service components
"""

from typing import Dict, Any

from app.core.logging import get_logger
from app.repositories.vector_repository import vector_repository
from app.services.rag.context_builder import ContextBuilder
from app.services.rag.chat_service import chat_service
from app.services.rag.content_processor import ContentProcessor

logger = get_logger(__name__)


class RAGService:
    """Main RAG service orchestrating context retrieval and response generation"""

    def __init__(self):
        self.vector_repo = vector_repository
        self.context_builder = ContextBuilder(self.vector_repo)
        self.chat_service = chat_service
        self.content_processor = ContentProcessor(self.vector_repo)

    async def initialize(self) -> None:
        """Initialize the RAG service and its dependencies"""
        await self.vector_repo.initialize()
        logger.info("RAG service initialized")

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
        return await self.content_processor.process_content_directory(force_refresh)

    async def chat(
        self,
        query: str,
        max_context_results: int = 5,
        context_threshold: float = 0.3
    ) -> Dict[str, Any]:
        """
        Main chat method with RAG

        Args:
            query: User query
            max_context_results: Maximum number of context results to retrieve
            context_threshold: Minimum similarity threshold for context

        Returns:
            Response with sources and metadata
        """
        # Retrieve relevant context
        context_results = await self.context_builder.retrieve_context(
            query,
            max_results=max_context_results,
            threshold=context_threshold
        )

        # Format context for LLM
        context = self.context_builder.format_context(context_results)

        # Generate response
        response = await self.chat_service.generate_response(query, context)

        return {
            "response": response,
            "sources": [
                f"{result['file_path']} ({result.get('metadata', {}).get('type', 'content')}, {result['similarity']:.2f})"
                for result in context_results
            ],
            "context_used": len(context_results) > 0
        }


# Global instance
rag_service = RAGService()
