import React, { useState, useEffect } from "react";
import "./Toast.css";

/**
 * Toast notification component for temporary messages
 *
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display
 * @param {string} [props.variant="info"] - Variant: 'success', 'error', 'warning', 'info'
 * @param {number} [props.duration=3000] - Duration in ms before auto-dismissing (0 for no auto-dismiss)
 * @param {boolean} [props.isVisible=true] - Whether the toast is visible
 * @param {Function} [props.onClose] - Function to call when toast is closed
 * @param {string} [props.position="top-right"] - Position: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
 * @param {string} [props.className] - Additional CSS classes
 */
const Toast = ({
  message,
  variant = "info",
  duration = 3000,
  isVisible = true,
  onClose,
  position = "top-right",
  className = "",
  ...rest
}) => {
  const [visible, setVisible] = useState(isVisible);

  // Handle auto-dismiss
  useEffect(() => {
    setVisible(isVisible);

    let timer;
    if (isVisible && duration > 0) {
      timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, duration, onClose]);

  // Handle animation end (when toast is dismissed)
  const handleAnimationEnd = (e) => {
    if (e.animationName === "admin-toast-exit" && !visible) {
      if (onClose) onClose();
    }
  };

  if (!isVisible && !visible) return null;

  // Icon based on variant
  const getIcon = () => {
    switch (variant) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`
        admin-toast 
        admin-toast-${variant} 
        admin-toast-${position} 
        ${visible ? "admin-toast-enter" : "admin-toast-exit"}
        ${className}
      `}
      role="alert"
      aria-live="assertive"
      onAnimationEnd={handleAnimationEnd}
      {...rest}
    >
      <div className="admin-toast-icon">{getIcon()}</div>
      <div className="admin-toast-content">{message}</div>
      <button
        className="admin-toast-close"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
