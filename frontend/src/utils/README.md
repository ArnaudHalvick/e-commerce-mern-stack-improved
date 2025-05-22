# Utilities

A collection of utility functions for the e-commerce application that handle common tasks such as image processing, validation, error handling, and scroll management.

## Structure

```
utils/
├── imageUtils.js         # Image handling and processing utilities
├── validation.js         # Form and data validation functions
├── validationSchemas.js  # Validation schemas for forms
├── scrollHelpers.js      # Scroll management utilities
└── errorHandling.js      # Error handling and formatting
```

## Image Utilities

`imageUtils.js` provides functions for image handling and processing:

```javascript
// Get image with appropriate size suffix
const productImage = getImageWithSize(imageUrl, "medium");

// Get placeholder for missing images
const placeholder = getPlaceholderImage("small");

// Generate alt text for product images
const altText = getImageAlt(product);

// Validate image URLs
const isValid = await isImageValid(imageUrl);
```

### Features

- Image URL processing
- Size-specific image handling
- Placeholder image management
- Alt text generation
- Image validation

## Validation

`validation.js` and `validationSchemas.js` handle form and data validation:

```javascript
// Validate form data
const errors = validateForm(formData, "signup");

// Validate specific fields
const isValid = validateField("email", email);

// Get field-specific error message
const message = getValidationMessage("password", value);
```

### Validation Schemas

```javascript
const schemas = {
  signup: {
    email: { required: true, type: "email" },
    password: { required: true, minLength: 8 },
    // ...
  },
  // ...
};
```

## Scroll Helpers

`scrollHelpers.js` provides smooth scrolling functionality:

```javascript
// Scroll to product display
await scrollToProductDisplay({
  behavior: "smooth",
  block: "start",
});

// Scroll to specific element
await scrollToElement(".error-message", {
  behavior: "smooth",
  delay: 100,
});

// Scroll to top
await scrollToTop({
  behavior: "smooth",
});
```

### Features

- Smooth scrolling
- Element targeting
- Configurable behavior
- Promise-based API
- Delayed scrolling

## Error Handling

`errorHandling.js` provides comprehensive error handling utilities:

```javascript
// Parse API errors
const formattedError = parseApiError(error);

// Format validation errors
const fieldErrors = formatValidationErrors(apiErrors);

// Check error type
if (isErrorType(error, "network")) {
  // Handle network error
}

// Get user-friendly message
const message = getUserFriendlyErrorMessage(error);
```

### Error Types

- Network errors
- Authentication errors
- Validation errors
- Server errors
- Permission errors
- Not found errors
- Rate limit errors

### Error Format

```typescript
interface FormattedError {
  message: string; // User-friendly message
  type: string; // Error type
  status: number; // HTTP status code
  details: any; // Additional error details
  fieldErrors?: {
    // Form field errors
    [field: string]: string;
  };
}
```

## Usage Guidelines

### Image Handling

```javascript
import { getImageWithSize, getImageAlt } from "../utils/imageUtils";

const ProductImage = ({ product }) => {
  const imageUrl = getImageWithSize(product.image, "medium");
  const alt = getImageAlt(product);
  return <img src={imageUrl} alt={alt} />;
};
```

### Validation

```javascript
import { validateForm } from "../utils/validation";

const handleSubmit = (data) => {
  const errors = validateForm(data, "signup");
  if (Object.keys(errors).length === 0) {
    // Form is valid
    submitForm(data);
  }
};
```

### Scroll Management

```javascript
import { scrollToElement } from "../utils/scrollHelpers";

const handleError = async () => {
  await scrollToElement(".error-message", {
    behavior: "smooth",
    block: "center",
  });
};
```

### Error Handling

```javascript
import {
  parseApiError,
  getUserFriendlyErrorMessage,
} from "../utils/errorHandling";

try {
  await apiCall();
} catch (error) {
  const formattedError = parseApiError(error);
  const message = getUserFriendlyErrorMessage(formattedError);
  showError(message);
}
```

## Development Guidelines

1. Error Handling:

   - Always use parseApiError for API errors
   - Provide user-friendly messages
   - Handle all error types
   - Include proper error details

2. Validation:

   - Use predefined schemas
   - Validate on blur and submit
   - Provide field-specific messages
   - Handle async validation

3. Image Processing:

   - Use appropriate image sizes
   - Always provide alt text
   - Handle missing images
   - Validate image URLs

4. Scroll Management:
   - Use smooth scrolling
   - Handle scroll completion
   - Consider mobile viewports
   - Manage scroll timing

## Utility Functions

This directory contains reusable utility functions and helpers that are used throughout the application.

### SEO Component

The `SEO.jsx` component leverages React 19's native Document Metadata feature to manage SEO metadata without third-party libraries like react-helmet.

```jsx
import SEO from "../utils/SEO";

// Usage in a component
const ProductPage = ({ product }) => {
  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        keywords={product.tags.join(", ")}
        image={product.image}
        url={`/products/${product.slug}`}
        type="product"
        strategy="replace"
      />
      {/* Page content */}
    </>
  );
};
```

#### Key Features

- **Native React 19 Implementation**: Uses the built-in Document Metadata feature without external dependencies
- **Dynamic Metadata**: Updates metadata based on page content and route changes
- **Social Media Support**: Includes Open Graph and Twitter Card tags
- **Structured Data**: Supports JSON-LD structured data for rich search results
- **Configurable Strategy**: Supports different metadata merge strategies

#### Configuration Options

| Prop          | Type   | Default           | Description                                          |
| ------------- | ------ | ----------------- | ---------------------------------------------------- |
| `title`       | string | -                 | Page title (will be appended with site name)         |
| `description` | string | -                 | Meta description for SEO and social sharing          |
| `keywords`    | string | -                 | Meta keywords (comma-separated)                      |
| `author`      | string | "MERN E-Commerce" | Content author                                       |
| `type`        | string | "website"         | Content type (e.g., "website", "product", "article") |
| `image`       | string | -                 | Image URL for social sharing (relative or absolute)  |
| `url`         | string | -                 | Canonical URL (relative or absolute)                 |
| `strategy`    | string | "replace"         | Metadata strategy: "replace" or "merge"              |

#### Environment Variables

| Variable                          | Description                                           |
| --------------------------------- | ----------------------------------------------------- |
| `REACT_APP_USE_DOCUMENT_METADATA` | Enables/disables React 19's Document Metadata feature |
| `REACT_APP_META_MERGE_STRATEGY`   | Global strategy setting ("replace" or "merge")        |

---

### Other Utilities

- **validation.js**: Form validation functions
- **validationSchemas.js**: Validation schemas for various forms
- **imageUtils.js**: Image handling and processing utilities
- **scrollHelpers.js**: Scroll management and animation helpers
- **errorHandling.js**: Error handling and formatting utilities
