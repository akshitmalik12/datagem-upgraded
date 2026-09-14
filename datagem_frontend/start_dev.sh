#!/bin/bash
# Script to start the Vite frontend development server, handling port conflicts.

PORT_VITE=5188 # Vite port from vite.config.js

echo "🚀 Starting Vite development server..."

# Kill any existing Vite processes
echo "Checking for existing Vite processes..."
pkill -f "vite" 2>/dev/null || true

# Find and kill processes using the port
echo "Checking if port $PORT_VITE is in use..."
PIDS=$(lsof -t -i :$PORT_VITE 2>/dev/null)

if [ -n "$PIDS" ]; then
    echo "⚠️  Processes found on port $PORT_VITE: $PIDS"
    echo "🔄 Attempting to kill processes on port $PORT_VITE..."
    echo $PIDS | xargs kill -9 2>/dev/null || true
    echo "✅ Processes killed."
    sleep 2 # Give some time for the port to free up
else
    echo "✅ No processes found on port $PORT_VITE."
fi

# Double check port is free
if lsof -ti:$PORT_VITE > /dev/null 2>&1; then
    echo "⚠️  Port still in use, forcing kill..."
    lsof -ti:$PORT_VITE | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Ensure npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found, running npm install..."
    npm install
fi

echo "🎯 Starting Vite on port $PORT_VITE..."
npm run dev

