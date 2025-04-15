import React from "react";
import { formatDate } from "../utils/formatters";

const OrderHeader = ({ orderId, createdAt }) => {
  return (
    <>
      <div className="order-confirmation-success-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>

      <h1>Thank You For Your Order!</h1>
      <p className="order-confirmation-id">Order #{orderId}</p>
      <p className="order-confirmation-date">
        Placed on {formatDate(createdAt)}
      </p>
    </>
  );
};

export default OrderHeader;
