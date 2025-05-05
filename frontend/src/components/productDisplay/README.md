# ProductDisplay Component

A comprehensive product display component for the e-commerce application that shows detailed product information and purchase options.

## Features

- Interactive image gallery with thumbnail navigation
- Product information display (name, price, category, description)
- Size selection with validation
- Quantity selection
- Add to cart functionality with authentication check

## Component Structure

```
productDisplay/
├── components/              # Sub-components
│   ├── AddToCartButton.jsx  # Button for adding product to cart
│   ├── ImageGallery.jsx     # Image gallery with thumbnails
│   ├── ProductInfo.jsx      # Product details display
│   ├── QuantitySelector.jsx # Quantity input control
│   ├── SizeSelector.jsx     # Size selection component
│   └── index.js             # Components export file
├── hooks/                   # Custom hooks
│   ├── useProductDisplay.jsx # Main business logic
│   ├── useProductId.js      # Hook for product ID reference
│   └── index.js             # Hooks export file
├── styles/                  # Component styles
│   ├── base/                # Base styles
│   ├── components/          # Component-specific styles
│   └── index.css            # Main stylesheet
├── utils/                   # Utility functions
│   ├── imageHelpers.js      # Image processing utilities
│   └── index.js             # Utils export file
└── index.jsx                # Main component
```

## Usage

```jsx
import ProductDisplay from "../components/productDisplay";

// Inside your component
const MyProductPage = ({ product }) => {
  return (
    <div className="product-page">
      <ProductDisplay product={product} />
    </div>
  );
};
```

## Props

| Prop    | Type   | Description                                                              |
| ------- | ------ | ------------------------------------------------------------------------ |
| product | Object | The product data object containing all necessary information for display |

### Product Object Structure

```javascript
{
  _id: String,          // Unique product identifier
  name: String,         // Product name
  price: Number,        // Product price
  category: String,     // Product category
  description: String,  // Product description
  sizes: Array,         // Available sizes
  images: Array,        // Array of image URLs
  mainImageIndex: Number // Index of the main image (optional)
}
```

## Functionality

- **Image Gallery**: Users can navigate through product images using thumbnails or arrow controls
- **Size Selection**: Users must select a valid size before adding to cart
- **Quantity Selection**: Users can adjust the quantity of items to add
- **Add to Cart**: Adds the product to the user's cart (requires authentication)

## Dependencies

- React
- Redux (for cart state management)
- Authentication hooks

## Related Components

- Cart
- Shop
- Product Listing
