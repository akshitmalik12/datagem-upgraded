#!/bin/bash

# Stop server script

PORT=8000

echo "🔍 Looking for processes on port $PORT..."
PIDS=$(lsof -ti:$PORT)

if [ -z "$PIDS" ]; then
    echo "✅ No processes found on port $PORT"
else
    echo "🛑 Stopping processes: $PIDS"
    kill -9 $PIDS 2>/dev/null
    echo "✅ Server stopped"
fi

