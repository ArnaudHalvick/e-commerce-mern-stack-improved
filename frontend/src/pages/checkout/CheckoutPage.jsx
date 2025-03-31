import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../../redux/slices/cartSlice";
import FormSubmitButton from "../../components/form/FormSubmitButton";
import Spinner from "../../components/ui/spinner";
import "./CheckoutPage.css";

import { paymentsService, authService } from "../../api";

// List of countries with ISO codes
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "BR", name: "Brazil" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
];

const CheckoutPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartSummary, setCartSummary] = useState(null);
  const [fetchingCartSummary, setFetchingCartSummary] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "US", // Default to US
    postalCode: "",
    phoneNumber: "",
  });

  // Memoize card element options to prevent re-renders
  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    }),
    []
  );

  // Load user profile and prefill shipping info
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await authService.getCurrentUser();
        const userData = response.user || {};

        // Only update shipping info fields that exist in user profile
        const userAddress = userData.address || {};
        const userPhone = userData.phone || "";

        // Convert country name to country code if needed
        let countryCode = userAddress.country || "US";
        if (countryCode.length > 2) {
          // If it's a full country name, try to match it to a code
          const foundCountry = COUNTRIES.find(
            (c) => c.name.toLowerCase() === countryCode.toLowerCase()
          );
          countryCode = foundCountry ? foundCountry.code : "US";
        }

        setShippingInfo((prevState) => ({
          ...prevState,
          name: userData.name || userData.username || "",
          address: userAddress.street || "",
          city: userAddress.city || "",
          state: userAddress.state || "",
          country: countryCode,
          postalCode: userAddress.zipCode || userAddress.postalCode || "",
          phoneNumber: userPhone,
        }));
      } catch (err) {
        console.error("Error loading user profile:", err);
        // Don't show error to user - just use empty shipping info
      }
    };

    loadUserProfile();
  }, []);

  // Wrap the shipping info validation function in useCallback and memoize it
  const isShippingInfoValid = useCallback(() => {
    return (
      shippingInfo.name &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.country &&
      shippingInfo.postalCode &&
      shippingInfo.phoneNumber
    );
  }, [
    shippingInfo.name,
    shippingInfo.address,
    shippingInfo.city,
    shippingInfo.state,
    shippingInfo.country,
    shippingInfo.postalCode,
    shippingInfo.phoneNumber,
  ]);

  // Fetch cart summary on component mount
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setFetchingCartSummary(true);
        const data = await paymentsService.getCartSummary();
        setCartSummary({
          amount: data.amount,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingAmount: data.shippingAmount,
        });
      } catch (err) {
        console.error("Failed to fetch cart summary:", err);
        setError("Failed to load cart summary. Please try again.");
      } finally {
        setFetchingCartSummary(false);
      }
    };

    fetchSummary();
  }, []);

  const handleShippingInfoChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!isShippingInfoValid()) {
      setError("Please fill out all shipping information fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format shipping address for API - the backend expects a nested structure
      const shippingAddress = {
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip: shippingInfo.postalCode,
        country: shippingInfo.country,
      };

      // Format shipping information as expected by the backend
      const shippingData = {
        shippingAddress,
        shippingMethod: "standard",
        name: shippingInfo.name,
        phoneNumber: shippingInfo.phoneNumber,
      };

      // 1. Create a payment intent on the server
      const intentResponse = await paymentsService.createPaymentIntent(
        shippingData
      );
      const { clientSecret } = intentResponse;

      if (!clientSecret) {
        throw new Error("Failed to create payment intent.");
      }

      // 2. Confirm the card payment
      const cardElement = elements.getElement(CardNumberElement);
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingInfo.name,
              address: {
                line1: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                postal_code: shippingInfo.postalCode,
                country: shippingInfo.country,
              },
            },
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === "succeeded") {
        // 3. Confirm the order
        const paymentMethodId = paymentIntent.payment_method;

        // Format shipping info for the backend
        const formattedShippingInfo = {
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country,
          postalCode: shippingInfo.postalCode,
          phoneNumber: shippingInfo.phoneNumber,
          name: shippingInfo.name,
        };

        const orderResponse = await paymentsService.confirmOrder(
          paymentIntent.id,
          paymentMethodId,
          formattedShippingInfo
        );

        // 4. Clear the cart and redirect to the order confirmation page
        dispatch(clearCart());
        navigate(`/order-confirmation/${orderResponse.order._id}`);
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>
      {error && <div className="checkout-error">{error}</div>}
      <div className="checkout-container">
        <div className="checkout-shipping-container">
          <h2 className="checkout-section-title">Shipping Information</h2>
          <form className="checkout-shipping-form">
            <div className="checkout-form-group">
              <label htmlFor="name" className="checkout-form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={shippingInfo.name}
                onChange={handleShippingInfoChange}
                className="checkout-form-input"
                required
              />
            </div>

            <div className="checkout-form-group">
              <label htmlFor="address" className="checkout-form-label">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange}
                className="checkout-form-input"
                required
              />
            </div>

            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label htmlFor="city" className="checkout-form-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingInfoChange}
                  className="checkout-form-input"
                  required
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="state" className="checkout-form-label">
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingInfoChange}
                  className="checkout-form-input"
                  required
                />
              </div>
            </div>

            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label htmlFor="postalCode" className="checkout-form-label">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingInfoChange}
                  className="checkout-form-input"
                  required
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="country" className="checkout-form-label">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingInfoChange}
                  className="checkout-form-select"
                  required
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="checkout-form-group">
              <label htmlFor="phoneNumber" className="checkout-form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={shippingInfo.phoneNumber}
                onChange={handleShippingInfoChange}
                className="checkout-form-input"
                required
              />
            </div>
          </form>
        </div>

        <div className="checkout-payment-container">
          <h2 className="checkout-section-title">Payment Information</h2>

          {fetchingCartSummary ? (
            <div className="checkout-summary-loading">
              <Spinner message="Loading cart summary..." size="small" />
            </div>
          ) : cartSummary ? (
            <div className="checkout-order-summary">
              <h3 className="checkout-summary-title">Order Summary</h3>
              <div className="checkout-summary-item">
                <span className="checkout-item-label">Subtotal:</span>
                <span className="checkout-item-value">
                  ${cartSummary.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="checkout-summary-item">
                <span className="checkout-item-label">Shipping:</span>
                <span className="checkout-item-value">
                  ${cartSummary.shippingAmount.toFixed(2)}
                </span>
              </div>
              <div className="checkout-summary-item">
                <span className="checkout-item-label">Tax:</span>
                <span className="checkout-item-value">
                  ${cartSummary.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="checkout-summary-item checkout-total">
                <span className="checkout-item-label">Total:</span>
                <span className="checkout-item-value">
                  ${cartSummary.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="checkout-summary-error">
              Failed to load cart summary
            </div>
          )}

          <form className="checkout-payment-form" onSubmit={handleSubmit}>
            <div className="checkout-form-row checkout-card-row">
              <div className="checkout-form-group">
                <label className="checkout-form-label">Card Number</label>
                <div className="checkout-card-container">
                  <CardNumberElement
                    options={cardElementOptions}
                    className="checkout-stripe-element"
                  />
                </div>
              </div>
            </div>

            <div className="checkout-form-row checkout-card-row">
              <div className="checkout-form-group">
                <label className="checkout-form-label">Expiration Date</label>
                <div className="checkout-card-container">
                  <CardExpiryElement
                    options={cardElementOptions}
                    className="checkout-stripe-element"
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-form-label">CVC</label>
                <div className="checkout-card-container">
                  <CardCvcElement
                    options={cardElementOptions}
                    className="checkout-stripe-element"
                  />
                </div>
              </div>
            </div>

            <FormSubmitButton
              type="submit"
              disabled={!stripe || !cartSummary}
              isLoading={isLoading}
              loadingText="Processing payment..."
              text={`Pay $${
                cartSummary ? cartSummary.amount.toFixed(2) : "0.00"
              }`}
              size="large"
              variant="primary"
            />
          </form>

          <div className="checkout-test-card-info">
            <h4 className="checkout-test-card-title">
              Test Card Information (For Development)
            </h4>
            <p className="checkout-test-card-detail">
              Card Number: 4242 4242 4242 4242
            </p>
            <p className="checkout-test-card-detail">Expiry: Any future date</p>
            <p className="checkout-test-card-detail">CVC: Any 3 digits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
