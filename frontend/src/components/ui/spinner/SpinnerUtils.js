import React from "react";
import Spinner from "./Spinner";
import "./SpinnerUtils.css";

/**
 * Creates a loading container with a centered spinner
 *
 * @param {Object} options - Configuration options
 * @param {string} options.message - The loading message
 * @param {string} options.size - Size of the spinner (small, medium, large)
 * @param {string} options.className - Additional CSS class for the container
 * @returns {JSX.Element} - Loading container with spinner
 */
export const LoadingContainer = ({
  message = "Loading...",
  size = "medium",
  className = "",
}) => {
  return (
    <div className={`loading-container ${className}`}>
      <Spinner message={message} size={size} />
    </div>
  );
};

/**
 * Creates an inline spinner for buttons or inline elements
 *
 * @param {Object} options - Configuration options
 * @param {string} options.size - Size of the spinner (small, medium, large)
 * @param {boolean} options.showMessage - Whether to show a message
 * @param {string} options.message - The loading message
 * @returns {JSX.Element} - Inline spinner
 */
export const InlineSpinner = ({
  size = "small",
  showMessage = false,
  message = "Loading...",
}) => {
  return (
    <Spinner
      size={size}
      showMessage={showMessage}
      message={message}
      className="inline-spinner"
    />
  );
};

/**
 * Creates a full-page loading overlay
 *
 * @param {Object} options - Configuration options
 * @param {string} options.message - The loading message
 * @param {string} options.size - Size of the spinner (small, medium, large)
 * @returns {JSX.Element} - Full-page loading overlay
 */
export const FullPageLoader = ({ message = "Loading...", size = "large" }) => {
  return (
    <div className="full-page-loader">
      <Spinner message={message} size={size} />
    </div>
  );
};
