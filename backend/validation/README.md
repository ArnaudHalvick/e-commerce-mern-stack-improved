# Validation System

## Overview

This module centralizes all validation-related functionality in the application:

- **Schema extraction**: Dynamically extracts validation rules from Mongoose models for the frontend
- **Express validator middleware**: Backend validation middleware for API routes

The system follows a "single source of truth" approach by extracting validation rules directly from the Mongoose models, ensuring consistent validation behavior across both frontend and backend.

## Architecture

### Directory Structure

```
validation/
  ├── extractors/           # Utilities to extract validation rules from models
  │   ├── modelValidations.js     # Model-specific extraction functions
  │   ├── schemaToValidation.js   # Core utilities for schema extraction
  │   └── index.js               # Exports all extractors
  ├── middleware/           # Express validation middleware
  │   ├── userValidators.js      # User-related validation middleware
  │   └── index.js               # Exports all middleware
  ├── index.js              # Main module exports
  ├── MIGRATION.md          # Migration guide for validation changes
  └── README.md             # This file
```

### Core Components

1. **Schema Extractors** (`extractors/`):

   - Extract validation rules from Mongoose schemas
   - Provide model-specific validation functions
   - Convert complex Mongoose validators to frontend-friendly format

2. **Validation Middleware** (`middleware/`):
   - Express validator middleware for API routes
   - Uses extracted validation rules from models
   - Provides consistent error messages and formats

## Key Features

### Dynamic Rule Extraction

The system dynamically extracts validation rules from Mongoose schemas:

- **Field requirements** (required, min/max length, patterns)
- **Custom validators** (regex patterns, custom functions)
- **Validation messages** (error messages from models)

### How It Works

1. **Model Definition**: Validation rules are defined in Mongoose models (e.g., User.js)
2. **Rule Extraction**: Functions in `schemaToValidation.js` extract these rules
3. **Specialized Extractors**: Model-specific extractors in `modelValidations.js` provide tailored validation
4. **API Endpoints**: The validation controller exposes these rules via API endpoints
5. **Frontend Consumption**: Frontend forms consume these endpoints for consistent validation

## Usage Examples

### Extracting Validation Rules from Models

```javascript
const { getModelValidation } = require("./extractors/schemaToValidation");
const User = require("../models/User");

// Extract validation for specific fields
const userValidation = getModelValidation(User, ["name", "email", "password"]);
```

### Using Model-Specific Validation Functions

```javascript
const { getUserProfileValidation } = require("./extractors/modelValidations");

// Get validation for user profile
const profileValidation = getUserProfileValidation();
```

### API Endpoints

The system exposes validation rules through dedicated API endpoints:

- `GET /api/validation/profile` - Get user profile validation rules
- `GET /api/validation/password` - Get password change validation rules
- `GET /api/validation/registration` - Get user registration validation rules

## Best Practices

1. **Single Source of Truth**: Always define validation rules in Mongoose models
2. **Special Cases Only**: Only hardcode validators for specific cases like password confirmation
3. **Dynamic Extraction**: Use extraction functions instead of duplicating validation logic
4. **Consistent Middleware**: Use validation middleware that leverages the extracted rules

## Example: Adding a New Validation Field

1. Update the Mongoose model with validation rules
2. The validation system will automatically extract these rules
3. Frontend can consume updated rules through the validation API endpoints

No need to update validation in multiple places!

## Troubleshooting

### Common Issues

- **Missing Validation Rules**: Ensure validators are properly defined in the Mongoose model
- **Inconsistent Validation**: Check if custom validation is overriding model validation
- **Complex Validators**: For complex validators, you may need to enhance the extraction logic

## Contributing

When enhancing the validation system:

1. Ensure backward compatibility
2. Document changes in MIGRATION.md
3. Follow the "single source of truth" principle
4. Add tests for new validation logic
