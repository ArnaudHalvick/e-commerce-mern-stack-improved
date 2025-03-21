import React from "react";
import Spinner from "../../../components/ui/Spinner";

/**
 * AccountManager component for account-related actions
 */
const AccountManager = ({ handleDisableAccount, disablingAccount }) => {
  return (
    <section className="profile-section">
      <h2 className="section-title">Account Management</h2>
      <div className="account-actions">
        <button
          className="btn-danger"
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
