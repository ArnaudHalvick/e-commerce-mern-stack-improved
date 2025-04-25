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
          // Step 3: Tell our server that payment succeeded
          try {
            // Confirm order on server side to create order record
            const orderResponse = await paymentsService.confirmOrder(
              result.paymentIntent.id,
              null, // Payment method ID not needed as we already confirmed with Stripe
              formattedShippingInfo
            );

            // If we got a successful order response with an order ID, use that
            if (orderResponse && orderResponse.success && orderResponse.order) {
              try {
                // Clear cart and wait for the operation to complete before navigating
                await dispatch(clearCart()).unwrap();
                // Now navigate to order confirmation
                navigate(`/order-confirmation/${orderResponse.order._id}`);
              } catch (clearCartError) {
                // Continue with navigation even if cart clearing failed
                // The cart will be empty on the server side at least
                navigate(`/order-confirmation/${orderResponse.order._id}`);
              }
              return;
            }
          } catch (confirmError) {
            // If confirming order failed, we'll fall back to showing the payment intent ID
          }

          // Fallback - payment succeeded but order confirmation failed
          // We'll use the payment intent ID and let the order confirmation page
          // find the order by payment intent ID
          try {
            // Clear cart and wait for the operation to complete
            await dispatch(clearCart()).unwrap();
          } catch (clearCartError) {
            // Continue with navigation even if cart clearing failed
          }
          navigate(`/order-confirmation/${result.paymentIntent.id}`);
        }
      } catch (error) {
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
