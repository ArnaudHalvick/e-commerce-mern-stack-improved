import React, { memo, useState } from "react";
import remove_icon from "../../../components/assets/cart_cross_icon.png";
import { config } from "../../../api";
import "../CartItems.css";

/**
 * Individual cart item component
 *
 * @param {Object} props - Component props
 * @param {Object} props.item - Cart item data
 * @param {Function} props.onRemoveItem - Handler for removing one item
 * @param {Function} props.onAddItem - Handler for adding one item
 * @param {Function} props.onRemoveAll - Handler for removing all items of this type
 * @param {Function} props.onQuantityChange - Handler for quantity input change
 * @param {Function} props.onQuantityBlur - Handler for input blur event
 */
const CartItem = ({
  item,
  onRemoveItem,
  onAddItem,
  onRemoveAll,
  onQuantityChange,
  onQuantityBlur,
}) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // Handle local quantity change
  const handleLocalQuantityChange = (value) => {
    // Ensure value is a valid number and not less than 1
    const newValue = Math.max(1, parseInt(value) || 1);
    setLocalQuantity(newValue);
    onQuantityChange(item.productId, newValue, item.size);
  };

  // Handle quantity blur
  const handleBlur = () => {
    onQuantityBlur(item.productId, item.size);
    // Reset local state to match item quantity
    setLocalQuantity(item.quantity);
  };

  // Optimistic UI updates
  const handleAddItemClick = () => {
    // Update local state immediately for better UX
    setLocalQuantity((prev) => prev + 1);
    onAddItem(item.productId, item.size);
  };

  const handleRemoveItemClick = () => {
    // Update local state immediately for better UX
    if (localQuantity > 1) {
      setLocalQuantity((prev) => prev - 1);
    }
    onRemoveItem(item.productId, item.size);
  };

  return (
    <tr>
      <td>
        <img
          className="cart-product-image"
          src={config.getImageUrl(item.image)}
          alt={item.name}
        />
      </td>
      <td>{item.name}</td>
      <td>
        <span className={item.isDiscounted ? "cart-price-discounted" : ""}>
          ${item.price}
        </span>
      </td>
      <td>
        <span className="cart-item-size">{item.size}</span>
      </td>
      <td>
        <div className="cart-quantity-controls">
          <button
            className="cart-quantity-adjust-btn"
            onClick={handleRemoveItemClick}
          >
            -
          </button>
          <input
            type="number"
            className="cart-quantity-input"
            value={localQuantity}
            onChange={(event) => handleLocalQuantityChange(event.target.value)}
            onBlur={handleBlur}
            min="1"
          />
          <button
            className="cart-quantity-adjust-btn"
            onClick={handleAddItemClick}
          >
            +
          </button>
        </div>
      </td>
      <td>
        <span className={item.isDiscounted ? "cart-price-discounted" : ""}>
          ${(item.price * localQuantity).toFixed(2)}
        </span>
      </td>
      <td>
        <div className="cart-remove-icon-container">
          <img
            className="cart-remove-icon"
            onClick={() => onRemoveAll(item.productId, item.size)}
            src={remove_icon}
            alt=""
            title="Remove all"
          />
        </div>
      </td>
    </tr>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(CartItem, (prevProps, nextProps) => {
  // Only re-render if the item data has actually changed
  return (
    prevProps.item.productId === nextProps.item.productId &&
    prevProps.item.quantity === nextProps.item.quantity &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.size === nextProps.item.size
  );
});
