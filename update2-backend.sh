#!/bin/bash

# ================================================================
# BACKEND APPLICATION UPDATE SCRIPT
# ================================================================
# This script updates only the backend part of the application
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

set -e  # Exit immediately if a command exits with a non-zero status

# Configuration - Edit these variables to match your environment
DOCKER_USERNAME="arnaudhalvick"
PRIMARY_REMOTE_USER="root"
BACKUP_REMOTE_USER="arnaud"
REMOTE_HOST="159.65.230.12"
PROJECT_NAME="e-commerce-mern"
API_BASE_URL="https://mernappshopper.xyz"
FRONTEND_BASE_URL="https://mernappshopper.xyz"
ADMIN_BASE_URL="https://admin.mernappshopper.xyz"
SSH_OPTS="-o ConnectTimeout=10 -o ServerAliveInterval=10 -o ServerAliveCountMax=3"

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=== BACKEND APPLICATION UPDATE SCRIPT ===${NC}"
echo -e "Host: $REMOTE_HOST | API: $API_BASE_URL"

# Load secrets for the build process
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

# Step 2: Update environment files (if needed)
echo -e "${YELLOW}Updating environment files...${NC}"

# Backend .env file if specific changes needed
# This step is optional as the main environment variables are set in docker-compose

# Step 3: Build API Docker image
echo -e "${YELLOW}Building API Docker image...${NC}"

# Build API
docker build -t ${DOCKER_USERNAME}/e-commerce-api:latest --build-arg NODE_ENV=production ./backend

# Step 4: Push API Docker image
echo -e "${YELLOW}Pushing API Docker image...${NC}"
docker login
docker push ${DOCKER_USERNAME}/e-commerce-api:latest

# Step 5: Establish SSH connection
echo -e "${YELLOW}Connecting to server...${NC}"
SSH_CONTROL_PATH="/tmp/ssh-control-$REMOTE_HOST"

if [ -S "$SSH_CONTROL_PATH" ]; then
  rm -f "$SSH_CONTROL_PATH"
fi

ssh -M -f -N -o ControlPath=$SSH_CONTROL_PATH $SSH_OPTS $REMOTE_USER@$REMOTE_HOST

# Function to execute SSH commands using the control connection
ssh_cmd() {
  ssh -o ControlPath=$SSH_CONTROL_PATH $REMOTE_USER@$REMOTE_HOST "$@"
}

# Step 6: Execute deployment (only for API)
echo -e "${YELLOW}Updating API service...${NC}"

# Deploy application (only API)
ssh_cmd /bin/bash <<REMOTE_COMMANDS
# Navigate to project directory
cd ${REMOTE_PROJECT_DIR}

# Setup environment variables if needed
if [ -f ".env" ]; then
  # SSL paths for API
  grep -q "SSL_CERT_PATH=" .env && sed -i 's|^SSL_CERT_PATH=.*$|SSL_CERT_PATH=/app/ssl/fullchain.pem|' .env || echo "SSL_CERT_PATH=/app/ssl/fullchain.pem" >> .env
  grep -q "SSL_KEY_PATH=" .env && sed -i 's|^SSL_KEY_PATH=.*$|SSL_KEY_PATH=/app/ssl/privkey.pem|' .env || echo "SSL_KEY_PATH=/app/ssl/privkey.pem" >> .env
  grep -q "USE_HTTPS=" .env && sed -i 's|^USE_HTTPS=.*$|USE_HTTPS=true|' .env || echo "USE_HTTPS=true" >> .env
  grep -q "HTTPS_PORT=" .env && sed -i 's|^HTTPS_PORT=.*$|HTTPS_PORT=4443|' .env || echo "HTTPS_PORT=4443" >> .env
  
  # Frontend URLs for CORS
  grep -q "FRONTEND_URL=" .env && sed -i 's|^FRONTEND_URL=.*$|FRONTEND_URL=https://mernappshopper.xyz|' .env || echo "FRONTEND_URL=https://mernappshopper.xyz" >> .env
  grep -q "PUBLIC_URL=" .env && sed -i 's|^PUBLIC_URL=.*$|PUBLIC_URL=https://mernappshopper.xyz|' .env || echo "PUBLIC_URL=https://mernappshopper.xyz" >> .env
  grep -q "ADMIN_URL=" .env && sed -i 's|^ADMIN_URL=.*$|ADMIN_URL=https://admin.mernappshopper.xyz|' .env || echo "ADMIN_URL=https://admin.mernappshopper.xyz" >> .env
fi

# Ensure secrets are secure
chmod 600 secrets/*

# Pull latest API image
docker pull ${DOCKER_USERNAME}/e-commerce-api:latest

# Update only API service with new image
docker compose up -d --no-deps api

# Verify deployment
sleep 5
docker compose ps api
REMOTE_COMMANDS

# Close SSH connection
ssh -O exit -o ControlPath=$SSH_CONTROL_PATH $REMOTE_USER@$REMOTE_HOST

echo -e "${GREEN}=== BACKEND UPDATE COMPLETED SUCCESSFULLY ===${NC}"
echo -e "API: ${YELLOW}https://mernappshopper.xyz/api${NC}" 