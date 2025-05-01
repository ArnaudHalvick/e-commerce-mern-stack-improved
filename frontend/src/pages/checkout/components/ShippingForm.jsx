import React from "react";
import { FormInputField } from "../../../components/form";
import { LoadingContainer } from "../../../components/ui/spinner";
import "../styles/ShippingForm.css";

const ShippingForm = ({
  shippingInfo,
  handleShippingInfoChange,
  countries,
  isLoading = false,
}) => {
  return (
    <div className="checkout-shipping-form-container">
      <h2 className="checkout-shipping-form-title">Shipping Information</h2>

      {isLoading ? (
        <LoadingContainer
          message="Loading your shipping details..."
          size="medium"
          className="checkout-shipping-form-loader"
        />
      ) : (
        <form className="checkout-shipping-form">
          <FormInputField
            type="text"
            id="name"
            name="name"
            value={shippingInfo.name}
            onChange={handleShippingInfoChange}
            label="Name"
            containerClassName="checkout-shipping-form-group"
            required
          />

          <FormInputField
            type="text"
            id="address"
            name="address"
            value={shippingInfo.address}
            onChange={handleShippingInfoChange}
            label="Street Address"
            containerClassName="checkout-shipping-form-group"
            required
          />

          <div className="checkout-shipping-form-row">
            <FormInputField
              type="text"
              id="city"
              name="city"
              value={shippingInfo.city}
              onChange={handleShippingInfoChange}
              label="City"
              containerClassName="checkout-shipping-form-group"
              required
            />

            <FormInputField
              type="text"
              id="state"
              name="state"
              value={shippingInfo.state}
              onChange={handleShippingInfoChange}
              label="State/Province"
              containerClassName="checkout-shipping-form-group"
              required
            />
          </div>

          <div className="checkout-shipping-form-row">
            <FormInputField
              type="text"
              id="postalCode"
              name="postalCode"
              value={shippingInfo.postalCode}
              onChange={handleShippingInfoChange}
              label="Postal Code"
              containerClassName="checkout-shipping-form-group"
              required
            />

            <FormInputField
              type="select"
              id="country"
              name="country"
              value={shippingInfo.country}
              onChange={handleShippingInfoChange}
              label="Country"
              containerClassName="checkout-shipping-form-group"
              className="checkout-shipping-form-select"
              options={countries.map((country) => ({
                value: country.code,
                label: country.name,
              }))}
              required
            />
          </div>

          <FormInputField
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={shippingInfo.phoneNumber}
            onChange={handleShippingInfoChange}
            label="Phone Number"
            containerClassName="checkout-shipping-form-group"
            required
          />
        </form>
      )}
    </div>
  );
};

export default ShippingForm;
