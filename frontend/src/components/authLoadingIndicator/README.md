# Authentication Loading Indicator

This directory contains components for displaying loading states during authentication operations throughout the application.

## Components

### `AuthLoadingIndicator`

A globally visible loading indicator that shows authentication status at the top of the page.

#### Features

- Displays a subtle loading bar for regular authentication operations
- Shows a full-screen overlay for login/logout transitions
- Automatically manages visibility based on authentication state
- Prevents UI interaction during critical auth transitions

#### Usage

```jsx
import AuthLoadingIndicator from "../components/authLoadingIndicator/AuthLoadingIndicator";

// Add to your app layout (typically near the top)
<div className="app">
  <AuthLoadingIndicator />
  <Header />
  <main>{children}</main>
  <Footer />
</div>;
```

#### Behavior

The component has two main states:

1. **Transition Mode**: During login/logout operations, displays a full-screen overlay that blocks UI interaction
2. **Regular Loading**: For other auth operations, shows a subtle loading bar at the top of the page

## Styling

The component includes its own CSS stylesheet (`authLoadingIndicator.css`) with:

- Animated loading bar with gradient effects
- Transition overlay with backdrop blur
- Responsive design for all screen sizes
- z-index management to ensure visibility

## Integration with Auth State

This component integrates with the global authentication state through the `useAuth` hook from `hooks/state` and provides visual feedback for:

- Initial authentication loading
- Authentication state transitions
- Token refresh operations
- Login/logout processes
