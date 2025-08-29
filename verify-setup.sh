#!/bin/bash

echo "🚀 Portfolio RAG System - Setup Verification Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running with Docker or Podman
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    CONTAINER_CMD="docker"
elif command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
    CONTAINER_CMD="podman"
else
    echo -e "${RED}❌ Neither docker-compose nor podman-compose found!${NC}"
    echo "Please install Docker or Podman with compose support."
    exit 1
fi

echo -e "${BLUE}Using: $COMPOSE_CMD${NC}"
echo ""

# 1. Check containers
echo -e "${YELLOW}1. Checking container status...${NC}"
$COMPOSE_CMD ps

# 2. Check services
echo ""
echo -e "${YELLOW}2. Testing service endpoints...${NC}"

# Frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Frontend (http://localhost:5173) - Running${NC}"
else
    echo -e "${RED}❌ Frontend (http://localhost:5173) - Not accessible${NC}"
fi

# Backend health
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend (http://localhost:8000) - Healthy${NC}"
else
    echo -e "${RED}❌ Backend (http://localhost:8000) - Not healthy${NC}"
fi

# Database
if $CONTAINER_CMD exec portfolio-db pg_isready -U portfolio -d portfolio > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database (localhost:5432) - Ready${NC}"
else
    echo -e "${RED}❌ Database (localhost:5432) - Not ready${NC}"
fi

# 3. Check RAG system
echo ""
echo -e "${YELLOW}3. Testing RAG system...${NC}"

RAG_STATUS=$(curl -s http://localhost:8000/api/v1/chat/rag-status 2>/dev/null)
if [[ $? -eq 0 ]]; then
    if echo $RAG_STATUS | grep -q '"rag_enabled":true'; then
        EMBEDDING_COUNT=$(echo $RAG_STATUS | grep -o '"embedding_count":[0-9]*' | cut -d: -f2)
        echo -e "${GREEN}✅ RAG System - Ready (${EMBEDDING_COUNT} embeddings loaded)${NC}"
    else
        echo -e "${YELLOW}⚠️  RAG System - Available but not enabled${NC}"
    fi
    
    # Test RAG chat
    echo -e "${BLUE}Testing RAG chat...${NC}"
    RAG_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/chat/message \
      -H "Content-Type: application/json" \
      -d '{"message": "What is Robert professional background?", "use_rag": true}' 2>/dev/null)
    
    if echo $RAG_RESPONSE | grep -q '"sources":\[.*\]' && ! echo $RAG_RESPONSE | grep -q '"sources":\[\]'; then
        echo -e "${GREEN}✅ RAG Chat - Working with source citations${NC}"
    else
        echo -e "${YELLOW}⚠️  RAG Chat - Working but no sources (check GROQ_API_KEY)${NC}"
    fi
else
    echo -e "${RED}❌ RAG System - Not ready${NC}"
    echo -e "${BLUE}Run: curl -X POST http://localhost:8000/api/v1/chat/initialize-rag${NC}"
fi

# 4. Environment check
echo ""
echo -e "${YELLOW}4. Environment configuration...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    if grep -q "GROQ_API_KEY=your_groq_api_key_here" .env; then
        echo -e "${YELLOW}⚠️  GROQ_API_KEY not configured (RAG chat won't work)${NC}"
    elif grep -q "GROQ_API_KEY=" .env; then
        echo -e "${GREEN}✅ GROQ_API_KEY configured${NC}"
    fi
    
    if grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env; then
        echo -e "${BLUE}ℹ️  OPENAI_API_KEY not configured (optional)${NC}"
    elif grep -q "OPENAI_API_KEY=" .env; then
        echo -e "${GREEN}✅ OPENAI_API_KEY configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${BLUE}Run: cp .env.example .env${NC}"
fi

echo ""
echo -e "${BLUE}=================================================="
echo -e "🌐 Access your portfolio at: http://localhost:5173"
echo -e "📚 API docs available at: http://localhost:8000/docs"
echo -e "=================================================="
echo -e "${NC}"