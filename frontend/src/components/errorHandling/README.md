# Error Handling Components

This directory contains a comprehensive set of components for handling and displaying errors throughout the application.

## Structure

```
errorHandling/
├── boundary/                # React error boundary components
│   └── ErrorBoundary.jsx    # Catch and display React component errors
├── demo/                    # Error demonstration components
│   └── ErrorDemo.jsx        # Component to test error handling
├── emptyState/              # Empty state components
│   └── EmptyState.jsx       # Displays when content is empty or not found
├── styles/                  # Shared styles for error components
├── toast/                   # Toast notification components
│   ├── Toast.jsx            # Individual toast notification
│   └── ToastContainer.jsx   # Container for managing multiple toasts
└── index.js                 # Re-exports all error handling components
```

## Components

### Error Boundary

#### `ErrorBoundary`

React error boundary that catches JavaScript errors in child components and displays fallback UI.

Features:

- Prevents entire app from crashing due to component errors
- Displays user-friendly error messages
- Provides reset/retry functionality
- Captures error details for logging

#### Usage

```jsx
import { ErrorBoundary } from '../components/errorHandling';

// Wrap components that might throw errors
<ErrorBoundary fallback={<CustomErrorComponent />}>
  <ComponentThatMightError />
</ErrorBoundary>

// With default fallback UI
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Empty State

#### `EmptyState`

Displays a user-friendly message when content is empty, not found, or when an error occurs.

Features:

- Customizable icons, titles, and messages
- Action buttons with configurable links or callbacks
- Responsive design for all screen sizes

#### Usage

```jsx
import { EmptyState } from '../components/errorHandling';

// Basic usage for empty content
<EmptyState
  title="No Items Found"
  message="Try adjusting your filters to find what you're looking for."
  icon="🔍"
/>

// With action buttons
<EmptyState
  title="Your Cart is Empty"
  message="Add some products to your cart to get started."
  icon="🛒"
  actions={[
    { label: "Shop Now", to: "/shop", type: "primary" },
    { label: "View Offers", to: "/offers", type: "secondary" }
  ]}
/>
```

### Toast Notifications

#### `Toast` and `ToastContainer`

System for displaying temporary notifications to users.

Features:

- Multiple toast types (success, error, info, warning)
- Automatic dismissal with configurable timeout
- Manual dismissal via close button
- Stacking of multiple notifications
- Accessibility features for screen readers

#### Usage

```jsx
import { Toast, ToastContainer } from "../components/errorHandling";

// In your main app component
<ToastContainer position="top-right" />;

// Then anywhere in your application
// Trigger a toast via the global event system
window.dispatchEvent(
  new CustomEvent("toast:add", {
    detail: {
      type: "success",
      message: "Item added to cart successfully!",
      duration: 3000,
    },
  })
);
```

### Demo Components

#### `ErrorDemo`

Components for testing and demonstrating various error states in the application.

## Integration

These error components can be used together to create a comprehensive error handling system:

1. Wrap the app or key sections with `ErrorBoundary` to catch React errors
2. Use `EmptyState` for zero-state displays and not-found cases
3. Implement `Toast` notifications for transient messages and errors
4. Add appropriate error states in components for API errors and validation issues
