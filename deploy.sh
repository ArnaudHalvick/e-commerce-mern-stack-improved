#!/bin/bash

# Set variables
DROPLET_IP="159.65.230.12"
SSH_USER="root"
APP_DIR="/var/www/ecommerce"

# Display information
echo "Deploying to DigitalOcean droplet at $DROPLET_IP..."

# Run the environment update script
echo "Updating environment files for production..."
./update_env.sh

# Create a deployment package
echo "Creating deployment package..."
tar --exclude="node_modules" --exclude=".git" --exclude="*/node_modules" --exclude="*/build" --exclude="*/dist" -czf deploy.tar.gz .

# Copy the deployment package to the server
echo "Copying files to server..."
scp -o StrictHostKeyChecking=no deploy.tar.gz $SSH_USER@$DROPLET_IP:/root/

# SSH into the server and deploy
echo "Deploying on the server..."
ssh -o StrictHostKeyChecking=no $SSH_USER@$DROPLET_IP << EOF
  # Create app directory if it doesn't exist
  mkdir -p $APP_DIR
  
  # Extract the deployment package
  tar -xzf /root/deploy.tar.gz -C $APP_DIR
  
  # Navigate to the app directory
  cd $APP_DIR
  
  # Install Docker and Docker Compose if not already installed
  if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get install -y docker-compose-plugin
  fi
  
  # Build and start the containers
  echo "Building and starting containers..."
  docker compose down
  docker compose up -d --build
  
  # Clean up
  rm /root/deploy.tar.gz
  
  echo "Deployment completed successfully!"
  echo "Your application is now available at:"
  echo "Frontend: http://$DROPLET_IP"
  echo "Admin Panel: http://$DROPLET_IP:8080"
  echo "Backend API: http://$DROPLET_IP/api"
EOF

# Clean up local deployment package
rm deploy.tar.gz

echo "Deployment process completed!" 