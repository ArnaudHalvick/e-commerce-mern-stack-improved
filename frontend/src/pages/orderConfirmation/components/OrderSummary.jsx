import React from "react";

const OrderSummary = ({ order }) => {
  return (
    <div className="order-confirmation-section">
      <h2>Order Summary</h2>
      <div className="order-confirmation-summary">
        <div className="order-confirmation-summary-row">
          <span>Items Total:</span>
          <span>${order.itemsPrice.toFixed(2)}</span>
        </div>
        <div className="order-confirmation-summary-row">
          <span>Shipping:</span>
          <span>${order.shippingAmount.toFixed(2)}</span>
        </div>
        <div className="order-confirmation-summary-row">
          <span>Tax:</span>
          <span>${order.taxAmount.toFixed(2)}</span>
        </div>
        <div className="order-confirmation-summary-row order-confirmation-total">
          <span>Total:</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
