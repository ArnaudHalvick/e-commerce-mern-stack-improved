# ProductEditModal Component

## Overview

The ProductEditModal is a comprehensive, reusable modal component for creating and editing product information in the admin dashboard. It provides a complete form interface for all product data, including basic information, pricing, categorization, and image management.

## Refactoring Journey

This component began as a monolithic implementation with a single JSX file (ProductEditModal.jsx) and a single CSS file (ProductEditModal.css). Through extensive refactoring, it has been transformed into a modular, maintainable architecture with:

- Clear separation of concerns
- Component decomposition
- Extracted business logic into custom hooks
- Centralized styling
- Improved readability and maintainability

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
│   └── useProductForm.js - Hook for form state management
├── styles/
│   └── common.css - Common styles shared across all components
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

## Design Approach

The component has been split into smaller, more maintainable parts:

1. **Custom Hooks**: Separate business logic from UI components

   - `useProductForm`: Manages form state and validation
   - `useImageUpload`: Handles image upload and management
   - `useFormValidation`: Manages form submission and validation
   - `useModalManagement`: Handles modal state and confirmation

2. **Component Composition**: UI broken down into smaller, focused components

   - `BasicInfoFields`: Handles name and descriptions
   - `CategorySection`: Manages category and availability
   - `PriceSection`: Manages pricing information
   - `AttributesSection`: Handles sizes, tags, and types
   - `ImageSection`: Manages image uploads and selection
   - `ConfirmationModal`: Handles unsaved changes confirmation

3. **CSS Organization**:
   - All styles are consolidated in a single `common.css` file in the styles folder
   - CSS classes follow a consistent naming convention with the `product-edit-modal-` prefix
   - Components import styles from the central CSS file

This modular approach makes the code more maintainable, testable, and easier to understand.

## Refactoring Benefits

The refactoring of this component has yielded several important benefits:

1. **Improved Readability**: Each component and hook has a single responsibility
2. **Enhanced Maintainability**: Easier to update, fix bugs, and extend functionality
3. **Better Testability**: Smaller, focused components and isolated logic are easier to test
4. **Reusable Patterns**: The patterns used can be applied to other complex components
5. **Consistent Styling**: Centralized CSS with predictable, scoped class names
6. **Reduced Cognitive Load**: Developers can focus on smaller, manageable pieces of code

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
