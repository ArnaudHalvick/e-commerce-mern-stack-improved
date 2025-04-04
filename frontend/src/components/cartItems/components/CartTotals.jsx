import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/state";
import "../styles/CartTotals.css";

/**
 * Displays cart total and checkout button
 *
 * @param {Object} props - Component props
 * @param {number} props.totalPrice - Total cart price
 */
const CartTotals = ({ totalPrice }) => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated and email is verified
  const isEmailVerified = isAuthenticated && user?.isEmailVerified;

  // If user is authenticated but email is not verified, show disabled button
  const showDisabledCheckout = isAuthenticated && !isEmailVerified;

  // Render checkout button based on email verification status
  const renderCheckoutButton = () => {
    if (showDisabledCheckout) {
      return (
        <>
          <button
            className="cart-items-checkout-button disabled"
            disabled={true}
            aria-label="Email verification required for checkout"
          >
            VERIFY EMAIL TO CHECKOUT
          </button>
          <p className="cart-items-verification-note">
            Please verify your email above to proceed
          </p>
        </>
      );
    }

    return (
      <Link to="/checkout" style={{ textDecoration: "none" }}>
        <button className="cart-items-checkout-button">
          PROCEED TO CHECKOUT
        </button>
      </Link>
    );
  };

  return (
    <div className="cart-items-totals">
      <h2 className="cart-items-totals-title">Cart Totals</h2>
      <div className="cart-items-totals-item">
        <p className="cart-items-totals-label">Subtotal</p>
        <p className="cart-items-totals-value cart-items-price-discounted">
          ${totalPrice.toFixed(2)}
        </p>
      </div>
      <div className="cart-items-totals-item">
        <p className="cart-items-totals-label">Shipping Fee</p>
        <p className="cart-items-totals-value">Free</p>
      </div>
      <hr className="cart-items-divider" />
      <div className="cart-items-totals-item">
        <p className="cart-items-totals-label">Total</p>
        <p className="cart-items-totals-value cart-items-total-amount cart-items-price-discounted">
          ${totalPrice.toFixed(2)}
        </p>
      </div>

      {renderCheckoutButton()}
    </div>
  );
};

export default CartTotals;
