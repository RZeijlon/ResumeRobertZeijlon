#!/bin/bash
# Production Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Portfolio Production Environment${NC}"

# Check if Docker or Podman is available
if command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    COMPOSE_CMD="docker compose"
elif command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    COMPOSE_CMD="podman-compose"
else
    echo -e "${RED}❌ Neither Docker nor Podman found. Please install one of them.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using $CONTAINER_CMD${NC}"

# Check if .env file exists and has production values
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found. Please create it from .env.example${NC}"
    exit 1
fi

# Verify critical environment variables
if ! grep -q "POSTGRES_PASSWORD=" .env || ! grep -q "SECRET_KEY=" .env; then
    echo -e "${RED}❌ Missing critical environment variables. Please check your .env file.${NC}"
    exit 1
fi

# Build and test the application first
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend build completed${NC}"

# Start database first
echo -e "${BLUE}🗄️  Starting database...${NC}"
$COMPOSE_CMD -f docker-compose.prod.yml up -d database

echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 15

# Start backend
echo -e "${BLUE}⚙️  Starting backend...${NC}"
$COMPOSE_CMD -f docker-compose.prod.yml up -d backend

echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 10

# Start frontend
echo -e "${BLUE}🎨 Starting frontend...${NC}"
$COMPOSE_CMD -f docker-compose.prod.yml up -d frontend

# Start Redis
echo -e "${BLUE}🔴 Starting Redis...${NC}"
$COMPOSE_CMD -f docker-compose.prod.yml up -d redis

echo -e "${GREEN}✅ Production deployment completed!${NC}"
echo -e "${BLUE}📍 Services:${NC}"
echo -e "   • Application: http://localhost:3000"
echo -e "   • API: http://localhost:3000/api"
echo -e "   • Health Check: http://localhost:3000/health"
echo ""
echo -e "${YELLOW}💡 To stop: $COMPOSE_CMD -f docker-compose.prod.yml down${NC}"
echo -e "${YELLOW}💡 To view logs: $COMPOSE_CMD -f docker-compose.prod.yml logs -f${NC}"
echo -e "${YELLOW}💡 To update: git pull && ./scripts/prod-deploy.sh${NC}"