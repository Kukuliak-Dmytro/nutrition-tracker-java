#!/bin/bash
set -e

echo "🚀 Starting Nutrition Tracker Environment..."

# 1. Start Docker containers (Postgres DB + Spring Boot API)
echo "☕ Starting Backend (Docker)..."
docker compose up -d

# 2. Check if frontend is built
if [ ! -d "frontend/.next" ]; then
    echo "🏗️ Building frontend..."
    cd frontend
    npm run build
    cd ..
fi

# 3. Start Frontend
echo "🌐 Starting Next.js Frontend Server..."
cd frontend
export BACKEND_API_URL="http://localhost:8080/api"
npm run start
