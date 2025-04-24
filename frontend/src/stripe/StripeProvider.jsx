import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "./StripeProvider.css";

// Initialize Stripe with your publishable key - outside the component to prevent re-initialization
const initializeStripe = () => {
  try {
    // Use the REACT_APP_ prefixed environment variable
    const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
      console.error(
        "Stripe publishable key is missing in environment variables. Make sure it's defined with the REACT_APP_ prefix."
      );
      return null;
    }
    console.log(
      "Initializing Stripe with key prefix:",
      key.substring(0, 7) + "..."
    );
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
        <p className="debug-info">
          Environment variables must be prefixed with REACT_APP_ to be
          accessible. Current environment: {process.env.NODE_ENV}
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
