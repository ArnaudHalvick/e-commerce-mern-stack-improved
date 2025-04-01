import React, { useState } from "react";
import "../styles/ToastStyles.css";

/**
 * Toast Component - Displays a notification message
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - The type of toast (error, warning, success, info)
 * @param {function} props.onClose - Function to call when closing the toast
 * @param {number} props.duration - Duration before auto-close in ms (optional)
 */
const Toast = ({ id, message, type = "error", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Set toast icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      case "error":
      default:
        return "✕";
    }
  };

  // Handle close button click
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose(id);
    }, 300); // Wait for exit animation
  };

  // Handle keyboard interaction for accessibility
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClose();
    }
  };

  return isVisible ? (
    <div
      className={`toast ${type} ${isExiting ? "toast-exit" : "toast-enter"}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <div
        className="toast-close"
        onClick={handleClose}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Close notification"
      >
        ✕
      </div>
    </div>
  ) : null;
};

export default Toast;
