# ListProduct Component

## Overview

The ListProduct component is a comprehensive product management interface for the admin dashboard. It provides administrators with the ability to view, search, filter, sort, edit, and delete products in the e-commerce catalog.

## Features

- **Product Listing**: Display all products in a tabular format with key information
- **Filtering**: Filter products by:
  - Text search (product name or ID)
  - Category
  - Status (active/inactive)
  - Discount (discounted/regular price items)
- **Sorting**: Sort products by:
  - Name
  - ID
  - Date added
  - Category
  - Price
  - Status
- **Product Management**:
  - Edit product details through the reusable ProductEditModal component
  - Toggle product availability (activate/deactivate)
  - Delete products with confirmation
- **Error Handling**: Graceful error displays with retry options
- **Loading States**: Visual feedback during data loading

## Component Structure

```
listProduct/
├── components/
│   ├── ListProduct.jsx - Main component implementation
│   └── ListProductTable.jsx - Table component for product listing
├── hooks/
│   ├── useProductList.js - Custom hook for product data operations
│   ├── useProductFilters.js - Custom hook for filtering and sorting
│   └── useProductActions.js - Custom hook for product CRUD actions
├── styles/
│   └── ListProduct.css - Component styling
├── index.jsx - Component exports
└── README.md - This documentation
```

## Usage

Import and use the ListProduct component in your admin routes:

```jsx
import ListProduct from "./pages/listProduct";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <ListProduct />
    </div>
  );
};
```

## Core Functionality

### Main Component (components/ListProduct.jsx)

The main component composes multiple custom hooks to provide a clean, readable UI component that:

- Displays the product listing interface
- Manages the UI for filtering, sorting, and interactions
- Coordinates between data fetching, filtering, and actions

### Custom Hooks

#### Data Management (useProductList.js)

Custom hook that provides:

- Product data fetching
- Update operations
- Delete functionality
- Availability toggling
- Loading and error states

#### Filtering and Sorting (useProductFilters.js)

Custom hook that provides:

- Search and filter state management
- Filter application logic
- Sorting mechanisms
- Category extraction
- Filtered product list

#### Product Actions (useProductActions.js)

Custom hook that provides:

- Edit modal visibility management
- Product selection state
- Handler functions for edit, save, delete and availability toggle
- Toast notification integration

### UI Components

- **ListProductTable**: Displays products with sorting and action buttons
- **Reusable Components**:
  - ProductEditModal from `/components/productEditModal` for updating product information
  - ImageGallery from `/components/imageGallery` for managing product images

## Dependencies

- React
- UI components (Button, Input, Select)
- Toast notifications for user feedback
- ProductEditModal from shared components
- ImageGallery from shared components

## Performance Considerations

The component implements:

- Optimistic UI updates for a responsive feel while maintaining data integrity with actual server responses
- Memoization via useMemo for expensive operations
- Clean separation of concerns with custom hooks

## Recent Refactoring

### Latest Component Structure Refactoring

The component structure has been refactored to follow React best practices:

1. **Proper Component Organization**: Moved UI component to the components folder
2. **Custom Hooks Extraction**: Separated business logic into dedicated hooks:
   - `useProductFilters` for filtering and sorting functionality
   - `useProductActions` for product management actions
3. **Separation of Concerns**: Each hook has a single responsibility and provides a clean API
4. **Improved Maintainability**: Easier to understand, test, and extend each part of the functionality

### Recent UI Component Refactoring

The product editing functionality and image management has been moved to reusable components:

1. **ProductEditModal**: Handles all product editing functionality including form validation and submission
2. **ImageGallery**: Manages product image uploading, selection, and arrangement

### Code Structure Improvements

The ListProduct component has been refactored to improve code organization and readability:

1. **Extracted Filter Logic**: Separated filter logic into dedicated functions
2. **Improved Sorting**: Extracted sorting logic into a standalone function
3. **Early Returns**: Implemented early returns for cleaner conditional logic
4. **Cleaner Function Structure**: Improved function structure and documentation with JSDoc comments
5. **Better Readability**: Enhanced code readability with more declarative function names and structure

These improvements make the component more maintainable, easier to understand for new developers, and more modular for future enhancements.
