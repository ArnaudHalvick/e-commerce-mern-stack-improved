import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestEmailChange } from "../../../redux/slices/userSlice";
import { validateEmail } from "../../../utils/validation";
import { FormSubmitButton } from "../../../components/form";
import "./EmailManager.css";

const EmailManager = ({
  user,
  handleResendVerification,
  isVerificationSending,
}) => {
  const dispatch = useDispatch();
  const emailChangePending = useSelector(
    (state) => state.user.emailChangeRequested
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState({ email: "" });
  const [fieldError, setFieldError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmailData({ email: user.email });
    }
  }, [user]);

  useEffect(() => {
    // Form is valid if there's no error, an email exists and is different from current email.
    const valid =
      !fieldError &&
      emailData.email &&
      emailData.email.trim() !== "" &&
      emailData.email !== user?.email;
    setIsFormValid(valid);
  }, [emailData, fieldError, user]);

  const handleEmailChange = (e) => {
    setEmailData({ email: e.target.value });
    setFieldError(null);
    if (e.target.value && e.target.value.trim() !== "") {
      validateEmailField(e.target.value, true);
    }
  };

  const validateEmailField = (email, setError = true) => {
    let errorMessage = null;

    // Validate email using our utility function
    const validation = validateEmail(email);
    if (!validation.isValid) {
      errorMessage = validation.message;
      if (setError) setFieldError(errorMessage);
      return false;
    }

    // Business rule: email must be different
    if (email === user?.email) {
      errorMessage = "New email must be different from your current email";
      if (setError) setFieldError(errorMessage);
      return false;
    }

    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(requestEmailChange(emailData.email)).unwrap();
      setIsEditing(false);
    } catch (error) {
      setFieldError(
        typeof error === "string" ? error : "Failed to request email change"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = () =>
    fieldError ? "profile-form-input error" : "profile-form-input";

  const handleCancel = () => {
    setEmailData({ email: user?.email || "" });
    setFieldError(null);
    setIsEditing(false);
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Email Management</h2>
        {!isEditing && (
          <FormSubmitButton
            type="button"
            variant="secondary"
            size="small"
            text="Edit"
            onClick={() => setIsEditing(true)}
            disabled={isLoading || isVerificationSending}
            aria-label="Edit email address"
          />
        )}
      </div>

      {!isEditing ? (
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
                onClick={handleResendVerification}
                disabled={isVerificationSending}
                aria-label="Resend email verification"
              />
            </div>
          )}
          {emailChangePending && (
            <div className="profile-verification-message success">
              <p>
                Email change request pending. Please check your inbox to verify
                the new email address.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleEmailSubmit}
          className="profile-email-form"
          noValidate
        >
          <div className="profile-form-group">
            <label htmlFor="email" className="profile-form-label">
              Email Address <span className="profile-required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={emailData.email}
              onChange={handleEmailChange}
              required={true}
              className={getInputClass()}
              aria-invalid={fieldError ? "true" : "false"}
              aria-describedby={fieldError ? "email-error" : undefined}
              disabled={isLoading}
            />
            {fieldError && (
              <div
                className="profile-field-error"
                id="email-error"
                role="alert"
              >
                {fieldError}
              </div>
            )}
            <p className="profile-form-note">
              A verification link will be sent to the new email address. The
              change will not take effect until you verify the new email.
            </p>
          </div>

          <div className="profile-form-actions">
            <FormSubmitButton
              type="submit"
              text={
                isLoading ? "Sending Verification..." : "Request Email Change"
              }
              isLoading={isLoading}
              disabled={!isFormValid || isLoading}
              variant="primary"
              size="small"
              aria-label="Submit email change request"
            />

            <FormSubmitButton
              type="button"
              text="Cancel"
              variant="secondary"
              size="small"
              onClick={handleCancel}
              disabled={isLoading}
              aria-label="Cancel email edit"
            />
          </div>
        </form>
      )}
    </section>
  );
};

export default EmailManager;
