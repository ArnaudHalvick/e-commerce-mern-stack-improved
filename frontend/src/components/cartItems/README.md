# Cart Items Components

This directory contains the components related to the shopping cart functionality, providing a complete cart management experience for the e-commerce application.

## Component Structure

- `index.jsx`: The main CartItems component that provides the cart table interface and orchestrates all child components
- `components/`: Modular subcomponents for the cart
  - `CartItem.jsx`: Individual cart item row for the table view
  - `CartTotals.jsx`: Shows cart pricing details with subtotal, shipping, and total
  - `PromoCodeSection.jsx`: Allows users to enter and apply promotional codes
  - `EmailVerificationBanner.jsx`: Prompts unverified users to verify their email
  - `index.js`: Exports for cleaner imports from the components directory
- `hooks/`: Custom React hooks specific to cart functionality
  - `useCart.jsx`: Manages cart state and operations (add, remove, update quantity)
- `CartItems.css`: Comprehensive styles for all cart-related components

## Features

- **Responsive Design**: Adapts to various screen sizes for optimal viewing
- **Quantity Controls**: Users can adjust item quantities or remove items
- **Cart Totals**: Real-time calculation of cart subtotal, shipping, and final total
- **Empty State Handling**: Provides friendly UI when cart is empty
- **Loading State**: Shows spinner during data loading
- **Error Handling**: Graceful error display with recovery options
- **Email Verification**: Banner for users with unverified emails
- **Promotion Codes**: Interface for applying discount codes

## Usage

```jsx
import CartItems from "components/cartItems";

function CheckoutPage() {
  return (
    <div className="checkout-page">
      <h1>Your Cart</h1>
      <CartItems />
    </div>
  );
}
```

## Props Reference

### CartItem Component

- `item`: Object containing product details (id, name, price, image, quantity, etc.)
- `removeFromCart`: Function to remove item from cart
- `updateQuantity`: Function to change item quantity
- `showRemoveButton`: Boolean to control visibility of remove button (default: true)

### CartItems Component

Uses context and custom hooks internally, requiring no direct props.

## Styling

The component uses a comprehensive stylesheet (`CartItems.css`) with responsive breakpoints:

- Desktop: Full table view with side-by-side layout
- Tablet: Modified table with optimized controls
- Mobile: Card-style layout for better space utilization
