# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Robert Zeijlon's portfolio website - a React + TypeScript + Vite application showcasing AI/ML projects and professional experience. The site is a single-page application with sections for About, Projects, and Contact information.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview the production build locally

## Architecture

**Frontend Stack:**
- React 19 with TypeScript and Vite
- React Router DOM for navigation
- React Icons for UI icons
- CSS modules for styling

**Key Files:**
- `src/App.tsx` - Main application component with all page sections
- `src/App.css` - Primary stylesheet
- `public/images/` - Static image assets for projects
- `vite.config.ts` - Vite configuration with React plugin

**TypeScript Configuration:**
- Strict mode enabled with comprehensive linting rules
- Bundler module resolution for Vite compatibility
- Separate configs for app (`tsconfig.app.json`) and Node (`tsconfig.node.json`)

**ESLint Setup:**
- TypeScript ESLint with recommended rules
- React hooks and refresh plugins configured
- Modern flat config format

## Content Structure

The portfolio is structured as a single-page application with:
- Hero section highlighting AI/ML specialization
- About section with detailed skill categories (AI/ML, Development, Infrastructure, Specializations)
- Projects section featuring Transcriptomatic and placeholders for future projects
- Contact section with social media and professional links

## Development Notes

- Uses modern React patterns (functional components, hooks)
- Responsive design with CSS Grid and Flexbox
- External links properly configured with security attributes
- Image assets served from public directory
- No test framework currently configured