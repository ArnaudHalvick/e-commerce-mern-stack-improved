// Path: frontend/src/pages/Cart.jsx
import React, { memo } from "react";
import CartItems from "../components/cartItems/CartItems";

const Cart = () => {
  return (
    <div className="cart-page">
      <h1 className="cart-page-title">Your Shopping Cart</h1>
      <CartItems />
    </div>
  );
};

// Memoize the Cart component to prevent unnecessary re-renders
export default memo(Cart);
