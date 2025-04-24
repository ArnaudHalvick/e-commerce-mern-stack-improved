#!/bin/bash

# Start the application stack
echo "Starting E-Commerce MERN Stack Application..."
docker compose up -d

# Wait for services to come up
echo "Waiting for services to start..."
sleep 5

# Provide info to the user
echo ""
echo "==================================================="
echo "🚀 Application started successfully!"
echo "==================================================="
echo "🌐 Frontend: http://localhost"
echo "🔌 Backend API: http://localhost:4000"
echo "🗄️ MongoDB: localhost:27017"
echo ""
echo "To view logs, run: docker compose logs -f"
echo "To stop the application, run: docker compose down"
echo "===================================================" 