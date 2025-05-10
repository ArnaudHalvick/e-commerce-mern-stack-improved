# ProductEditModal Component

## Overview

The ProductEditModal is a comprehensive, reusable modal component for creating and editing product information in the admin dashboard. It provides a complete form interface for all product data, including basic information, pricing, categorization, and image management.

## Features

- **Complete Product Form**: Edit all product attributes including:
  - Basic details (name, descriptions)
  - Pricing (regular and discounted)
  - Categorization (category, tags, types)
  - Availability status
  - Sizing options
  - Image management
- **Form Validation**: Comprehensive validation with error messages
- **Image Management**: Integrated with ImageGallery components to:
  - Upload new images
  - Select from existing images
  - Set main product image
  - Reorder images
- **Unsaved Changes Detection**: Warns users before discarding unsaved changes
- **Responsive Design**: Works on all device sizes with appropriate layouts

## Component Structure

```
productEditModal/
├── ProductEditModal.jsx - Main component implementation
├── ProductEditModal.css - Component styling
├── index.js - Component exports
└── README.md - This documentation
```

## Usage

Import and use the ProductEditModal component in your admin interfaces:

```jsx
import { ProductEditModal } from "../../components/productEditModal";

// In your component
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);

const handleEditClick = (product) => {
  setSelectedProduct(product);
  setIsEditModalOpen(true);
};

const handleModalClose = () => {
  setIsEditModalOpen(false);
  setSelectedProduct(null);
};

const handleSaveProduct = async (updatedProduct) => {
  try {
    // Save the product...
    handleModalClose();
  } catch (error) {
    // Handle error...
  }
};

// In your JSX
<ProductEditModal
  isOpen={isEditModalOpen}
  onClose={handleModalClose}
  product={selectedProduct}
  onSave={handleSaveProduct}
  title={selectedProduct ? "Edit Product" : "Add New Product"}
/>;
```

## Props

| Prop    | Type     | Required | Default        | Description                                       |
| ------- | -------- | -------- | -------------- | ------------------------------------------------- |
| isOpen  | Boolean  | Yes      | -              | Whether the modal is visible                      |
| onClose | Function | Yes      | -              | Callback when modal is closed                     |
| product | Object   | Yes      | -              | Product data to edit (null for new product)       |
| onSave  | Function | Yes      | -              | Callback when product is saved: (product) => void |
| title   | String   | No       | "Edit Product" | Modal title text                                  |

## Form Field Validation

The component validates:

- Required fields (name, descriptions, category, etc.)
- Price values (must be greater than 0)
- Correct discount price relationship (discount price < original price)

## Dependencies

- React
- UI components (Button, Input, Select, Modal)
- Toast notifications for user feedback
- ImageGallery components for image management

## Image Management

The ProductEditModal integrates with the ImageGallery components to provide a complete image management solution:

1. Displays existing product images
2. Allows uploading new images
3. Enables selecting from previously uploaded images
4. Handles selecting a main product image
5. Supports reordering of images
6. Handles image removal
7. Manages cleanup of unused uploaded images

## Error Handling

The component provides comprehensive error handling:

- Form validation errors with clear messaging
- API error handling with user feedback
- Image upload error handling

## Unsaved Changes Protection

The modal includes protection against accidental data loss by:

1. Tracking changes to the form data
2. Opening a confirmation dialog when closing with unsaved changes
3. Allowing users to continue editing or confirm discarding changes
