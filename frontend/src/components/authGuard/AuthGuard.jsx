import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/state";
import React from "react";

/**
 * AuthGuard component that protects routes based on authentication status
 * Enhanced to support cached user data for faster initial rendering
 */
const AuthGuard = ({ children, requireAuth = false }) => {
  const { isAuthenticated, loading, initialLoadComplete, quietLoading } =
    useAuth();
  const location = useLocation();

  // If authentication status is still being determined and not in quiet loading mode
  // Note: During quiet loading, we can still render the protected content
  if ((loading && !quietLoading) || !initialLoadComplete) {
    // Return a minimal loading indicator instead of null
    // This prevents route flickering
    return (
      <div style={{ opacity: 0.5, padding: "20px", textAlign: "center" }}>
        {/* Empty div to hold the space while auth is being verified */}
      </div>
    );
  }

  // For protected routes, redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the location the user was trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // For login/signup routes, redirect to home if already authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the children
  return children;
};

export default AuthGuard;
