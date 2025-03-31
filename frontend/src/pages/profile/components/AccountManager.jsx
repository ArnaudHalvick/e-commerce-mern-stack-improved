import React, { useState } from "react";
import DisableAccountModal from "./DisableAccountModal";
import FormSubmitButton from "../../../components/form/FormSubmitButton";

/**
 * AccountManager component for account-related actions
 */
const AccountManager = ({ handleDisableAccount, disablingAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError("");
  };

  const handleCloseModal = () => {
    if (!disablingAccount) {
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
          text={disablingAccount ? "Disabling Account..." : "Disable Account"}
          isLoading={disablingAccount}
          disabled={disablingAccount}
          variant="danger"
          onClick={handleOpenModal}
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
        isProcessing={disablingAccount}
        error={error}
      />
    </section>
  );
};

export default AccountManager;
