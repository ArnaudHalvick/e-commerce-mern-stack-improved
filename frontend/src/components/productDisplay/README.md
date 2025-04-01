# ProductDisplay Component

A comprehensive product display component for e-commerce applications, featuring image gallery, product information, size selection, and quantity management.

## Features

- 🖼️ Interactive image gallery with thumbnail navigation
- 📝 Detailed product information display
- 👕 Size selection with validation
- 🔢 Quantity selector
- 🛒 Add to cart functionality
- 📱 Responsive design
- ♿ Accessibility-friendly

## Components Structure

### 1. Main Component (`index.jsx`)

The main container component that orchestrates all product display functionality:

- Manages product state and user interactions
- Coordinates between sub-components
- Handles add to cart operations

#### Props

```typescript
interface ProductDisplayProps {
  product: {
    images: string[];
    sizes: string[];
    // other product properties
  };
}
```

### 2. Sub-Components

Located in `/components` directory:

#### ImageGallery.jsx

- Displays product images in a gallery format
- Supports image navigation
- Thumbnail preview functionality

#### ProductInfo.jsx

- Renders product details
- Displays price, name, and description
- Handles product metadata presentation

#### SizeSelector.jsx

- Manages size selection
- Displays available sizes
- Handles size validation

#### QuantitySelector.jsx

- Controls product quantity
- Increment/decrement functionality
- Input validation

## Custom Hooks

Located in `/hooks` directory:

### useProductDisplay.jsx

Manages the product display logic:

- Size selection state
- Quantity management
- Cart operations
- Image gallery state
- Error handling

## Usage

```jsx
import ProductDisplay from "./components/productDisplay";

const MyComponent = () => {
  const product = {
    images: ["image1.jpg", "image2.jpg"],
    sizes: ["S", "M", "L", "XL"],
    name: "Product Name",
    price: 99.99,
    // ... other product data
  };

  return <ProductDisplay product={product} />;
};
```

## Styling

The component uses a dedicated CSS module (`ProductDisplay.css`) with:

- Responsive grid layout
- Image gallery animations
- Interactive UI elements
- Mobile-first design approach

## Features in Detail

### Image Gallery

- Large main image display
- Thumbnail navigation
- Smooth image transitions
- Touch-friendly navigation

### Size Selection

- Visual size options
- Error validation
- Selected state indication
- Required field validation

### Quantity Management

- Increment/decrement controls
- Direct input option
- Minimum/maximum validation
- Smooth value updates

### Add to Cart

- Loading state handling
- Error feedback
- Success confirmation
- Cart integration

## File Structure

```
productDisplay/
├── components/
│   ├── ImageGallery.jsx
│   ├── ProductInfo.jsx
│   ├── QuantitySelector.jsx
│   ├── SizeSelector.jsx
│   └── index.js
├── hooks/
│   └── useProductDisplay.jsx
├── index.jsx
├── ProductDisplay.css
└── README.md
```

## Dependencies

- React for UI components
- CSS modules for styling
- Context API for state management (optional)
- React Hooks for state and effects

## Best Practices

- Implements accessibility standards
- Uses semantic HTML
- Follows React best practices
- Implements error boundaries
- Provides loading states
- Handles edge cases
