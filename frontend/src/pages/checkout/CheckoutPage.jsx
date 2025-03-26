import React, { useState, useEffect, useCallback } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createPaymentIntent,
  confirmOrder,
} from "../../services/paymentService";
import { clearCart } from "../../redux/slices/cartSlice"; // Fix: Import from Redux slice
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "US",
    postalCode: "",
    phoneNumber: "",
  });

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

  // Initialize payment intent when component loads
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      // Don't create a payment intent until shipping info is complete
      if (!isShippingInfoValid()) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await createPaymentIntent(shippingInfo);
        setClientSecret(data.clientSecret);
        setPaymentInfo({
          amount: data.amount,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingAmount: data.shippingAmount,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initialize payment");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [shippingInfo, isShippingInfoValid]);

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

    if (!clientSecret) {
      setError(
        "Payment not initialized. Please check your shipping information."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    // Confirm card payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
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
      setIsLoading(false);
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
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      {error && <div className="checkout-error">{error}</div>}
      <div className="checkout-container">
        <div className="shipping-form-container">
          <h2>Shipping Information</h2>
          <form>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingInfoChange}
                  required
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="FR">France</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={shippingInfo.phoneNumber}
                onChange={handleShippingInfoChange}
                required
              />
            </div>
          </form>
        </div>

        <div className="payment-form-container">
          <h2>Payment Details</h2>
          {paymentInfo && (
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="order-summary-item">
                <span>Subtotal:</span>
                <span>${paymentInfo.subtotal.toFixed(2)}</span>
              </div>
              <div className="order-summary-item">
                <span>Tax:</span>
                <span>${paymentInfo.taxAmount.toFixed(2)}</span>
              </div>
              <div className="order-summary-item">
                <span>Shipping:</span>
                <span>${paymentInfo.shippingAmount.toFixed(2)}</span>
              </div>
              <div className="order-summary-item total">
                <span>Total:</span>
                <span>${paymentInfo.amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="card-element">Credit or debit card</label>
              <div className="card-element-container">
                <CardElement
                  id="card-element"
                  options={{
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
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                !stripe || !clientSecret || isLoading || !isShippingInfoValid()
              }
              className="pay-button"
            >
              {isLoading
                ? "Processing..."
                : `Pay $${
                    paymentInfo ? paymentInfo.amount.toFixed(2) : "0.00"
                  }`}
            </button>
          </form>

          <div className="test-card-info">
            <h4>Test Card Details:</h4>
            <p>Card Number: 4242 4242 4242 4242</p>
            <p>Expiry: Any future date (e.g., 12/25)</p>
            <p>CVC: Any 3 digits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
