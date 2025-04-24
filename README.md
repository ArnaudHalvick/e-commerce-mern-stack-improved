# MERN Stack E-Commerce Website

This is a project from another repo that I have. I decided to create a separate repo to compare the final versions. It was originally from a course I followed on Youtube to build a fullstack MERN ecommerce website. However, the final project was far from being good enough so I decided to copy it and build ont it to improve it

## Docker Setup

This application is fully containerized using Docker and Docker Compose, making it easy to run the entire stack with a single command.

### Requirements

- Docker and Docker Compose installed on your system
- Git to clone the repository

### Getting Started

1. Clone the repository

   ```
   git clone <repository-url>
   cd e-commerce-mern-stack-improved
   ```

2. Ensure you have the following environment files in place:

   - Production:
     - `backend/.env` - Backend production environment variables
     - `frontend/.env` - Frontend production environment variables
   - Development:
     - `backend/.env.dev` - Backend development environment variables
     - `frontend/.env.dev` - Frontend development environment variables

   See `README-ENVIRONMENTS.md` for details on required variables.

3. Start the application in production mode (default):

   ```
   ./start.sh
   ```

   Or start in development mode:

   ```
   ./start.sh development
   ```

   You can also manually start with specific environment variables:

   ```
   # Production
   NODE_ENV=production REACT_APP_ENV=production ENV_FILE=.env docker compose up -d

   # Development
   NODE_ENV=development REACT_APP_ENV=development ENV_FILE=.env.dev docker compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:4000
   - MongoDB: localhost:27017

### Docker Services

The application consists of three main services:

1. **MongoDB** - Database service
2. **Backend API** - Node.js Express API
3. **Frontend** - React application served through Nginx

### Environment Configuration

The application supports both development and production environments:

- **Production Environment**:

  - Backend uses `.env` file
  - Frontend uses `.env` for build variables
  - Optimized for performance and security

- **Development Environment**:
  - Backend uses `.env.dev` file
  - Frontend uses `.env.dev` for build variables
  - Better debugging and development experience

### Development with Docker

The Docker setup includes development configuration that watches for file changes:

- Backend files are synced to the container, and the server restarts on changes to `package.json`
- Frontend files are synced, allowing for real-time development

### Stopping the Application

To stop all services:

```
docker compose down
```

To stop and remove volumes (this will delete the database data):

```
docker compose down -v
```

## Project Structure

- `/frontend` - React frontend application
- `/backend` - Node.js Express API
- `/admin` - Admin dashboard application
- `docker-compose.yml` - Docker Compose configuration
- `start.sh` - Convenience script to start the application
