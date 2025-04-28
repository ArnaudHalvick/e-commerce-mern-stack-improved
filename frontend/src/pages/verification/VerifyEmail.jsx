import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/state";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import Spinner from "../../components/ui/spinner";
import StatusMessage from "./components/StatusMessage";
import ResendForm from "./components/ResendForm";

// Hooks
import useEmailVerification from "./hooks/useEmailVerification";

// Styles
import "./styles/Verification.css";

/**
 * Email verification page
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isAuthenticated } = useAuth();

  const {
    verifyingToken,
    verificationStatus,
    resendForm,
    handleResendVerification,
  } = useEmailVerification(token);

  // Early return for loading state
  if (verifyingToken) {
    return (
      <div className="verification-container">
        <Breadcrumb
          routes={[{ label: "Home", path: "/" }, { label: "Verify Email" }]}
        />
        <div className="verification-content">
          <h1 className="verification-title">Email Verification</h1>
          <Spinner
            message="Verifying your email..."
            size="medium"
            className="verification-email-spinner"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: "Verify Email" }]}
      />

      <div className="verification-content">
        <h1 className="verification-title">Email Verification</h1>

        <StatusMessage
          message={verificationStatus.message}
          success={verificationStatus.success}
        >
          {verificationStatus.success ? (
            <div className="verification-success-actions">
              <p>You can now enjoy all features of our platform.</p>
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="verification-btn-primary"
                  tabIndex="0"
                  aria-label="Go to your profile"
                >
                  Go to Your Profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="verification-btn-primary"
                  tabIndex="0"
                  aria-label="Login now"
                >
                  Login Now
                </Link>
              )}
              <Link
                to="/"
                className="verification-btn-secondary"
                tabIndex="0"
                aria-label="Continue shopping"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="verification-error-actions">
              {resendForm.success ? (
                <div className="verification-resend-success">
                  <p>Verification email sent! Please check your inbox.</p>
                  <Link
                    to="/login"
                    className="verification-btn-secondary verification-mt-3"
                    tabIndex="0"
                    aria-label="Return to login"
                  >
                    Return to Login
                  </Link>
                </div>
              ) : (
                <>
                  <p>
                    {verificationStatus.expired
                      ? "Your verification link has expired. Please request a new one."
                      : "If you're having trouble, you can request a new verification email."}
                  </p>

                  <ResendForm
                    onResend={handleResendVerification}
                    success={resendForm.success}
                    error={resendForm.error}
                    loading={resendForm.loading}
                  />
                </>
              )}
            </div>
          )}
        </StatusMessage>
      </div>
    </div>
  );
};

export default VerifyEmail;
