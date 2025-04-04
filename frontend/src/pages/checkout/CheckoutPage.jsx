import React from "react";
import {
  useShippingInfo,
  useCartSummary,
  useCheckoutSubmit,
  useCardElementOptions,
} from "./hooks";
import {
  ShippingForm,
  OrderSummary,
  PaymentForm,
  TestCardInfo,
} from "./components";
import "./styles/CheckoutPage.css";

const CheckoutPage = () => {
  // Use custom hooks
  const {
    shippingInfo,
    handleShippingInfoChange,
    isShippingInfoValid,
    getFormattedShippingInfo,
    COUNTRIES,
    isLoading: isLoadingShippingInfo,
  } = useShippingInfo();

  const {
    cartSummary,
    isLoading: isLoadingCartSummary,
    error: cartSummaryError,
  } = useCartSummary();

  const {
    handleSubmit,
    isLoading: isSubmitting,
    error: submitError,
    setError,
  } = useCheckoutSubmit();

  const cardElementOptions = useCardElementOptions();

  // Combines errors from different sources
  const error = submitError || cartSummaryError;

  // Handles form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // Only proceed if shipping info is valid and payment info is loaded
    if (!isShippingInfoValid()) {
      setError("Please fill out all shipping information fields.");
      return;
    }

    if (!cartSummary) {
      setError("Unable to process payment: cart information is missing.");
      return;
    }

    // Get formatted shipping info for API
    const formattedShippingInfo = getFormattedShippingInfo();

    // Process payment
    await handleSubmit(formattedShippingInfo, isShippingInfoValid);
  };

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-container">
        {/* Shipping Information Section */}
        <ShippingForm
          shippingInfo={shippingInfo}
          handleShippingInfoChange={handleShippingInfoChange}
          countries={COUNTRIES}
          isLoading={isLoadingShippingInfo}
        />

        {/* Payment Information Section */}
        <div className="checkout-payment-section">
          {/* Order Summary Component */}
          <OrderSummary
            cartSummary={cartSummary}
            isLoading={isLoadingCartSummary}
            error={cartSummaryError}
          />

          {/* Payment Form Component */}
          <PaymentForm
            cardElementOptions={cardElementOptions}
            isLoading={isSubmitting}
            onSubmit={onSubmit}
            disabled={!cartSummary || isSubmitting}
            totalAmount={cartSummary?.amount || 0}
          />

          {/* Test Card Info Component */}
          <TestCardInfo />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
