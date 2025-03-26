# Validation and Security Implementation

## Overview

This document outlines the comprehensive validation and security strategy implemented in the application. The system provides multiple layers of protection against common web vulnerabilities through a combination of:

1. **Global Security Middleware** - Applied to all routes
2. **Route-Level Validation** - Applied to specific endpoints
3. **Model-Level Validation** - Enforced at the database level
4. **Input Sanitization** - To prevent injection attacks and XSS

## Security Middleware

The application uses several security middleware packages at the global level:

| Middleware                        | Purpose                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `helmet`                          | Sets secure HTTP headers to protect against various attacks        |
| `express-mongo-sanitize`          | Prevents NoSQL injection by sanitizing request data                |
| `xss-clean`                       | Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks |
| `express.json({ limit: '10kb' })` | Limits request size to prevent DoS attacks                         |

## Validation Layers

### 1. Global Validation

Applied to all routes through middleware in `server.js`:

- **`sanitizeParams`**: Sanitizes URL parameters for all requests
- Rate limiting and request size limiting to prevent DoS attacks

### 2. Route-Level Validation

Each endpoint that processes user input has specific validation:

- **Authentication Routes**: `/signup`, `/login`, `/reset-password`, etc.
- **Profile Management Routes**: `/profile`, `/change-password`, `/change-email`, etc.

Example:

```javascript
router.post(
  "/signup",
  sanitizeRequest, // General sanitization
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

   - URL parameter sanitization
   - Request body size limits

2. **Route-Level Sanitization**: Applied before specific route handlers
   - `sanitizeRequest`: Trims and escapes all fields
   - `sanitizeFields`: Allows sanitizing specific fields without escaping (for rich text)

## Best Practices Implementation

The validation system follows these security best practices:

1. **Defense in Depth**: Multiple layers of validation and sanitization
2. **Fail Securely**: Strict validation with clear error messages
3. **Principle of Least Privilege**: Input is restricted to only what's needed
4. **Input Validation**: Both client-side and server-side validation
5. **Output Encoding**: Prevents XSS by sanitizing user-generated content

## Usage Guide

### Adding New Validated Routes

When adding a new route that processes user input:

1. Define validation rules in the model (if applicable)
2. Create or use existing validation middleware
3. Apply the middleware in the route definition:

```javascript
router.post(
  "/new-endpoint",
  sanitizeRequest,
  isAuthenticated,
  validateNewEndpoint, // Your custom validation
  controller.handler
);
```

### Creating New Validation Middleware

To create validation for a new endpoint:

1. Define validation rules in `validation/middleware/[category]Validators.js`
2. Export them through the middleware index
3. Update the main validation index to expose them

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

- **Rate Limiting**: Consider adding rate limiting for auth endpoints
- **CSRF Protection**: For operations that change state
- **Cookie Security**: Use secure, HTTP-only cookies
- **Input Validation**: Always validate on server-side, even if client-side validation exists
