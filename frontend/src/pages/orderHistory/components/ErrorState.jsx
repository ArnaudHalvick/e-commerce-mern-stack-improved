import React from "react";

/**
 * Component to display an error state when order fetching fails
 *
 * @param {Object} props
 * @param {String} props.errorMessage - The error message to display
 * @param {Function} props.retryHandler - Function to retry the operation
 */
const ErrorState = ({ errorMessage, retryHandler }) => {
  return (
    <div className="order-error-state">
      <div className="order-error-icon">⚠️</div>
      <div className="order-error-message">
        {errorMessage ||
          "We're having trouble loading your orders. Please try again."}
      </div>
      <button
        className="order-error-retry-btn"
        onClick={retryHandler}
        aria-label="Try loading orders again"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorState;
