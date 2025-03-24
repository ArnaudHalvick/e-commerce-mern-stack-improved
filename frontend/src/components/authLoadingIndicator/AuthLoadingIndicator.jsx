import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { InlineSpinner } from "../ui/SpinnerUtils";
import "./authLoadingIndicator.css"; // Import dedicated CSS file

/**
 * A non-blocking authentication loading indicator
 * Shows a small spinner during authentication processes
 * without preventing the user from seeing or interacting with the app
 *
 * During login/logout transitions, it can optionally block the UI
 * to prevent flickering and provide a smooth experience
 */
const AuthLoadingIndicator = () => {
  const { loading, initialLoadComplete, inTransition } =
    useContext(AuthContext);

  // Debug logging
  useEffect(() => {
    if (inTransition) {
      console.log("AuthLoadingIndicator: In transition mode");
    }
  }, [inTransition]);

  // During login/logout transitions, block the entire UI with a more prominent indicator
  if (inTransition) {
    return (
      <div className="auth-transition-overlay">
        <InlineSpinner size="medium" message="Processing..." />
      </div>
    );
  }

  // Only show the indicator when auth is loading
  if (!initialLoadComplete || loading) {
    return (
      <div className="auth-indicator-container">
        <InlineSpinner size="small" message="Authenticating..." />
      </div>
    );
  }

  return null;
};

export default AuthLoadingIndicator;
