# Admin Panel Context System

This directory contains the context providers for state management in the admin panel.

## Available Contexts

### Error Context

Handles all error states, loading states, and success notifications in the application.

```jsx
import { useError } from "../context/error";

const MyComponent = () => {
  const {
    setError,
    clearError,
    setLoading,
    clearLoading,
    setSuccess,
    handleApiError,
  } = useError();

  // Show an error message
  setError("Something went wrong");

  // Show a success message
  setSuccess("Operation successful");

  // Handle loading states
  const fetchData = async () => {
    setLoading("dataFetch");
    try {
      const data = await api.getData();
      setSuccess("Data loaded successfully");
    } catch (error) {
      handleApiError(error); // Automatically formats API errors
    } finally {
      clearLoading("dataFetch");
    }
  };
};
```

### Auth Context

Manages authentication state, user information, and login/logout operations.

```jsx
import { useContext } from "react";
import AuthContext from "../context/auth/AuthContext";

const MyComponent = () => {
  const { user, isAuthenticated, loading, login, logout, loadUser } =
    useContext(AuthContext);

  // Check if user is authenticated
  if (isAuthenticated) {
    // User is logged in
  }

  // Access user data
  console.log(user.name, user.email);

  // Login user
  login({ email, password });

  // Logout user
  logout();
};
```

### Product Context

Manages products CRUD operations, filtering, and product state.

```jsx
import { useContext } from "react";
import ProductContext from "../context/product/ProductContext";

const MyComponent = () => {
  const {
    products,
    currentProduct,
    loading,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    toggleAvailability,
  } = useContext(ProductContext);

  // Load all products
  useEffect(() => {
    getProducts();
  }, []);

  // Create a new product
  const handleSubmit = (productData) => {
    createProduct(productData);
  };

  // Update a product
  const handleUpdate = (id, productData) => {
    updateProduct(id, productData);
  };
};
```

## Implementation Details

All contexts use React's Context API with the reducer pattern to manage state. The ErrorContext is used throughout the application to handle errors, loading states, and success messages in a consistent manner.

### Context Architecture

- `{context}/Context.js` - The React context object
- `{context}/Reducer.js` - State reducer for the context
- `{context}/State.js` - Provider component and state management
- `{context}/Types.js` - Action type constants

### Error Handling Integration

The Error context integrates with our UI components from `admin/src/components/ui/errorHandling` to display toast notifications, alerts, and loading spinners.

### Authentication Flow

The Auth context handles JWT authentication including token storage, refresh operations, and user profile management.

## Future Considerations

- Add role-based access control to the Auth context
- Add more specialized contexts for Orders, Customers, etc.
- Consider implementing shared state persistence with localStorage
