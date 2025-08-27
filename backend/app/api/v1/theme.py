"""
Theme management API endpoints  
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.models.content import ContentResponse
from app.services.content_service import content_service

router = APIRouter()


@router.get("/config", response_model=ContentResponse)
async def get_theme_config():
    """Get theme configuration"""
    try:
        config = content_service.get_theme_config()
        return ContentResponse(data=config.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/list", response_model=ContentResponse)
async def list_available_themes():
    """List all available themes"""
    try:
        config = content_service.get_theme_config()
        themes = []
        
        for theme_id, theme_data in config.themes.items():
            themes.append({
                "id": theme_id,
                "name": theme_data["name"],
                "colors": theme_data["colors"],
                "effects": theme_data["effects"]
            })
        
        return ContentResponse(data={"themes": themes, "total": len(themes)})
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{theme_id}", response_model=ContentResponse)  
async def get_theme_details(theme_id: str):
    """Get details for a specific theme"""
    try:
        config = content_service.get_theme_config()
        
        if theme_id not in config.themes:
            raise HTTPException(status_code=404, detail=f"Theme '{theme_id}' not found")
        
        theme_data = config.themes[theme_id]
        return ContentResponse(data=theme_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))