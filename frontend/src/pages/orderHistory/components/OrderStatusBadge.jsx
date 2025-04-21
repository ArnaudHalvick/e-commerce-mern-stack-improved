import React from "react";
import { useOrderFormatting } from "../hooks";

/**
 * A component to display the order status with appropriate styling
 *
 * @param {Object} props
 * @param {String} props.status - The order status text
 * @param {String} props.className - Additional CSS classes
 */
const OrderStatusBadge = ({ status, className = "" }) => {
  const { getStatusBadgeClass } = useOrderFormatting();
  const badgeClass = getStatusBadgeClass(status);

  return (
    <span
      className={`order-history-status-badge ${badgeClass} ${className}`}
      aria-label={`Order status: ${status}`}
      tabIndex="0"
    >
      {status}
    </span>
  );
};

export default OrderStatusBadge;
