# Pages

This directory contains the main page components for the e-commerce application. Each page is a composition of smaller components that together create a complete view.

## Structure

```
pages/
├── auth/                # Authentication pages
│   ├── components/      # Auth-specific components
│   ├── hooks/          # Auth-related hooks
│   └── styles/         # Auth page styling
├── cart/               # Shopping cart page
├── checkout/           # Checkout process
│   ├── components/     # Checkout components
│   ├── hooks/         # Checkout-related hooks
│   └── styles/        # Checkout styling
├── errorDemo/          # Error demonstration
├── notFound/           # 404 page
├── orderConfirmation/  # Order success page
│   ├── components/     # Confirmation components
│   ├── hooks/         # Order-related hooks
│   └── styles/        # Confirmation styling
├── orderHistory/       # Order history page
│   ├── components/     # History components
│   ├── hooks/         # History-related hooks
│   └── styles/        # History styling
├── product/           # Product detail page
│   ├── components/    # Product components
│   └── hooks/        # Product-related hooks
├── productListing/    # Product listing page
│   ├── components/    # Listing components
│   ├── hooks/        # Listing-related hooks
│   └── styles/       # Listing styling
├── profile/           # User profile page
│   ├── components/    # Profile components
│   ├── hooks/        # Profile-related hooks
│   └── styles/       # Profile styling
├── shop/              # Main shop page
└── verification/      # Email verification
    ├── components/    # Verification components
    ├── hooks/        # Verification hooks
    └── styles/       # Verification styling
```

## Core Pages

### Authentication Pages

```jsx
import { LoginPage, RegisterPage } from "../pages/auth";

const AuthRoutes = () => (
  <Switch>
    <Route path="/login" component={LoginPage} />
    <Route path="/register" component={RegisterPage} />
  </Switch>
);
```

Features:

- Login form
- Registration
- Password reset
- Social auth
- Form validation
- Error handling

### Product Pages

#### Product Listing

```jsx
import { ProductListingPage } from "../pages/productListing";

const ShopRoutes = () => (
  <Route
    path="/shop"
    render={(props) => (
      <ProductListingPage
        category={props.match.params.category}
        filters={queryParams}
      />
    )}
  />
);
```

Features:

- Product grid
- Filtering
- Sorting
- Pagination
- Search
- Category navigation

#### Product Detail

```jsx
import { ProductPage } from "../pages/product";

const ProductRoutes = () => (
  <Route
    path="/product/:id"
    render={(props) => <ProductPage productId={props.match.params.id} />}
  />
);
```

Features:

- Product images
- Description
- Reviews
- Related items
- Add to cart
- Size selection

### Checkout Flow

#### Cart Page

```jsx
import { CartPage } from "../pages/cart";

const Cart = () => (
  <CartPage
    onCheckout={handleCheckout}
    onUpdateQuantity={handleQuantityUpdate}
  />
);
```

Features:

- Cart items
- Quantity updates
- Remove items
- Price summary
- Checkout button
- Empty state

#### Checkout Page

```jsx
import { CheckoutPage } from "../pages/checkout";

const Checkout = () => (
  <CheckoutPage
    cart={cart}
    onPayment={handlePayment}
    onShippingSubmit={handleShipping}
  />
);
```

Features:

- Address form
- Payment integration
- Order summary
- Shipping options
- Coupon codes
- Order placement

#### Order Confirmation

```jsx
import { OrderConfirmationPage } from "../pages/orderConfirmation";

const OrderConfirmation = () => (
  <OrderConfirmationPage orderId={orderId} orderDetails={orderDetails} />
);
```

Features:

- Order summary
- Tracking info
- Email confirmation
- Continue shopping
- Order status

### User Account

#### Profile Page

```jsx
import { ProfilePage } from "../pages/profile";

const Profile = () => (
  <ProfilePage user={user} onUpdate={handleProfileUpdate} />
);
```

Features:

- Personal info
- Address book
- Password change
- Preferences
- Account deletion

#### Order History

```jsx
import { OrderHistoryPage } from "../pages/orderHistory";

const OrderHistory = () => (
  <OrderHistoryPage orders={orders} onOrderSelect={handleOrderSelect} />
);
```

Features:

- Order list
- Order details
- Reorder
- Track shipment
- Filter orders

## Page Composition

Example of how pages are composed:

```jsx
// pages/product/index.jsx
import { ProductDisplay } from "../../components/productDisplay";
import { RelatedProducts } from "../../components/relatedProducts";
import { useProduct } from "./hooks/useProduct";

const ProductPage = ({ productId }) => {
  const { product, loading, error } = useProduct(productId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="product-page">
      <ProductDisplay product={product} />
      <RelatedProducts productId={productId} />
    </div>
  );
};
```

## Development Guidelines

1. Page Structure:

   - Keep pages simple
   - Use components
   - Handle loading states
   - Manage errors
   - Implement SEO

2. Routing:

   - Use lazy loading
   - Protected routes
   - Route parameters
   - Query handling
   - Navigation guards

3. State Management:

   - Page-level state
   - Data fetching
   - Cache management
   - Form handling
   - Side effects

4. Performance:

   - Code splitting
   - Image optimization
   - Bundle size
   - Load time
   - Core metrics

5. Testing:
   - Integration tests
   - User flows
   - Edge cases
   - SEO validation
   - Performance tests

## Dependencies

- react
- react-router-dom
- react-query
- react-helmet
- @emotion/styled
