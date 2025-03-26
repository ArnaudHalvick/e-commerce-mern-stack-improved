import React, { useState, useEffect, useCallback } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createPaymentIntent,
  confirmOrder,
  fetchCartSummary,
} from "../../services/paymentService";
import { clearCart } from "../../redux/slices/cartSlice"; // Fix: Import from Redux slice
import authApi from "../../services/authApi"; // Import for user profile
import "./CheckoutPage.css";

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
  const [clientSecret, setClientSecret] = useState("");
  const [cartSummary, setCartSummary] = useState(null);
  const [fetchingCartSummary, setFetchingCartSummary] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "US", // Default to US
    postalCode: "",
    phoneNumber: "",
  });

  // Common options for card elements - fixed to work properly
  const cardElementOptions = {
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
  };

  // Load user profile and prefill shipping info
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await authApi.getProfile();

        // Only update shipping info fields that exist in user profile
        const userAddress = userData.user.address || {};
        const userPhone = userData.user.phone || "";

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
          address: userAddress.street || "",
          city: userAddress.city || "",
          state: userAddress.state || "",
          country: countryCode,
          postalCode: userAddress.zipCode || "",
          phoneNumber: userPhone,
        }));
      } catch (err) {
        console.error("Error loading user profile:", err);
        // Don't show error to user - just use empty shipping info
      }
    };

    loadUserProfile();
  }, []);

  // Wrap the shipping info validation function in useCallback
  const isShippingInfoValid = useCallback(() => {
    return (
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.country &&
      shippingInfo.postalCode &&
      shippingInfo.phoneNumber
    );
  }, [shippingInfo]);

  // Fetch cart summary on component mount
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setFetchingCartSummary(true);
        const data = await fetchCartSummary();
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

  const handleShippingInfoChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!isShippingInfoValid()) {
      setError("Please fill in all shipping information fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent only when submitting the form
      const paymentData = await createPaymentIntent(shippingInfo);
      setClientSecret(paymentData.clientSecret);

      // Confirm card payment with separated card elements
      const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: "Customer Name", // Consider collecting this
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

      if (result.error) {
        setError(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          try {
            const orderData = await confirmOrder(
              result.paymentIntent.id,
              shippingInfo
            );

            // Clear the cart after a successful order
            dispatch(clearCart());

            // Navigate to success page with order info
            navigate(`/order-confirmation/${orderData.order._id}`, {
              state: { orderDetails: orderData.order },
            });
          } catch (err) {
            setError(err.response?.data?.message || "Failed to confirm order");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Add passive event listeners to improve touch performance
  useEffect(() => {
    const addPassiveListeners = () => {
      const options = { passive: true };
      document.addEventListener("touchstart", () => {}, options);
      document.addEventListener("touchmove", () => {}, options);
    };

    addPassiveListeners();

    // Cleanup on unmount
    return () => {
      document.removeEventListener("touchstart", () => {});
      document.removeEventListener("touchmove", () => {});
    };
  }, []);

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>
      {error && <div className="checkout-error">{error}</div>}
      <div className="checkout-container">
        <div className="shipping-form-container">
          <h2 className="section-title">Shipping Information</h2>
          <form className="shipping-form">
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange}
                required
                aria-label="Shipping address"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingInfoChange}
                  required
                  aria-label="City"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingInfoChange}
                  required
                  aria-label="State"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingInfoChange}
                  required
                  aria-label="Country"
                  className="form-select"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="postalCode" className="form-label">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingInfoChange}
                  required
                  aria-label="Postal code"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={shippingInfo.phoneNumber}
                onChange={handleShippingInfoChange}
                required
                aria-label="Phone number"
                className="form-input"
              />
            </div>
          </form>
        </div>

        <div className="payment-form-container">
          <h2 className="section-title">Payment Details</h2>
          {fetchingCartSummary ? (
            <div className="order-summary-loading">
              Loading order summary...
            </div>
          ) : cartSummary ? (
            <div className="order-summary">
              <h3 className="summary-title">Order Summary</h3>
              <div className="order-summary-item">
                <span className="item-label">Subtotal:</span>
                <span className="item-value">
                  ${cartSummary.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="order-summary-item">
                <span className="item-label">Tax:</span>
                <span className="item-value">
                  ${cartSummary.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="order-summary-item">
                <span className="item-label">Shipping:</span>
                <span className="item-value">
                  ${cartSummary.shippingAmount.toFixed(2)}
                </span>
              </div>
              <div className="order-summary-item total">
                <span className="item-label">Total:</span>
                <span className="item-value">
                  ${cartSummary.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="order-summary-error">
              Unable to load order summary. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="card-number" className="form-label">
                Card Number
              </label>
              <div className="card-element-container">
                <CardNumberElement
                  id="card-number"
                  options={cardElementOptions}
                  className="stripe-element"
                />
              </div>
            </div>

            <div className="form-row card-row">
              <div className="form-group">
                <label htmlFor="card-expiry" className="form-label">
                  Expiry Date
                </label>
                <div className="card-element-container">
                  <CardExpiryElement
                    id="card-expiry"
                    options={cardElementOptions}
                    className="stripe-element"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="card-cvc" className="form-label">
                  CVC
                </label>
                <div className="card-element-container">
                  <CardCvcElement
                    id="card-cvc"
                    options={cardElementOptions}
                    className="stripe-element"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!stripe || isLoading || !isShippingInfoValid()}
              className="pay-button"
            >
              {isLoading
                ? "Processing..."
                : `Pay $${
                    cartSummary ? cartSummary.amount.toFixed(2) : "0.00"
                  }`}
            </button>
          </form>

          <div className="test-card-info">
            <h4 className="test-card-title">Test Card Details:</h4>
            <p className="test-card-detail">Card Number: 4242 4242 4242 4242</p>
            <p className="test-card-detail">
              Expiry: Any future date (e.g., 12/25)
            </p>
            <p className="test-card-detail">CVC: Any 3 digits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
