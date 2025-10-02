"""
Content caching service for improved performance
"""

from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

from app.core.logging import get_logger

logger = get_logger(__name__)


class ContentCache:
    """Service for caching loaded content and configurations"""

    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._cache_timestamps: Dict[str, datetime] = {}

    def _get_file_modified_time(self, file_path: Path) -> Optional[datetime]:
        """
        Get file modification time

        Args:
            file_path: Path to file

        Returns:
            File modification datetime or None if unavailable
        """
        try:
            return datetime.fromtimestamp(file_path.stat().st_mtime)
        except (OSError, FileNotFoundError):
            logger.warning(f"Could not get modification time for {file_path}")
            return None

    def is_cache_valid(self, cache_key: str, file_path: Path) -> bool:
        """
        Check if cached content is still valid

        Args:
            cache_key: Cache key
            file_path: Path to source file

        Returns:
            True if cache is valid, False otherwise
        """
        if cache_key not in self._cache_timestamps:
            return False

        file_time = self._get_file_modified_time(file_path)
        if not file_time:
            return False

        cache_time = self._cache_timestamps[cache_key]
        return file_time <= cache_time

    def get(self, cache_key: str) -> Optional[Any]:
        """
        Get cached content

        Args:
            cache_key: Cache key

        Returns:
            Cached content or None
        """
        return self._cache.get(cache_key)

    def set(self, cache_key: str, content: Any) -> None:
        """
        Set cached content

        Args:
            cache_key: Cache key
            content: Content to cache
        """
        self._cache[cache_key] = content
        self._cache_timestamps[cache_key] = datetime.now()
        logger.debug(f"Cached content with key: {cache_key}")

    def clear(self) -> None:
        """Clear all cached content"""
        self._cache.clear()
        self._cache_timestamps.clear()
        logger.info("Content cache cleared")


# Global cache instance
content_cache = ContentCache()
