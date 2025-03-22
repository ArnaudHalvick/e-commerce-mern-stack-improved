import React, { useEffect, useState } from "react";
import { useError } from "../../../context/ErrorContext";

/**
 * PasswordManager component for handling password changes
 * Uses schema-based validation from backend for instant feedback
 */
const PasswordManager = ({
  isChangingPassword,
  setIsChangingPassword,
  passwordData,
  handlePasswordInputChange,
  handlePasswordSubmit,
  loading,
  changingPassword,
  fieldErrors,
  validationSchema,
}) => {
  const { showError } = useError();
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form whenever password data or field errors change
  useEffect(() => {
    // Check if we have validation schema and data
    if (!validationSchema || !passwordData) {
      setIsFormValid(false);
      return;
    }

    // Check if any field is empty
    const hasEmptyField = Object.values(passwordData).some((val) => !val);

    // Check if there are any field errors
    const hasFieldErrors =
      fieldErrors &&
      Object.keys(fieldErrors).some(
        (key) =>
          fieldErrors[key] &&
          ["currentPassword", "newPassword", "confirmPassword"].includes(key)
      );

    // Form is valid if all fields have values and there are no errors
    setIsFormValid(!hasEmptyField && !hasFieldErrors);
  }, [passwordData, fieldErrors, validationSchema]);

  // Function to determine input class based on validation state
  const getInputClass = (fieldName) => {
    if (!fieldErrors) return "profile-form-input";
    return fieldErrors[fieldName]
      ? "profile-form-input error"
      : "profile-form-input";
  };

  // Get validation attributes for a field
  const getValidationAttributes = (fieldName) => {
    if (!validationSchema) return {};

    const fieldSchema = validationSchema[fieldName];
    if (!fieldSchema) return {};

    const attributes = {};

    // Don't add pattern directly to HTML - we'll handle validation in JavaScript
    // This avoids the regex syntax errors in browser validation

    // Add title with validation message
    if (fieldSchema.message) {
      attributes.title = fieldSchema.message;
    }

    // Add min length if it exists
    if (fieldSchema.minLength) {
      attributes.minLength = fieldSchema.minLength;
    }

    // Add max length if it exists
    if (fieldSchema.maxLength) {
      attributes.maxLength = fieldSchema.maxLength;
    }

    return attributes;
  };

  // Generate password requirements message based on validation schema
  const getPasswordRequirements = () => {
    if (!validationSchema?.newPassword) {
      return "Password should be secure with a mix of characters.";
    }

    const requirements = [];
    const schema = validationSchema.newPassword;

    if (schema.minLength) {
      requirements.push(`at least ${schema.minLength} characters long`);
    }

    // Check for pattern-based requirements
    if (schema.message) {
      // Extract common password requirements from the message
      if (schema.message.includes("uppercase")) {
        requirements.push("one uppercase letter");
      }
      if (schema.message.includes("number")) {
        requirements.push("one number");
      }
      if (schema.message.includes("special")) {
        requirements.push("one special character");
      }
    }

    return `Password must be ${requirements.join(" and include ")}.`;
  };

  // Handle form submission with validation
  const handleSubmitWithValidation = (e) => {
    e.preventDefault();

    // If form is not valid, show error and prevent submission
    if (!isFormValid) {
      showError("Please fix the validation errors before submitting");
      return;
    }

    // Proceed with submission
    handlePasswordSubmit(e);
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Password Management</h2>
        {!isChangingPassword && (
          <button
            className="profile-btn-secondary"
            onClick={() => setIsChangingPassword(true)}
            tabIndex="0"
            aria-label="Change password"
            disabled={loading || changingPassword}
          >
            Change Password
          </button>
        )}
      </div>

      {isChangingPassword && (
        <form
          onSubmit={handleSubmitWithValidation}
          noValidate
          className="profile-password-form"
        >
          <div className="profile-form-group">
            <label htmlFor="currentPassword" className="profile-form-label">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordInputChange}
              required
              className={getInputClass("currentPassword")}
              aria-invalid={fieldErrors?.currentPassword ? "true" : "false"}
              aria-describedby={
                fieldErrors?.currentPassword
                  ? "currentPassword-error"
                  : undefined
              }
              disabled={loading || changingPassword}
              {...getValidationAttributes("currentPassword")}
            />
            {fieldErrors?.currentPassword && (
              <p
                className="profile-field-error"
                id="currentPassword-error"
                role="alert"
              >
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="profile-form-group">
            <label htmlFor="newPassword" className="profile-form-label">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              required
              className={getInputClass("newPassword")}
              aria-invalid={fieldErrors?.newPassword ? "true" : "false"}
              aria-describedby={
                fieldErrors?.newPassword
                  ? "newPassword-error"
                  : "newPassword-requirements"
              }
              disabled={loading || changingPassword}
              {...getValidationAttributes("newPassword")}
            />
            {fieldErrors?.newPassword && (
              <p
                className="profile-field-error"
                id="newPassword-error"
                role="alert"
              >
                {fieldErrors.newPassword}
              </p>
            )}
            <p
              className="profile-password-requirements"
              id="newPassword-requirements"
            >
              {getPasswordRequirements()}
            </p>
          </div>

          <div className="profile-form-group">
            <label htmlFor="confirmPassword" className="profile-form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              required
              className={getInputClass("confirmPassword")}
              aria-invalid={fieldErrors?.confirmPassword ? "true" : "false"}
              aria-describedby={
                fieldErrors?.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
              disabled={loading || changingPassword}
              {...getValidationAttributes("confirmPassword")}
            />
            {fieldErrors?.confirmPassword && (
              <p
                className="profile-field-error"
                id="confirmPassword-error"
                role="alert"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              className={
                isFormValid ? "profile-btn-primary" : "profile-btn-disabled"
              }
              disabled={loading || changingPassword || !isFormValid}
            >
              {loading || changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>
            <button
              type="button"
              className="profile-btn-secondary"
              onClick={() => {
                // Reset password fields before closing
                handlePasswordInputChange({
                  target: { name: "currentPassword", value: "" },
                });
                handlePasswordInputChange({
                  target: { name: "newPassword", value: "" },
                });
                handlePasswordInputChange({
                  target: { name: "confirmPassword", value: "" },
                });
                setIsChangingPassword(false);
              }}
              disabled={loading || changingPassword}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default PasswordManager;
