import React from "react";
import { useCart } from "../state";

const CartHookTest = () => {
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    error,
    isCartEmpty,
    cartItemCount,
    addItem,
    removeItem,
    removeAllItems,
    updateQuantity,
    clearCart,
  } = useCart();

  // Test adding an item
  const handleAddItem = () => {
    addItem("64a7f20b9ec3e206471cdd14", 1, "XL");
  };

  // Test removing an item
  const handleRemoveItem = () => {
    if (items.length > 0) {
      const item = items[0];
      removeItem(item.productId, 1, item.size);
    }
  };

  // Test removing all of an item
  const handleRemoveAllItems = () => {
    if (items.length > 0) {
      const item = items[0];
      removeAllItems(item.productId, item.size);
    }
  };

  // Test updating quantity
  const handleUpdateQuantity = () => {
    if (items.length > 0) {
      const item = items[0];
      updateQuantity(item.productId, item.quantity + 1, item.size);
    }
  };

  // Test clearing cart
  const handleClearCart = () => {
    clearCart();
  };

  return (
    <div className="cart-hook-test" style={{ padding: "20px" }}>
      <h1>Cart Hook Test</h1>

      {loading && <p>Loading cart data...</p>}
      {error && <p>Error: {error}</p>}

      <div style={{ margin: "20px 0" }}>
        <h2>Cart Summary</h2>
        <p>Items in cart: {totalItems}</p>
        <p>Total price: ${totalPrice.toFixed(2)}</p>
        <p>Is cart empty: {isCartEmpty ? "Yes" : "No"}</p>
        <p>Cart item count: {cartItemCount}</p>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h2>Cart Actions</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button onClick={handleAddItem}>Add Item</button>
          <button onClick={handleRemoveItem} disabled={isCartEmpty}>
            Remove Item
          </button>
          <button onClick={handleRemoveAllItems} disabled={isCartEmpty}>
            Remove All Items
          </button>
          <button onClick={handleUpdateQuantity} disabled={isCartEmpty}>
            Update Quantity
          </button>
          <button onClick={handleClearCart} disabled={isCartEmpty}>
            Clear Cart
          </button>
        </div>
      </div>

      <div>
        <h2>Cart Items</h2>
        {isCartEmpty ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}`}
                style={{ marginBottom: "10px" }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "50px", height: "50px", marginRight: "10px" }}
                />
                <strong>{item.name}</strong> - Size: {item.size}
                <br />
                Price: ${item.price.toFixed(2)} x {item.quantity} = $
                {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CartHookTest;
