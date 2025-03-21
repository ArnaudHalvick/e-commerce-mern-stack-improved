import React, { useState } from "react";
import Spinner from "../../../components/ui/Spinner";

/**
 * EmailManager component for email verification and changing email
 */
const EmailManager = ({
  user,
  email,
  isEmailVerified,
  handleEmailChange,
  handleEmailSubmit,
  verificationRequested,
  handleResendVerification,
  isChangingEmail,
  setIsChangingEmail,
  pendingEmail,
  fieldErrors,
  validationSchema,
  updatingEmail,
  sendingVerification,
}) => {
  // Get error and validation state
  const hasEmailError = fieldErrors?.pendingEmail;
  const isEmailValid = pendingEmail && !hasEmailError;

  // Get input class based on validation
  const getInputClass = (fieldName) => {
    return fieldErrors[fieldName] ? "form-input error" : "form-input";
  };

  // Return validation attributes based on schema
  const getValidationAttributes = (fieldName) => {
    const rules = validationSchema?.email || {};
    const attrs = {};

    if (rules.required) attrs.required = true;
    if (rules.minLength) attrs.minLength = rules.minLength;
    if (rules.maxLength) attrs.maxLength = rules.maxLength;
    if (rules.pattern) attrs.pattern = rules.pattern;

    return attrs;
  };

  return (
    <section className="profile-section">
      <h3 className="section-title">Email Management</h3>

      <div className="email-verification-status">
        <div className="detail-item">
          <span className="detail-label">Current Email:</span>
          <span className="detail-value">{email}</span>
          {isEmailVerified && <span className="verified-badge">Verified</span>}
        </div>

        {!isEmailVerified && (
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
                disabled={sendingVerification}
              >
                {sendingVerification
                  ? "Sending..."
                  : "Resend Verification Email"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="change-email-form">
        {!isChangingEmail ? (
          <button
            className="btn-secondary"
            onClick={() => setIsChangingEmail(true)}
          >
            Change Email
          </button>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="pendingEmail" className="form-label">
                New Email Address
                {validationSchema?.email?.required && (
                  <span className="required">*</span>
                )}
              </label>
              <input
                type="email"
                id="pendingEmail"
                name="pendingEmail"
                value={pendingEmail || ""}
                onChange={handleEmailChange}
                className={getInputClass("pendingEmail")}
                placeholder="Enter new email address"
                {...getValidationAttributes()}
              />
              {fieldErrors.pendingEmail && (
                <div className="field-error">{fieldErrors.pendingEmail}</div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={updatingEmail || !isEmailValid}
              >
                {updatingEmail ? (
                  <>
                    <Spinner size="small" message="" showMessage={false} />
                    Saving...
                  </>
                ) : (
                  "Update Email"
                )}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsChangingEmail(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default EmailManager;
