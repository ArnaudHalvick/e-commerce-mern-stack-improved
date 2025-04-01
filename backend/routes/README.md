# Routes

This directory contains all the route definitions for the e-commerce application's API. Routes connect incoming HTTP requests to the appropriate controller functions.

## Overview

Routes in this application follow RESTful API design principles and are organized by resource type. They handle:

- Defining API endpoints
- Applying middleware (authentication, validation, rate limiting)
- Routing requests to the appropriate controller functions
- Organizing endpoints in a logical structure

## File Structure

| Route File           | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `cartRoutes.js`      | Routes for shopping cart management                   |
| `errorDemoRoutes.js` | Routes for demonstrating error handling patterns      |
| `paymentRoutes.js`   | Routes for payment processing and order management    |
| `productRoutes.js`   | Routes for product-related operations                 |
| `reviewRoutes.js`    | Routes for product review management                  |
| `uploadRoutes.js`    | Routes for file upload functionality                  |
| `userRoutes.js`      | Routes for user authentication and profile management |

## Common Route Patterns

All route files follow these common patterns:

1. **Authentication Middleware**: Protected routes use `isAuthenticated` middleware
2. **Request Sanitization**: User input is sanitized using `sanitizeRequest` middleware
3. **Rate Limiting**: Critical endpoints use rate limiting to prevent abuse
4. **RESTful Design**: Routes follow RESTful principles where appropriate
5. **Consistent Structure**: Each route file exports an Express router

## Detailed Route Descriptions

### cartRoutes.js

Routes for managing the shopping cart:

- `GET /` - Get user's cart data
- `POST /add` - Add item to cart
- `POST /remove` - Remove item from cart
- `POST /update` - Update cart item quantity
- `DELETE /clear` - Clear the entire cart

All cart routes require authentication.

### errorDemoRoutes.js

Routes for testing and demonstrating error handling:

- `GET /test-error` - Simulates a general error
- `GET /validation-error` - Simulates a validation error
- `GET /delayed-success` - Simulates a delayed success response

### paymentRoutes.js

Routes for payment processing and order management:

- `GET /cart-summary` - Get summary of cart for checkout
- `POST /create-payment-intent` - Create a payment intent
- `POST /confirm-order` - Confirm an order after payment
- `GET /my-orders` - Get user's order history
- `GET /order/:id` - Get details of a specific order
- `POST /webhook` - Webhook endpoint for payment service callbacks

Most payment routes require authentication and verified email.

### productRoutes.js

Routes for product management and retrieval:

- `POST /add-product` - Add a new product
- `POST /remove-product` - Remove a product
- `GET /all-products` - Get all products
- `GET /newcollection` - Get new collection products
- `GET /featured-women` - Get featured women's products
- `GET /tag/:tag` - Get products by tag
- `GET /type/:type` - Get products by type
- `GET /category/:category` - Get products by category
- `GET /slug/:slug` - Get product by slug
- `GET /:id` - Get product by ID
- `GET /related/:category/:productId?/:productSlug?` - Get related products

### reviewRoutes.js

Routes for product review management:

- `GET /products/:productId` - Get all reviews for a product
- `GET /:reviewId` - Get a specific review
- `POST /` - Add a new review
- `PUT /:reviewId` - Update an existing review
- `DELETE /:reviewId` - Delete a review
- `POST /:reviewId/helpful` - Mark a review as helpful

Review creation, updating, and deletion require authentication.

### uploadRoutes.js

Routes for file upload functionality:

- `POST /upload` - Upload a file (primarily for product images)

### userRoutes.js

Routes for user authentication and profile management:

**Authentication Routes:**

- `POST /signup` - Register a new user
- `POST /login` - Login a user
- `POST /refresh-token` - Refresh access token
- `POST /request-verification` - Request email verification
- `GET /verify-email/:token` - Verify email with token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /logout` - Logout user
- `GET /verify-token` - Verify access token validity

**Profile Management Routes:**

- `GET /me` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change user password
- `PUT /disable-account` - Disable user account
- `POST /change-email` - Request email change

## Middleware Usage

Routes leverage several middleware functions:

- **Authentication**: `isAuthenticated`, `isEmailVerified`, `isNotAuthenticated`
- **Security**: `sanitizeRequest` for input sanitization
- **Rate Limiting**: `loginLimiter`, `accountCreationLimiter`, `passwordResetLimiter`
- **Token Verification**: `verifyRefreshToken`

## Usage Example

Routes are typically registered in the main application file:

```javascript
// Example of how routes are registered in app.js
const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

// Register routes with a base path
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
```

## Authentication

Many routes require authentication, which is implemented using JWT (JSON Web Tokens):

- Public routes can be accessed without authentication
- Protected routes require a valid JWT token, passed in the Authorization header
- The `isAuthenticated` middleware verifies the token and attaches the user to the request object
