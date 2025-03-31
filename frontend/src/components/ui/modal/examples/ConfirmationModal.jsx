import React from "react";
import PropTypes from "prop-types";
import Modal from "../Modal";
import "./ConfirmationModal.css";

/**
 * A reusable confirmation modal component
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isProcessing = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="confirmation-modal"
      closeOnOverlayClick={!isProcessing}
      closeOnEscape={!isProcessing}
    >
      <div className="confirmation-modal__content">
        <p className="confirmation-modal__message">{message}</p>

        <div className="confirmation-modal__actions">
          <button
            className="confirmation-modal__button confirmation-modal__button--secondary"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Cancel action"
            tabIndex="0"
          >
            {cancelText}
          </button>
          <button
            className={`confirmation-modal__button confirmation-modal__button--${confirmVariant}`}
            onClick={onConfirm}
            disabled={isProcessing}
            aria-label="Confirm action"
            tabIndex="0"
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.node,
  message: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmVariant: PropTypes.oneOf(["primary", "success", "danger", "warning"]),
  isProcessing: PropTypes.bool,
};

export default ConfirmationModal;
