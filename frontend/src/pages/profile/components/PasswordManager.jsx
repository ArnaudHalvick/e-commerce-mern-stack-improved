import React from "react";
import Spinner from "../../../components/ui/Spinner";

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

    // Add pattern if it exists
    if (fieldSchema.pattern) {
      attributes.pattern = fieldSchema.pattern;
    }

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
          >
            Change Password
          </button>
        )}
      </div>

      {isChangingPassword && (
        <form
          onSubmit={handlePasswordSubmit}
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
                fieldErrors?.newPassword ? "newPassword-error" : undefined
              }
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
            <p className="profile-password-requirements">
              Password must be at least{" "}
              {validationSchema?.newPassword?.minLength || 8} characters long
              and include at least one uppercase letter, one number, and one
              special character.
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
              className="profile-btn-primary"
              disabled={loading || changingPassword}
            >
              {loading || changingPassword ? (
                <>
                  <Spinner size="small" message="" showMessage={false} />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </button>
            <button
              type="button"
              className="profile-btn-secondary"
              onClick={() => setIsChangingPassword(false)}
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
