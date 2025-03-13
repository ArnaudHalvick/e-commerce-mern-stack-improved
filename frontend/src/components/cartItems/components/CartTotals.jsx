import React from "react";

/**
 * Component that displays cart total amounts
 *
 * @param {Object} props
 * @param {Number} props.totalPrice - The total price of items in cart
 */
const CartTotals = ({ totalPrice }) => {
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
      <button className="checkout-button">PROCEED TO CHECKOUT</button>
    </div>
  );
};

export default CartTotals;
