# Checkout Component

A comprehensive checkout module for the e-commerce application that handles shipping information collection, payment processing, and order summary display.

## Features

- Shipping information collection and validation
- Payment processing with Stripe integration
- Real-time cart summary display
- Test card information for development
- Form validation and error handling
- Responsive layout design
- Loading state management

## Component Structure

```
checkout/
├── components/                    # Sub-components
│   ├── OrderSummary.jsx          # Displays cart items and total
│   ├── PaymentForm.jsx           # Stripe payment form integration
│   ├── ShippingForm.jsx          # Shipping information form
│   ├── TestCardInfo.jsx          # Test card details for development
│   └── index.js                  # Components export file
├── hooks/                        # Custom hooks
│   ├── useCardElementOptions.js  # Stripe Card Element configuration
│   ├── useCartSummary.js        # Cart data management
│   ├── useCheckoutSubmit.js     # Form submission handling
│   ├── useShippingInfo.js       # Shipping form state management
│   └── index.js                 # Hooks export file
├── styles/                       # Component styles
│   ├── CheckoutPage.css         # Main checkout page styles
│   ├── OrderSummary.css         # Order summary styles
│   ├── PaymentForm.css          # Payment form styles
│   ├── ShippingForm.css         # Shipping form styles
│   ├── TestCardInfo.css         # Test card info styles
│   └── index.js                 # Styles export file
└── CheckoutPage.jsx             # Main checkout component
```

## Usage

```jsx
import CheckoutPage from "../pages/checkout/CheckoutPage";
import { Route, Routes } from "react-router-dom";

// Inside your router component
const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      {/* Other routes */}
    </Routes>
  );
};
```

## Checkout Flow

1. **Cart Validation**: Verifies cart contents and calculates total
2. **Shipping Information**: User enters shipping details
3. **Payment Processing**: User enters payment information
4. **Order Confirmation**: Processes payment and confirms order

## Form Validation

### Shipping Information

- Required fields:
  - Full name
  - Address line 1
  - City
  - State/Province
  - Postal code
  - Country
- Optional fields:
  - Address line 2
  - Phone number

### Payment Information

- Credit card validation through Stripe
- Real-time card number formatting
- CVV and expiry date validation
- Support for multiple card types

## State Management

The checkout process uses several custom hooks for state management:

- `useShippingInfo`: Manages shipping form state and validation
- `useCartSummary`: Handles cart data fetching and calculations
- `useCheckoutSubmit`: Manages form submission and payment processing
- `useCardElementOptions`: Configures Stripe Card Element

## Error Handling

- Form-level validation errors
- Payment processing errors
- Network request errors
- Cart validation errors
- User feedback through error messages

## Development Testing

The component includes a TestCardInfo component displaying Stripe test card numbers for development:

- Test card numbers
- CVV codes
- Expiry dates
- Postal codes

## Related Components

- Cart (provides cart data)
- OrderConfirmation (displays after successful checkout)
- Profile (provides user data)
- AuthGuard (protects checkout route)
