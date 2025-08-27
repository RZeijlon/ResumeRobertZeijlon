#!/bin/bash
# Initial Project Setup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Portfolio CMS & RAG Setup${NC}"
echo -e "${BLUE}=============================${NC}"

# Check system requirements
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check container runtime
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker found${NC}"
    CONTAINER_CMD="docker"
elif command -v podman &> /dev/null; then
    echo -e "${GREEN}✅ Podman found${NC}"
    CONTAINER_CMD="podman"
else
    echo -e "${YELLOW}⚠️  No container runtime found. Install Docker or Podman for full functionality.${NC}"
    CONTAINER_CMD=""
fi

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${YELLOW}📦 node_modules already exists, skipping npm install${NC}"
fi

# Install backend dependencies (if Python is available)
if command -v python3 &> /dev/null; then
    echo -e "${BLUE}🐍 Installing backend dependencies...${NC}"
    cd backend
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        echo -e "${YELLOW}🐍 venv already exists, skipping pip install${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  Python 3 not found. Backend will run in containers only.${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}⚙️  Creating .env file from template...${NC}"
    cp .env.example .env
    
    # Generate a random secret key
    if command -v openssl &> /dev/null; then
        SECRET_KEY=$(openssl rand -hex 32)
        sed -i "s/your_secret_key_for_jwt_tokens_here/$SECRET_KEY/" .env
        echo -e "${GREEN}🔐 Generated random secret key${NC}"
    fi
    
    # Generate a random postgres password
    if command -v openssl &> /dev/null; then
        POSTGRES_PASSWORD=$(openssl rand -base64 32)
        sed -i "s/your_secure_password_here/$POSTGRES_PASSWORD/" .env
        echo -e "${GREEN}🗄️  Generated random database password${NC}"
    fi
    
    echo -e "${YELLOW}📝 Please edit .env file with your API keys:${NC}"
    echo -e "   • GROQ_API_KEY (for chat functionality)"
    echo -e "   • OPENAI_API_KEY (optional, for embeddings)"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Make scripts executable
chmod +x scripts/*.sh

# Create necessary directories
mkdir -p backend/app/api/v1
mkdir -p database/data
mkdir -p logs

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo -e "1. Edit .env file with your API keys"
echo -e "2. Run development server:"
echo -e "   ${YELLOW}npm run dev${NC} (frontend only)"
echo -e "   ${YELLOW}./scripts/dev-start.sh${NC} (full stack with containers)"
echo ""
echo -e "3. For production deployment:"
echo -e "   ${YELLOW}./scripts/prod-deploy.sh${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   • API docs: http://localhost:8000/docs (when backend is running)"
echo -e "   • Frontend: http://localhost:5173"
echo -e "   • Implementation roadmap: IMPLEMENTATION_ROADMAP.md"