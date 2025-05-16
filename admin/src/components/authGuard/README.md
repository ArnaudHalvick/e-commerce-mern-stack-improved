# Auth Guard Components

## Overview

The Auth Guard components provide route protection functionality for the admin dashboard. These components ensure that only authenticated users can access protected routes, redirecting unauthenticated users to the login page.

## Directory Structure

```
authGuard/
└── ProtectedRoute.jsx - Main component for route protection
```

## Components

### ProtectedRoute

A higher-order component that wraps around routes requiring authentication:

```jsx
import { ProtectedRoute } from "../components/authGuard";

// Usage example
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />
</Routes>;
```

#### Props

| Prop       | Type            | Required | Default  | Description                                      |
| ---------- | --------------- | -------- | -------- | ------------------------------------------------ |
| children   | React.ReactNode | Yes      | -        | Child components to render if authenticated      |
| redirectTo | string          | No       | "/login" | Path to redirect to if user is not authenticated |

## Features

- **Authentication Verification**: Checks if user is authenticated before rendering protected content
- **Loading State**: Displays a spinner during authentication verification
- **Automatic Redirection**: Redirects unauthenticated users to the login page
- **Context Integration**: Integrates with the AuthContext to access authentication state

## Implementation Details

The ProtectedRoute component:

1. Uses AuthContext to access the application's authentication state
2. Shows a loading spinner during the authentication check
3. Redirects unauthenticated users to the login page
4. Renders the child components only if the user is authenticated

## Usage with Router

The ProtectedRoute component is designed to work with React Router v6:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/authGuard";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
```
