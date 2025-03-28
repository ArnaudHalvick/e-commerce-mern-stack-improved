import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

/**
 * Component that displays cart total amounts
 *
 * @param {Object} props
 * @param {Number} props.totalPrice - The total price of items in cart
 */
const CartTotals = ({ totalPrice }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  // Check if user is authenticated and email is verified
  const isEmailVerified = isAuthenticated && user?.isEmailVerified;

  // If user is authenticated but email is not verified, show disabled button
  const showDisabledCheckout = isAuthenticated && !isEmailVerified;

  return (
    <div className="cart-totals">
      <h2 className="cart-totals-title">Cart Totals</h2>
      <div className="cart-totals-item">
        <p className="cart-totals-label">Subtotal</p>
        <p className="cart-totals-value cart-price-discounted">
          ${totalPrice.toFixed(2)}
        </p>
      </div>
      <div className="cart-totals-item">
        <p className="cart-totals-label">Shipping Fee</p>
        <p className="cart-totals-value">Free</p>
      </div>
      <hr className="cart-divider" />
      <div className="cart-totals-item">
        <p className="cart-totals-label">Total</p>
        <p className="cart-totals-value cart-total-amount cart-price-discounted">
          ${totalPrice.toFixed(2)}
        </p>
      </div>

      {showDisabledCheckout ? (
        <button
          className="cart-checkout-button disabled"
          disabled={true}
          aria-label="Email verification required for checkout"
        >
          VERIFY EMAIL TO CHECKOUT
        </button>
      ) : (
        <Link to="/checkout" style={{ textDecoration: "none" }}>
          <button className="cart-checkout-button">PROCEED TO CHECKOUT</button>
        </Link>
      )}

      {showDisabledCheckout && (
        <p className="cart-verification-note">
          Please verify your email to proceed
        </p>
      )}
    </div>
  );
};

export default CartTotals;
