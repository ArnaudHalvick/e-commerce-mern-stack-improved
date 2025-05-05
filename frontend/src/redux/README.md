# Redux State Management

This directory contains the Redux state management setup for the e-commerce application using Redux Toolkit.

## Structure

```
redux/
├── slices/              # Feature-specific Redux slices
│   ├── cartSlice.js    # Shopping cart state
│   ├── authSlice.js    # Authentication state
│   ├── uiSlice.js      # UI state (modals, loading, etc.)
│   └── filterSlice.js  # Product filtering state
├── store.js            # Redux store configuration
└── selectors.js        # Reusable Redux selectors
```

## Store Configuration

The Redux store is configured in `store.js` using Redux Toolkit's `configureStore`:

```javascript
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import filterReducer from "./slices/filterSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    ui: uiReducer,
    filter: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/login/fulfilled"],
        ignoredPaths: ["auth.user"],
      },
    }),
});
```

## Feature Slices

### Cart Slice

Manages shopping cart state:

```javascript
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    quantity: 0,
  },
  reducers: {
    addItem: (state, action) => {
      /* ... */
    },
    removeItem: (state, action) => {
      /* ... */
    },
    updateQuantity: (state, action) => {
      /* ... */
    },
    clearCart: (state) => {
      /* ... */
    },
  },
});
```

### Auth Slice

Handles authentication state:

```javascript
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      /* ... */
    },
    setToken: (state, action) => {
      /* ... */
    },
    logout: (state) => {
      /* ... */
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        /* ... */
      })
      .addCase(login.fulfilled, (state, action) => {
        /* ... */
      })
      .addCase(login.rejected, (state, action) => {
        /* ... */
      });
  },
});
```

### UI Slice

Manages UI state:

```javascript
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    modals: {
      cart: false,
      login: false,
    },
    loading: {
      products: false,
      checkout: false,
    },
    notifications: [],
  },
  reducers: {
    showModal: (state, action) => {
      /* ... */
    },
    hideModal: (state, action) => {
      /* ... */
    },
    setLoading: (state, action) => {
      /* ... */
    },
    addNotification: (state, action) => {
      /* ... */
    },
  },
});
```

### Filter Slice

Manages product filtering state:

```javascript
const filterSlice = createSlice({
  name: "filter",
  initialState: {
    category: null,
    priceRange: { min: 0, max: 1000 },
    sortBy: "newest",
    searchQuery: "",
    page: 1,
  },
  reducers: {
    setCategory: (state, action) => {
      /* ... */
    },
    setPriceRange: (state, action) => {
      /* ... */
    },
    setSortBy: (state, action) => {
      /* ... */
    },
    setSearchQuery: (state, action) => {
      /* ... */
    },
    setPage: (state, action) => {
      /* ... */
    },
  },
});
```

## Selectors

Reusable selectors for accessing state:

```javascript
// Cart selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartQuantity = (state) => state.cart.quantity;

// Auth selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

// UI selectors
export const selectModalState = (modal) => (state) => state.ui.modals[modal];
export const selectLoadingState = (key) => (state) => state.ui.loading[key];
export const selectNotifications = (state) => state.ui.notifications;

// Filter selectors
export const selectActiveFilters = (state) => ({
  category: state.filter.category,
  priceRange: state.filter.priceRange,
  sortBy: state.filter.sortBy,
  searchQuery: state.filter.searchQuery,
});
```

## Usage Guidelines

### Using Redux State

```javascript
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectCartTotal } from "../redux/selectors";
import { addItem, removeItem } from "../redux/slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  const handleAddItem = (item) => {
    dispatch(addItem(item));
  };

  return (
    <div>
      {items.map((item) => (
        <CartItem key={item.id} item={item} onAdd={() => handleAddItem(item)} />
      ))}
      <div>Total: ${total}</div>
    </div>
  );
};
```

### Async Actions

```javascript
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/products", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
```

## Development Guidelines

1. State Structure:

   - Keep state normalized
   - Avoid redundant data
   - Use proper types
   - Handle loading states
   - Manage errors

2. Performance:

   - Memoize selectors
   - Batch updates
   - Optimize renders
   - Handle side effects
   - Use middleware

3. Error Handling:

   - Handle async errors
   - Validate actions
   - Show error states
   - Log errors
   - Recover gracefully

4. Testing:
   - Test reducers
   - Test selectors
   - Mock async actions
   - Test side effects
   - Verify state changes

## Dependencies

- @reduxjs/toolkit
- react-redux
- redux
- redux-thunk
