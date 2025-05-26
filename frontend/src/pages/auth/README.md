# Auth Module

A comprehensive authentication module for the e-commerce application that handles user login, registration, password recovery, and password reset functionality.

## Features

- User login with form validation
- User registration with form validation
- Password strength validation
- Forgot password flow
- Reset password functionality
- Protected routes with authentication redirects
- Success/error message handling

## Module Structure

```
auth/
├── pages/                           # Main page components
│   ├── Auth.jsx                     # Login/Signup page
│   ├── ForgotPassword.jsx           # Password recovery page
│   ├── ResetPassword.jsx            # Password reset page
│   └── index.js                     # Pages export file
├── components/                      # Reusable UI components
│   ├── AuthLayout.jsx               # Common layout for auth pages
│   ├── ForgotPasswordForm.jsx       # Form for password recovery requests
│   ├── LoginForm.jsx                # Login form component
│   ├── PasswordValidation.jsx       # Password strength validator
│   ├── ResetPasswordForm.jsx        # Form for resetting password
│   ├── SchemaPasswordValidation.jsx # Schema-based password validation
│   ├── SignupForm.jsx               # Registration form component
│   └── index.js                     # Components export file
├── hooks/                           # Custom hooks
│   ├── useAuthForm.jsx              # Form handling for auth
│   ├── useFormHandler.jsx           # Generic form utilities
│   ├── usePasswordRecovery.jsx      # Password recovery logic
│   ├── usePasswordValidation.jsx    # Password validation logic
│   └── index.js                     # Hooks export file
├── styles/                          # Component styles
│   ├── forms.css                    # Form-specific styles
│   ├── index.css                    # Main stylesheet
│   ├── layout.css                   # Layout styles
│   └── password-validation.css      # Password validation styles
├── index.js                         # Main module export file
└── README.md                        # This documentation
```

## Usage

```jsx
import { Auth, ForgotPassword, ResetPassword } from "../pages/auth";
import { Route, Routes } from "react-router-dom";

// Inside your router component
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Auth initialState="Login" />} />
      <Route path="/signup" element={<Auth initialState="Signup" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* Other routes */}
    </Routes>
  );
};
```

## Props

### Auth Component

| Prop         | Type   | Description                                                           |
| ------------ | ------ | --------------------------------------------------------------------- |
| initialState | String | Determines whether to show login or signup form ("Login" or "Signup") |

## Authentication Flow

1. **Login**: User enters credentials and submits the login form
2. **Signup**: User enters registration details, validates password strength, and creates an account
3. **Forgot Password**: User requests a password reset link sent to their email
4. **Reset Password**: User sets a new password using the reset token from the email link

## Form Validation

- Email validation (format, required field)
- Password strength requirements:
  - Minimum length
  - Special characters
  - Numbers
  - Uppercase and lowercase letters
- Field-level validation with error messages
- Form-level validation

## State Management

Authentication state is managed through Redux, with the following key states:

- `isAuthenticated`: Boolean indicating if user is logged in
- `loading`: Boolean indicating if authentication is in progress
- `user`: Object containing user information when authenticated

## Architecture Benefits

This structure provides:

- **Clear separation of concerns**: Pages, components, hooks, and styles are organized separately
- **Better maintainability**: Easy to locate and modify specific functionality
- **Reusability**: Components and hooks can be easily reused across different pages
- **Scalability**: New auth-related pages or components can be added without cluttering the structure
- **Intuitive navigation**: Developers can quickly understand the module organization

## Related Components

- Navbar (displays user state)
- ProtectedRoute (controls access to authenticated routes)
- Profile (user profile management)
- Cart (requires authentication to checkout)
