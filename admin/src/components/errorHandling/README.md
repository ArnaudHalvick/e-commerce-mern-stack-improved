# Error Handling Component

## Overview

The Error Handling component is a comprehensive error management solution for the admin dashboard. It provides a consistent way to handle, display, and manage errors across the application, improving both developer experience and user experience when encountering errors.

## Features

- **Toast Notifications**: Temporary notification system for showing success, error, warning, and info messages
- **Alerts**: Inline alert components with different variants and optional dismissal
- **Error Boundary**: React error boundary for gracefully catching and displaying JavaScript errors
- **Error Pages**: Full-page error states for various error scenarios (404, 500, 403, maintenance)
- **Error Handling Hooks**: Consistent error handling utilities to streamline error management

## Component Structure

```
errorHandling/
├── components/
│   ├── Alert.jsx - Inline alert component
│   ├── ErrorBoundary.jsx - React error boundary component
│   ├── ErrorHandlingExample.jsx - Example implementation of all error components
│   └── ErrorPage.jsx - Full-page error state component
├── hooks/
│   └── useErrorHandler.js - Custom hook for consistent error handling
├── styles/
│   ├── Alert.css - Alert component styling
│   ├── ErrorBoundary.css - Error boundary component styling
│   ├── ErrorHandlingExample.css - Example component styling
│   └── ErrorPage.css - Error page component styling
├── toast/
│   ├── components/
│   │   ├── Toast.jsx - Toast notification component
│   │   └── ToastProvider.jsx - Toast context provider component
│   ├── context/
│   │   └── ToastContext.js - React context for toast system
│   ├── hooks/
│   │   └── useToast.js - Custom hook for using toast functionality
│   └── styles/
│       └── Toast.css - Toast component styling
├── index.js - Component exports
└── README.md - This documentation
```

## Usage

### Toast Notifications

Import and use the ToastProvider in your app root and useToast hook in components:

```jsx
// App.jsx
import { ToastProvider } from "./components/ui/errorHandling";

const App = () => (
  <ToastProvider>
    <YourApp />
  </ToastProvider>
);

// Component.jsx
import { useToast } from "./components/ui/errorHandling";

const Component = () => {
  const { showSuccessToast, showErrorToast } = useToast();

  const handleSubmit = async () => {
    try {
      await saveData();
      showSuccessToast("Data saved successfully!");
    } catch (error) {
      showErrorToast("Failed to save data");
    }
  };

  return <button onClick={handleSubmit}>Save</button>;
};
```

### Error Handling

Use the useErrorHandler hook for consistent error handling:

```jsx
import { useErrorHandler } from "./components/ui/errorHandling";

const Component = () => {
  const { handleError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const data = await api.getData();
      return data;
    } catch (error) {
      handleError(error);
    }
  };

  return <div>...</div>;
};
```

### Error Boundary

Wrap components with ErrorBoundary to catch and display render errors:

```jsx
import { ErrorBoundary } from "./components/ui/errorHandling";

const Page = () => (
  <ErrorBoundary>
    <ComponentThatMightError />
  </ErrorBoundary>
);
```

### Alerts

Use the Alert component for inline notifications:

```jsx
import { Alert } from "./components/ui/errorHandling";

const Component = () => (
  <div>
    <Alert variant="success" title="Success!">
      Your changes have been saved successfully.
    </Alert>

    <Alert
      variant="error"
      title="Error!"
      dismissible
      onDismiss={() => console.log("dismissed")}
    >
      There was a problem processing your request.
    </Alert>
  </div>
);
```

### Error Pages

Use predefined error pages for various error states:

```jsx
import { ErrorPage } from "./components/ui/errorHandling";

// 404 Not Found Page
const NotFoundPage = () => <ErrorPage.NotFound />;

// 500 Server Error Page
const ServerErrorPage = () => <ErrorPage.ServerError />;

// 403 Unauthorized Page
const UnauthorizedPage = () => <ErrorPage.Unauthorized />;

// Maintenance Page
const MaintenancePage = () => <ErrorPage.Maintenance />;
```

## Core Functionality

### Toast System

The toast notification system provides:

- Global toast management via React Context
- Multiple toast types (success, error, warning, info)
- Customizable duration and position
- Automatic dismissal with animation
- Queue management (limiting maximum number of toasts)

### Error Handling

The error handling utilities provide:

- Consistent error parsing and display
- Integration with toast notifications
- Option to log errors or rethrow them
- Support for API error responses

### Error Boundary

The ErrorBoundary component provides:

- Graceful error catching in the component tree
- Development-mode error details and stack traces
- Customizable fallback UI
- Reset capability

### Error Pages

The ErrorPage component provides:

- Consistent styled error pages for different scenarios
- Clear error messages and navigation options
- Responsive design for all devices

## Dependencies

- React
- React Router (for ErrorPage navigation)

## Recent Refactoring

The error handling components have been refactored to follow React best practices:

1. **Proper Component Organization**:

   - Components moved to the components folder
   - Styles moved to the styles folder
   - Hooks moved to the hooks folder
   - Toast-specific code moved to a dedicated toast folder

2. **Custom Hooks Extraction**:

   - Separated business logic into dedicated hooks
   - Created useErrorHandler for centralized error handling
   - Improved useToast implementation

3. **Improved Toast Architecture**:

   - Better separation of concerns with context/components/hooks folders
   - More intuitive API with specialized toast methods

4. **Code Structure Improvements**:
   - Better JSDoc documentation
   - Early returns for cleaner logic
   - Improved function names for better readability
   - Consistent naming patterns
