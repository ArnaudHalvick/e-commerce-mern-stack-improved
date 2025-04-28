import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/state";
import React, { useEffect } from "react";

/**
 * EmailVerificationGuard component that protects routes that require verified email
 * Enhanced to support cached user data for faster initial rendering
 */
const EmailVerificationGuard = ({ children }) => {
  const { isAuthenticated, user, loading, quietLoading, initialLoadComplete } =
    useAuth();
  const location = useLocation();

  // Check if email is verified - do this early for cleaner code
  const isVerified =
    user?.isEmailVerified ||
    user?.status === "active" ||
    user?.emailVerified === true;

  // Dispatch event when needed but outside conditional rendering
  useEffect(() => {
    if (isAuthenticated && user && !isVerified) {
      const customEvent = new CustomEvent("auth:emailVerificationRequired", {
        detail: {
          message: "Email verification is required for this action.",
        },
      });
      window.dispatchEvent(customEvent);
    }
  }, [isAuthenticated, user, isVerified]);

  // If auth is still being determined and not in quiet loading mode, render placeholder
  if ((loading && !quietLoading) || !initialLoadComplete) {
    return (
      <div style={{ opacity: 0.5, padding: "20px", textAlign: "center" }}>
        {/* Empty div to hold the space while verification is checked */}
      </div>
    );
  }

  // Not authenticated - shouldn't reach here, but just in case
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If email is not verified, redirect to verification page
  if (!isVerified) {
    // Immediately redirect without rendering any content from children
    return (
      <Navigate
        to="/verify-pending"
        state={{
          from: location.pathname,
          requiresVerification: true,
          email: user.email, // Include the user's email in the state
        }}
        replace
      />
    );
  }

  // Email is verified, render children
  return children;
};

export default EmailVerificationGuard;
