# Auth Context

## Overview

The Auth Context provides authentication state management for the admin dashboard. It handles user authentication, user profile data, and authentication-related operations such as login, logout, and session verification.

## Directory Structure

```
auth/
├── AuthContext.jsx - React context definition
├── AuthReducer.jsx - State reducer for authentication
├── AuthProvider.jsx - Context provider component
└── AuthTypes.jsx - Action type constants
```

## Features

- **User Authentication**: Management of login/logout operations
- **Session Persistence**: Maintains authentication state across page refreshes
- **User Profile Management**: Stores and provides access to user profile data
- **JWT Token Handling**: Manages authentication tokens securely
- **Protected Route Integration**: Works with AuthGuard for route protection
- **Loading States**: Tracks authentication loading state

## Usage

### Direct Context Usage

```jsx
import { useContext } from "react";
import AuthContext from "../../context/auth/AuthContext";

const Component = () => {
  const { user, isAuthenticated, loading, login, logout, loadUser } =
    useContext(AuthContext);

  // Check authentication status
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  // Access user data
  return <h1>Welcome, {user.name}</h1>;
};
```

### Using Auth Operations

```jsx
import { useContext } from "react";
import AuthContext from "../../context/auth/AuthContext";

const LoginForm = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        Login
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};
```

## Authentication Flow

1. **Initial App Load**:

   - The `AuthProvider` checks for stored tokens in localStorage
   - If a token exists, it attempts to verify and load the user
   - Sets the authenticated state based on the verification result

2. **Login Process**:

   - User submits credentials
   - `login()` function sends credentials to the auth API
   - On success, token is stored and user profile is loaded
   - Authentication state is updated

3. **Protected Resources**:

   - API requests include the authentication token
   - Failed authentication (401 errors) triggers logout

4. **Logout Process**:
   - `logout()` function clears stored tokens
   - Authentication state is reset
   - User is redirected to login page

## Integration with API

The Auth Context integrates with the authentication API service to:

1. Authenticate user credentials
2. Verify tokens
3. Load user profile information
4. Handle token refreshing

## State Management

The context uses React's useReducer hook with these key state elements:

- `user`: The authenticated user's profile data
- `isAuthenticated`: Boolean indicating authentication status
- `loading`: Boolean indicating authentication operations in progress
- `error`: Any authentication-related error messages
