# E-Commerce Platform - Backend API

A robust, secure, and production-ready RESTful API powering a modern e-commerce platform. This backend implementation demonstrates
comprehensive professional development practices including clean architecture, advanced authentication, intelligent error handling,
and security.

![Node.js](https://img.shields.io/badge/Node.js-v18.x-green)
![Express](https://img.shields.io/badge/Express-v4.21.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v5.x-green)
![Mongoose](https://img.shields.io/badge/Mongoose-v8.12.x-blue)

## 🚀 Key Features

- **Advanced Authentication System**

  - Secure JWT implementation with refresh token rotation
  - Email verification, password reset, account protection
  - Multiple security layers including rate limiting and account lockout

- **Structured Error Handling**

  - Comprehensive error classification and handling
  - Environment-specific error responses
  - Centralized logging system with detailed diagnostics

- **Secure Payment Processing**

  - Stripe payment integration with client/server validation
  - Webhook implementation for reliable transaction processing
  - Order management with complete payment lifecycle

- **Enterprise-Grade Security**

  - Multiple security layers (Helmet, sanitization, rate limiting)
  - Protection against common vulnerabilities (XSS, NoSQL injection)
  - Input validation at request, route, and model levels

- **Clean Architecture**
  - Layered design (controllers/services/models)
  - Separation of concerns with consistent patterns
  - RESTful API design following best practices

## 🏗️ Technical Architecture

The backend follows a structured architectural pattern designed for scalability and maintainability:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Routes    │────▶│ Controllers │────▶│  Services   │────▶│   Models    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Middleware  │     │ Validation  │     │ Error       │     │ Database    │
│             │     │             │     │ Handling    │     │ Operations  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

- **Routes**: Define API endpoints and connect them to controllers
- **Controllers**: Handle HTTP requests/responses and coordinate business logic
- **Services**: Implement core business logic and data processing
- **Models**: Define data structures and database interactions
- **Middleware**: Process requests for authentication, validation, etc.
- **Error Handling**: Centralized error processing and appropriate responses

## 💾 Data Models

The application is built around these core data models:

- **User**: Authentication, profile management, security features
- **Product**: Complete product catalog with categories, pricing, inventory
- **Order**: Order processing with payment status and fulfillment tracking
- **Review**: Product ratings and reviews with verified purchase validation
- **Cart**: Shopping cart management with product selections

## 🔒 Security Implementation

Security is implemented at multiple levels:

1. **HTTP Security**: Secure headers, CORS configuration, HTTPS support
2. **Authentication**: JWT with secure storage and transmission
3. **Data Validation**: Multi-layer validation and sanitization
4. **Rate Limiting**: Tiered rate limiting for different endpoints
5. **Input Sanitization**: Protection against injection attacks
6. **Database Security**: Secure connection and query sanitization

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: helmet, express-mongo-sanitize, xss-clean
- **Payment**: Stripe API integration
- **Logging**: Winston custom logger
- **Testing**: Jest framework with supertest
- **Documentation**: Comprehensive markdown documentation

## ⚙️ API Endpoints

The API is organized into logical resource groups:

- **Authentication**: `/api/users/auth/*` - Registration, login, tokens
- **User Management**: `/api/users/*` - Profiles, preferences
- **Products**: `/api/products/*` - Product catalog and search
- **Cart**: `/api/cart/*` - Shopping cart operations
- **Reviews**: `/api/reviews/*` - Product reviews and ratings
- **Orders/Payments**: `/api/payment/*` - Checkout, orders, payment processing
- **File Upload**: `/api/upload/*` - Image uploads for products

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- MongoDB (v5.x or higher)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd e-commerce-mern-stack-improved/backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## 🧪 Development Features

- **Error Demonstration**: Built-in error demonstration routes
- **Comprehensive Logging**: Detailed logs for debugging
- **Environment Configurations**: Different settings for development/production
- **Docker Support**: Containerization for consistent environments

## 📚 Additional Documentation

Detailed documentation is available in the `/docs` directory:

- [Error Handling System](./docs/ERROR_HANDLING.md)
- [Security Implementation](./docs/SECURITY.md)
- [Payment Integration](./docs/PAYMENT_INTEGRATION.md)
- [API Testing Guide](./docs/TESTING_ERROR_HANDLING.md)
- [Postman Collection Guide](./docs/POSTMAN_GUIDE.md)

## 🚀 Deployment

The backend is configured for deployment with Docker:

```bash
# Build and run using Docker
docker-compose up -d
```

---

## Portfolio Project Information

This project was developed as a comprehensive demonstration of full-stack development expertise, with particular focus on:

- Scalable architecture patterns for enterprise applications
- Security best practices for handling sensitive user data
- Payment processing integration with proper validation
- Professional error handling and logging systems

The implementation follows industry best practices and demonstrates the ability to create production-ready applications with consideration for security, scalability, and maintainability.
