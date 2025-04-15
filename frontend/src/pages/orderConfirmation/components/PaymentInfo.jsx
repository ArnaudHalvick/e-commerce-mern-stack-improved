import React from "react";

const PaymentInfo = ({ paymentInfo }) => {
  return (
    <div className="order-confirmation-section">
      <h2>Payment Information</h2>
      <div className="order-confirmation-payment-info">
        <div className="order-confirmation-payment-row">
          <span>Method:</span>
          <span>Credit Card ({paymentInfo.paymentMethod})</span>
        </div>
        <div className="order-confirmation-payment-row">
          <span>Status:</span>
          <span className="order-confirmation-payment-status order-confirmation-status-success">
            {paymentInfo.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
