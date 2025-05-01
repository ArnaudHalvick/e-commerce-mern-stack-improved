import React from "react";
import Spinner from "../../../components/ui/spinner";
import "../styles/OrderSummary.css";

const OrderSummary = ({ cartSummary, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="checkout-order-summary-loading">
        <Spinner message="Loading cart summary..." size="small" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-order-summary-error">
        Failed to load cart summary
      </div>
    );
  }

  if (!cartSummary) {
    return (
      <div className="checkout-order-summary-empty">Your cart is empty</div>
    );
  }

  return (
    <div className="checkout-order-summary">
      <h3 className="checkout-order-summary-title">Order Summary</h3>
      <div className="checkout-order-summary-item">
        <span className="checkout-order-item-label">Subtotal:</span>
        <span className="checkout-order-item-value">
          ${cartSummary.subtotal.toFixed(2)}
        </span>
      </div>
      <div className="checkout-order-summary-item">
        <span className="checkout-order-item-label">Shipping:</span>
        <span className="checkout-order-item-value">
          ${cartSummary.shippingAmount.toFixed(2)}
        </span>
      </div>
      <div className="checkout-order-summary-item">
        <span className="checkout-order-item-label">Tax:</span>
        <span className="checkout-order-item-value">
          ${cartSummary.taxAmount.toFixed(2)}
        </span>
      </div>
      <div className="checkout-order-summary-item checkout-order-total">
        <span className="checkout-order-item-label">Total:</span>
        <span className="checkout-order-item-value">
          ${cartSummary.amount.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;
