import React from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { FormSubmitButton } from "../../../components/form";
import "../styles/PaymentForm.css";

const PaymentForm = ({
  cardElementOptions,
  isLoading,
  onSubmit,
  disabled,
  totalAmount,
}) => {
  return (
    <div className="checkout-payment-form-container">
      <h2 className="checkout-payment-form-title">Payment Information</h2>
      <form className="checkout-payment-form" onSubmit={onSubmit}>
        <div className="checkout-payment-form-row checkout-payment-card-row">
          <div className="checkout-payment-form-group">
            <label className="checkout-payment-form-label">Card Number</label>
            <div className="checkout-payment-card-container">
              <CardNumberElement
                options={cardElementOptions}
                className="checkout-payment-stripe-element"
              />
            </div>
          </div>
        </div>

        <div className="checkout-payment-form-row checkout-payment-card-row">
          <div className="checkout-payment-form-group">
            <label className="checkout-payment-form-label">
              Expiration Date
            </label>
            <div className="checkout-payment-card-container">
              <CardExpiryElement
                options={cardElementOptions}
                className="checkout-payment-stripe-element"
              />
            </div>
          </div>

          <div className="checkout-payment-form-group">
            <label className="checkout-payment-form-label">CVC</label>
            <div className="checkout-payment-card-container">
              <CardCvcElement
                options={cardElementOptions}
                className="checkout-payment-stripe-element"
              />
            </div>
          </div>
        </div>

        <FormSubmitButton
          type="submit"
          disabled={disabled}
          isLoading={isLoading}
          loadingText="Processing payment..."
          text={`Pay $${totalAmount?.toFixed(2) || "0.00"}`}
          size="large"
          variant="primary"
        />
      </form>
    </div>
  );
};

export default PaymentForm;
