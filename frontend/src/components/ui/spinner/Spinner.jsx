import React from "react";
import "./Spinner.css";

/**
 * Spinner component for loading states
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display during loading
 * @param {string} props.size - Size of the spinner (small, medium, large)
 * @param {boolean} props.showAnimation - Whether to show the spinner animation (default: true)
 * @param {boolean} props.showMessage - Whether to show the message (default: true)
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} - Spinner component
 */
const Spinner = ({
  message = "Loading...",
  size = "medium",
  showAnimation = true,
  showMessage = true,
  className = "",
}) => {
  return (
    <div className={`spinner-container ${className}`}>
      {showAnimation && <div className={`spinner spinner-${size}`}></div>}
      {showMessage && message && (
        <div className="spinner-message">{message}</div>
      )}
    </div>
  );
};

export default Spinner;
