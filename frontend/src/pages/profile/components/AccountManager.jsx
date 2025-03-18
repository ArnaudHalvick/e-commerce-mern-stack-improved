import React from "react";

/**
 * AccountManager component for account-related actions
 */
const AccountManager = ({ handleDisableAccount, loading }) => {
  return (
    <section className="profile-section">
      <h2 className="section-title">Account Management</h2>
      <div className="account-actions">
        <button
          className="btn-danger"
          onClick={handleDisableAccount}
          disabled={loading}
        >
          {loading ? "Disabling..." : "Disable Account"}
        </button>
      </div>
    </section>
  );
};

export default AccountManager;
