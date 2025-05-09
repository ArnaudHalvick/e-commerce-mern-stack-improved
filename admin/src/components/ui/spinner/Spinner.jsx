import React from "react";
import "./Spinner.css";

/**
 * Loading spinner component
 *
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Spinner size: 'small', 'medium', 'large'
 * @param {string} [props.variant='primary'] - Spinner color variant: 'primary', 'secondary', 'light', 'dark'
 * @param {string} [props.label] - Accessibility label for screen readers
 * @param {boolean} [props.fullPage=false] - Whether spinner should take full page
 * @param {string} [props.className] - Additional CSS classes
 */
const Spinner = ({
  size = "medium",
  variant = "primary",
  label = "Loading...",
  fullPage = false,
  className = "",
  ...rest
}) => {
  const spinnerContent = (
    <div
      className={`admin-spinner admin-spinner-${size} admin-spinner-${variant} ${className}`}
      role="status"
      aria-label={label}
      {...rest}
    >
      <div className="admin-spinner-circle"></div>
      <span className="admin-spinner-sr-only">{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="admin-spinner-fullpage">{spinnerContent}</div>;
  }

  return spinnerContent;
};

/**
 * Overlay spinner component - shows a spinner with an overlay
 */
Spinner.Overlay = ({ children, isLoading, ...props }) => {
  if (!isLoading) return children;

  return (
    <div className="admin-spinner-overlay-container">
      {children}
      <div className="admin-spinner-overlay">
        <Spinner {...props} />
      </div>
    </div>
  );
};

export default Spinner;
