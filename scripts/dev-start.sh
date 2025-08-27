#!/bin/bash
# Development Environment Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Portfolio Development Environment${NC}"

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

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your configuration${NC}"
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p backend/app/api/v1
mkdir -p frontend/node_modules
mkdir -p database/data

# Start the development environment
echo -e "${BLUE}🐳 Starting containers...${NC}"
$COMPOSE_CMD up --build -d database
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 10

$COMPOSE_CMD up --build backend frontend-dev

echo -e "${GREEN}✅ Development environment started!${NC}"
echo -e "${BLUE}📍 Services:${NC}"
echo -e "   • Frontend: http://localhost:5173"
echo -e "   • Backend API: http://localhost:8000"
echo -e "   • API Docs: http://localhost:8000/docs"
echo -e "   • Database: localhost:5432"
echo ""
echo -e "${YELLOW}💡 To stop: $COMPOSE_CMD down${NC}"
echo -e "${YELLOW}💡 To view logs: $COMPOSE_CMD logs -f${NC}"