#!/bin/bash

# ================================================================
# E-COMMERCE MERN STACK - PRODUCTION DEPLOYMENT SCRIPT
# ================================================================
# This simplified deployment script handles SSL certificates,
# Docker image building, and secure deployment with subdomain support.
# ================================================================

# ================================================================
# SECURITY NOTICE:
# This deployment script assumes that all sensitive files (such as
# SSL certificates, API keys, and other secrets) are stored locally
# in directories like ./secrets and ./ssl, and are NOT committed to
# version control (e.g., GitHub).
#
# This script uses SSH key-based authentication for secure remote
# access and does NOT support or require password-based SSH login.
# Ensure your server disables password authentication for SSH.
# ================================================================


set -e  # Exit immediately on a command exits with a non-zero status

# Configuration - Edit these variables to match your environment
DOCKER_USERNAME="arnaudhalvick"
PRIMARY_REMOTE_USER="root"
BACKUP_REMOTE_USER="arnaud"
REMOTE_HOST="159.65.230.12"
PROJECT_NAME="e-commerce-mern"
API_BASE_URL="https://mernappshopper.xyz"
ADMIN_BASE_URL="https://admin.mernappshopper.xyz"
SSH_OPTS="-o ConnectTimeout=10 -o ServerAliveInterval=10 -o ServerAliveCountMax=3"

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=== E-COMMERCE MERN STACK PRODUCTION DEPLOYMENT ===${NC}"
echo -e "Host: $REMOTE_HOST | API: $API_BASE_URL | Admin: $ADMIN_BASE_URL"

# Load secrets for the build process
# Instead of embedding them in environment variables, we'll use secret files
FROM_EMAIL="noreply@mernappshopper.xyz"

# Step 1: Setup SSH connection
echo -e "${YELLOW}Connecting to server...${NC}"
REMOTE_USER=""

if ssh $SSH_OPTS -q -o BatchMode=yes $PRIMARY_REMOTE_USER@$REMOTE_HOST exit 2>/dev/null; then
  REMOTE_USER=$PRIMARY_REMOTE_USER
  REMOTE_PROJECT_DIR="/root/${PROJECT_NAME}"
elif ssh $SSH_OPTS -q -o BatchMode=yes $BACKUP_REMOTE_USER@$REMOTE_HOST exit 2>/dev/null; then
  REMOTE_USER=$BACKUP_REMOTE_USER
  REMOTE_PROJECT_DIR="/home/$BACKUP_REMOTE_USER/${PROJECT_NAME}"
else
  read -p "SSH Username: " MANUAL_USER
  
  if ssh $SSH_OPTS -o ConnectTimeout=5 $MANUAL_USER@$REMOTE_HOST exit 2>/dev/null; then
    REMOTE_USER=$MANUAL_USER
    
    if [ "$REMOTE_USER" = "root" ]; then
      REMOTE_PROJECT_DIR="/root/${PROJECT_NAME}"
    else
      REMOTE_PROJECT_DIR="/home/$REMOTE_USER/${PROJECT_NAME}"
    fi
  else
    echo -e "${RED}Cannot connect to $REMOTE_HOST with any credentials.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Connected as $REMOTE_USER to $REMOTE_HOST${NC}"

# Step 2: Setup SSL certificates
echo -e "${YELLOW}Setting up SSL certificates...${NC}"
mkdir -p ./ssl/live/admin.mernappshopper.xyz
mkdir -p ./ssl/live/mernappshopper.xyz

# Copy admin SSL
cp ./admin.mernappshopper.xyz/certificate.crt ./ssl/live/admin.mernappshopper.xyz/cert.pem
cp ./admin.mernappshopper.xyz/private.key ./ssl/live/admin.mernappshopper.xyz/privkey.pem
cat ./admin.mernappshopper.xyz/certificate.crt ./admin.mernappshopper.xyz/ca_bundle.crt > ./ssl/live/admin.mernappshopper.xyz/fullchain.pem

# Copy main domain SSL
cp ./mernappshopper.xyz/certificate.crt ./ssl/live/mernappshopper.xyz/cert.pem
cp ./mernappshopper.xyz/private.key ./ssl/live/mernappshopper.xyz/privkey.pem
cat ./mernappshopper.xyz/certificate.crt ./mernappshopper.xyz/ca_bundle.crt > ./ssl/live/mernappshopper.xyz/fullchain.pem

# Step 3: Update environment files
echo -e "${YELLOW}Updating environment files...${NC}"

# Frontend .env - Production configuration
cat > ./frontend/.env << EOL
# Production environment configuration
# These values are used for production builds

# API URL - Production
REACT_APP_API_URL=$API_BASE_URL

# Protocol configuration
REACT_APP_DEFAULT_PROTOCOL=https
REACT_APP_USE_HTTPS=true

# Environment indicator
REACT_APP_ENV=production

# Stripe key placeholder - Will be replaced at runtime
REACT_APP_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY_PLACEHOLDER
EOL

# Admin .env
cat > ./admin/.env << EOL
VITE_API_URL=$API_BASE_URL
VITE_ADMIN_API_PATH=/api/admin
VITE_BASE_PATH=/
EOL

# Step 4: Build Docker images
echo -e "${YELLOW}Building Docker images...${NC}"

# Build API
docker build -t ${DOCKER_USERNAME}/e-commerce-api:latest --build-arg NODE_ENV=production ./backend

# Build Frontend with the placeholder key
docker build -t ${DOCKER_USERNAME}/e-commerce-frontend:latest \
  --build-arg REACT_APP_ENV=production \
  --build-arg REACT_APP_API_URL="${API_BASE_URL}" \
  --build-arg REACT_APP_STRIPE_PUBLISHABLE_KEY="STRIPE_PUBLISHABLE_KEY_PLACEHOLDER" \
  ./frontend

# Build Admin
docker build -t ${DOCKER_USERNAME}/e-commerce-admin:latest \
  --build-arg VITE_ENV=production \
  --build-arg VITE_API_URL="${API_BASE_URL}" \
  --build-arg VITE_BASE_PATH="/" \
  ./admin

# Step 5: Push Docker images
echo -e "${YELLOW}Pushing Docker images...${NC}"
docker login
docker push ${DOCKER_USERNAME}/e-commerce-api:latest
docker push ${DOCKER_USERNAME}/e-commerce-frontend:latest
docker push ${DOCKER_USERNAME}/e-commerce-admin:latest

# Step 6: Prepare deployment files
echo -e "${YELLOW}Preparing deployment files...${NC}"
TEMP_DIR=$(mktemp -d)

# Copy SSL certificates
mkdir -p $TEMP_DIR/ssl/live/mernappshopper.xyz
mkdir -p $TEMP_DIR/ssl/live/admin.mernappshopper.xyz
cp ./ssl/live/mernappshopper.xyz/{cert.pem,privkey.pem,fullchain.pem} $TEMP_DIR/ssl/live/mernappshopper.xyz/
cp ./ssl/live/admin.mernappshopper.xyz/{cert.pem,privkey.pem,fullchain.pem} $TEMP_DIR/ssl/live/admin.mernappshopper.xyz/

# Copy nginx configurations
mkdir -p $TEMP_DIR/{frontend,admin}
cp ./frontend/nginx.conf $TEMP_DIR/frontend/
cp ./admin/admin-nginx.conf $TEMP_DIR/admin/
cp ./nginx-proxy.conf $TEMP_DIR/nginx-proxy.conf

# Copy secrets - Ensure Stripe keys are properly copied
mkdir -p $TEMP_DIR/secrets
cp -r ./secrets/* $TEMP_DIR/secrets/

# Check if Stripe publishable key exists in the secrets directory
if [ ! -f "$TEMP_DIR/secrets/stripe_publishable_key" ]; then
  echo -e "${RED}Warning: Stripe publishable key not found in secrets directory!${NC}"
  echo -e "${YELLOW}Make sure you have ./secrets/stripe_publishable_key file with a valid key${NC}"
  read -p "Would you like to create this file now? (y/N): " CREATE_KEY
  
  if [[ "$CREATE_KEY" =~ ^[Yy]$ ]]; then
    read -p "Enter Stripe publishable key (starts with pk_): " STRIPE_KEY
    echo "$STRIPE_KEY" > $TEMP_DIR/secrets/stripe_publishable_key
    echo -e "${GREEN}Created stripe_publishable_key file in temp directory${NC}"
  else
    echo -e "${YELLOW}Continuing without Stripe key - payment functionality may not work${NC}"
  fi
fi

# Create docker-compose.yml
cat > $TEMP_DIR/docker-compose.yml <<EOL
name: ${PROJECT_NAME}

services:
  nginx-proxy:
    image: nginx:stable-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl/live:/etc/ssl:ro
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    depends_on:
      - frontend
      - admin
      - api

  mongo:
    image: mongo:latest
    restart: always
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.runCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s

  api:
    image: ${DOCKER_USERNAME}/e-commerce-api:latest
    restart: always
    env_file: 
      - ./.env
    environment:
      - NODE_ENV=production
      - USE_HTTPS=true
      - HTTPS_PORT=4443
      - FRONTEND_URL=https://mernappshopper.xyz
      - PUBLIC_URL=https://mernappshopper.xyz
      - ADMIN_URL=https://admin.mernappshopper.xyz
      - FROM_EMAIL=${FROM_EMAIL}
    volumes:
      - ./ssl/live/mernappshopper.xyz:/app/ssl:ro
      - product_images:/app/upload/images
      - ./secrets:/app/secrets:ro
    ports:
      - "4000:4000"
      - "4443:4443"
    depends_on:
      - mongo
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  frontend:
    image: ${DOCKER_USERNAME}/e-commerce-frontend:latest
    restart: always
    expose:
      - "80"
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./secrets/stripe_publishable_key:/run/secrets/stripe_publishable_key:ro
    environment:
      - API_URL=${API_BASE_URL}
    depends_on:
      - api
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
      
  admin:
    image: ${DOCKER_USERNAME}/e-commerce-admin:latest
    restart: always
    expose:
      - "80"
    volumes:
      - ./admin/admin-nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./secrets:/run/secrets:ro
    environment:
      - API_URL=${API_BASE_URL}
    depends_on:
      - api
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

networks:
  app-network:
    driver: bridge

volumes:
  mongo_data:
  product_images:
EOL

# Copy placeholder .env file 
cp ./backend/.env $TEMP_DIR/.env

# Step 7: Establish SSH connection and transfer files
echo -e "${YELLOW}Transferring files to server...${NC}"
SSH_CONTROL_PATH="/tmp/ssh-control-$REMOTE_HOST"

if [ -S "$SSH_CONTROL_PATH" ]; then
  rm -f "$SSH_CONTROL_PATH"
fi

ssh -M -f -N -o ControlPath=$SSH_CONTROL_PATH $SSH_OPTS $REMOTE_USER@$REMOTE_HOST

# Function to execute SSH commands using the control connection
ssh_cmd() {
  ssh -o ControlPath=$SSH_CONTROL_PATH $REMOTE_USER@$REMOTE_HOST "$@"
}

# Function to copy files using the control connection
scp_cmd() {
  scp -o ControlPath=$SSH_CONTROL_PATH "$@"
}

# Create remote directories
ssh_cmd "mkdir -p ${REMOTE_PROJECT_DIR}/ssl/live/{mernappshopper.xyz,admin.mernappshopper.xyz}"
ssh_cmd "mkdir -p ${REMOTE_PROJECT_DIR}/upload/images/placeholders"
ssh_cmd "mkdir -p ${REMOTE_PROJECT_DIR}/{secrets,frontend,admin}"

# Transfer files
scp_cmd -r $TEMP_DIR/* $REMOTE_USER@$REMOTE_HOST:${REMOTE_PROJECT_DIR}/

# Step 8: Create/update configuration files on remote server
echo -e "${YELLOW}Setting up server configurations...${NC}"

# Create nginx-proxy.conf
ssh_cmd "if [ ! -f \"${REMOTE_PROJECT_DIR}/nginx-proxy.conf\" ]; then
  cat > ${REMOTE_PROJECT_DIR}/nginx-proxy.conf << 'EOLNGINX'
$(cat ./nginx-proxy.conf)
EOLNGINX
fi"

# Create admin-nginx.conf
ssh_cmd "if [ ! -f \"${REMOTE_PROJECT_DIR}/admin/admin-nginx.conf\" ]; then
  cat > ${REMOTE_PROJECT_DIR}/admin/admin-nginx.conf << 'EOLADMIN'
$(cat ./admin/admin-nginx.conf)
EOLADMIN
fi"

# Create frontend nginx.conf
ssh_cmd "if [ -f \"${REMOTE_PROJECT_DIR}/frontend/nginx.conf\" ]; then
  cat > ${REMOTE_PROJECT_DIR}/frontend/nginx.conf << 'EOLFRONTEND'
$(cat ./frontend/nginx.conf)
EOLFRONTEND
fi"

# Step 9: Setup firewall and execute deployment
echo -e "${YELLOW}Configuring firewall and starting services...${NC}"

# Add firewall rules
ssh_cmd "if command -v ufw > /dev/null; then
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 4000/tcp
  sudo ufw allow 4443/tcp
  
  # Check if ports 80 and 443 are in use
  netstat_exists=\$(command -v netstat >/dev/null 2>&1 && echo 'yes' || echo 'no')
  ss_exists=\$(command -v ss >/dev/null 2>&1 && echo 'yes' || echo 'no')
  
  if [ \"\$netstat_exists\" = 'yes' ]; then
    echo 'Checking used ports with netstat...'
    netstat -tuln | grep -E ':80|:443' || echo 'Ports 80 and 443 seem to be available'
  elif [ \"\$ss_exists\" = 'yes' ]; then
    echo 'Checking used ports with ss...'
    ss -tuln | grep -E ':80|:443' || echo 'Ports 80 and 443 seem to be available'
  else
    echo 'Cannot check for used ports, neither netstat nor ss is available'
  fi
  
  # Check for running nginx on host
  if systemctl is-active --quiet nginx; then
    echo 'WARNING: Nginx is running on the host. This might conflict with the containers.'
    echo 'Consider stopping it with: sudo systemctl stop nginx'
    sudo systemctl stop nginx || echo 'Failed to stop nginx. Please check manually.'
  fi
fi"

# Deploy application
ssh_cmd /bin/bash <<REMOTE_COMMANDS
# Navigate to project directory
cd ${REMOTE_PROJECT_DIR}

# Ensure the secrets directory exists and has correct permissions
mkdir -p ${REMOTE_PROJECT_DIR}/secrets
chmod 600 ${REMOTE_PROJECT_DIR}/secrets/*

# Check if Stripe key exists
if [ ! -f "${REMOTE_PROJECT_DIR}/secrets/stripe_publishable_key" ]; then
  echo "⚠️ Warning: Stripe publishable key file not found on server"
else
  echo "✅ Stripe publishable key file found on server"
  # Display truncated key for verification (show only first 8 chars)
  echo "Key starts with: \$(head -c 8 ${REMOTE_PROJECT_DIR}/secrets/stripe_publishable_key)..."
fi

# Pull latest images
docker pull ${DOCKER_USERNAME}/e-commerce-api:latest
docker pull ${DOCKER_USERNAME}/e-commerce-frontend:latest
docker pull ${DOCKER_USERNAME}/e-commerce-admin:latest

# Stop any existing containers
if docker compose ps -q | grep -q .; then
  docker compose stop
  docker compose rm -f
  sleep 5
fi

# Check for processes using ports
echo "Checking for processes using deployment ports..."
lsof -i :80 || echo "Port 80 is available"
lsof -i :443 || echo "Port 443 is available"
lsof -i :4000 || echo "Port 4000 is available"
lsof -i :4443 || echo "Port 4443 is available"

# Start containers with --force-recreate to ensure clean state
docker compose up -d --force-recreate

# Verify deployment
sleep 5
docker compose ps

# Verify Stripe key mounting
echo "Verifying Stripe key mounting..."
docker compose exec frontend ls -la /run/secrets/ || echo "⚠️ Warning: Cannot check secrets in frontend container"
docker compose exec frontend cat /run/secrets/stripe_publishable_key | head -c 8 || echo "⚠️ Warning: Stripe key file not accessible in container"

# Verify the logs for Stripe key replacement
echo "Checking container logs for Stripe key replacement messages..."
docker compose logs frontend | grep -A 10 "Injecting Stripe publishable key" || echo "⚠️ No Stripe key injection found in logs"
REMOTE_COMMANDS

# Close SSH connection
ssh -O exit -o ControlPath=$SSH_CONTROL_PATH $REMOTE_USER@$REMOTE_HOST

# Cleanup
rm -rf $TEMP_DIR

echo -e "${GREEN}=== DEPLOYMENT COMPLETED SUCCESSFULLY ===${NC}"
echo -e "Main site: ${YELLOW}https://mernappshopper.xyz${NC}"
echo -e "Admin panel: ${YELLOW}https://admin.mernappshopper.xyz${NC}"
echo -e "API: ${YELLOW}https://mernappshopper.xyz/api${NC}" 