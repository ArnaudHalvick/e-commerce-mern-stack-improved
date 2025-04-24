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

2. Create a `.env` file in the `backend` directory with the necessary environment variables (see `README-ENVIRONMENTS.md` for details)

3. Start the application

   ```
   ./start.sh
   ```

   Or manually with:

   ```
   docker compose up -d
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
