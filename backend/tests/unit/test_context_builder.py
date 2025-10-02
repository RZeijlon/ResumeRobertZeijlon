"""
Unit tests for ContextBuilder service
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.rag.context_builder import ContextBuilder


@pytest.mark.unit
class TestContextBuilder:
    """Test ContextBuilder service"""

    @pytest.fixture
    def mock_vector_repo(self):
        """Mock VectorRepository"""
        repo = MagicMock()
        repo.similarity_search = AsyncMock()
        return repo

    @pytest.fixture
    def context_builder(self, mock_vector_repo):
        """Create ContextBuilder instance with mocked dependencies"""
        return ContextBuilder(mock_vector_repo)

    @pytest.mark.asyncio
    async def test_retrieve_context_success(
        self,
        context_builder,
        mock_vector_repo,
        mock_vector_results
    ):
        """Test successful context retrieval"""
        mock_vector_repo.similarity_search.return_value = mock_vector_results

        # Mock embedding service
        from app.services import embedding_service
        embedding_service.generate_embedding = AsyncMock(
            return_value=[0.1, 0.2, 0.3]
        )

        results = await context_builder.retrieve_context("test query")

        assert len(results) == 2
        assert results[0]["content_id"] == "test_1"
        assert results[1]["content_id"] == "test_2"

    @pytest.mark.asyncio
    async def test_retrieve_context_no_embedding(
        self,
        context_builder,
        mock_vector_repo
    ):
        """Test context retrieval when embedding generation fails"""
        from app.services import embedding_service
        embedding_service.generate_embedding = AsyncMock(return_value=None)

        results = await context_builder.retrieve_context("test query")

        assert results == []
        mock_vector_repo.similarity_search.assert_not_called()

    def test_format_context_with_results(
        self,
        context_builder,
        mock_vector_results
    ):
        """Test context formatting with results"""
        formatted = context_builder.format_context(mock_vector_results)

        assert "Relevant information about Robert Zeijlon" in formatted
        assert "Test content 1" in formatted
        assert "Test content 2" in formatted
        assert "0.95" in formatted
        assert "0.85" in formatted

    def test_format_context_empty(self, context_builder):
        """Test context formatting with empty results"""
        formatted = context_builder.format_context([])

        assert formatted == "No specific context available."
