import React from "react";
import { useAuth } from "../../hooks/state";

/**
 * Test component to verify our hooks are working
 */
const HooksTest = () => {
  // Test useAuth hook
  const { isAuthenticated, user, loading, fetchUserProfile, logout } =
    useAuth();

  return (
    <div className="hooks-test">
      <h2>Hooks Test Component</h2>

      <div className="auth-state">
        <h3>Authentication State</h3>
        <p>
          <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </p>
        <p>
          <strong>Loading:</strong> {loading ? "Yes" : "No"}
        </p>
        <p>
          <strong>User:</strong> {user ? JSON.stringify(user) : "Not logged in"}
        </p>
      </div>

      <div className="auth-actions">
        <h3>Authentication Actions</h3>
        <button onClick={() => fetchUserProfile()} disabled={loading}>
          Refresh User Profile
        </button>
        {isAuthenticated && (
          <button onClick={() => logout()} disabled={loading}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default HooksTest;
