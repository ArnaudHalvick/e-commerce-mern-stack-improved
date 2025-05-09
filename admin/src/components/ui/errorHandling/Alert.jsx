import React from "react";
import "./Alert.css";

/**
 * Alert component for displaying inline notifications, warnings, and errors
 *
 * @param {Object} props - Component props
 * @param {string|React.ReactNode} props.children - Alert content
 * @param {string} [props.title] - Optional alert title
 * @param {string} [props.variant="info"] - Alert variant: 'success', 'error', 'warning', 'info'
 * @param {boolean} [props.dismissible=false] - Whether the alert can be dismissed
 * @param {Function} [props.onDismiss] - Function called when alert is dismissed
 * @param {boolean} [props.solid=false] - Whether to use solid background instead of light
 * @param {string} [props.className] - Additional CSS class names
 */
const Alert = ({
  children,
  title,
  variant = "info",
  dismissible = false,
  onDismiss,
  solid = false,
  className = "",
  ...rest
}) => {
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
        admin-alert 
        admin-alert-${variant} 
        ${solid ? "admin-alert-solid" : ""} 
        ${className}
      `}
      role="alert"
      {...rest}
    >
      <div className="admin-alert-icon">{getIcon()}</div>

      <div className="admin-alert-content">
        {title && <div className="admin-alert-title">{title}</div>}
        <div className="admin-alert-message">{children}</div>
      </div>

      {dismissible && (
        <button
          className="admin-alert-close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
