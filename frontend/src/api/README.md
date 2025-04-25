# API Module

This directory contains the API client and services for communicating with the backend API. It provides a centralized and organized way to handle all API calls throughout the application.

## Structure

```
api/
├── client.js        # Core API client with axios configuration and interceptors
├── config.js        # API configuration and URL utilities
├── index.js         # Entry point that exports all services
├── services/        # Individual API service modules
    ├── auth.js      # Authentication related API calls
    ├── cart.js      # Shopping cart management
    ├── payments.js  # Payment processing
    ├── products.js  # Product listing and details
    ├── reviews.js   # Product reviews
```

## Core Components

### `client.js`

A centralized Axios instance with configured:

- Base URL from environment variables
- Authentication token management
- Request/response interceptors
- Token refresh mechanism
- Error handling
- Request cancellation support

### `config.js`

Configuration utilities providing:

- API endpoint constants
- URL building utilities
- Environment-specific configurations
- Image URL handling

### `index.js`

Entry point that exports:

- Individual services for direct imports
- Consolidated API object for convenience

## Usage

### Importing the API

You can import the entire API module:

```js
import api from "../api";

// Use services
api.products.getAllProducts().then((products) => {
  // Handle products
});
```

Or import specific services:

```js
import { productsService, authService } from "../api";

// Use specific services
productsService.getProductById(id).then((product) => {
  // Handle product
});
```

### Available Services

#### Auth Service

- User authentication (login/logout)
- User registration
- Password reset
- Email verification
- Token management

#### Products Service

- Fetch all products
- Get product details
- Filter products by category
- Search products
- Get featured products

#### Cart Service

- Add items to cart
- Remove items from cart
- Update quantities
- Get cart contents
- Clear cart

#### Payments Service

- Process payments
- Create payment intents
- Handle payment confirmations
- Get payment history

#### Reviews Service

- Get product reviews
- Submit reviews
- Update reviews
- Delete reviews

## Error Handling

All API services include consistent error handling with standardized error responses including:

- HTTP status codes
- Error messages
- Field validation errors
- Network error detection

## Configuration

The API base URL is set using the environment variable `REACT_APP_API_URL`. If not provided, it defaults to `http://localhost:4000`.
