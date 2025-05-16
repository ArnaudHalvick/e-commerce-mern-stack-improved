# Auth Component

## Overview

The Auth component handles user authentication for the admin dashboard. It provides the login interface and manages authentication flows, including redirection to protected routes after successful login.

## Directory Structure

```
auth/
├── Login.jsx - Login form component
├── Login.css - Login styling
└── README.md - This documentation
```

## Features

- **User Authentication**: Login form with email and password
- **Validation**: Input validation with error handling
- **Loading States**: Visual feedback during authentication
- **Redirect Management**: Smart redirection to the originally requested page
- **Error Handling**: Clear error messages for failed login attempts
- **Session Persistence**: Maintains login state across page refreshes
- **Security**: Integration with JWT authentication

## Usage

The Auth component is typically used in the main application routes:

```jsx
import Login from "./pages/auth/Login";

// In the app's router
<Route path="/login" element={<Login />} />;
```

## Component Structure

### Login Component

The main component that handles user authentication:

- Renders a login form with email and password inputs
- Manages form state and validation
- Communicates with the authentication API
- Handles redirection after successful login
- Displays error messages for failed attempts

## Authentication Flow

1. **Form Submission**:

   - User enters email and password
   - Form performs basic validation
   - Credentials are submitted to the authentication API

2. **Authentication Process**:

   - Loading indicator shown during API request
   - Integration with AuthContext for consistent auth state management
   - Token storage handled by the auth context

3. **Post-Authentication**:
   - On success: Redirect to original destination or dashboard
   - On failure: Display error message with toast notification

## Redirect Handling

The Login component includes smart redirect handling:

- Captures the originally requested URL (if redirected from a protected route)
- Preserves this destination in state for post-login navigation
- Avoids redirect loops through path validation
- Ensures proper navigation context after authentication

## Integration with Auth Context

The Login component integrates closely with the AuthContext:

- Uses context for authentication state management
- Leverages context methods for login/logout operations
- Responds to authentication state changes

## UI Components

The component uses several reusable UI components:

- Input - For form fields with consistent styling
- Button - For form submission with loading state support
- Spinner - For loading indication
- Toast - For error notifications

## Styling

The login page uses dedicated CSS with:

- Card-based layout for the login form
- Responsive design for various screen sizes
- Consistent styling with the admin theme
- Clear visual hierarchy and feedback
