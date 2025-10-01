"""
Theme management API endpoints
"""

from fastapi import APIRouter
from typing import Dict, Any

from app.models.content import ContentResponse
from app.services.content_service import content_service
from app.core.exceptions import ContentNotFoundException

router = APIRouter()


@router.get("/config", response_model=ContentResponse)
async def get_theme_config():
    """Get theme configuration"""
    try:
        config = content_service.get_theme_config()
        return ContentResponse(data=config.dict())
    except ValueError as e:
        raise ContentNotFoundException("config/theme.json", details={"error": str(e)})


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
        raise ContentNotFoundException("config/theme.json", details={"error": str(e)})


@router.get("/{theme_id}", response_model=ContentResponse)
async def get_theme_details(theme_id: str):
    """Get details for a specific theme"""
    try:
        config = content_service.get_theme_config()

        if theme_id not in config.themes:
            raise ContentNotFoundException(
                f"theme/{theme_id}",
                details={"available_themes": list(config.themes.keys())}
            )

        theme_data = config.themes[theme_id]
        return ContentResponse(data=theme_data)
    except ContentNotFoundException:
        raise
    except ValueError as e:
        raise ContentNotFoundException("config/theme.json", details={"error": str(e)})