import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "./Modal.css";

/**
 * Reusable Modal component
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  closeOnEscape = true,
  closeOnOverlayClick = true,
  size = "default",
  customWidth,
}) => {
  useEffect(() => {
    // Handle ESC key to close modal
    const handleEscKey = (e) => {
      if (closeOnEscape && isOpen && e.key === "Escape") {
        onClose();
      }
    };

    // Add event listener
    if (isOpen) {
      window.addEventListener("keydown", handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleEscKey);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = "visible";
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handler for overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Exit early if modal is not open
  if (!isOpen) return null;

  // Generate modal container class names
  const containerClassName =
    `modal__container modal__container--${size} ${className}`.trim();

  return (
    <div
      className="modal__overlay"
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div
        className={containerClassName}
        style={customWidth ? { maxWidth: customWidth } : undefined}
      >
        <div className="modal__header">
          {title && <h2 className="modal__title">{title}</h2>}
          <button
            className="modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
            tabIndex="0"
            data-testid="modal-close-button"
          >
            ×
          </button>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  closeOnEscape: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  size: PropTypes.oneOf(["small", "default", "large", "xlarge"]),
  customWidth: PropTypes.string,
};

export default Modal;
