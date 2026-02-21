#!/bin/bash

echo "🛑 Stopping Social Media Clone Application..."
docker-compose down

echo "✓ Application stopped successfully!"
echo ""
echo "To remove all data (including database):"
echo "  docker-compose down -v"
