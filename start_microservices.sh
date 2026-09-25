#!/bin/bash
echo "Starting DataGem Microservices Cluster..."
docker-compose up -d --build
echo "API Gateway running on http://localhost:8000"
echo "Frontend running on http://localhost:5173 (or port 80 if built)"
