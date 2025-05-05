# Product Component

A comprehensive product page module for the e-commerce application that displays detailed product information, description, and related products. The component handles product data fetching, display states, and navigation.

## Features

- Detailed product information display
- Product image gallery
- Size and quantity selection
- Add to cart functionality
- Product description section
- Related products recommendations
- Breadcrumb navigation
- Loading and error states
- Product not found handling
- URL-based navigation (product ID and slug)
- Automatic scroll positioning

## Component Structure

```
product/
├── components/                  # Sub-components
│   ├── ProductPageStatus.jsx   # Loading and error states
│   └── index.js               # Components export file
├── hooks/                      # Custom hooks
│   └── useProductData.jsx     # Product data fetching and state
└── index.jsx                  # Main product page component
```

## Usage

```jsx
import Product from "../pages/product";
import { Route, Routes } from "react-router-dom";

// Inside your router component
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/product/:productId/:productSlug" element={<Product />} />
      {/* Other routes */}
    </Routes>
  );
};
```

## Page Sections

### 1. Navigation

- Breadcrumb trail showing:
  - Home
  - Product category (if available)
  - Product name

### 2. Product Display

- Product image gallery
- Product name and price
- Size selection
- Quantity selection
- Add to cart button
- Loading states

### 3. Description Box

- Detailed product description
- Product features
- Material information
- Care instructions

### 4. Related Products

- Similar products suggestions
- Category-based recommendations
- Interactive product cards

## State Management

The component uses the following hooks for state management:

- `useProductData`: Main hook managing:
  - Product data fetching
  - Loading states
  - Error handling
  - URL parameter handling

## URL Structure

The product page uses a URL structure that includes both the product ID and a SEO-friendly slug:

```
/product/:productId/:productSlug
```

Example:

```
/product/123/blue-cotton-t-shirt
```

## Error Handling

- Network request errors
- Product not found scenarios
- Invalid URL parameters
- Loading state management
- Graceful fallbacks

## Props

### Product Object Structure

```typescript
interface Product {
  _id: string; // Product ID
  name: string; // Product name
  slug: string; // URL-friendly name
  description: string; // Product description
  price: number; // Product price
  category: string; // Product category
  images: string[]; // Array of image URLs
  sizes: string[]; // Available sizes
  mainImageIndex: number; // Index of main product image
  features?: string[]; // Optional product features
  materials?: string[]; // Optional material information
  care?: string[]; // Optional care instructions
}
```

## Related Components

The product page integrates with several shared components:

- `ProductDisplay`: Main product information display
- `DescriptionBox`: Product description section
- `RelatedProducts`: Similar products section
- `Breadcrumb`: Navigation breadcrumb
- `EmptyState`: Product not found display

## Scroll Behavior

The component implements automatic scroll behavior:

- Scrolls to product display on initial load
- Scrolls to product display on route changes
- Maintains scroll position when navigating related products

## Loading States

The component handles multiple loading scenarios:

- Initial product data loading
- Related products loading
- Image gallery loading
- Add to cart state

## Error States

Comprehensive error handling for:

- Network errors
- Invalid product IDs
- Missing product data
- Invalid parameters
- Server errors

## Development Notes

1. SEO Considerations:

   - Uses semantic HTML
   - Implements proper meta tags
   - URL includes SEO-friendly slug

2. Performance:

   - Lazy loading of images
   - Optimized data fetching
   - Efficient state management

3. Accessibility:
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
