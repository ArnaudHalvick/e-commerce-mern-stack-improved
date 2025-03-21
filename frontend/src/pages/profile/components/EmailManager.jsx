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
    return fieldError ? "profile-form-input error" : "profile-form-input";
  };

  return (
    <section className="profile-section email-manager-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Email Management</h2>
        {!isEditing && (
          <button
            className="profile-btn-secondary"
            onClick={() => setIsEditing(true)}
            tabIndex="0"
            aria-label="Edit email address"
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
          onSubmit={handleEmailSubmit}
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
              className="profile-btn-primary"
              disabled={loadingStates?.requestingEmailChange}
            >
              {loadingStates?.requestingEmailChange ? (
                <>
                  <Spinner size="small" message="" showMessage={false} />
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
