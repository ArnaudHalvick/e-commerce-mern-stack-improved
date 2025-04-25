# Description Box Module

This directory contains components for displaying product descriptions and reviews in a tabbed interface.

## Structure

```
descriptionBox/
├── components/              # Sub-components for description and reviews
│   ├── DescriptionContent.jsx  # Product description content
│   ├── ReviewsContent.jsx   # Reviews list container
│   ├── ReviewItem.jsx       # Individual review display
│   ├── ReviewModal.jsx      # Modal for submitting reviews
│   ├── ReviewStars.jsx      # Star rating display component
│   ├── ReviewFilterStars.jsx # Star filter for reviews
│   └── index.js             # Component exports
├── hooks/                   # Custom hooks for functionality
│   ├── useTabs.js           # Tab management hook
│   ├── useProductReviews.js # Review data fetching hook
│   └── index.js             # Hook exports
├── styles/                  # CSS styling
│   └── DescriptionBox.css   # Styles for the component
├── utils/                   # Utility functions
└── index.jsx                # Main component
```

## Components

### Main Component

#### `DescriptionBox`

A tabbed interface for product descriptions and reviews.

Features:

- Accessible tab navigation with keyboard support
- Seamless switching between description and reviews
- Review count display in tab header
- Integration with product reviews API

### Sub-Components

#### `DescriptionContent`

Displays the product description and specifications.

#### `ReviewsContent`

Container for product reviews with filtering capabilities.

#### `ReviewItem`

Individual review display with user info, rating, and content.

#### `ReviewModal`

Modal for submitting and editing product reviews.

#### `ReviewStars`

Star rating display component with customizable size.

#### `ReviewFilterStars`

Star filter component for filtering reviews by rating.

## Hooks

### `useTabs`

Custom hook for tab management:

- Tracks active tab state
- Handles tab switching
- Provides keyboard navigation support

### `useProductReviews`

Custom hook for product reviews:

- Fetches product reviews from API
- Handles loading and error states
- Calculates review counts and averages

## Usage

```jsx
import DescriptionBox from "../components/descriptionBox";

// In your product detail page
const ProductDetailPage = ({ product }) => {
  return (
    <div className="product-detail">
      {/* Product images, price, etc. */}

      {/* Description and reviews section */}
      <DescriptionBox product={product} />
    </div>
  );
};
```

## Accessibility

The component implements accessible tab pattern with:

- Proper ARIA roles and attributes
- Keyboard navigation
- Focus management
- Screen reader friendly structure
