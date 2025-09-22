// Path: frontend/src/pages/Cart.jsx
// External Libraries
import React, { memo } from "react";

// Internal Components
import CartItems from "../../components/cartItems";
import SEO from "../../utils/SEO";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Styles and Assets
import "./Cart.css";

const Cart = () => {
  return (
    <>
      <SEO title="Cart" description="Your shopping cart" url="/cart" robots="noindex,follow" />
      <Breadcrumb routes={[{ label: "Home", path: "/" }, { label: "Cart" }]} />
      <h1 className="cart-page-title">Your Shopping Cart</h1>
      <CartItems />
    </>
  );
};

// Memoize the Cart component to prevent unnecessary re-renders
export default memo(Cart);
