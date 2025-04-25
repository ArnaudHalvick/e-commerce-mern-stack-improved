# Cart Items Module

This directory contains components for displaying and managing the shopping cart.

## Structure

```
cartItems/
├── components/               # Sub-components for the cart
│   ├── CartItem.jsx          # Individual cart item row
│   ├── CartTotals.jsx        # Cart subtotal, shipping, taxes, and total
│   ├── EmailVerificationBanner.jsx  # Banner for unverified users
│   ├── PromoCodeSection.jsx  # Promo code input and validation
│   └── index.js              # Component exports
├── hooks/                    # Custom hooks for cart functionality
│   ├── useCart.jsx           # Cart management logic
│   └── index.js              # Hook exports
├── styles/                   # CSS styling for cart components
│   ├── CartItem.css          # Styles for cart items
│   ├── CartItems.css         # Main cart container styles
│   ├── CartTotals.css        # Styles for totals display
│   ├── EmailVerificationBanner.css  # Styles for verification banner
│   ├── PromoCodeSection.css  # Styles for promo code section
│   └── index.js              # Style exports
└── index.jsx                 # Main cart component
```

## Components

### Main Component

#### `CartItems`

The main cart display component that renders the complete shopping cart interface.

Features:

- Responsive cart table with product details
- Quantity adjustment controls
- Price calculations and totals
- Empty cart state handling
- Loading and error states
- Email verification banner for unverified users

### Sub-Components

#### `CartItem`

Individual row in the cart table for a specific product.

#### `CartTotals`

Displays subtotal, shipping costs, taxes, and final total.

#### `PromoCodeSection`

Allows users to enter and apply promotion codes.

#### `EmailVerificationBanner`

Notification for users who need to verify their email.

## Hooks

### `useCart`

Custom hook that provides cart management functionality:

- Add items to cart
- Remove items
- Update quantities
- Calculate totals
- Handle loading states
- Manage errors

## Usage

```jsx
import CartItems from "../components/cartItems";

// In your page component
const ShoppingCartPage = () => {
  return (
    <div className="shopping-cart-page">
      <h1>Your Shopping Cart</h1>
      <CartItems />
    </div>
  );
};
```

## Integration

This module integrates with:

- Authentication system via `useAuth`
- Global cart state via `useCart`
- Error handling system for empty states and errors
- UI components for loading indicators
