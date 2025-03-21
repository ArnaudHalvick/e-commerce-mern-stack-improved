import React from "react";

/**
 * EmailVerification component for handling email verification status
 */
const EmailVerification = ({
  user,
  verificationRequested,
  handleResendVerification,
  loading,
  sendingVerification,
}) => {
  if (!user || user.isEmailVerified) {
    return null;
  }

  return (
    <div className="profile-verification-alert">
      <p>
        Your email is not verified. Please verify your email to access all
        features.
      </p>
      {verificationRequested ? (
        <p className="profile-verification-sent">
          Verification email sent! Please check your inbox.
        </p>
      ) : (
        <button
          className={
            sendingVerification ? "profile-btn-disabled" : "profile-btn-primary"
          }
          onClick={handleResendVerification}
          disabled={loading || sendingVerification}
        >
          {sendingVerification
            ? "Sending Verification Email..."
            : "Resend Verification Email"}
        </button>
      )}
    </div>
  );
};

export default EmailVerification;
