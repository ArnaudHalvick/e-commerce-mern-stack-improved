import React from "react";

/**
 * Component for Add to Cart button
 *
 * @param {Object} props
 * @param {Function} props.onClick - Handler for button click
 * @param {Boolean} props.isAdding - Whether product is being added to cart
 * @returns {JSX.Element} AddToCartButton component
 */
const AddToCartButton = ({ onClick, isAdding }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isAdding) {
        onClick();
      }
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={isAdding}
      className={
        isAdding
          ? "product-display-add-to-cart-btn product-display-adding-to-cart"
          : "product-display-add-to-cart-btn"
      }
      aria-label={
        isAdding ? "Adding product to cart..." : "Add product to cart"
      }
      aria-busy={isAdding}
    >
      {isAdding ? "Adding..." : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
