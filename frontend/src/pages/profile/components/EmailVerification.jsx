import React from "react";
import FormSubmitButton from "../../../components/form/FormSubmitButton";

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
        <FormSubmitButton
          type="button"
          text={
            sendingVerification
              ? "Sending Verification Email..."
              : "Resend Verification Email"
          }
          isLoading={sendingVerification}
          disabled={loading || sendingVerification}
          variant="primary"
          onClick={handleResendVerification}
        />
      )}
    </div>
  );
};

export default EmailVerification;
