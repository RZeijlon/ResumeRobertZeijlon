# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Robert Zeijlon's dynamic portfolio website built with React 19 + TypeScript + Vite. Features a content management system driven by JSON configuration files and Markdown content, with integrated chatbot, accessibility features, and customizable themes.

## Development Commands

- `npm run dev` - Start development server with hot reload (port 5173)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview the production build locally

## Architecture

**Core Framework:**
- React 19 with TypeScript and Vite
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

**AI Integration:**
- Groq SDK integration for chat functionality
- RAG (Retrieval Augmented Generation) with comprehensive knowledge base
- Context-aware responses about professional experience
- Configurable welcome messages

## Development Notes

- No test framework configured
- Strict TypeScript with comprehensive ESLint rules
- Hot module reloading for rapid development
- All content externalized to allow non-technical updates
- Image optimization and proper asset serving
- Security best practices for external links