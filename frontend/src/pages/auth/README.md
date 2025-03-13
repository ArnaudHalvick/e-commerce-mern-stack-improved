# Auth Page Components

This directory contains the components and logic for the authentication pages (Login and Signup).

## Structure

```
auth/
├── components/       # UI components used in the Auth page
│   ├── LoginForm.jsx      # Login form component
│   └── SignupForm.jsx     # Signup form component
├── hooks/            # Custom hooks for Auth functionality
│   └── useAuthForm.jsx    # Hook for form state management and submission
└── index.jsx         # Main Auth page component that composes everything
```

## Components

### LoginForm

Handles the login form display and validation.

### SignupForm

Handles the signup form display, validation, and terms acceptance.

## Hooks

### useAuthForm

Custom hook that manages form state, submission logic, and authentication context integration.
