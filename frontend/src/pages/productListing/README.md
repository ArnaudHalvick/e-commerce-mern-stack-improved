# Product Listing Page Component

A unified component for displaying product listings for both category pages and special offers.

## Features

- Supports both category-specific product listings and special offers
- Conditionally renders category filter based on page type
- Uses flex layout with wrap for responsive product grid
- Implements sorting, filtering, and pagination
- Optimized with memoization to prevent unnecessary re-renders
- Fully accessible with keyboard navigation and ARIA attributes

## Usage

```jsx
// For a category page (e.g., Men's clothing)
<ProductListingPage
  pageType="category"
  category="men"
  banner="/path/to/banner-image.jpg"
/>

// For the special offers page
<ProductListingPage pageType="offers" />
```

## Props

- `pageType` (string, required): Type of page - either "offers" or "category"
- `category` (string, optional): Category name (required for category pages)
- `banner` (string, optional): URL for banner image (optional for category pages)

## Component Structure

```
/productListing
  ├── ProductListingPage.jsx - Main component
  ├── ProductListingPage.css - Styles
  ├── index.js - Entry point
  ├── /components
  │    ├── PageHeader.jsx - Conditional header based on page type
  │    ├── ProductsContent.jsx - Products grid with filter controls
  │    └── index.js - Components export
  └── /hooks
       ├── useProductListingData.jsx - Data fetching and state management
       └── index.js - Hooks export
```

## Styling

All CSS classes use the prefix `product-listing-` to avoid conflicts with other components.
The component is fully responsive and adapts to different screen sizes.
