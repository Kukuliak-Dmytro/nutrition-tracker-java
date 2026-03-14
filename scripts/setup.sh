#!/bin/bash
set -e

echo "🔍 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi
echo "✓ Docker is available"

echo "🐘 Starting PostgreSQL..."
docker compose up -d postgres

echo "⏳ Waiting for database to be ready..."
for i in $(seq 1 30); do
    if docker exec nutrition-tracker-db pg_isready -U nutrition_user -d nutrition_tracker &> /dev/null; then
        echo "✓ Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start"
        exit 1
    fi
    sleep 1
done

echo "☕ Starting Spring Boot backend via Docker Compose..."
docker compose up -d

echo ""
echo "✅ Backend and Database are running in Docker!"
echo "   API is available at http://localhost:8080/api"
echo "   Run 'docker compose logs -f api' to see backend logs."
