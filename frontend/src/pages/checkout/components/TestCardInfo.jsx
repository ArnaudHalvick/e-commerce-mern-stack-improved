import React from "react";
import "../styles/TestCardInfo.css";

const TestCardInfo = () => {
  return (
    <div className="test-card-info">
      <h4 className="test-card-title">
        Test Card Information (For Development)
      </h4>
      <p className="test-card-detail">Card Number: 4242 4242 4242 4242</p>
      <p className="test-card-detail">Expiry: Any future date</p>
      <p className="test-card-detail">CVC: Any 3 digits</p>
    </div>
  );
};

export default TestCardInfo;
