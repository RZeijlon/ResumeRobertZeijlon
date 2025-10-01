"""
Pydantic schemas for content management
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional, List
from datetime import datetime


class ContentMetadata(BaseModel):
    """Content metadata"""
    title: Optional[str] = Field(None, description="Content title")
    subtitle: Optional[str] = Field(None, description="Content subtitle")
    author: Optional[str] = Field(None, description="Content author")
    date: Optional[datetime] = Field(None, description="Content date")
    tags: Optional[List[str]] = Field(None, description="Content tags")
    featured: Optional[bool] = Field(None, description="Featured status")
    order: Optional[int] = Field(None, description="Display order")


class ContentItem(BaseModel):
    """Content item with parsed data"""
    id: str = Field(..., description="Unique content ID")
    file_path: str = Field(..., description="File path")
    content: str = Field(..., description="Markdown content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Content metadata")
    raw_content: str = Field(..., description="Raw file content")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "about",
                "file_path": "/content/about.md",
                "content": "# About Me\n\nI am an AI Developer...",
                "metadata": {
                    "title": "About",
                    "order": 1
                },
                "raw_content": "---\ntitle: About\n---\n# About Me..."
            }
        }


class ContentChunk(BaseModel):
    """Chunked content for embedding"""
    content_id: str = Field(..., description="Parent content ID")
    file_path: str = Field(..., description="Source file path")
    content: str = Field(..., description="Chunk content", min_length=1)
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Chunk metadata")
    chunk_index: int = Field(..., description="Chunk index", ge=0)

    @validator('content')
    def validate_content(cls, v):
        """Validate content is not empty"""
        if not v.strip():
            raise ValueError('Content chunk cannot be empty')
        return v.strip()


class ContentListResponse(BaseModel):
    """Response for content listing"""
    items: List[ContentItem] = Field(..., description="Content items")
    total: int = Field(..., description="Total item count", ge=0)
    page: int = Field(1, description="Current page", ge=1)
    per_page: int = Field(20, description="Items per page", ge=1, le=100)


class ContentCreateRequest(BaseModel):
    """Request to create new content"""
    file_path: str = Field(..., description="File path")
    content: str = Field(..., description="Content body", min_length=1)
    metadata: Optional[Dict[str, Any]] = Field(None, description="Content metadata")


class ContentUpdateRequest(BaseModel):
    """Request to update existing content"""
    content: Optional[str] = Field(None, description="Updated content")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Updated metadata")
