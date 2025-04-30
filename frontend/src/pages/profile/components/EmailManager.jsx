import React from "react";
import { useSelector } from "react-redux";
import { FormSubmitButton } from "../../../components/form";

const EmailManager = ({
  user,
  handleResendVerification,
  isVerificationSending,
}) => {
  const verificationRequested = useSelector(
    (state) => state.user.verificationRequested
  );

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Email</h2>
      </div>

      <div className="profile-profile-details">
        <div className="profile-detail-item">
          <span className="profile-detail-label">Email:</span>
          <span className="profile-detail-value">
            {user?.email}
            {user?.isEmailVerified ? (
              <span className="profile-verified-badge">Verified</span>
            ) : (
              <span className="profile-unverified-badge">Unverified</span>
            )}
          </span>
        </div>
        {!user?.isEmailVerified && (
          <div className="profile-verification-actions">
            <FormSubmitButton
              type="button"
              variant="secondary"
              size="small"
              text={
                isVerificationSending
                  ? "Sending..."
                  : "Resend Verification Email"
              }
              isLoading={isVerificationSending}
              onClick={handleResendVerification}
              disabled={isVerificationSending}
              aria-label="Resend email verification"
            />
          </div>
        )}
        {verificationRequested && (
          <div className="profile-verification-message success">
            <p>
              Verification email sent. Please check your inbox to verify your
              email address.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EmailManager;
