import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import { validatePassword } from "../../../utils/validation";
import { FormSubmitButton, FormInput } from "../../../components/ui";

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
          className="password-manager-form"
        >
          <div className="profile-form-group">
            <FormInput
              type="password"
              name="currentPassword"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={handlePasswordInputChange}
              required={true}
              className="profile-form-input"
              error={passwordErrors?.currentPassword}
              disabled={isSubmittingPassword}
            />
          </div>

          <div className="profile-form-group">
            <FormInput
              type="password"
              name="newPassword"
              label="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              required={true}
              className="profile-form-input"
              error={passwordErrors?.newPassword}
              disabled={isSubmittingPassword}
              aria-describedby="newPassword-requirements"
            />

            <div
              id="newPassword-requirements"
              className="password-manager-requirements"
            >
              <h3 className="password-manager-requirements-text">
                Password must:
              </h3>
              <ul className="password-manager-requirements-list">
                <li
                  className={`password-manager-requirements-item ${
                    passwordValidations.length ? "valid" : "invalid"
                  }`}
                >
                  Be at least 8 characters
                </li>
                <li
                  className={`password-manager-requirements-item ${
                    passwordValidations.uppercase ? "valid" : "invalid"
                  }`}
                >
                  Include at least 1 uppercase letter
                </li>
                <li
                  className={`password-manager-requirements-item ${
                    passwordValidations.number ? "valid" : "invalid"
                  }`}
                >
                  Include at least 1 number
                </li>
                <li
                  className={`password-manager-requirements-item ${
                    passwordValidations.special ? "valid" : "invalid"
                  }`}
                >
                  Include at least 1 special character
                </li>
              </ul>
            </div>
          </div>

          <div className="profile-form-group">
            <FormInput
              type="password"
              name="confirmPassword"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              required={true}
              className="profile-form-input"
              error={passwordErrors?.confirmPassword}
              disabled={isSubmittingPassword}
            />

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
                text="Update Password"
                loadingText="Updating..."
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
