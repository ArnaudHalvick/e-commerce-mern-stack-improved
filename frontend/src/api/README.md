# API Module

This module centralizes all API-related code and functionality for the application.

## Structure

- **client.js** - Core axios instance with interceptors for authentication, error handling, token refresh, and request cancellation
- **config.js** - API configuration including base URL and URL manipulation utilities
- **index.js** - Central export point for all API functionality
- **services/** - Domain-specific API service modules
  - **auth.js** - Authentication API calls
  - **products.js** - Product-related API calls
  - **reviews.js** - Review-related API calls
  - **cart.js** - Shopping cart API calls
  - **payments.js** - Payment and order API calls

## Features

- **Authentication** - Token-based authentication with automatic token refresh
- **Error Handling** - Centralized error handling and standardized error responses
- **Request Cancellation** - Ability to cancel pending requests
- **Public Endpoint Access** - Special handling for endpoints that don't require authentication
- **URL Utilities** - Helper functions for API URLs and asset paths

## Usage

### Import the entire API module

```javascript
import api from "../api";

// Then use any service
api.products
  .getAllProducts()
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

### Import specific services

```javascript
import { productsService, authService } from "../api";

// Then use directly
productsService
  .getProductById("123")
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

### Import the API client for custom requests

```javascript
import { apiClient } from "../api";

// Make custom requests
apiClient
  .get("/api/custom-endpoint")
  .then((response) => console.log(response.data))
  .catch((error) => console.error(error));
```

### Cancel pending requests

```javascript
import { apiClient, cancelPendingRequests } from "../api";

// Cancel all pending requests
cancelPendingRequests("User navigated away");
```

### Import configuration utilities

```javascript
import { config } from "../api";

// Convert relative path to absolute URL
const imageUrl = config.getImageUrl("/images/product.jpg");

// Get base URL without API path
const baseUrl = config.getBaseUrl();

// Join URL segments correctly
const url = config.joinUrl(baseUrl, "/products");

// Create an API URL
const apiUrl = config.getApiUrl("products/featured");

// Extract relative path from absolute URL
const relativePath = config.getRelativeImagePath(imageUrl);
```

### Common API operation examples

#### Authentication

```javascript
import { authService } from "../api";

// Login
authService
  .login({ email: "user@example.com", password: "password123" })
  .then((response) => console.log("Logged in successfully", response))
  .catch((error) => console.error("Login failed", error));

// Signup
authService
  .register({
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  })
  .then((response) => console.log("Account created", response))
  .catch((error) => console.error("Signup failed", error));
```

#### Products

```javascript
import { productsService } from "../api";

// Get all products with pagination
productsService
  .getAllProducts({ page: 1, limit: 10 })
  .then((data) => console.log("Products:", data))
  .catch((error) => console.error("Failed to fetch products", error));

// Get product by ID
productsService
  .getProductById("product-123")
  .then((product) => console.log("Product details:", product))
  .catch((error) => console.error("Failed to fetch product", error));
```
