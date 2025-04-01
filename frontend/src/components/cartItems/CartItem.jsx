import React from "react";
import "./CartItems.css";
import { config } from "../../api";

const CartItem = ({
  item,
  removeFromCart,
  updateQuantity,
  showRemoveButton = true,
}) => {
  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      // If quantity becomes 0, remove the item
      removeFromCart(item.id);
    }
  };

  const handleQuantityIncrease = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  return (
    <div className="cart-items-item">
      <div className="cart-items-image">
        <img src={config.getImageUrl(item.image)} alt={item.name} />
      </div>
      <div className="cart-items-details">
        <p className="cart-items-name">{item.name}</p>
        {item.selectedSize && (
          <p className="cart-items-size">Size: {item.selectedSize}</p>
        )}
        <div className="cart-items-quantity-controls">
          <button
            className="cart-items-quantity-adjust-btn"
            onClick={handleQuantityDecrease}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="cart-items-quantity-input">{item.quantity}</span>
          <button
            className="cart-items-quantity-adjust-btn"
            onClick={handleQuantityIncrease}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <div className="cart-items-price-actions">
        <p className="cart-items-price">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        {showRemoveButton && (
          <button
            className="cart-items-remove-btn"
            onClick={handleRemove}
            aria-label="Remove item"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default CartItem;
