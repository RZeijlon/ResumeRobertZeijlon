"""
FastAPI main application entry point for Portfolio CMS & RAG System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from pathlib import Path

from app.api.v1.content import router as content_router
from app.api.v1.chat import router as chat_router
from app.api.v1.theme import router as theme_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Portfolio Backend starting up...")
    print(f"📁 Content path: {settings.CONTENT_PATH}")
    print(f"🎨 Frontend URL: {settings.FRONTEND_URL}")
    
    # Ensure content directory exists
    content_path = Path(settings.CONTENT_PATH)
    if not content_path.exists():
        print(f"❌ Content directory not found: {content_path}")
    else:
        print(f"✅ Content directory found: {content_path}")
    
    yield
    
    # Shutdown
    print("🛑 Portfolio Backend shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Portfolio CMS & RAG API",
    description="Backend API for dynamic portfolio content management and RAG chat system",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for page_content
if Path(settings.CONTENT_PATH).exists():
    app.mount("/page_content", StaticFiles(directory=settings.CONTENT_PATH), name="page_content")

# Include API routers
app.include_router(content_router, prefix="/api/v1/content", tags=["content"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])  
app.include_router(theme_router, prefix="/api/v1/theme", tags=["theme"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Portfolio CMS & RAG API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "content": "/api/v1/content",
            "chat": "/api/v1/chat",
            "theme": "/api/v1/theme",
            "docs": "/docs",
            "page_content": "/page_content"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    content_exists = Path(settings.CONTENT_PATH).exists()
    return {
        "status": "healthy" if content_exists else "warning",
        "content_directory": str(settings.CONTENT_PATH),
        "content_exists": content_exists,
        "timestamp": settings.startup_time.isoformat()
    }