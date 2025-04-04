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

const useCheckoutSubmit = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(
    async (formattedShippingInfo, isShippingInfoValid) => {
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
        // 1. Create a payment intent on the server
        const intentResponse = await paymentsService.createPaymentIntent(
          formattedShippingInfo
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
                name: formattedShippingInfo.name,
                address: {
                  line1: formattedShippingInfo.shippingAddress.street,
                  city: formattedShippingInfo.shippingAddress.city,
                  state: formattedShippingInfo.shippingAddress.state,
                  postal_code: formattedShippingInfo.shippingAddress.zip,
                  country: formattedShippingInfo.shippingAddress.country,
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
          const formattedShippingInfoForOrder = {
            address: formattedShippingInfo.shippingAddress.street,
            city: formattedShippingInfo.shippingAddress.city,
            state: formattedShippingInfo.shippingAddress.state,
            country: formattedShippingInfo.shippingAddress.country,
            postalCode: formattedShippingInfo.shippingAddress.zip,
            phoneNumber: formattedShippingInfo.phoneNumber,
            name: formattedShippingInfo.name,
          };

          const orderResponse = await paymentsService.confirmOrder(
            paymentIntent.id,
            paymentMethodId,
            formattedShippingInfoForOrder
          );

          // 4. Clear the cart and redirect to the order confirmation page
          dispatch(clearCart());
          navigate(`/order-confirmation/${orderResponse.order._id}`);

          return true;
        } else {
          throw new Error(
            `Payment failed with status: ${paymentIntent.status}`
          );
        }
      } catch (err) {
        console.error("Payment error:", err);
        setError(err.message || "Payment failed. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [stripe, elements, navigate, dispatch]
  );

  return {
    handleSubmit,
    isLoading,
    error,
    setError,
  };
};

export default useCheckoutSubmit;
