# Portfolio CMS & RAG System

**Robert Zeijlon's AI-Powered Portfolio** - A containerized, content-managed portfolio with RAG (Retrieval-Augmented Generation) chat capabilities.

## 🌟 Features

### ✨ **Advanced Content Management**
- **Dynamic Content Loading**: Markdown-based content system
- **Theme Customization**: 4-color theming with accessibility modes
- **Responsive Design**: Mobile-first with container queries
- **Template-Ready**: Easy customization for other developers

### 🤖 **AI-Powered Chat**
- **RAG Integration**: Context-aware responses about portfolio content
- **Vector Search**: PostgreSQL + pgvector for semantic search
- **Multiple LLM Support**: Groq, OpenAI integration
- **Voice Input**: Speech-to-text transcription

### 🐳 **Production-Ready Infrastructure**
- **Containerized**: Docker/Podman support
- **FastAPI Backend**: High-performance Python API
- **Vector Database**: PostgreSQL with pgvector extension
- **Scalable Architecture**: Microservices-ready design

## 🚀 Quick Start

### Development Environment

1. **Setup the project:**
   ```bash
   ./scripts/setup.sh
   ```

2. **Configure environment:**
   ```bash
   # Edit .env file with your API keys
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   # Frontend only
   cd frontend && npm run dev
   
   # Full stack with containers
   ./scripts/dev-start.sh
   ```

### Production Deployment

```bash
# Deploy to production
./scripts/prod-deploy.sh
```

## 📁 Project Structure

```
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── styles/         # CSS and theming
├── backend/                 # FastAPI + Python
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── models/         # Pydantic models
├── page_content/           # Content management
│   ├── config/            # Site configuration
│   ├── sections/          # Main page sections
│   ├── components/        # Reusable content blocks
│   └── personal/          # Personal information
├── database/              # PostgreSQL + pgvector setup
├── scripts/               # Deployment and utility scripts
└── docker-compose.yml     # Container orchestration
```

## 🎨 Content Management

### Adding Content
1. Create markdown files in `page_content/`
2. Use frontmatter for metadata:
   ```markdown
   ---
   title: "My Section"
   order: 1
   featured: true
   ---
   
   Your content here...
   ```

### Theme Customization
Edit `page_content/config/theme.json`:
```json
{
  "themes": {
    "custom-theme": {
      "name": "My Theme",
      "colors": {
        "highlight": "#your-color",
        "frames": "#your-color",
        "lighter-background": "#your-color",
        "darker-background": "#your-color"
      }
    }
  }
}
```

## 🔧 API Endpoints

- **Content**: `/api/v1/content/` - Content management
- **Chat**: `/api/v1/chat/` - RAG chat functionality  
- **Themes**: `/api/v1/theme/` - Theme configuration
- **Docs**: `/docs` - Interactive API documentation

## 🌍 Services

### Development
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **Database**: localhost:5432

### Production
- **Application**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health**: http://localhost:3000/health

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **CSS Container Queries** for responsive design
- **React Markdown** for content rendering

### Backend
- **FastAPI** for high-performance API
- **SQLAlchemy** with PostgreSQL
- **pgvector** for vector similarity search
- **Pydantic** for data validation

### Infrastructure
- **Docker/Podman** containerization
- **Nginx** reverse proxy
- **Redis** for caching (production)
- **PostgreSQL** with vector extension

## 📚 Documentation

- **Implementation Roadmap**: [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
- **Development Guide**: [CLAUDE.md](CLAUDE.md)
- **API Documentation**: http://localhost:8000/docs (when running)

## 🤝 Contributing

This portfolio serves as both a personal showcase and a template for other developers. Feel free to:

1. **Fork the repository**
2. **Customize the content** in `page_content/`
3. **Modify themes** and styling
4. **Add new features** following the established patterns

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using modern web technologies and AI integration**
