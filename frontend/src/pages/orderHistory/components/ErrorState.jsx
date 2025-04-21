import React from "react";
import { EmptyState } from "../../../components/errorHandling";

/**
 * Component to display an error state when order fetching fails
 *
 * @param {Object} props
 * @param {String} props.errorMessage - The error message to display
 * @param {Function} props.retryHandler - Function to retry the operation
 */
const ErrorState = ({ errorMessage, retryHandler }) => {
  return (
    <EmptyState
      title="Error Loading Orders"
      message={
        errorMessage ||
        "We're having trouble loading your orders. Please try again."
      }
      icon="⚠️"
      className="order-history-error-message"
      actions={[
        {
          label: "Try Again",
          onClick: retryHandler,
          type: "primary",
        },
        {
          label: "Return to Home",
          to: "/",
          type: "secondary",
        },
      ]}
    />
  );
};

export default ErrorState;
