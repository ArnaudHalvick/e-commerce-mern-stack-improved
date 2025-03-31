# API Module

This module centralizes all API-related code and functionality for the application.

## Structure

- **client.js** - Core axios instance with interceptors for authentication, error handling, etc.
- **config.js** - API configuration including base URL and URL manipulation utilities
- **index.js** - Central export point for all API functionality
- **services/** - Domain-specific API service modules
  - **auth.js** - Authentication API calls
  - **products.js** - Product-related API calls
  - **reviews.js** - Review-related API calls
  - **cart.js** - Shopping cart API calls
  - **payments.js** - Payment and order API calls

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

### Import configuration utilities

```javascript
import { config } from "../api";

// Use URL utilities
const imageUrl = config.getImageUrl("/images/product.jpg");
```
