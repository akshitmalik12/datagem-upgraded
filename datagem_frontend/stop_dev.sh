#!/bin/bash
# Script to stop the Vite frontend development server by killing processes on port 5188.

PORT_VITE=5188 # Vite port from vite.config.js

echo "Checking for processes on port $PORT_VITE..."
PIDS=$(lsof -t -i :$PORT_VITE)

if [ -n "$PIDS" ]; then
    echo "Processes found on port $PORT_VITE: $PIDS"
    echo "Attempting to kill processes on port $PORT_VITE..."
    kill -9 $PIDS
    echo "Processes killed."
else
    echo "No processes found on port $PORT_VITE."
fi

