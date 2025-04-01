import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/state";
import LoadingScreen from "../loadingScreen/LoadingScreen";

/**
 * Prevents access to protected routes if user's email is not verified
 */
const EmailVerificationGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while auth state is loading
  if (loading) {
    return <LoadingScreen message="Checking verification status..." />;
  }

  // Check if user is authenticated but email is not verified
  if (isAuthenticated && user && !user.isEmailVerified) {
    // Dispatch an event to notify the user
    const event = new CustomEvent("auth:emailVerificationRequired", {
      detail: {
        message: "Email verification is required to access this feature.",
        from: location.pathname,
      },
    });
    window.dispatchEvent(event);

    // Redirect to verification page
    return (
      <Navigate
        to="/verify-pending"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // User is authenticated and email is verified, render children
  return children;
};

export default EmailVerificationGuard;
