import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/state";
import React from "react";

/**
 * EmailVerificationGuard component that protects routes that require verified email
 * Enhanced to support cached user data for faster initial rendering
 */
const EmailVerificationGuard = ({ children }) => {
  const { isAuthenticated, user, loading, quietLoading, initialLoadComplete } =
    useAuth();
  const location = useLocation();

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

  // Check if email is verified
  const isVerified = user?.status === "active" || user?.emailVerified === true;

  // If email is not verified, redirect to verification page
  if (!isVerified) {
    // Dispatch a custom event that the auth system can listen for
    const customEvent = new CustomEvent("auth:emailVerificationRequired", {
      detail: {
        message: "Email verification is required for this action.",
      },
    });
    window.dispatchEvent(customEvent);

    return (
      <Navigate
        to="/verify-pending"
        state={{
          from: location.pathname,
          requiresVerification: true,
        }}
        replace
      />
    );
  }

  // Email is verified, render children
  return children;
};

export default EmailVerificationGuard;
