import React from "react";

/**
 * EmailVerification component for handling email verification status
 */
const EmailVerification = ({
  user,
  verificationRequested,
  handleResendVerification,
  loading,
}) => {
  if (!user || user.isEmailVerified) {
    return null;
  }

  return (
    <div className="verification-alert">
      <p>
        Your email is not verified. Please verify your email to access all
        features.
      </p>
      {verificationRequested ? (
        <p className="verification-sent">
          Verification email sent! Please check your inbox.
        </p>
      ) : (
        <button
          className="btn-primary"
          onClick={handleResendVerification}
          disabled={loading}
        >
          {loading ? "Sending..." : "Resend Verification Email"}
        </button>
      )}
    </div>
  );
};

export default EmailVerification;
