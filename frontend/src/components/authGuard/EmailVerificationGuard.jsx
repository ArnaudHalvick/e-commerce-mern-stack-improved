import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ErrorContext, { useError } from "../../context/ErrorContext";

/**
 * Email Verification Guard component that protects routes from users with unverified emails
 * Will redirect unverified users to a verification pending page
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The components to render if email is verified
 */
const EmailVerificationGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const { showWarning } = useError();
  const location = useLocation();

  // If still loading auth state, render children and let auth guard handle it
  if (loading) {
    return children;
  }

  // If not authenticated, this will be handled by the regular ProtectedRoute
  if (!isAuthenticated) {
    return children;
  }

  // If authenticated but email not verified, redirect to verification pending page
  if (user && !user.isEmailVerified) {
    // Show warning toast notification
    showWarning(
      "Email verification required. Please verify your email address before proceeding to checkout.",
      8000
    );

    // Redirect to verify pending page with return URL
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

  // If authenticated and email verified, show the protected content
  return children;
};

export default EmailVerificationGuard;
