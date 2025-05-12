import React from "react";
import Modal from "../../ui/modal/Modal";
import Button from "../../ui/button/Button";
import "../styles/common.css";

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="small"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      centered={true}
      className="product-edit-modal-confirm-discard"
    >
      <Modal.Header
        onClose={onCancel}
        className="product-edit-modal-confirm-discard-header"
      >
        {title}
      </Modal.Header>
      <Modal.Body>
        <p className="product-edit-modal-confirm-discard-text">{message}</p>
      </Modal.Body>
      <Modal.Footer className="product-edit-modal-confirm-discard-footer">
        <Button variant="secondary" onClick={onCancel}>
          No, Keep Editing
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Discard Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
