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
}) => {
  // Function to determine input class based on validation state
  const getInputClass = (fieldName) => {
    if (!fieldErrors) return "form-input";
    return fieldErrors[fieldName] ? "form-input error" : "form-input";
  };

  return (
    <section className="profile-section">
      <div className="section-header">
        <h2 className="section-title">Password Management</h2>
        {!isChangingPassword && (
          <button
            className="btn-secondary"
            onClick={() => setIsChangingPassword(true)}
            tabIndex="0"
            aria-label="Change password"
          >
            Change Password
          </button>
        )}
      </div>

      {isChangingPassword && (
        <form onSubmit={handlePasswordSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
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
            />
            {fieldErrors?.currentPassword && (
              <p
                className="field-error"
                id="currentPassword-error"
                role="alert"
              >
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              required
              minLength="8"
              className={getInputClass("newPassword")}
              aria-invalid={fieldErrors?.newPassword ? "true" : "false"}
              aria-describedby={
                fieldErrors?.newPassword ? "newPassword-error" : undefined
              }
            />
            {fieldErrors?.newPassword && (
              <p className="field-error" id="newPassword-error" role="alert">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              required
              minLength="8"
              className={getInputClass("confirmPassword")}
              aria-invalid={fieldErrors?.confirmPassword ? "true" : "false"}
              aria-describedby={
                fieldErrors?.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
            />
            {fieldErrors?.confirmPassword && (
              <p
                className="field-error"
                id="confirmPassword-error"
                role="alert"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={changingPassword}
            >
              {changingPassword ? (
                <>
                  <Spinner size="small" message="" showMessage={false} />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsChangingPassword(false)}
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
