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
  - Edit product details through a modal interface
  - Toggle product availability (activate/deactivate)
  - Delete products with confirmation
- **Error Handling**: Graceful error displays with retry options
- **Loading States**: Visual feedback during data loading

## Component Structure

```
listProduct/
├── components/
│   ├── ImageGalleryModal.jsx  - Modal for viewing product images
│   ├── ListProductEditModal.jsx - Modal for editing product details
│   └── ListProductTable.jsx - Table component for product listing
├── hooks/
│   └── useProductList.js - Custom hook for product data operations
├── styles/
│   └── ListProduct.css - Component styling
├── ListProduct.jsx - Main component implementation
├── index.jsx - Component exports
└── README.md - This documentation
```

## Usage

Import and use the ListProduct component in your admin routes:

```jsx
import ListProduct from "./components/listProduct";

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

### Main Component (ListProduct.jsx)

The main component handles state management for:

- Product listing and filtering
- Edit modal visibility
- Search and filter states
- Sorting preferences

### Data Management (useProductList.js)

Custom hook that provides:

- Product data fetching
- Update operations
- Delete functionality
- Availability toggling
- Loading and error states

### UI Components

- **ListProductTable**: Displays products with sorting and action buttons
- **ListProductEditModal**: Form interface for updating product information
- **ImageGalleryModal**: Allows viewing and managing product images

## Dependencies

- React
- UI components (Button, Input, Select)
- Toast notifications for user feedback

## Performance Considerations

The component implements optimistic UI updates for a responsive feel while maintaining data integrity with actual server responses.
