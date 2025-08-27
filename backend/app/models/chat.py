"""
Pydantic models for chat and RAG functionality
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ChatMessage(BaseModel):
    """Individual chat message"""
    id: str = Field(..., description="Unique message ID")
    content: str = Field(..., description="Message content")
    role: str = Field(..., description="Message role (user/assistant)")
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    """Chat request from frontend"""
    message: str = Field(..., description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    use_rag: bool = Field(False, description="Whether to use RAG for response")


class ChatResponse(BaseModel):
    """Chat response to frontend"""
    message: str = Field(..., description="Assistant response")
    conversation_id: str = Field(..., description="Conversation ID")
    sources: Optional[List[str]] = Field(None, description="RAG sources used")
    timestamp: datetime = Field(default_factory=datetime.now)


class RAGContext(BaseModel):
    """RAG context information"""
    query: str = Field(..., description="Original query")
    relevant_content: List[Dict[str, Any]] = Field(..., description="Retrieved content")
    similarity_scores: List[float] = Field(..., description="Similarity scores")
    total_tokens: int = Field(..., description="Total tokens in context")


class EmbeddingRequest(BaseModel):
    """Request for content embedding"""
    content: str = Field(..., description="Content to embed")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class EmbeddingResponse(BaseModel):
    """Response with embedding"""
    embedding: List[float] = Field(..., description="Content embedding vector")
    content: str = Field(..., description="Original content")
    metadata: Dict[str, Any] = Field(..., description="Content metadata")