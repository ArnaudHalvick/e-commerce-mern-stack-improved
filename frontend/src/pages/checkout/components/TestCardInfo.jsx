import React from "react";
import "../styles/TestCardInfo.css";

const TestCardInfo = () => {
  return (
    <div className="checkout-test-card-info">
      <h4 className="checkout-test-card-title">Test Card Information</h4>
      <p className="checkout-test-card-detail">
        <strong>Card Number:</strong> 4242 4242 4242 4242
      </p>
      <p className="checkout-test-card-detail">
        <strong>Expiry:</strong> Any future date
      </p>
      <p className="checkout-test-card-detail">
        <strong>CVC:</strong> Any 3 digits
      </p>
      <h4 className="checkout-test-card-title">Other Test Cards</h4>
      <p className="checkout-test-card-detail">
        <strong>Decline:</strong> 4000 0000 0000 0002
      </p>
      <p className="checkout-test-card-detail">
        <strong>Insufficient funds:</strong> 4000 0000 0000 9995
      </p>
      <p className="checkout-test-card-detail">
        <strong>Error:</strong> 4000 0000 0000 0127
      </p>
    </div>
  );
};

export default TestCardInfo;
