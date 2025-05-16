import React from "react";
import Modal from "./Modal";
import Button from "../button/Button";
import "./DeleteProductModal.css";

/**
 * A specialized modal for handling product deletion with information
 * about the soft-deletion process.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal should close
 * @param {Function} props.onConfirm - Function to call when deletion is confirmed
 * @param {string} props.productName - Name of the product being deleted
 * @param {boolean} props.isProcessing - Whether deletion is in progress
 */
const DeleteProductModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName = "this product",
  isProcessing = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      closeOnOverlayClick={!isProcessing}
      closeOnEscape={!isProcessing}
      centered={true}
      className="delete-product-modal"
    >
      <Modal.Header onClose={onClose} className="delete-product-modal-header">
        Delete Product
      </Modal.Header>
      <Modal.Body className="delete-product-modal-body">
        <div className="delete-product-modal-info">
          <p className="delete-product-modal-message">
            Are you sure you want to delete <strong>{productName}</strong>?
          </p>
          <div className="delete-product-modal-note">
            <strong>Note:</strong> Products are not permanently deleted. They
            will be:
            <ul>
              <li>Marked as deleted in the database</li>
              <li>Hidden from the customer-facing store</li>
              <li>Preserved for order history and reporting</li>
              <li>Available for restoration later if needed</li>
            </ul>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="delete-product-modal-footer">
        <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isProcessing}>
          {isProcessing ? "Deleting..." : "Delete Product"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteProductModal;
