import React, { useState } from "react";
import FormSubmitButton from "../../../components/form/FormSubmitButton";

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

  // Exit early if modal is not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container disable-account-modal">
        <div className="modal-header">
          <h2>Disable Your Account</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close modal"
            tabIndex="0"
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="modal-warning">
            <p>
              <strong>Warning:</strong> Disabling your account will prevent you
              from accessing your order history and saved information. This
              action can be reversed by contacting customer support.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="disable-account-password">
                Please enter your password to confirm:
              </label>
              <input
                type="password"
                id="disable-account-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "input-error" : ""}
                disabled={isProcessing}
                aria-label="Password for account disabling"
                tabIndex="0"
              />
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="modal-actions">
              <FormSubmitButton
                type="button"
                text="Cancel"
                variant="secondary"
                onClick={onClose}
                disabled={isProcessing}
              />
              <button
                type="submit"
                className={
                  isProcessing
                    ? "modal-submit-btn-disabled"
                    : "modal-submit-btn-danger"
                }
                disabled={isProcessing}
                tabIndex="0"
                aria-label="Confirm account disabling"
              >
                {isProcessing ? "Processing..." : "Disable Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisableAccountModal;
