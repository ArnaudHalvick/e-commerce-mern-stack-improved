# Auth Loading Indicator

A non-blocking authentication loading indicator that provides visual feedback during authentication processes.

## Features

- Shows a small, non-intrusive spinner during regular authentication processes
- Displays a full-screen overlay during login/logout transitions for a smoother UX
- Automatically integrates with the AuthContext to respond to authentication state changes
- Fully responsive design

## Visual States

The component has two main visual states:

1. **Small Indicator** - Appears in the top-right corner during initial auth checking
2. **Transition Overlay** - Full-screen semi-transparent overlay during login/logout

## Usage

Simply include this component once at a high level in your application to provide feedback during all authentication operations:

```jsx
import AuthLoadingIndicator from "../components/authLoadingIndicator/AuthLoadingIndicator";

function App() {
  return (
    <div className="app">
      <AuthLoadingIndicator />
      {/* The rest of your application */}
      <Router>
        <Routes>{/* Your routes */}</Routes>
      </Router>
    </div>
  );
}
```

## How It Works

The component consumes the following states from AuthContext:

- `loading`: Indicates normal authentication loading (like initial checking)
- `initialLoadComplete`: Shows if the first auth check has completed
- `inTransition`: Indicates a major transition like login/logout

Based on these states, it renders:

- Nothing when authentication is complete and stable
- A small corner indicator during initial loading
- A full-screen overlay during transitions

## Styling

The component uses dedicated CSS (authLoadingIndicator.css) that provides:

- Proper z-index management to ensure visibility
- Responsive design considerations
- Semi-transparent backgrounds to maintain context
- Smooth transitions

## Dependencies

- React
- AuthContext from `../../context/AuthContext`
- InlineSpinner from `../ui/spinner`
- CSS styles from `./authLoadingIndicator.css`
