#!/bin/bash

# SECURITY NOTICE:
# This script assumes that secrets and certificates are stored locally in the
# ./secrets and ./ssl directories, which MUST be excluded from version control.
# Do not commit real credentials or keys to GitHub.

# Development script for running with separated admin subdomain
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure SSL directory structure for admin subdomain
echo -e "${YELLOW}Setting up SSL certificates for development...${NC}"
mkdir -p ./ssl/live/admin.mernappshopper.xyz
if [ ! -f "./ssl/live/admin.mernappshopper.xyz/cert.pem" ]; then
  cp ./admin.mernappshopper.xyz/certificate.crt ./ssl/live/admin.mernappshopper.xyz/cert.pem
  cp ./admin.mernappshopper.xyz/private.key ./ssl/live/admin.mernappshopper.xyz/privkey.pem
  cat ./admin.mernappshopper.xyz/certificate.crt ./admin.mernappshopper.xyz/ca_bundle.crt > ./ssl/live/admin.mernappshopper.xyz/fullchain.pem
  echo -e "${GREEN}✓ SSL certificates prepared!${NC}"
else
  echo -e "${GREEN}✓ SSL certificates already exist!${NC}"
fi

# Load environment variables from secrets
echo -e "${YELLOW}Loading secrets for development...${NC}"
if [ -f "./secrets/stripe_publishable_key" ]; then
  echo -e "${GREEN}✅ Stripe publishable key secret file found!${NC}"
  STRIPE_KEY=$(cat ./secrets/stripe_publishable_key | tr -d '\n')
  echo -e "${GREEN}Key starts with: ${STRIPE_KEY:0:8}...${NC}"
else
  echo -e "${RED}⚠️ No Stripe publishable key secret file found${NC}"
  echo -e "${YELLOW}Payment functionality will not work properly${NC}"
  echo -e "${YELLOW}Create a file at ./secrets/stripe_publishable_key with your Stripe publishable key${NC}"
fi

if [ -f "./secrets/mailersend_api_key" ]; then
  echo -e "${GREEN}✓ MailerSend API key secret file found!${NC}"
else
  echo -e "${YELLOW}⚠ No MailerSend API key secret file found${NC}"
fi

# Set up environment variables for development
echo -e "${YELLOW}Setting up environment variables for development...${NC}"

# Create frontend development environment (.env.local)
cat > ./frontend/.env.local <<EOL
# Development Environment (Local)

# API URL for development
REACT_APP_API_URL=http://localhost:4001
REACT_APP_ENV=development

# Protocol configuration
REACT_APP_DEFAULT_PROTOCOL=http
REACT_APP_USE_HTTPS=false

# Development server settings
HOST=localhost
WDS_SOCKET_PORT=0
CHOKIDAR_USEPOLLING=true
DANGEROUSLY_DISABLE_HOST_CHECK=true

# Stripe keys will be loaded from secrets at runtime
EOL

# Create admin development environment (.env.local)
cat > ./admin/.env.local <<EOL
# Development Environment (Local)

# API URL for development
VITE_API_URL=http://api:4001
VITE_ADMIN_API_PATH=/api/admin
VITE_BASE_PATH=/
VITE_DEV_SERVER_PORT=5173
# This flag is ONLY for local Docker development
VITE_IS_DOCKER=true
EOL

echo -e "${GREEN}✓ Environment variables updated!${NC}"

# Make sure no containers are running that could conflict with our ports
echo -e "${YELLOW}Cleaning up existing containers...${NC}"
docker ps -q | xargs -r docker stop
docker ps -aq | xargs -r docker rm
docker network prune -f
echo -e "${GREEN}✓ Docker environment cleaned!${NC}"

# Create a docker-compose file for development
cat > ./docker-compose.dev.yml <<EOL
name: e-commerce-mern-dev

services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - PORT=4001
      - HTTPS_PORT=4443
      - FRONTEND_URL=http://localhost:3000
      - PUBLIC_URL=http://localhost:4001
      - MONGO_URI=mongodb://mongo:27017/e-commerce
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./secrets:/app/secrets:ro
    ports:
      - "4001:4001"
      - "4443:4443"
    depends_on:
      - mongo
    networks:
      - app-network
    command: npm run dev:docker

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - ./secrets:/app/secrets:ro
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:4001
      - REACT_APP_ENV=development
      - REACT_APP_DEFAULT_PROTOCOL=http
      - REACT_APP_USE_HTTPS=false
      - HOST=0.0.0.0
      - WDS_SOCKET_PORT=0
      - CHOKIDAR_USEPOLLING=true
      - DANGEROUSLY_DISABLE_HOST_CHECK=true
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - app-network
    command: npm run dev:docker

  admin:
    build:
      context: ./admin
      dockerfile: Dockerfile.dev
    volumes:
      - ./admin:/app
      - /app/node_modules
      - ./secrets:/app/secrets:ro
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:4001
      - VITE_BASE_PATH=/
      - VITE_ADMIN_API_PATH=/api/admin
      - VITE_DEV_SERVER_PORT=5173
    ports:
      - "5173:5173"
    depends_on:
      - api
    networks:
      - app-network
    command: npm run dev:docker

networks:
  app-network:
    driver: bridge

volumes:
  mongo_data:
EOL

echo -e "${GREEN}✓ Docker Compose file for development created!${NC}"

# Start the containers with environment variables
echo -e "${YELLOW}Starting development environment...${NC}"

docker compose -f docker-compose.dev.yml up --build

echo -e "${GREEN}✓ Development environment stopped.${NC}" 