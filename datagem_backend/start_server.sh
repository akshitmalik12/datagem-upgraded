#!/bin/bash

# Start server script that handles port conflicts

PORT=8000

# Function to kill process on port
kill_port() {
    echo "🔍 Checking for processes on port $PORT..."
    PIDS=$(lsof -ti:$PORT)
    if [ ! -z "$PIDS" ]; then
        echo "⚠️  Found processes using port $PORT: $PIDS"
        echo "🛑 Killing processes..."
        kill -9 $PIDS 2>/dev/null
        sleep 1
        echo "✅ Port $PORT is now free"
    else
        echo "✅ Port $PORT is available"
    fi
}

# Kill any existing processes
kill_port

# Start the server
echo "🚀 Starting uvicorn server on port $PORT..."
cd "$(dirname "$0")"
uvicorn main:app --reload --host 0.0.0.0 --port $PORT

