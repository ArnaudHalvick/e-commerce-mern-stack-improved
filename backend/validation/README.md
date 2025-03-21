# Validation Architecture

This module centralizes all validation-related functionality in the application, ensuring consistency between frontend and backend validation.

## Directory Structure

```
validation/
├── extractors/           # Schema validation extractors for frontend
│   ├── schemaToValidation.js  # Core extraction utilities
│   ├── modelValidations.js    # Model-specific extractors
│   └── index.js               # Exports all extractors
├── middleware/           # Express validator middleware
│   ├── userValidators.js      # User-related validators
│   └── index.js               # Exports all middleware
└── index.js             # Main module exports
```

## Key Features

### Dynamic Schema Extraction

The validation system dynamically extracts validation rules from Mongoose schemas, ensuring that:

1. Frontend validation matches backend database schemas
2. When models are updated, validation rules are automatically updated
3. A single source of truth is maintained for validation rules

### Middleware for Request Validation

Express-validator middleware ensures all incoming requests are properly validated before reaching controllers, providing:

1. Consistent validation across all routes
2. Clear error messages for invalid inputs
3. Protection against malformed requests

## Usage

### Frontend Validation

To get validation rules for frontend forms, use the API endpoints:

- `GET /api/validation/profile` - Gets validation rules for user profile form
- `GET /api/validation/password` - Gets validation rules for password change form

### Backend Validation

Import validators directly in your route files:

```javascript
const { validateRegistration, validateLogin } = require("../validation");

router.post("/signup", validateRegistration, userController.registerUser);
```

## Adding New Validation

### For Mongoose Models

1. Update the Mongoose model with proper validation rules
2. The `extractValidationRules` function will automatically extract these rules
3. For any custom validations, add them to the appropriate file in `extractors/`

### For Express Validators

1. Create middleware validators in the `middleware/` directory
2. Export them through the appropriate index files
