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
    <div className="payment-form-container">
      <h2 className="payment-form-title">Payment Information</h2>
      <form className="payment-form" onSubmit={onSubmit}>
        <div className="payment-form-row payment-card-row">
          <div className="payment-form-group">
            <label className="payment-form-label">Card Number</label>
            <div className="payment-card-container">
              <CardNumberElement
                options={cardElementOptions}
                className="payment-stripe-element"
              />
            </div>
          </div>
        </div>

        <div className="payment-form-row payment-card-row">
          <div className="payment-form-group">
            <label className="payment-form-label">Expiration Date</label>
            <div className="payment-card-container">
              <CardExpiryElement
                options={cardElementOptions}
                className="payment-stripe-element"
              />
            </div>
          </div>

          <div className="payment-form-group">
            <label className="payment-form-label">CVC</label>
            <div className="payment-card-container">
              <CardCvcElement
                options={cardElementOptions}
                className="payment-stripe-element"
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
