# Validation and Security Implementation

## Overview

This document outlines the comprehensive validation and security strategy implemented in the application. The system provides multiple layers of protection against common web vulnerabilities through a combination of:

1. **Global Security Middleware** - Applied to all routes
2. **Route-Level Validation** - Applied to specific endpoints
3. **Model-Level Validation** - Enforced at the database level
4. **Input Sanitization** - To prevent injection attacks and XSS
5. **Rate Limiting** - To prevent abuse and brute force attacks

## Security Middleware

The application uses several security middleware packages at the global level:

| Middleware                        | Purpose                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `helmet`                          | Sets secure HTTP headers to protect against various attacks        |
| `express-mongo-sanitize`          | Prevents NoSQL injection by sanitizing request data                |
| `xss-clean`                       | Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks |
| `express.json({ limit: '10kb' })` | Limits request size to prevent DoS attacks                         |
| `express-rate-limit`              | Limits the number of requests to prevent abuse and brute force     |
| `sanitizers`                      | Request sanitization for body fields and URL parameters            |

## Validation Layers

### 1. Global Validation

Applied to all routes through middleware in `server.js`:

- **`sanitizeParams`**: Sanitizes URL parameters for all requests (from `middleware/validation.js`)
- **`apiLimiter`**: Limits the number of API requests (100 per 15 minutes)
- Request size limiting to prevent DoS attacks

### 2. Route-Level Validation

Each endpoint that processes user input has specific validation:

- **Authentication Routes**: `/signup`, `/login`, `/reset-password`, etc.
- **Profile Management Routes**: `/profile`, `/change-password`, `/change-email`, etc.

Example:

```javascript
router.post(
  "/signup",
  accountCreationLimiter, // Rate limiting
  sanitizeRequest, // General sanitization (from middleware/sanitizers.js)
  isNotAuthenticated, // Access control
  validateRegistration, // Input validation
  authController.registerUser
);
```

### 3. Model-Level Validation

Database models include validation rules that are enforced before saving:

- String length restrictions
- Format validation (email, password complexity, etc.)
- Required field validation

Example from User model:

```javascript
email: {
  type: String,
  required: [true, "Please enter your email"],
  unique: true,
  lowercase: true,
  match: [
    /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i,
    "Please enter a valid email",
  ],
}
```

## Rate Limiting

The application implements rate limiting to prevent abuse and brute force attacks:

| Endpoint Type    | Limit                       | Purpose                                     |
| ---------------- | --------------------------- | ------------------------------------------- |
| Login            | 5 attempts per 15 minutes   | Prevent brute force login attacks           |
| Account Creation | 3 accounts per hour         | Prevent mass account creation               |
| Password Reset   | 3 requests per hour         | Prevent abuse of the password reset feature |
| General API      | 100 requests per 15 minutes | Prevent DoS attacks and API abuse           |

Rate limiters are implemented using the `express-rate-limit` package and are applied at both the global level and to specific sensitive routes.

## Validation Strategy

### Single Source of Truth

The application follows a "single source of truth" approach for validation:

1. Primary validation rules are defined in Mongoose models
2. The validation system extracts these rules for use in:
   - Backend validation middleware (express-validator)
   - API endpoints for frontend validation consumption

### Consistent Error Handling

All validation errors are handled consistently:

1. Route-level validation uses `express-validator` to check inputs
2. Errors are converted to `AppError` objects with status code 400
3. The global error handler formats and returns these errors to clients

## Input Sanitization

Multiple layers of sanitization are applied:

1. **Global Sanitization**: Applied to all requests

   - URL parameter sanitization (`middleware/validation.js`)
   - Request body size limits

2. **Route-Level Sanitization**: Applied before specific route handlers
   - `sanitizeRequest`: Trims and escapes all fields (`middleware/sanitizers.js`)
   - `sanitizeFields`: Allows sanitizing specific fields without escaping (for rich text)

## Best Practices Implementation

The validation system follows these security best practices:

1. **Defense in Depth**: Multiple layers of validation and sanitization
2. **Fail Securely**: Strict validation with clear error messages
3. **Principle of Least Privilege**: Input is restricted to only what's needed
4. **Input Validation**: Both client-side and server-side validation
5. **Output Encoding**: Prevents XSS by sanitizing user-generated content
6. **Rate Limiting**: Prevents abuse and brute force attacks

## Usage Guide

### Adding New Validated Routes

When adding a new route that processes user input:

1. Define validation rules in the model (if applicable)
2. Create or use existing validation middleware
3. Consider if rate limiting is needed for the endpoint
4. Apply the middleware in the route definition:

```javascript
router.post(
  "/new-endpoint",
  endpointSpecificLimiter, // Optional rate limiting
  sanitizeRequest,
  isAuthenticated,
  validateNewEndpoint, // Your custom validation
  controller.handler
);
```

### Creating Custom Rate Limiters

To create a new rate limiter for specific endpoints:

```javascript
// In middleware/rateLimit.js
const customLimiter = createRateLimiter(
  10, // 10 requests
  30 * 60 * 1000, // 30 minutes
  "Custom rate limit message"
);

// Export the new limiter
module.exports = {
  // existing limiters...
  customLimiter,
};
```

### Bypassing Sanitization for Rich Text

For endpoints that need to accept rich text without escaping:

```javascript
router.post(
  "/rich-text-endpoint",
  sanitizeFields(["title", "author"]), // Only sanitize these fields
  validateRichTextContent,
  controller.handler
);
```

## Security Considerations

- **CSRF Protection**: Consider adding for operations that change state
- **Cookie Security**: Use secure, HTTP-only cookies
- **Input Validation**: Always validate on server-side, even if client-side validation exists
- **Failed Login Tracking**: Consider implementing account locking after multiple failed attempts
