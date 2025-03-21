# Validation Migration Guide

## Overview

The validation system has been restructured to provide:

1. **Centralized validation** - All validation in one place
2. **Dynamic schema extraction** - Rules are automatically updated when models change
3. **Consistent validation** - Same rules used on frontend and backend
4. **Better organization** - Clear separation of concerns

## Directory Changes

- ✅ `/utils/schemaToValidation.js` → `/validation/extractors/schemaToValidation.js`
- ✅ `/middleware/validators/*` → `/validation/middleware/*`

## Import Changes

Update your imports from:

```javascript
// OLD
const { getUserProfileValidation } = require("../utils/schemaToValidation");
const { validateLogin } = require("../middleware/validators");
```

To:

```javascript
// NEW
const { getUserProfileValidation, validateLogin } = require("../validation");
```

## Backward Compatibility

For backward compatibility, the old files still exist but now re-export from the new location:

- `/utils/schemaToValidation.js` → re-exports from `/validation/extractors`
- `/middleware/validators/index.js` → re-exports from `/validation/middleware`

This ensures existing code continues to work, but new code should use the new imports.

## Enhanced Features

The new validation system includes several improvements:

1. **Better regex pattern extraction** - Automatically extracts patterns from mongoose validators
2. **Custom validation messages** - All validation messages are properly captured and exposed
3. **Generic model validation** - The `getModelValidation` function works with any mongoose model
4. **Deep merging** - Custom validations properly merge with schema-based validations

## How to Add New Validations

### For Mongoose Models

1. Add validations directly to the model schema
2. The extraction system will automatically pick them up

```javascript
// In your model
const MySchema = new mongoose.Schema({
  field: {
    type: String,
    required: [true, "This field is required"],
    match: [/^[A-Z0-9]+$/, "Only uppercase letters and numbers allowed"],
  },
});
```

### For Custom Validations

1. Add model-specific validation to `/validation/extractors/modelValidations.js`
2. Add express-validator middleware to `/validation/middleware/`
