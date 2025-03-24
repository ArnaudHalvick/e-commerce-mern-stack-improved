import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { InlineSpinner } from "./ui/SpinnerUtils";

/**
 * A non-blocking authentication loading indicator
 * Shows a small spinner during authentication processes
 * without preventing the user from seeing or interacting with the app
 */
const AuthLoadingIndicator = () => {
  const { loading, initialLoadComplete } = useContext(AuthContext);

  // Only show the indicator when auth is loading
  if (!initialLoadComplete || loading) {
    return (
      <div
        className="auth-indicator-container"
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 9999,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <InlineSpinner size="small" message="Authenticating..." />
      </div>
    );
  }

  return null;
};

export default AuthLoadingIndicator;
