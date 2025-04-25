import { useAuth } from "../../hooks/state";
import { InlineSpinner } from "../ui/spinner";
import "./authLoadingIndicator.css";

/**
 * Global authentication loading indicator
 * Displays at the top of the page when auth-related operations are in progress
 */
const AuthLoadingIndicator = () => {
  const { loading, inTransition, isInitialLoad, quietLoading } = useAuth();

  // During login/logout transitions, block the entire UI with a more prominent indicator
  if (inTransition) {
    return (
      <div className="auth-transition-overlay">
        <div className="auth-transition-content">
          <InlineSpinner size="large" message="Please wait..." />
        </div>
      </div>
    );
  }

  // For background token verification or quiet loading, use a subtle indicator that doesn't block the UI
  if (quietLoading) {
    return (
      <div className="auth-quiet-indicator">
        <div className="auth-quiet-animation"></div>
      </div>
    );
  }

  // Show a subtle loading bar for regular auth operations (excluding initial page load)
  if (loading && !isInitialLoad) {
    return (
      <div className="auth-loading-bar">
        <div className="auth-bar-animation"></div>
      </div>
    );
  }

  return null;
};

export default AuthLoadingIndicator;
