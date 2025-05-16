# Utilities

## Overview

This directory contains utility functions and helpers used throughout the admin dashboard. These utilities provide common functionality for API operations, data formatting, validation, and other shared tasks.

## Available Utilities

### API Utilities (`apiUtils.js`)

The API utilities provide functions for working with API URLs and endpoints:

```jsx
import { getImageUrl, getApiUrl, joinUrl } from "../utils/apiUtils";

// Get a complete image URL from a relative path
const imageUrl = getImageUrl("/uploads/products/product-1.jpg");

// Create an API endpoint URL
const apiUrl = getApiUrl("products/123");

// Join URL segments
const url = joinUrl(baseUrl, path);
```

#### Key Functions

- `getBaseUrl()`: Gets the base URL without the API suffix
- `joinUrl(baseUrl, path)`: Properly joins URL segments handling slashes
- `getApiUrl(path)`: Creates a full API URL from a path
- `getImageUrl(imagePath)`: Converts a relative image path to an absolute URL

## Best Practices

1. **Import Only What You Need**: Import specific functions rather than the entire utility
2. **Consistent Error Handling**: Ensure errors are caught and handled appropriately
3. **Avoid Duplication**: Use these utilities instead of reimplementing the same functionality
4. **Testing**: Test utility functions with different inputs to ensure they handle edge cases

## API URL Configuration

The API utilities automatically handle different environments:

- Uses environment variables (`VITE_API_URL`, `VITE_DEFAULT_PROTOCOL`) in development
- Uses the current domain in production to avoid CORS issues
- Handles special cases like Docker development environments

## Feature-Specific Utilities

As the admin dashboard grows, new utility files may be added for specific features:

- `validationUtils.js`: Form validation helpers
- `dateUtils.js`: Date formatting and manipulation
- `formattingUtils.js`: Text and number formatting
- `storageUtils.js`: Local storage abstraction

## Usage Examples

### Working with Image URLs

```jsx
import { getImageUrl } from "../utils/apiUtils";

// In a component
const ProductImage = ({ imagePath }) => {
  const fullImageUrl = getImageUrl(imagePath);

  return <img src={fullImageUrl} alt="Product" />;
};
```

### Building API URLs

```jsx
import { getApiUrl } from "../utils/apiUtils";

// In an API service
const fetchProduct = async (productId) => {
  const url = getApiUrl(`products/${productId}`);
  const response = await fetch(url);
  return response.json();
};
```
