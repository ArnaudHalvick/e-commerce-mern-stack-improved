# API Validators

This directory contains validation middleware for API endpoints using [express-validator](https://express-validator.github.io/).

## Email Normalization

One of the key features is email normalization, particularly for Gmail addresses:

- Gmail treats dots in the local part (before the @) as if they don't exist
- For example: `john.doe@gmail.com` and `johndoe@gmail.com` are the same Gmail account
- The system normalizes Gmail addresses by removing all dots in the local part
- Gmail also ignores everything after a plus sign (+), so `john+tag@gmail.com` is the same as `john@gmail.com`

This prevents duplicate account creation with variations of the same Gmail address.

## Password Validation

Password validation is handled using express-validator's `isStrongPassword()` method. The current password requirements are:

- Minimum length: 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

## Validator Files

- `userValidators.js` - Contains validators for user-related routes:
  - Registration
  - Login
  - Password change
  - Profile update

## Implementation Details

The validation works as follows:

1. Validator middleware is applied to routes in `userRoutes.js`
2. Each validation chain runs before the controller function
3. If validation fails, a 400 response with error details is sent
4. If validation passes, the request proceeds to the controller

## Express Validators vs. Mongoose Validators

### Why Have Both?

We use both express-validator (middleware) and Mongoose validators (model) because they serve different purposes:

**Express Validator (Middleware):**

- Validates API requests before they reach controllers
- Provides immediate feedback to the client with detailed error messages
- Prevents unnecessary database operations for invalid data
- Centralizes API validation logic
- Offers comprehensive validation features like sanitization, normalization, and custom rules

**Mongoose Validators (Model):**

- Acts as the last line of defense for data integrity
- Ensures database consistency even if API validation is bypassed
- Applies to all operations that modify the database, not just API requests
- Works for data created programmatically (not through the API)
- Protects against bugs in the application that might try to save invalid data

### Best Practices

To avoid redundancy and maintain clean code:

1. **Use express-validator for complex validations** - When validation requires substantial logic or user-friendly error messages
2. **Keep mongoose validations simpler** - Basic type checking and required field validation
3. **Avoid duplicating complex validation logic** - Let each layer handle what it's best at

## Benefits of Express-Validator Approach

- **Separation of concerns** - Validation logic is separated from business logic
- **Standardized validation** - Consistent error handling and messaging
- **Clean controllers** - Controllers focus on core functionality without validation code
- **Reusable validators** - Validation chains can be reused across different routes
- **Comprehensive validation** - Built-in functions for common validation scenarios

## Example Usage

```javascript
// In routes file
router.post("/signup", validateRegistration, userController.registerUser);

// In validators file
const validateRegistration = [
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password must meet strength requirements"),
  // Other validations...
  validateResults,
];
```
