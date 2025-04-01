# DescriptionBox Component

## Overview

The DescriptionBox component is a versatile and comprehensive product information display module for e-commerce applications. It provides two main tabs:

1. **Description Tab**: Displays detailed product information
2. **Reviews Tab**: Shows product reviews with filtering, sorting, and pagination capabilities

## Component Structure

```
descriptionBox/
├── components/
│   ├── DescriptionContent.jsx
│   ├── ReviewFilterStars.jsx
│   ├── ReviewItem.jsx
│   ├── ReviewModal.jsx
│   ├── ReviewsContent.jsx
│   └── ReviewStars.jsx
├── utils/
│   └── formatDate.js
├── DescriptionBox.jsx
├── DescriptionBox.css
└── README.md
```

## Features

### Description Tab

- Clean and organized display of product details
- Responsive layout for various screen sizes
- Customizable content structure

### Reviews Tab

- Display of latest reviews
- Review count indicator
- Review sorting options
- Star rating filters
- Review pagination
- Modal for viewing all reviews
- Loading states and error handling

## Usage

```jsx
import DescriptionBox from "./components/descriptionBox/DescriptionBox";

// Within your component
const ProductPage = ({ product }) => {
  return (
    <div className="product-page">
      {/* Other product components */}

      <DescriptionBox product={product} />

      {/* Other components */}
    </div>
  );
};
```

## Props

| Prop    | Type   | Description                                       |
| ------- | ------ | ------------------------------------------------- |
| product | Object | The product object containing details and reviews |

## Redux Integration

The component integrates with Redux to manage reviews state:

- `fetchInitialReviews`: Loads the initial set of reviews
- `fetchReviewCounts`: Gets the count of reviews by rating
- `resetReviewsState`: Resets the reviews state when product changes

## Sub-Components

### DescriptionContent

Displays the product description information.

### ReviewsContent

Renders the list of reviews and associated controls.

### ReviewModal

Provides a modal interface for viewing all reviews with filtering and sorting options.

### ReviewItem

Renders an individual review with user information, rating, and content.

### ReviewStars

Displays star ratings for reviews.

### ReviewFilterStars

Provides star-based filtering controls for reviews.

## Utilities

### formatDate

Formats review dates for consistent display.

## Styling

The component uses custom CSS for styling with responsive design considerations:

- Consistent color schemes
- Responsive layouts for different screen sizes
- Hover and active states for interactive elements
- Loading skeletons for better UX during data fetching

## Accessibility

The component implements various accessibility features:

- Semantic HTML structure
- Keyboard navigation support
- Proper ARIA attributes
- Focus management for the modal

## Requirements

- React
- Redux (with react-redux)
- CSS support
