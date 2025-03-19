#!/bin/bash

# Check if environment argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <dev|prod>"
    exit 1
fi

ENV=$1

# Validate environment argument
if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "Invalid environment. Use 'dev' or 'prod'."
    exit 1
fi

echo "Setting up $ENV environment..."

# Function to check and backup a file
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "${file}.bak"
        echo "Backup created: ${file}.bak"
    fi
}

# Set environment variables based on the environment
if [ "$ENV" == "dev" ]; then
    echo "Setting development environment variables..."
    
    # Create local docker-compose.override.yml for development
    cat > docker-compose.override.yml << EOF
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
EOF

    # Update environment files for development
    echo "# API URL for development" > frontend/.env
    echo "REACT_APP_API_URL=http://localhost:4000" >> frontend/.env
    
    echo "# API URL for development" > frontend/.env.development
    echo "REACT_APP_API_URL=http://localhost:4000" >> frontend/.env.development
    
    echo "# API URL for development" > admin/.env
    echo "VITE_API_URL=http://localhost:4000" >> admin/.env
    
    echo "# API URL for development" > admin/.env.development
    echo "VITE_API_URL=http://localhost:4000" >> admin/.env.development
    
    echo "Development environment setup complete."
else
    echo "Setting production environment variables..."
    
    # Remove docker-compose.override.yml if it exists
    if [ -f "docker-compose.override.yml" ]; then
        rm docker-compose.override.yml
        echo "Removed docker-compose.override.yml"
    fi
    
    # Production environment setup - you may add more here if needed
    echo "Production environment setup complete."
fi

echo "Environment setup complete."
exit 0 