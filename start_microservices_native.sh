#!/bin/bash
pkill -f uvicorn || true
pkill -f "python3 main.py" || true
BASE_DIR=$(pwd)
mkdir -p logs

set -a
source $BASE_DIR/datagem_backend/.env
set +a
export OPENAI_API_KEY=${OPENAI_API_KEY:-"mocked_key"}
# OVERRIDE DATABASE_URL to use the monolithic SQLite DB since Supabase is timing out
export DATABASE_URL="sqlite:///$BASE_DIR/datagem_backend/datagem.db"

echo "Starting Auth Service..."
cd $BASE_DIR/datagem_microservices/auth_service && uvicorn main:app --port 8001 > $BASE_DIR/logs/auth.log 2>&1 &

echo "Starting Chat Service..."
cd $BASE_DIR/datagem_microservices/chat_service && uvicorn main:app --port 8002 > $BASE_DIR/logs/chat.log 2>&1 &

echo "Starting Voice Service..."
cd $BASE_DIR/datagem_microservices/voice_service && uvicorn main:app --port 8003 > $BASE_DIR/logs/voice.log 2>&1 &

echo "Starting API Gateway..."
cd $BASE_DIR/datagem_microservices/api_gateway && python3 main.py > $BASE_DIR/logs/gateway.log 2>&1 &

echo "Microservices cluster is running natively with local SQLite!"
