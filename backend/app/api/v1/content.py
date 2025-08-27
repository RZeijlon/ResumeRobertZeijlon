"""
Content management API endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.models.content import (
    ContentResponse, ContentListResponse, ConfigResponse,
    ContentItem, SiteConfig, ThemeConfig, LayoutConfig, PersonalInfo
)
from app.services.content_service import content_service

router = APIRouter()


@router.get("/site-config", response_model=ConfigResponse)
async def get_site_config():
    """Get site configuration"""
    try:
        config = content_service.get_site_config()
        return ConfigResponse(data=config.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/theme-config", response_model=ConfigResponse)
async def get_theme_config():
    """Get theme configuration"""
    try:
        config = content_service.get_theme_config()
        return ConfigResponse(data=config.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/layout-config", response_model=ConfigResponse)
async def get_layout_config():
    """Get layout configuration"""
    try:
        config = content_service.get_layout_config()
        return ConfigResponse(data=config.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/personal-info", response_model=ConfigResponse)
async def get_personal_info():
    """Get personal information"""
    try:
        info = content_service.get_personal_info()
        return ConfigResponse(data=info.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/item/{file_path:path}", response_model=ContentResponse)
async def get_content_item(file_path: str):
    """Get single content item by file path"""
    try:
        item = content_service.get_content_item(file_path)
        return ContentResponse(data=item.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/items", response_model=ContentListResponse)
async def get_content_items(file_paths: List[str]):
    """Get multiple content items by file paths"""
    try:
        items = content_service.get_content_items(file_paths)
        return ContentListResponse(data=items, total=len(items))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all", response_model=ContentResponse)
async def get_all_content():
    """Get all content organized by type"""
    try:
        content = content_service.get_all_content()
        return ContentResponse(data=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=ContentListResponse)
async def search_content(
    q: str = Query(..., description="Search query"),
    limit: Optional[int] = Query(None, description="Maximum results")
):
    """Search through content"""
    try:
        results = content_service.search_content(q)
        
        if limit:
            results = results[:limit]
        
        return ContentListResponse(data=results, total=len(results))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh")
async def refresh_content():
    """Refresh content cache"""
    try:
        content_service.clear_cache()
        return ContentResponse(message="Content cache refreshed successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))