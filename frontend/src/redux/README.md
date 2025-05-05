# Redux State Management

A comprehensive Redux implementation for the e-commerce application using Redux Toolkit. This setup manages global state for user authentication, shopping cart, product reviews, and error handling.

## Features

- Centralized state management
- Redux Toolkit implementation
- Async thunk actions
- Automatic error handling
- Toast notifications system
- Authentication state persistence
- Shopping cart management
- Reviews management
- Global error handling

## Structure

```
redux/
├── slices/                     # Feature slices
│   ├── userSlice.js           # User authentication and profile
│   ├── cartSlice.js           # Shopping cart management
│   ├── reviewsSlice.js        # Product reviews
│   └── errorSlice.js          # Error and toast notifications
└── store.js                   # Store configuration
```

## Store Configuration

```javascript
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    reviews: reviewsReducer,
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
```

## Feature Slices

### User Slice

Manages authentication and user profile:

```typescript
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
}
```

### Cart Slice

Handles shopping cart operations:

```typescript
interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;
  itemCount: number;
}
```

### Reviews Slice

Manages product reviews:

```typescript
interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  userReview: Review | null;
}
```

### Error Slice

Handles global errors and notifications:

```typescript
interface ErrorState {
  toasts: Toast[];
  globalError: string | null;
}
```

## Usage

### Store Setup

```jsx
import { Provider } from "react-redux";
import store from "./redux/store";

const App = () => {
  return (
    <Provider store={store}>
      <YourApp />
    </Provider>
  );
};
```

### Using in Components

```jsx
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "./redux/slices/cartSlice";

const Component = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
  };
};
```

## Error Handling

### Toast Notifications

```javascript
// Show different types of notifications
dispatch(showError("Error message"));
dispatch(showSuccess("Success message"));
dispatch(showWarning("Warning message"));
dispatch(showInfo("Info message"));
```

### Global Error

```javascript
// Set global error
dispatch(setGlobalError("Something went wrong"));

// Clear global error
dispatch(clearGlobalError());
```

## Authentication Flow

1. Initial Check:

```javascript
const initializeAuthState = () => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    store.dispatch(verifyToken());
  }
};
```

2. Login/Signup:

```javascript
dispatch(loginUser(credentials));
dispatch(registerUser(userData));
```

3. Logout:

```javascript
dispatch(logoutUser());
```

## Cart Management

1. Add Item:

```javascript
dispatch(addToCart({ productId, quantity, size }));
```

2. Update Item:

```javascript
dispatch(updateCartItem({ itemId, quantity }));
```

3. Remove Item:

```javascript
dispatch(removeFromCart(itemId));
```

## Reviews Management

1. Add Review:

```javascript
dispatch(addReview({ productId, rating, comment }));
```

2. Update Review:

```javascript
dispatch(updateReview({ reviewId, rating, comment }));
```

3. Delete Review:

```javascript
dispatch(deleteReview(reviewId));
```

## Development Guidelines

1. Action Creation:

   - Use createAsyncThunk for async operations
   - Include proper error handling
   - Maintain action type naming conventions

2. State Updates:

   - Use immer-powered reducers
   - Keep state normalized
   - Include loading and error states

3. Selectors:

   - Create memoized selectors for derived data
   - Use reselect for complex computations
   - Keep components data-agnostic

4. Error Handling:
   - Use the error slice for global errors
   - Include proper error messages
   - Handle loading states appropriately

## Dependencies

- @reduxjs/toolkit
- react-redux
- redux
- redux-thunk
