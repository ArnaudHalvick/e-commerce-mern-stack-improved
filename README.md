# 🛍️ MERN E-Commerce Platform

A comprehensive full-stack e-commerce solution featuring a modern React customer frontend, a separate admin dashboard, and a robust Node.js backend. This project demonstrates advanced development patterns for building scalable, secure, and user-friendly web applications with a containerized deployment architecture.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![React](https://img.shields.io/badge/React-v19.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-v5.x-green)
![Express](https://img.shields.io/badge/Express-v4.x-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-yellow)

**Live Demo:** [https://mernappshopper.xyz](https://mernappshopper.xyz)  
**Admin Dashboard:** [https://admin.mernappshopper.xyz](https://admin.mernappshopper.xyz)  
**Video Presentation:** [Watch on YouTube](https://www.youtube.com/watch?v=H4rndG1Qr6w)

## 🏗️ System Architecture

The application follows a modern microservices-inspired architecture with Docker containerization:

```
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│                       │   │                       │   │                       │
│   Customer Frontend   │   │   Admin Dashboard     │   │   Backend API Server  │
│   (React + Redux)     │   │   (React + Context)   │   │   (Node.js + Express) │
│                       │   │                       │   │                       │
└───────────┬───────────┘   └───────────┬───────────┘   └───────────┬───────────┘
            │                           │                           │
            └───────────────┬───────────┴───────────────┬───────────┘
                            │                           │
                  ┌─────────┴──────────┐      ┌─────────┴──────────┐
                  │   Nginx Reverse    │      │                    │
                  │      Proxy         │─────►│     MongoDB        │
                  │                    │      │                    │
                  └────────────────────┘      └────────────────────┘
```

### Containerized Architecture

The application is fully containerized using Docker:

- **Frontend Container**: React customer storefront with Nginx for static file serving
- **Admin Container**: React admin dashboard with its own Nginx configuration
- **Backend Container**: Node.js API server with MongoDB connection
- **Nginx Proxy**: Handles routing between containers and SSL termination

## ✨ Key Features

- **Dual Frontend Architecture**

  - Customer storefront for shopping experience
  - Secure admin dashboard for inventory and order management
  - Separate deployment and scaling for each frontend

- **Complete E-Commerce Functionality**

  - Product catalog with categories, filtering, and search
  - Shopping cart and checkout flow
  - User accounts and order history
  - Admin dashboard for product and order management

- **Secure Authentication System**

  - JWT-based authentication with refresh tokens
  - Email verification flow
  - Password reset functionality
  - Role-based access control for admin features

- **Docker-Based Deployment**

  - Production-ready Docker configuration
  - Development Docker environment with hot-reloading
  - Consistent environment across development and production
  - Secret management via Docker volumes

- **Reverse Proxy Architecture**

  - Subdomain routing (admin.mernappshopper.xyz)
  - SSL termination and certificate management
  - Static asset caching and optimization
  - API request routing to backend services

- **Stripe Payment Integration**

  - Secure credit card processing
  - Order management with payment status
  - Webhook integration for payment events
  - Comprehensive checkout flow

## 🚀 Technology Stack

### Frontend (Customer)

- **React**: UI component library
- **Redux**: State management
- **React Router**: Navigation and routing
- **Stripe Elements**: Payment form integration
- **Nginx**: Static file serving and caching

### Admin Dashboard

- **React**: UI component library
- **Context API**: State management
- **React Router**: Navigation and routing
- **Vite**: Build tool and development server
- **Nginx**: Static file serving and API routing

### Backend

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **Stripe API**: Payment processing
- **Winston**: Logging

### DevOps

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and static serving
- **Let's Encrypt**: SSL certificate management
- **Digital Ocean**: Cloud hosting platform

## 📦 Project Structure

```
e-commerce-mern-stack/
├── frontend/                 # Customer frontend application
│   ├── src/                  # Source code
│   ├── Dockerfile            # Production container config
│   ├── Dockerfile.dev        # Development container config
│   └── nginx.conf            # Nginx configuration for frontend
│
├── admin/                    # Admin dashboard application
│   ├── src/                  # Source code
│   ├── Dockerfile            # Production container config
│   ├── Dockerfile.dev        # Development container config
│   └── admin-nginx.conf      # Nginx configuration for admin panel
│
├── backend/                  # Node.js API server
│   ├── controllers/          # Request handlers
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── Dockerfile            # Production container config
│   └── Dockerfile.dev        # Development container config
│
├── docker-compose.yml        # Production Docker configuration
├── docker-compose.dev.yml    # Development Docker configuration
├── nginx-proxy.conf          # Main Nginx reverse proxy config
└── deploy.sh                 # Deployment scripts
```

## 🔧 Development Workflow

The project supports both traditional local development and Docker-based development.

### Docker Development Environment

1. **Start the development environment:**

```bash
./dev-docker.sh
```

This script uses `docker-compose.dev.yml` to start all services with development configurations:

- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:5173
- **Backend API**: http://localhost:4001

All containers are configured with hot-reloading for real-time development.

### Environment Configuration

The system uses Docker secrets for sensitive configuration:

- API keys (Stripe, email services, etc.)
- Database credentials
- JWT secrets

These are mounted into containers at runtime from the `secrets` directory.

## 🚀 Deployment Architecture

The application is deployed on Digital Ocean with a Docker-based architecture:

1. **Automated Deployment:**

```bash
./deploy.sh
```

This builds and deploys all containers with production configurations.

### Domain Architecture

- **Main storefront**: `https://mernappshopper.xyz`
- **Admin dashboard**: `https://admin.mernappshopper.xyz`
- **API endpoints**: `https://mernappshopper.xyz/api`

### Nginx Reverse Proxy

The Nginx reverse proxy handles:

- **Subdomain Routing**: Directs traffic to the appropriate container
- **SSL Termination**: Manages HTTPS certificates
- **Caching**: Optimizes static asset delivery
- **API Routing**: Forwards API requests to the backend

## 📋 Individual Component Documentation

- [Admin Dashboard Documentation](./admin/README.md)
- [Backend API Documentation](./backend/README.md)
- [Customer Frontend Documentation](./frontend/README.md)

## 🔐 Security Implementation

The application implements security at multiple levels:

1. **Reverse Proxy Security**:

   - SSL/TLS termination
   - HTTP security headers
   - Rate limiting

2. **Container Isolation**:

   - Separate containers for each service
   - Minimal container permissions

3. **Application Security**:
   - JWT authentication
   - Role-based access control
   - Input validation and sanitization

## 🚀 Deployment Instructions

Detailed deployment instructions for Digital Ocean:

1. **Provision a Droplet**:

   - Ubuntu 22.04 LTS
   - At least 2GB RAM

2. **Install Docker and Docker Compose**:

   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo apt-get install docker-compose-plugin
   ```

3. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/e-commerce-mern-stack.git
   cd e-commerce-mern-stack
   ```

4. **Configure Secrets**:

   ```bash
   mkdir -p secrets
   # Add required secret files
   ```

5. **Deploy the Application**:
   ```bash
   ./deploy.sh
   ```

## 👨‍💻 Portfolio Information

This project demonstrates expertise in:

- **Microservices Architecture**: Separate frontend and admin applications
- **Container Orchestration**: Docker and Docker Compose setup
- **Reverse Proxy Configuration**: Nginx for routing and SSL termination
- **Full-Stack Development**: MERN stack implementation
- **Security Best Practices**: JWT, HTTPS, and container isolation
- **DevOps Skills**: CI/CD, containerization, and cloud deployment

The implementation follows industry best practices and demonstrates the ability to create production-ready applications with consideration for security, scalability, and maintainability.

## 📄 License

This project is available as open source under the terms of the [MIT License](LICENSE).
