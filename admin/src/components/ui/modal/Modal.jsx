import React, { useEffect, useRef } from "react";
import "./Modal.css";

/**
 * Modal subcomponents
 */
const ModalHeader = ({ children, className = "", onClose, ...rest }) => {
  return (
    <div className={`admin-modal-header ${className}`} {...rest}>
      <div className="admin-modal-title">{children}</div>
      {onClose && (
        <button
          className="admin-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

const ModalBody = ({ children, className = "", ...rest }) => {
  return (
    <div className={`admin-modal-body ${className}`} {...rest}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className = "", ...rest }) => {
  return (
    <div className={`admin-modal-footer ${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Modal component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal should close
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.size='medium'] - Modal size: 'small', 'medium', 'large', 'full'
 * @param {boolean} [props.closeOnOverlayClick=false] - Whether to close modal when overlay is clicked
 * @param {boolean} [props.closeOnEscape=true] - Whether to close modal when escape key is pressed
 * @param {boolean} [props.centered=false] - Whether to center modal vertically
 * @param {string} [props.className] - Additional CSS classes
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  size = "medium",
  closeOnOverlayClick = false,
  closeOnEscape = true,
  centered = false,
  className = "",
  ...rest
}) => {
  const modalRef = useRef(null);

  // Handle click outside of modal
  const handleOverlayClick = (e) => {
    if (
      closeOnOverlayClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target)
    ) {
      onClose();
    }
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden"; // Prevent body scroll when modal is open
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "visible"; // Re-enable body scroll when modal closes
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className={`admin-modal admin-modal-${size} ${
          centered ? "admin-modal-centered" : ""
        } ${className}`}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
};

// Attach subcomponents
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
