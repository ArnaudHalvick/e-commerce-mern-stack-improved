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
const EmailManager = ({
  user,
  validationSchema,
  setEmailVerificationStatus,
}) => {
  const dispatch = useDispatch();
  const { showError, showSuccess } = useError();
  const loadingStates = useSelector((state) => state.user.loadingStates);
  const emailChangePending = useSelector(
    (state) => state.user.emailChangeRequested
  );

  const [isEditing, setIsEditing] = useState(false);
  const [emailData, setEmailData] = useState({ email: "" });
  const [fieldError, setFieldError] = useState(null);

  // Set initial email data when user data is available
  useEffect(() => {
    if (user?.email) {
      setEmailData({ email: user.email });
    }
  }, [user]);

  const handleEmailChange = (e) => {
    setEmailData({ email: e.target.value });
    // Clear any previous field error
    setFieldError(null);

    // Validate email on change to provide immediate feedback
    if (e.target.value && e.target.value.trim() !== "") {
      validateEmail(e.target.value, false);
    }
  };

  const validateEmail = (email, setError = true) => {
    // Skip validation if we don't have validation rules
    if (!validationSchema?.email) {
      // Fallback to basic email validation if schema not available
      if (email && !isValidEmail(email)) {
        if (setError) {
          setFieldError("Please enter a valid email address");
        }
        return false;
      }
      return true;
    }

    // Check if email is required
    if (validationSchema.email.required && (!email || email.trim() === "")) {
      if (setError) {
        setFieldError(
          validationSchema.email.requiredMessage || "Email is required"
        );
      }
      return false;
    }

    // Using the pattern from backend validation
    if (validationSchema.email.pattern && email) {
      try {
        const pattern = new RegExp(validationSchema.email.pattern);
        if (!pattern.test(email)) {
          if (setError) {
            setFieldError(
              validationSchema.email.message || "Invalid email format"
            );
          }
          return false;
        }
      } catch (error) {
        console.error("Invalid regex pattern:", error);
        // Fallback to basic validation if regex is invalid
        if (!isValidEmail(email)) {
          if (setError) {
            setFieldError("Please enter a valid email address");
          }
          return false;
        }
      }
    }

    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submission
    if (!validateEmail(emailData.email)) {
      return;
    }

    // Don't submit if email hasn't changed
    if (emailData.email === user?.email) {
      setFieldError("New email must be different from your current email");
      return;
    }

    try {
      const response = await dispatch(
        requestEmailChange(emailData.email)
      ).unwrap();

      setEmailVerificationStatus({
        type: "success",
        message:
          "Verification email sent to your new address. Please verify to complete the email change.",
      });

      showSuccess("Verification email sent successfully!");
      setIsEditing(false);
    } catch (error) {
      setFieldError(
        typeof error === "string" ? error : "Failed to request email change"
      );
      showError(error || "Failed to request email change");
    }
  };

  const getInputClass = () => {
    return fieldError ? "form-input error" : "form-input";
  };

  return (
    <section className="profile-section email-manager-section">
      <div className="section-header">
        <h2 className="section-title">Email Management</h2>
        {!isEditing && (
          <button
            className="btn-secondary"
            onClick={() => setIsEditing(true)}
            tabIndex="0"
            aria-label="Edit email address"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">
              {user?.email || "Not provided"}
              {user?.isEmailVerified && (
                <span className="verified-badge">Verified</span>
              )}
              {!user?.isEmailVerified && (
                <span className="unverified-badge">Unverified</span>
              )}
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleEmailSubmit} noValidate className="email-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
              {validationSchema?.email?.required && (
                <span className="required">*</span>
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
              // Don't use pattern attribute directly - it can cause browser validation conflicts
              // pattern={validationSchema?.email?.pattern}
              title={
                validationSchema?.email?.message ||
                "Please enter a valid email address"
              }
              onBlur={() => validateEmail(emailData.email)}
            />
            {fieldError && (
              <div className="field-error" id="email-error" role="alert">
                {fieldError}
              </div>
            )}
            <p className="form-note">
              After changing your email, a verification link will be sent to the
              new address. Your email will only be updated after verification.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={
                loadingStates?.updatingProfile ||
                emailData.email === user?.email
              }
            >
              {loadingStates?.updatingProfile ? (
                <>
                  <Spinner size="small" message="" showMessage={false} />
                  Sending Verification...
                </>
              ) : (
                "Save Email"
              )}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setFieldError(null);
                setEmailData({ email: user?.email || "" });
              }}
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
