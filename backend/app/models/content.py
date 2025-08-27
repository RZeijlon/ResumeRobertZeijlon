"""
Pydantic models for content management
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime


class ContentMetadata(BaseModel):
    """Content metadata from frontmatter"""
    section: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    category: Optional[str] = None
    order: Optional[int] = None
    project: Optional[bool] = None
    tech: Optional[str] = None
    featured: Optional[bool] = None
    github: Optional[str] = None
    image: Optional[str] = None
    component: Optional[str] = None
    type: Optional[str] = None
    
    # Allow additional metadata fields
    class Config:
        extra = "allow"


class ContentItem(BaseModel):
    """Individual content item"""
    id: str = Field(..., description="Unique identifier for the content")
    content: str = Field(..., description="Markdown content")
    metadata: ContentMetadata = Field(..., description="Frontmatter metadata")
    raw_content: str = Field(..., description="Original content with frontmatter")
    file_path: str = Field(..., description="Original file path")
    last_modified: Optional[datetime] = None


class SiteConfig(BaseModel):
    """Site configuration"""
    meta: Dict[str, Any] = Field(..., description="Site metadata")
    features: Dict[str, Any] = Field(..., description="Feature flags")
    version: str = Field(..., description="Configuration version")


class ThemeConfig(BaseModel):
    """Theme configuration"""
    themes: Dict[str, Dict[str, Any]] = Field(..., description="Available themes")
    customization: Dict[str, Any] = Field(..., description="Customization options")


class LayoutConfig(BaseModel):
    """Layout configuration"""
    layout: Dict[str, Any] = Field(..., description="Layout sections")
    responsive: Dict[str, Any] = Field(..., description="Responsive settings")


class PersonalInfo(BaseModel):
    """Personal information"""
    name: str
    title: str
    email: str
    phone: str
    location: str
    social: Dict[str, Dict[str, str]]
    professional: Dict[str, str]


class ContentResponse(BaseModel):
    """API response for content"""
    success: bool = True
    data: Optional[Any] = None
    message: str = "Success"
    timestamp: datetime = Field(default_factory=datetime.now)


class ContentListResponse(ContentResponse):
    """API response for content list"""
    data: List[ContentItem]
    total: int = Field(..., description="Total number of items")


class ConfigResponse(ContentResponse):
    """API response for configuration"""
    data: Dict[str, Any]