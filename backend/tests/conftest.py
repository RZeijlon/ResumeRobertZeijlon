"""
Pytest configuration and shared fixtures
"""

import pytest
from pathlib import Path
from typing import Dict, Any

@pytest.fixture
def mock_content_path(tmp_path: Path) -> Path:
    """Create a temporary content directory for testing"""
    content_path = tmp_path / "content"
    content_path.mkdir()

    # Create config directory
    config_path = content_path / "config"
    config_path.mkdir()

    # Create sections directory
    sections_path = content_path / "sections"
    sections_path.mkdir()

    return content_path


@pytest.fixture
def sample_markdown_content() -> str:
    """Sample markdown content with frontmatter"""
    return """---
title: Test Content
order: 1
type: section
---

# Test Content

This is test content.
"""


@pytest.fixture
def sample_json_config() -> Dict[str, Any]:
    """Sample JSON configuration"""
    return {
        "name": "Test Site",
        "version": "1.0.0",
        "features": {
            "chatBot": {
                "enabled": True
            }
        }
    }


@pytest.fixture
def mock_vector_results() -> list:
    """Mock vector search results"""
    return [
        {
            "content_id": "test_1",
            "file_path": "test.md",
            "content": "Test content 1",
            "metadata": {"type": "section"},
            "similarity": 0.95
        },
        {
            "content_id": "test_2",
            "file_path": "test2.md",
            "content": "Test content 2",
            "metadata": {"type": "skill"},
            "similarity": 0.85
        }
    ]
