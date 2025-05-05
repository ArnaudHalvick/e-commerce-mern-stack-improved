# Stripe Provider Component

A wrapper component that initializes and provides Stripe payment functionality throughout the e-commerce application using Stripe Elements and the official Stripe React library.

## Features

- Stripe Elements integration
- Environment-based configuration
- Error handling and fallback UI
- Custom font integration
- Performance optimized with React.memo
- Development environment support
- Graceful error states

## Component Structure

```
stripe/
├── StripeProvider.jsx    # Main provider component
└── StripeProvider.css    # Error state styling
```

## Usage

```jsx
import StripeProvider from "../stripe/StripeProvider";

// In your app's root component
const App = () => {
  return (
    <StripeProvider>
      {/* Your app components */}
      <CheckoutPage />
      <PaymentForm />
    </StripeProvider>
  );
};

// In your payment components
import { useStripe, useElements } from "@stripe/react-stripe-js";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  // Use stripe and elements here
};
```

## Environment Configuration

The component requires a Stripe publishable key to be set in your environment variables:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

Note: The environment variable MUST be prefixed with `REACT_APP_` to be accessible in React.

## Props

### StripeProvider

```typescript
interface StripeProviderProps {
  children: React.ReactNode; // Child components that need access to Stripe
}
```

## Stripe Configuration

### Default Options

```javascript
const defaultOptions = {
  fonts: [
    {
      cssSrc: "https://fonts.googleapis.com/css?family=Roboto:400,500,700",
    },
  ],
};
```

## Error Handling

The component includes built-in error handling for:

- Missing Stripe publishable key
- Stripe initialization failures
- Environment configuration issues

### Error UI

- Clear error messaging
- Environment information
- Debug details
- Styled error container

## Implementation Details

### Initialization

- Stripe is initialized outside the component to prevent re-initialization
- Uses `loadStripe` from `@stripe/stripe-js`
- Stripe promise is created once and reused

### Performance

- Wrapped in React.memo to prevent unnecessary re-renders
- Single instance of Stripe Elements
- Optimized error boundary

## Styling

The component includes styles for error states:

- Consistent error messaging
- Visual error indicators
- Responsive design
- Accessible color scheme

## Related Components

- PaymentForm (uses Stripe Elements)
- CheckoutPage (payment processing)
- OrderConfirmation (payment success)
- Cart (payment initiation)

## Development Guidelines

1. Environment Setup:

   ```bash
   # Development
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Production
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

2. Error Handling:

   ```jsx
   // Always check for stripe instance
   if (!stripe || !elements) {
     return <div>Loading payment system...</div>;
   }
   ```

3. Security Considerations:

   - Never log Stripe keys
   - Use test keys in development
   - Validate environment variables

4. Testing:
   - Use Stripe test cards
   - Test error scenarios
   - Verify environment setup

## Dependencies

- @stripe/stripe-js
- @stripe/react-stripe-js
- react
- react-dom

## Browser Support

Stripe Elements supports:

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- IE11+ (Limited support)
