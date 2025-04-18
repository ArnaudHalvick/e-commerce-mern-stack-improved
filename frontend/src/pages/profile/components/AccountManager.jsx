import React, { useState } from "react";
import DisableAccountModal from "./DisableAccountModal";
import { FormSubmitButton } from "../../../components/form";

/**
 * AccountManager component for account-related actions
 */
const AccountManager = ({ handleDisableAccount, isDisablingAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError("");
  };

  const handleCloseModal = () => {
    if (!isDisablingAccount) {
      setIsModalOpen(false);
      setError("");
    }
  };

  const handleConfirmDisable = (password) => {
    if (!password?.trim()) {
      setError("Password is required to disable your account");
      return;
    }

    // Clear previous errors
    setError("");

    // Call parent handler with password
    handleDisableAccount(password).catch((err) => {
      setError(err || "Failed to disable account");
    });
  };

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">Account Management</h2>
      <div className="profile-account-actions">
        <FormSubmitButton
          type="button"
          text={isDisablingAccount ? "Disabling Account..." : "Disable Account"}
          isLoading={isDisablingAccount}
          disabled={isDisablingAccount}
          variant="danger"
          size="small"
          onClick={handleOpenModal}
          aria-label="Open disable account confirmation"
        />
      </div>
      <div className="profile-account-warning">
        <p>
          <strong>Warning:</strong> Disabling your account will prevent you from
          accessing your order history and saved information. This action can be
          reversed by contacting customer support.
        </p>
      </div>

      {/* Account disable confirmation modal */}
      <DisableAccountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDisable}
        isProcessing={isDisablingAccount}
        error={error}
      />
    </section>
  );
};

export default AccountManager;
