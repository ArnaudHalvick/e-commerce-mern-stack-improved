import React from "react";

const OrderStatus = ({ orderStatus }) => {
  return (
    <div className="order-confirmation-status-container">
      <h2>Order Status</h2>
      <div className="order-confirmation-status">
        <div
          className={`order-confirmation-status-step ${
            orderStatus === "Processing" ||
            orderStatus === "Shipped" ||
            orderStatus === "Delivered"
              ? "active"
              : ""
          }`}
        >
          <div className="order-confirmation-status-icon">1</div>
          <div className="order-confirmation-status-text">Processing</div>
        </div>
        <div className="order-confirmation-status-line"></div>
        <div
          className={`order-confirmation-status-step ${
            orderStatus === "Shipped" || orderStatus === "Delivered"
              ? "active"
              : ""
          }`}
        >
          <div className="order-confirmation-status-icon">2</div>
          <div className="order-confirmation-status-text">Shipped</div>
        </div>
        <div className="order-confirmation-status-line"></div>
        <div
          className={`order-confirmation-status-step ${
            orderStatus === "Delivered" ? "active" : ""
          }`}
        >
          <div className="order-confirmation-status-icon">3</div>
          <div className="order-confirmation-status-text">Delivered</div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
