#!/bin/bash

# Default environment is production
ENVIRONMENT=${1:-production}

# Validate environment parameter
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "development" ]]; then
  echo "⚠️ Invalid environment: $ENVIRONMENT"
  echo "Usage: ./start.sh [production|development]"
  exit 1
fi

# Set environment variables based on selected environment
if [[ "$ENVIRONMENT" == "development" ]]; then
  export NODE_ENV=development
  export REACT_APP_ENV=development
  export ENV_FILE=.env.dev
  ENV_LABEL="DEVELOPMENT"
else
  export NODE_ENV=production
  export REACT_APP_ENV=production
  export ENV_FILE=.env
  ENV_LABEL="PRODUCTION"
fi

echo "🔧 Starting in $ENV_LABEL mode..."

# Start the application stack
echo "🚀 Starting E-Commerce MERN Stack Application..."
docker compose up -d

# Wait for services to come up
echo "⏳ Waiting for services to start..."
sleep 5

# Provide info to the user
echo ""
echo "==================================================="
echo "🚀 Application started successfully in $ENV_LABEL mode!"
echo "==================================================="
echo "🌐 Frontend: http://localhost"
echo "🔌 Backend API: http://localhost:4000"
echo "🗄️ MongoDB: localhost:27017"
echo ""
echo "📝 Environment: $ENVIRONMENT"
echo "📄 Using environment files:"
echo "   - Backend: ./backend/$ENV_FILE"
echo "   - Frontend: ./frontend/${ENV_FILE:-'.env'}"
echo ""
echo "📊 To view logs, run: docker compose logs -f"
echo "🛑 To stop the application, run: docker compose down"
echo "===================================================" 