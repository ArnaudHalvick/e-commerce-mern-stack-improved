# Controllers

This directory contains all the controller modules for the e-commerce application. Controllers handle incoming HTTP requests, interact with models, and send responses back to clients.

## Overview

Controllers follow the MVC (Model-View-Controller) architecture pattern and are responsible for:

- Processing incoming API requests
- Validating request data
- Interacting with models to fetch or manipulate data
- Sending appropriate responses back to clients
- Handling errors using the application's error handling mechanisms

## File Structure

| Controller               | Description                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `adminController.js`     | Handles admin-specific product management operations including CRUD with soft delete functionality               |
| `adminAuthController.js` | Manages admin authentication, authorization, and session management                                              |
| `authController.js`      | Handles user authentication flows including registration, login, logout, password management, and token handling |
| `cartController.js`      | Manages shopping cart operations like adding, removing, and updating items                                       |
| `errorDemoController.js` | Demonstrates error handling patterns for development and testing                                                 |
| `paymentController.js`   | Processes payment operations, checkout flows, and payment verification                                           |
| `productController.js`   | Manages product-related operations including CRUD for products and product searches                              |
| `profileController.js`   | Handles user profile management including updates and preferences                                                |
| `reviewController.js`    | Manages product reviews including creation, updating, and deletion                                               |

## Common Controller Patterns

All controllers use the following common patterns:

1. **Error Handling**: Using `catchAsync` utility to wrap async functions and handle errors
2. **Validation**: Input validation before processing requests
3. **Response Format**: Consistent response format with status, data, and messages
4. **Authentication**: Leveraging middleware for authentication where required

## Detailed Controller Descriptions

### adminController.js

Handles admin-specific product management operations:

- Creating new products with comprehensive validation
- Retrieving products with options for deleted/active items
- Updating product details with validation
- Soft deletion of products
- Managing product images and attributes
- Product search by ID and slug
- Bulk operations on products
- Formatting product data for admin dashboard

### adminAuthController.js

Manages admin authentication and authorization:

- Admin login with secure session management
- Admin-specific token handling
- Access control for admin routes
- Admin session management
- Security measures for admin operations

### authController.js

Handles all authentication-related operations including:

- User registration with email verification
- Login with security measures (failed attempt tracking)
- Token refresh functionality
- Password reset flow
- Email verification
- Account management (logout, etc.)

### cartController.js

Manages the shopping cart functionality:

- Creating and retrieving user carts
- Adding products to cart
- Removing products from cart
- Updating product quantities
- Calculating cart totals
- Clearing cart contents

### productController.js

Handles all product-related operations:

- Creating new products
- Retrieving product listings with filtering and pagination
- Updating product details
- Deleting products
- Managing product categories, tags, and attributes
- Product search functionality

### paymentController.js

Manages payment processing:

- Initiating payment checkout
- Processing payment confirmations
- Handling payment webhooks
- Managing order creation after payment
- Refund processing

### reviewController.js

Handles product review functionality:

- Creating new reviews
- Updating existing reviews
- Deleting reviews
- Retrieving product reviews
- Managing review ratings

### profileController.js

Manages user profile operations:

- Retrieving user profiles
- Updating user information
- Managing user settings and preferences
- Handling profile picture uploads

### errorDemoController.js

Provides testing endpoints for error handling:

- Demonstrates different error scenarios
- Used for testing error handling mechanisms
- Shows implementation patterns for error management

## Usage Example

Controllers are used in route files. For example:

```javascript
// Example route implementation
const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProduct,
} = require("../controllers/productController");

router.get("/products", getAllProducts);
router.get("/products/:id", getProduct);

module.exports = router;
```

## Error Handling

Controllers use a consistent error handling approach:

- Async functions are wrapped with `catchAsync` utility
- Application errors are created using `AppError` class
- Validation errors are returned with appropriate status codes
- Authentication errors trigger proper error responses

## Authentication

Controllers that require authentication check for the user in the request object, which is populated by authentication middleware before the controller is executed.
