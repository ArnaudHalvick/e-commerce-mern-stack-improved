# Custom Hooks State Management Documentation

## Overview

This directory contains custom React hooks that provide a unified interface for state management in our e-commerce application. The hooks are designed to abstract away the complexities of Redux while providing a clean, intuitive API for components to interact with application state.

## Available Hooks

### useAuth

Manages user authentication state including:

- Login/signup functionality
- User profile management
- Authentication status
- Token management

### useProducts

Handles all product-related state including:

- Fetching product listings
- Product filtering and sorting
- Product search
- Category management

### useCart

Manages the shopping cart including:

- Adding items to cart
- Removing items from cart
- Updating item quantities
- Cart totals calculation
- Cart persistence via API

## Usage Guidelines

### Component Integration

To use these hooks in your components:

```jsx
import { useAuth, useProducts, useCart } from '../hooks/state';

const MyComponent = () => {
  const { isAuthenticated, user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const {
    items,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity
  } = useCart();

  // Component logic
  // ...

  return (
    // JSX
  );
};
```

### Best Practices

1. **Use the Appropriate Hook**: Choose the most specific hook for your needs. For example, use `useCart` for cart operations rather than accessing Redux state directly.

2. **Optimize Renders**: Our hooks are optimized to minimize re-renders, but be mindful of which values you destructure from them. Only extract the specific values your component needs.

3. **Handle Loading States**: All data-fetching hooks provide loading state indicators. Use these to show appropriate loading UI.

4. **Error Handling**: Use the error states provided by the hooks to handle error scenarios gracefully.

5. **Testing**: When testing components that use these hooks, consider using mocks for the hooks to isolate component behavior.

## Migration from Context

This hooks-based approach replaces our previous Context-based state management. Key improvements include:

- **Reduced Boilerplate**: No need for context providers or consumers
- **Simpler Testing**: Hooks are easier to mock than context providers
- **Better Performance**: Finer-grained control over renders
- **Improved Developer Experience**: More intuitive API

## Example: Cart Management

### Before (with Context):

```jsx
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

const CartComponent = () => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);

  // Component logic
};
```

### After (with Hooks):

```jsx
import { useCart } from "../../hooks/state";

const CartComponent = () => {
  const { items, addItem, removeItem } = useCart();

  // Component logic
};
```

## Testing

For testing components that use these hooks, you can use the test components in the `/hooks/test` directory:

- `HookTestComponent.jsx`: Tests authentication hooks
- `ProductHookTest.jsx`: Tests product hooks
- `CartHookTest.jsx`: Tests cart hooks

These components provide UI for manually testing all hook functionality.
