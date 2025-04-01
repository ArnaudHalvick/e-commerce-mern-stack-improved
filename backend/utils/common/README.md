# Common Utilities

This directory contains general-purpose utility functions that provide commonly used functionality across the application.

## Components

- **logger.js** - Configurable Winston-based logging utility with different transports for development and production
- **catchAsync.js** - Wrapper for async Express route handlers to eliminate try/catch blocks
- **urlUtils.js** - Functions for URL manipulation, validation, and generation
- **upload.js** - File upload handling utilities

## Usage

### Logging

```javascript
const logger = require("../utils/common/logger");

// Different log levels
logger.debug("Detailed debug information");
logger.info("Normal operational messages");
logger.warn("Warning conditions");
logger.error("Error conditions", { contextData: "value" });
```

### Async Error Handling

```javascript
const catchAsync = require("../utils/common/catchAsync");

// Wrap async route handlers
router.get(
  "/users",
  catchAsync(async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
    // No try/catch needed, errors are automatically caught and passed to the error middleware
  })
);
```

### URL Utilities

```javascript
const { isValidUrl, buildUrl } = require("../utils/common/urlUtils");

// Check if URL is valid
if (isValidUrl(userInput)) {
  // URL is safe to use
}

// Build a URL with parameters
const url = buildUrl("/products", {
  category: "electronics",
  sort: "price",
});
```

### File Upload

```javascript
const uploadHandler = require("../utils/common/upload");

// Setup upload middleware
router.post("/upload", uploadHandler.single("image"), (req, res) => {
  // Access uploaded file via req.file
});
```

## Best Practices

- Use the appropriate log level for different messages
- Always wrap async route handlers with catchAsync
- Validate URLs before using them in sensitive operations
- Handle uploaded files securely with proper validation and virus scanning
