import React from "react";
import { FormInputField } from "../../../components/form";
import "../styles/ShippingForm.css";

const ShippingForm = ({
  shippingInfo,
  handleShippingInfoChange,
  countries,
}) => {
  return (
    <div className="shipping-form-container">
      <h2 className="shipping-form-title">Shipping Information</h2>

      <form className="shipping-form">
        <FormInputField
          type="text"
          id="name"
          name="name"
          value={shippingInfo.name}
          onChange={handleShippingInfoChange}
          label="Name"
          containerClassName="shipping-form-group"
          required
        />

        <FormInputField
          type="text"
          id="address"
          name="address"
          value={shippingInfo.address}
          onChange={handleShippingInfoChange}
          label="Street Address"
          containerClassName="shipping-form-group"
          required
        />

        <div className="shipping-form-row">
          <FormInputField
            type="text"
            id="city"
            name="city"
            value={shippingInfo.city}
            onChange={handleShippingInfoChange}
            label="City"
            containerClassName="shipping-form-group"
            required
          />

          <FormInputField
            type="text"
            id="state"
            name="state"
            value={shippingInfo.state}
            onChange={handleShippingInfoChange}
            label="State/Province"
            containerClassName="shipping-form-group"
            required
          />
        </div>

        <div className="shipping-form-row">
          <FormInputField
            type="text"
            id="postalCode"
            name="postalCode"
            value={shippingInfo.postalCode}
            onChange={handleShippingInfoChange}
            label="Postal Code"
            containerClassName="shipping-form-group"
            required
          />

          <div className="shipping-form-group">
            <label htmlFor="country" className="form-field__label">
              Country
              <span className="form-field__required">*</span>
            </label>
            <div className="form-field__input-container">
              <select
                id="country"
                name="country"
                value={shippingInfo.country}
                onChange={handleShippingInfoChange}
                className="shipping-form-select"
                required
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <FormInputField
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={shippingInfo.phoneNumber}
          onChange={handleShippingInfoChange}
          label="Phone Number"
          containerClassName="shipping-form-group"
          required
        />
      </form>
    </div>
  );
};

export default ShippingForm;
