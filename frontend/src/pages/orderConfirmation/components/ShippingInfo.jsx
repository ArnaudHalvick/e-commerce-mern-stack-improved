import React from "react";

const ShippingInfo = ({ shippingInfo }) => {
  return (
    <div className="order-confirmation-section">
      <h2>Shipping Information</h2>
      <div className="order-confirmation-shipping-info">
        <p>{shippingInfo.address}</p>
        <p>
          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
        </p>
        <p>{shippingInfo.country}</p>
        <p>Phone: {shippingInfo.phoneNumber}</p>
      </div>
    </div>
  );
};

export default ShippingInfo;
