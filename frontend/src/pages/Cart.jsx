// Path: frontend/src/pages/Cart.jsx
// External Libraries
import React, { memo } from "react";
import { Link } from "react-router-dom";

// Internal Components
import CartItems from "../components/cartItems/CartItems";

// Styles and Assets
import arrow_icon from "../components/assets/breadcrum_arrow.png";
import "../components/breadcrumbs/breadcrumb.css";
import "./CSS/Cart.css";

// Simple breadcrumb component for cart page
const CartBreadcrumb = () => {
  return (
    <div className="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        HOME
      </Link>
      <img src={arrow_icon} alt="" />
      <Link to="/" className="breadcrumb-link">
        SHOP
      </Link>
      <img src={arrow_icon} alt="" />
      <span className="breadcrumb-current">CART</span>
    </div>
  );
};

const Cart = () => {
  return (
    <>
      <CartBreadcrumb />
      <h1 className="cart-page-title">Your Shopping Cart</h1>
      <CartItems />
    </>
  );
};

// Memoize the Cart component to prevent unnecessary re-renders
export default memo(Cart);
