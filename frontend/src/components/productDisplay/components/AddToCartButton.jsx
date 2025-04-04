import React from "react";
import "./AddToCartButton.css";

/**
 * Component for Add to Cart button
 *
 * @param {Object} props
 * @param {Function} props.onClick - Handler for button click
 * @param {Boolean} props.isAdding - Whether product is being added to cart
 * @returns {JSX.Element} AddToCartButton component
 */
const AddToCartButton = ({ onClick, isAdding }) => {
  return (
    <button
      onClick={onClick}
      disabled={isAdding}
      className={
        isAdding
          ? "product-display-add-to-cart-btn product-display-adding-to-cart"
          : "product-display-add-to-cart-btn"
      }
      aria-label="Add product to cart"
    >
      {isAdding ? "Adding..." : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
