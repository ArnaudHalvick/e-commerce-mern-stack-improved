import React from "react";
import "./QuantitySelector.css";

/**
 * Component for selecting product quantity
 *
 * @param {Object} props
 * @param {Number} props.quantity - Current quantity
 * @param {Function} props.onQuantityChange - Handler for quantity changes
 */
const QuantitySelector = ({ quantity, onQuantityChange }) => {
  return (
    <div className="product-display-right-quantity">
      <h1 className="product-display-quantity-title">Quantity</h1>
      <div className="product-display-right-quantity-container">
        <button
          className="product-display-quantity-btn"
          onClick={() => onQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          className="product-display-quantity-input"
          aria-label="Quantity"
        />
        <button
          className="product-display-quantity-btn"
          onClick={() => onQuantityChange(quantity + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
