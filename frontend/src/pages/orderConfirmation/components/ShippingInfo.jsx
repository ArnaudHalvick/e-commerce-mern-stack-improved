import React from "react";
import { COUNTRIES } from "../../../utils/validationSchemas";

const ShippingInfo = ({ shippingInfo }) => {
  // Convert country code to country name
  const getCountryName = (countryCode) => {
    if (!countryCode) return "";

    const country = COUNTRIES.find((country) => country.code === countryCode);
    return country ? country.name : countryCode;
  };

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
          {getCountryName(shippingInfo.country)}
        </p>
        <p className="order-confirmation-shipping-detail">
          Phone: {shippingInfo.phoneNumber}
        </p>
      </div>
    </div>
  );
};

export default ShippingInfo;
