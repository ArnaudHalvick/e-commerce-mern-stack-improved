#!/bin/bash

# ================================================================
# FRONTEND APPLICATION UPDATE SCRIPT
# ================================================================
# This script updates only the main frontend part of the application
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
SSH_OPTS="-o ConnectTimeout=10 -o ServerAliveInterval=10 -o ServerAliveCountMax=3"

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=== FRONTEND APPLICATION UPDATE SCRIPT ===${NC}"
echo -e "Host: $REMOTE_HOST | Frontend: $FRONTEND_BASE_URL"

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

# Step 2: Update environment files
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

# Step 3: Build Frontend Docker image
echo -e "${YELLOW}Building Frontend Docker image...${NC}"

# Build Frontend with the placeholder key
docker build -t ${DOCKER_USERNAME}/e-commerce-frontend:latest \
  --build-arg REACT_APP_ENV=production \
  --build-arg REACT_APP_API_URL="${API_BASE_URL}" \
  ./frontend

# Step 4: Push Frontend Docker image
echo -e "${YELLOW}Pushing Frontend Docker image...${NC}"
docker login
docker push ${DOCKER_USERNAME}/e-commerce-frontend:latest

# Step 5: Prepare deployment files
echo -e "${YELLOW}Preparing deployment files...${NC}"
TEMP_DIR=$(mktemp -d)

# Copy frontend nginx configuration
mkdir -p $TEMP_DIR/frontend
cp ./frontend/nginx.conf $TEMP_DIR/frontend/

# Step 6: Establish SSH connection and transfer files
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

# Create remote directories if they don't already exist
ssh_cmd "mkdir -p ${REMOTE_PROJECT_DIR}/frontend"

# Transfer files
scp_cmd -r $TEMP_DIR/frontend/nginx.conf $REMOTE_USER@$REMOTE_HOST:${REMOTE_PROJECT_DIR}/frontend/

# Step 7: Update frontend configuration on remote server
echo -e "${YELLOW}Updating frontend config...${NC}"

# Create frontend nginx.conf if it doesn't exist
ssh_cmd "if [ ! -f \"${REMOTE_PROJECT_DIR}/frontend/nginx.conf\" ]; then
  cat > ${REMOTE_PROJECT_DIR}/frontend/nginx.conf << 'EOLFRONTEND'
$(cat ./frontend/nginx.conf)
EOLFRONTEND
fi"

# Step 8: Execute deployment (only frontend)
echo -e "${YELLOW}Updating frontend service...${NC}"

# Deploy application (only frontend)
ssh_cmd /bin/bash <<REMOTE_COMMANDS
# Navigate to project directory
cd ${REMOTE_PROJECT_DIR}

# Pull latest frontend image
docker pull ${DOCKER_USERNAME}/e-commerce-frontend:latest

# Ensure the secrets directory exists and has correct permissions
mkdir -p ${REMOTE_PROJECT_DIR}/secrets
chmod 600 ${REMOTE_PROJECT_DIR}/secrets/*

# Update only frontend service with new image
docker compose up -d --no-deps frontend

# Verify deployment
sleep 5
docker compose ps frontend

# Verify Stripe key mounting
echo -e "${YELLOW}Verifying Stripe key mounting...${NC}"
docker compose exec frontend ls -l /run/secrets/stripe_publishable_key || echo "Warning: Stripe key file not found in container"
REMOTE_COMMANDS

# Close SSH connection
ssh -O exit -o ControlPath=$SSH_CONTROL_PATH $REMOTE_USER@$REMOTE_HOST

# Cleanup
rm -rf $TEMP_DIR

echo -e "${GREEN}=== FRONTEND UPDATE COMPLETED SUCCESSFULLY ===${NC}"
echo -e "Main site: ${YELLOW}https://mernappshopper.xyz${NC}" 