#!/bin/bash

# RAG System Setup Script
# This script initializes the RAG system by building containers and processing content

echo "🚀 Setting up Portfolio RAG System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please copy .env.example to .env and fill in your API keys:"
    echo "   cp .env.example .env"
    echo ""
    echo "You'll need at least one of these API keys:"
    echo "   - GROQ_API_KEY (recommended - faster and cheaper)"
    echo "   - OPENAI_API_KEY (for embeddings and chat)"
    echo ""
    echo "Get your Groq API key from: https://console.groq.com/"
    echo "Get your OpenAI API key from: https://platform.openai.com/"
    exit 1
fi

# Load environment variables
source .env

# Check if required API keys are set
if [ -z "$GROQ_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ No API keys found in .env file!"
    echo "📝 Please set at least one of GROQ_API_KEY or OPENAI_API_KEY"
    exit 1
fi

echo "✅ Environment configured"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
podman-compose down

# Build and start the containers
echo "🏗️  Building containers..."
podman-compose build --no-cache

echo "🚀 Starting containers..."
podman-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if backend is healthy
echo "🔍 Checking backend health..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "✅ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start"
        echo "📋 Check logs with: podman-compose logs backend"
        exit 1
    fi
    echo "   Attempt $i/30..."
    sleep 2
done

# Initialize RAG system
echo "🧠 Initializing RAG system..."
echo "   This may take a few minutes as we process all content and generate embeddings..."

response=$(curl -s -X POST http://localhost:8000/api/v1/chat/initialize-rag)
if echo "$response" | grep -q '"status": "success"'; then
    echo "✅ RAG system initialized successfully!"
    
    # Extract stats from response
    processed=$(echo "$response" | grep -o '"processed_files": [0-9]*' | grep -o '[0-9]*')
    embeddings=$(echo "$response" | grep -o '"generated_embeddings": [0-9]*' | grep -o '[0-9]*')
    
    echo "📊 Content processing complete:"
    echo "   📄 Processed files: $processed"
    echo "   🧠 Generated embeddings: $embeddings"
else
    echo "❌ RAG initialization failed"
    echo "Response: $response"
    echo ""
    echo "Common issues:"
    echo "   - Missing API keys (check .env file)"
    echo "   - API rate limits (wait a moment and try again)"
    echo "   - Network issues (check internet connection)"
    exit 1
fi

# Check RAG status
echo "🔍 Checking RAG status..."
curl -s http://localhost:8000/api/v1/chat/rag-status | python -m json.tool

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Your Portfolio RAG system is now running:"
echo "   🌐 Frontend: http://localhost:5173"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo "   💾 Database: localhost:5432"
echo ""
echo "💬 Try the chat feature on your portfolio - it now has intelligent, context-aware responses!"
echo ""
echo "Useful commands:"
echo "   podman-compose logs backend    # View backend logs"
echo "   podman-compose logs frontend   # View frontend logs  "
echo "   podman-compose down            # Stop all services"
echo "   podman-compose up -d           # Start all services"