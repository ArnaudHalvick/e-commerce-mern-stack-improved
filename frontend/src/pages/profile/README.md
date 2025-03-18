# Profile Module

This module handles all user profile functionality including viewing and updating personal information, changing passwords, and managing account settings.

## Structure

```
profile/
├── components/            # Reusable UI components
│   ├── AccountManager.jsx # Account management (disabling account)
│   ├── EmailVerification.jsx # Email verification alerts and actions
│   ├── PasswordManager.jsx # Password change functionality
│   └── ProfileInfo.jsx    # User profile information display and edit
├── hooks/                 # Custom hooks
│   └── useProfileValidation.js # Form validation logic
├── index.jsx              # Main profile page component
├── Profile.css            # Profile styles
└── README.md              # Documentation (this file)
```

## Components

### Main Component

- **Profile (index.jsx)**: The main container component that orchestrates the profile page functionality. It manages state, handles API calls through Redux, and provides data and callbacks to child components.

### UI Components

- **ProfileInfo**: Displays and allows editing of basic user information (name, phone) and shipping address.
- **PasswordManager**: Provides functionality to change the user's password.
- **AccountManager**: Contains account-related actions like disabling the account.
- **EmailVerification**: Shows email verification status and provides resend verification functionality.

### Custom Hooks

- **useProfileValidation**: Handles form validation for profile data and password changes.

## Features

- View and edit personal information
- Update shipping address with validation
- Change password
- Verify email address
- Disable account

## Usage

This module is typically accessed via the user profile icon or menu item in the application header. It's protected by authentication and will redirect unauthenticated users to the login page.

## Dependencies

- Redux for state management
- React Router for navigation
- AuthContext for user authentication state
