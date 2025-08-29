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

### Prerequisites
- **Docker** or **Podman** with compose support
- **Git** for cloning the repository
- **Optional**: Node.js 18+ for local frontend development

### 🐳 Container Setup (Docker/Podman)

#### Using Docker
```bash
# 1. Clone the repository
git clone https://github.com/your-username/ResumeRobertZeijlon.git
cd ResumeRobertZeijlon

# 2. Configure environment variables
cp .env.example .env
# Edit .env file with your API keys (optional for basic functionality)

# 3. Start all services
docker-compose up -d

# 4. Initialize RAG system (optional, for AI chat functionality)
curl -X POST http://localhost:8000/api/v1/chat/initialize-rag

# 5. Verify everything is working
./verify-setup.sh
```

#### Using Podman
```bash
# 1. Clone the repository
git clone https://github.com/your-username/ResumeRobertZeijlon.git
cd ResumeRobertZeijlon

# 2. Configure environment variables
cp .env.example .env
# Edit .env file with your API keys (optional for basic functionality)

# 3. Start all services with Podman Compose
podman-compose up -d

# 4. Initialize RAG system (optional, for AI chat functionality)
curl -X POST http://localhost:8000/api/v1/chat/initialize-rag

# 5. Verify everything is working
./verify-setup.sh
```

### 🌐 Access Your Portfolio

After starting the containers, your services will be available at:

- **Portfolio Website**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

### 🤖 RAG Chat System Setup

The portfolio includes an AI-powered chatbot with RAG (Retrieval-Augmented Generation) capabilities:

1. **Environment Variables** (add to `.env`):
   ```bash
   # Required for AI chat functionality
   GROQ_API_KEY=your_groq_api_key_here
   
   # Optional: OpenAI API key as fallback for embeddings
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Initialize Knowledge Base**:
   ```bash
   # This processes 61 content chunks from 21 files
   curl -X POST http://localhost:8000/api/v1/chat/initialize-rag
   ```

3. **Test RAG Chat**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat/message \
     -H "Content-Type: application/json" \
     -d '{"message": "Tell me about Roberts background", "use_rag": true}'
   ```

### 📊 System Architecture

- **Frontend**: React 19 + TypeScript + Vite (Port 5173)
- **Backend**: FastAPI + Python (Port 8000)
- **Database**: PostgreSQL + pgvector (Port 5432)
- **Embeddings**: FastEmbed with BAAI/bge-small-en-v1.5 (384-dim, CPU-only)
- **LLM**: Groq API with Llama-3.3-70b-versatile

### ⚡ Development Mode

For faster frontend development without full container stack:

```bash
# Start backend services only
docker-compose up -d database backend

# Run frontend locally with hot reload
cd frontend
npm install
npm run dev
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

### AI/ML Stack
- **FastEmbed** - Lightweight, CPU-optimized embeddings (ONNX runtime)
- **BAAI/bge-small-en-v1.5** - 384-dimensional embedding model
- **Groq API** - Fast LLM inference with Llama-3.3-70b-versatile
- **PostgreSQL + pgvector** - Vector similarity search database

### Infrastructure
- **Docker/Podman** containerization
- **PostgreSQL** with pgvector extension
- **CPU-only deployment** - No GPU requirements
- **Production-ready** architecture

## 🔧 Troubleshooting & Management

### Container Management

#### Docker Commands
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend-dev
docker-compose logs -f database

# Restart services
docker-compose restart backend

# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Podman Commands
```bash
# Check container status
podman-compose ps

# View logs
podman-compose logs -f backend
podman logs portfolio-backend --tail 50

# Restart services
podman-compose restart backend

# Clean rebuild
podman-compose down
podman-compose build --no-cache
podman-compose up -d
```

### RAG System Management

```bash
# Check RAG status
curl -s http://localhost:8000/api/v1/chat/rag-status

# Reinitialize embeddings (if content changed)
curl -X POST http://localhost:8000/api/v1/chat/initialize-rag

# Test RAG functionality
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What can you tell me about Robert?", "use_rag": true}'

# Check backend health
curl -s http://localhost:8000/health
```

### Common Issues

1. **Port conflicts**: If ports 5173, 8000, or 5432 are in use, modify `docker-compose.yml`
2. **Permission issues**: Run `chmod +x scripts/*.sh` if scripts aren't executable
3. **Database connection**: Ensure PostgreSQL container is healthy before backend starts
4. **RAG not working**: Check that GROQ_API_KEY is set and valid
5. **Frontend not loading**: Clear browser cache and ensure containers are running

### Performance Monitoring

```bash
# Check resource usage
docker-compose top
podman-compose top

# Database connections
docker exec -it portfolio-db psql -U portfolio -d portfolio -c "SELECT count(*) FROM content_embeddings;"

# Vector search test
curl -s http://localhost:8000/api/v1/content/search?q=robert
```

## 📚 Documentation

- **Implementation Roadmap**: [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
- **Development Guide**: [CLAUDE.md](CLAUDE.md)
- **API Documentation**: http://localhost:8000/docs (when running)
- **RAG Knowledge Base**: [frontend/public/page_content/rag-knowledge-base/](frontend/public/page_content/rag-knowledge-base/)

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
