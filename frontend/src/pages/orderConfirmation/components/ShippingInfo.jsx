import React from "react";

const ShippingInfo = ({ shippingInfo }) => {
  return (
    <div className="order-confirmation-section">
      <h2 className="order-confirmation-section-title">Shipping Information</h2>
      <div className="order-confirmation-shipping-info">
        <p className="order-confirmation-shipping-detail">
          {shippingInfo.address}
        </p>
        <p className="order-confirmation-shipping-detail">
          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
        </p>
        <p className="order-confirmation-shipping-detail">
          {shippingInfo.country}
        </p>
        <p className="order-confirmation-shipping-detail">
          Phone: {shippingInfo.phoneNumber}
        </p>
      </div>
    </div>
  );
};

export default ShippingInfo;
