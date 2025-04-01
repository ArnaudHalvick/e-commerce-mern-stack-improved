import React, { useState } from "react";
import { useAuth } from "../state";

const AuthHookTest = () => {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    accountDisabled,
    isEmailVerified,
    login,
    logout,
    signup,
    refreshAccessToken,
    fetchUserProfile,
    updateProfile,
    changePassword,
    disableAccount,
    requestEmailVerification,
    verifyEmail,
    verifyPasswordChange,
    requestEmailChange,
  } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [actionResult, setActionResult] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setActionResult(null);
    try {
      const result = await login(loginEmail, loginPassword);
      setActionResult({
        type: "Login",
        success: result.success,
        message: result.message || "Login successful",
      });
    } catch (error) {
      setActionResult({
        type: "Login",
        success: false,
        message: error.message || "Login failed",
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setActionResult(null);
    if (signupData.password !== signupData.confirmPassword) {
      setActionResult({
        type: "Signup",
        success: false,
        message: "Passwords do not match",
      });
      return;
    }

    try {
      const result = await signup({
        name: signupData.username,
        email: signupData.email,
        password: signupData.password,
      });
      setActionResult({
        type: "Signup",
        success: result.success,
        message: result.message || "Signup successful",
        requiresVerification: result.requiresVerification,
      });
    } catch (error) {
      setActionResult({
        type: "Signup",
        success: false,
        message: error.message || "Signup failed",
      });
    }
  };

  const handleLogout = () => {
    logout();
    setActionResult({
      type: "Logout",
      success: true,
      message: "Logged out successfully",
    });
  };

  const handleRefreshProfile = async () => {
    try {
      const profile = await fetchUserProfile();
      setActionResult({
        type: "Refresh Profile",
        success: !!profile,
        message: profile ? "Profile refreshed" : "Failed to refresh profile",
      });
    } catch (error) {
      setActionResult({
        type: "Refresh Profile",
        success: false,
        message: error.message || "Failed to refresh profile",
      });
    }
  };

  const handleRequestVerification = async () => {
    try {
      await requestEmailVerification(verificationEmail || user?.email);
      setActionResult({
        type: "Request Verification",
        success: true,
        message: "Verification email sent",
      });
    } catch (error) {
      setActionResult({
        type: "Request Verification",
        success: false,
        message: error.message || "Failed to send verification email",
      });
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await verifyEmail(verificationToken);
      setActionResult({
        type: "Verify Email",
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      setActionResult({
        type: "Verify Email",
        success: false,
        message: error.message || "Failed to verify email",
      });
    }
  };

  const handleRefreshToken = async () => {
    try {
      const token = await refreshAccessToken();
      setActionResult({
        type: "Refresh Token",
        success: !!token,
        message: token ? "Token refreshed" : "Failed to refresh token",
      });
    } catch (error) {
      setActionResult({
        type: "Refresh Token",
        success: false,
        message: error.message || "Failed to refresh token",
      });
    }
  };

  return (
    <div className="auth-hook-test" style={{ padding: "20px" }}>
      <h1>Auth Hook Test</h1>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <div style={{ margin: "20px 0" }}>
        <h2>Auth Status</h2>
        <p>
          <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </p>
        <p>
          <strong>Email Verified:</strong> {isEmailVerified ? "Yes" : "No"}
        </p>
        <p>
          <strong>Account Disabled:</strong> {accountDisabled ? "Yes" : "No"}
        </p>
      </div>

      {isAuthenticated ? (
        <div style={{ margin: "20px 0" }}>
          <h2>User Profile</h2>
          <p>
            <strong>ID:</strong> {user?.id}
          </p>
          <p>
            <strong>Username:</strong> {user?.username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleRefreshProfile}>Refresh Profile</button>
            <button onClick={handleRefreshToken}>Refresh Token</button>
          </div>
        </div>
      ) : (
        <div style={{ margin: "20px 0", display: "flex", gap: "20px" }}>
          <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Email:
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Password:
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
              <button type="submit">Login</button>
            </form>
          </div>

          <div>
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Username:
                  <input
                    type="text"
                    value={signupData.username}
                    onChange={(e) =>
                      setSignupData({ ...signupData, username: e.target.value })
                    }
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Email:
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Password:
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Confirm Password:
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
              <button type="submit">Signup</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ margin: "20px 0" }}>
        <h2>Email Verification</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Email:
            <input
              type="email"
              value={verificationEmail}
              onChange={(e) => setVerificationEmail(e.target.value)}
              placeholder={user?.email || "Enter email"}
              style={{ marginLeft: "10px" }}
            />
          </label>
          <button
            onClick={handleRequestVerification}
            style={{ marginLeft: "10px" }}
          >
            Request Verification
          </button>
        </div>
        <div>
          <label>
            Verification Token:
            <input
              type="text"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              style={{ marginLeft: "10px" }}
            />
          </label>
          <button onClick={handleVerifyEmail} style={{ marginLeft: "10px" }}>
            Verify Email
          </button>
        </div>
      </div>

      {actionResult && (
        <div
          style={{
            margin: "20px 0",
            padding: "15px",
            backgroundColor: actionResult.success ? "#dff0d8" : "#f2dede",
            borderRadius: "4px",
          }}
        >
          <h3>{actionResult.type} Result</h3>
          <p>{actionResult.message}</p>
          {actionResult.requiresVerification && (
            <p>
              <strong>Verification Required!</strong> Please check your email.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthHookTest;
