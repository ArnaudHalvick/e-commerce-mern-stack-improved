import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import { validatePassword } from "../../../utils/validation";
import { FormSubmitButton } from "../../../components/form";
import "./PasswordManager.css";

/**
 * PasswordManager component for handling password changes
 */
const PasswordManager = ({
  passwordData,
  passwordErrors,
  isChangingPassword,
  handlePasswordInputChange,
  handlePasswordSubmit,
  togglePasswordChange,
  isSubmittingPassword,
}) => {
  const [isFormValid, setIsFormValid] = useState(false);

  // State to track individual password validations
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    match: false,
  });

  // Validate the entire form whenever password data or password errors change
  useEffect(() => {
    if (!isChangingPassword || !passwordData) {
      setIsFormValid(false);
      return;
    }

    // Check if any required fields are empty
    const hasEmptyField = Object.values(passwordData).some((val) => !val);

    // Check if there are any password errors
    const hasErrors = passwordErrors && Object.keys(passwordErrors).length > 0;

    // Form is valid only if all fields are filled and there are no errors
    setIsFormValid(!hasEmptyField && !hasErrors);
  }, [passwordData, passwordErrors, isChangingPassword]);

  // Validate individual password requirements with debouncing
  useEffect(() => {
    const validatePasswordDetails = () => {
      const { newPassword, confirmPassword } = passwordData;
      if (!newPassword) {
        setPasswordValidations({
          length: false,
          uppercase: false,
          number: false,
          special: false,
          match: false,
        });
        return;
      }

      // Use validatePassword from validation.js to get consistent results
      const result = validatePassword(newPassword);

      // Set visual validations based on the validation result details
      setPasswordValidations({
        length: result.details.length,
        uppercase: result.details.uppercase,
        number: result.details.number,
        special: result.details.special,
        match: confirmPassword && newPassword === confirmPassword,
      });
    };

    const debouncedValidate = debounce(validatePasswordDetails, 300);
    debouncedValidate();

    return () => {
      debouncedValidate.cancel();
    };
  }, [passwordData]);

  // Handle form submission
  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    handlePasswordSubmit(e);
  };

  // Determine input class based on validation state
  const getInputClass = (fieldName) => {
    return passwordErrors?.[fieldName]
      ? "profile-form-input error"
      : "profile-form-input";
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Password Management</h2>
        {!isChangingPassword && (
          <FormSubmitButton
            type="button"
            variant="secondary"
            text="Change Password"
            size="small"
            onClick={togglePasswordChange}
            disabled={isSubmittingPassword}
            aria-label="Open password change form"
          />
        )}
      </div>

      {isChangingPassword && (
        <form
          onSubmit={handleSubmitForm}
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
              aria-invalid={passwordErrors?.currentPassword ? "true" : "false"}
              aria-describedby={
                passwordErrors?.currentPassword
                  ? "currentPassword-error"
                  : undefined
              }
              disabled={isSubmittingPassword}
            />
            {passwordErrors?.currentPassword && (
              <p
                className="profile-field-error"
                id="currentPassword-error"
                role="alert"
              >
                {passwordErrors.currentPassword}
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
              aria-invalid={passwordErrors?.newPassword ? "true" : "false"}
              aria-describedby={
                passwordErrors?.newPassword
                  ? "newPassword-error"
                  : "newPassword-requirements"
              }
              disabled={isSubmittingPassword}
            />
            {passwordErrors?.newPassword && (
              <p
                className="profile-field-error"
                id="newPassword-error"
                role="alert"
              >
                {passwordErrors.newPassword}
              </p>
            )}

            <div
              id="newPassword-requirements"
              className="profile-password-requirements"
            >
              <h3>Password must:</h3>
              <ul>
                <li
                  className={passwordValidations.length ? "valid" : "invalid"}
                >
                  Be at least 8 characters
                </li>
                <li
                  className={
                    passwordValidations.uppercase ? "valid" : "invalid"
                  }
                >
                  Include at least 1 uppercase letter
                </li>
                <li
                  className={passwordValidations.number ? "valid" : "invalid"}
                >
                  Include at least 1 number
                </li>
                <li
                  className={passwordValidations.special ? "valid" : "invalid"}
                >
                  Include at least 1 special character
                </li>
              </ul>
            </div>
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
              aria-invalid={passwordErrors?.confirmPassword ? "true" : "false"}
              aria-describedby={
                passwordErrors?.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
              disabled={isSubmittingPassword}
            />
            {passwordErrors?.confirmPassword && (
              <p
                className="profile-field-error"
                id="confirmPassword-error"
                role="alert"
              >
                {passwordErrors.confirmPassword}
              </p>
            )}
            {passwordData.confirmPassword &&
              !passwordErrors?.confirmPassword && (
                <p
                  className={
                    passwordValidations.match
                      ? "profile-field-success"
                      : "profile-field-error"
                  }
                >
                  {passwordValidations.match
                    ? "Passwords match!"
                    : "Passwords do not match"}
                </p>
              )}
          </div>

          <div className="profile-form-actions">
            <div className="profile-button-group">
              <FormSubmitButton
                type="submit"
                text={isSubmittingPassword ? "Updating..." : "Update Password"}
                isLoading={isSubmittingPassword}
                disabled={!isFormValid || isSubmittingPassword}
                variant="primary"
                size="small"
                aria-label="Update password"
              />
              <FormSubmitButton
                type="button"
                text="Cancel"
                variant="secondary"
                size="small"
                onClick={togglePasswordChange}
                disabled={isSubmittingPassword}
                aria-label="Cancel password change"
              />
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default PasswordManager;
