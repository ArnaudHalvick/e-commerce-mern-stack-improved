# ProductEditModal Component

## Overview

The ProductEditModal is a comprehensive, reusable modal component for creating and editing product information in the admin dashboard. It provides a complete form interface for all product data, including basic information, pricing, categorization, and image management.

## Key Features

- **Complete Product Form**: Edit all product attributes including:
  - Basic details (name, descriptions)
  - Pricing (regular and discounted)
  - Categorization (category, tags, types)
  - Availability status
  - Sizing options
  - Image management
- **Dual-Purpose Design**: Works for both:
  - Creating new products
  - Editing existing products
- **Form Validation**: Comprehensive validation with error messages
- **Image Management**: Integrated with ImageGallery components to:
  - Upload new images
  - Select from existing images
  - Set main product image
  - Reorder images
- **Unsaved Changes Detection**: Warns users before discarding unsaved changes
- **Automatic Image Cleanup**: Handles cleanup of unused uploaded images
- **Responsive Design**: Works on all device sizes with appropriate layouts

## Component Structure

```
productEditModal/
├── components/
│   ├── AttributesSection.jsx - Component for sizes, tags, and types
│   ├── BasicInfoFields.jsx - Component for name and descriptions
│   ├── CategorySection.jsx - Component for category and availability
│   ├── ConfirmationModal.jsx - Modal for unsaved changes confirmation
│   ├── ImageSection.jsx - Component for image management
│   ├── PriceSection.jsx - Component for price management
│   ├── ProductEditModal.jsx - Main component that composes all sections
├── hooks/
│   ├── useFormValidation.js - Hook for form validation and submission
│   ├── useImageUpload.js - Hook for handling image uploads
│   ├── useModalManagement.js - Hook for modal state and confirmation
│   ├── useProductForm.js - Hook for form state management
│   ├── useProductManagement.js - Shared hook for product management across components
├── styles/
│   └── common.css - Common styles shared across all components
├── index.js - Component exports
└── README.md - This documentation
```

## Usage

### Basic Usage

Import and use the ProductEditModal component directly in your admin interfaces:

```jsx
import { ProductEditModal } from "../../components/productEditModal";

// In your component
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);

// In your JSX
<ProductEditModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  product={selectedProduct} // Pass null for new product
  onSave={handleSaveProduct}
  title="Edit Product"
/>;
```

### Advanced Usage with useProductManagement Hook

For more comprehensive management, use the shared `useProductManagement` hook:

```jsx
import { useProductManagement, ProductEditModal } from "../../components/productEditModal";

// In your component
const {
  isModalOpen,
  selectedProduct,
  handleCreateProduct,
  handleEditProduct,
  handleCloseModal,
  handleSaveProduct,
  handleDeleteProduct,
  handleToggleAvailability,
} = useProductManagement({
  onProductUpdated: (updatedProduct) => {
    // Handle product update success
    fetchProducts(); // Refresh product list
  },
  onProductCreated: (newProduct) => {
    // Handle product creation success
    showSuccessMessage(`Product ${newProduct.name} created!`);
  }
});

// In your JSX
<button onClick={handleCreateProduct}>Add New Product</button>

<ProductList
  products={products}
  onEdit={handleEditProduct}
  onDelete={handleDeleteProduct}
  onToggleAvailability={handleToggleAvailability}
/>

<ProductEditModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  product={selectedProduct}
  onSave={handleSaveProduct}
  title={selectedProduct ? `Edit Product: ${selectedProduct.name}` : "Add New Product"}
/>
```

## Available Hooks

### useProductManagement

A comprehensive hook for product management operations that is shared between Add Product and List Product pages:

```jsx
const {
  isModalOpen, // Whether the edit modal is open
  selectedProduct, // Currently selected product (null for new product)
  isLoading, // Loading state for API operations
  handleCreateProduct, // Open modal to create a new product
  handleEditProduct, // Open modal to edit an existing product
  handleCloseModal, // Close the edit modal
  handleSaveProduct, // Save a product (create or update)
  handleDeleteProduct, // Delete a product
  handleToggleAvailability, // Toggle product availability
} = useProductManagement({
  onProductUpdated, // Callback after product update
  onProductCreated, // Callback after product creation
});
```

### useProductForm

Manages the form state and validation for the product edit/create form:

```jsx
const {
  formData, // Current form data
  errors, // Validation errors
  hasDiscount, // Whether product has a discount
  isFormDirty, // Whether the form has unsaved changes
  isNewProduct, // Whether we're creating a new product
  handleChange, // Handle field change
  handleDiscountChange, // Handle discount toggle
  handleArrayFieldChange, // Handle array field changes (tags, sizes, etc.)
  handleImageChange, // Handle image list changes
  handleMainImageChange, // Handle main image index change
  validateForm, // Validate the form
  prepareFormDataForSubmission, // Prepare data for API submission
} = useProductForm(product);
```

### useImageUpload

Handles image upload and management:

```jsx
const {
  isUploading, // Whether an upload is in progress
  newlyUploadedImages, // Array of newly uploaded images
  handleImageUpload, // Handle image upload event
  cleanupUploadedImages, // Clean up unused images
  resetImageUpload, // Reset the upload state
} = useImageUpload(formData, handleImageChange);
```

## Props

| Prop    | Type     | Required | Default          | Description                                       |
| ------- | -------- | -------- | ---------------- | ------------------------------------------------- |
| isOpen  | Boolean  | Yes      | -                | Whether the modal is visible                      |
| onClose | Function | Yes      | -                | Callback when modal is closed                     |
| product | Object   | No       | null             | Product data to edit (null for new product)       |
| onSave  | Function | Yes      | -                | Callback when product is saved: (product) => void |
| title   | String   | No       | (Auto-generated) | Modal title text                                  |

## Image Management Integration

The ProductEditModal integrates with the ImageGallery components to provide a complete image management solution:

1. **Display existing product images** through the `ImageGalleryDisplay` component
2. **Upload new images** through the file input handler
3. **Select from previously uploaded images** through the `ImageGalleryModal`
4. **Set main product image** with the "Set as Main" button
5. **Delete unused images** automatically if the form is closed without saving
6. **Track newly uploaded images** to handle cleanup properly

## Error Handling

The component provides comprehensive error handling:

- Form validation errors with clear messaging
- API error handling with toast notifications
- Image upload error handling
- Automatic cleanup of unused images

## Unsaved Changes Protection

The modal includes protection against accidental data loss by:

1. Tracking changes to the form data
2. Opening a confirmation dialog when closing with unsaved changes
3. Allowing users to continue editing or confirm discarding changes

## Best Practices

When using the ProductEditModal and related hooks:

1. Use the `useProductManagement` hook for consistent product operations across different pages
2. Pass appropriate callbacks to reflect updates in the UI
3. Let the modal handle form state, validation, and image management internally
4. For custom extensions, access individual hooks as needed

## Troubleshooting

If you encounter issues with the ProductEditModal:

1. **Image uploads not showing**: Check for network errors in console and ensure proper file types
2. **Form validation errors**: Check the validation logic in useProductForm.js
3. **Product not saving**: Ensure the API endpoint is working and check console for errors
4. **Changes not detected**: Check that the form data is being properly tracked for dirty state
