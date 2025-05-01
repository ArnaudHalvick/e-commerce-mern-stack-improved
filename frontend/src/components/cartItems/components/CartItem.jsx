import React, { memo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { config } from "../../../api";

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

  // Determine if item has a discount based on user requirements
  // If new_price is higher than old_price, not equal to 0 and not a value that is invalid (truthy)
  const hasDiscount =
    item.new_price &&
    item.new_price > 0 &&
    item.old_price &&
    item.new_price < item.old_price;

  return (
    <tr className={isPending ? "cart-item-pending" : ""}>
      <td className="cart-item-content">
        <div className="cart-item-row">
          {/* Product image */}
          <div className="cart-item-image-container">
            <img
              className="cart-items-product-image"
              src={config.getImageUrl(item.image)}
              alt={item.name}
            />
          </div>

          {/* Product details */}
          <div className="cart-item-details">
            <Link
              to={`/product/${item.productId}`}
              className="cart-items-product-link"
              title={item.name}
            >
              {item.name}
            </Link>
            <div className="cart-item-meta">
              <span className="cart-items-item-size">Size: {item.size}</span>
              {/* Remove all button */}
              <div className="cart-item-remove-btn">
                <button
                  className="cart-item-action-btn cart-item-remove-text"
                  onClick={() => onRemoveAll(item.productId, item.size)}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () =>
                      onRemoveAll(item.productId, item.size)
                    )
                  }
                >
                  Remove all
                </button>
              </div>
            </div>
          </div>

          {/* Quantity controls */}
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
              onChange={(event) =>
                handleLocalQuantityChange(event.target.value)
              }
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

          {/* Price */}
          <div className="cart-item-price">
            {hasDiscount ? (
              <>
                <div className="cart-item-discount-tag">
                  -
                  {Math.round(
                    ((item.old_price - item.new_price) / item.old_price) * 100
                  )}
                  %
                </div>
                <div className="product-display-right-price-old">
                  ${item.old_price.toFixed(2)}
                </div>
                <div className="product-display-right-price-new">
                  ${item.new_price.toFixed(2)}
                </div>
              </>
            ) : (
              <div className="product-display-right-price-current">
                ${item.old_price.toFixed(2)}
              </div>
            )}
          </div>
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
