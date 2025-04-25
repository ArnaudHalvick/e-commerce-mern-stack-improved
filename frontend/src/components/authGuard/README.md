# Authentication Guard Components

This directory contains components for controlling access to protected routes and handling authentication states in the application.

## Components

### `AuthGuard`

A wrapper component for routes that provides loading states during authentication and can protect routes that require authentication.

#### Usage

```jsx
import AuthGuard from '../components/authGuard/AuthGuard';

// For showing loading states during authentication
<AuthGuard>
  <YourComponent />
</AuthGuard>

// For protected routes
<AuthGuard requireAuth={true}>
  <YourProtectedComponent />
</AuthGuard>

// With custom fallback component
<AuthGuard fallback={<CustomLoadingComponent />}>
  <YourComponent />
</AuthGuard>
```

#### Props

- `children`: The components to render when authentication state is determined
- `requireAuth` (boolean, default: false): Whether authentication is required
- `fallback` (React component, default: null): Custom loading component to display

### `EmailVerificationGuard`

A guard that redirects users to the verification page if their email is not verified, preventing access to protected features.

#### Usage

```jsx
import EmailVerificationGuard from "../components/authGuard/EmailVerificationGuard";

// Wrap components that require email verification
<EmailVerificationGuard>
  <YourProtectedComponent />
</EmailVerificationGuard>;
```

#### Behavior

- Shows loading screen while verification status is being checked
- If the user's email is not verified, redirects to the verification page
- Dispatches a custom event `auth:emailVerificationRequired` to notify the application
- Preserves the original route in navigation state for return after verification

## Integration with Auth State

Both components integrate with the global authentication state through the `useAuth` hook from `hooks/state`, providing a seamless authentication experience.
