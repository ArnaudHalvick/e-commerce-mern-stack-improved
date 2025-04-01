# Error Handling Utilities

This directory contains custom error handling utilities that provide a standardized approach to error management throughout the application.

## Components

- **AppError.js** - Custom error class extending the built-in Error object with additional properties for HTTP status code, operational status, and validation errors
- **errorHandler.js** - Global error handling middleware for Express that formats and sends error responses

## Usage

### Creating and Throwing Errors

```javascript
const AppError = require("../utils/errors/AppError");

// Basic usage
throw new AppError("Resource not found", 404);

// With validation errors
throw new AppError("Validation failed", 400, {
  name: "Name is required",
  email: "Must be a valid email address",
});

// Create and log an error
throw AppError.createAndLogError("Payment processing failed", 503, {
  orderId: "123",
  userId: "456",
});
```

### Implementing Error Handler

```javascript
const errorHandler = require("../utils/errors/errorHandler");

// Add as the last middleware in your Express app
app.use(errorHandler);
```

## Error Classification

Errors are classified in two types:

1. **Operational Errors** - Expected errors that can occur during normal operation (e.g., validation failures, authentication errors). These are caught and handled gracefully.

2. **Programming Errors** - Unexpected errors like bugs or edge cases. These are logged for developer attention and generic error messages are sent to users.

## Best Practices

- Always use AppError instead of the built-in Error class
- Include appropriate HTTP status codes with errors
- Keep error messages clear but avoid exposing sensitive information
- Use the context parameter to add relevant debugging information
- Include validation errors when rejecting user input
