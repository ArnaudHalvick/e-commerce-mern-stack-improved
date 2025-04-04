import { useState, useCallback } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../../../redux/slices/cartSlice";
import { paymentsService } from "../../../api";
import useErrorRedux from "../../../hooks/useErrorRedux";

const useCheckoutSubmit = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError, setError: setGlobalError, globalError } = useErrorRedux();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (formattedShippingInfo, isShippingInfoValid) => {
      if (!stripe || !elements) {
        // Stripe.js has not loaded yet
        return;
      }

      if (!isShippingInfoValid()) {
        showError("Please fill out all shipping information fields.");
        return;
      }

      setIsLoading(true);
      setGlobalError(null);

      try {
        // Step 1: Create payment intent on the server
        const { clientSecret } = await paymentsService.createPaymentIntent(
          formattedShippingInfo
        );

        // Step 2: Confirm card payment with Stripe.js
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: formattedShippingInfo.name,
            },
          },
        });

        if (result.error) {
          // Show error to customer
          showError(result.error.message);
          return;
        }

        if (result.paymentIntent.status === "succeeded") {
          // Payment successful - clear the cart and navigate to confirmation
          dispatch(clearCart());
          navigate(`/order-confirmation/${result.paymentIntent.id}`);
        }
      } catch (error) {
        console.error("Payment error:", error);
        showError(
          error.message || "An error occurred during payment. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [stripe, elements, navigate, dispatch, showError, setGlobalError]
  );

  return {
    handleSubmit,
    isLoading,
    error: globalError,
    setError: setGlobalError, // For backward compatibility
  };
};

export default useCheckoutSubmit;
