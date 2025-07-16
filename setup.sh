#!/bin/bash

echo "🚀 Setting up Feedback Collection Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas.${NC}"
else
    echo -e "${GREEN}✅ MongoDB found${NC}"
fi

# Setup backend
echo -e "\n📦 Setting up backend..."
cd server

if [ ! -f package.json ]; then
    echo -e "${RED}❌ Backend package.json not found${NC}"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend npm install failed${NC}"
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created .env file from .env.example. Please update with your values.${NC}"
fi

echo -e "${GREEN}✅ Backend setup complete${NC}"

# Setup frontend
echo -e "\n🎨 Setting up frontend..."
cd ../client

if [ ! -f package.json ]; then
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend npm install failed${NC}"
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Created .env.local file from .env.example${NC}"
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"

cd ..

echo -e "\n🎉 Setup complete!"
echo -e "\n📋 Next steps:"
echo -e "1. Update server/.env with your MongoDB URI and JWT secret"
echo -e "2. Start MongoDB (if running locally): ${YELLOW}mongod${NC}"
echo -e "3. Start backend server: ${YELLOW}cd server && npm run dev${NC}"
echo -e "4. Start frontend server: ${YELLOW}cd client && npm run dev${NC}"
echo -e "5. Open http://localhost:3000 in your browser"
echo -e "\n📚 For detailed instructions, see README.md"