#!/bin/bash

# ParakeetAI Setup Script
# Run this script once to set up the project

echo "🦜 ParakeetAI Setup"
echo "==================="
echo ""

# Check Python
echo "Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ $PYTHON_VERSION"
else
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

# Check Node.js
echo ""
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
echo ""
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Setup Backend
echo ""
echo "Setting up Backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "✅ Backend dependencies installed"

cd ..

# Setup Frontend
echo ""
echo "Setting up Frontend..."
cd frontend

# Install dependencies
npm install

echo "✅ Frontend dependencies installed"

cd ..

# Make scripts executable
chmod +x start.sh setup.sh

echo ""
echo "==================="
echo "🎉 Setup Complete!"
echo "==================="
echo ""
echo "Before starting, set your Anthropic API key:"
echo "  export ANTHROPIC_API_KEY=\"your-api-key-here\""
echo ""
echo "Then run:"
echo "  ./start.sh"
echo ""
echo "Or start manually:"
echo "  Backend:  cd backend && source venv/bin/activate && python run.py"
echo "  Frontend: cd frontend && npm run dev"

