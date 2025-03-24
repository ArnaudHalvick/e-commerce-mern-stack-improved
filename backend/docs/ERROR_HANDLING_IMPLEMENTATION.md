# Error Handling Implementation Guide

This guide provides step-by-step instructions for implementing the error handling system in new controllers and routes. Follow these guidelines to ensure consistent error handling across the application.

## Table of Contents

1. [Adding Error Handling to New Controllers](#adding-error-handling-to-new-controllers)
2. [Implementing Proper Error Validation](#implementing-proper-error-validation)
3. [Common Error Patterns](#common-error-patterns)
4. [Error Logging Best Practices](#error-logging-best-practices)
5. [Extending the Error System](#extending-the-error-system)

## Adding Error Handling to New Controllers

### Step 1: Import Required Utilities

At the top of your controller file, import the necessary error handling utilities:

```javascript
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
```

### Step 2: Wrap Controller Functions

Wrap all asynchronous controller functions with the `catchAsync` utility:

```javascript
// Without error handling
const getResource = async (req, res) => {
  // Function implementation
};

// With error handling
const getResource = catchAsync(async (req, res, next) => {
  // Function implementation
});
```

### Step 3: Replace try/catch Blocks

Remove any existing try/catch blocks and replace error handling with explicit `next(new AppError())` calls:

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

## Implementing Proper Error Validation

### Input Validation

Always validate user input at the beginning of controller functions:

```javascript
const createResource = catchAsync(async (req, res, next) => {
  const { name, description, price } = req.body;

  // Check for required fields
  if (!name || !description) {
    return next(new AppError("Name and description are required", 400));
  }

  // Validate price format
  if (price && (isNaN(price) || price < 0)) {
    return next(new AppError("Price must be a positive number", 400));
  }

  // Continue with resource creation
  const resource = await Resource.create({
    name,
    description,
    price: price || 0,
  });

  res.status(201).json({
    success: true,
    data: resource,
  });
});
```

### MongoDB ID Validation

When dealing with MongoDB IDs, check if they're valid:

```javascript
const mongoose = require("mongoose");

const getResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid ID format", 400));
  }

  const resource = await Resource.findById(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  res.status(200).json({
    success: true,
    data: resource,
  });
});
```

## Common Error Patterns

### Resource Not Found Pattern

```javascript
const resource = await Resource.findById(id);

if (!resource) {
  return next(new AppError("Resource not found", 404));
}
```

### Authorization Check Pattern

```javascript
// Check if user is owner of resource
if (resource.user.toString() !== req.user.id) {
  return next(new AppError("Not authorized to access this resource", 403));
}
```

### Duplicate Entry Pattern

```javascript
try {
  await Resource.create(data);
} catch (error) {
  if (error.code === 11000) {
    return next(new AppError("Resource with this name already exists", 400));
  }
  throw error; // Let the global error handler catch other errors
}
```

### Validation Error Pattern

```javascript
// For explicit validation
if (value.length < 3) {
  return next(new AppError("Value must be at least 3 characters long", 400));
}

// For handling Mongoose validation errors
try {
  await resource.save();
} catch (error) {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return next(new AppError(`Validation error: ${messages.join(". ")}`, 400));
  }
  throw error; // Let the global error handler catch other errors
}
```

## Error Logging Best Practices

### Log Additional Context

When needed, you can log additional context before returning an error:

```javascript
const processPayment = catchAsync(async (req, res, next) => {
  try {
    const result = await paymentService.process(req.body);
    // Handle success
  } catch (error) {
    // Log additional context for debugging
    logger.error("Payment processing failed", {
      userId: req.user.id,
      amount: req.body.amount,
      error: error.message,
    });

    return next(new AppError("Payment processing failed", 500));
  }
});
```

### Custom Error Messages

Create user-friendly error messages while logging technical details:

```javascript
try {
  await externalService.call();
} catch (error) {
  logger.error("External service error", {
    service: "externalService",
    method: "call",
    error: error.message,
    stack: error.stack,
  });

  return next(new AppError("Service temporarily unavailable", 503));
}
```

## Extending the Error System

### Adding Custom Error Types

For specific error types, you can extend the `AppError` class:

```javascript
// utils/AuthError.js
const AppError = require("./AppError");

class AuthError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = "AuthError";
  }
}

module.exports = AuthError;
```

### Adding Custom Error Handlers

To handle specific error types, add handlers to `errorHandler.js`:

```javascript
// utils/errorHandler.js

// Add a custom handler
const handleStripeError = (err) => {
  let message = "Payment processing failed";

  switch (err.type) {
    case "StripeCardError":
      message = `Payment error: ${err.message}`;
      break;
    case "StripeRateLimitError":
      message = "Too many payment requests, please try again later";
      break;
    // Add other cases as needed
  }

  return new AppError(message, 400);
};

// In the main error handler function
if (err.name === "StripeError") error = handleStripeError(error);
```

### Handling Errors in Non-Controller Code

For services or utilities that don't have access to the Express `next` function:

```javascript
// Services should throw AppError instances
const emailService = {
  sendWelcomeEmail: async (user) => {
    try {
      // Send email logic
    } catch (error) {
      throw new AppError("Failed to send welcome email", 500);
    }
  },
};

// Then in the controller
const registerUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  try {
    await emailService.sendWelcomeEmail(user);
  } catch (error) {
    // The error is already an AppError, just pass it to next
    return next(error);
  }

  res.status(201).json({
    success: true,
    data: user,
  });
});
```

By following these guidelines, you'll maintain consistent error handling throughout the application, making the code more robust and the debugging process more efficient.
