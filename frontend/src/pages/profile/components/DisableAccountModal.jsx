import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "../../../components/ui/modal";
import { FormSubmitButton, FormInput } from "../../../components/ui";

/**
 * Modal component for confirming account disabling with password verification
 */
const DisableAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  error,
}) => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required to disable your account");
      return;
    }

    // Clear error if exists
    setPasswordError("");

    // Call the confirm function with password
    onConfirm(password);
  };

  const handleChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disable Your Account"
      className="disable-account-modal"
      closeOnOverlayClick={!isProcessing}
      closeOnEscape={!isProcessing}
    >
      <div className="disable-account-modal__warning">
        <p>
          <strong>Warning:</strong> Disabling your account will prevent you from
          accessing your order history and saved information. This action can be
          reversed by contacting customer support.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="disable-account-modal__form">
        <div className="disable-account-modal__form-group">
          <FormInput
            type="password"
            name="password"
            label="Please enter your password to confirm:"
            value={password}
            onChange={handleChange}
            error={passwordError || error}
            className="disable-account-modal__input"
            disabled={isProcessing}
            aria-label="Password for account disabling"
            required={true}
          />
        </div>

        <div className="disable-account-modal__actions">
          <FormSubmitButton
            type="button"
            text="Cancel"
            variant="secondary"
            size="small"
            onClick={onClose}
            disabled={isProcessing}
          />
          <FormSubmitButton
            type="submit"
            text="Disable Account"
            loadingText="Processing..."
            isLoading={isProcessing}
            variant="danger"
            size="small"
            disabled={isProcessing}
          />
        </div>
      </form>
    </Modal>
  );
};

DisableAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
  error: PropTypes.string,
};

export default DisableAccountModal;
