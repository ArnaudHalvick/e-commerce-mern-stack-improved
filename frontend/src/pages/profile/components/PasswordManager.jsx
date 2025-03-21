import React from "react";

/**
 * PasswordManager component for handling password changes
 */
const PasswordManager = ({
  isChangingPassword,
  setIsChangingPassword,
  passwordData,
  handlePasswordInputChange,
  handlePasswordSubmit,
  loading,
  changingPassword,
}) => {
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
        <form onSubmit={handlePasswordSubmit}>
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
              className="form-input"
            />
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
              className="form-input"
            />
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
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={changingPassword}
            >
              {changingPassword ? "Updating..." : "Update Password"}
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
