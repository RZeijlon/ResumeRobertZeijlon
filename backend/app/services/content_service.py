"""
Content management service
Refactored to use modular components
"""

from pathlib import Path
from typing import Dict, List, Any

from app.core.config import settings
from app.models.content import (
    ContentItem, SiteConfig, ThemeConfig,
    LayoutConfig, PersonalInfo
)
from app.services.content.content_cache import content_cache
from app.services.content.content_loader import ContentLoader


class ContentService:
    """Service for managing portfolio content"""

    def __init__(self):
        self.content_path = Path(settings.CONTENT_PATH)
        self.cache = content_cache
        self.loader = ContentLoader(self.content_path, self.cache)

    def get_site_config(self) -> SiteConfig:
        """Get site configuration"""
        config_path = self.content_path / "config" / "site.json"
        data = self.loader.load_json_file(config_path)
        return SiteConfig(**data)

    def get_theme_config(self) -> ThemeConfig:
        """Get theme configuration"""
        config_path = self.content_path / "config" / "theme.json"
        data = self.loader.load_json_file(config_path)
        return ThemeConfig(**data)

    def get_layout_config(self) -> LayoutConfig:
        """Get layout configuration"""
        config_path = self.content_path / "config" / "layout.json"
        data = self.loader.load_json_file(config_path)
        return LayoutConfig(**data)

    def get_personal_info(self) -> PersonalInfo:
        """Get personal information"""
        info_path = self.content_path / "config" / "personal" / "contact-info.json"
        data = self.loader.load_json_file(info_path)
        return PersonalInfo(**data)

    def get_content_item(self, file_path: str) -> ContentItem:
        """Get single content item by file path"""
        full_path = self.content_path / file_path
        return self.loader.load_markdown_file(full_path)

    def get_content_items(self, file_paths: List[str]) -> List[ContentItem]:
        """Get multiple content items"""
        items = []
        for file_path in file_paths:
            try:
                item = self.get_content_item(file_path)
                items.append(item)
            except ValueError:
                # Skip missing files
                continue
        return items

    def get_all_content(self) -> Dict[str, List[ContentItem]]:
        """Get all content organized by type"""
        content = {
            'sections': [],
            'components': [],
            'projects': [],
            'skills': []
        }

        # Load sections
        sections_path = self.content_path / "sections"
        if sections_path.exists():
            for file_path in sections_path.glob("*.md"):
                try:
                    item = self.loader.load_markdown_file(file_path)
                    content['sections'].append(item)
                except ValueError:
                    continue

        # Load components
        components_path = self.content_path / "components"
        if components_path.exists():
            for file_path in components_path.rglob("*.md"):
                try:
                    item = self.loader.load_markdown_file(file_path)

                    # Categorize components
                    if "project" in str(file_path):
                        content['projects'].append(item)
                    elif "skill" in str(file_path):
                        content['skills'].append(item)
                    else:
                        content['components'].append(item)
                except ValueError:
                    continue

        # Sort by order metadata where available
        for category in content.values():
            category.sort(key=lambda x: x.metadata.order or 999)

        return content

    def search_content(self, query: str) -> List[ContentItem]:
        """Simple text search through content"""
        query_lower = query.lower()
        all_content = self.get_all_content()
        results = []

        for category in all_content.values():
            for item in category:
                # Search in title, content, and metadata
                if (query_lower in item.content.lower() or
                    (item.metadata.title and query_lower in item.metadata.title.lower()) or
                    (item.metadata.tech and query_lower in item.metadata.tech.lower())):
                    results.append(item)

        return results

    def clear_cache(self):
        """Clear the content cache"""
        self.cache.clear()


# Global content service instance
content_service = ContentService()
