#!/bin/bash

# Script to switch between development and production environments

# Check if an argument is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 [dev|prod]"
  echo "  dev: Set up development environment"
  echo "  prod: Set up production environment"
  exit 1
fi

ENV=$1

if [ "$ENV" = "dev" ]; then
  echo "Setting up development environment..."
  
  # Copy development env files to the active env files
  cp frontend/.env.development frontend/.env
  cp admin/.env.development admin/.env
  
  # Set environment variable to indicate development mode
  echo "export NODE_ENV=development" > .env.local
  
  # Ensure docker-compose.override.yml exists
  if [ ! -f docker-compose.override.yml ]; then
    echo "Creating docker-compose.override.yml..."
    cat > docker-compose.override.yml << EOL
version: "3"

services:
  # Backend service
  backend:
    environment:
      - NODE_ENV=development
      - FRONTEND_URL=http://localhost:3000
      - PUBLIC_URL=http://localhost:4000
    ports:
      - "4000:4000"

  # Frontend service
  frontend:
    environment:
      - REACT_APP_API_URL=http://localhost:4000
    ports:
      - "3000:80"

  # Admin service
  admin:
    environment:
      - VITE_API_URL=http://localhost:4000
    ports:
      - "8080:80"
EOL
  fi
  
  echo "Development environment setup complete."
  echo "Run 'docker-compose up' to start the development environment."
  
elif [ "$ENV" = "prod" ]; then
  echo "Setting up production environment..."
  
  # Run the existing update_env.sh script for production
  ./update_env.sh
  
  # Remove the override file if it exists
  if [ -f docker-compose.override.yml ]; then
    rm docker-compose.override.yml
    echo "Removed docker-compose.override.yml"
  fi
  
  echo "Production environment setup complete."
  echo "Run 'docker-compose up' to start the production environment."
  
else
  echo "Invalid argument: $ENV"
  echo "Usage: $0 [dev|prod]"
  exit 1
fi 