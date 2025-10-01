"""
Content management API endpoints
"""

from fastapi import APIRouter, Query
from typing import List, Optional

from app.models.content import (
    ContentResponse, ContentListResponse, ConfigResponse,
    ContentItem, SiteConfig, ThemeConfig, LayoutConfig, PersonalInfo
)
from app.services.content_service import content_service
from app.core.exceptions import ContentNotFoundException, ValidationError

router = APIRouter()


@router.get("/site-config", response_model=ConfigResponse)
async def get_site_config():
    """Get site configuration"""
    try:
        config = content_service.get_site_config()
        return ConfigResponse(data=config.dict())
    except ValueError as e:
        raise ContentNotFoundException("config/site.json", details={"error": str(e)})


@router.get("/theme-config", response_model=ConfigResponse)
async def get_theme_config():
    """Get theme configuration"""
    try:
        config = content_service.get_theme_config()
        return ConfigResponse(data=config.dict())
    except ValueError as e:
        raise ContentNotFoundException("config/theme.json", details={"error": str(e)})


@router.get("/layout-config", response_model=ConfigResponse)
async def get_layout_config():
    """Get layout configuration"""
    try:
        config = content_service.get_layout_config()
        return ConfigResponse(data=config.dict())
    except ValueError as e:
        raise ContentNotFoundException("config/layout.json", details={"error": str(e)})


@router.get("/personal-info", response_model=ConfigResponse)
async def get_personal_info():
    """Get personal information"""
    try:
        info = content_service.get_personal_info()
        return ConfigResponse(data=info.dict())
    except ValueError as e:
        raise ContentNotFoundException("config/personal/contact-info.json", details={"error": str(e)})


@router.get("/item/{file_path:path}", response_model=ContentResponse)
async def get_content_item(file_path: str):
    """Get single content item by file path"""
    try:
        item = content_service.get_content_item(file_path)
        return ContentResponse(data=item.dict())
    except ValueError as e:
        raise ContentNotFoundException(file_path, details={"error": str(e)})


@router.post("/items", response_model=ContentListResponse)
async def get_content_items(file_paths: List[str]):
    """Get multiple content items by file paths"""
    if not file_paths:
        raise ValidationError("file_paths cannot be empty")

    try:
        items = content_service.get_content_items(file_paths)
        return ContentListResponse(data=items, total=len(items))
    except ValueError as e:
        raise ValidationError(str(e), details={"file_paths": file_paths})


@router.get("/all", response_model=ContentResponse)
async def get_all_content():
    """Get all content organized by type"""
    content = content_service.get_all_content()
    return ContentResponse(data=content)


@router.get("/search", response_model=ContentListResponse)
async def search_content(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Maximum results")
):
    """Search through content"""
    results = content_service.search_content(q)

    if limit:
        results = results[:limit]

    return ContentListResponse(data=results, total=len(results))


@router.post("/refresh")
async def refresh_content():
    """Refresh content cache"""
    content_service.clear_cache()
    return ContentResponse(message="Content cache refreshed successfully")