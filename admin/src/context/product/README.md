# Product Context

## Overview

The Product Context provides state management for products in the admin dashboard. It handles product data, CRUD operations, filtering, and specialized product management functions such as toggling availability and managing product images.

## Directory Structure

```
product/
├── ProductContext.jsx - React context definition
└── ProductTypes.jsx - Action type constants
```

## Features

- **Product Data Management**: Central store for product data
- **CRUD Operations**: Create, read, update, and delete product functionality
- **Filtering & Sorting**: Sort and filter product lists
- **Pagination**: Paginated product retrieval
- **Product Images**: Managing product image uploads and association
- **Soft Delete**: Support for product deletion and restoration
- **Availability Toggle**: Quick toggling of product availability

## Usage

```jsx
import { useContext } from "react";
import ProductContext from "../../context/product/ProductContext";

const ProductListComponent = () => {
  const {
    products,
    loading,
    error,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    toggleAvailability,
  } = useContext(ProductContext);

  // Load products on component mount
  useEffect(() => {
    getProducts();
  }, []);

  // Create a new product
  const handleCreate = (productData) => {
    createProduct(productData);
  };

  // Update an existing product
  const handleUpdate = (id, productData) => {
    updateProduct(id, productData);
  };

  // Delete a product
  const handleDelete = (id) => {
    deleteProduct(id);
  };

  // Restore a previously deleted product
  const handleRestore = (id) => {
    restoreProduct(id);
  };

  // Toggle product availability
  const handleToggleAvailability = (id) => {
    toggleAvailability(id);
  };

  // Render product list with loading and error states
  return (
    <div>
      {loading ? (
        <div>Loading products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div key={product._id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.price}</p>
              <button onClick={() => handleToggleAvailability(product._id)}>
                {product.isAvailable ? "Disable" : "Enable"}
              </button>
              <button onClick={() => handleUpdate(product._id, product)}>
                Edit
              </button>
              <button onClick={() => handleDelete(product._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Product Operations

### Product Retrieval

- `getProducts(filters)`: Fetch products with optional filters
- `getProductById(id)`: Fetch a single product by ID
- `getProductBySlug(slug)`: Fetch a single product by slug

### Product Mutations

- `createProduct(productData)`: Create a new product
- `updateProduct(id, productData)`: Update an existing product
- `deleteProduct(id)`: Soft delete a product (mark as deleted)
- `permanentDeleteProduct(id)`: Permanently remove a product
- `restoreProduct(id)`: Restore a soft-deleted product
- `toggleAvailability(id)`: Toggle a product's availability status

### Product Image Management

- `uploadProductImages(files)`: Upload product images
- `deleteProductImage(imagePath)`: Delete a product image

## State Structure

The Product Context maintains the following state:

- `products`: Array of product objects
- `currentProduct`: Currently selected product (for editing/viewing)
- `loading`: Boolean indicating if product operations are in progress
- `error`: Any product-related error messages
- `filters`: Current product list filters
- `pagination`: Current pagination state (page, limit, total)

## Integration with API

The Product Context uses the product API service to perform all operations, integrating with the error context for consistent error handling and the auth context for authentication.
