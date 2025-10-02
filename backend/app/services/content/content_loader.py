"""
Content loader service for loading files from disk
"""

import json
from pathlib import Path
from typing import Dict, Any

from app.core.logging import get_logger
from app.models.content import ContentItem, ContentMetadata
from app.utils.markdown import parse_frontmatter
from app.services.content.content_cache import ContentCache

logger = get_logger(__name__)


class ContentLoader:
    """Service for loading content from files"""

    def __init__(self, content_path: Path, cache: ContentCache):
        self.content_path = content_path
        self.cache = cache

    def load_json_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Load and cache JSON configuration file

        Args:
            file_path: Path to JSON file

        Returns:
            Parsed JSON data

        Raises:
            ValueError: If file cannot be loaded or parsed
        """
        cache_key = f"json_{file_path.name}"

        if self.cache.is_cache_valid(cache_key, file_path):
            cached = self.cache.get(cache_key)
            if cached is not None:
                logger.debug(f"Using cached JSON: {file_path.name}")
                return cached

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            self.cache.set(cache_key, data)
            logger.info(f"Loaded JSON file: {file_path.name}")
            return data

        except FileNotFoundError:
            logger.error(f"JSON file not found: {file_path}")
            raise ValueError(f"Failed to load {file_path}: File not found")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in {file_path}: {e}")
            raise ValueError(f"Failed to load {file_path}: Invalid JSON - {str(e)}")

    def load_markdown_file(self, file_path: Path) -> ContentItem:
        """
        Load and parse markdown file

        Args:
            file_path: Path to markdown file

        Returns:
            Parsed content item

        Raises:
            ValueError: If file cannot be loaded or parsed
        """
        cache_key = f"md_{file_path}"

        if self.cache.is_cache_valid(cache_key, file_path):
            cached = self.cache.get(cache_key)
            if cached is not None:
                logger.debug(f"Using cached markdown: {file_path}")
                return cached

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
                last_modified=self.cache._get_file_modified_time(file_path)
            )

            self.cache.set(cache_key, item)
            logger.info(f"Loaded markdown file: {file_path}")
            return item

        except FileNotFoundError:
            logger.error(f"Markdown file not found: {file_path}")
            raise ValueError(f"Failed to load {file_path}: File not found")
        except (OSError, KeyError, TypeError) as e:
            logger.error(f"Error parsing markdown {file_path}: {e}")
            raise ValueError(f"Failed to load {file_path}: {str(e)}")
