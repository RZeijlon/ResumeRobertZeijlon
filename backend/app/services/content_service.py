"""
Content management service
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.core.config import settings
from app.models.content import (
    ContentItem, ContentMetadata, SiteConfig, ThemeConfig, 
    LayoutConfig, PersonalInfo
)
from app.utils.markdown import parse_frontmatter


class ContentService:
    """Service for managing portfolio content"""
    
    def __init__(self):
        self.content_path = Path(settings.CONTENT_PATH)
        self._cache: Dict[str, Any] = {}
        self._cache_timestamps: Dict[str, datetime] = {}
    
    def _get_file_modified_time(self, file_path: Path) -> Optional[datetime]:
        """Get file modification time"""
        try:
            return datetime.fromtimestamp(file_path.stat().st_mtime)
        except (OSError, FileNotFoundError):
            return None
    
    def _is_cache_valid(self, cache_key: str, file_path: Path) -> bool:
        """Check if cached content is still valid"""
        if cache_key not in self._cache_timestamps:
            return False
        
        file_time = self._get_file_modified_time(file_path)
        if not file_time:
            return False
        
        cache_time = self._cache_timestamps[cache_key]
        return file_time <= cache_time
    
    def _load_json_file(self, file_path: Path) -> Dict[str, Any]:
        """Load and cache JSON configuration file"""
        cache_key = f"json_{file_path.name}"
        
        if self._is_cache_valid(cache_key, file_path):
            return self._cache[cache_key]
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            self._cache[cache_key] = data
            self._cache_timestamps[cache_key] = datetime.now()
            return data
        
        except (FileNotFoundError, json.JSONDecodeError) as e:
            raise ValueError(f"Failed to load {file_path}: {str(e)}")
    
    def _load_markdown_file(self, file_path: Path) -> ContentItem:
        """Load and parse markdown file"""
        cache_key = f"md_{file_path}"
        
        if self._is_cache_valid(cache_key, file_path):
            return self._cache[cache_key]
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                raw_content = f.read()
            
            parsed = parse_frontmatter(raw_content)
            
            item = ContentItem(
                id=file_path.stem,
                content=parsed['content'],
                metadata=ContentMetadata(**parsed['data']),
                raw_content=raw_content,
                file_path=str(file_path.relative_to(self.content_path)),
                last_modified=self._get_file_modified_time(file_path)
            )
            
            self._cache[cache_key] = item
            self._cache_timestamps[cache_key] = datetime.now()
            return item
        
        except (FileNotFoundError, OSError) as e:
            raise ValueError(f"Failed to load {file_path}: {str(e)}")
    
    def get_site_config(self) -> SiteConfig:
        """Get site configuration"""
        config_path = self.content_path / "config" / "site.json"
        data = self._load_json_file(config_path)
        return SiteConfig(**data)
    
    def get_theme_config(self) -> ThemeConfig:
        """Get theme configuration"""
        config_path = self.content_path / "config" / "theme.json"
        data = self._load_json_file(config_path)
        return ThemeConfig(**data)
    
    def get_layout_config(self) -> LayoutConfig:
        """Get layout configuration"""
        config_path = self.content_path / "config" / "layout.json"
        data = self._load_json_file(config_path)
        return LayoutConfig(**data)
    
    def get_personal_info(self) -> PersonalInfo:
        """Get personal information"""
        info_path = self.content_path / "personal" / "contact-info.json"
        data = self._load_json_file(info_path)
        return PersonalInfo(**data)
    
    def get_content_item(self, file_path: str) -> ContentItem:
        """Get single content item by file path"""
        full_path = self.content_path / file_path
        return self._load_markdown_file(full_path)
    
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
                    item = self._load_markdown_file(file_path)
                    content['sections'].append(item)
                except ValueError:
                    continue
        
        # Load components
        components_path = self.content_path / "components"
        if components_path.exists():
            for file_path in components_path.rglob("*.md"):
                try:
                    item = self._load_markdown_file(file_path)
                    
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
        self._cache.clear()
        self._cache_timestamps.clear()


# Global content service instance
content_service = ContentService()