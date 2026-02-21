#!/bin/bash

echo "🚀 Starting Social Media Clone Application..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Start services
echo "Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Application is running!"
    echo ""
    echo "📱 Access the application at:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:8080"
    echo "   H2 Console: http://localhost:8080/h2-console (if using H2)"
    echo ""
    echo "👥 Demo accounts:"
    echo "   Email: john@example.com | Password: Password123!"
    echo "   Email: jane@example.com | Password: Password123!"
    echo ""
    echo "📊 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Stop application:"
    echo "   docker-compose down"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi
