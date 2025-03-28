import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useDispatch } from "react-redux";
import { requestEmailVerification } from "../../../redux/slices/userSlice";

/**
 * Banner component that displays a warning when the user's email is not verified.
 * Provides options to request a new verification email.
 */
const EmailVerificationBanner = () => {
  const { user, fetchUserProfile } = useContext(AuthContext);
  const dispatch = useDispatch();

  const [requestState, setRequestState] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const [refreshState, setRefreshState] = useState({
    loading: false,
    success: false,
    error: null,
  });

  // If user is verified or not logged in, don't show the banner.
  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    setRequestState({ loading: true, success: false, error: null });
    try {
      await dispatch(requestEmailVerification(user.email)).unwrap();
      setRequestState({ loading: false, success: true, error: null });
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || "Failed to send verification email";
      setRequestState({ loading: false, success: false, error: errorMessage });
    }
  };

  const handleForceRefresh = async () => {
    setRefreshState({ loading: true, success: false, error: null });
    try {
      await fetchUserProfile();
      setRefreshState({ loading: false, success: true, error: null });
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || "Failed to refresh verification status";
      setRefreshState({ loading: false, success: false, error: errorMessage });
    }
  };

  return (
    <div className="cart-email-verification-banner">
      <div className="cart-email-verification-content">
        <i
          className="fa fa-exclamation-triangle cart-email-verification-icon"
          aria-hidden="true"
        ></i>
        <div className="cart-email-verification-message">
          <h4 className="cart-email-verification-title">
            Email Verification Required
          </h4>
          <p className="cart-email-verification-text">
            Please verify your email address ({user.email}) to proceed with
            checkout.
          </p>

          {requestState.success ? (
            <p className="cart-email-verification-success-message">
              Verification email sent! Please check your inbox and spam folder.
            </p>
          ) : requestState.error ? (
            <p className="cart-email-verification-error-message">
              {requestState.error}
            </p>
          ) : null}

          {refreshState.error && (
            <p className="cart-email-verification-error-message">
              {refreshState.error}
            </p>
          )}

          <div className="cart-email-verification-actions">
            {!requestState.success && (
              <button
                className="cart-email-verification-resend-btn"
                onClick={handleResendVerification}
                disabled={requestState.loading}
              >
                {requestState.loading
                  ? "Sending..."
                  : "Resend Verification Email"}
              </button>
            )}

            <button
              className="cart-email-verification-refresh-btn"
              onClick={handleForceRefresh}
              disabled={refreshState.loading}
            >
              {refreshState.loading ? "Checking..." : "I Confirmed My Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
