# Configuration

This directory contains configuration files for the e-commerce application. It manages database connections, environment variables, and other application-wide settings.

## Overview

The configuration system follows these principles:

- Environment-based configuration using dotenv
- Centralized connection management
- Separation of concerns
- Security best practices for sensitive information

## File Structure

| File    | Description                               |
| ------- | ----------------------------------------- |
| `db.js` | MongoDB database connection configuration |

## Environment Variables

The application uses a `.env` file in the root directory to manage environment variables. Here's a list of required variables:

### Core Environment

| Variable       | Description                     | Example                             |
| -------------- | ------------------------------- | ----------------------------------- |
| `NODE_ENV`     | Application environment         | `development`, `production`, `test` |
| `PORT`         | Server port                     | `4000`                              |
| `FRONTEND_URL` | URL of the frontend application | `http://localhost:3000`             |
| `PUBLIC_URL`   | Public URL of the backend API   | `http://localhost:4000`             |

### Database Configuration

| Variable      | Description               | Example                                                      |
| ------------- | ------------------------- | ------------------------------------------------------------ |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/dbname` |
| `DB_USERNAME` | MongoDB username          | `db-user`                                                    |
| `DB_PASSWORD` | MongoDB password          | `your-password`                                              |

### Authentication

| Variable               | Description                           | Example                           |
| ---------------------- | ------------------------------------- | --------------------------------- |
| `ACCESS_TOKEN_SECRET`  | Secret for signing JWT access tokens  | `random-string-at-least-32-chars` |
| `REFRESH_TOKEN_SECRET` | Secret for signing JWT refresh tokens | `random-string-at-least-32-chars` |
| `ACCESS_TOKEN_EXPIRE`  | Access token expiration time          | `15m`                             |
| `REFRESH_TOKEN_EXPIRE` | Refresh token expiration time         | `7d`                              |
| `COOKIE_EXPIRE`        | Cookie expiration time in days        | `7`                               |

### Payment Processing (Stripe)

| Variable                 | Description            | Example       |
| ------------------------ | ---------------------- | ------------- |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `STRIPE_SECRET_KEY`      | Stripe secret key      | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET`  | Stripe webhook secret  | `whsec_...`   |

### Email Configuration (Gmail)

| Variable             | Description                      | Example                     |
| -------------------- | -------------------------------- | --------------------------- |
| `GMAIL_USER`         | Gmail account for sending emails | `your-email@gmail.com`      |
| `GMAIL_APP_PASSWORD` | Gmail app password               | `16-character-app-password` |

## Setting Up Configuration

### Local Development

1. Create a `.env` file in the root directory of the backend
2. Copy the variables from `.env.example` (if available) or the table above
3. Fill in the appropriate values for each variable

Example `.env` file:

```
# Environment
NODE_ENV=development

# Frontend URL for development
FRONTEND_URL=http://localhost:3000
PUBLIC_URL=http://localhost:4000

# Port
PORT=4000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
DB_USERNAME=username
DB_PASSWORD=your-password

# Authentication
ACCESS_TOKEN_SECRET=random-string-at-least-32-chars
REFRESH_TOKEN_SECRET=another-random-string-at-least-32-chars
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
COOKIE_EXPIRE=7

# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gmail configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### Production Deployment

In production environments:

1. Set environment variables through your hosting platform's dashboard
2. Never commit `.env` files with real credentials to version control
3. Consider using a secrets management service for sensitive information

## Database Configuration

The `db.js` file handles MongoDB connection using mongoose. It:

- Retrieves database credentials from environment variables
- Establishes a connection to MongoDB
- Handles connection errors gracefully
- Logs connection status

### Usage Example

```javascript
// Import the database connection
const connectDB = require("./config/db");

// Connect to the database
connectDB();
```

## Security Considerations

1. **Never commit sensitive information** to version control
2. Generate strong, unique secrets for JWT tokens
3. Use separate databases for development, testing, and production
4. Restrict database user permissions to only what's necessary
5. Rotate secrets and credentials periodically
6. Use app passwords for Gmail instead of account passwords

## Generating Secure Secrets

For generating secure random strings for JWT secrets:

```javascript
require("crypto").randomBytes(64).toString("hex");
```

## Environment-Specific Configuration

The application behavior changes based on the `NODE_ENV` environment variable:

- **development**: More verbose logging, developer-friendly error messages
- **production**: Optimized performance, client-safe error messages
- **test**: Configuration optimized for automated testing

## Troubleshooting

Common configuration issues:

1. **Database connection errors**: Verify MongoDB connection string, username, and password
2. **Authentication failures**: Check that JWT secrets are properly set
3. **Email sending failures**: Verify Gmail credentials and app password
4. **Payment processing issues**: Confirm Stripe API keys and webhook configuration
