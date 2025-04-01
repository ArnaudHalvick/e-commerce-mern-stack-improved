# Auth Guard Components

This directory contains authentication guard components for protecting routes and handling email verification in the e-commerce application.

## Components

### AuthGuard

A flexible component for showing loading states during authentication or protecting routes that require authentication.

#### Props

| Prop          | Type      | Default  | Description                                                     |
| ------------- | --------- | -------- | --------------------------------------------------------------- |
| `children`    | ReactNode | required | Child components to render when authentication criteria are met |
| `requireAuth` | boolean   | `false`  | Whether authentication is required (for protected routes)       |
| `fallback`    | ReactNode | `null`   | Custom component to show during loading states                  |

#### Usage Example

```jsx
import AuthGuard from '../components/authGuard/AuthGuard';

// Basic usage - shows loading state during auth
<AuthGuard>
  <YourComponent />
</AuthGuard>

// For protected routes
<AuthGuard requireAuth={true}>
  <ProtectedComponent />
</AuthGuard>

// With custom loading indicator
<AuthGuard
  requireAuth={true}
  fallback={<YourCustomSpinner />}
>
  <ProtectedComponent />
</AuthGuard>
```

### EmailVerificationGuard

Protects routes from users with unverified email addresses. Will redirect unverified users to a verification pending page.

#### Props

| Prop       | Type      | Default  | Description                               |
| ---------- | --------- | -------- | ----------------------------------------- |
| `children` | ReactNode | required | Components to render if email is verified |

#### Usage Example

```jsx
import EmailVerificationGuard from "../components/authGuard/EmailVerificationGuard";

// Wrap content that requires verified email
<EmailVerificationGuard>
  <YourEmailProtectedComponent />
</EmailVerificationGuard>;
```

## Integration with Router

These guards are typically used with React Router for protecting routes:

```jsx
// Example with react-router-dom v6
<Routes>
  {/* Public route */}
  <Route path="/" element={<HomePage />} />

  {/* Auth required route */}
  <Route
    path="/account"
    element={
      <AuthGuard requireAuth={true}>
        <AccountPage />
      </AuthGuard>
    }
  />

  {/* Email verification required route */}
  <Route
    path="/settings"
    element={
      <AuthGuard requireAuth={true}>
        <EmailVerificationGuard>
          <SettingsPage />
        </EmailVerificationGuard>
      </AuthGuard>
    }
  />
</Routes>
```

## Dependencies

- React Router Dom
- AuthContext from `../../context/AuthContext`
- InlineSpinner from `../ui/spinner`
