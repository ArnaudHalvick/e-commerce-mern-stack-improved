import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestEmailChange } from "../../../redux/slices/userSlice";
import Spinner from "../../../components/ui/Spinner";
import { useError } from "../../../context/ErrorContext";
import { isValidEmail } from "../../../utils/validation";

/**
 * EmailManager component for handling email change functionality
 * Uses schema-based validation from backend for instant feedback
 */
const EmailManager = ({ user, validationSchema, showSuccess, showError }) => {
  const dispatch = useDispatch();
  const { showError: contextShowError, showSuccess: contextShowSuccess } =
    useError();

  // Use passed error/success handlers if available, otherwise use from context
  const displayError = showError || contextShowError;
  const displaySuccess = showSuccess || contextShowSuccess;

  const loadingStates = useSelector((state) => state.user.loadingStates);
  const emailChangePending = useSelector(
    (state) => state.user.emailChangeRequested
  );

  const [isEditing, setIsEditing] = useState(false);
  const [emailData, setEmailData] = useState({ email: "" });
  const [fieldError, setFieldError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Set initial email data when user data is available
  useEffect(() => {
    if (user?.email) {
      setEmailData({ email: user.email });
    }
  }, [user]);

  // Validate form whenever email data or errors change
  useEffect(() => {
    // Form is valid if email is valid and different from current email
    const isValid =
      !fieldError &&
      emailData.email &&
      emailData.email.trim() !== "" &&
      emailData.email !== user?.email;

    setIsFormValid(isValid);
  }, [emailData, fieldError, user]);

  const handleEmailChange = (e) => {
    setEmailData({ email: e.target.value });
    // Clear any previous field error
    setFieldError(null);

    // Validate email on change to provide immediate feedback
    if (e.target.value && e.target.value.trim() !== "") {
      validateEmail(e.target.value, true);
    }
  };

  const validateEmail = (email, setError = true) => {
    let errorMessage = null;

    // Skip validation if we don't have validation rules
    if (!validationSchema?.email) {
      // Fallback to basic email validation if schema not available
      if (email && !isValidEmail(email)) {
        errorMessage = "Please enter a valid email address";
        if (setError) {
          setFieldError(errorMessage);
        }
        return false;
      }
      return true;
    }

    // Check if email is required
    if (validationSchema.email.required && (!email || email.trim() === "")) {
      errorMessage =
        validationSchema.email.requiredMessage || "Email is required";
      if (setError) {
        setFieldError(errorMessage);
      }
      return false;
    }

    // Using the pattern from backend validation
    if (validationSchema.email.pattern && email) {
      try {
        const pattern = new RegExp(validationSchema.email.pattern);
        if (!pattern.test(email)) {
          errorMessage =
            validationSchema.email.message || "Invalid email format";
          if (setError) {
            setFieldError(errorMessage);
          }
          return false;
        }
      } catch (error) {
        console.error("Invalid regex pattern:", error);
        // Fallback to basic validation if regex is invalid
        if (!isValidEmail(email)) {
          errorMessage = "Please enter a valid email address";
          if (setError) {
            setFieldError(errorMessage);
          }
          return false;
        }
      }
    }

    // Check if email is same as current
    if (email === user?.email) {
      errorMessage = "New email must be different from your current email";
      if (setError) {
        setFieldError(errorMessage);
      }
      return false;
    }

    return true;
  };

  const handleEmailSubmitWithValidation = async (e) => {
    e.preventDefault();

    // If form is not valid, show error and prevent submission
    if (!isFormValid) {
      displayError("Please fix the validation errors before submitting");
      return;
    }

    try {
      // Set loading state before making the request
      const response = await dispatch(
        requestEmailChange(emailData.email)
      ).unwrap();

      displaySuccess(
        "Verification email sent to your new address. Please verify to complete the email change."
      );
      setIsEditing(false);
    } catch (error) {
      setFieldError(
        typeof error === "string" ? error : "Failed to request email change"
      );
      displayError(error || "Failed to request email change");
    }
  };

  const getInputClass = () => {
    return fieldError ? "profile-form-input error" : "profile-form-input";
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
            disabled={loadingStates?.requestingEmailChange}
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
              disabled={loadingStates?.requestingEmailChange}
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
                isFormValid ? "profile-btn-primary" : "profile-btn-disabled"
              }
              disabled={loadingStates?.requestingEmailChange || !isFormValid}
            >
              {loadingStates?.requestingEmailChange ? (
                <>
                  <Spinner size="small" inline />
                  Sending Verification...
                </>
              ) : (
                "Request Email Change"
              )}
            </button>
            <button
              type="button"
              className="profile-btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setEmailData({ email: user?.email || "" });
                setFieldError(null);
              }}
              disabled={loadingStates?.requestingEmailChange}
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
