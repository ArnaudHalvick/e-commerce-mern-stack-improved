import React from "react";
import { Link } from "react-router-dom";
import CartCount from "./CartCount";
import cart_icon from "../../assets/cart_icon.png";
import { useAuth } from "../../../hooks/state/";

/**
 * Cart Component
 * @param {Object} props - Component props
 * @param {boolean} props.inTransition - Whether the app is in a transition state
 * @returns {JSX.Element} Cart component
 */
const Cart = ({ inTransition }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Link
        to="/cart"
        onClick={(e) => inTransition && e.preventDefault()}
        aria-label="View shopping cart"
      >
        <img className="navbar-cart-icon" src={cart_icon} alt="Shopping cart" />
      </Link>
      <CartCount inTransition={inTransition} />
    </>
  );
};

export default Cart;
