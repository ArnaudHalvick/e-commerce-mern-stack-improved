#!/bin/bash

# ================================================================
# ADMIN APPLICATION UPDATE SCRIPT
# ================================================================
# This script updates only the admin part of the application
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
ADMIN_BASE_URL="https://admin.mernappshopper.xyz"
SSH_OPTS="-o ConnectTimeout=10 -o ServerAliveInterval=10 -o ServerAliveCountMax=3"

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=== ADMIN APPLICATION UPDATE SCRIPT ===${NC}"
echo -e "Host: $REMOTE_HOST | Admin: $ADMIN_BASE_URL"

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

# Admin .env
cat > ./admin/.env << EOL
VITE_API_URL=$API_BASE_URL
VITE_ADMIN_API_PATH=/api/admin
VITE_BASE_PATH=/
EOL

# Step 3: Build admin Docker image
echo -e "${YELLOW}Building admin Docker image...${NC}"

# Build Admin
docker build -t ${DOCKER_USERNAME}/e-commerce-admin:latest \
  --build-arg VITE_ENV=production \
  --build-arg VITE_API_URL="${API_BASE_URL}" \
  --build-arg VITE_BASE_PATH="/" \
  ./admin

# Step 4: Push admin Docker image
echo -e "${YELLOW}Pushing admin Docker image...${NC}"
docker login
docker push ${DOCKER_USERNAME}/e-commerce-admin:latest

# Step 5: Prepare deployment files
echo -e "${YELLOW}Preparing deployment files...${NC}"
TEMP_DIR=$(mktemp -d)

# Copy nginx configuration
mkdir -p $TEMP_DIR/admin
cp ./admin/admin-nginx.conf $TEMP_DIR/admin/

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
ssh_cmd "mkdir -p ${REMOTE_PROJECT_DIR}/admin"

# Transfer files
scp_cmd -r $TEMP_DIR/admin/admin-nginx.conf $REMOTE_USER@$REMOTE_HOST:${REMOTE_PROJECT_DIR}/admin/

# Step 7: Update admin configuration on remote server
echo -e "${YELLOW}Updating admin config...${NC}"

# Create admin-nginx.conf if it doesn't exist
ssh_cmd "if [ ! -f \"${REMOTE_PROJECT_DIR}/admin/admin-nginx.conf\" ]; then
  cat > ${REMOTE_PROJECT_DIR}/admin/admin-nginx.conf << 'EOLADMIN'
$(cat ./admin/admin-nginx.conf)
EOLADMIN
fi"

# Step 8: Execute deployment
echo -e "${YELLOW}Updating admin service...${NC}"

# Deploy application (only admin)
ssh_cmd /bin/bash <<REMOTE_COMMANDS
# Navigate to project directory
cd ${REMOTE_PROJECT_DIR}

# Pull latest admin image
docker pull ${DOCKER_USERNAME}/e-commerce-admin:latest

# Update only admin service with new image
docker compose up -d --no-deps admin

# Verify deployment
sleep 5
docker compose ps admin
REMOTE_COMMANDS

# Close SSH connection
ssh -O exit -o ControlPath=$SSH_CONTROL_PATH $REMOTE_USER@$REMOTE_HOST

# Cleanup
rm -rf $TEMP_DIR

echo -e "${GREEN}=== ADMIN UPDATE COMPLETED SUCCESSFULLY ===${NC}"
echo -e "Admin panel: ${YELLOW}https://admin.mernappshopper.xyz${NC}" 