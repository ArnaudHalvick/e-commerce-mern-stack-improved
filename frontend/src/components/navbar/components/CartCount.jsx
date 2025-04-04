import React from "react";
import { useCartCount } from "../hooks";

/**
 * CartCount Component
 * @returns {JSX.Element} CartCount component
 */
const CartCount = () => {
  const { totalItems } = useCartCount();

  return (
    <div
      className="navbar-cart-count"
      aria-label={`${totalItems} items in cart`}
      role="status"
    >
      {totalItems}
    </div>
  );
};

export default CartCount;
