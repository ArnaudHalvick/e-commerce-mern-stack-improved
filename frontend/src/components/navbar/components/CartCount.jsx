import React from "react";
import { Link } from "react-router-dom";
import { useCartCount } from "../hooks";

/**
 * CartCount Component
 * @param {Object} props - Component props
 * @param {boolean} props.inTransition - Whether the app is in a transition state
 * @returns {JSX.Element} CartCount component
 */
const CartCount = ({ inTransition }) => {
  const { totalItems } = useCartCount();

  return (
    <Link
      to="/cart"
      onClick={(e) => inTransition && e.preventDefault()}
      aria-label={`View shopping cart with ${totalItems} items`}
      style={{ textDecoration: "none" }}
    >
      <div className="navbar-cart-count" role="status">
        {totalItems}
      </div>
    </Link>
  );
};

export default CartCount;
