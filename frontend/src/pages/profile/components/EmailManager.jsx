import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestEmailChange } from "../../../redux/slices/userSlice";
import { useError } from "../../../context/ErrorContext";

const EmailManager = ({ user, validationSchema, showSuccess, showError }) => {
  const dispatch = useDispatch();
  const { showError: contextShowError, showSuccess: contextShowSuccess } =
    useError();
  const displayError = showError || contextShowError;
  const displaySuccess = showSuccess || contextShowSuccess;

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
      validateEmail(e.target.value, true);
    }
  };

  const validateEmail = (email, setError = true) => {
    let errorMessage = null;

    // Check if schema validation is available
    if (!validationSchema?.email) {
      // Fallback validation if schema is not available
      const emailRegex =
        /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i;
      if (email && !emailRegex.test(email)) {
        errorMessage = "Please enter a valid email address";
        if (setError) setFieldError(errorMessage);
        return false;
      }
      return true;
    }

    // Use schema validation
    if (validationSchema.email.required && (!email || email.trim() === "")) {
      errorMessage =
        validationSchema.email.requiredMessage || "Email is required";
      if (setError) setFieldError(errorMessage);
      return false;
    }

    if (validationSchema.email.pattern && email) {
      try {
        const pattern = new RegExp(
          validationSchema.email.pattern,
          validationSchema.email.patternFlags || "i"
        );
        if (!pattern.test(email)) {
          errorMessage =
            validationSchema.email.message || "Invalid email format";
          if (setError) setFieldError(errorMessage);
          return false;
        }
      } catch (error) {
        console.error("Invalid regex pattern:", error);
        // Fallback validation
        const emailRegex =
          /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i;
        if (!emailRegex.test(email)) {
          errorMessage = "Please enter a valid email address";
          if (setError) setFieldError(errorMessage);
          return false;
        }
      }
    }

    // Business rule: email must be different
    if (email === user?.email) {
      errorMessage = "New email must be different from your current email";
      if (setError) setFieldError(errorMessage);
      return false;
    }

    return true;
  };

  const handleEmailSubmitWithValidation = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      displayError("Please fix the validation errors before submitting");
      return;
    }
    try {
      setIsLoading(true);
      await dispatch(requestEmailChange(emailData.email)).unwrap();
      displaySuccess(
        "Verification email sent to your new address. Please verify to complete the email change."
      );
      setIsEditing(false);
    } catch (error) {
      setFieldError(
        typeof error === "string" ? error : "Failed to request email change"
      );
      displayError(error || "Failed to request email change");
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
          <button
            className="profile-btn-secondary"
            onClick={() => setIsEditing(true)}
            tabIndex="0"
            aria-label="Edit email address"
            disabled={isLoading}
          >
            Edit
          </button>
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
          onSubmit={handleEmailSubmitWithValidation}
          className="profile-email-form"
          noValidate
        >
          <div className="profile-form-group">
            <label htmlFor="email" className="profile-form-label">
              Email Address{" "}
              {validationSchema?.email?.required && (
                <span className="profile-required">*</span>
              )}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={emailData.email}
              onChange={handleEmailChange}
              required={validationSchema?.email?.required}
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
            <button
              type="submit"
              className={
                isLoading || !isFormValid
                  ? "profile-btn-disabled"
                  : "profile-btn-primary"
              }
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Sending Verification..." : "Request Email Change"}
            </button>

            <button
              type="button"
              className="profile-btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default EmailManager;
