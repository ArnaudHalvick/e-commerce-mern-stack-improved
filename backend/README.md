# Express Backend with Enhanced Error Handling

This backend API implements a robust error handling system and provides a clean, consistent way to handle errors across the application.

## Error Handling System

The error handling system consists of:

1. **Custom Error Class** - `AppError` for creating operational errors
2. **Async Error Wrapper** - `catchAsync` for automating try/catch in async functions
3. **Global Error Handler** - Centralized error processing
4. **Logging System** - Winston-based structured logging

## Documentation

Detailed documentation available in the `docs` directory:

- [Error Handling Overview](./docs/ERROR_HANDLING.md) - Comprehensive guide to the error system
- [Implementation Guide](./docs/ERROR_HANDLING_IMPLEMENTATION.md) - How to implement error handling in new controllers
- [Testing Guide](./docs/TESTING_ERROR_HANDLING.md) - How to test the error handling system

## Running Tests

```bash
# Manual tests
mkdir -p tests
node -e "require('./tests/errorHandling.test').runTests()"
```

## How to Use

Wrap controller functions with catchAsync:

```javascript
const createResource = catchAsync(async (req, res, next) => {
  // Controller implementation
  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  // Success response
  res.status(200).json({
    success: true,
    data: resource,
  });
});
```

## Environment Configuration

The error handling behavior changes based on the environment:

```bash
# Development mode - detailed errors
npm run dev

# Production mode - sanitized errors
npm run prod
```

## Benefits

- **Consistent Error Responses** - All errors follow the same format
- **Improved Debugging** - Detailed errors in development
- **Security** - Sanitized errors in production
- **Reduced Boilerplate** - No try/catch blocks needed
- **Robust Logging** - Structured logging with contextual information
