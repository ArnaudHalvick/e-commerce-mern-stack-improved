# 🛍️ MERN E-Commerce Platform

A full-stack e-commerce solution featuring a modern React frontend and a robust Node.js backend. This comprehensive project demonstrates advanced development patterns for building scalable, secure, and user-friendly web applications.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![React](https://img.shields.io/badge/React-v19.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-v5.x-green)
![Express](https://img.shields.io/badge/Express-v4.x-blue)

**Live Demo:** [https://mernappshopper.xyz](https://mernappshopper.xyz)

![E-Commerce Platform Screenshot](https://via.placeholder.com/800x400?text=E-Commerce+Platform+Screenshot)

## ✨ Key Features

- **Complete E-Commerce Functionality**

  - Product catalog with categories, filtering, and search
  - Shopping cart and wishlist management
  - User accounts and profiles
  - Order processing and history
  - Admin dashboard with product management

- **Secure Authentication System**

  - JWT-based authentication with refresh tokens
  - Email verification flow
  - Password reset functionality
  - Protected routes and resources

- **Stripe Payment Integration**

  - Secure credit card processing
  - Order management with payment status
  - Webhook integration for payment events
  - Comprehensive checkout flow

- **Advanced Error Handling**

  - Global error processing system
  - Graceful frontend error boundaries
  - Detailed logging and monitoring
  - User-friendly error messages

- **Responsive Design**
  - Mobile-first approach
  - Optimized for all device sizes
  - Consistent user experience across platforms
  - Accessible UI components

## 🏗️ System Architecture

The application follows a modern MERN stack architecture:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  React Frontend │◄─────►│  Node.js API    │◄─────►│  MongoDB        │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        ▲                         ▲                         ▲
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  Redux          │       │  Express        │       │  Mongoose       │
│  React Router   │       │  JWT Auth       │       │                 │
│  Stripe Elements│       │  Middleware     │       │                 │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Frontend Architecture

The React frontend follows a component-based architecture:

- **Component Library**: Reusable UI components
- **Page Compositions**: Full page layouts using components
- **Redux State**: Centralized application state
- **Custom Hooks**: Shared logic and functionality
- **Service Layer**: API communication abstraction

### Backend Architecture

The Node.js backend implements a layered architecture:

- **API Routes**: RESTful endpoint definitions
- **Controllers**: Request handling and response formation
- **Services**: Business logic implementation
- **Models**: Data structure and validation
- **Middleware**: Request processing and authentication

## 🚀 Technology Stack

### Frontend

- **React**: UI component library
- **Redux**: State management
- **React Router**: Navigation and routing
- **Stripe Elements**: Payment form integration
- **Axios**: API communication

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

## 📦 Project Structure

```
e-commerce-mern-stack-improved/
├── frontend/                 # React frontend application
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── redux/            # State management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── api/              # API services
│   │   └── utils/            # Utilities
│   └── public/               # Static assets
│
├── backend/                  # Node.js API server
│   ├── controllers/          # Request handlers
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   └── docs/                 # API documentation
│
├── admin/                    # Admin dashboard
│
├── docker-compose.yml        # Docker compose configuration
├── docker-compose.dev.yml    # Development compose configuration
└── deploy.sh                 # Deployment script
```

## 🔧 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- MongoDB (v5.x or higher)
- Docker and Docker Compose (optional)

### Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/e-commerce-mern-stack-improved.git
cd e-commerce-mern-stack-improved
```

2. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**

```bash
# Backend
cd backend
cp .env.dev .env

# Frontend
cd ../frontend
cp .env.dev .env.local
```

4. **Start development servers**

```bash
# Start backend (from root directory)
cd backend
npm run dev

# Start frontend (in another terminal, from root directory)
cd frontend
npm run dev
```

### Docker Development

For Docker-based development:

```bash
# Start the entire stack
./dev-docker.sh
```

## 🚀 Deployment

### Docker Deployment

The application can be deployed using Docker Compose:

```bash
# Build and deploy
docker-compose up -d
```

### Manual Deployment

Alternatively, the application can be deployed manually:

```bash
# Deploy both frontend and backend
./update-both.sh

# Deploy only backend
./update-backend.sh

# Deploy only frontend
./update-frontend.sh
```

## 📝 Future Enhancements

- **Internationalization**: Multi-language support
- **Progressive Web App**: Offline functionality
- **Advanced Analytics**: User behavior tracking
- **AI Product Recommendations**: Smart product suggestions
- **Multi-vendor Support**: Marketplace functionality

## 👨‍💻 Portfolio Information

This project was developed as a comprehensive demonstration of full-stack development capabilities, showcasing expertise in:

- Building scalable web applications with modern technologies
- Implementing secure authentication and payment systems
- Creating responsive user interfaces with excellent UX
- Applying best practices in software architecture
- Implementing professional error handling and logging

The codebase follows industry best practices and demonstrates an understanding of production-ready application development.

## 📄 License

This project is available as open source under the terms of the [MIT License](LICENSE).
