# Custom React Hooks

A collection of reusable custom React hooks that provide common functionality across the e-commerce application.

## Structure

```
hooks/
├── state/                 # State management hooks
│   ├── useCart.js        # Cart state management
│   ├── useAuth.js        # Authentication state
│   └── useFilters.js     # Product filtering state
├── useApi.js             # API interaction hook
├── useDebounce.js        # Debounce functionality
├── useForm.js            # Form handling
├── useInfiniteScroll.js  # Infinite scrolling
└── useLocalStorage.js    # Local storage management
```

## State Management Hooks

### useCart

Manages shopping cart state and operations:

```javascript
const {
  cart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  isItemInCart,
  cartTotal,
} = useCart();
```

Features:

- Add/remove items
- Update quantities
- Calculate totals
- Persist cart state
- Handle cart operations

### useAuth

Manages authentication state and user operations:

```javascript
const {
  user,
  isAuthenticated,
  login,
  logout,
  register,
  updateProfile,
  isLoading,
} = useAuth();
```

Features:

- User authentication
- Session management
- Profile updates
- Loading states
- Error handling

### useFilters

Manages product filtering and sorting state:

```javascript
const { filters, setFilter, clearFilters, sortBy, setSortBy, activeFilters } =
  useFilters();
```

Features:

- Filter management
- Sort operations
- Filter persistence
- Filter combinations
- Reset functionality

## API Hook

### useApi

Handles API interactions with built-in state management:

```javascript
const { data, error, loading, fetch, mutate, reset } = useApi("/products");
```

Features:

- Data fetching
- Error handling
- Loading states
- Cache management
- Request cancellation
- Retry logic

## Utility Hooks

### useDebounce

Provides debounced value updates:

```javascript
const debouncedValue = useDebounce(value, 500);
```

Features:

- Configurable delay
- Value tracking
- Cleanup on unmount
- Type safety
- Cancel capability

### useForm

Comprehensive form state management:

```javascript
const {
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  resetForm,
} = useForm({
  initialValues,
  validationSchema,
  onSubmit,
});
```

Features:

- Form state
- Validation
- Error handling
- Field tracking
- Submit handling
- Reset capability

### useInfiniteScroll

Manages infinite scrolling functionality:

```javascript
const { items, loading, hasMore, loadMore, reset } = useInfiniteScroll({
  fetchItems,
  pageSize: 20,
});
```

Features:

- Scroll detection
- Page management
- Loading states
- Error handling
- Reset capability

### useLocalStorage

Manages local storage state with React:

```javascript
const [value, setValue] = useLocalStorage("key", defaultValue);
```

Features:

- Persistent storage
- Type safety
- Auto serialization
- Error handling
- Default values

## Usage Guidelines

### State Management

```javascript
import { useCart } from "../hooks/state/useCart";

const ProductCard = ({ product }) => {
  const { addToCart, isItemInCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <button onClick={handleAddToCart} disabled={isItemInCart(product.id)}>
      Add to Cart
    </button>
  );
};
```

### API Interactions

```javascript
import { useApi } from "../hooks/useApi";

const ProductList = () => {
  const { data: products, loading, error } = useApi("/products");

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Form Handling

```javascript
import { useForm } from "../hooks/useForm";

const LoginForm = () => {
  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: handleLogin,
  });

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}
      {/* ... */}
    </form>
  );
};
```

## Development Guidelines

1. State Management:

   - Use appropriate state scope
   - Handle side effects
   - Implement cleanup
   - Consider performance
   - Handle edge cases

2. Error Handling:

   - Provide error states
   - Handle async errors
   - Show error messages
   - Implement retries
   - Clean up resources

3. Performance:

   - Memoize callbacks
   - Optimize re-renders
   - Handle large datasets
   - Implement caching
   - Clean up subscriptions

4. Type Safety:
   - Use TypeScript
   - Define interfaces
   - Validate inputs
   - Handle null cases
   - Document types
