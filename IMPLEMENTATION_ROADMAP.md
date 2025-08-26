# Portfolio CMS & RAG Implementation Roadmap

## Project Vision
Transform the existing React portfolio into a containerized, content-managed system with RAG capabilities, making it a reusable template for other developers while showcasing advanced AI integration skills.

## Phase 1: Content Management System (CMS)

### 1.1 Directory Structure Creation
```
./page_content/
├── config/
│   ├── site.json              # Site configuration & metadata
│   ├── theme.json             # Color themes & styling
│   ├── layout.json            # Section layout configuration
│   └── navigation.json        # Navigation structure
├── sections/
│   ├── hero.md               # Hero section content
│   ├── about.md              # About section intro
│   ├── projects.md           # Projects section intro
│   └── contact.md            # Contact section content
├── components/
│   ├── welcome-chat.md       # ChatBot welcome message
│   ├── philosophy.md         # Personal philosophy statement
│   ├── skills/
│   │   ├── ai-ml.md         # AI/ML technologies
│   │   ├── development.md   # Development stack
│   │   ├── infrastructure.md # Infrastructure & DevOps
│   │   └── specializations.md # Professional specializations
│   └── projects/
│       ├── transcriptomatic.md
│       ├── ai-server-build.md
│       └── project-template.md # Template for new projects
├── personal/
│   ├── contact-info.json     # Contact details & social links
│   └── profile.json          # Name, title, professional info
└── assets/
    ├── images/               # Moved from public/images/
    └── documents/            # PDFs, resumes, etc.
```

### 1.2 Configuration System Design

#### Theme Configuration (theme.json)
```json
{
  "themes": {
    "default-dark": {
      "name": "Matrix Dark",
      "colors": {
        "highlight": "#20b2aa",           // Teal - primary accent
        "frames": "#2e8b45",             // Seaweed green - borders/frames  
        "lighter-background": "#2d342d",  // Dark green - cards/panels
        "darker-background": "#1a1f1a"    // Very dark - main background
      },
      "effects": {
        "matrixBackground": true,
        "animations": true
      }
    },
    "default-light": {
      "name": "Clean Light", 
      "colors": {
        "highlight": "#2e8b45",
        "frames": "#20b2aa",
        "lighter-background": "#f8f9fa",
        "darker-background": "#ffffff"
      },
      "effects": {
        "matrixBackground": false,
        "animations": true
      }
    },
    "high-contrast": {
      "name": "High Visibility",
      "colors": {
        "highlight": "#000000",
        "frames": "#000000", 
        "lighter-background": "#ffffff",
        "darker-background": "#ffffff"
      },
      "effects": {
        "matrixBackground": false,
        "animations": false
      }
    }
  },
  "customization": {
    "allowUserColors": true,
    "colorMappings": {
      "highlight": ["links", "buttons", "accent-text"],
      "frames": ["borders", "section-dividers", "card-outlines"],
      "lighter-background": ["cards", "panels", "secondary-areas"],
      "darker-background": ["main-background", "primary-areas"]
    }
  }
}
```

#### Site Configuration (site.json)
```json
{
  "meta": {
    "title": "Robert Zeijlon - AI Developer Portfolio",
    "description": "AI Developer & Infrastructure Enthusiast specializing in local models and self-hosted solutions",
    "keywords": ["AI", "Machine Learning", "React", "Python", "DevOps"],
    "author": "Robert Zeijlon"
  },
  "features": {
    "chatBot": {
      "enabled": true,
      "welcomeFile": "components/welcome-chat.md",
      "ragEnabled": false  // Will be true in Phase 3
    },
    "accessibility": {
      "highVisibilityMode": true,
      "noAnimationMode": true,
      "keyboardNavigation": true
    },
    "matrixBackground": {
      "enabled": true,
      "particles": 150,
      "speed": 1.0
    }
  }
}
```

### 1.3 Content Loading System
- Create `useContentManager()` hook for dynamic content loading
- Implement markdown parser with frontmatter support
- Build component registry for different content types
- Add content validation and error handling

### 1.4 Theme System Implementation
- CSS custom property system with theme switching
- Theme persistence in localStorage
- Smooth transitions between themes
- Accessibility compliance for all themes

## Phase 2: Containerization & Backend Architecture

### 2.1 Docker/Podman Container Setup
```
project-root/
├── frontend/                  # React application
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                   # FastAPI application
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
└── .env.example              # Environment variables template
```

### 2.2 FastAPI Backend Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI application entry
│   ├── core/
│   │   ├── config.py         # Configuration management
│   │   ├── security.py       # Authentication & CORS
│   │   └── database.py       # Database connections
│   ├── api/
│   │   ├── v1/
│   │   │   ├── content.py    # Content management endpoints
│   │   │   ├── chat.py       # Chat & RAG endpoints
│   │   │   └── theme.py      # Theme management endpoints
│   │   └── dependencies.py   # FastAPI dependencies
│   ├── services/
│   │   ├── content_service.py # Content loading & management
│   │   ├── rag_service.py     # RAG implementation
│   │   └── llm_service.py     # LLM integration (Groq)
│   ├── models/
│   │   ├── content.py        # Pydantic models for content
│   │   ├── chat.py           # Chat message models
│   │   └── theme.py          # Theme configuration models
│   └── utils/
│       ├── markdown.py       # Markdown processing
│       ├── embedding.py      # Vector embedding utilities
│       └── validation.py     # Content validation
├── Dockerfile
└── requirements.txt
```

### 2.3 Container Orchestration
- **Development**: Hot reload, volume mounts, debug ports
- **Production**: Optimized builds, health checks, scaling
- **Database**: Vector database container (Postgres + pgvector)
- **Reverse Proxy**: Nginx for static files and API routing

## Phase 3: RAG System Implementation

### 3.1 Vector Database Setup
- PostgreSQL with pgvector extension
- Content embedding pipeline
- Similarity search implementation
- Index optimization for fast retrieval

### 3.2 Embedding Strategy
```
Content Sources → Chunking → Embeddings → Vector Store
├── Markdown files (sections, components)
├── Project documentation
├── Skills and experience data
└── Personal information
```

### 3.3 RAG Pipeline
1. **Content Processing**: Parse markdown, extract metadata
2. **Chunking**: Semantic chunking for optimal retrieval  
3. **Embedding**: Generate embeddings (OpenAI/local model)
4. **Storage**: Store in vector database with metadata
5. **Retrieval**: Similarity search based on user queries
6. **Generation**: Context-aware responses via LLM

### 3.4 Enhanced Chat Features
- Dynamic context retrieval from portfolio content
- Project-specific Q&A capabilities
- Skill-based recommendations
- Real-time content updates without redeployment

## Phase 4: Advanced Features & Template System

### 4.1 Template Generalization
- Environment variable configuration for easy customization
- Content validation and schema enforcement
- Setup wizard for new portfolio creation
- Documentation for customization

### 4.2 Advanced Theme System
- Theme editor UI in admin panel
- Custom color picker with accessibility validation
- Theme import/export functionality
- Live preview of theme changes

### 4.3 Content Management Interface
- Admin panel for content editing
- Markdown editor with live preview
- File upload and asset management
- Content versioning and backup

### 4.4 Performance Optimizations
- Content caching strategies
- Lazy loading for sections
- Image optimization pipeline
- CDN integration support

## Phase 5: AI Agent & MCP Integration

### 5.1 Model Context Protocol Implementation
- MCP server setup for external tool integration
- Agent architecture for specialized tasks
- Tool connectivity for development workflows
- Multi-agent coordination patterns

### 5.2 Advanced AI Features
- Code analysis and explanation capabilities
- Project recommendation engine
- Automated content generation assistance
- Interactive portfolio exploration

## Technical Implementation Timeline

### Week 1-2: Foundation
- [ ] Create directory structure and configuration files
- [ ] Extract existing content to markdown files
- [ ] Implement basic content loading system
- [ ] Set up theme switching infrastructure

### Week 3-4: Backend & Containerization
- [ ] Develop FastAPI backend structure
- [ ] Create Docker/Podman containers
- [ ] Implement content API endpoints
- [ ] Set up development environment

### Week 5-6: RAG System
- [ ] Set up vector database
- [ ] Implement embedding pipeline
- [ ] Create RAG service integration
- [ ] Enhance ChatBot with dynamic retrieval

### Week 7-8: Polish & Template
- [ ] Create admin interface
- [ ] Implement advanced theme system
- [ ] Generalize for template use
- [ ] Documentation and deployment guides

## Success Metrics

### Technical Objectives
- ✅ Modular, maintainable content management system
- ✅ Production-ready containerized deployment
- ✅ Fast, accurate RAG implementation
- ✅ Accessible, customizable theming system

### Portfolio Benefits
- 🚀 Demonstrates advanced React architecture skills
- 🤖 Shows practical AI/ML integration capabilities
- 🐳 Highlights DevOps and containerization expertise
- 🎨 Proves UX/UI and accessibility competency
- 📚 Creates reusable open-source template

### Business Impact
- 💼 Showcases enterprise-level development practices
- 🔍 Improves discoverability through better SEO
- 🤝 Provides interactive, engaging user experience
- 📈 Demonstrates scalable, maintainable code architecture

---

*This roadmap will evolve as implementation progresses. Each phase builds upon the previous, creating a sophisticated, AI-powered portfolio system that serves as both a personal showcase and a template for the developer community.*