# E-Commerce MERN Stack - Environment Setup

This document explains how to configure and run the application in different environments (development and production).

## Environment Configuration

The application supports two environments:

1. **Development Environment**: Uses localhost URLs for API and assets
2. **Production Environment**: Uses the production server URLs

## Environment Files

- `.env.development` - Contains development environment variables
- `.env` - Contains the active environment variables (copied from the appropriate .env.\* file)

## Switching Environments

Use the provided script to switch between environments:

```bash
# Switch to development environment
./set_env.sh dev

# Switch to production environment
./set_env.sh prod
```

## Running the Application

After setting the environment, run the application with Docker Compose:

```bash
# Start the application
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build
```

## URLs for Different Environments

### Development

- Backend API: http://localhost:4000/api
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:8080

### Production

- Backend API: http://159.65.230.12/api
- Frontend: http://159.65.230.12
- Admin Panel: http://159.65.230.12:8080

## Troubleshooting

### Fixing Permission Errors with Docker

If you encounter permission errors with Docker, add your user to the Docker group:

```bash
# Add your user to the Docker group
sudo usermod -aG docker $USER

# Apply the new group membership without logging out
newgrp docker

# Verify the setup works
docker run hello-world
```

### Double-Slash Issues with URLs

If you encounter issues with URLs having double slashes (`//`), make sure you're using the latest version of the code that includes the `joinUrl` and `getApiUrl` utility functions, which properly handle URL construction.
