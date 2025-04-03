import React from "react";
import "./EmailVerification.css";

/**
 * EmailVerification component for handling email verification status
 */
const EmailVerification = ({ user, verificationRequested }) => {
  if (!user || user.isEmailVerified) {
    return null;
  }

  return (
    <div className="profile-verification-alert">
      <p>
        Your email is not verified. Please verify your email to access all
        features.
      </p>
      {verificationRequested && (
        <p className="profile-verification-sent">
          Verification email sent! Please check your inbox.
        </p>
      )}
    </div>
  );
};

export default EmailVerification;
