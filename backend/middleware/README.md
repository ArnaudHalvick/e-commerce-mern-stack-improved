# Middleware

This directory contains middleware functions used throughout the e-commerce application API. Middleware intercepts requests before they reach route handlers, allowing for cross-cutting concerns like authentication, validation, and rate limiting to be managed separately from business logic.

## Contents

- [Authentication Middleware](#authentication-middleware) (`auth.js`)
- [Rate Limiting Middleware](#rate-limiting-middleware) (`rateLimit.js`)
- [Request Sanitization Middleware](#request-sanitization-middleware) (`sanitizers.js`)
- [Validation Middleware](#validation-middleware) (`validation.js`)

## Authentication Middleware

`auth.js` - Handles user authentication and authorization.

### Functions:

- **isAuthenticated**: Verifies the user's JWT token and adds the user object to the request.
- **isNotAuthenticated**: Prevents authenticated users from accessing routes they shouldn't (like login/signup when already logged in).
- **verifyRefreshToken**: Validates refresh tokens for token rotation and renewal.
- **isEmailVerified**: Ensures a user's email is verified before allowing access to protected resources.

### Usage:

```javascript
const { isAuthenticated, isEmailVerified } = require("../middleware/auth");

// Protect a route with authentication
router.get("/profile", isAuthenticated, profileController.getProfile);

// Ensure email verification before checkout
router.post(
  "/checkout",
  isAuthenticated,
  isEmailVerified,
  orderController.createOrder
);
```

## Rate Limiting Middleware

`rateLimit.js` - Prevents API abuse by limiting the number of requests from a single IP address within a specified time window.

### Rate Limiters:

- **loginLimiter**: Restricts login attempts to 10 per 15-minute window.
- **accountCreationLimiter**: Limits account creation to 3 accounts per hour.
- **passwordResetLimiter**: Limits password reset requests to 3 per hour.
- **apiLimiter**: General API rate limit of 500 requests per 15 minutes.

### Usage:

```javascript
const { loginLimiter } = require("../middleware/rateLimit");

// Apply rate limiting to login route
router.post("/login", loginLimiter, authController.login);
```

## Request Sanitization Middleware

`sanitizers.js` - Sanitizes incoming request data to prevent XSS and injection attacks.

### Functions:

- **sanitizeRequest**: General-purpose sanitization for common fields, with special handling for address fields.
- **sanitizeFields**: Sanitizes specific fields without escaping (useful for rich text).

### Usage:

```javascript
const { sanitizeRequest, sanitizeFields } = require("../middleware/sanitizers");

// Apply general sanitization
router.post("/users", sanitizeRequest, userController.createUser);

// Sanitize specific fields only
router.post(
  "/products",
  sanitizeFields(["description"]),
  productController.createProduct
);
```

## Validation Middleware

`validation.js` - Handles validation errors and sanitizes URL parameters.

### Functions:

- **sanitizeParams**: Removes potential malicious characters from URL parameters.
- **validationErrorHandler**: Checks for validation errors from express-validator and returns appropriate error responses.

### Usage:

```javascript
const {
  sanitizeParams,
  validationErrorHandler,
} = require("../middleware/validation");
const { body } = require("express-validator");

router.post(
  "/users",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    validationErrorHandler,
  ],
  userController.createUser
);
```

## Best Practices

- Always apply authentication middleware before other route-specific middleware.
- Apply sanitization middleware before validation to ensure clean data is validated.
- Use rate limiting for sensitive operations like authentication and user creation.
- Chain middleware in the order: rate limiting → sanitization → validation → authentication → route handler.
