import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  addToCart,
  updateCartItem,
} from "../../../redux/slices/cartSlice";
import { useAuth } from "../../../hooks/state";
import useErrorRedux from "../../../hooks/useErrorRedux";

/**
 * Custom hook for cart operations and state management
 *
 * @returns {Object} Cart state and handler methods
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { showError } = useErrorRedux();

  // Get cart state from Redux with fallback values
  const {
    items = [],
    totalPrice = 0,
    loading,
    error,
  } = useSelector(
    (state) => state.cart || { items: [], totalItems: 0, totalPrice: 0 }
  );

  const [editableQuantities, setEditableQuantities] = useState({});
  // Local state for optimistic UI updates
  const [localTotalPrice, setLocalTotalPrice] = useState(totalPrice);

  // Update local total price when Redux state changes
  useEffect(() => {
    setLocalTotalPrice(totalPrice);
  }, [totalPrice]);

  // Fetch cart data when component mounts or auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart()).catch((err) => {
        console.error("Error fetching cart:", err);
        // Don't show error to user to prevent UI disruption
      });
    }
  }, [dispatch, isAuthenticated]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleQuantityChange = useCallback((id, value, size) => {
    // Ensure value is a valid number and not less than 1
    const newValue = Math.max(1, parseInt(value) || 1);
    const key = `${id}-${size}`;
    setEditableQuantities((prev) => ({ ...prev, [key]: newValue }));
  }, []);

  const handleQuantityBlur = useCallback(
    (id, size) => {
      if (!isAuthenticated) {
        showError("Please login to modify your cart");
        return;
      }

      const key = `${id}-${size}`;
      const newValue = editableQuantities[key];

      if (newValue !== undefined) {
        dispatch(
          updateCartItem({
            itemId: id,
            quantity: newValue,
            size: size,
          })
        )
          .unwrap()
          .then(() => {
            console.log("Quantity updated successfully");
          })
          .catch((err) => {
            console.error("Error updating quantity:", err);

            // Show appropriate error message
            if (typeof err === "string") {
              if (
                err.includes("Authentication required") ||
                err.includes("401")
              ) {
                showError("Your session has expired. Please login again.");
              } else if (err.includes("Size is required")) {
                showError("Please select a size for this item");
              } else {
                showError(
                  err || "Failed to update quantity. Please try again."
                );
              }
            } else {
              showError("Failed to update quantity. Please try again.");
            }
          });

        // Clear the editable state
        setEditableQuantities((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }
    },
    [dispatch, editableQuantities, isAuthenticated, showError]
  );

  const handleRemoveAll = useCallback(
    (id, size) => {
      if (!isAuthenticated) {
        showError("Please login to modify your cart");
        return;
      }

      // Find the item to calculate price impact
      const item = items.find(
        (item) => item.productId === id && item.size === size
      );

      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price * item.quantity);
      }

      dispatch(
        removeFromCart({
          itemId: id,
          removeAll: true,
          size: size,
        })
      )
        .unwrap()
        .then(() => {
          console.log("Items removed successfully");
        })
        .catch((err) => {
          console.error("Error removing items:", err);

          // If the operation fails, revert the optimistic UI update
          if (item) {
            setLocalTotalPrice((prev) => prev + item.price * item.quantity);
          }

          // Show appropriate error message
          if (typeof err === "string") {
            if (
              err.includes("Authentication required") ||
              err.includes("401")
            ) {
              showError("Your session has expired. Please login again.");
            } else if (err.includes("Size is required")) {
              showError("Please select a size for this item");
            } else {
              showError(err || "Failed to remove items. Please try again.");
            }
          } else {
            showError("Failed to remove items. Please try again.");
          }
        });
    },
    [dispatch, items, isAuthenticated, showError]
  );

  const handleAddItem = useCallback(
    (id, size) => {
      if (!isAuthenticated) {
        showError("Please login to modify your cart");
        return;
      }

      // Find the item to calculate price impact
      const item = items.find(
        (item) => item.productId === id && item.size === size
      );

      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev + item.price);
      }

      dispatch(
        addToCart({
          itemId: id,
          quantity: 1,
          size: size,
        })
      )
        .unwrap()
        .then((result) => {
          console.log("Item added successfully");
        })
        .catch((err) => {
          console.error("Error adding item:", err);

          // If the add operation fails, revert the optimistic UI update
          if (item) {
            setLocalTotalPrice((prev) => prev - item.price);
          }

          // Show appropriate error message
          if (typeof err === "string") {
            if (
              err.includes("Authentication required") ||
              err.includes("401")
            ) {
              showError("Your session has expired. Please login again.");
            } else if (err.includes("Size is required")) {
              showError("Please select a size for this item");
            } else {
              showError(err || "Failed to update cart. Please try again.");
            }
          } else {
            showError("Failed to update cart. Please try again.");
          }
        });
    },
    [dispatch, items, isAuthenticated, showError]
  );

  const handleRemoveItem = useCallback(
    (id, size) => {
      if (!isAuthenticated) {
        showError("Please login to modify your cart");
        return;
      }

      // Find the item to calculate price impact
      const item = items.find(
        (item) => item.productId === id && item.size === size
      );

      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price);
      }

      dispatch(
        removeFromCart({
          itemId: id,
          quantity: 1,
          size: size,
        })
      )
        .unwrap()
        .then(() => {
          console.log("Item removed successfully");
        })
        .catch((err) => {
          console.error("Error removing item:", err);

          // If the operation fails, revert the optimistic UI update
          if (item) {
            setLocalTotalPrice((prev) => prev + item.price);
          }

          // Show appropriate error message
          if (typeof err === "string") {
            if (
              err.includes("Authentication required") ||
              err.includes("401")
            ) {
              showError("Your session has expired. Please login again.");
            } else if (err.includes("Size is required")) {
              showError("Please select a size for this item");
            } else {
              showError(err || "Failed to remove item. Please try again.");
            }
          } else {
            showError("Failed to remove item. Please try again.");
          }
        });
    },
    [dispatch, items, isAuthenticated, showError]
  );

  return {
    items,
    loading,
    error,
    totalPrice: localTotalPrice, // Use local state for better UX
    handleQuantityChange,
    handleQuantityBlur,
    handleRemoveAll,
    handleAddItem,
    handleRemoveItem,
    editableQuantities,
  };
};

export default useCart;
