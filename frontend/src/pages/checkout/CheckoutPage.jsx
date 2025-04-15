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
import useErrorRedux from "../../hooks/useErrorRedux";
import "./styles/CheckoutPage.css";

const CheckoutPage = () => {
  // Use error Redux hook for global error handling
  const { showError, globalError } = useErrorRedux();

  // Use custom hooks
  const {
    shippingInfo,
    handleShippingInfoChange,
    isShippingInfoValid,
    getFormattedShippingInfo,
    COUNTRIES,
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
  } = useCheckoutSubmit();

  const cardElementOptions = useCardElementOptions();

  // Combines errors from different sources
  const error = submitError || cartSummaryError || globalError;

  // Handles form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // Only proceed if shipping info is valid and payment info is loaded
    if (!isShippingInfoValid()) {
      showError("Please fill out all shipping information fields.");
      return;
    }

    if (!cartSummary) {
      showError("Unable to process payment: cart information is missing.");
      return;
    }

    // Get formatted shipping info for API
    const formattedShippingInfo = getFormattedShippingInfo();

    // Process payment
    await handleSubmit(formattedShippingInfo, isShippingInfoValid);
  };

  // Always show the checkout page, regardless of loading state
  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-container">
        {/* Shipping Information Section - Always show this */}
        <ShippingForm
          shippingInfo={shippingInfo}
          handleShippingInfoChange={handleShippingInfoChange}
          countries={COUNTRIES}
        />

        {/* Payment Information Section */}
        <div className="checkout-payment-section">
          {/* Order Summary Component */}
          <OrderSummary
            cartSummary={cartSummary}
            isLoading={isLoadingCartSummary}
            error={cartSummaryError}
          />

          {/* Payment Form Component - Only show when cart has loaded */}
          {cartSummary && (
            <PaymentForm
              cardElementOptions={cardElementOptions}
              isLoading={isSubmitting}
              onSubmit={onSubmit}
              disabled={!cartSummary || isSubmitting}
              totalAmount={cartSummary?.amount || 0}
            />
          )}

          {/* Test Card Info Component */}
          <TestCardInfo />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
