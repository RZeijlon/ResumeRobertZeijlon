"""
Unit tests for ContentCache service
"""

import pytest
from pathlib import Path
from app.services.content.content_cache import ContentCache


@pytest.mark.unit
class TestContentCache:
    """Test ContentCache service"""

    @pytest.fixture
    def cache(self):
        """Create fresh cache instance for each test"""
        return ContentCache()

    def test_set_and_get(self, cache):
        """Test setting and getting cached content"""
        cache.set("test_key", {"data": "value"})

        result = cache.get("test_key")

        assert result == {"data": "value"}

    def test_get_nonexistent_key(self, cache):
        """Test getting non-existent key returns None"""
        result = cache.get("nonexistent")

        assert result is None

    def test_clear(self, cache):
        """Test clearing cache"""
        cache.set("key1", "value1")
        cache.set("key2", "value2")

        cache.clear()

        assert cache.get("key1") is None
        assert cache.get("key2") is None

    def test_is_cache_valid_new_file(self, cache, tmp_path):
        """Test cache validation with new file"""
        test_file = tmp_path / "test.txt"
        test_file.write_text("content")

        cache.set("test_key", "value")

        # Cache should be valid (cache was set after file creation)
        assert cache.is_cache_valid("test_key", test_file) is True

    def test_is_cache_valid_missing_cache(self, cache, tmp_path):
        """Test cache validation with missing cache entry"""
        test_file = tmp_path / "test.txt"
        test_file.write_text("content")

        assert cache.is_cache_valid("missing_key", test_file) is False

    def test_is_cache_valid_nonexistent_file(self, cache, tmp_path):
        """Test cache validation with non-existent file"""
        cache.set("test_key", "value")
        nonexistent_file = tmp_path / "nonexistent.txt"

        assert cache.is_cache_valid("test_key", nonexistent_file) is False
