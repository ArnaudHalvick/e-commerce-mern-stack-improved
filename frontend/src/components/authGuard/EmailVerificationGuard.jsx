import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/**
 * Email Verification Guard component that protects routes from users with unverified emails
 * Will redirect unverified users to a verification pending page without errors
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The components to render if email is verified
 */
const EmailVerificationGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // If still loading auth state, show nothing temporarily
  if (loading) {
    return null;
  }

  // If not authenticated, this will be handled by the regular ProtectedRoute
  if (!isAuthenticated) {
    return children;
  }

  // If authenticated but email not verified, redirect to verification pending page
  if (user && !user.isEmailVerified) {
    // Simply redirect without trying to update any state during render
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
