# Stripe Payment Integration

This document outlines how the Stripe payment integration works in our e-commerce application.

## Overview

The payment system uses Stripe to securely process credit card payments. The integration follows these steps:

1. The frontend collects shipping information and requests a payment intent from the backend
2. The backend creates a Stripe payment intent and returns the client secret
3. The frontend uses the client secret with Stripe Elements to collect card details securely
4. After payment is successful, the frontend confirms the order with the backend
5. The backend verifies the payment with Stripe and creates an order in the database
6. Webhook events from Stripe provide a fallback mechanism if client-side confirmation fails

## API Endpoints

### Create Payment Intent

```
POST /api/payment/create-payment-intent
```

**Request Body:**

```json
{
  "shippingInfo": {
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "country": "US",
    "postalCode": "12345",
    "phoneNumber": "555-123-4567"
  }
}
```

**Response:**

```json
{
  "success": true,
  "clientSecret": "pi_xyz_secret_abc",
  "amount": 150.75,
  "subtotal": 135.0,
  "taxAmount": 9.45,
  "shippingAmount": 6.3
}
```

### Confirm Order

```
POST /api/payment/confirm-order

To confirm a payment succeeded with CLI, use this command : stripe payment_intents confirm PAYMENT_ID --payment-method pm_card_visa
EXAMPLE : stripe payment_intents confirm pi_3R6wg0P4vWrJMwjY1n36qBPD --payment-method pm_card_visa
```

**Request Body:**

```json
{
  "paymentIntentId": "pi_xyz123",
  "shippingInfo": {
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "country": "US",
    "postalCode": "12345",
    "phoneNumber": "555-123-4567"
  }
}
```

**Response:**

```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "user": "user_id",
    "items": [...],
    "shippingInfo": {...},
    "paymentInfo": {...},
    "totalAmount": 150.75,
    "orderStatus": "Processing",
    "paidAt": "2023-06-15T10:30:00.000Z",
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:30:00.000Z"
  }
}
```

### Get User Orders

```
GET /api/payment/my-orders
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "orders": [
    {
      "_id": "order_id_1",
      "user": "user_id",
      "items": [...],
      "totalAmount": 150.75,
      "orderStatus": "Processing",
      "createdAt": "2023-06-15T10:30:00.000Z"
    },
    {
      "_id": "order_id_2",
      "user": "user_id",
      "items": [...],
      "totalAmount": 89.95,
      "orderStatus": "Shipped",
      "createdAt": "2023-06-10T14:22:00.000Z"
    }
  ]
}
```

### Get Single Order

```
GET /api/payment/order/:id
```

**Response:**

```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "user": "user_id",
    "items": [...],
    "shippingInfo": {...},
    "paymentInfo": {...},
    "totalAmount": 150.75,
    "orderStatus": "Processing",
    "paidAt": "2023-06-15T10:30:00.000Z",
    "createdAt": "2023-06-15T10:30:00.000Z",
    "updatedAt": "2023-06-15T10:30:00.000Z"
  }
}
```

## Webhooks

Stripe webhooks are used to ensure payment events are properly processed even if there are connectivity issues with the client. The webhook endpoint is:

```
POST /api/payment/webhook
```

For development, use the Stripe CLI to forward webhook events to your local server:

```
# From the backend directory
npm run webhook

# OR from the frontend directory
npm run stripe
```

Both scripts forward webhooks to the correct endpoint: `http://localhost:4000/api/payment/webhook`

### Webhook Processing

The webhook handler processes these event types:

1. `payment_intent.succeeded` - Creates an order if one doesn't already exist
2. `payment_intent.payment_failed` - Logs payment failures
3. `charge.succeeded` - Logs successful charges
4. `charge.failed` - Logs failed charges
5. `charge.refunded` - Updates order status to Cancelled

### Fallback Order Creation

The webhook system acts as a fallback mechanism. If the frontend successfully processes the payment but fails to confirm the order (due to network errors, browser crashes, etc.), the webhook handler will create the order when it receives the `payment_intent.succeeded` event from Stripe.

## Error Handling and Recovery

The payment system includes these safeguards:

1. **Duplicate Order Prevention**: Both direct and webhook order creation check for existing orders with the same payment intent ID to avoid duplicates.

2. **Transaction Rollback**: Database operations use MongoDB transactions to ensure atomicity. If any part of the order creation fails, the transaction is rolled back.

3. **Metadata Backup**: The payment intent stores user ID and shipping information in its metadata, so the webhook can create an order even if client-side confirmation fails.

4. **Idempotent Processing**: All operations are designed to be idempotent, meaning they can be safely retried without causing duplicate effects.

## Testing

For testing, you can use Stripe's test card numbers:

- Successful payment: 4242 4242 4242 4242
- Requires authentication: 4000 0025 0000 3155
- Payment failed: 4000 0000 0000 9995

Expiration date can be any future date, and any 3-digit CVC.

## Security Considerations

- All payment processing occurs on the backend
- Sensitive card details never touch our server - they're handled directly by Stripe
- The webhook endpoint verifies the Stripe signature to prevent unauthorized access
- All API endpoints except the webhook are protected by authentication

## Frontend Integration

For frontend integration, use the Stripe React components:

```javascript
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe outside component to avoid recreating on renders
const stripePromise = loadStripe(
  "pk_test_51POLLYP4vWrJMwjYSab2mjfjTHapAaoMKrHderrbS8aOyuykkduvF0sPdBB6VpulZCmMxGfRd3NpmGHFE3D9RAEK0038a5wjiI"
);

function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/payment/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingInfo: {
          /* shipping details */
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  return (
    <div>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
```

Refer to the Stripe documentation for more details on implementing the frontend components.
