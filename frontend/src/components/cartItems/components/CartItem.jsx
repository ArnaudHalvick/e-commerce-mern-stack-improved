import React, { memo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Local assets
import remove_icon from "../../../components/assets/cart_cross_icon.png";
import { config } from "../../../api";

// Styles
import "../styles/CartItem.css";

/**
 * Individual cart item component
 *
 * @param {Object} props - Component props
 * @param {Object} props.item - Cart item data
 * @param {Function} props.onRemoveItem - Handler for removing one item
 * @param {Function} props.onAddItem - Handler for adding one item
 * @param {Function} props.onRemoveAll - Handler for removing all items of this type
 * @param {Function} props.onQuantityBlur - Handler for input blur event
 */
const CartItem = ({
  item,
  onRemoveItem,
  onAddItem,
  onRemoveAll,
  onQuantityBlur,
}) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isPending, setIsPending] = useState(false);
  const pendingOperations = useRef(0);
  const lastKnownServerQuantity = useRef(item.quantity);

  // Update local quantity when server item quantity changes
  useEffect(() => {
    // Only update if this item's quantity changed from server
    // and no pending operations are in progress
    if (lastKnownServerQuantity.current !== item.quantity) {
      lastKnownServerQuantity.current = item.quantity;

      // Only update local quantity if we don't have pending operations
      // This prevents flickering on rapid clicks
      if (pendingOperations.current === 0) {
        setLocalQuantity(item.quantity);
      }
    }
  }, [item.quantity]);

  // Handle local quantity change
  const handleLocalQuantityChange = (value) => {
    // Ensure value is a valid number and not less than 1
    const newValue = Math.max(1, parseInt(value) || 1);
    setLocalQuantity(newValue);
    // This will be handled on blur instead
  };

  // Handle quantity blur
  const handleBlur = () => {
    // Only update if the quantity actually changed
    if (localQuantity !== item.quantity) {
      setIsPending(true);
      pendingOperations.current += 1;

      // Pass the current local quantity value
      onQuantityBlur(item.productId, localQuantity, item.size).finally(() => {
        pendingOperations.current -= 1;
        if (pendingOperations.current === 0) {
          setIsPending(false);
        }
      });
    }
  };

  // Optimistic UI updates
  const handleAddItemClick = () => {
    // Update local state immediately for better UX
    setLocalQuantity((prev) => prev + 1);
    setIsPending(true);
    pendingOperations.current += 1;

    onAddItem(item.productId, 1, item.size).finally(() => {
      pendingOperations.current -= 1;
      if (pendingOperations.current === 0) {
        setIsPending(false);
      }
    });
  };

  const handleRemoveItemClick = () => {
    // Only proceed if quantity is greater than 1
    if (localQuantity > 1) {
      // Update local state immediately for better UX
      setLocalQuantity((prev) => prev - 1);
      setIsPending(true);
      pendingOperations.current += 1;

      onRemoveItem(item.productId, 1, item.size).finally(() => {
        pendingOperations.current -= 1;
        if (pendingOperations.current === 0) {
          setIsPending(false);
        }
      });
    }
  };

  const handleKeyDown = (event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  // Compute total price based on local quantity for immediate UI feedback
  const itemTotal = (item.price * localQuantity).toFixed(2);

  // Format product name for smaller screens
  const formatProductName = (name) => {
    // If product name is very long, create a shortened version for mobile
    if (name.length > 30) {
      return name.substring(0, 28) + "...";
    }
    return name;
  };

  return (
    <tr className={isPending ? "cart-item-pending" : ""}>
      <td>
        <img
          className="cart-items-product-image"
          src={config.getImageUrl(item.image)}
          alt={item.name}
        />
      </td>
      <td>
        <Link
          to={`/product/${item.productId}`}
          className="cart-items-product-link"
          title={item.name}
        >
          {formatProductName(item.name)}
        </Link>
      </td>
      <td>
        <span
          className={item.isDiscounted ? "cart-items-price-discounted" : ""}
        >
          ${item.price}
        </span>
      </td>
      <td>
        <span className="cart-items-item-size">{item.size}</span>
      </td>
      <td>
        <div className="cart-items-quantity-controls">
          <button
            className="cart-items-quantity-adjust-btn"
            onClick={handleRemoveItemClick}
            onKeyDown={(e) => handleKeyDown(e, handleRemoveItemClick)}
            aria-label="Decrease quantity"
            tabIndex="0"
            disabled={localQuantity <= 1 || isPending}
          >
            -
          </button>
          <input
            type="number"
            className="cart-items-quantity-input"
            value={localQuantity}
            onChange={(event) => handleLocalQuantityChange(event.target.value)}
            onBlur={handleBlur}
            min="1"
            aria-label={`Quantity for ${item.name}, size ${item.size}`}
            disabled={isPending}
          />
          <button
            className="cart-items-quantity-adjust-btn"
            onClick={handleAddItemClick}
            onKeyDown={(e) => handleKeyDown(e, handleAddItemClick)}
            aria-label="Increase quantity"
            tabIndex="0"
            disabled={isPending}
          >
            +
          </button>
        </div>
      </td>
      <td>
        <span
          className={item.isDiscounted ? "cart-items-price-discounted" : ""}
        >
          ${itemTotal}
        </span>
      </td>
      <td>
        <div className="cart-items-remove-icon-container">
          <img
            className="cart-items-remove-icon"
            onClick={() => onRemoveAll(item.productId, item.size)}
            onKeyDown={(e) =>
              handleKeyDown(e, () => onRemoveAll(item.productId, item.size))
            }
            src={remove_icon}
            alt={`Remove ${item.name} from cart`}
            title="Remove all"
            tabIndex="0"
            role="button"
            style={{ opacity: isPending ? 0.6 : 1 }}
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
