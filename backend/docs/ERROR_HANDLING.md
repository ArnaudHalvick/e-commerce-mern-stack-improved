# Error Handling System Documentation

This document provides a comprehensive guide to the error handling system implemented in our Express backend application. The system is designed to provide consistent error responses, detailed error logging, and appropriate error handling for both development and production environments.

## Table of Contents

1. [Core Components](#core-components)
2. [Error Types and Classification](#error-types-and-classification)
3. [Error Response Format](#error-response-format)
4. [Using the Error Handling System](#using-the-error-handling-system)
5. [Environment-Specific Behavior](#environment-specific-behavior)
6. [Logging Configuration](#logging-configuration)
7. [Standardized Error Creation](#standardized-error-creation)
8. [Implementation Guidelines](#implementation-guidelines)

## Core Components

The error handling system consists of four main components:

### 1. Custom Error Class (`AppError`)

Location: `utils/errors/AppError.js`

The `AppError` class extends the built-in `Error` object and adds properties for better error handling:

```javascript
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Add validation errors if provided
    if (errors) {
      this.errors = errors;
    }

    Error.captureStackTrace(this, this.constructor);
  }

  // Standardized error creation and logging
  static createAndLogError(message, statusCode, context = {}, errors = null) {
    // Log based on status code severity
    if (statusCode >= 500) {
      logger.error(message, { ...context, statusCode });
    } else if (statusCode >= 400) {
      logger.warn(message, { ...context, statusCode });
    } else {
      logger.info(message, { ...context, statusCode });
    }

    return new AppError(message, statusCode, errors);
  }
}
```

Key properties:

- `statusCode`: HTTP status code for the error (e.g., 404, 500)
- `status`: Either 'fail' (4XX errors) or 'error' (5XX errors)
- `isOperational`: Flag indicating whether this is a known operational error or an unexpected programming error
- `errors`: Optional validation errors object for detailed field validations

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

Standard approach:

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

Recommended approach with automatic logging:

```javascript
// In synchronous code with context for better debugging
if (!user) {
  return next(
    AppError.createAndLogError("User not found", 404, {
      userId: req.params.id,
      requestedBy: req.user?.id,
    })
  );
}

// For validation errors
if (!isValid) {
  return next(
    AppError.createAndLogError(
      "Validation failed",
      400,
      { providedFields: Object.keys(req.body) },
      { field1: "Error message", field2: "Another error message" }
    )
  );
}
```

### Wrapping Async Controller Functions

```javascript
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      AppError.createAndLogError("User not found", 404, {
        userId: req.params.id,
      })
    );
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
  next(
    AppError.createAndLogError(
      `Can't find ${req.originalUrl} on this server!`,
      404,
      { method: req.method, originalUrl: req.originalUrl }
    )
  );
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

## Standardized Error Creation

For consistent error handling and logging, use the `AppError.createAndLogError` method:

```javascript
// Basic error with appropriate logging
AppError.createAndLogError("Resource not found", 404, { resourceId: id });

// Error with detailed context
AppError.createAndLogError("Authorization failed", 403, {
  userId: req.user.id,
  resourceId: req.params.id,
  action: "delete",
  userRole: req.user.role,
});

// Validation error with field errors
AppError.createAndLogError(
  "Validation failed",
  400,
  { formData: req.body },
  {
    name: "Name is required",
    email: "Email format is invalid",
  }
);
```

Benefits of this approach:

1. **Automatic logging** with appropriate severity level based on status code
2. **Contextual information** in logs for easier debugging and monitoring
3. **Consistent error format** across the application
4. **Reduced boilerplate code** by combining error creation and logging

When migrating existing error handling code, gradually replace direct `AppError` instantiation with the `createAndLogError` method to improve logging consistency and provide better debugging information.

## Implementation Guidelines

### Step-by-Step Implementation for New Controllers

1. **Import Required Utilities**

```javascript
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
```

2. **Replace try/catch Blocks with catchAsync**

```javascript
// Before
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// After
const getResource = catchAsync(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  res.status(200).json({
    success: true,
    data: resource,
  });
});
```

### Common Implementation Patterns

1. **MongoDB ID Validation**

```javascript
const mongoose = require("mongoose");

const getResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid ID format", 400));
  }

  // ... rest of the code
});
```

2. **Authorization Check Pattern**

```javascript
// Check if user is owner of resource
if (resource.user.toString() !== req.user.id) {
  return next(new AppError("Not authorized to access this resource", 403));
}
```

3. **Duplicate Entry Handling**

```javascript
try {
  await Resource.create(data);
} catch (error) {
  if (error.code === 11000) {
    return next(new AppError("Resource with this name already exists", 400));
  }
  throw error;
}
```

### Error Handling in Services

For services or utilities that don't have access to Express `next`:

```javascript
const emailService = {
  sendWelcomeEmail: async (user) => {
    try {
      // Send email logic
    } catch (error) {
      throw new AppError("Failed to send welcome email", 500);
    }
  },
};

// In the controller
const registerUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  try {
    await emailService.sendWelcomeEmail(user);
  } catch (error) {
    return next(error);
  }

  res.status(201).json({
    success: true,
    data: user,
  });
});
```
