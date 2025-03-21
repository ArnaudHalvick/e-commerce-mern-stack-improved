import React from "react";

/**
 * AccountManager component for account-related actions
 */
const AccountManager = ({ handleDisableAccount, disablingAccount }) => {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">Account Management</h2>
      <div className="profile-account-actions">
        <button
          className={
            disablingAccount ? "profile-btn-disabled" : "profile-btn-danger"
          }
          onClick={handleDisableAccount}
          disabled={disablingAccount}
          tabIndex="0"
          aria-label="Disable account"
        >
          {disablingAccount ? "Disabling Account..." : "Disable Account"}
        </button>
      </div>
      <div className="profile-account-warning">
        <p>
          <strong>Warning:</strong> Disabling your account will prevent you from
          accessing your order history and saved information. This action can be
          reversed by contacting customer support.
        </p>
      </div>
    </section>
  );
};

export default AccountManager;
