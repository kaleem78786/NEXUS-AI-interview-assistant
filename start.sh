#!/bin/bash

# ParakeetAI Startup Script
# This script starts both the backend and frontend servers

echo "🦜 Starting ParakeetAI..."
echo ""

# Set the API key
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-your-api-key-here}"

# Start backend
echo "📦 Starting Backend Server..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt -q

# Start backend in background
python run.py &
BACKEND_PID=$!

cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server..."
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ ParakeetAI is running!"
echo ""
echo "🔗 Backend:  http://localhost:8000"
echo "🔗 Frontend: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping ParakeetAI...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait


