import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { requestEmailVerification } from "../../redux/slices/userSlice";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import StatusIcon from "./components/StatusIcon";

// Styles
import "./styles/Verification.css";
import "./styles/VerifyPending.css";

/**
 * Verification pending page - shown after registration
 */
const VerifyPending = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const email = location.state?.email || "";

  const [resendStatus, setResendStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const handleResendVerification = async () => {
    if (!email) {
      setResendStatus({
        loading: false,
        success: false,
        error: "Email address not available. Please go back to registration.",
      });
      return;
    }

    setResendStatus({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await dispatch(requestEmailVerification(email)).unwrap();
      setResendStatus({
        loading: false,
        success: true,
        error: null,
      });
    } catch (err) {
      setResendStatus({
        loading: false,
        success: false,
        error: err || "Failed to resend verification email",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleResendVerification();
    }
  };

  return (
    <div className="verification-container">
      <Breadcrumb
        routes={[{ label: "HOME", path: "/" }, { label: "VERIFY ACCOUNT" }]}
      />

      <div className="verification-content">
        <h1 className="verification-title">Verify Your Account</h1>

        <div className="verification-pending">
          <StatusIcon status="success" />

          <h2>Almost there!</h2>

          <p>
            We've sent a verification email to <strong>{email}</strong>. Please
            check your inbox and click the verification link to complete your
            registration.
          </p>

          <div className="info-box" role="alert">
            <p>
              <i className="fas fa-info-circle" aria-hidden="true"></i>
              If you don't see the email, please check your spam or junk folder.
            </p>
          </div>

          {resendStatus.success ? (
            <div className="resend-success" role="status" aria-live="polite">
              <p>
                A new verification email has been sent! Please check your inbox.
              </p>
            </div>
          ) : resendStatus.error ? (
            <div className="resend-error" role="alert">
              <p>{resendStatus.error}</p>
            </div>
          ) : null}

          <div className="actions-container">
            <button
              onClick={handleResendVerification}
              onKeyDown={handleKeyDown}
              disabled={resendStatus.loading || resendStatus.success}
              className="btn-secondary"
              tabIndex="0"
              aria-label={
                resendStatus.loading
                  ? "Sending verification email"
                  : resendStatus.success
                  ? "Email has been sent"
                  : "Resend verification email"
              }
            >
              {resendStatus.loading
                ? "Sending..."
                : resendStatus.success
                ? "Email Sent!"
                : "Resend Verification Email"}
            </button>

            <Link
              to="/login"
              className="btn-primary"
              tabIndex="0"
              aria-label="Return to login page"
            >
              Return to Login
            </Link>
          </div>

          <div className="help-text">
            <p>
              After verifying your email, you'll be able to log in and enjoy all
              the features of our store.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPending;
