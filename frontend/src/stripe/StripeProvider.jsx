import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "./StripeProvider.css";

// Initialize Stripe with your publishable key - with better error handling
const stripePromise = (() => {
  try {
    const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error(
        "Stripe publishable key is missing in environment variables"
      );
      return null;
    }
    console.log("Using Stripe key:", key.substring(0, 8) + "...");
    return loadStripe(key);
  } catch (error) {
    console.error("Error initializing Stripe:", error);
    return null;
  }
})();

const StripeProvider = ({ children }) => {
  // Configure Stripe Elements with error handling
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

  const options = {
    fonts: [
      {
        cssSrc: "https://fonts.googleapis.com/css?family=Roboto:400,500,700",
      },
    ],
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
