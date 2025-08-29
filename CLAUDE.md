# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Robert Zeijlon's dynamic portfolio website built with React 19 + TypeScript + Vite. Features a content management system driven by JSON configuration files and Markdown content, with integrated chatbot, accessibility features, and customizable themes.

## Development Commands

**Frontend Development** (from `frontend/` directory):
- `npm run dev` - Start development server with hot reload (port 5173)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview the production build locally

**Full Stack Development** (Docker-based, from root):
- `./scripts/dev-start.sh` - Start complete development environment (frontend + backend + database)
- `docker compose up --build` - Manual container startup
- `docker compose down` - Stop all services
- `docker compose logs -f [service]` - View service logs

**Backend API** (FastAPI with RAG system):
- Backend runs on port 8000 with auto-reload
- API docs available at http://localhost:8000/docs
- RAG system processes content from `frontend/public/page_content/rag-knowledge-base/`

## Architecture

**Full Stack Architecture:**
- **Frontend**: React 19 with TypeScript and Vite (port 5173)
- **Backend**: FastAPI with Python 3.11+ (port 8000)
- **Database**: PostgreSQL 15 with pgvector extension for embeddings
- **AI**: Groq SDK integration with RAG (Retrieval Augmented Generation)
- **Deployment**: Docker Compose with multi-stage builds

**Frontend Framework:**
- Single-page application with dynamic section rendering
- Custom hooks for state management (useContentManager, useThemeManager)
- React Icons for UI elements

**Dynamic Content Management System:**
The site is entirely driven by configuration files and Markdown content:

- **Configuration Files** (`frontend/public/page_content/config/`):
  - `site.json` - Site metadata, feature flags, chatbot settings
  - `layout.json` - Section definitions, component mapping, responsive settings
  - `theme.json` - Theme definitions, color schemes, animation settings
  - `personal/contact-info.json` - Personal and contact information

- **Content Files** (`frontend/public/page_content/`):
  - `sections/` - Main page sections (hero.md, about.md, projects.md, contact.md)
  - `components/` - Reusable content components (skills/, projects/, philosophy.md)
  - `assets/` - Images and documents
  - `rag-knowledge-base/` - Comprehensive knowledge base for AI chatbot

**Key Architecture Patterns:**

1. **Dynamic Section Rendering**: `DynamicSection.tsx` renders different component types based on layout configuration
2. **Content Management Hook**: `useContentManager.ts` loads and manages all configuration and content files
3. **Theme System**: `useThemeManager.ts` handles theme switching, accessibility settings, and animation controls
4. **Frontmatter Processing**: Content files use YAML frontmatter for metadata with `parseFrontmatter.ts` utility

**Component Architecture:**
- `App.tsx` - Main application container with responsive layout logic
- `DynamicSection.tsx` - Universal section renderer (HeroSection, AboutSection, ProjectGrid, etc.)
- `ChatBot.tsx` - Integrated AI chatbot with RAG capabilities
- `MatrixBackground.tsx` - Animated canvas background
- `AccessibilityMenu.tsx` - Accessibility controls (animations, themes)
- `MarkdownRenderer.tsx` - Markdown content processing

## Content System

The portfolio uses a sophisticated content management approach:

**Section Configuration**: Each section is defined in `layout.json` with:
- Component type mapping (HeroSection, SkillsGrid, ProjectGrid, etc.)
- Content source (single file or multiple files)
- Layout width (full/dynamic)
- Navigation settings

**Content Loading**: The `useContentManager` hook:
- Loads all configuration files on app initialization
- Processes Markdown files with frontmatter metadata
- Builds a content map for efficient access
- Handles error states and loading states

**Dynamic Rendering**: Components render based on:
- Section configuration
- Content metadata (titles, subtitles, order, featured status)
- Personal information injection
- Theme and accessibility settings

## Responsive Design

- Breakpoint-driven layout (mobile: 768px, tablet: 1024px, desktop: 1200px)
- Chat system switches between side-by-side and fullscreen at 1024px
- Responsive typography using CSS clamp() functions
- Dynamic grid layouts for skills and projects

## Features

**Accessibility:**
- Skip navigation links
- High contrast theme option
- Animation disable controls
- Keyboard navigation support
- ARIA labels and semantic HTML

**Theming:**
- Multiple theme variants (dark, light, high-contrast)
- Persistent theme storage in localStorage
- Dynamic CSS custom properties
- Animation and matrix background controls

**AI Integration & RAG System:**
- **Frontend**: Groq SDK integration for chat functionality with configurable welcome messages
- **Backend**: FastEmbed + PostgreSQL pgvector for semantic search and embeddings
- **RAG Pipeline**: 
  1. Content chunking from `rag-knowledge-base/` markdown files
  2. Embedding generation using FastEmbed models
  3. Vector similarity search with cosine similarity
  4. Context-aware response generation via Groq API
- **Models**: Uses `llama-3.3-70b-versatile` for chat, FastEmbed for embeddings
- **Knowledge Base**: Comprehensive professional content in `frontend/public/page_content/rag-knowledge-base/`

## Development Notes

**Frontend:**
- No test framework configured
- Strict TypeScript with comprehensive ESLint rules
- Hot module reloading for rapid development
- All content externalized to allow non-technical updates
- Image optimization and proper asset serving

**Backend & Infrastructure:**
- FastAPI with automatic OpenAPI documentation
- AsyncPG for database operations with connection pooling
- Environment-based configuration via `app/core/config.py`
- Vector embeddings stored in PostgreSQL with pgvector extension
- Health checks and proper error handling throughout the stack
- Docker multi-stage builds for optimized production images

**Content Processing:**
- Markdown files with YAML frontmatter for metadata
- Automatic content chunking and embedding generation
- File-based content management allows non-technical updates
- RAG knowledge base processing via `backend/app/services/rag_service.py`