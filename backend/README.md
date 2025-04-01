# E-Commerce MERN Stack Backend API

A robust, secure, and scalable backend API for the E-Commerce MERN Stack application. This backend implements modern web development practices, including comprehensive error handling, authentication, payment processing, and structured architecture.

![Node.js](https://img.shields.io/badge/Node.js-v18.x-green)
![Express](https://img.shields.io/badge/Express-v4.21.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v5.x-green)
![Mongoose](https://img.shields.io/badge/Mongoose-v8.12.x-blue)

## 📚 Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Directory Structure](#directory-structure)
- [Setup & Installation](#setup--installation)
- [API Routes](#api-routes)
- [Authentication System](#authentication-system)
- [Error Handling System](#error-handling-system)
- [Security Implementations](#security-implementations)
- [Payment Integration](#payment-integration)
- [Documentation](#documentation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)

## 🏗️ Architecture Overview

This backend follows a structured architectural pattern:

- **MVC+ Architecture**: Model-View-Controller with additional Service layer
- **Layered Design**: Separation of concerns between routes, controllers, services, and models
- **RESTful API**: Consistent and intuitive API endpoints following REST principles
- **JWT Authentication**: Secure token-based authentication with refresh token rotation
- **MongoDB**: Document database with Mongoose ODM for data modeling

## 🌟 Key Features

- ✅ **Comprehensive Authentication**: Registration, login, token refresh, email verification, password reset
- ✅ **Advanced Error Handling**: Centralized error processing with detailed development logs and sanitized production errors
- ✅ **Data Validation**: Request validation using express-validator and custom validation middleware
- ✅ **Rate Limiting**: Protection against brute force attacks and API abuse
- ✅ **Stripe Payment Integration**: Secure payment processing with webhook handling
- ✅ **Email Notifications**: Transactional emails for account verification and notifications
- ✅ **Structured Logging**: Winston-based logging system with environment-specific configurations
- ✅ **Security Best Practices**: Input sanitization, XSS protection, CSRF prevention, and secure HTTP headers
- ✅ **API Documentation**: Comprehensive documentation using README files and Postman collections

## 📂 Directory Structure

The backend follows a well-organized directory structure:

- **`/config`**: Database and environment configuration
- **`/controllers`**: Request handlers for each resource
- **`/middleware`**: Authentication, validation, rate limiting, and other middleware
- **`/models`**: Mongoose schemas and models
- **`/routes`**: API route definitions
- **`/services`**: Business logic layer
- **`/utils`**: Utility functions and helpers
- **`/docs`**: API documentation and guides
- **`/scripts`**: Helper scripts for deployment and administration
- **`/tests`**: Testing infrastructure
- **`/upload`**: File upload storage

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v18.x or higher)
- MongoDB (v5.x or higher)
- npm or yarn

### Installation Steps

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd e-commerce-mern-stack-improved/backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory based on the variables in the [Environment Variables](#environment-variables) section

4. Start the development server
   ```bash
   npm run dev
   ```

### Running in Production

```bash
npm run prod
```

## 🌐 API Routes

The API is organized into the following route groups:

- **`/api/users`**: User authentication and profile management
- **`/api/products`**: Product listing, details, and management
- **`/api/cart`**: Shopping cart operations
- **`/api/reviews`**: Product review management
- **`/api/payment`**: Payment processing and order management
- **`/api/error-demo`**: Error handling demonstration endpoints
- **`/api/upload`**: File upload endpoints

For detailed route documentation, see the [Postman Collection](./docs/postman_collection.json) and [Postman Guide](./docs/POSTMAN_GUIDE.md).

## 🔐 Authentication System

The authentication system uses JWT tokens with a secure refresh token rotation strategy:

- **Access Token**: Short-lived JWT stored in memory (client-side)
- **Refresh Token**: Long-lived JWT stored as an HTTP-only cookie
- **Token Refresh**: Automatic token rotation for enhanced security
- **Email Verification**: Two-step registration with email verification
- **Password Reset**: Secure password reset flow with email confirmation
- **Account Protection**: Account lockout after multiple failed login attempts

Authentication middleware ensures that protected routes are accessible only to authenticated users with verified emails where required.

## ⚠️ Error Handling System

The error handling system consists of:

1. **Custom Error Class** - `AppError` for creating operational errors
2. **Async Error Wrapper** - `catchAsync` for automating try/catch in async functions
3. **Global Error Handler** - Centralized error processing
4. **Logging System** - Winston-based structured logging

Key benefits:

- **Consistent Error Responses**: All errors follow the same JSON format
- **Environment-Based Behavior**: Detailed errors in development, sanitized in production
- **Automatic Error Capture**: No try/catch boilerplate in controllers
- **Structured Logging**: Detailed error logs with stack traces for debugging

## 🛡️ Security Implementations

Security measures implemented include:

- **HTTP Security Headers**: Using Helmet middleware
- **Input Sanitization**: Preventing XSS attacks
- **NoSQL Injection Protection**: Sanitizing MongoDB queries
- **Rate Limiting**: Preventing brute force attacks
- **CORS Configuration**: Restricting cross-origin requests
- **Password Security**: Bcrypt hashing with proper salting
- **Secure Cookies**: HTTP-only flags for sensitive cookies
- **Request Validation**: Preventing malformed requests

For more details, see the [Security Documentation](./docs/SECURITY.md).

## 💳 Payment Integration

The backend integrates with Stripe for payment processing:

- **Payment Intents**: Client-side confirmation flow
- **Webhooks**: Server-side event handling for payment status updates
- **Order Management**: Automatic order creation upon successful payment
- **Checkout Flow**: Structured checkout process with cart validation

For integration details, see the [Payment Integration Documentation](./docs/PAYMENT_INTEGRATION.md).

## 📖 Documentation

Detailed documentation is available in the `docs` directory:

- [Error Handling Overview](./docs/ERROR_HANDLING.md)
- [Error Implementation Guide](./docs/ERROR_HANDLING_IMPLEMENTATION.md)
- [Security Documentation](./docs/SECURITY.md)
- [Payment Integration Guide](./docs/PAYMENT_INTEGRATION.md)
- [Email Setup Guide](./docs/EMAIL_SETUP.md)
- [Testing Error Handling](./docs/TESTING_ERROR_HANDLING.md)
- [URL Handling Guide](./docs/URL_HANDLING.md)
- [Postman Guide](./docs/POSTMAN_GUIDE.md)

## 🔧 Environment Variables

The application requires the following environment variables:

| Category       | Variable                 | Description                      |
| -------------- | ------------------------ | -------------------------------- |
| Core           | `NODE_ENV`               | Application environment          |
|                | `PORT`                   | Server port                      |
|                | `FRONTEND_URL`           | URL of the frontend application  |
|                | `PUBLIC_URL`             | Public URL of the backend API    |
| Database       | `MONGODB_URI`            | MongoDB connection string        |
| Authentication | `ACCESS_TOKEN_SECRET`    | Secret for JWT access tokens     |
|                | `REFRESH_TOKEN_SECRET`   | Secret for JWT refresh tokens    |
|                | `ACCESS_TOKEN_EXPIRE`    | Access token expiration time     |
|                | `REFRESH_TOKEN_EXPIRE`   | Refresh token expiration time    |
|                | `COOKIE_EXPIRE`          | Cookie expiration time in days   |
| Stripe         | `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key           |
|                | `STRIPE_SECRET_KEY`      | Stripe secret key                |
|                | `STRIPE_WEBHOOK_SECRET`  | Stripe webhook secret            |
| Email          | `GMAIL_USER`             | Gmail account for sending emails |
|                | `GMAIL_APP_PASSWORD`     | Gmail app password               |

## 📝 Scripts

| Script                   | Description                                 |
| ------------------------ | ------------------------------------------- |
| `npm start`              | Start the production server                 |
| `npm run dev`            | Run the server in development mode          |
| `npm run prod`           | Run the server in production mode           |
| `npm run fix-image-urls` | Fix image URLs in the database              |
| `npm run webhook`        | Set up Stripe webhook for local development |

## 🧪 Testing

### Running Tests

```bash
# Manual tests
mkdir -p tests
node -e "require('./tests/errorHandling.test').runTests()"
```

The `/api/error-demo` routes can be used to test error handling in different scenarios.

## 🚢 Deployment

The backend can be deployed using Docker with the provided Dockerfile and docker-compose configuration.

```bash
# Build and run using Docker
docker-compose up -d
```

For manual deployment, see deployment scripts in the root directory:

- `deploy.sh`: Deployment automation script
- `set_env.sh`: Environment configuration script
- `update_env.sh`: Environment update script

---

## 👨‍💻 Development Guidelines

When developing new features or fixing bugs:

1. Follow the established architecture patterns
2. Use `catchAsync` for all asynchronous controller functions
3. Implement proper validation for all incoming data
4. Add detailed error messages using the `AppError` class
5. Document new endpoints in the appropriate README files
6. Add necessary tests for new functionality
7. Follow security best practices for any sensitive operations
