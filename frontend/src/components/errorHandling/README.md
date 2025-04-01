# Error Handling System

A comprehensive error handling system for React applications that provides consistent error management through various components and utilities.

## Overview

This module provides a collection of components and utilities to handle errors in a React application:

- **Error Boundaries**: Catch and display UI for JavaScript errors
- **Toast Notifications**: Display informative messages to users
- **Empty States**: Show appropriate UI when data is missing
- **Higher-Order Components**: Wrap components with error handling functionality
- **Demo Components**: Test and demonstrate error handling capabilities

## Directory Structure

```
errorHandling/
├── boundary/         # Error boundary component
├── demo/             # Demo components to showcase functionality
├── emptyState/       # Empty state components
├── hoc/              # Higher-order components
├── styles/           # CSS styles for error components
├── toast/            # Toast notification components
└── index.js          # Re-exports all components for easy imports
```

## Components

### ErrorBoundary

A React class component that catches JavaScript errors in its child component tree and displays a fallback UI.

```jsx
import { ErrorBoundary } from "../components/errorHandling";

const App = () => (
  <ErrorBoundary showDetails={process.env.NODE_ENV === "development"}>
    <YourApp />
  </ErrorBoundary>
);
```

### Toast Notifications

Display temporary notification messages to users:

```jsx
import { useError } from "../context/ErrorContext";

const YourComponent = () => {
  const { showError, showSuccess, showWarning, showInfo } = useError();

  // Usage examples
  const handleSuccess = () => showSuccess("Operation completed successfully!");
  const handleError = () => showError("An error occurred");
  const handleWarning = () => showWarning("Please proceed with caution");
  const handleInfo = () => showInfo("Here is some information");

  // Component implementation...
};
```

### EmptyState

Display UI when no data is available:

```jsx
import { EmptyState } from '../components/errorHandling';

const ProductList = ({ products }) => {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No Products Found"
        message="Try adjusting your filters or search criteria."
        actionText="Reset Filters"
        onAction={handleResetFilters}
      />
    );
  }

  return (
    // Normal product list rendering
  );
};
```

### Higher-Order Component

Wrap components with error handling functionality:

```jsx
import { withErrorHandling } from "../components/errorHandling";

const UserProfile = ({ userData }) => {
  // Component implementation...
};

export default withErrorHandling(UserProfile, {
  loadingMessage: "Loading user profile...",
  errorMessage: "Failed to load user profile",
});
```

## Demo Component

The `ErrorDemo` component provides a playground to test all error handling capabilities. Use it to:

- Test different toast notification types
- Simulate API errors with various status codes
- Test error boundary behavior with intentional errors

## Best Practices

1. **Wrap Root or Route Components**: Place error boundaries at the route level to prevent entire app crashes
2. **Use Toast for Transient Errors**: Display non-critical errors using toast notifications
3. **Empty States for Missing Data**: Always provide helpful empty states when data is unavailable
4. **Error Context**: Use the `useError` hook for consistent error handling across components
5. **API Error Handling**: Let the API client interceptors handle common error cases

## Integration with API Client

The error handling system integrates with the application's API client to automatically handle common error scenarios:

```jsx
// API client will automatically trigger appropriate error handling
try {
  const data = await apiClient.get("/api/products");
  // Handle success case
} catch (error) {
  // Error is automatically handled by interceptors
  // Additional custom error handling if needed
}
```

## Extending the System

To add new error handling components:

1. Create your component in the appropriate subdirectory
2. Add styles to the `styles` directory
3. Export the component from `index.js`
4. Document usage in this README
