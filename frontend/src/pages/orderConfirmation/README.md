# OrderConfirmation Component

A comprehensive order confirmation module for the e-commerce application that displays detailed information about a completed order, including order status, shipping details, payment information, and ordered items.

## Features

- Order details display with unique order ID
- Order status tracking
- Shipping information display
- Payment information summary
- Ordered items list with details
- Responsive layout design
- Loading and error state handling
- Navigation to order history and continue shopping

## Component Structure

```
orderConfirmation/
├── components/                  # Sub-components
│   ├── OrderHeader.jsx         # Displays order ID and date
│   ├── OrderItems.jsx          # Lists ordered products
│   ├── OrderStatus.jsx         # Shows order status
│   ├── OrderSummary.jsx        # Order totals and summary
│   ├── PaymentInfo.jsx         # Payment method details
│   ├── ShippingInfo.jsx        # Shipping address info
│   └── index.js               # Components export file
├── hooks/                      # Custom hooks
│   ├── useOrderDetails.js     # Order data fetching and management
│   └── index.js               # Hooks export file
├── styles/                     # Component styles
│   ├── Common.css             # Shared styles
│   ├── OrderHeader.css        # Header styles
│   ├── OrderItems.css         # Items list styles
│   ├── OrderStatus.css        # Status display styles
│   ├── OrderSummary.css       # Summary styles
│   ├── PaymentInfo.css        # Payment info styles
│   ├── ShippingInfo.css       # Shipping info styles
│   └── index.css              # Main stylesheet
├── utils/                      # Utility functions
│   └── formatters.js          # Data formatting utilities
└── OrderConfirmationPage.jsx  # Main component
```

## Usage

```jsx
import OrderConfirmationPage from "../pages/orderConfirmation/OrderConfirmationPage";
import { Route, Routes } from "react-router-dom";

// Inside your router component
const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/order-confirmation/:orderId"
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        }
      />
      {/* Other routes */}
    </Routes>
  );
};
```

## Order Information Display

### Order Header

- Order ID
- Order Date
- Breadcrumb navigation

### Order Summary

- Subtotal
- Shipping cost
- Taxes
- Total amount

### Shipping Information

- Recipient name
- Delivery address
- Contact information

### Payment Information

- Payment method
- Last 4 digits of card
- Transaction ID

### Order Items

- Product images
- Product names
- Quantities
- Individual prices
- Size/variant information

### Order Status

- Current status indicator
- Status history
- Estimated delivery date (if applicable)

## State Management

The component uses the following state management:

- `useOrderDetails`: Manages order data fetching and state
- Redux integration for cart error clearing
- URL state management for order details

## Error Handling

- Network request errors
- Order not found scenarios
- Loading state management
- Error state display with recovery options

## Navigation

The component provides navigation options:

- Back to order history
- Continue shopping
- Breadcrumb navigation path

## Related Components

- Checkout (previous step in order flow)
- OrderHistory (lists all user orders)
- Cart (cleared after successful order)
- Profile (contains order history)

## Props

### OrderConfirmationPage

- Receives order ID from URL parameters
- Optional order details from location state

### Order Object Structure

```javascript
{
  _id: String,           // Order ID
  createdAt: Date,       // Order creation date
  items: Array,          // Array of ordered items
  orderStatus: String,   // Current order status
  paymentInfo: Object,   // Payment details
  shippingInfo: Object,  // Shipping information
  totals: {
    subtotal: Number,    // Order subtotal
    shipping: Number,    // Shipping cost
    tax: Number,         // Tax amount
    total: Number        // Total amount
  }
}
```
