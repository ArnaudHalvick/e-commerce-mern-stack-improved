import React, { useState } from "react";
import { useAuth } from "../../../hooks/state";
import "./EmailVerificationBanner.css";

/**
 * Banner component that displays a warning when the user's email is not verified.
 * Provides options to request a new verification email and check verification status.
 */
const EmailVerificationBanner = () => {
  const { user, fetchUserProfile, requestEmailVerification } = useAuth();

  const [requestState, setRequestState] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const [refreshState, setRefreshState] = useState({
    loading: false,
    success: false,
    error: null,
    checked: false,
    verified: false,
  });

  // If user is verified or not logged in, don't show the banner.
  if (!user || user.isEmailVerified) {
    return null;
  }

  // Handle email verification request
  const handleVerificationRequest = async () => {
    setRequestState({ loading: true, success: false, error: null });
    try {
      await requestEmailVerification(user.email);
      setRequestState({ loading: false, success: true, error: null });
    } catch (err) {
      setRequestState({
        loading: false,
        success: false,
        error: err.message || "Failed to send verification email",
      });
    }
  };

  const handleForceRefresh = async () => {
    setRefreshState({
      ...refreshState,
      loading: true,
      checked: false,
      error: null,
    });

    try {
      const userData = await fetchUserProfile();

      // Check if the email is now verified
      const isVerified = userData?.isEmailVerified || false;

      setRefreshState({
        loading: false,
        success: true,
        error: null,
        checked: true,
        verified: isVerified,
      });

      // If verified, the component will be unmounted in the next render
      // So we don't need to handle that case
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || "Failed to check verification status";

      setRefreshState({
        loading: false,
        success: false,
        error: errorMessage,
        checked: true,
        verified: false,
      });
    }
  };

  return (
    <div className="cart-items-email-verification-banner">
      <div className="cart-items-email-verification-content">
        <i
          className="fa fa-exclamation-triangle cart-items-email-verification-icon"
          aria-hidden="true"
        ></i>
        <div className="cart-items-email-verification-message">
          <h4 className="cart-items-email-verification-title">
            Email Verification Required
          </h4>
          <p className="cart-items-email-verification-text">
            Please verify your email address ({user.email}) to proceed with
            checkout.
          </p>

          {/* Show email sending feedback */}
          {requestState.success ? (
            <p className="cart-items-email-verification-success-message">
              Verification email sent! Please check your inbox and spam folder.
            </p>
          ) : requestState.error ? (
            <p className="cart-items-email-verification-error-message">
              {requestState.error}
            </p>
          ) : null}

          {/* Show verification check feedback */}
          {refreshState.checked &&
            !refreshState.verified &&
            !refreshState.error && (
              <p className="cart-items-email-verification-warning-message">
                Your email is still not verified. Please check your inbox and
                click the verification link.
              </p>
            )}

          {refreshState.error && (
            <p className="cart-items-email-verification-error-message">
              {refreshState.error}
            </p>
          )}

          <div className="cart-items-email-verification-actions">
            {!requestState.success && (
              <button
                className="cart-items-email-verification-resend-btn"
                onClick={handleVerificationRequest}
                disabled={requestState.loading}
              >
                {requestState.loading
                  ? "Sending..."
                  : "Resend Verification Email"}
              </button>
            )}

            <button
              className="cart-items-email-verification-refresh-btn"
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
