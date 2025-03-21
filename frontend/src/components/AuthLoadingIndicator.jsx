import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AuthLoadingIndicator = () => {
  const { loading, initialLoadComplete } = useContext(AuthContext);

  if (!initialLoadComplete || loading) {
    return (
      <div className="auth-loading-indicator">
        {/* Optional: Add a subtle loading animation */}
        <div className="auth-loading-spinner"></div>
      </div>
    );
  }

  return null;
};

export default AuthLoadingIndicator;
