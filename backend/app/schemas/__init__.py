"""
Pydantic schemas for request/response validation
"""

from .chat import (
    MessageRole,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    RAGSource,
    RAGContext,
    EmbeddingRequest,
    EmbeddingResponse,
)

from .content import (
    ContentMetadata,
    ContentItem,
    ContentChunk,
    ContentListResponse,
    ContentCreateRequest,
    ContentUpdateRequest,
)

__all__ = [
    # Chat schemas
    "MessageRole",
    "ChatMessage",
    "ChatRequest",
    "ChatResponse",
    "RAGSource",
    "RAGContext",
    "EmbeddingRequest",
    "EmbeddingResponse",
    # Content schemas
    "ContentMetadata",
    "ContentItem",
    "ContentChunk",
    "ContentListResponse",
    "ContentCreateRequest",
    "ContentUpdateRequest",
]
