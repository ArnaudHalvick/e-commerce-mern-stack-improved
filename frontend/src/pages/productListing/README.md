# ProductListing Component

A comprehensive product listing module for the e-commerce application that handles both category-based product displays and the main shop/offers page. The component includes advanced filtering, sorting, and pagination capabilities.

## Features

- Unified product listing for both category and shop pages
- Advanced filtering system:
  - Category filter (shop page only)
  - Price range filter
  - Tag-based filtering
  - Discount filter
  - Type/style filter
- Dynamic sorting options
- Responsive grid layout
- Pagination with customizable items per page
- URL-based state management
- Loading and error states
- SEO-friendly metadata
- Breadcrumb navigation

## Component Structure

```
productListing/
├── components/                     # Sub-components
│   ├── PageHeader.jsx             # Page title and banner
│   ├── ProductsContent.jsx        # Main products grid
│   └── index.js                   # Components export file
├── hooks/                         # Custom hooks
│   ├── useProductListingData.jsx  # Data and state management
│   └── index.js                   # Hooks export file
├── styles/                        # Component styles
│   ├── PageHeader.css            # Header styles
│   ├── ProductListingPage.css    # Main page styles
│   ├── ProductsContent.css       # Grid layout styles
│   └── index.css                 # Style exports
├── ProductListingPage.jsx         # Main component
└── index.js                      # Module exports
```

## Usage

```jsx
import ProductListingPage from "../pages/productListing";
import { Route, Routes } from "react-router-dom";

// Inside your router component
const AppRouter = () => {
  return (
    <Routes>
      {/* Shop/Offers page */}
      <Route path="/shop" element={<ProductListingPage pageType="offers" />} />

      {/* Category page */}
      <Route
        path="/category/:category"
        element={
          <ProductListingPage
            pageType="category"
            banner="/path/to/banner.jpg"
          />
        }
      />
    </Routes>
  );
};
```

## Props

### ProductListingPage

```typescript
interface ProductListingPageProps {
  pageType: "offers" | "category"; // Type of listing page
  category?: string; // Category name (for category pages)
  banner?: string; // Banner image URL (for category pages)
}
```

## State Management

The component uses `useProductListingData` hook for comprehensive state management:

### Data Management

- Product data fetching
- Filter state
- Sort state
- Pagination state
- Loading states
- Error handling

### URL State Sync

- Filter state synced with URL parameters
- Category from URL parameters
- Discount filter in URL query
- Maintains shareable URLs

## Filtering System

### Available Filters

- Category (shop page only)
- Price range
- Tags
- Product type
- Discount availability
- Size availability

### Filter Features

- Multiple simultaneous filters
- Clear individual filters
- Clear all filters
- Filter count display
- Available options display

## Sorting Options

- Price (low to high)
- Price (high to low)
- Newest first
- Popular first
- Featured items

## Grid Layout

- Responsive grid system
- Adjustable items per row
- Proper spacing and alignment
- Image aspect ratio maintenance
- Loading placeholder support

## Error Handling

- Network request errors
- Invalid filter combinations
- No results handling
- Loading state management
- Error recovery options

## Performance Optimizations

1. Loading State:

   - Delayed loading indicator
   - Prevents UI flickering
   - Smooth transitions

2. Data Management:

   - Efficient filter updates
   - Debounced search
   - Pagination optimization

3. URL Management:
   - Clean URL structure
   - History state management
   - No unnecessary reloads

## SEO Considerations

- Dynamic page titles
- Meta descriptions
- Proper heading hierarchy
- Semantic HTML
- Clean URL structure

## Related Components

- FilterSidebar (filter controls)
- Breadcrumb (navigation)
- ProductCard (grid items)
- Pagination (page controls)
- LoadingState (loading UI)
- ErrorState (error handling)

## Development Guidelines

1. Filter Updates:

   - Use `handleFilterChange` for regular filters
   - Use `handleDiscountFilterChange` for discount filter
   - Use `handleClearAll` to reset all filters

2. URL Management:

   - Use `window.history.replaceState` for URL updates
   - Maintain URL parameters during navigation
   - Sync URL state with filter state

3. Accessibility:
   - ARIA labels
   - Keyboard navigation
   - Focus management
   - Screen reader support
