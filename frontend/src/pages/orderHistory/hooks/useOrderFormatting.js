/**
 * Hook to provide formatting and styling utilities for order data
 * @returns {Object} Utility functions for formatting order data
 */
const useOrderFormatting = () => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Processing":
        return "order-history-status-processing";
      case "Shipped":
        return "order-history-status-shipped";
      case "Delivered":
        return "order-history-status-delivered";
      case "Cancelled":
        return "order-history-status-cancelled";
      default:
        return "order-history-status-processing";
    }
  };

  // Get status badge color
  const getStatusIconColor = (status) => {
    switch (status) {
      case "Processing":
        return "var(--color-warning-dark)";
      case "Shipped":
        return "var(--color-info-dark)";
      case "Delivered":
        return "var(--color-success-dark)";
      case "Cancelled":
        return "var(--color-danger-dark)";
      default:
        return "var(--color-warning-dark)";
    }
  };

  return {
    formatDate,
    getStatusBadgeClass,
    getStatusIconColor,
  };
};

export default useOrderFormatting;
