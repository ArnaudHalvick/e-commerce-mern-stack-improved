import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "./StripeProvider.css";

// Initialize Stripe with your publishable key - outside the component to prevent re-initialization
const initializeStripe = () => {
  try {
    const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error(
        "Stripe publishable key is missing in environment variables"
      );
      return null;
    }
    return loadStripe(key);
  } catch (error) {
    console.error("Error initializing Stripe:", error);
    return null;
  }
};

// Create the promise outside component to ensure it's only created once
const stripePromise = initializeStripe();

// Default options for Stripe Elements
const defaultOptions = {
  fonts: [
    {
      cssSrc: "https://fonts.googleapis.com/css?family=Roboto:400,500,700",
    },
  ],
};

const StripeProvider = ({ children }) => {
  // Error component if Stripe fails to initialize
  if (!stripePromise) {
    return (
      <div className="stripe-error-container">
        <h3>Payment System Error</h3>
        <p>
          Unable to initialize payment system. Please check the console for
          details and try again later.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={defaultOptions}>
      {children}
    </Elements>
  );
};

export default React.memo(StripeProvider);
