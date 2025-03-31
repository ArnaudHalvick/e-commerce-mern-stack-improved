import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "../../../components/ui/modal";
import FormSubmitButton from "../../../components/form/FormSubmitButton";
import "./DisableAccountModal.css";

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
          <label
            htmlFor="disable-account-password"
            className="disable-account-modal__label"
          >
            Please enter your password to confirm:
          </label>
          <input
            type="password"
            id="disable-account-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`disable-account-modal__input ${
              passwordError ? "disable-account-modal__input--error" : ""
            }`}
            disabled={isProcessing}
            aria-label="Password for account disabling"
            tabIndex="0"
          />
          {passwordError && (
            <div className="disable-account-modal__error-message">
              {passwordError}
            </div>
          )}
          {error && (
            <div className="disable-account-modal__error-message">{error}</div>
          )}
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
            text={isProcessing ? "Processing..." : "Disable Account"}
            variant="danger"
            size="small"
            isLoading={isProcessing}
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
