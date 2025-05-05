# Stripe Integration

This directory contains the Stripe payment integration setup for the e-commerce application.

## Structure

```
stripe/
├── config.js            # Stripe configuration and setup
├── hooks/
│   ├── useStripe.js    # Custom hook for Stripe operations
│   └── useElements.js  # Hook for Stripe Elements
├── components/
│   ├── CardElement.js  # Credit card input component
│   └── PaymentForm.js  # Payment form wrapper
└── utils/
    ├── validation.js   # Payment-specific validation
    └── formatting.js   # Payment data formatting
```

## Configuration

`config.js` contains Stripe setup and configuration:

```javascript
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with public key
export const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY
);

// Stripe configuration options
export const stripeConfig = {
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: "#0570de",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "Ideal Sans, system-ui, sans-serif",
      borderRadius: "4px",
    },
  },
  locale: "auto",
};
```

## Custom Hooks

### useStripe

Manages Stripe payment operations:

```javascript
const {
  createPaymentIntent,
  handleCardPayment,
  confirmPayment,
  paymentStatus,
  error,
} = useStripe({
  amount,
  currency: "usd",
});
```

Features:

- Payment intent creation
- Card payment processing
- Payment confirmation
- Error handling
- Loading states

### useElements

Manages Stripe Elements:

```javascript
const { elements, cardElement, isComplete, error } = useElements();
```

Features:

- Elements initialization
- Card element management
- Validation state
- Error handling

## Components

### CardElement

Stripe card input component:

```jsx
import { CardElement } from "./components/CardElement";

const PaymentForm = () => {
  return (
    <form>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
    </form>
  );
};
```

### PaymentForm

Payment form wrapper component:

```jsx
import { PaymentForm } from "./components/PaymentForm";

const Checkout = () => {
  const handlePayment = async (paymentMethod) => {
    // Process payment
  };

  return (
    <PaymentForm amount={total} onPayment={handlePayment} currency="usd" />
  );
};
```

## Usage Guidelines

### Basic Payment Flow

```javascript
import { useStripe, useElements } from "../stripe/hooks";
import { CardElement, PaymentForm } from "../stripe/components";

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error("[error]", error);
    } else {
      // Process payment with backend
      await processPayment(paymentMethod.id);
    }
  };

  return (
    <PaymentForm onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay</button>
    </PaymentForm>
  );
};
```

### Error Handling

```javascript
const handlePaymentError = (error) => {
  switch (error.type) {
    case "card_error":
      // Handle invalid card details
      break;
    case "validation_error":
      // Handle validation errors
      break;
    case "api_error":
      // Handle API errors
      break;
    default:
    // Handle other errors
  }
};
```

## Development Guidelines

1. Security:

   - Never log sensitive card data
   - Use HTTPS endpoints
   - Validate on server-side
   - Follow PCI compliance
   - Handle errors securely

2. User Experience:

   - Show loading states
   - Provide clear errors
   - Validate in real-time
   - Support autofill
   - Handle network issues

3. Testing:

   - Use test API keys
   - Test card numbers
   - Error scenarios
   - Payment flows
   - Mobile testing

4. Performance:
   - Lazy load Stripe.js
   - Optimize form submission
   - Handle timeouts
   - Cache payment methods
   - Monitor metrics

## Environment Setup

Required environment variables:

```env
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_STRIPE_SECRET_KEY=sk_test_...  # Server-side only
```

## Testing Cards

Test card numbers for development:

```javascript
const TEST_CARDS = {
  success: "4242 4242 4242 4242",
  decline: "4000 0000 0000 0002",
  insufficient: "4000 0000 0000 9995",
  error: "4000 0000 0000 0127",
};
```

## Dependencies

- @stripe/stripe-js
- @stripe/react-stripe-js
