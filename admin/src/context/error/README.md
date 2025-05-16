# Error Context

## Overview

The Error Context provides centralized error handling, loading state management, and success notifications for the admin dashboard. This context allows components throughout the application to share error handling logic, display consistent error messages, and manage loading states.

## Directory Structure

```
error/
├── ErrorContext.jsx - React context definition
├── ErrorReducer.jsx - State reducer for error handling
├── ErrorState.jsx - Context provider component
├── ErrorTypes.jsx - Action type constants
├── useError.jsx - Custom hook for accessing error context
├── ErrorHandlingExample.jsx - Example component showing usage
└── index.jsx - Export file
```

## Features

- **Centralized Error Handling**: Consistent error management across the application
- **Loading State Management**: Named loading states with automatic clearing
- **Success Notifications**: Display success messages to users
- **API Error Formatting**: Special handling for API errors with consistent formatting
- **Toast Integration**: Works with the Toast notification system
- **Custom Hook API**: Simplified access through the useError hook

## Usage

### Using the Error Hook

```jsx
import { useError } from "../../context/error";

const Component = () => {
  const {
    error,
    loading,
    setError,
    clearError,
    setLoading,
    clearLoading,
    setSuccess,
    handleApiError,
  } = useError();

  // Show an error message
  const handleInvalidInput = () => {
    setError("Please enter a valid email address");
  };

  // Show a success message
  const handleSuccess = () => {
    setSuccess("Your profile has been updated successfully");
  };

  // Manage loading state
  const fetchData = async () => {
    setLoading("dataFetch"); // Sets a named loading state
    try {
      const data = await api.getData();
      setSuccess("Data loaded successfully");
      return data;
    } catch (error) {
      handleApiError(error); // Formats and displays API errors
      return null;
    } finally {
      clearLoading("dataFetch"); // Clears the specific loading state
    }
  };

  // Check if a specific operation is loading
  return (
    <div>
      {loading.includes("dataFetch") && <Spinner />}
      <button onClick={fetchData} disabled={loading.includes("dataFetch")}>
        Fetch Data
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

### Direct Context Usage

```jsx
import { useContext } from "react";
import ErrorContext from "../../context/error/ErrorContext";

const Component = () => {
  const { error, loading, dispatch } = useContext(ErrorContext);

  // Access error state and dispatch actions
  // (Generally prefer using the useError hook instead)
};
```

## Error Handling Flow

1. **Component Error**: Component calls `setError()` with error message
2. **API Error**: Component catches API error and calls `handleApiError()`
3. **Error Display**: Error context triggers toast notification
4. **Error Clearing**: Error is cleared automatically or via `clearError()`

## Loading State Management

The Error Context manages loading states with these operations:

- `setLoading(key)`: Adds a named loading state to the array
- `clearLoading(key)`: Removes a specific loading state
- `loading.includes(key)`: Check if a specific operation is loading

This approach allows multiple concurrent loading states to be tracked independently.

## Success Notifications

Success messages use the toast system to display temporary notifications:

- `setSuccess(message)`: Shows a success toast with the provided message
- Success toasts auto-dismiss after a configured time period

## Integration with UI Components

The Error Context is designed to work with these UI components:

- **Toast Notifications**: For temporary error and success messages
- **Alert Components**: For persistent error displays
- **Spinner**: For loading state indication

## Error Types

The context handles several types of errors:

1. **API Errors**: Formatted based on the structure of the API response
2. **Validation Errors**: For form validation and user input issues
3. **Application Errors**: For general application logic errors
4. **Network Errors**: Special handling for connection issues
