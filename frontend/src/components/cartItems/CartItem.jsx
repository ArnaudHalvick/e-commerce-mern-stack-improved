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
    <div className="cartitem">
      <div className="cartitem-image">
        <img src={config.getImageUrl(item.image)} alt={item.name} />
      </div>
      <div className="cartitem-details">
        <p className="cartitem-name">{item.name}</p>
        {item.selectedSize && (
          <p className="cartitem-size">Size: {item.selectedSize}</p>
        )}
        <div className="cartitem-quantity">
          <button
            className="quantity-btn"
            onClick={handleQuantityDecrease}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button
            className="quantity-btn"
            onClick={handleQuantityIncrease}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <div className="cartitem-price-actions">
        <p className="cartitem-price">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        {showRemoveButton && (
          <button
            className="cartitem-remove-btn"
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
