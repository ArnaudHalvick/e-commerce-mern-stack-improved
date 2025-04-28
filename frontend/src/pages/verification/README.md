# Verification Module

This module handles all the email verification processes in the e-commerce application. It follows a modular architecture with reusable components, custom hooks, and separated styling for better maintainability and code reuse.

## Directory Structure

```
verification/
├── components/             # Reusable UI components
│   ├── StatusIcon.jsx      # Display status icons (success, error, loading)
│   ├── StatusMessage.jsx   # Display status messages with appropriate styling
│   └── ResendForm.jsx      # Form for resending verification emails
├── hooks/                  # Custom React hooks
│   └── useEmailVerification.js    # Logic for email verification
├── styles/                 # CSS styles
│   ├── Verification.css    # Base styles for all verification pages
│   └── VerifyPending.css   # Specific styles for the pending verification page
├── VerifyEmail.jsx         # Email verification page component
├── VerifyPending.jsx       # Pending verification page component
├── index.js                # Exports all components and hooks
└── README.md               # This documentation file
```

## Pages

### 1. VerifyEmail

Handles the verification of user email addresses. This page is accessed when a user clicks on the verification link sent to their email.

**Features:**

- Validates verification tokens
- Displays success or error messages
- Allows resending verification emails if the token has expired
- Provides navigation to relevant pages based on verification status

### 2. VerifyPending

Displayed after a user registers and needs to verify their email address.

**Features:**

- Shows instructions for completing the verification process
- Allows resending verification emails if needed
- Provides clear guidance for checking spam folders

## Reusable Components

### 1. StatusIcon

A visual indicator component that displays different icons based on the operation status:

- **Success**: Checkmark (✓)
- **Error**: X mark (✗)
- **Loading**: Animated spinner

### 2. StatusMessage

Displays status messages with appropriate styling for success or error states. Can contain additional UI elements as children.

### 3. ResendForm

A form component for requesting a new verification email, with validation and error handling.

## Custom Hooks

### 1. useEmailVerification

Handles all logic related to email verification:

- Verifying tokens
- Managing verification states
- Handling token expiration
- Resending verification emails

## Styling

The module uses a modular CSS approach with:

- **Verification.css**: Base styles shared across all verification pages
- **VerifyPending.css**: Specific styles for the pending verification page

The styling follows the application's design system using CSS variables for consistency.

## Accessibility Features

All components are built with accessibility in mind:

- Proper ARIA roles and attributes
- Keyboard navigation support
- Screen reader-friendly content
- Focus management
- Status announcements for dynamic content changes

## Usage

To use these components in other parts of the application:

```jsx
import {
  VerifyEmail,
  VerifyPending,
  StatusMessage,
  StatusIcon,
  ResendForm,
} from "../pages/verification";
```

## Integration Points

This module integrates with:

1. **Redux Store** - For dispatching verification actions and storing authentication state
2. **React Router** - For navigation and URL parameter handling
3. **API Services** - For making verification requests to the server
4. **Global Components** - Using shared UI components like breadcrumbs and spinners
