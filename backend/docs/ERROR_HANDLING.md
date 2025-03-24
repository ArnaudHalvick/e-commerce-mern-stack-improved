# Error Handling System Documentation

This document provides a comprehensive guide to the error handling system implemented in our Express backend application. The system is designed to provide consistent error responses, detailed error logging, and appropriate error handling for both development and production environments.

## Table of Contents

1. [Core Components](#core-components)
2. [Error Types and Classification](#error-types-and-classification)
3. [Error Response Format](#error-response-format)
4. [Using the Error Handling System](#using-the-error-handling-system)
5. [Environment-Specific Behavior](#environment-specific-behavior)
6. [Logging Configuration](#logging-configuration)

## Core Components

The error handling system consists of four main components:

### 1. Custom Error Class (`AppError`)

Location: `utils/errors/AppError.js`

The `AppError` class extends the built-in `Error` object and adds properties for better error handling:

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

Key properties:

- `statusCode`: HTTP status code for the error (e.g., 404, 500)
- `status`: Either 'fail' (4XX errors) or 'error' (5XX errors)
- `isOperational`: Flag indicating whether this is a known operational error or an unexpected programming error

### 2. Async Error Wrapper (`catchAsync`)

Location: `utils/common/catchAsync.js`

The `catchAsync` utility wraps async controller functions to eliminate the need for repetitive try/catch blocks:

```javascript
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

This elegantly forwards any errors thrown in async functions to Express's error handling middleware.

### 3. Global Error Handler (`errorHandler`)

Location: `utils/errorHandler.js`

The global error handling middleware processes all errors and formats appropriate responses:

```javascript
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    // Handle specific error types
    // ...
    sendErrorProd(error, res);
  }
};
```

### 4. Logging System (`logger`)

Location: `utils/logger.js`

A Winston-based logging system that provides:

- Different log levels for development and production
- Console and file transports
- Structured JSON logging
- Integration with Morgan for HTTP request logging

## Error Types and Classification

Errors in the system are categorized into two main types:

### 1. Operational Errors

These are errors that can be anticipated and handled gracefully:

- Invalid user input
- Failed validation
- Resource not found
- Unauthorized access
- External service timeout

Operational errors are explicitly created using the `AppError` class and have `isOperational` set to `true`.

### 2. Programming Errors

These are bugs or errors that should be fixed in the code:

- Syntax errors
- Referenced undefined variables
- Type errors
- Unhandled promise rejections
- Uncaught exceptions

Programming errors have `isOperational` set to `false` (or not set at all).

## Error Response Format

### Development Environment

In development, detailed error information is provided for debugging:

```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true,
    "message": "Invalid input data",
    "stack": "..."
  },
  "message": "Invalid input data",
  "stack": "..."
}
```

### Production Environment

In production, only necessary information is provided to the client:

For operational errors:

```json
{
  "status": "fail",
  "message": "Invalid input data"
}
```

For programming errors:

```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

## Using the Error Handling System

### Creating Operational Errors

```javascript
// In synchronous code
if (!user) {
  return next(new AppError("User not found", 404));
}

// In asynchronous code
if (!product) {
  throw new AppError("Product not found", 404);
}
```

### Wrapping Async Controller Functions

```javascript
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
```

### Handling 404 Routes

```javascript
// At the end of your routes definitions in app.js
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
```

## Environment-Specific Behavior

The system behaves differently based on the `NODE_ENV` environment variable:

### Development (`NODE_ENV=development`)

- Detailed error information
- Full stack traces in responses
- Verbose console logging
- No file logging

### Production (`NODE_ENV=production`)

- Limited error information in responses (security best practice)
- No stack traces in responses
- Error-level console logging
- Error and combined file logging

## Logging Configuration

### Log Levels

- `error`: Critical errors requiring immediate attention
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Detailed debugging information

### Log Storage

In production, logs are stored in:

- `logs/error.log`: Contains only error-level logs
- `logs/combined.log`: Contains all log levels

### HTTP Request Logging

HTTP requests are logged using Morgan middleware:

- Development: `dev` format (colored, concise)
- Production: `combined` format (Apache common log format)
