import React from "react";
import Spinner from "../../../components/ui/Spinner";

/**
 * AccountManager component for account-related actions
 */
const AccountManager = ({ handleDisableAccount, disablingAccount }) => {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">Account Management</h2>
      <div className="profile-account-actions">
        <button
          className="profile-btn-danger"
          onClick={handleDisableAccount}
          disabled={disablingAccount}
          tabIndex="0"
          aria-label="Disable account"
        >
          {disablingAccount ? (
            <>
              <Spinner size="small" message="" showMessage={false} />
              Disabling...
            </>
          ) : (
            "Disable Account"
          )}
        </button>
      </div>
    </section>
  );
};

export default AccountManager;
