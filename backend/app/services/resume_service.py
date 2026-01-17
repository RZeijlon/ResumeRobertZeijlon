"""
Resume generation service
Aggregates content from knowledge base and configuration files to create professional resumes
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import re

from app.core.logging import get_logger

logger = get_logger(__name__)


class ResumeDataAggregator:
    """Aggregates resume content from knowledge base and config files"""

    def __init__(self, content_dir: str = "/app/page_content"):
        self.content_dir = Path(content_dir)
        self.personal_info = self._load_personal_info()

    def _load_personal_info(self) -> Dict[str, Any]:
        """Load personal and contact information"""
        try:
            contact_file = self.content_dir / "personal" / "contact-info.json"
            with open(contact_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load contact info: {e}")
            return {}

    def _load_markdown_file(self, file_path: Path) -> Dict[str, Any]:
        """Load markdown file with frontmatter"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Parse frontmatter
            frontmatter = {}
            body = content

            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    frontmatter_text = parts[1].strip()
                    body = parts[2].strip()

                    # Simple YAML-like parsing
                    for line in frontmatter_text.split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            key = key.strip()
                            value = value.strip().strip('"').strip("'")

                            # Handle boolean and numeric values
                            if value.lower() == 'true':
                                value = True
                            elif value.lower() == 'false':
                                value = False
                            elif value.isdigit():
                                value = int(value)

                            frontmatter[key] = value

            return {
                "metadata": frontmatter,
                "content": body
            }
        except Exception as e:
            logger.error(f"Failed to load markdown file {file_path}: {e}")
            return {"metadata": {}, "content": ""}

    def _extract_skills_from_markdown(self, content: str) -> List[str]:
        """Extract skills from markdown content"""
        skills = []

        # Match lines with emoji bullets and extract skill names
        # Format: 🤖 **Skill Name**: Description
        pattern = r'[\U0001F300-\U0001F9FF]\s+\*\*([^*:]+)\*\*'
        matches = re.findall(pattern, content)

        for match in matches:
            skill = match.strip()
            skills.append(skill)

        return skills

    def get_professional_summary(self) -> str:
        """Get professional summary from about section"""
        try:
            about_file = self.content_dir / "sections" / "about.md"
            data = self._load_markdown_file(about_file)

            # Extract first 2 paragraphs for summary
            paragraphs = [p.strip() for p in data["content"].split('\n\n') if p.strip()]
            summary = '\n\n'.join(paragraphs[:2])

            return summary
        except Exception as e:
            logger.error(f"Failed to load professional summary: {e}")
            return ""

    def get_skills(self) -> Dict[str, List[str]]:
        """Get all skills organized by category"""
        skills_by_category = {}

        try:
            skills_dir = self.content_dir / "components" / "skills"

            for skill_file in skills_dir.glob("*.md"):
                data = self._load_markdown_file(skill_file)
                category_title = data["metadata"].get("title", skill_file.stem)

                # Extract skills from content
                skills = self._extract_skills_from_markdown(data["content"])

                if skills:
                    skills_by_category[category_title] = skills

        except Exception as e:
            logger.error(f"Failed to load skills: {e}")

        return skills_by_category

    def get_projects(self) -> List[Dict[str, Any]]:
        """Get all projects with metadata"""
        projects = []

        try:
            projects_dir = self.content_dir / "components" / "projects"

            for project_file in projects_dir.glob("*.md"):
                data = self._load_markdown_file(project_file)

                # Extract project info
                project = {
                    "title": data["metadata"].get("title", "Untitled Project"),
                    "tech": data["metadata"].get("tech", ""),
                    "featured": data["metadata"].get("featured", False),
                    "github": data["metadata"].get("github", ""),
                    "order": data["metadata"].get("order", 999),
                    "description": self._extract_project_description(data["content"]),
                    "achievements": self._extract_achievements(data["content"])
                }

                projects.append(project)

            # Sort by order
            projects.sort(key=lambda x: x["order"])

        except Exception as e:
            logger.error(f"Failed to load projects: {e}")

        return projects

    def _extract_project_description(self, content: str) -> str:
        """Extract main project description"""
        # Get content before "Key Achievements" section
        parts = content.split("### Key Achievements")
        if parts:
            description = parts[0].strip()
            # Remove title lines (##)
            lines = [line for line in description.split('\n') if not line.startswith('##')]
            return '\n'.join(lines).strip()
        return content

    def _extract_achievements(self, content: str) -> List[str]:
        """Extract achievements from markdown content"""
        achievements = []

        # Find the achievements section
        if "### Key Achievements:" in content:
            parts = content.split("### Key Achievements:", 1)
            if len(parts) > 1:
                achievements_text = parts[1].strip()

                # Extract bullet points
                # Format: - 🚀 Achievement text
                pattern = r'-\s+[\U0001F300-\U0001F9FF]\s+(.+)'
                matches = re.findall(pattern, achievements_text)

                for match in matches:
                    achievements.append(match.strip())

        return achievements

    def get_complete_resume_data(self) -> Dict[str, Any]:
        """Aggregate all resume data into a structured format"""
        return {
            "personal": {
                "name": self.personal_info.get("name", ""),
                "title": self.personal_info.get("title", ""),
                "email": self.personal_info.get("email", ""),
                "phone": self.personal_info.get("phone", ""),
                "location": self.personal_info.get("location", ""),
                "linkedin": self.personal_info.get("social", {}).get("linkedin", {}).get("url", ""),
                "github": self.personal_info.get("social", {}).get("github", {}).get("url", ""),
            },
            "summary": self.get_professional_summary(),
            "skills": self.get_skills(),
            "projects": self.get_projects(),
            "generated_at": datetime.utcnow().isoformat()
        }


# Global instance
resume_aggregator = ResumeDataAggregator()
