"""
Pydantic schemas for chat and RAG functionality
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Message role enumeration"""
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    """Individual chat message"""
    id: str = Field(..., description="Unique message ID", min_length=1)
    content: str = Field(..., description="Message content", min_length=1)
    role: MessageRole = Field(..., description="Message role (user/assistant)")
    timestamp: datetime = Field(default_factory=datetime.now)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "msg_123",
                "content": "Hello, how can I help?",
                "role": "assistant",
                "timestamp": "2025-10-01T12:00:00"
            }
        }


class ChatRequest(BaseModel):
    """Chat request from frontend"""
    message: str = Field(
        ...,
        description="User message",
        min_length=1,
        max_length=5000
    )
    conversation_id: Optional[str] = Field(
        None,
        description="Conversation ID for context"
    )
    use_rag: bool = Field(
        False,
        description="Whether to use RAG for response"
    )

    @validator('message')
    def validate_message(cls, v):
        """Validate message is not empty after stripping"""
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Tell me about Robert's experience",
                "conversation_id": "conv_123",
                "use_rag": True
            }
        }


class RAGSource(BaseModel):
    """RAG source document"""
    content: str = Field(..., description="Source content")
    file_path: str = Field(..., description="Source file path")
    similarity: Optional[float] = Field(None, description="Similarity score")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class ChatResponse(BaseModel):
    """Chat response to frontend"""
    message: str = Field(..., description="Assistant response", min_length=1)
    conversation_id: str = Field(..., description="Conversation ID")
    sources: Optional[List[RAGSource]] = Field(None, description="RAG sources used")
    timestamp: datetime = Field(default_factory=datetime.now)

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Robert is an AI Developer with expertise in...",
                "conversation_id": "conv_123",
                "sources": [
                    {
                        "content": "Robert specializes in...",
                        "file_path": "/content/about.md",
                        "similarity": 0.92
                    }
                ],
                "timestamp": "2025-10-01T12:00:01"
            }
        }


class RAGContext(BaseModel):
    """RAG context information"""
    query: str = Field(..., description="Original query")
    relevant_content: List[Dict[str, Any]] = Field(..., description="Retrieved content")
    similarity_scores: List[float] = Field(..., description="Similarity scores")
    total_tokens: int = Field(..., description="Total tokens in context", ge=0)


class EmbeddingRequest(BaseModel):
    """Request for content embedding"""
    content: str = Field(..., description="Content to embed", min_length=1)
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

    @validator('content')
    def validate_content(cls, v):
        """Validate content is not empty after stripping"""
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v.strip()


class EmbeddingResponse(BaseModel):
    """Response with embedding"""
    embedding: List[float] = Field(..., description="Content embedding vector")
    content: str = Field(..., description="Original content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Content metadata")
    dimension: int = Field(..., description="Embedding dimension", gt=0)
