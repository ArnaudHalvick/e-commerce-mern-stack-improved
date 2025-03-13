// Path: frontend/src/pages/Cart.jsx
// External Libraries
import React, { memo } from "react";

// Internal Components
import CartItems from "../components/cartItems";
import Breadcrumb from "../components/breadcrumbs/Breadcrumb";

// Styles and Assets
import "./CSS/Cart.css";

const Cart = () => {
  return (
    <>
      <Breadcrumb
        routes={[
          { label: "HOME", path: "/" },
          { label: "SHOP", path: "/" },
          { label: "CART" },
        ]}
      />
      <h1 className="cart-page-title">Your Shopping Cart</h1>
      <CartItems />
    </>
  );
};

// Memoize the Cart component to prevent unnecessary re-renders
export default memo(Cart);
